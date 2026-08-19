using System;
using System.Collections.Generic;

namespace GameHub.Models
{
    public class GameSession
    {
        public string SessionId { get; set; }
        public GameType GameType { get; set; }
        public Player Player1 { get; set; }
        public Player Player2 { get; set; }
        public string CurrentTurnPlayerId { get; set; }
        public SessionStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastMoveAt { get; set; }
        public string WinnerPlayerId { get; set; }
        public bool IsDraw { get; set; }
        public List<int> WinningPositions { get; set; }
        
        // Board representation
        public string[] TicTacToeBoard { get; set; }
        public int[,] Connect4Board { get; set; }

        // Scores & Rounds
        public int CurrentRound { get; set; }
        public int Player1Score { get; set; }
        public int Player2Score { get; set; }
        public string Player1CurrentChoice { get; set; }
        public string Player2CurrentChoice { get; set; }
        public List<RPSRoundResult> RpsRoundHistory { get; set; }

        // Air Hockey Real-Time Physics State
        public float PuckX { get; set; }
        public float PuckY { get; set; }
        public float PuckVx { get; set; }
        public float PuckVy { get; set; }
        public float P1PaddleX { get; set; }
        public float P1PaddleY { get; set; }
        public float P2PaddleX { get; set; }
        public float P2PaddleY { get; set; }
        public DateTime AirHockeyPausedUntil { get; set; }
        public const int AIR_HOCKEY_WIN_SCORE = 7;

        // Archery Clash Turn-based State
        public const int ARCHERY_TOTAL_ROUNDS = 5;
        public List<int> Player1ArcheryShots { get; set; }
        public List<int> Player2ArcheryShots { get; set; }
        public float CurrentWindX { get; set; }
        public float CurrentWindY { get; set; }

        // Chess Turn-based State
        public const string DEFAULT_CHESS_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        public string ChessFen { get; set; }
        public List<string> ChessMoveHistory { get; set; }
        public List<string> ChessCapturedWhite { get; set; }
        public List<string> ChessCapturedBlack { get; set; }
        public string ChessDrawOfferedBy { get; set; }

        // Rematch flags
        public bool Player1WantsRematch { get; set; }
        public bool Player2WantsRematch { get; set; }

        public GameSession()
        {
            SessionId = Guid.NewGuid().ToString("N");
            CreatedAt = DateTime.UtcNow;
            LastMoveAt = DateTime.UtcNow;
            Status = SessionStatus.WaitingForPlayers;
            WinningPositions = new List<int>();
            RpsRoundHistory = new List<RPSRoundResult>();
            Player1ArcheryShots = new List<int>();
            Player2ArcheryShots = new List<int>();
            ChessMoveHistory = new List<string>();
            ChessCapturedWhite = new List<string>();
            ChessCapturedBlack = new List<string>();
            ChessFen = DEFAULT_CHESS_FEN;
        }

        public GameSession(GameType gameType, Player p1, Player p2) : this()
        {
            GameType = gameType;
            Player1 = p1;
            Player2 = p2;
            Status = SessionStatus.InProgress;
            CurrentTurnPlayerId = p1 != null ? p1.ConnectionId : null;
            InitBoard();
        }

        public void InitBoard()
        {
            WinningPositions = new List<int>();
            WinnerPlayerId = null;
            IsDraw = false;
            Player1WantsRematch = false;
            Player2WantsRematch = false;
            LastMoveAt = DateTime.UtcNow;

            switch (GameType)
            {
                case GameType.TicTacToe:
                    TicTacToeBoard = new string[9];
                    for (int i = 0; i < 9; i++) TicTacToeBoard[i] = string.Empty;
                    break;

                case GameType.Connect4:
                    Connect4Board = new int[6, 7];
                    break;

                case GameType.RPS:
                    CurrentRound = 1;
                    Player1Score = 0;
                    Player2Score = 0;
                    Player1CurrentChoice = null;
                    Player2CurrentChoice = null;
                    RpsRoundHistory = new List<RPSRoundResult>();
                    break;

                case GameType.AirHockey:
                    CurrentRound = 1;
                    Player1Score = 0;
                    Player2Score = 0;
                    ResetAirHockeyPuck(0);
                    P1PaddleX = 120f;
                    P1PaddleY = 240f;
                    P2PaddleX = 680f;
                    P2PaddleY = 240f;
                    AirHockeyPausedUntil = DateTime.UtcNow;
                    break;

                case GameType.Archery:
                    CurrentRound = 1;
                    Player1Score = 0;
                    Player2Score = 0;
                    Player1ArcheryShots = new List<int>();
                    Player2ArcheryShots = new List<int>();
                    CurrentWindX = GenerateRandomWind();
                    CurrentWindY = (float)Math.Round(GenerateRandomWind() * 0.5f, 1);
                    CurrentTurnPlayerId = Player1 != null ? Player1.ConnectionId : null;
                    break;

                case GameType.Chess:
                    ChessFen = DEFAULT_CHESS_FEN;
                    ChessMoveHistory = new List<string>();
                    ChessCapturedWhite = new List<string>();
                    ChessCapturedBlack = new List<string>();
                    ChessDrawOfferedBy = null;
                    CurrentTurnPlayerId = Player1 != null ? Player1.ConnectionId : null; // White goes first (Player 1)
                    break;
            }
        }

        public void ResetAirHockeyPuck(int scoredByPlayer)
        {
            PuckX = 400f;
            PuckY = 240f;

            Random rand = new Random();
            float dirX = (scoredByPlayer == 1) ? 1.0f : (scoredByPlayer == 2 ? -1.0f : (rand.Next(0, 2) == 0 ? -1.0f : 1.0f));
            float speed = 4.5f;
            float angle = (float)((rand.NextDouble() - 0.5) * 0.8);

            PuckVx = dirX * speed * (float)Math.Cos(angle);
            PuckVy = speed * (float)Math.Sin(angle);
            AirHockeyPausedUntil = DateTime.UtcNow.AddMilliseconds(1200);
        }

        public static float GenerateRandomWind()
        {
            Random r = new Random();
            // Wind from -4.0 to +4.0 m/s
            return (float)Math.Round((r.NextDouble() * 8.0 - 4.0), 1);
        }
    }

    public class RPSRoundResult
    {
        public int RoundNumber { get; set; }
        public string Player1Choice { get; set; }
        public string Player2Choice { get; set; }
        public string Player1ConnectionId { get; set; }
        public string Player2ConnectionId { get; set; }
        public string WinnerPlayerId { get; set; }
        public int WinnerPlayerNumber { get; set; }
        public bool IsDraw { get; set; }
        public int P1ScoreAfterRound { get; set; }
        public int P2ScoreAfterRound { get; set; }
    }
}
