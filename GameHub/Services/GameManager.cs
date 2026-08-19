using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using GameHub.Models;

namespace GameHub.Services
{
    public class GameManager
    {
        private static readonly Lazy<GameManager> _instance = new Lazy<GameManager>(() => new GameManager());
        public static GameManager Instance { get { return _instance.Value; } }

        private readonly ConcurrentDictionary<string, Player> _players;
        private readonly ConcurrentDictionary<string, GameSession> _sessions;
        private readonly ConcurrentDictionary<GameType, ConcurrentQueue<string>> _matchQueues;
        private readonly ConcurrentDictionary<string, InviteRequest> _invites;
        private readonly ConcurrentDictionary<string, LeaderboardEntry> _leaderboard;
        private readonly object _matchmakingLock = new object();
        private readonly object _sessionLock = new object();

        private GameManager()
        {
            _players = new ConcurrentDictionary<string, Player>(StringComparer.OrdinalIgnoreCase);
            _sessions = new ConcurrentDictionary<string, GameSession>(StringComparer.OrdinalIgnoreCase);
            _matchQueues = new ConcurrentDictionary<GameType, ConcurrentQueue<string>>();
            _matchQueues[GameType.TicTacToe] = new ConcurrentQueue<string>();
            _matchQueues[GameType.Connect4] = new ConcurrentQueue<string>();
            _matchQueues[GameType.RPS] = new ConcurrentQueue<string>();
            _invites = new ConcurrentDictionary<string, InviteRequest>(StringComparer.OrdinalIgnoreCase);
            _leaderboard = new ConcurrentDictionary<string, LeaderboardEntry>(StringComparer.OrdinalIgnoreCase);
        }

        public void Initialize()
        {
        }

        #region Player & Presence Management
        public Player RegisterPlayer(string connectionId, string displayName)
        {
            if (string.IsNullOrEmpty(connectionId)) return null;

            Player player = _players.AddOrUpdate(connectionId,
                id => new Player(id, displayName),
                (id, existing) =>
                {
                    if (!string.IsNullOrWhiteSpace(displayName))
                    {
                        existing.DisplayName = displayName.Trim();
                    }
                    existing.LastActivity = DateTime.UtcNow;
                    return existing;
                });

            _leaderboard.GetOrAdd(player.DisplayName, name => new LeaderboardEntry { DisplayName = name });
            return player;
        }

        public Player GetPlayer(string connectionId)
        {
            if (string.IsNullOrEmpty(connectionId)) return null;
            Player player;
            _players.TryGetValue(connectionId, out player);
            return player;
        }

        public List<Player> GetOnlinePlayers()
        {
            return _players.Values
                .OrderByDescending(p => p.LastActivity)
                .ToList();
        }

        public Player RemovePlayer(string connectionId)
        {
            if (string.IsNullOrEmpty(connectionId)) return null;
            Player removed;
            _players.TryRemove(connectionId, out removed);
            return removed;
        }
        #endregion

        #region Matchmaking & Invites
        public GameSession EnqueuePlayer(string connectionId, GameType gameType, out bool matched)
        {
            matched = false;
            Player player = GetPlayer(connectionId);
            if (player == null) return null;

            lock (_matchmakingLock)
            {
                player.Status = PlayerStatus.InQueue;
                player.QueuedGameType = gameType;

                ConcurrentQueue<string> queue = _matchQueues.GetOrAdd(gameType, gt => new ConcurrentQueue<string>());

                string opponentId;
                while (queue.TryDequeue(out opponentId))
                {
                    if (opponentId == connectionId) continue;

                    Player opponent = GetPlayer(opponentId);
                    if (opponent != null && opponent.Status == PlayerStatus.InQueue && opponent.QueuedGameType == gameType)
                    {
                        matched = true;
                        GameSession session = CreateSession(gameType, opponent, player);
                        return session;
                    }
                }

                queue.Enqueue(connectionId);
                return null;
            }
        }

        public void DequeuePlayer(string connectionId, GameType gameType)
        {
            Player player = GetPlayer(connectionId);
            if (player != null && player.Status == PlayerStatus.InQueue)
            {
                player.Status = PlayerStatus.Idle;
                player.QueuedGameType = null;
            }
        }

