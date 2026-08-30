<%@ Page Title="Play Custom Game - Game Hub" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="PlayCustom.aspx.cs" Inherits="GameHub.Games.PlayCustomPage" %>

<asp:Content ID="Head" ContentPlaceHolderID="HeadContent" runat="server">
    <script src="<%= ResolveUrl("~/Scripts/jquery.signalR-2.4.3.min.js") %>" type="text/javascript"></script>
    <script src="<%= ResolveUrl("~/signalr/hubs") %>" type="text/javascript"></script>
    <style>
        .custom-game-frame-container {
            position: relative;
            width: 100%;
            height: 720px;
            max-height: 82vh;
            background: #060b18;
            border: 2px solid var(--panel-border);
            border-radius: var(--radius-xl);
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
        }

        .custom-game-frame {
            width: 100%;
            height: 100%;
            border: none;
            display: block;
        }

        .custom-game-frame-container.is-fullscreen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            max-height: 100vh;
            z-index: 99999;
            border-radius: 0;
            border: none;
        }

        .fullscreen-exit-btn {
            display: none;
            position: absolute;
            top: 14px;
            right: 14px;
            z-index: 100000;
            background: rgba(15, 23, 42, 0.85);
            color: #f8fafc;
            border: 1px solid #38bdf8;
            padding: 8px 14px;
            border-radius: 8px;
            cursor: pointer;
            backdrop-filter: blur(10px);
            font-weight: bold;
        }

        .custom-game-frame-container.is-fullscreen .fullscreen-exit-btn {
            display: flex;
            align-items: center;
            gap: 6px;
        }
    </style>
</asp:Content>

