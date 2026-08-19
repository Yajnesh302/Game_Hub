using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Text;
using System.Web;
using GameHub.Models;
using GameHub.Services;
using Newtonsoft.Json;

namespace GameHub.Handlers
{
    public class CustomGameHandler : IHttpHandler
    {
        public bool IsReusable { get { return true; } }

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "application/json";
            string action = context.Request.QueryString["action"] ?? context.Request.Form["action"] ?? string.Empty;

            try
            {
                switch (action.ToLowerInvariant())
                {
                    case "upload":
                        HandleUpload(context);
                        break;

                    case "list":
                        HandleList(context);
                        break;

                    case "delete":
                        HandleDelete(context);
                        break;

                    case "submitscore":
                        HandleSubmitScore(context);
                        break;

                    case "getscores":
                        HandleGetScores(context);
                        break;

                    case "downloadtemplate":
                        HandleDownloadTemplate(context);
                        break;

                    default:
                        if (context.Request.Files.Count > 0)
                        {
                            HandleUpload(context);
                        }
                        else
                        {
                            HandleList(context);
                        }
                        break;
                }
            }
            catch (Exception ex)
            {
                context.Response.Write(JsonConvert.SerializeObject(new
                {
                    success = false,
                    message = "Server error: " + ex.Message
                }));
            }
        }

        private void HandleUpload(HttpContext context)
        {
            if (context.Request.Files.Count == 0)
            {
                context.Response.Write(JsonConvert.SerializeObject(new
                {
                    success = false,
                    message = "No file received. Please upload a .zip game package."
                }));
                return;
            }

            HttpPostedFile file = context.Request.Files[0];
            if (!file.FileName.EndsWith(".zip", StringComparison.OrdinalIgnoreCase))
            {
                context.Response.Write(JsonConvert.SerializeObject(new
                {
                    success = false,
                    message = "Invalid file type. Only .zip game packages are supported."
                }));
                return;
            }

            string error;
            CustomGameManifest installedGame;

            bool success = CustomGameService.Instance.InstallGameFromZip(file.InputStream, out error, out installedGame);

            if (success)
            {
                context.Response.Write(JsonConvert.SerializeObject(new
                {
                    success = true,
                    message = "Game '" + installedGame.Title + "' installed successfully!",
                    game = installedGame
                }));
            }
            else
            {
                context.Response.Write(JsonConvert.SerializeObject(new
                {
                    success = false,
                    message = error ?? "Failed to install game package."
                }));
            }
        }

        private void HandleList(HttpContext context)
        {
            List<CustomGameManifest> list = CustomGameService.Instance.GetInstalledGames();
            context.Response.Write(JsonConvert.SerializeObject(new
            {
                success = true,
                games = list
            }));
        }

        private void HandleDelete(HttpContext context)
        {
            string gameId = context.Request["id"] ?? context.Request.QueryString["id"];
            if (string.IsNullOrEmpty(gameId))
            {
                context.Response.Write(JsonConvert.SerializeObject(new { success = false, message = "Game ID required." }));
                return;
            }

            bool deleted = CustomGameService.Instance.DeleteGame(gameId);
            context.Response.Write(JsonConvert.SerializeObject(new
            {
                success = deleted,
                message = deleted ? "Game deleted successfully." : "Game not found or could not be deleted."
            }));
        }

        private void HandleSubmitScore(HttpContext context)
        {
            string gameId = context.Request["gameId"];
            string playerName = context.Request["playerName"] ?? "Player";
            int score;
            int.TryParse(context.Request["score"], out score);

            if (!string.IsNullOrEmpty(gameId))
            {
                CustomGameService.Instance.SaveScore(gameId, playerName, score);
                context.Response.Write(JsonConvert.SerializeObject(new { success = true }));
            }
            else
            {
                context.Response.Write(JsonConvert.SerializeObject(new { success = false, message = "Invalid parameters." }));
            }
        }

        private void HandleGetScores(HttpContext context)
        {
            string gameId = context.Request.QueryString["id"];
            List<CustomGameScoreRecord> scores = CustomGameService.Instance.GetLeaderboard(gameId);
            context.Response.Write(JsonConvert.SerializeObject(new
            {
                success = true,
                scores = scores
            }));
        }

