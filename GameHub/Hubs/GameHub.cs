using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using GameHub.Models;
using GameHub.Services;

namespace GameHub.Hubs
{
    public class GameHub : Hub
    {
        private GameManager Manager { get { return GameManager.Instance; } }

        #region Connection Lifecycle & Presence
        public override Task OnConnected()
        {
            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            Manager.RemovePlayer(Context.ConnectionId);
            Clients.All.updateOnlinePlayers(Manager.GetOnlinePlayers());
            Clients.All.updateLeaderboard(Manager.GetLeaderboard());
            return base.OnDisconnected(stopCalled);
        }

        public Player Register(string displayName)
        {
            Player p = Manager.RegisterPlayer(Context.ConnectionId, displayName);
            Groups.Add(Context.ConnectionId, "lobby");
            Clients.All.updateOnlinePlayers(Manager.GetOnlinePlayers());
            Clients.All.updateLeaderboard(Manager.GetLeaderboard());
            return p;
        }

        public List<Player> GetOnlinePlayers()
        {
            return Manager.GetOnlinePlayers();
        }

        public List<LeaderboardEntry> GetLeaderboard()
        {
            return Manager.GetLeaderboard();
        }
        #endregion

        #region Matchmaking & Direct Challenges
        public void JoinMatchmaking(int gameTypeVal)
        {
            GameType gameType = (GameType)gameTypeVal;
            bool matched;
            GameSession session = Manager.EnqueuePlayer(Context.ConnectionId, gameType, out matched);

            if (matched && session != null)
            {
                string groupName = "session_" + session.SessionId;
                Groups.Add(session.Player1.ConnectionId, groupName);
                Groups.Add(session.Player2.ConnectionId, groupName);

                var matchData = new
                {
                    sessionId = session.SessionId,
                    gameType = (int)session.GameType,
                    player1 = session.Player1,
                    player2 = session.Player2,
                    currentTurn = session.CurrentTurnPlayerId
                };

                Clients.Client(session.Player1.ConnectionId).matchFound(matchData);
                Clients.Client(session.Player2.ConnectionId).matchFound(matchData);

                Clients.All.updateOnlinePlayers(Manager.GetOnlinePlayers());
            }
            else
            {
                Clients.Caller.queueJoined(new { gameType = (int)gameType });
                Clients.All.updateOnlinePlayers(Manager.GetOnlinePlayers());
            }
        }

        public void LeaveMatchmaking(int gameTypeVal)
        {
            GameType gameType = (GameType)gameTypeVal;
            Manager.DequeuePlayer(Context.ConnectionId, gameType);
            Clients.Caller.queueLeft(new { gameType = (int)gameType });
            Clients.All.updateOnlinePlayers(Manager.GetOnlinePlayers());
        }

        public void SendInvite(string targetConnectionId, int gameTypeVal, string customGameId = null, string customGameTitle = null)
        {
            GameType gameType = (GameType)gameTypeVal;
            InviteRequest invite = Manager.CreateInvite(Context.ConnectionId, targetConnectionId, gameType, customGameId, customGameTitle);
            if (invite != null)
            {
                Clients.Client(targetConnectionId).inviteReceived(new
                {
                    inviteId = invite.InviteId,
                    fromPlayer = invite.FromPlayer,
                    gameType = (int)invite.GameType,
                    customGameId = invite.CustomGameId,
                    customGameTitle = invite.CustomGameTitle
                });
                Clients.Caller.inviteSent(new { toPlayerName = invite.ToPlayer.DisplayName });
            }
        }

