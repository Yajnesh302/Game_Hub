using System;

namespace GameHub.Models
{
    public class Player
    {
        public string ConnectionId { get; set; }
        public string PlayerId { get; set; }
        public string DisplayName { get; set; }
        public PlayerStatus Status { get; set; }
        public string CurrentSessionId { get; set; }
        public GameType? QueuedGameType { get; set; }
        public int Wins { get; set; }
        public int Losses { get; set; }
        public int Draws { get; set; }
        public DateTime ConnectedAt { get; set; }
        public DateTime LastActivity { get; set; }

        public Player()
        {
            ConnectedAt = DateTime.UtcNow;
            LastActivity = DateTime.UtcNow;
            Status = PlayerStatus.Idle;
        }

        public Player(string connectionId, string displayName) : this()
        {
            ConnectionId = connectionId;
            PlayerId = connectionId;
            DisplayName = string.IsNullOrWhiteSpace(displayName) ? "Guest_" + connectionId.Substring(0, 4) : displayName.Trim();
        }
    }
}