        public InviteRequest CreateInvite(string fromConnectionId, string toConnectionId, GameType gameType)
        {
            Player fromPlayer = GetPlayer(fromConnectionId);
            Player toPlayer = GetPlayer(toConnectionId);

            if (fromPlayer == null || toPlayer == null) return null;

            InviteRequest req = new InviteRequest
            {
                FromPlayer = fromPlayer,
                ToPlayer = toPlayer,
                GameType = gameType
            };

            _invites[req.InviteId] = req;
            return req;
        }

        public InviteRequest GetInvite(string inviteId)
        {
            if (string.IsNullOrEmpty(inviteId)) return null;
            InviteRequest req;
            _invites.TryGetValue(inviteId, out req);
            return req;
        }

        public void RemoveInvite(string inviteId)
        {
            if (string.IsNullOrEmpty(inviteId)) return;
            InviteRequest dummy;
            _invites.TryRemove(inviteId, out dummy);
        }
        #endregion

        #region Session Management & Multi-Page Resilience
        public GameSession CreateSession(GameType gameType, Player p1, Player p2)
        {
            lock (_sessionLock)
            {
                GameSession session = new GameSession(gameType, p1, p2);
                _sessions[session.SessionId] = session;

                p1.Status = PlayerStatus.InGame;
                p1.CurrentSessionId = session.SessionId;
                p1.QueuedGameType = null;

                p2.Status = PlayerStatus.InGame;
                p2.CurrentSessionId = session.SessionId;
                p2.QueuedGameType = null;

                return session;
            }
        }

        public GameSession GetSession(string sessionId)
        {
            if (string.IsNullOrEmpty(sessionId)) return null;
            GameSession session;
            _sessions.TryGetValue(sessionId, out session);
            return session;
        }

        public GameSession GetOrCreateSession(string sessionId, GameType gameType, string connectionId, string playerName, string p1Name, string p2Name)
        {
            if (string.IsNullOrEmpty(sessionId)) return null;

            lock (_sessionLock)
            {
                GameSession session;
                if (!_sessions.TryGetValue(sessionId, out session))
                {
                    // Recreate session dynamically if lost during page navigation
                    Player p1 = new Player("temp_p1", string.IsNullOrEmpty(p1Name) ? "Player 1" : p1Name);
                    Player p2 = new Player("temp_p2", string.IsNullOrEmpty(p2Name) ? "Player 2" : p2Name);

                    session = new GameSession(gameType, p1, p2)
                    {
                        SessionId = sessionId
                    };
                    _sessions[sessionId] = session;
                }

                UpdateSessionPlayerConnection(session, connectionId, playerName);
                return session;
            }
        }

        public void UpdateSessionPlayerConnection(GameSession session, string connectionId, string playerName)
        {
            if (session == null || string.IsNullOrEmpty(connectionId)) return;

            playerName = (playerName ?? string.Empty).Trim();
            Player player = RegisterPlayer(connectionId, playerName);

            bool matchedP1 = false;
            bool matchedP2 = false;

            if (session.Player1 != null)
            {
                if (session.Player1.ConnectionId == connectionId ||
                    (!string.IsNullOrEmpty(playerName) && session.Player1.DisplayName.Equals(playerName, StringComparison.OrdinalIgnoreCase)))
                {
                    matchedP1 = true;
                }
            }

            if (!matchedP1 && session.Player2 != null)
            {
                if (session.Player2.ConnectionId == connectionId ||
                    (!string.IsNullOrEmpty(playerName) && session.Player2.DisplayName.Equals(playerName, StringComparison.OrdinalIgnoreCase)))
                {
                    matchedP2 = true;
                }
            }

            if (matchedP1)
            {
                string oldP1Id = session.Player1 != null ? session.Player1.ConnectionId : null;
                session.Player1 = player;
                session.Player1.ConnectionId = connectionId;
                if (session.CurrentTurnPlayerId == oldP1Id || string.IsNullOrEmpty(session.CurrentTurnPlayerId) || session.CurrentTurnPlayerId.StartsWith("temp_"))
                {
                    session.CurrentTurnPlayerId = connectionId;
                }
            }
            else if (matchedP2)
            {
                string oldP2Id = session.Player2 != null ? session.Player2.ConnectionId : null;
                session.Player2 = player;
                session.Player2.ConnectionId = connectionId;
                if (session.CurrentTurnPlayerId == oldP2Id)
                {
                    session.CurrentTurnPlayerId = connectionId;
                }
            }
            else
            {
                if (session.Player1 == null || session.Player1.ConnectionId == null || session.Player1.ConnectionId.StartsWith("temp_"))
                {
                    string oldId = session.Player1 != null ? session.Player1.ConnectionId : null;
                    session.Player1 = player;
                    session.Player1.ConnectionId = connectionId;
                    if (session.CurrentTurnPlayerId == oldId || string.IsNullOrEmpty(session.CurrentTurnPlayerId) || session.CurrentTurnPlayerId.StartsWith("temp_"))
                    {
                        session.CurrentTurnPlayerId = connectionId;
                    }
                }
                else
                {
                    session.Player2 = player;
                    session.Player2.ConnectionId = connectionId;
                }
            }

            player.CurrentSessionId = session.SessionId;
            player.Status = PlayerStatus.InGame;
        }