        private void HandleDownloadTemplate(HttpContext context)
        {
            context.Response.Clear();
            context.Response.ContentType = "application/zip";
            context.Response.AddHeader("content-disposition", "attachment; filename=\"GameHub_Template_Game.zip\"");

            using (var memoryStream = new MemoryStream())
            {
                using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
                {
                    // 1. manifest.json
                    var manifestEntry = archive.CreateEntry("manifest.json");
                    using (var writer = new StreamWriter(manifestEntry.Open(), Encoding.UTF8))
                    {
                        writer.Write(@"{
  ""id"": ""my-custom-game"",
  ""title"": ""My Custom Game"",
  ""description"": ""A fun custom arcade game for the Game Hub intranet."",
  ""author"": ""Intranet Gamer"",
  ""version"": ""1.0"",
  ""thumbnail"": ""icon.svg"",
  ""entry"": ""index.html"",
  ""category"": ""Arcade"",
  ""supportsLeaderboard"": true
}");
                    }

                    // 2. icon.svg
                    var iconEntry = archive.CreateEntry("icon.svg");
                    using (var writer = new StreamWriter(iconEntry.Open(), Encoding.UTF8))
                    {
                        writer.Write(@"<svg xmlns=""http://www.w3.org/2000/svg"" viewBox=""0 0 340 190"" fill=""none"">
  <rect width=""340"" height=""190"" fill=""#0b1329""/>
  <circle cx=""170"" cy=""95"" r=""45"" fill=""#0284c7"" opacity=""0.8""/>
  <polygon points=""160,75 190,95 160,115"" fill=""#f8fafc""/>
  <text x=""170"" y=""165"" fill=""#38bdf8"" font-family=""sans-serif"" font-size=""14"" font-weight=""bold"" text-anchor=""middle"">CUSTOM GAME</text>
</svg>");
                    }

                    // 3. index.html
                    var indexEntry = archive.CreateEntry("index.html");
                    using (var writer = new StreamWriter(indexEntry.Open(), Encoding.UTF8))
                    {
                        writer.Write(@"<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <title>My Custom Game</title>
    <style>
        body { margin: 0; padding: 0; background: #060b18; color: #f8fafc; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
        #gameCanvas { background: #0b1329; border: 2px solid #38bdf8; border-radius: 12px; box-shadow: 0 0 20px rgba(56,189,248,0.3); }
        .score-box { font-size: 1.2rem; font-weight: bold; margin-bottom: 12px; color: #38bdf8; }
        .btn { background: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; margin-top: 10px; }
        .btn:hover { background: #38bdf8; }
    </style>
</head>
<body>
    <div class=""score-box"">Score: <span id=""score"">0</span></div>
    <canvas id=""gameCanvas"" width=""480"" height=""320""></canvas>
    <button class=""btn"" onclick=""resetGame()"">Restart</button>

    <script>
        var canvas = document.getElementById('gameCanvas');
        var ctx = canvas.getContext('2d');
        var score = 0;
        var target = { x: 240, y: 160, r: 25 };

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.arc(target.x, target.y, target.r, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#f8fafc';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('CLICK ME!', target.x, target.y + 5);
        }

        canvas.addEventListener('click', function(e) {
            var rect = canvas.getBoundingClientRect();
            var mx = e.clientX - rect.left;
            var my = e.clientY - rect.top;
            var dist = Math.hypot(mx - target.x, my - target.y);

            if (dist < target.r) {
                score += 10;
                document.getElementById('score').innerText = score;
                target.x = 40 + Math.random() * (canvas.width - 80);
                target.y = 40 + Math.random() * (canvas.height - 80);
                draw();

                // Submit score to Game Hub Leaderboard via Bridge!
                if (window.parent && window.parent.GameHubBridge) {
                    window.parent.GameHubBridge.submitScore(score);
                }
            }
        });

        function resetGame() {
            score = 0;
            document.getElementById('score').innerText = score;
            target = { x: 240, y: 160, r: 25 };
            draw();
        }

        draw();
    </script>
</body>
</html>");
                    }
                }

                byte[] bytes = memoryStream.ToArray();
                context.Response.OutputStream.Write(bytes, 0, bytes.Length);
            }
        }
    }
}