        public object AcceptInvite(string inviteId)
        {
            InviteRequest invite = Manager.GetInvite(inviteId);
            if (invite != null)
            {
                Manager.RemoveInvite(inviteId);

                // Ensure Player 2 connection ID is updated to caller's current connection
                Player callerPlayer = Manager.GetPlayer(Context.ConnectionId);
                Player p2 = invite.ToPlayer ?? callerPlayer;
                if (p2 != null) p2.ConnectionId = Context.ConnectionId;

                GameSession session = Manager.CreateSession(invite.GameType, invite.FromPlayer, p2, invite.CustomGameId);

                string groupName = "session_" + session.SessionId;
                Groups.Add(session.Player1.ConnectionId, groupName);
                Groups.Add(Context.ConnectionId, groupName);

                var matchData = new
                {
                    sessionId = session.SessionId,
                    gameType = (int)session.GameType,
                    customGameId = session.CustomGameId,
                    player1 = session.Player1,
                    player2 = session.Player2,
                    currentTurn = session.CurrentTurnPlayerId
                };

                // Send to challenger (Player 1)
                Clients.Client(session.Player1.ConnectionId).matchFound(matchData);

                // Send to caller (Player 2)
                Clients.Caller.matchFound(matchData);

                // Send to session group
                Clients.Group(groupName).matchFound(matchData);

                Clients.All.updateOnlinePlayers(Manager.GetOnlinePlayers());

                return matchData;
            }
            return null;
        }

        public void DeclineInvite(string inviteId)
        {
            InviteRequest invite = Manager.GetInvite(inviteId);
            if (invite != null)
            {
                Manager.RemoveInvite(inviteId);
                Clients.Client(invite.FromPlayer.ConnectionId).inviteDeclined(new
                {
                    declinedByName = invite.ToPlayer.DisplayName
                });
            }
        }
        #endregion

        #region Game In-Session Methods
        public Task JoinSession(string sessionId, string playerName, int gameTypeVal, string p1Name, string p2Name)
        {
            GameType gameType = (GameType)gameTypeVal;
            GameSession session = Manager.GetOrCreateSession(sessionId, gameType, Context.ConnectionId, playerName, p1Name, p2Name);
            if (session != null)
            {
                Groups.Add(Context.ConnectionId, "session_" + sessionId);

                bool isCallerP1 = (session.Player1 != null && session.Player1.ConnectionId == Context.ConnectionId);

                int[] flatC4 = null;
                if (session.Connect4Board != null)
                {
                    flatC4 = new int[42];
                    for (int r = 0; r < 6; r++)
                    {
                        for (int c = 0; c < 7; c++)
                        {
                            flatC4[r * 7 + c] = session.Connect4Board[r, c];
                        }
                    }
                }

                Clients.Caller.sessionState(new
                {
                    sessionId = session.SessionId,
                    gameType = (int)session.GameType,
                    player1 = session.Player1,
                    player2 = session.Player2,
                    currentTurn = session.CurrentTurnPlayerId,
                    isYourTurn = (session.CurrentTurnPlayerId == Context.ConnectionId),
                    isP1 = isCallerP1,
                    yourSymbol = isCallerP1 ? "X" : "O",
                    yourNumber = isCallerP1 ? 1 : 2,
                    status = (int)session.Status,
                    p1Score = session.Player1Score,
                    p2Score = session.Player2Score,
                    round = session.CurrentRound,
                    tttBoard = session.TicTacToeBoard,
                    c4Board = flatC4,
                    archeryWindX = session.CurrentWindX,
                    archeryWindY = session.CurrentWindY,
                    p1Shots = session.Player1ArcheryShots,
                    p2Shots = session.Player2ArcheryShots,
                    chessFen = session.ChessFen,
                    chessMoveHistory = session.ChessMoveHistory,
                    chessCapturedWhite = session.ChessCapturedWhite,
                    chessCapturedBlack = session.ChessCapturedBlack
                });

                Clients.OthersInGroup("session_" + sessionId).opponentEnteredSession(new
                {
                    displayName = playerName,
                    player1 = session.Player1,
                    player2 = session.Player2,
                    currentTurn = session.CurrentTurnPlayerId
                });
            }

            return Task.FromResult(0);
        }

        public void MakeTicTacToeMove(string sessionId, int cellIndex)
        {
            MoveResult res = Manager.ProcessTicTacToeMove(sessionId, Context.ConnectionId, cellIndex);
            if (res.Success)
            {
                Clients.Group("session_" + sessionId).ticTacToeMoveMade(res);
                if (res.IsGameOver)
                {
                    Clients.All.updateLeaderboard(Manager.GetLeaderboard());
                }
            }
            else
            {
                Clients.Caller.moveError(res.Message);
            }
        }