        public void RemoveSession(string sessionId)
        {
            if (string.IsNullOrEmpty(sessionId)) return;
            GameSession session;
            if (_sessions.TryRemove(sessionId, out session))
            {
                if (session.Player1 != null && session.Player1.CurrentSessionId == sessionId)
                {
                    session.Player1.Status = PlayerStatus.Idle;
                    session.Player1.CurrentSessionId = null;
                }
                if (session.Player2 != null && session.Player2.CurrentSessionId == sessionId)
                {
                    session.Player2.Status = PlayerStatus.Idle;
                    session.Player2.CurrentSessionId = null;
                }
            }
        }
        #endregion

        #region Game Moves & Logic
        public MoveResult ProcessTicTacToeMove(string sessionId, string connectionId, int cellIndex)
        {
            MoveResult res = new MoveResult { Success = false };
            GameSession session = GetSession(sessionId);

            if (session == null || session.Status != SessionStatus.InProgress)
            {
                res.Message = "Game session not active.";
                return res;
            }

            bool isP1 = (session.Player1 != null && connectionId == session.Player1.ConnectionId);
            bool isP2 = (session.Player2 != null && connectionId == session.Player2.ConnectionId);

            if (!isP1 && !isP2)
            {
                res.Message = "You are not a registered player in this game session.";
                return res;
            }

            if (session.CurrentTurnPlayerId != connectionId)
            {
                res.Message = "Not your turn.";
                return res;
            }

            if (cellIndex < 0 || cellIndex > 8 || !string.IsNullOrEmpty(session.TicTacToeBoard[cellIndex]))
            {
                res.Message = "Invalid cell choice.";
                return res;
            }

            string symbol = isP1 ? "X" : "O";
            session.TicTacToeBoard[cellIndex] = symbol;
            session.LastMoveAt = DateTime.UtcNow;

            res.Success = true;
            res.MoveIndex = cellIndex;
            res.PlayerSymbol = symbol;

            string winnerSymbol = BotAiService.CheckTicTacToeWinner(session.TicTacToeBoard);
            if (!string.IsNullOrEmpty(winnerSymbol))
            {
                session.Status = SessionStatus.Finished;
                session.WinnerPlayerId = connectionId;
                session.WinningPositions = BotAiService.GetTicTacToeWinningLine(session.TicTacToeBoard);

                res.IsGameOver = true;
                res.WinnerPlayerId = connectionId;
                res.WinningLine = session.WinningPositions;

                RecordGameResult(session.Player1, session.Player2, connectionId, false);
                return res;
            }

            bool isFull = session.TicTacToeBoard.All(c => !string.IsNullOrEmpty(c));
            if (isFull)
            {
                session.Status = SessionStatus.Finished;
                session.IsDraw = true;

                res.IsGameOver = true;
                res.IsDraw = true;

                RecordGameResult(session.Player1, session.Player2, null, true);
                return res;
            }

            session.CurrentTurnPlayerId = isP1 ? session.Player2.ConnectionId : session.Player1.ConnectionId;
            res.NextTurnPlayerId = session.CurrentTurnPlayerId;
            return res;
        }

