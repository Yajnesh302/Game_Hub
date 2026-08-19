using System;
using System.Collections.Generic;
using System.Linq;

namespace GameHub.Services
{
    public static class BotAiService
    {
        private static readonly Random _random = new Random();

        #region Tic-Tac-Toe Minimax Algorithm
        private static readonly int[][] WinningLines = new int[][]
        {
            new int[] { 0, 1, 2 }, new int[] { 3, 4, 5 }, new int[] { 6, 7, 8 },
            new int[] { 0, 3, 6 }, new int[] { 1, 4, 7 }, new int[] { 2, 5, 8 },
            new int[] { 0, 4, 8 }, new int[] { 2, 4, 6 }
        };

        public static int GetTicTacToeMove(string[] board, string botSymbol, string humanSymbol, string difficulty)
        {
            List<int> available = new List<int>();
            for (int i = 0; i < 9; i++)
            {
                if (string.IsNullOrEmpty(board[i])) available.Add(i);
            }

            if (available.Count == 0) return -1;
            if (available.Count == 9) return 4; // Center optimal opening

            if (difficulty.Equals("easy", StringComparison.OrdinalIgnoreCase))
            {
                if (_random.NextDouble() > 0.25)
                {
                    return available[_random.Next(available.Count)];
                }
            }
            else if (difficulty.Equals("normal", StringComparison.OrdinalIgnoreCase))
            {
                if (_random.NextDouble() > 0.60)
                {
                    return available[_random.Next(available.Count)];
                }
            }

            int bestScore = int.MinValue;
            int bestMove = available[0];

            foreach (int move in available)
            {
                board[move] = botSymbol;
                int score = MinimaxScore(board, 0, false, botSymbol, humanSymbol);
                board[move] = string.Empty;

                if (score > bestScore)
                {
                    bestScore = score;
                    bestMove = move;
                }
            }

            return bestMove;
        }

        private static int MinimaxScore(string[] board, int depth, bool isMaximizing, string botSymbol, string humanSymbol)
        {
            string winner = CheckTicTacToeWinner(board);
            if (winner == botSymbol) return 10 - depth;
            if (winner == humanSymbol) return depth - 10;
            if (board.All(cell => !string.IsNullOrEmpty(cell))) return 0;

            if (isMaximizing)
            {
                int maxScore = int.MinValue;
                for (int i = 0; i < 9; i++)
                {
                    if (string.IsNullOrEmpty(board[i]))
                    {
                        board[i] = botSymbol;
                        int score = MinimaxScore(board, depth + 1, false, botSymbol, humanSymbol);
                        board[i] = string.Empty;
                        maxScore = Math.Max(maxScore, score);
                    }
                }
                return maxScore;
            }
            else
            {
                int minScore = int.MaxValue;
                for (int i = 0; i < 9; i++)
                {
                    if (string.IsNullOrEmpty(board[i]))
                    {
                        board[i] = humanSymbol;
                        int score = MinimaxScore(board, depth + 1, true, botSymbol, humanSymbol);
                        board[i] = string.Empty;
                        minScore = Math.Min(minScore, score);
                    }
                }
                return minScore;
            }
        }

        public static string CheckTicTacToeWinner(string[] board)
        {
            foreach (var line in WinningLines)
            {
                if (!string.IsNullOrEmpty(board[line[0]]) &&
                    board[line[0]] == board[line[1]] &&
                    board[line[1]] == board[line[2]])
                {
                    return board[line[0]];
                }
            }
            return null;
        }

        public static List<int> GetTicTacToeWinningLine(string[] board)
        {
            foreach (var line in WinningLines)
            {
                if (!string.IsNullOrEmpty(board[line[0]]) &&
                    board[line[0]] == board[line[1]] &&
                    board[line[1]] == board[line[2]])
                {
                    return line.ToList();
                }
            }
            return new List<int>();
        }
        #endregion

        #region Connect 4 Alpha-Beta Pruning Algorithm
        public const int ROWS = 6;
        public const int COLS = 7;