        public void MakeConnect4Move(string sessionId, int column)
        {
            MoveResult res = Manager.ProcessConnect4Move(sessionId, Context.ConnectionId, column);
            if (res.Success)
            {
                Clients.Group("session_" + sessionId).connect4MoveMade(res);
                if (res.IsGameOver)
                {
                    Clients.All.updateLeaderboard(Manager.GetLeaderboard());
                }
            }
            else
            {
                Clients.Caller.moveError(res.Message);
            }
        }

        public void MakeRPSChoice(string sessionId, string choice)
        {
            MoveResult res = Manager.ProcessRPSChoice(sessionId, Context.ConnectionId, choice);
            if (res.Success)
            {
                if (res.ExtraData != null)
                {
                    Clients.Group("session_" + sessionId).rpsRoundCompleted(res);
                    if (res.IsGameOver)
                    {
                        Clients.All.updateLeaderboard(Manager.GetLeaderboard());
                    }
                }
                else
                {
                    Clients.Caller.rpsChoiceLocked();
                    Clients.OthersInGroup("session_" + sessionId).opponentReady();
                }
            }
            else
            {
                Clients.Caller.moveError(res.Message);
            }
        }

        public void UpdateAirHockeyPaddle(string sessionId, float x, float y, float vx, float vy, int playerNum)
        {
            Clients.OthersInGroup("session_" + sessionId).opponentPaddleMoved(new
            {
                x = x,
                y = y,
                vx = vx,
                vy = vy,
                playerNum = playerNum
            });
        }

        public void AirHockeyPuckHit(string sessionId, float px, float py, float pvx, float pvy, int playerNum)
        {
            Clients.OthersInGroup("session_" + sessionId).puckHit(new
            {
                px = px,
                py = py,
                pvx = pvx,
                pvy = pvy,
                playerNum = playerNum
            });
        }

        public void AirHockeySyncPuck(string sessionId, float px, float py, float pvx, float pvy, int playerNum)
        {
            Clients.OthersInGroup("session_" + sessionId).puckSynced(new
            {
                px = px,
                py = py,
                pvx = pvx,
                pvy = pvy,
                playerNum = playerNum
            });
        }

        public void AirHockeyGoalScored(string sessionId, int scorerNum, int p1Score, int p2Score)
        {
            Clients.Group("session_" + sessionId).goalScored(new
            {
                scorerNum = scorerNum,
                p1Score = p1Score,
                p2Score = p2Score
            });

            if (p1Score >= GameSession.AIR_HOCKEY_WIN_SCORE || p2Score >= GameSession.AIR_HOCKEY_WIN_SCORE)
            {
                GameSession session = Manager.GetSession(sessionId);
                if (session != null && session.Status == SessionStatus.InProgress)
                {
                    session.Status = SessionStatus.Finished;
                    session.Player1Score = p1Score;
                    session.Player2Score = p2Score;
                    session.WinnerPlayerId = (p1Score >= GameSession.AIR_HOCKEY_WIN_SCORE)
                        ? (session.Player1 != null ? session.Player1.ConnectionId : null)
                        : (session.Player2 != null ? session.Player2.ConnectionId : null);
                    Manager.ForfeitSession(sessionId, ""); // will record match to leaderboard
                    Clients.All.updateLeaderboard(Manager.GetLeaderboard());
                }
            }
        }

        public void ShootArcheryArrow(string sessionId, float aimX, float aimY, float power)
        {
            MoveResult res = Manager.ProcessArcheryShot(sessionId, Context.ConnectionId, aimX, aimY, power);
            if (res.Success)
            {
                Clients.Group("session_" + sessionId).archeryShotTaken(res);
                if (res.IsGameOver)
                {
                    Clients.All.updateLeaderboard(Manager.GetLeaderboard());
                }
            }
            else
            {
                Clients.Caller.moveError(res.Message);
            }
        }

