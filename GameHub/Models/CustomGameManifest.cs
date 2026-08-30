using System;

namespace GameHub.Models
{
    public class CustomGameManifest
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Author { get; set; }
        public string Version { get; set; }
        public string Thumbnail { get; set; } // Relative path e.g. "icon.svg" or "thumbnail.png"
        public string Entry { get; set; }     // e.g. "index.html"
        public string Category { get; set; }  // e.g. "Arcade", "Puzzle", "Action"
        public bool SupportsLeaderboard { get; set; }
        public bool IsMultiplayer { get; set; }
        public bool SupportsMultiplayer { get { return IsMultiplayer; } set { IsMultiplayer = value; } }
        public DateTime InstalledAt { get; set; }
        public string DirectoryPath { get; set; }
        public string RelativeUrl { get; set; }
    }

    public class CustomGameScoreRecord
    {
        public string PlayerName { get; set; }
        public int Score { get; set; }
        public DateTime AchievedAt { get; set; }
    }
}