        public static int GetConnect4Move(int[,] board, int botPlayer, int humanPlayer, string difficulty)
        {
            List<int> validCols = GetValidConnect4Columns(board);
            if (validCols.Count == 0) return -1;

            // 1-ply instant win check
            foreach (int col in validCols)
            {
                int[,] copy = (int[,])board.Clone();
                DropDisc(copy, col, botPlayer);
                if (CheckConnect4Win(copy, botPlayer)) return col;
            }

            // 1-ply instant block check
            foreach (int col in validCols)
            {
                int[,] copy = (int[,])board.Clone();
                DropDisc(copy, col, humanPlayer);
                if (CheckConnect4Win(copy, humanPlayer)) return col;
            }

            if (difficulty.Equals("easy", StringComparison.OrdinalIgnoreCase))
            {
                return validCols[_random.Next(validCols.Count)];
            }

            int searchDepth = difficulty.Equals("hard", StringComparison.OrdinalIgnoreCase) ? 6 : 3;
            int bestCol = validCols[0];
            int bestScore = int.MinValue;

            foreach (int col in validCols)
            {
                int[,] copy = (int[,])board.Clone();
                DropDisc(copy, col, botPlayer);
                int score = AlphaBeta(copy, searchDepth - 1, int.MinValue, int.MaxValue, false, botPlayer, humanPlayer);
                if (score > bestScore)
                {
                    bestScore = score;
                    bestCol = col;
                }
            }

            return bestCol;
        }

        private static int AlphaBeta(int[,] board, int depth, int alpha, int beta, bool isMaximizing, int botPlayer, int humanPlayer)
        {
            if (CheckConnect4Win(board, botPlayer)) return 10000 + depth;
            if (CheckConnect4Win(board, humanPlayer)) return -10000 - depth;

            List<int> validCols = GetValidConnect4Columns(board);
            if (validCols.Count == 0 || depth == 0)
            {
                return EvaluateConnect4Board(board, botPlayer, humanPlayer);
            }

            if (isMaximizing)
            {
                int maxScore = int.MinValue;
                foreach (int col in validCols)
                {
                    int[,] copy = (int[,])board.Clone();
                    DropDisc(copy, col, botPlayer);
                    int score = AlphaBeta(copy, depth - 1, alpha, beta, false, botPlayer, humanPlayer);
                    maxScore = Math.Max(maxScore, score);
                    alpha = Math.Max(alpha, score);
                    if (beta <= alpha) break;
                }
                return maxScore;
            }
            else
            {
                int minScore = int.MaxValue;
                foreach (int col in validCols)
                {
                    int[,] copy = (int[,])board.Clone();
                    DropDisc(copy, col, humanPlayer);
                    int score = AlphaBeta(copy, depth - 1, alpha, beta, true, botPlayer, humanPlayer);
                    minScore = Math.Min(minScore, score);
                    beta = Math.Min(beta, score);
                    if (beta <= alpha) break;
                }
                return minScore;
            }
        }

        private static int EvaluateConnect4Board(int[,] board, int botPlayer, int humanPlayer)
        {
            int score = 0;
            // Center column preference
            int centerCol = COLS / 2;
            for (int r = 0; r < ROWS; r++)
            {
                if (board[r, centerCol] == botPlayer) score += 4;
                else if (board[r, centerCol] == humanPlayer) score -= 4;
            }

            // Window evaluations
            // Horizontal
            for (int r = 0; r < ROWS; r++)
            {
                for (int c = 0; c < COLS - 3; c++)
                {
                    score += EvaluateWindow(new int[] { board[r, c], board[r, c + 1], board[r, c + 2], board[r, c + 3] }, botPlayer, humanPlayer);
                }
            }

            // Vertical
            for (int c = 0; c < COLS; c++)
            {
                for (int r = 0; r < ROWS - 3; r++)
                {
                    score += EvaluateWindow(new int[] { board[r, c], board[r + 1, c], board[r + 2, c], board[r + 3, c] }, botPlayer, humanPlayer);
                }
            }

            // Positive Diagonal
            for (int r = 3; r < ROWS; r++)
            {
                for (int c = 0; c < COLS - 3; c++)
                {
                    score += EvaluateWindow(new int[] { board[r, c], board[r - 1, c + 1], board[r - 2, c + 2], board[r - 3, c + 3] }, botPlayer, humanPlayer);
                }
            }

            // Negative Diagonal
            for (int r = 0; r < ROWS - 3; r++)
            {
                for (int c = 0; c < COLS - 3; c++)
                {
                    score += EvaluateWindow(new int[] { board[r, c], board[r + 1, c + 1], board[r + 2, c + 2], board[r + 3, c + 3] }, botPlayer, humanPlayer);
                }
            }

            return score;
        }