        #region Chess Hub Methods
        public void MakeChessMove(string sessionId, string fromSq, string toSq, string promotion, string fen, string san, bool isCheck, bool isCheckmate, bool isDraw, string capturedPiece)
        {
            GameSession session = Manager.GetSession(sessionId);
            if (session == null || session.Status != SessionStatus.InProgress)
            {
                Clients.Caller.moveError("Invalid or inactive session.");
                return;
            }

            if (session.CurrentTurnPlayerId != Context.ConnectionId)
            {
                Clients.Caller.moveError("It is not your turn.");
                return;
            }

            session.ChessFen = fen;
            if (!string.IsNullOrEmpty(san)) session.ChessMoveHistory.Add(san);

            if (!string.IsNullOrEmpty(capturedPiece))
            {
                if (session.Player1 != null && Context.ConnectionId == session.Player1.ConnectionId)
                    session.ChessCapturedBlack.Add(capturedPiece);
                else if (session.Player2 != null)
                    session.ChessCapturedWhite.Add(capturedPiece);
            }

            session.LastMoveAt = DateTime.UtcNow;

            if (isCheckmate)
            {
                session.Status = SessionStatus.Finished;
                session.WinnerPlayerId = Context.ConnectionId;
                session.IsDraw = false;
                Manager.RecordGameResult(session.Player1, session.Player2, Context.ConnectionId, false);
                Clients.All.updateLeaderboard(Manager.GetLeaderboard());
            }
            else if (isDraw)
            {
                session.Status = SessionStatus.Finished;
                session.WinnerPlayerId = null;
                session.IsDraw = true;
                Manager.RecordGameResult(session.Player1, session.Player2, null, true);
                Clients.All.updateLeaderboard(Manager.GetLeaderboard());
            }
            else
            {
                session.CurrentTurnPlayerId = (session.Player1 != null && session.CurrentTurnPlayerId == session.Player1.ConnectionId)
                    ? (session.Player2 != null ? session.Player2.ConnectionId : null)
                    : (session.Player1 != null ? session.Player1.ConnectionId : null);
            }

            Clients.Group("session_" + sessionId).chessMoveMade(new
            {
                from = fromSq,
                to = toSq,
                promotion = promotion,
                fen = fen,
                san = san,
                isCheck = isCheck,
                isCheckmate = isCheckmate,
                isDraw = isDraw,
                capturedPiece = capturedPiece,
                nextTurnPlayerId = session.CurrentTurnPlayerId,
                winnerPlayerId = session.WinnerPlayerId,
                status = (int)session.Status
            });
        }

        public void OfferChessDraw(string sessionId)
        {
            GameSession session = Manager.GetSession(sessionId);
            if (session == null || session.Status != SessionStatus.InProgress) return;

            session.ChessDrawOfferedBy = Context.ConnectionId;
            Clients.OthersInGroup("session_" + sessionId).drawOfferReceived(new
            {
                offeredBy = Context.ConnectionId
            });
        }

        public void RespondChessDraw(string sessionId, bool accept)
        {
            GameSession session = Manager.GetSession(sessionId);
            if (session == null || session.Status != SessionStatus.InProgress) return;

            if (accept)
            {
                session.Status = SessionStatus.Finished;
                session.WinnerPlayerId = null;
                session.IsDraw = true;
                Manager.RecordGameResult(session.Player1, session.Player2, null, true);
                Clients.All.updateLeaderboard(Manager.GetLeaderboard());

                Clients.Group("session_" + sessionId).chessGameOver(new
                {
                    reason = "Draw by Mutual Agreement",
                    isDraw = true,
                    winnerPlayerId = (string)null
                });
            }
            else
            {
                session.ChessDrawOfferedBy = null;
                Clients.OthersInGroup("session_" + sessionId).drawOfferDeclined();
            }
        }

        public void ResignChess(string sessionId)
        {
            GameSession session = Manager.GetSession(sessionId);
            if (session == null || session.Status != SessionStatus.InProgress) return;

            string winnerId = (session.Player1 != null && session.Player1.ConnectionId == Context.ConnectionId)
                ? (session.Player2 != null ? session.Player2.ConnectionId : null)
                : (session.Player1 != null ? session.Player1.ConnectionId : null);

            session.Status = SessionStatus.Finished;
            session.WinnerPlayerId = winnerId;
            session.IsDraw = false;
            Manager.RecordGameResult(session.Player1, session.Player2, winnerId, false);
            Clients.All.updateLeaderboard(Manager.GetLeaderboard());

            Clients.Group("session_" + sessionId).chessGameOver(new
            {
                reason = "Opponent Resigned",
                isDraw = false,
                winnerPlayerId = winnerId
            });
        }
        #endregion