        public MoveResult ProcessConnect4Move(string sessionId, string connectionId, int column)
        {
            MoveResult res = new MoveResult { Success = false };
            GameSession session = GetSession(sessionId);

            if (session == null || session.Status != SessionStatus.InProgress)
            {
                res.Message = "Game session not active.";
                return res;
            }

            bool isP1 = (session.Player1 != null && connectionId == session.Player1.ConnectionId);
            bool isP2 = (session.Player2 != null && connectionId == session.Player2.ConnectionId);

            if (!isP1 && !isP2)
            {
                res.Message = "You are not a registered player in this game session.";
                return res;
            }

            if (session.CurrentTurnPlayerId != connectionId)
            {
                res.Message = "Not your turn.";
                return res;
            }

            if (column < 0 || column >= BotAiService.COLS || session.Connect4Board[0, column] != 0)
            {
                res.Message = "Column is full or invalid.";
                return res;
            }

            int playerNumber = isP1 ? 1 : 2;
            int placedRow = BotAiService.DropDisc(session.Connect4Board, column, playerNumber);
            session.LastMoveAt = DateTime.UtcNow;

            res.Success = true;
            res.Col = column;
            res.Row = placedRow;
            res.PlayerSymbol = playerNumber.ToString();

            if (BotAiService.CheckConnect4Win(session.Connect4Board, playerNumber))
            {
                session.Status = SessionStatus.Finished;
                session.WinnerPlayerId = connectionId;
                session.WinningPositions = BotAiService.GetConnect4WinningCells(session.Connect4Board, playerNumber);

                res.IsGameOver = true;
                res.WinnerPlayerId = connectionId;
                res.WinningLine = session.WinningPositions;

                RecordGameResult(session.Player1, session.Player2, connectionId, false);
                return res;
            }

            List<int> validCols = BotAiService.GetValidConnect4Columns(session.Connect4Board);
            if (validCols.Count == 0)
            {
                session.Status = SessionStatus.Finished;
                session.IsDraw = true;

                res.IsGameOver = true;
                res.IsDraw = true;

                RecordGameResult(session.Player1, session.Player2, null, true);
                return res;
            }

            session.CurrentTurnPlayerId = isP1 ? session.Player2.ConnectionId : session.Player1.ConnectionId;
            res.NextTurnPlayerId = session.CurrentTurnPlayerId;
            return res;
        }

        public MoveResult ProcessRPSChoice(string sessionId, string connectionId, string choice)
        {
            MoveResult res = new MoveResult { Success = false };
            GameSession session = GetSession(sessionId);

            if (session == null || session.Status != SessionStatus.InProgress)
            {
                res.Message = "Game session not active.";
                return res;
            }

            bool isP1 = (session.Player1 != null && connectionId == session.Player1.ConnectionId);
            bool isP2 = (session.Player2 != null && connectionId == session.Player2.ConnectionId);

            if (!isP1 && !isP2)
            {
                res.Message = "You are not a registered player in this game session.";
                return res;
            }

            choice = (choice ?? "rock").ToLowerInvariant().Trim();
            if (choice != "rock" && choice != "paper" && choice != "scissors")
            {
                choice = "rock";
            }

            if (isP1) session.Player1CurrentChoice = choice;
            else session.Player2CurrentChoice = choice;

            // Check if both made choices
            if (!string.IsNullOrEmpty(session.Player1CurrentChoice) && !string.IsNullOrEmpty(session.Player2CurrentChoice))
            {
                int roundWinnerCode = BotAiService.DetermineRPSWinner(session.Player1CurrentChoice, session.Player2CurrentChoice);
                string roundWinnerId = null;
                bool isRoundDraw = (roundWinnerCode == 0);

                if (roundWinnerCode == 1)
                {
                    session.Player1Score++;
                    roundWinnerId = session.Player1.ConnectionId;
                }
                else if (roundWinnerCode == 2)
                {
                    session.Player2Score++;
                    roundWinnerId = session.Player2.ConnectionId;
                }

                RPSRoundResult roundResult = new RPSRoundResult
                {
                    RoundNumber = session.CurrentRound,
                    Player1Choice = session.Player1CurrentChoice,
                    Player2Choice = session.Player2CurrentChoice,
                    Player1ConnectionId = session.Player1.ConnectionId,
                    Player2ConnectionId = session.Player2.ConnectionId,
                    WinnerPlayerId = roundWinnerId,
                    WinnerPlayerNumber = roundWinnerCode,
                    IsDraw = isRoundDraw,
                    P1ScoreAfterRound = session.Player1Score,
                    P2ScoreAfterRound = session.Player2Score
                };

                session.RpsRoundHistory.Add(roundResult);

                res.Success = true;
                res.ExtraData = roundResult;

                if (session.Player1Score >= 3 || session.Player2Score >= 3)
                {
                    session.Status = SessionStatus.Finished;
                    session.WinnerPlayerId = (session.Player1Score >= 3) ? session.Player1.ConnectionId : session.Player2.ConnectionId;

                    res.IsGameOver = true;
                    res.WinnerPlayerId = session.WinnerPlayerId;

                    RecordGameResult(session.Player1, session.Player2, session.WinnerPlayerId, false);
                }
                else
                {
                    session.CurrentRound++;
                    session.Player1CurrentChoice = null;
                    session.Player2CurrentChoice = null;
                }

                return res;
            }

            res.Success = true;
            res.Message = "Choice locked. Waiting for opponent.";
            return res;
        }