        private static int EvaluateWindow(int[] window, int bot, int human)
        {
            int botCount = window.Count(x => x == bot);
            int humanCount = window.Count(x => x == human);
            int emptyCount = window.Count(x => x == 0);

            if (botCount == 4) return 100;
            if (botCount == 3 && emptyCount == 1) return 10;
            if (botCount == 2 && emptyCount == 2) return 3;

            if (humanCount == 3 && emptyCount == 1) return -12;
            if (humanCount == 2 && emptyCount == 2) return -4;

            return 0;
        }

        public static List<int> GetValidConnect4Columns(int[,] board)
        {
            List<int> valid = new List<int>();
            int[] order = new int[] { 3, 2, 4, 1, 5, 0, 6 }; // Center-first ordering
            foreach (int c in order)
            {
                if (board[0, c] == 0) valid.Add(c);
            }
            return valid;
        }

        public static int DropDisc(int[,] board, int col, int player)
        {
            for (int r = ROWS - 1; r >= 0; r--)
            {
                if (board[r, col] == 0)
                {
                    board[r, col] = player;
                    return r;
                }
            }
            return -1;
        }

        public static bool CheckConnect4Win(int[,] b, int p)
        {
            // Horizontal
            for (int r = 0; r < ROWS; r++)
            {
                for (int c = 0; c < COLS - 3; c++)
                {
                    if (b[r, c] == p && b[r, c + 1] == p && b[r, c + 2] == p && b[r, c + 3] == p) return true;
                }
            }
            // Vertical
            for (int c = 0; c < COLS; c++)
            {
                for (int r = 0; r < ROWS - 3; r++)
                {
                    if (b[r, c] == p && b[r + 1, c] == p && b[r + 2, c] == p && b[r + 3, c] == p) return true;
                }
            }
            // Positive slope
            for (int r = 3; r < ROWS; r++)
            {
                for (int c = 0; c < COLS - 3; c++)
                {
                    if (b[r, c] == p && b[r - 1, c + 1] == p && b[r - 2, c + 2] == p && b[r - 3, c + 3] == p) return true;
                }
            }
            // Negative slope
            for (int r = 0; r < ROWS - 3; r++)
            {
                for (int c = 0; c < COLS - 3; c++)
                {
                    if (b[r, c] == p && b[r + 1, c + 1] == p && b[r + 2, c + 2] == p && b[r + 3, c + 3] == p) return true;
                }
            }
            return false;
        }

