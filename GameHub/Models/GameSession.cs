using System;
using System.Collections.Generic;

namespace GameHub.Models
{
    public class GameSession
    {
        public string SessionId { get; set; }
        public GameType GameType { get; set; }
        public string CustomGameId { get; set; }
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

        // Speed Math Real-time State
        public int MathSeed { get; set; }
        public int Player1MathScore { get; set; }
        public int Player2MathScore { get; set; }
        public int Player1MathAnswered { get; set; }
        public int Player2MathAnswered { get; set; }
        public int Player1MathStreak { get; set; }
        public int Player2MathStreak { get; set; }
        public string MathOperation { get; set; }
        public string MathDifficulty { get; set; }

        // Dots and Boxes Turn-based State
        public int DotsGridSize { get; set; }
        public bool[,] DotsHozLines { get; set; }
        public bool[,] DotsVertLines { get; set; }
        public int[,] DotsBoxes { get; set; }
        public int Player1Boxes { get; set; }
        public int Player2Boxes { get; set; }

        // Codebreaker / Mastermind State
        public int CodebreakerSeed { get; set; }
        public string CodebreakerDifficulty { get; set; }
        public int Player1CodebreakerAttempts { get; set; }
        public int Player2CodebreakerAttempts { get; set; }
        public bool Player1CodebreakerSolved { get; set; }
        public bool Player2CodebreakerSolved { get; set; }

        // Memory Matrix State
        public int MemorySeed { get; set; }
        public int MemoryLevel { get; set; }
        public int Player1MemoryScore { get; set; }
        public int Player2MemoryScore { get; set; }
        public int Player1MemoryLives { get; set; }
        public int Player2MemoryLives { get; set; }

        // Laser & Mirrors State
        public int LaserLevel { get; set; }
        public int LaserSeed { get; set; }
        public int Player1LaserCrystals { get; set; }
        public int Player2LaserCrystals { get; set; }
        public bool Player1LaserSolved { get; set; }
        public bool Player2LaserSolved { get; set; }

        // AlgoBot State
        public int AlgoLevel { get; set; }
        public int AlgoSeed { get; set; }
        public int Player1AlgoChips { get; set; }
        public int Player2AlgoChips { get; set; }
        public bool Player1AlgoSolved { get; set; }
        public bool Player2AlgoSolved { get; set; }

        // Wordle / Word Duel State
        public int WordDuelSeed { get; set; }
        public string WordDuelTargetWord { get; set; }
        public int WordDuelLength { get; set; }
        public int Player1WordAttempts { get; set; }
        public int Player2WordAttempts { get; set; }
        public bool Player1WordSolved { get; set; }
        public bool Player2WordSolved { get; set; }

        // Lights Out / Quantum Switch State
        public int LightsOutSeed { get; set; }
        public int LightsOutGridSize { get; set; }
        public string LightsOutMode { get; set; }
        public int Player1LightsRemaining { get; set; }
        public int Player2LightsRemaining { get; set; }
        public int Player1LightsMoves { get; set; }
        public int Player2LightsMoves { get; set; }
        public bool Player1LightsSolved { get; set; }
        public bool Player2LightsSolved { get; set; }

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
            MathSeed = new Random().Next(100000, 999999);
            MathOperation = "mix";
            MathDifficulty = "medium";
            DotsGridSize = 4;
            CodebreakerSeed = new Random().Next(100000, 999999);
            CodebreakerDifficulty = "medium";
            MemorySeed = new Random().Next(100000, 999999);
            MemoryLevel = 1;
            Player1MemoryLives = 3;
            Player2MemoryLives = 3;
            LaserLevel = 1;
            LaserSeed = new Random().Next(100000, 999999);
            AlgoLevel = 1;
            AlgoSeed = new Random().Next(100000, 999999);
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

        public GameSession(GameType gameType, Player p1, Player p2, string customGameId) : this(gameType, p1, p2)
        {
            CustomGameId = customGameId;
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

                case GameType.SpeedMath:
                    MathSeed = new Random().Next(100000, 999999);
                    Player1MathScore = 0;
                    Player2MathScore = 0;
                    Player1MathAnswered = 0;
                    Player2MathAnswered = 0;
                    Player1MathStreak = 0;
                    Player2MathStreak = 0;
                    break;

                case GameType.SlingPuck:
                    Player1Score = 0;
                    Player2Score = 0;
                    break;

                case GameType.DotsAndBoxes:
                    if (DotsGridSize < 3 || DotsGridSize > 6) DotsGridSize = 4;
                    DotsHozLines = new bool[DotsGridSize + 1, DotsGridSize];
                    DotsVertLines = new bool[DotsGridSize, DotsGridSize + 1];
                    DotsBoxes = new int[DotsGridSize, DotsGridSize];
                    Player1Boxes = 0;
                    Player2Boxes = 0;
                    CurrentTurnPlayerId = Player1 != null ? Player1.ConnectionId : null;
                    break;

                case GameType.Codebreaker:
                    CodebreakerSeed = new Random().Next(100000, 999999);
                    Player1CodebreakerAttempts = 0;
                    Player2CodebreakerAttempts = 0;
                    Player1CodebreakerSolved = false;
                    Player2CodebreakerSolved = false;
                    break;

                case GameType.MemoryMatrix:
                    MemorySeed = new Random().Next(100000, 999999);
                    MemoryLevel = 1;
                    Player1MemoryScore = 0;
                    Player2MemoryScore = 0;
                    Player1MemoryLives = 3;
                    Player2MemoryLives = 3;
                    break;

                case GameType.LaserMirrors:
                    LaserSeed = new Random().Next(100000, 999999);
                    LaserLevel = 1;
                    Player1LaserCrystals = 0;
                    Player2LaserCrystals = 0;
                    Player1LaserSolved = false;
                    Player2LaserSolved = false;
                    break;

                case GameType.AlgoBot:
                    AlgoSeed = new Random().Next(100000, 999999);
                    AlgoLevel = 1;
                    Player1AlgoChips = 0;
                    Player2AlgoChips = 0;
                    Player1AlgoSolved = false;
                    Player2AlgoSolved = false;
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