        public bool RequestRematch(string sessionId, string connectionId, out GameSession session)
        {
            session = GetSession(sessionId);
            if (session == null) return false;

            if (connectionId == session.Player1.ConnectionId)
            {
                session.Player1WantsRematch = true;
            }
            else if (connectionId == session.Player2.ConnectionId)
            {
                session.Player2WantsRematch = true;
            }

            if (session.Player1WantsRematch && session.Player2WantsRematch)
            {
                session.InitBoard();
                session.Status = SessionStatus.InProgress;
                return true;
            }

            return false;
        }

        public void UpdateAirHockeyPaddle(string sessionId, string connectionId, float x, float y, int playerNum)
        {
            GameSession session = GetSession(sessionId);
            if (session == null || session.Status != SessionStatus.InProgress) return;

            if (playerNum == 1 || (session.Player1 != null && session.Player1.ConnectionId == connectionId))
            {
                session.P1PaddleX = Math.Max(32f, Math.Min(368f, x));
                session.P1PaddleY = Math.Max(32f, Math.Min(448f, y));
            }
            else
            {
                session.P2PaddleX = Math.Max(432f, Math.Min(768f, x));
                session.P2PaddleY = Math.Max(32f, Math.Min(448f, y));
            }
        }

        public object TickAirHockey(string sessionId, out bool isGoal, out int scoringPlayer, out bool isGameOver)
        {
            isGoal = false;
            scoringPlayer = 0;
            isGameOver = false;

            GameSession session = GetSession(sessionId);
            if (session == null || session.Status != SessionStatus.InProgress) return null;

            if (DateTime.UtcNow < session.AirHockeyPausedUntil)
            {
                return new
                {
                    p1X = session.P1PaddleX,
                    p1Y = session.P1PaddleY,
                    p2X = session.P2PaddleX,
                    p2Y = session.P2PaddleY,
                    puckX = session.PuckX,
                    puckY = session.PuckY,
                    puckVx = session.PuckVx,
                    puckVy = session.PuckVy,
                    p1Score = session.Player1Score,
                    p2Score = session.Player2Score,
                    isGoal = false,
                    scoringPlayer = 0
                };
            }

            // Apply friction
            session.PuckVx *= 0.993f;
            session.PuckVy *= 0.993f;

            if (Math.Abs(session.PuckVx) < 0.05f) session.PuckVx = 0f;
            if (Math.Abs(session.PuckVy) < 0.05f) session.PuckVy = 0f;

            // Move puck
            session.PuckX += session.PuckVx;
            session.PuckY += session.PuckVy;

            // Paddle 1 collision
            ResolvePaddleCollision(session, session.P1PaddleX, session.P1PaddleY);
            // Paddle 2 collision
            ResolvePaddleCollision(session, session.P2PaddleX, session.P2PaddleY);

            // Wall bounces
            float r = 18f;
            if (session.PuckY - r < 0)
            {
                session.PuckY = r;
                session.PuckVy = -session.PuckVy * 0.96f;
            }
            else if (session.PuckY + r > 480f)
            {
                session.PuckY = 480f - r;
                session.PuckVy = -session.PuckVy * 0.96f;
            }