        public void RequestRematch(string sessionId)
        {
            GameSession session;
            bool bothAgreed = Manager.RequestRematch(sessionId, Context.ConnectionId, out session);

            if (session != null)
            {
                if (bothAgreed)
                {
                    Clients.Group("session_" + sessionId).rematchStarted(new
                    {
                        sessionId = session.SessionId,
                        gameType = (int)session.GameType,
                        currentTurn = session.CurrentTurnPlayerId,
                        round = session.CurrentRound
                    });
                }
                else
                {
                    Clients.OthersInGroup("session_" + sessionId).rematchRequested(new
                    {
                        requestingConnectionId = Context.ConnectionId
                    });
                }
            }
        }

        public void LeaveGame(string sessionId)
        {
            GameSession session = Manager.ForfeitSession(sessionId, Context.ConnectionId);
            if (session != null)
            {
                Player p = Manager.GetPlayer(Context.ConnectionId);
                string pName = (p != null ? p.DisplayName : "Opponent");
                string winnerId = (Context.ConnectionId == session.Player1.ConnectionId 
                    ? (session.Player2 != null ? session.Player2.ConnectionId : null) 
                    : (session.Player1 != null ? session.Player1.ConnectionId : null));

                Clients.OthersInGroup("session_" + sessionId).opponentLeft(new
                {
                    message = pName + " left the game. You win by forfeit!",
                    winnerId = winnerId
                });
                Manager.RemoveSession(sessionId);
                Clients.All.updateOnlinePlayers(Manager.GetOnlinePlayers());
                Clients.All.updateLeaderboard(Manager.GetLeaderboard());
            }
        }

        public void SubmitMathAnswer(string sessionId, int scoreDelta, int streak, bool isCorrect)
        {
            MoveResult result = Manager.ProcessMathAnswer(sessionId, Context.ConnectionId, scoreDelta, streak, isCorrect);
            if (result.Success)
            {
                Clients.Group("session_" + sessionId).mathAnswerProcessed(result.ExtraData);
            }
            else
            {
                Clients.Caller.moveError(result.Message);
            }
        }

        public void FinishMathGame(string sessionId)
        {
            MoveResult result = Manager.FinishMathMatch(sessionId);
            if (result.Success)
            {
                Clients.Group("session_" + sessionId).mathGameFinished(result);
                Clients.All.updateLeaderboard(Manager.GetLeaderboard());
            }
        }

        public void SendSlingPuckState(string sessionId, object statePayload)
        {
            Clients.OthersInGroup("session_" + sessionId).slingPuckStateReceived(statePayload);
        }

        public void FinishSlingPuckGame(string sessionId, int winnerPlayerNumber)
        {
            MoveResult result = Manager.FinishSlingPuckMatch(sessionId, winnerPlayerNumber);
            if (result.Success)
            {
                Clients.Group("session_" + sessionId).slingPuckGameFinished(result);
                Clients.All.updateLeaderboard(Manager.GetLeaderboard());
            }
        }

        public void MakeDotsAndBoxesMove(string sessionId, string lineType, int r, int c)
        {
            MoveResult result = Manager.ProcessDotsAndBoxesMove(sessionId, Context.ConnectionId, lineType, r, c);
            if (result.Success)
            {
                Clients.Group("session_" + sessionId).dotsAndBoxesMoveMade(result);
                if (result.IsGameOver)
                {
                    Clients.All.updateLeaderboard(Manager.GetLeaderboard());
                }
            }
            else
            {
                Clients.Caller.invalidMove(result.Message);
            }
        }

        public void SendCodebreakerProgress(string sessionId, object progressData)
        {
            Clients.OthersInGroup("session_" + sessionId).codebreakerProgressReceived(progressData);
        }