        public static List<int> GetConnect4WinningCells(int[,] b, int p)
        {
            List<int> cells = new List<int>();
            // Check all directions and return the matching 4 coordinates as flattened indices (r * COLS + c)
            for (int r = 0; r < ROWS; r++)
            {
                for (int c = 0; c < COLS - 3; c++)
                {
                    if (b[r, c] == p && b[r, c + 1] == p && b[r, c + 2] == p && b[r, c + 3] == p)
                    {
                        cells.Add(r * COLS + c);
                        cells.Add(r * COLS + c + 1);
                        cells.Add(r * COLS + c + 2);
                        cells.Add(r * COLS + c + 3);
                        return cells;
                    }
                }
            }

            for (int c = 0; c < COLS; c++)
            {
                for (int r = 0; r < ROWS - 3; r++)
                {
                    if (b[r, c] == p && b[r + 1, c] == p && b[r + 2, c] == p && b[r + 3, c] == p)
                    {
                        cells.Add(r * COLS + c);
                        cells.Add((r + 1) * COLS + c);
                        cells.Add((r + 2) * COLS + c);
                        cells.Add((r + 3) * COLS + c);
                        return cells;
                    }
                }
            }

            for (int r = 3; r < ROWS; r++)
            {
                for (int c = 0; c < COLS - 3; c++)
                {
                    if (b[r, c] == p && b[r - 1, c + 1] == p && b[r - 2, c + 2] == p && b[r - 3, c + 3] == p)
                    {
                        cells.Add(r * COLS + c);
                        cells.Add((r - 1) * COLS + c + 1);
                        cells.Add((r - 2) * COLS + c + 2);
                        cells.Add((r - 3) * COLS + c + 3);
                        return cells;
                    }
                }
            }

            for (int r = 0; r < ROWS - 3; r++)
            {
                for (int c = 0; c < COLS - 3; c++)
                {
                    if (b[r, c] == p && b[r + 1, c + 1] == p && b[r + 2, c + 2] == p && b[r + 3, c + 3] == p)
                    {
                        cells.Add(r * COLS + c);
                        cells.Add((r + 1) * COLS + c + 1);
                        cells.Add((r + 2) * COLS + c + 2);
                        cells.Add((r + 3) * COLS + c + 3);
                        return cells;
                    }
                }
            }

            return cells;
        }
        #endregion

        #region Rock-Paper-Scissors Pattern AI
        private static readonly string[] Choices = new string[] { "rock", "paper", "scissors" };

        public static string GetRPSMove(List<string> history, string difficulty)
        {
            if (difficulty.Equals("easy", StringComparison.OrdinalIgnoreCase) || history == null || history.Count == 0)
            {
                return Choices[_random.Next(Choices.Length)];
            }

            if (difficulty.Equals("normal", StringComparison.OrdinalIgnoreCase))
            {
                // Frequency counter
                int rCount = history.Count(x => x == "rock");
                int pCount = history.Count(x => x == "paper");
                int sCount = history.Count(x => x == "scissors");

                string mostCommon = "rock";
                if (pCount > rCount && pCount >= sCount) mostCommon = "paper";
                else if (sCount > rCount && sCount >= pCount) mostCommon = "scissors";

                if (_random.NextDouble() < 0.65)
                {
                    return GetCounterMove(mostCommon);
                }
                return Choices[_random.Next(Choices.Length)];
            }

            // Hard: Markov Chain 2nd-order pattern predictor & Win-Stay / Lose-Shift analysis
            if (history.Count >= 2)
            {
                string last = history[history.Count - 1];
                string prev = history[history.Count - 2];

                if (last == prev)
                {
                    // Player repeats choice -> predict next cycle
                    string nextPredicted = (last == "rock") ? "paper" : (last == "paper" ? "scissors" : "rock");
                    return GetCounterMove(nextPredicted);
                }
            }

            string recent = history[history.Count - 1];
            return GetCounterMove(recent);
        }

        public static string GetCounterMove(string playerPredictedMove)
        {
            switch (playerPredictedMove.ToLowerInvariant())
            {
                case "rock": return "paper";
                case "paper": return "scissors";
                case "scissors": return "rock";
                default: return "rock";
            }
        }

        public static int DetermineRPSWinner(string p1Choice, string p2Choice)
        {
            p1Choice = p1Choice.ToLowerInvariant();
            p2Choice = p2Choice.ToLowerInvariant();

            if (p1Choice == p2Choice) return 0; // Draw

            if ((p1Choice == "rock" && p2Choice == "scissors") ||
                (p1Choice == "scissors" && p2Choice == "paper") ||
                (p1Choice == "paper" && p2Choice == "rock"))
            {
                return 1; // Player 1 Wins
            }

            return 2; // Player 2 Wins
        }
        #endregion

        #region Air Hockey AI & Predictive Physics
        public const float TABLE_WIDTH = 800f;
        public const float TABLE_HEIGHT = 480f;
        public const float PADDLE_RADIUS = 32f;
        public const float PUCK_RADIUS = 18f;
        public const float GOAL_TOP = 160f;
        public const float GOAL_BOTTOM = 320f;