            bool inGoalY = (session.PuckY >= 150f && session.PuckY <= 330f);
            if (!inGoalY)
            {
                if (session.PuckX - r < 0)
                {
                    session.PuckX = r;
                    session.PuckVx = -session.PuckVx * 0.96f;
                }
                else if (session.PuckX + r > 800f)
                {
                    session.PuckX = 800f - r;
                    session.PuckVx = -session.PuckVx * 0.96f;
                }
            }
            else
            {
                // Goal check
                if (session.PuckX < -r)
                {
                    // Goal on left -> Player 2 scores
                    session.Player2Score++;
                    isGoal = true;
                    scoringPlayer = 2;
                    session.ResetAirHockeyPuck(2);
                }
                else if (session.PuckX > 800f + r)
                {
                    // Goal on right -> Player 1 scores
                    session.Player1Score++;
                    isGoal = true;
                    scoringPlayer = 1;
                    session.ResetAirHockeyPuck(1);
                }

                if (session.Player1Score >= GameSession.AIR_HOCKEY_WIN_SCORE || session.Player2Score >= GameSession.AIR_HOCKEY_WIN_SCORE)
                {
                    session.Status = SessionStatus.Finished;
                    session.WinnerPlayerId = (session.Player1Score >= GameSession.AIR_HOCKEY_WIN_SCORE) 
                        ? (session.Player1 != null ? session.Player1.ConnectionId : null) 
                        : (session.Player2 != null ? session.Player2.ConnectionId : null);
                    isGameOver = true;
                    RecordGameResult(session.Player1, session.Player2, session.WinnerPlayerId, false);
                }
            }

            return new
            {
                p1X = session.P1PaddleX,
                p1Y = session.P1PaddleY,
                p2X = session.P2PaddleX,
                p2Y = session.P2PaddleY,
                puckX = session.PuckX,
                puckY = session.PuckY,
                puckVx = session.PuckVx,
                puckVy = session.PuckVy,
                p1Score = session.Player1Score,
                p2Score = session.Player2Score,
                isGoal = isGoal,
                scoringPlayer = scoringPlayer
            };
        }

        private static void ResolvePaddleCollision(GameSession session, float padX, float padY)
        {
            float dx = session.PuckX - padX;
            float dy = session.PuckY - padY;
            float distSq = dx * dx + dy * dy;
            float minDist = 32f + 18f; // paddle radius + puck radius

            if (distSq < minDist * minDist && distSq > 0)
            {
                float dist = (float)Math.Sqrt(distSq);
                float nx = dx / dist;
                float ny = dy / dist;

                float overlap = minDist - dist;
                session.PuckX += nx * overlap;
                session.PuckY += ny * overlap;

                float p = 2 * (nx * session.PuckVx + ny * session.PuckVy);
                if (p < 0)
                {
                    session.PuckVx -= p * nx * 1.05f;
                    session.PuckVy -= p * ny * 1.05f;

                    float speed = (float)Math.Sqrt(session.PuckVx * session.PuckVx + session.PuckVy * session.PuckVy);
                    if (speed > 26f)
                    {
                        session.PuckVx = (session.PuckVx / speed) * 26f;
                        session.PuckVy = (session.PuckVy / speed) * 26f;
                    }
                    else if (speed < 4.0f)
                    {
                        session.PuckVx = (session.PuckVx / (speed > 0.01f ? speed : 1f)) * 4.0f;
                        session.PuckVy = (session.PuckVy / (speed > 0.01f ? speed : 1f)) * 4.0f;
                    }
                }
            }
        }