<asp:Content ID="Body" ContentPlaceHolderID="MainContent" runat="server">
    <div class="game-screen-container" style="max-width: 1080px;">
        <!-- Top Bar -->
        <div class="game-top-bar">
            <div class="game-meta">
                <a href="<%= ResolveUrl("~/Default.aspx") %>" class="btn btn-outline btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Hub Menu
                </a>
                <span class="game-mode-badge" style="background: rgba(168, 85, 247, 0.15); border-color: rgba(168, 85, 247, 0.4); color: #c084fc;">
                    <%= GameManifest != null ? GameManifest.Title : "Custom Game" %>
                </span>
                <% if (IsMultiplayerSession) { %>
                    <span class="game-mode-badge" id="multiplayer-role-badge" style="background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.4); color: #38bdf8; margin-left: 6px;">
                        LAN Match (<%= P1Name %> vs <%= P2Name %>)
                    </span>
                <% } else { %>
                    <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 8px;">
                        by <%= GameManifest != null ? GameManifest.Author : "Developer" %> (v<%= GameManifest != null ? GameManifest.Version : "1.0" %>)
                    </span>
                <% } %>
            </div>
            <div style="display: flex; gap: 8px;">
                <% if (GameManifest != null && GameManifest.SupportsLeaderboard) { %>
                <button type="button" class="btn btn-outline btn-sm" id="btn-leaderboard" title="View High Scores" style="color: #fbbf24; border-color: rgba(251, 191, 36, 0.4);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    Leaderboard
                </button>
                <% } %>
                <button type="button" class="btn btn-outline btn-sm" id="btn-reload" title="Restart Game" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    Restart
                </button>
                <button type="button" class="btn btn-primary btn-sm" id="btn-fullscreen" title="Toggle Fullscreen">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                    Fullscreen
                </button>
            </div>
        </div>

        <!-- Frame Container -->
        <div class="custom-game-frame-container" id="game-frame-box">
            <button type="button" class="fullscreen-exit-btn" id="btn-exit-fullscreen">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                Exit Fullscreen (ESC)
            </button>
            <iframe id="custom-game-iframe" class="custom-game-frame" src="<%= GameUrl %>" allow="autoplay"></iframe>
        </div>

        <!-- Leaderboard Modal -->
        <div id="custom-leaderboard-modal" class="modal-backdrop">
            <div class="modal-box" style="max-width: 480px;">
                <div class="section-header" style="border: none; padding: 0; margin-bottom: 14px;">
                    <h3 class="section-title" style="font-size: 1.2rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        <%= GameManifest != null ? GameManifest.Title : "Game" %> High Scores
                    </h3>
                </div>
                <div style="max-height: 280px; overflow-y: auto; margin-bottom: 16px;">
                    <table class="leaderboard-table">
                        <thead>
                            <tr>
                                <th style="width: 44px;">Rank</th>
                                <th>Player</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody id="custom-scores-body">
                            <tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Loading high scores...</td></tr>
                        </tbody>
                    </table>
                </div>
                <button type="button" class="btn btn-outline" id="btn-close-leaderboard" style="width: 100%;">Close</button>
            </div>
        </div>
    </div>

    <script type="text/javascript">
        var currentGameId = '<%= GameManifest != null ? GameManifest.Id : "" %>';
        var currentSessionId = '<%= SessionId ?? "" %>';
        var p1Name = '<%= P1Name ?? "" %>';
        var p2Name = '<%= P2Name ?? "" %>';
        var isMultiplayer = <%= IsMultiplayerSession ? "true" : "false" %>;

        var myName = window.App ? window.App.getPlayerName() : "Player";
        var isP2 = (p2Name && myName && p2Name.trim().toLowerCase() === myName.trim().toLowerCase());
        var initialPlayerNumber = isP2 ? 2 : 1;
        var initialOpponentName = isP2 ? p1Name : p2Name;

        var dataCallbacks = [];
        var moveCallbacks = [];
        var opponentLeftCallbacks = [];
        var playerJoinedCallbacks = [];
        var gameFinishedCallbacks = [];
        var roleAssignedCallbacks = [];
        var hub = null;

        // 1. Injected Bridge API for custom iframe games to communicate with Game Hub
        window.GameHubBridge = {
            isMultiplayer: isMultiplayer,
            sessionId: currentSessionId,
            gameId: currentGameId,
            myPlayerName: myName,
            myPlayerNumber: initialPlayerNumber, // 1 (Blue/Left) or 2 (Pink/Right)
            player1Name: p1Name,
            player2Name: p2Name,
            opponentName: initialOpponentName,

            submitScore: function(score) {
                var playerName = this.myPlayerName;
                $.post('<%= ResolveUrl("~/Handlers/CustomGameHandler.ashx") %>', {
                    action: 'submitScore',
                    gameId: currentGameId,
                    playerName: playerName,
                    score: score
                }, function(res) {
                    if (window.App) window.App.toast("High score (" + score + ") recorded for " + playerName + "!", "success");
                });
            },

            getPlayerName: function() {
                return this.myPlayerName;
            },

            sendData: function(payload) {
                if (isMultiplayer && hub && $.connection.hub.state === $.signalR.connectionState.connected) {
                    hub.server.sendCustomGameData(currentSessionId, payload);
                }
            },

            onData: function(callback) {
                if (typeof callback === 'function') {
                    dataCallbacks.push(callback);
                }
            },

            sendMove: function(moveData) {
                if (isMultiplayer && hub && $.connection.hub.state === $.signalR.connectionState.connected) {
                    hub.server.sendCustomMove(currentSessionId, moveData);
                }
            },

            onMove: function(callback) {
                if (typeof callback === 'function') {
                    moveCallbacks.push(callback);
                }
            },

            finishGame: function(winnerPlayerNumber, isDraw) {
                if (isMultiplayer && hub && $.connection.hub.state === $.signalR.connectionState.connected) {
                    hub.server.finishCustomGame(currentSessionId, winnerPlayerNumber, isDraw || false);
                }
            },

            onGameFinished: function(callback) {
                if (typeof callback === 'function') {
                    gameFinishedCallbacks.push(callback);
                }
            },

            onPlayerJoined: function(callback) {
                if (typeof callback === 'function') {
                    playerJoinedCallbacks.push(callback);
                }
            },

            onRoleAssigned: function(callback) {
                if (typeof callback === 'function') {
                    roleAssignedCallbacks.push(callback);
                    try { callback(this.myPlayerNumber); } catch(e) {}
                }
            },

            onOpponentLeft: function(callback) {
                if (typeof callback === 'function') {
                    opponentLeftCallbacks.push(callback);
                }
            }
        };

        $(document).ready(function() {
            var $container = $('#game-frame-box');
            var $iframe = $('#custom-game-iframe');

            if (isMultiplayer) {
                var initialRoleText = 'Player ' + initialPlayerNumber + ' (' + myName + ')';
                $('#multiplayer-role-badge').text(initialRoleText);
            }

            // Multiplayer SignalR Connection
            if (isMultiplayer && $.connection && $.connection.gameHub) {
                hub = $.connection.gameHub;

                hub.client.customSessionJoined = function(info) {
                    window.GameHubBridge.myPlayerNumber = info.playerNumber;
                    window.GameHubBridge.player1Name = info.player1Name;
                    window.GameHubBridge.player2Name = info.player2Name;
                    window.GameHubBridge.opponentName = (info.playerNumber === 1 ? info.player2Name : info.player1Name);

                    var roleText = 'Player ' + info.playerNumber;
                    $('#multiplayer-role-badge').text(roleText + ' (' + window.GameHubBridge.myPlayerName + ')');
                    if (window.App) window.App.toast("Connected as " + roleText + "!", "info");

                    roleAssignedCallbacks.forEach(function(cb) { try { cb(info.playerNumber); } catch(e) {} });
                };

                hub.client.customPlayerConnected = function(data) {
                    if (window.App) window.App.toast(data.playerName + " connected to the match!", "success");
                    playerJoinedCallbacks.forEach(function(cb) { try { cb(data); } catch(e) {} });
                };

                hub.client.customGameDataReceived = function(payload) {
                    dataCallbacks.forEach(function(cb) { try { cb(payload); } catch(e) {} });
                };

                hub.client.customMoveReceived = function(moveData) {
                    moveCallbacks.forEach(function(cb) { try { cb(moveData); } catch(e) {} });
                };

                hub.client.customGameFinished = function(result) {
                    var isMeWinner = (result.winnerPlayerNumber === window.GameHubBridge.myPlayerNumber);
                    if (window.App) {
                        window.App.showGameModal({
                            title: result.isDraw ? "Game Drawn!" : (isMeWinner ? "Victory!" : "Defeated!"),
                            text: result.isDraw ? "The match ended in a draw." : (isMeWinner ? "Congratulations! You won the custom match!" : "Your opponent won the match."),
                            isWin: isMeWinner
                        });
                    }
                    gameFinishedCallbacks.forEach(function(cb) { try { cb(result); } catch(e) {} });
                };

                hub.client.opponentLeft = function(data) {
                    if (window.App) {
                        window.App.showGameModal({
                            title: "Opponent Disconnected",
                            text: data.message || "Your opponent left the game.",
                            isWin: true
                        });
                    }
                    opponentLeftCallbacks.forEach(function(cb) { try { cb(data); } catch(e) {} });
                };

                $.connection.hub.start().done(function() {
                    var myName = window.App ? window.App.getPlayerName() : "Player";
                    hub.server.joinCustomSession(currentSessionId, currentGameId, myName);
                });
            }

            // Restart Button
            $('#btn-reload').on('click', function(e) {
                e.preventDefault();
                $iframe.attr('src', $iframe.attr('src'));
            });

            // Fullscreen Toggles
            $('#btn-fullscreen').on('click', function(e) {
                e.preventDefault();
                $container.addClass('is-fullscreen');
            });

            $('#btn-exit-fullscreen').on('click', function(e) {
                e.preventDefault();
                $container.removeClass('is-fullscreen');
            });

            $(document).on('keydown', function(e) {
                if (e.key === 'Escape' && $container.hasClass('is-fullscreen')) {
                    $container.removeClass('is-fullscreen');
                }
            });

            // Leaderboard Modal
            $('#btn-leaderboard').on('click', function(e) {
                e.preventDefault();
                $('#custom-leaderboard-modal').addClass('active');
                loadScores();
            });

            $('#btn-close-leaderboard').on('click', function(e) {
                e.preventDefault();
                $('#custom-leaderboard-modal').removeClass('active');
            });

            function loadScores() {
                var $tbody = $('#custom-scores-body');
                $tbody.html('<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Loading high scores...</td></tr>');

                $.get('<%= ResolveUrl("~/Handlers/CustomGameHandler.ashx") %>', { action: 'getScores', id: currentGameId }, function(res) {
                    $tbody.empty();
                    if (!res.scores || res.scores.length === 0) {
                        $tbody.append('<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">No scores recorded yet. Play to set a record!</td></tr>');
                        return;
                    }

                    res.scores.forEach(function(s, idx) {
                        var rankClass = idx === 0 ? 'rank-1' : (idx === 1 ? 'rank-2' : (idx === 2 ? 'rank-3' : ''));
                        var row = '<tr>' +
                            '<td><span class="rank-badge ' + rankClass + '">' + (idx + 1) + '</span></td>' +
                            '<td style="font-weight: 600;">' + s.PlayerName + '</td>' +
                            '<td style="color: #fbbf24; font-weight: 700;">' + s.Score + '</td>' +
                            '</tr>';
                        $tbody.append(row);
                    });
                });
            }
        });
    </script>
</asp:Content>