        public static AirHockeyTarget GetAirHockeyBotPaddleTarget(
            float botX, float botY, 
            float puckX, float puckY, 
            float puckVx, float puckVy, 
            string difficulty)
        {
            float defenseBaseX = 700f;

            if (difficulty.Equals("easy", StringComparison.OrdinalIgnoreCase))
            {
                // Easy: Stays on baseline, slowly tracks puck Y with 40px offset
                float targetY = Math.Max(80f, Math.Min(400f, puckY));
                return new AirHockeyTarget(defenseBaseX, targetY);
            }

            if (difficulty.Equals("normal", StringComparison.OrdinalIgnoreCase))
            {
                // Normal: If puck in bot half, advance to strike; otherwise guard center
                if (puckX > 400f)
                {
                    float targetX = Math.Max(480f, Math.Min(720f, puckX + 15f));
                    float targetY = Math.Max(70f, Math.Min(410f, puckY));
                    return new AirHockeyTarget(targetX, targetY);
                }
                return new AirHockeyTarget(defenseBaseX, Math.Max(120f, Math.Min(360f, puckY)));
            }

            // Hard: Predictive ray-cast trajectory projection with wall bounces
            float predictedY = puckY;
            if (puckVx > 0.5f)
            {
                // Project intersection at bot's target X line
                float timeToReach = (650f - puckX) / puckVx;
                if (timeToReach > 0 && timeToReach < 60f)
                {
                    float projectedY = puckY + puckVy * timeToReach;
                    // Account for wall bounces between 20 and 460
                    while (projectedY < 20f || projectedY > 460f)
                    {
                        if (projectedY < 20f) projectedY = 20f + (20f - projectedY);
                        if (projectedY > 460f) projectedY = 460f - (projectedY - 460f);
                    }
                    predictedY = projectedY;
                }
            }

            // If puck is slow or in player's half, position strategically
            if (puckX < 400f)
            {
                return new AirHockeyTarget(defenseBaseX, Math.Max(150f, Math.Min(330f, predictedY)));
            }

            // Aggressive striking behavior when puck enters bot territory
            float strikeX = Math.Max(460f, Math.Min(740f, puckX + 25f));
            float strikeY = Math.Max(60f, Math.Min(420f, predictedY));
            return new AirHockeyTarget(strikeX, strikeY);
        }
        #endregion

        #region Archery Clash 3D Olympic Trajectory & Scoring AI
        public const float ARCHERY_TARGET_DISTANCE = 50f;
        public const float ARCHERY_BASE_ARROW_SPEED = 75f;
        public const float ARCHERY_GRAVITY_3D = 9.81f;
        public const float ARCHERY_WIND_SCALE_X = 4.8f;
        public const float ARCHERY_WIND_SCALE_Y = 2.6f;