        public MoveResult ProcessArcheryShot(string sessionId, string connectionId, float aimX, float aimY, float power)
        {
            GameSession session = GetSession(sessionId);
            if (session == null)
            {
                return new MoveResult { Success = false, Message = "Session not found." };
            }

            if (session.Status != SessionStatus.InProgress)
            {
                return new MoveResult { Success = false, Message = "Game is already finished." };
            }

            if (session.CurrentTurnPlayerId != connectionId)
            {
                return new MoveResult { Success = false, Message = "It's not your turn to shoot!" };
            }

            bool isP1 = (session.Player1 != null && session.Player1.ConnectionId == connectionId);
            ArcheryShotResult shot = BotAiService.CalculateArcheryShot(aimX, aimY, power, session.CurrentWindX, session.CurrentWindY);

            if (isP1)
            {
                session.Player1Score += shot.Score;
                session.Player1ArcheryShots.Add(shot.Score);
                session.CurrentTurnPlayerId = (session.Player2 != null) ? session.Player2.ConnectionId : null;
            }
            else
            {
                session.Player2Score += shot.Score;
                session.Player2ArcheryShots.Add(shot.Score);
                session.CurrentRound++;
                session.CurrentWindX = GameSession.GenerateRandomWind();
                session.CurrentWindY = (float)Math.Round(GameSession.GenerateRandomWind() * 0.5f, 1);
                session.CurrentTurnPlayerId = (session.Player1 != null) ? session.Player1.ConnectionId : null;
            }

            bool isGameOver = (session.CurrentRound > GameSession.ARCHERY_TOTAL_ROUNDS);
            string winnerId = null;
            bool isDraw = false;

            if (isGameOver)
            {
                session.Status = SessionStatus.Finished;
                if (session.Player1Score > session.Player2Score)
                {
                    winnerId = session.Player1 != null ? session.Player1.ConnectionId : null;
                }
                else if (session.Player2Score > session.Player1Score)
                {
                    winnerId = session.Player2 != null ? session.Player2.ConnectionId : null;
                }
                else
                {
                    isDraw = true;
                }
                session.WinnerPlayerId = winnerId;
                session.IsDraw = isDraw;
                RecordGameResult(session.Player1, session.Player2, winnerId, isDraw);
            }

            session.LastMoveAt = DateTime.UtcNow;

            return new MoveResult
            {
                Success = true,
                IsGameOver = isGameOver,
                WinnerPlayerId = winnerId,
                IsDraw = isDraw,
                NextTurnPlayerId = session.CurrentTurnPlayerId,
                PlayerSymbol = isP1 ? "1" : "2",
                ExtraData = new
                {
                    aimX = shot.AimX,
                    aimY = shot.AimY,
                    hitX = shot.HitX,
                    hitY = shot.HitY,
                    power = shot.Power,
                    distance = shot.Distance,
                    scoreEarned = shot.Score,
                    ringName = shot.RingName,
                    ringColor = shot.RingColor,
                    isBullseye = shot.IsBullseye,
                    isXRing = shot.IsXRing,
                    flightTime = shot.FlightTime,
                    shooterPlayerNum = isP1 ? 1 : 2,
                    p1Total = session.Player1Score,
                    p2Total = session.Player2Score,
                    currentRound = Math.Min(GameSession.ARCHERY_TOTAL_ROUNDS, session.CurrentRound),
                    nextWindX = session.CurrentWindX,
                    nextWindY = session.CurrentWindY,
                    p1Shots = session.Player1ArcheryShots,
                    p2Shots = session.Player2ArcheryShots
                }
            };
        }

        public GameSession ForfeitSession(string sessionId, string forfeitingConnectionId)
        {
            GameSession session = GetSession(sessionId);
            if (session == null || session.Status != SessionStatus.InProgress) return null;

            session.Status = SessionStatus.Finished;
            string winnerId = (forfeitingConnectionId == session.Player1.ConnectionId) 
                ? (session.Player2 != null ? session.Player2.ConnectionId : null) 
                : (session.Player1 != null ? session.Player1.ConnectionId : null);

            session.WinnerPlayerId = winnerId;
            RecordGameResult(session.Player1, session.Player2, winnerId, false);

            return session;
        }

        public void RecordGameResult(Player p1, Player p2, string winnerConnectionId, bool isDraw)
        {
            if (p1 == null || p2 == null) return;

            LeaderboardEntry entry1 = _leaderboard.GetOrAdd(p1.DisplayName, name => new LeaderboardEntry { DisplayName = name });
            LeaderboardEntry entry2 = _leaderboard.GetOrAdd(p2.DisplayName, name => new LeaderboardEntry { DisplayName = name });

            if (isDraw)
            {
                p1.Draws++;
                p2.Draws++;
                entry1.Draws++;
                entry2.Draws++;
            }
            else if (winnerConnectionId == p1.ConnectionId)
            {
                p1.Wins++;
                p2.Losses++;
                entry1.Wins++;
                entry2.Losses++;
            }
            else if (winnerConnectionId == p2.ConnectionId)
            {
                p2.Wins++;
                p1.Losses++;
                entry2.Wins++;
                entry1.Losses++;
            }
        }

        public List<LeaderboardEntry> GetLeaderboard()
        {
            return _leaderboard.Values
                .OrderByDescending(e => e.Points)
                .ThenByDescending(e => e.Wins)
                .Take(20)
                .ToList();
        }
        #endregion

        #region 2048 Single-Player High-Score Leaderboard
        private readonly List<Score2048Record> _leaderboard2048 = new List<Score2048Record>();
        private readonly object _lock2048 = new object();

        public List<Score2048Record> Get2048Leaderboard()
        {
            lock (_lock2048)
            {
                return _leaderboard2048.OrderByDescending(s => s.Score).Take(10).ToList();
            }
        }

