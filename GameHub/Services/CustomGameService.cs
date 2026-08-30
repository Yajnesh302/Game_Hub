using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Hosting;
using GameHub.Models;
using Newtonsoft.Json;

namespace GameHub.Services
{
    public class CustomGameService
    {
        private static readonly Lazy<CustomGameService> _instance = new Lazy<CustomGameService>(() => new CustomGameService());
        public static CustomGameService Instance { get { return _instance.Value; } }

        private readonly object _lockObj = new object();
        private readonly string _customGamesRoot;
        private readonly string _registryFilePath;
        private readonly string _scoresFilePath;

        private Dictionary<string, CustomGameManifest> _registry;
        private Dictionary<string, List<CustomGameScoreRecord>> _scores;

        private CustomGameService()
        {
            _customGamesRoot = HostingEnvironment.MapPath("~/CustomGames") ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "CustomGames");
            string appDataPath = HostingEnvironment.MapPath("~/App_Data") ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "App_Data");

            if (!Directory.Exists(_customGamesRoot)) Directory.CreateDirectory(_customGamesRoot);
            if (!Directory.Exists(appDataPath)) Directory.CreateDirectory(appDataPath);

            _registryFilePath = Path.Combine(appDataPath, "custom_games.json");
            _scoresFilePath = Path.Combine(appDataPath, "custom_scores.json");