        public static ArcheryShotResult CalculateArcheryShot(float aimX, float aimY, float power, float windX, float windY)
        {
            power = Math.Max(40f, Math.Min(100f, power));
            float pFactor = power / 100f;
            float arrowSpeed = ARCHERY_BASE_ARROW_SPEED * pFactor;
            float flightTime = ARCHERY_TARGET_DISTANCE / arrowSpeed;
            float calibTime = ARCHERY_TARGET_DISTANCE / ARCHERY_BASE_ARROW_SPEED;

            float dropDiff = 0.5f * ARCHERY_GRAVITY_3D * (flightTime * flightTime - calibTime * calibTime);
            float gravityDropCm = dropDiff * 100f;

            float driftX = windX * ARCHERY_WIND_SCALE_X;
            float driftY = windY * ARCHERY_WIND_SCALE_Y;

            float hitX = aimX + driftX;
            float hitY = aimY + driftY + gravityDropCm;

            float radius = (float)Math.Sqrt(hitX * hitX + hitY * hitY);
            int score = 0;
            string ringName = "Miss";
            string ringColor = "#64748b";
            bool isXRing = false;

            if (radius <= 3.2f) { score = 10; ringName = "X-RING PERFECT BULLSEYE!"; ringColor = "#fbbf24"; isXRing = true; }
            else if (radius <= 6.0f) { score = 10; ringName = "BULLSEYE! 10 PTS"; ringColor = "#f59e0b"; }
            else if (radius <= 12.0f) { score = 9; ringName = "GOLD (9 PTS)"; ringColor = "#eab308"; }
            else if (radius <= 18.0f) { score = 8; ringName = "RED (8 PTS)"; ringColor = "#ef4444"; }
            else if (radius <= 24.0f) { score = 7; ringName = "RED (7 PTS)"; ringColor = "#dc2626"; }
            else if (radius <= 30.0f) { score = 6; ringName = "BLUE (6 PTS)"; ringColor = "#3b82f6"; }
            else if (radius <= 36.0f) { score = 5; ringName = "BLUE (5 PTS)"; ringColor = "#2563eb"; }
            else if (radius <= 42.0f) { score = 4; ringName = "BLACK (4 PTS)"; ringColor = "#1e293b"; }
            else if (radius <= 48.0f) { score = 3; ringName = "BLACK (3 PTS)"; ringColor = "#0f172a"; }
            else if (radius <= 54.0f) { score = 2; ringName = "WHITE (2 PTS)"; ringColor = "#e2e8f0"; }
            else if (radius <= 60.0f) { score = 1; ringName = "WHITE (1 PT)"; ringColor = "#cbd5e1"; }
            else { score = 0; ringName = "MISS (0 PTS)"; ringColor = "#64748b"; }

            return new ArcheryShotResult
            {
                AimX = aimX,
                AimY = aimY,
                HitX = hitX,
                HitY = hitY,
                Power = power,
                Distance = radius,
                Score = score,
                RingName = ringName,
                RingColor = ringColor,
                IsBullseye = (score == 10),
                IsXRing = isXRing,
                FlightTime = flightTime
            };
        }

        public static ArcheryShotResult GetBotArcheryShot(float windX, float windY, string difficulty)
        {
            float idealAimX = -windX * ARCHERY_WIND_SCALE_X;
            float idealAimY = -windY * ARCHERY_WIND_SCALE_Y;

            float scatterX = 0f;
            float scatterY = 0f;
            float power = 100f;

            if (difficulty.Equals("easy", StringComparison.OrdinalIgnoreCase))
            {
                scatterX = (float)(_random.NextDouble() * 52.0 - 26.0);
                scatterY = (float)(_random.NextDouble() * 52.0 - 26.0);
                power = (float)(_random.NextDouble() * 20.0 + 80.0);
            }
            else if (difficulty.Equals("normal", StringComparison.OrdinalIgnoreCase))
            {
                scatterX = (float)(_random.NextDouble() * 18.0 - 9.0);
                scatterY = (float)(_random.NextDouble() * 18.0 - 9.0);
                power = (float)(_random.NextDouble() * 8.0 + 92.0);
            }
            else
            {
                scatterX = (float)(_random.NextDouble() * 5.0 - 2.5);
                scatterY = (float)(_random.NextDouble() * 5.0 - 2.5);
                power = (float)(_random.NextDouble() * 3.0 + 97.0);
            }

            float finalAimX = idealAimX + scatterX;
            float finalAimY = idealAimY + scatterY;

            return CalculateArcheryShot(finalAimX, finalAimY, power, windX, windY);
        }
        #endregion
    }

    public class AirHockeyTarget
    {
        public float TargetX { get; set; }
        public float TargetY { get; set; }

        public AirHockeyTarget(float x, float y)
        {
            TargetX = x;
            TargetY = y;
        }
    }

    public class ArcheryShotResult
    {
        public float AimX { get; set; }
        public float AimY { get; set; }
        public float HitX { get; set; }
        public float HitY { get; set; }
        public float Power { get; set; }
        public float Distance { get; set; }
        public int Score { get; set; }
        public string RingName { get; set; }
        public string RingColor { get; set; }
        public bool IsBullseye { get; set; }
        public bool IsXRing { get; set; }
        public float FlightTime { get; set; }
    }
}