        public Score2048Record Save2048Score(string playerName, int score, int bestTile)
        {
            if (string.IsNullOrWhiteSpace(playerName)) playerName = "Player";
            Score2048Record rec = new Score2048Record
            {
                PlayerName = playerName.Trim(),
                Score = score,
                BestTile = bestTile,
                Date = DateTime.UtcNow
            };

            lock (_lock2048)
            {
                _leaderboard2048.Add(rec);
                var sorted = _leaderboard2048.OrderByDescending(s => s.Score).Take(50).ToList();
                _leaderboard2048.Clear();
                _leaderboard2048.AddRange(sorted);
            }

            return rec;
        }
        #endregion

        #region Brick Blast Single-Player High-Score Leaderboard
        private readonly List<ScoreBrickBlastRecord> _leaderboardBrickBlast = new List<ScoreBrickBlastRecord>();
        private readonly object _lockBrickBlast = new object();

        public List<ScoreBrickBlastRecord> GetBrickBlastLeaderboard()
        {
            lock (_lockBrickBlast)
            {
                return _leaderboardBrickBlast
                    .OrderByDescending(s => s.Score)
                    .ThenByDescending(s => s.LevelReached)
                    .Take(10)
                    .ToList();
            }
        }

        public ScoreBrickBlastRecord SaveBrickBlastScore(string playerName, int score, int levelReached)
        {
            if (string.IsNullOrWhiteSpace(playerName)) playerName = "Player";
            ScoreBrickBlastRecord rec = new ScoreBrickBlastRecord
            {
                PlayerName = playerName.Trim(),
                Score = score,
                LevelReached = levelReached,
                Date = DateTime.UtcNow
            };

            lock (_lockBrickBlast)
            {
                _leaderboardBrickBlast.Add(rec);
                var sorted = _leaderboardBrickBlast
                    .OrderByDescending(s => s.Score)
                    .ThenByDescending(s => s.LevelReached)
                    .Take(50)
                    .ToList();
                _leaderboardBrickBlast.Clear();
                _leaderboardBrickBlast.AddRange(sorted);
            }

            return rec;
        }
        #endregion

        #region Knife Throw Single-Player High-Score Leaderboard
        private readonly List<ScoreKnifeThrowRecord> _leaderboardKnifeThrow = new List<ScoreKnifeThrowRecord>();
        private readonly object _lockKnifeThrow = new object();

        public List<ScoreKnifeThrowRecord> GetKnifeThrowLeaderboard()
        {
            lock (_lockKnifeThrow)
            {
                return _leaderboardKnifeThrow
                    .OrderByDescending(s => s.Score)
                    .ThenByDescending(s => s.LevelReached)
                    .Take(10)
                    .ToList();
            }
        }

        public ScoreKnifeThrowRecord SaveKnifeThrowScore(string playerName, int score, int levelReached)
        {
            if (string.IsNullOrWhiteSpace(playerName)) playerName = "Player";
            ScoreKnifeThrowRecord rec = new ScoreKnifeThrowRecord
            {
                PlayerName = playerName.Trim(),
                Score = score,
                LevelReached = levelReached,
                Date = DateTime.UtcNow
            };

            lock (_lockKnifeThrow)
            {
                _leaderboardKnifeThrow.Add(rec);
                var sorted = _leaderboardKnifeThrow
                    .OrderByDescending(s => s.Score)
                    .ThenByDescending(s => s.LevelReached)
                    .Take(50)
                    .ToList();
                _leaderboardKnifeThrow.Clear();
                _leaderboardKnifeThrow.AddRange(sorted);
            }

            return rec;
        }
        #endregion
    }

    public class Score2048Record
    {
        public string PlayerName { get; set; }
        public int Score { get; set; }
        public int BestTile { get; set; }
        public DateTime Date { get; set; }
        public string FormattedDate { get { return Date.ToString("MMM d, HH:mm"); } }
    }

    public class ScoreBrickBlastRecord
    {
        public string PlayerName { get; set; }
        public int Score { get; set; }
        public int LevelReached { get; set; }
        public DateTime Date { get; set; }
        public string FormattedDate { get { return Date.ToString("MMM d, HH:mm"); } }
    }

    public class ScoreKnifeThrowRecord
    {
        public string PlayerName { get; set; }
        public int Score { get; set; }
        public int LevelReached { get; set; }
        public DateTime Date { get; set; }
        public string FormattedDate { get { return Date.ToString("MMM d, HH:mm"); } }
    }
}