        public void FinishCodebreakerGame(string sessionId, int attemptsUsed, int elapsedSeconds)
        {
            MoveResult result = Manager.FinishCodebreakerMatch(sessionId, Context.ConnectionId, attemptsUsed, elapsedSeconds);
            if (result.Success)
            {
                Clients.Group("session_" + sessionId).codebreakerGameFinished(result);
                Clients.All.updateLeaderboard(Manager.GetLeaderboard());
            }
        }

        public void SendMemoryMatrixProgress(string sessionId, object progressData)
        {
            Clients.OthersInGroup("session_" + sessionId).memoryMatrixProgressReceived(progressData);
        }

        public void FinishMemoryMatrixGame(string sessionId, int levelReached, int score)
        {
            MoveResult result = Manager.FinishMemoryMatrixMatch(sessionId, Context.ConnectionId, levelReached, score);
            if (result.Success)
            {
                Clients.Group("session_" + sessionId).memoryMatrixGameFinished(result);
                Clients.All.updateLeaderboard(Manager.GetLeaderboard());
            }
        }

        public void SendLaserMirrorsProgress(string sessionId, object progressData)
        {
            Clients.OthersInGroup("session_" + sessionId).laserMirrorsProgressReceived(progressData);
        }

        public void FinishLaserMirrorsGame(string sessionId, int levelReached, int elapsedSeconds)
        {
            MoveResult result = Manager.FinishLaserMirrorsMatch(sessionId, Context.ConnectionId, levelReached, elapsedSeconds);
            if (result.Success)
            {
                Clients.Group("session_" + sessionId).laserMirrorsGameFinished(result);
                Clients.All.updateLeaderboard(Manager.GetLeaderboard());
            }
        }

        public void SendAlgoBotProgress(string sessionId, object progressData)
        {
            Clients.OthersInGroup("session_" + sessionId).algoBotProgressReceived(progressData);
        }

        public void FinishAlgoBotGame(string sessionId, int levelReached, int instructionsUsed, int elapsedSeconds)
        {
            MoveResult result = Manager.FinishAlgoBotMatch(sessionId, Context.ConnectionId, levelReached, instructionsUsed, elapsedSeconds);
            if (result.Success)
            {
                Clients.Group("session_" + sessionId).algoBotGameFinished(result);
                Clients.All.updateLeaderboard(Manager.GetLeaderboard());
            }
        }

        public void SendWordDuelProgress(string sessionId, object progressData)
        {
            Clients.OthersInGroup("session_" + sessionId).wordDuelProgressReceived(progressData);
        }

        public void FinishWordDuelGame(string sessionId, string secretWord, int attemptsUsed, int elapsedSeconds)
        {
            MoveResult result = Manager.FinishWordDuelMatch(sessionId, Context.ConnectionId, secretWord, attemptsUsed, elapsedSeconds);
            if (result.Success)
            {
                Clients.Group("session_" + sessionId).wordDuelGameFinished(result);
                Clients.All.updateLeaderboard(Manager.GetLeaderboard());
            }
        }

        public void SendLightsOutProgress(string sessionId, object progressData)
        {
            Clients.OthersInGroup("session_" + sessionId).lightsOutProgressReceived(progressData);
        }

        public void FinishLightsOutGame(string sessionId, int movesUsed, int elapsedSeconds)
        {
            MoveResult result = Manager.FinishLightsOutMatch(sessionId, Context.ConnectionId, movesUsed, elapsedSeconds);
            if (result.Success)
            {
                Clients.Group("session_" + sessionId).lightsOutGameFinished(result);
                Clients.All.updateLeaderboard(Manager.GetLeaderboard());
            }
        }

        public void SendGameReaction(string sessionId, string message)
        {
            Player p = Manager.GetPlayer(Context.ConnectionId);
            string name = p != null ? p.DisplayName : "Player";
            Clients.OthersInGroup("session_" + sessionId).reactionReceived(new
            {
                sender = name,
                message = message
            });
        }
        #endregion

