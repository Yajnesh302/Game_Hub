using System;
using System.Web.UI;
using GameHub.Models;
using GameHub.Services;

namespace GameHub.Games
{
    public partial class PlayCustomPage : Page
    {
        public CustomGameManifest GameManifest { get; set; }
        public string GameUrl { get; set; }
        public string SessionId { get; set; }
        public string P1Name { get; set; }
        public string P2Name { get; set; }
        public bool IsMultiplayerSession { get { return !string.IsNullOrEmpty(SessionId); } }

        protected void Page_Load(object sender, EventArgs e)
        {
            string gameId = Request.QueryString["game"] ?? Request.QueryString["id"];
            SessionId = Request.QueryString["session"];
            P1Name = Request.QueryString["p1"] ?? "Player 1";
            P2Name = Request.QueryString["p2"] ?? "Player 2";

            // Fallback: if gameId is not in URL but sessionId is present, resolve from GameManager session
            if (string.IsNullOrEmpty(gameId) && !string.IsNullOrEmpty(SessionId))
            {
                var session = GameManager.Instance.GetSession(SessionId);
                if (session != null && !string.IsNullOrEmpty(session.CustomGameId))
                {
                    gameId = session.CustomGameId;
                }
            }

            if (string.IsNullOrEmpty(gameId))
            {
                Response.Redirect(ResolveUrl("~/Default.aspx"));
                return;
            }

            GameManifest = CustomGameService.Instance.GetGame(gameId);
            if (GameManifest == null)
            {
                Response.Redirect(ResolveUrl("~/Default.aspx"));
                return;
            }

            Title = GameManifest.Title + " - Game Hub";
            GameUrl = ResolveUrl("~/" + GameManifest.RelativeUrl);
        }
    }
}
