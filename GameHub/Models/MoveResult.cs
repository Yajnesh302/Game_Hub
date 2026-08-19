using System.Collections.Generic;

namespace GameHub.Models
{
    public class MoveResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public bool IsGameOver { get; set; }
        public bool IsDraw { get; set; }
        public string WinnerPlayerId { get; set; }
        public string NextTurnPlayerId { get; set; }
        public List<int> WinningLine { get; set; }
        public int MoveIndex { get; set; }
        public int Row { get; set; }
        public int Col { get; set; }
        public string PlayerSymbol { get; set; }
        public object ExtraData { get; set; }

        public MoveResult()
        {
            WinningLine = new List<int>();
        }
    }

    public class InviteRequest
    {
        public string InviteId { get; set; }
        public Player FromPlayer { get; set; }
        public Player ToPlayer { get; set; }
        public GameType GameType { get; set; }
        public System.DateTime CreatedAt { get; set; }

        public InviteRequest()
        {
            CreatedAt = System.DateTime.UtcNow;
            InviteId = System.Guid.NewGuid().ToString("N");
        }
    }

    public class LeaderboardEntry
    {
        public string DisplayName { get; set; }
        public int Wins { get; set; }
        public int Losses { get; set; }
        public int Draws { get; set; }
        public int TotalGames { get { return Wins + Losses + Draws; } }
        public double WinRate
        {
            get
            {
                if (TotalGames == 0) return 0;
                return System.Math.Round((double)Wins / TotalGames * 100.0, 1);
            }
        }
        public int Points { get { return (Wins * 3) + (Draws * 1); } }
    }
}