        #region Custom Plugin Game Real-Time Multiplayer Relay
        public Task JoinCustomSession(string sessionId, string customGameId, string playerName)
        {
            string groupName = "session_" + sessionId;
            Groups.Add(Context.ConnectionId, groupName);

            GameSession session = Manager.GetSession(sessionId);
            if (session == null)
            {
                Player p = Manager.GetPlayer(Context.ConnectionId);
                if (p == null) p = Manager.RegisterPlayer(Context.ConnectionId, playerName);
                session = Manager.CreateSession(GameType.Custom, p, null, customGameId);
                session.SessionId = sessionId;
            }
            else
            {
                if (session.Player1 != null && string.Equals(session.Player1.DisplayName, playerName, StringComparison.OrdinalIgnoreCase))
                {
                    session.Player1.ConnectionId = Context.ConnectionId;
                }
                else if (session.Player2 != null && string.Equals(session.Player2.DisplayName, playerName, StringComparison.OrdinalIgnoreCase))
                {
                    session.Player2.ConnectionId = Context.ConnectionId;
                }
                else if (session.Player2 == null)
                {
                    Player p2 = Manager.GetPlayer(Context.ConnectionId);
                    if (p2 == null) p2 = Manager.RegisterPlayer(Context.ConnectionId, playerName);
                    session.Player2 = p2;
                }
            }

            int playerNumber = (session.Player1 != null && string.Equals(session.Player1.DisplayName, playerName, StringComparison.OrdinalIgnoreCase)) ? 1 : 2;

            Clients.Caller.customSessionJoined(new
            {
                sessionId = sessionId,
                customGameId = customGameId,
                playerNumber = playerNumber,
                player1Name = session.Player1 != null ? session.Player1.DisplayName : "Player 1",
                player2Name = session.Player2 != null ? session.Player2.DisplayName : "Player 2"
            });

            Clients.OthersInGroup(groupName).customPlayerConnected(new
            {
                playerName = playerName,
                playerNumber = playerNumber
            });

            return Task.FromResult(0);
        }

        public void SendCustomGameData(string sessionId, object payload)
        {
            Clients.OthersInGroup("session_" + sessionId).customGameDataReceived(payload);
        }

        public void SendCustomMove(string sessionId, object moveData)
        {
            Clients.OthersInGroup("session_" + sessionId).customMoveReceived(moveData);
        }

        public void FinishCustomGame(string sessionId, int winnerPlayerNumber, bool isDraw)
        {
            GameSession session = Manager.GetSession(sessionId);
            if (session != null)
            {
                string winnerId = null;
                if (!isDraw)
                {
                    winnerId = (winnerPlayerNumber == 1) ? session.Player1.ConnectionId : (session.Player2 != null ? session.Player2.ConnectionId : null);
                }

                session.Status = SessionStatus.Finished;
                session.WinnerPlayerId = winnerId;
                session.IsDraw = isDraw;

                if (session.Player1 != null && session.Player2 != null)
                {
                    Manager.RecordGameResult(session.Player1, session.Player2, winnerId, isDraw);
                    Clients.All.updateLeaderboard(Manager.GetLeaderboard());
                }

                Clients.Group("session_" + sessionId).customGameFinished(new
                {
                    winnerPlayerNumber = winnerPlayerNumber,
                    isDraw = isDraw
                });
            }
        }

        public void LeaveCustomGame(string sessionId)
        {
            LeaveGame(sessionId);
        }
        #endregion

        #region Bot AI Fallback Endpoints
        public int GetBotMoveTicTacToe(string[] board, string botSymbol, string humanSymbol, string difficulty)
        {
            return BotAiService.GetTicTacToeMove(board, botSymbol, humanSymbol, difficulty);
        }

        public int GetBotMoveConnect4(int[] flatBoard, int botPlayer, int humanPlayer, string difficulty)
        {
            int[,] b = new int[6, 7];
            for (int r = 0; r < 6; r++)
            {
                for (int c = 0; c < 7; c++)
                {
                    b[r, c] = flatBoard[r * 7 + c];
                }
            }
            return BotAiService.GetConnect4Move(b, botPlayer, humanPlayer, difficulty);
        }

        public string GetBotMoveRPS(List<string> history, string difficulty)
        {
            return BotAiService.GetRPSMove(history, difficulty);
        }
        #endregion
    }
}