            LoadRegistry();
            LoadScores();
            ScanAndSyncDirectories();
        }

        private void LoadRegistry()
        {
            lock (_lockObj)
            {
                if (File.Exists(_registryFilePath))
                {
                    try
                    {
                        string json = File.ReadAllText(_registryFilePath);
                        _registry = JsonConvert.DeserializeObject<Dictionary<string, CustomGameManifest>>(json) ?? new Dictionary<string, CustomGameManifest>(StringComparer.OrdinalIgnoreCase);
                    }
                    catch
                    {
                        _registry = new Dictionary<string, CustomGameManifest>(StringComparer.OrdinalIgnoreCase);
                    }
                }
                else
                {
                    _registry = new Dictionary<string, CustomGameManifest>(StringComparer.OrdinalIgnoreCase);
                }
            }
        }

        private void SaveRegistry()
        {
            lock (_lockObj)
            {
                try
                {
                    string json = JsonConvert.SerializeObject(_registry, Formatting.Indented);
                    File.WriteAllText(_registryFilePath, json);
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine("Error saving custom games registry: " + ex.Message);
                }
            }
        }

        private void LoadScores()
        {
            lock (_lockObj)
            {
                if (File.Exists(_scoresFilePath))
                {
                    try
                    {
                        string json = File.ReadAllText(_scoresFilePath);
                        _scores = JsonConvert.DeserializeObject<Dictionary<string, List<CustomGameScoreRecord>>>(json) ?? new Dictionary<string, List<CustomGameScoreRecord>>(StringComparer.OrdinalIgnoreCase);
                    }
                    catch
                    {
                        _scores = new Dictionary<string, List<CustomGameScoreRecord>>(StringComparer.OrdinalIgnoreCase);
                    }
                }
                else
                {
                    _scores = new Dictionary<string, List<CustomGameScoreRecord>>(StringComparer.OrdinalIgnoreCase);
                }
            }
        }

        private void SaveScores()
        {
            lock (_lockObj)
            {
                try
                {
                    string json = JsonConvert.SerializeObject(_scores, Formatting.Indented);
                    File.WriteAllText(_scoresFilePath, json);
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine("Error saving custom game scores: " + ex.Message);
                }
            }
        }

        public void ScanAndSyncDirectories()
        {
            lock (_lockObj)
            {
                if (!Directory.Exists(_customGamesRoot)) return;

                var dirs = Directory.GetDirectories(_customGamesRoot);
                foreach (var dir in dirs)
                {
                    string dirName = Path.GetFileName(dir);
                    if (dirName.StartsWith("_") || dirName.StartsWith(".")) continue;

                    string manifestFile = Path.Combine(dir, "manifest.json");
                    if (File.Exists(manifestFile))
                    {
                        try
                        {
                            string json = File.ReadAllText(manifestFile);
                            CustomGameManifest manifest = JsonConvert.DeserializeObject<CustomGameManifest>(json);
                            if (manifest != null && !string.IsNullOrEmpty(manifest.Id))
                            {
                                manifest.Id = SanitizeId(manifest.Id);
                                manifest.DirectoryPath = dir;
                                manifest.RelativeUrl = "CustomGames/" + dirName + "/" + (manifest.Entry ?? "index.html");
                                if (manifest.InstalledAt == default(DateTime))
                                {
                                    manifest.InstalledAt = Directory.GetCreationTimeUtc(dir);
                                }
                                _registry[manifest.Id] = manifest;
                            }
                        }
                        catch { }
                    }
                }
                SaveRegistry();
            }
        }

        public bool InstallGameFromZip(Stream zipStream, out string errorMessage, out CustomGameManifest installedManifest)
        {
            errorMessage = null;
            installedManifest = null;

            if (zipStream == null || zipStream.Length == 0)
            {
                errorMessage = "Uploaded file is empty.";
                return false;
            }

            string tempExtractPath = Path.Combine(Path.GetTempPath(), "GameHub_Upload_" + Guid.NewGuid().ToString("N"));

            try
            {
                Directory.CreateDirectory(tempExtractPath);

                // 1. Extract zip safely (with Zip Slip validation)
                using (var archive = new ZipArchive(zipStream, ZipArchiveMode.Read))
                {
                    foreach (var entry in archive.Entries)
                    {
                        // Normalize path
                        string destinationPath = Path.GetFullPath(Path.Combine(tempExtractPath, entry.FullName));
                        if (!destinationPath.StartsWith(tempExtractPath, StringComparison.OrdinalIgnoreCase))
                        {
                            errorMessage = "Security violation: Invalid zip entry path.";
                            return false;
                        }

                        if (string.IsNullOrEmpty(entry.Name))
                        {
                            Directory.CreateDirectory(destinationPath);
                        }
                        else
                        {
                            Directory.CreateDirectory(Path.GetDirectoryName(destinationPath));
                            entry.ExtractToFile(destinationPath, true);
                        }
                    }
                }

                // 2. Find manifest.json (either at root or inside a single top-level folder)
                string manifestPath = Path.Combine(tempExtractPath, "manifest.json");
                string contentRoot = tempExtractPath;

                if (!File.Exists(manifestPath))
                {
                    // Check if enclosed in a top-level directory
                    var subdirs = Directory.GetDirectories(tempExtractPath);
                    if (subdirs.Length == 1 && File.Exists(Path.Combine(subdirs[0], "manifest.json")))
                    {
                        contentRoot = subdirs[0];
                        manifestPath = Path.Combine(contentRoot, "manifest.json");
                    }
                    else
                    {
                        errorMessage = "Package is missing manifest.json at its root.";
                        return false;
                    }
                }

                // 3. Read and validate manifest.json
                string manifestJson = File.ReadAllText(manifestPath);
                CustomGameManifest manifest = JsonConvert.DeserializeObject<CustomGameManifest>(manifestJson);

                if (manifest == null || string.IsNullOrWhiteSpace(manifest.Title))
                {
                    errorMessage = "Invalid manifest.json: Title is required.";
                    return false;
                }

                string rawId = !string.IsNullOrWhiteSpace(manifest.Id) ? manifest.Id : manifest.Title;
                string cleanId = SanitizeId(rawId);
                if (string.IsNullOrEmpty(cleanId))
                {
                    cleanId = "game-" + Guid.NewGuid().ToString("N").Substring(0, 8);
                }

                manifest.Id = cleanId;
                manifest.Entry = !string.IsNullOrWhiteSpace(manifest.Entry) ? manifest.Entry : "index.html";
                manifest.Version = !string.IsNullOrWhiteSpace(manifest.Version) ? manifest.Version : "1.0";
                manifest.Author = !string.IsNullOrWhiteSpace(manifest.Author) ? manifest.Author : "Custom Developer";
                manifest.Category = !string.IsNullOrWhiteSpace(manifest.Category) ? manifest.Category : "Arcade";
                manifest.InstalledAt = DateTime.UtcNow;

                // Validate entry file exists
                string entryFilePath = Path.Combine(contentRoot, manifest.Entry);
                if (!File.Exists(entryFilePath))
                {
                    errorMessage = string.Format("Entry file '{0}' specified in manifest.json was not found.", manifest.Entry);
                    return false;
                }

                // 4. Move to permanent CustomGames directory
                string targetDir = Path.Combine(_customGamesRoot, cleanId);
                lock (_lockObj)
                {
                    if (Directory.Exists(targetDir))
                    {
                        Directory.Delete(targetDir, true);
                    }
                    Directory.CreateDirectory(targetDir);

                    CopyDirectory(contentRoot, targetDir);

                    manifest.DirectoryPath = targetDir;
                    manifest.RelativeUrl = "CustomGames/" + cleanId + "/" + manifest.Entry;

                    _registry[cleanId] = manifest;
                    SaveRegistry();
                }

                installedManifest = manifest;
                return true;
            }
            catch (Exception ex)
            {
                errorMessage = "Failed to extract package: " + ex.Message;
                return false;
            }
            finally
            {
                try
                {
                    if (Directory.Exists(tempExtractPath))
                    {
                        Directory.Delete(tempExtractPath, true);
                    }
                }
                catch { }
            }
        }

        public List<CustomGameManifest> GetInstalledGames()
        {
            lock (_lockObj)
            {
                return _registry.Values.OrderByDescending(g => g.InstalledAt).ToList();
            }
        }

        public CustomGameManifest GetGame(string gameId)
        {
            if (string.IsNullOrEmpty(gameId)) return null;
            lock (_lockObj)
            {
                CustomGameManifest manifest;
                if (_registry.TryGetValue(gameId.Trim(), out manifest))
                {
                    return manifest;
                }

                // If not found, rescan filesystem in case newly added
                ScanAndSyncDirectories();
                if (_registry.TryGetValue(gameId.Trim(), out manifest))
                {
                    return manifest;
                }

                // Fallback: look for normalized or case-insensitive match
                string cleanId = SanitizeId(gameId);
                if (_registry.TryGetValue(cleanId, out manifest))
                {
                    return manifest;
                }

                foreach (var kvp in _registry)
                {
                    if (string.Equals(kvp.Key, gameId, StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(kvp.Value.Id, gameId, StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(kvp.Value.Title, gameId, StringComparison.OrdinalIgnoreCase))
                    {
                        return kvp.Value;
                    }
                }
            }
            return null;
        }

        public bool DeleteGame(string gameId)
        {
            if (string.IsNullOrEmpty(gameId)) return false;

            lock (_lockObj)
            {
                CustomGameManifest manifest;
                if (_registry.TryGetValue(gameId, out manifest))
                {
                    _registry.Remove(gameId);
                    SaveRegistry();

                    try
                    {
                        string dir = Path.Combine(_customGamesRoot, gameId);
                        if (Directory.Exists(dir))
                        {
                            Directory.Delete(dir, true);
                        }
                        return true;
                    }
                    catch
                    {
                        return false;
                    }
                }
            }
            return false;
        }

        public void SaveScore(string gameId, string playerName, int score)
        {
            if (string.IsNullOrEmpty(gameId) || string.IsNullOrEmpty(playerName)) return;

            lock (_lockObj)
            {
                List<CustomGameScoreRecord> list;
                if (!_scores.TryGetValue(gameId, out list))
                {
                    list = new List<CustomGameScoreRecord>();
                    _scores[gameId] = list;
                }

                list.Add(new CustomGameScoreRecord
                {
                    PlayerName = playerName.Trim(),
                    Score = score,
                    AchievedAt = DateTime.UtcNow
                });

                SaveScores();
            }
        }

        public List<CustomGameScoreRecord> GetLeaderboard(string gameId)
        {
            if (string.IsNullOrEmpty(gameId)) return new List<CustomGameScoreRecord>();

            lock (_lockObj)
            {
                List<CustomGameScoreRecord> list;
                if (_scores.TryGetValue(gameId, out list))
                {
                    return list.OrderByDescending(s => s.Score).Take(20).ToList();
                }
            }
            return new List<CustomGameScoreRecord>();
        }

        private static string SanitizeId(string input)
        {
            if (string.IsNullOrEmpty(input)) return string.Empty;
            string clean = Regex.Replace(input.ToLowerInvariant(), @"[^a-z0-9\-_]", "-");
            return Regex.Replace(clean, @"-+", "-").Trim('-');
        }

        private static void CopyDirectory(string sourceDir, string destinationDir)
        {
            var dir = new DirectoryInfo(sourceDir);
            DirectoryInfo[] dirs = dir.GetDirectories();

            Directory.CreateDirectory(destinationDir);

            foreach (FileInfo file in dir.GetFiles())
            {
                string targetFilePath = Path.Combine(destinationDir, file.Name);
                file.CopyTo(targetFilePath, true);
            }

            foreach (DirectoryInfo subDir in dirs)
            {
                string newDestinationDir = Path.Combine(destinationDir, subDir.Name);
                CopyDirectory(subDir.FullName, newDestinationDir);
            }
        }
    }
}
