/* ==========================================================================
   GAME HUB - SignalR Real-Time Client Manager
   ========================================================================== */

(function(window, $) {
    'use strict';

    var hub = null;
    var isStarted = false;
    var connectionId = null;

    var GameHubClient = {
        hub: null,

        // onSetupHandlers(hub) is executed BEFORE hub.start()
        // onReady(connId) is executed AFTER hub.start() completes
        init: function(onSetupHandlers, onReady) {
            if (typeof onSetupHandlers === 'function' && typeof onReady !== 'function') {
                onReady = onSetupHandlers;
                onSetupHandlers = null;
            }

            if (!$.connection || !$.connection.gameHub) {
                console.warn("SignalR hub proxy not loaded. Check /signalr/hubs.");
                return;
            }

            hub = $.connection.gameHub;
            this.hub = hub;
            var self = this;

            // Wire default broadcast handlers before start
            hub.client.updateOnlinePlayers = function(players) {
                self.onUpdateOnlinePlayers(players);
            };

            hub.client.updateLeaderboard = function(entries) {
                self.onUpdateLeaderboard(entries);
            };

            hub.client.matchFound = function(matchData) {
                self.onMatchFound(matchData);
            };

            hub.client.inviteReceived = function(inviteData) {
                self.onInviteReceived(inviteData);
            };

            hub.client.inviteDeclined = function(data) {
                if (window.App) window.App.toast(data.declinedByName + " declined your challenge.", "warning");
            };

            hub.client.inviteSent = function(data) {
                if (window.App) window.App.toast("Challenge sent to " + data.toPlayerName + "!", "info");
            };

            // Call custom page handlers setup BEFORE hub.start()
            if (typeof onSetupHandlers === 'function') {
                onSetupHandlers(hub);
            }

            // Start connection
            $.connection.hub.start().done(function() {
                isStarted = true;
                connectionId = $.connection.hub.id;
                console.log("Connected to SignalR GameHub. ConnectionId:", connectionId);

                // Auto register player name
                var name = window.App ? window.App.getPlayerName() : "Player";
                self.register(name);

                if (typeof onReady === 'function') {
                    onReady(connectionId);
                }
            }).fail(function(err) {
                console.error("SignalR Connection Failed:", err);
                if (window.App) window.App.toast("Multiplayer disconnected. Running in offline bot mode.", "warning");
            });
        },

        isConnected: function() {
            return isStarted && $.connection.hub.state === $.signalR.connectionState.connected;
        },

        getConnectionId: function() {
            return connectionId || ($.connection && $.connection.hub ? $.connection.hub.id : null);
        },

        register: function(displayName) {
            if (this.isConnected() && hub) {
                hub.server.register(displayName);
            }
        },

        joinQueue: function(gameType) {
            if (this.isConnected() && hub) {
                hub.server.joinMatchmaking(gameType);
            } else {
                if (window.App) window.App.toast("Connecting to LAN lobby...", "warning");
            }
        },

        leaveQueue: function(gameType) {
            if (this.isConnected() && hub) {
                hub.server.leaveMatchmaking(gameType);
            }
        },

        sendInvite: function(targetConnectionId, gameType) {
            if (this.isConnected() && hub) {
                hub.server.sendInvite(targetConnectionId, gameType);
            }
        },

        acceptInvite: function(inviteId) {
            if (this.isConnected() && hub) {
                hub.server.acceptInvite(inviteId);
            }
        },

        declineInvite: function(inviteId) {
            if (this.isConnected() && hub) {
                hub.server.declineInvite(inviteId);
            }
        },

        onUpdateOnlinePlayers: function(players) {
            var $list = $('#online-players-list');
            var $count = $('#online-players-count');

            if ($count.length) {
                $count.text(players.length);
            }

            if ($list.length === 0) return;
            $list.empty();

            var myId = this.getConnectionId();
            var myName = window.App ? window.App.getPlayerName() : "Player";

            if (!players || players.length === 0) {
                $list.append('<li class="player-item" style="color: var(--text-muted); font-size: 0.9rem;">No other players currently online on this LAN.</li>');
                return;
            }

            var gameNames = { 1: "Tic-Tac-Toe", 2: "Connect 4", 3: "RPS", 4: "Air Hockey", 5: "Archery", 9: "Chess" };

            players.forEach(function(p) {
                var isMe = (p.ConnectionId === myId || (p.DisplayName && p.DisplayName.toLowerCase() === myName.toLowerCase()));
                var statusClass = 'status-idle';
                var statusText = 'Lobby';

                if (p.Status === 1) {
                    statusClass = 'status-queue';
                    statusText = 'Queued (' + (gameNames[p.QueuedGameType] || 'Game') + ')';
                } else if (p.Status === 2) {
                    statusClass = 'status-ingame';
                    statusText = 'In Game';
                }

                var $li = $('<li class="player-item"></li>');
                var infoHtml = '<div class="player-item-info">' +
                    '<div class="profile-avatar" style="width: 32px; height: 32px;">' + (p.DisplayName ? p.DisplayName.charAt(0).toUpperCase() : 'P') + '</div>' +
                    '<div>' +
                        '<div class="player-item-name">' + (p.DisplayName || 'Guest') + (isMe ? ' <span style="color: var(--accent-cyan); font-size: 0.8rem;">(You)</span>' : '') + '</div>' +
                        '<span class="player-status-badge ' + statusClass + '">' + statusText + '</span>' +
                    '</div>' +
                '</div>';

                var actionsHtml = '';
                if (!isMe && p.Status === 0) {
                    actionsHtml = '<div style="display: flex; gap: 6px;">' +
                        '<button type="button" class="btn btn-outline btn-sm challenge-btn" data-conn="' + p.ConnectionId + '" data-name="' + p.DisplayName + '" title="Challenge Player">' +
                            'Challenge' +
                        '</button>' +
                    '</div>';
                }

                $li.html(infoHtml + actionsHtml);
                $list.append($li);
            });

            // Bind challenge button click
            $('.challenge-btn').off('click').on('click', function(e) {
                e.preventDefault();
                var targetId = $(this).data('conn');
                var targetName = $(this).data('name');
                GameHubClient.openChallengeSelectModal(targetId, targetName);
            });
        },

        openChallengeSelectModal: function(targetId, targetName) {
            var self = this;
            var html = '<div id="challenge-modal" class="modal-backdrop active">' +
                '<div class="modal-box">' +
                    '<h2 class="modal-title">Challenge ' + targetName + '</h2>' +
                    '<p class="modal-text">Select which mini-game you want to play:</p>' +
                    '<div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">' +
                        '<button type="button" class="btn btn-primary send-chal-btn" data-type="1">Tic-Tac-Toe</button>' +
                        '<button type="button" class="btn btn-secondary send-chal-btn" data-type="2">Connect 4</button>' +
                        '<button type="button" class="btn btn-primary send-chal-btn" data-type="3" style="background: linear-gradient(135deg, #e11d48, #f43f5e);">Rock-Paper-Scissors Reflex</button>' +
                        '<button type="button" class="btn btn-secondary send-chal-btn" data-type="4" style="background: linear-gradient(135deg, #d97706, #f59e0b);">Air Hockey</button>' +
                        '<button type="button" class="btn btn-primary send-chal-btn" data-type="5" style="background: linear-gradient(135deg, #059669, #10b981);">Archery Clash</button>' +
                        '<button type="button" class="btn btn-secondary send-chal-btn" data-type="9" style="background: linear-gradient(135deg, #0284c7, #38bdf8);">Chess Championship</button>' +
                    '</div>' +
                    '<button type="button" class="btn btn-outline" id="close-chal-modal">Cancel</button>' +
                '</div>' +
            '</div>';

            $('#challenge-modal').remove();
            $('body').append(html);

            $('.send-chal-btn').on('click', function(e) {
                e.preventDefault();
                var gameType = parseInt($(this).data('type'), 10);
                self.sendInvite(targetId, gameType);
                $('#challenge-modal').removeClass('active').remove();
            });

            $('#close-chal-modal').on('click', function(e) {
                e.preventDefault();
                $('#challenge-modal').removeClass('active').remove();
            });
        },

        onUpdateLeaderboard: function(entries) {
            var $tbody = $('#leaderboard-body');
            if ($tbody.length === 0) return;
            $tbody.empty();

            if (!entries || entries.length === 0) {
                $tbody.append('<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No matches recorded yet. Play a game to rank!</td></tr>');
                return;
            }

            entries.forEach(function(entry, index) {
                var rankClass = index === 0 ? 'rank-1' : (index === 1 ? 'rank-2' : (index === 2 ? 'rank-3' : ''));
                var rankHtml = '<span class="rank-badge ' + rankClass + '">' + (index + 1) + '</span>';

                var row = '<tr>' +
                    '<td>' + rankHtml + '</td>' +
                    '<td style="font-weight: 600;">' + entry.DisplayName + '</td>' +
                    '<td style="color: #34d399; font-weight: 700;">' + entry.Wins + '</td>' +
                    '<td style="color: #fb7185;">' + entry.Losses + '</td>' +
                    '<td><span style="font-weight: 700; color: var(--accent-cyan);">' + entry.Points + '</span> <span style="font-size: 0.75rem; color: var(--text-muted);">pts (' + entry.WinRate + '%)</span></td>' +
                '</tr>';
                $tbody.append(row);
            });
        },

        onMatchFound: function(matchData) {
            if (window.GameAudio) window.GameAudio.playWin();
            if (window.App) window.App.toast("Match found! Launching game...", "success");

            var pageMap = {
                1: "Games/TicTacToe.aspx",
                2: "Games/Connect4.aspx",
                3: "Games/RPS.aspx",
                4: "Games/AirHockey.aspx",
                5: "Games/Archery.aspx",
                9: "Games/Chess.aspx"
            };

            var targetPage = pageMap[matchData.gameType] || "Default.aspx";
            
            setTimeout(function() {
                window.location.href = targetPage + "?session=" + matchData.sessionId + "&p1=" + encodeURIComponent(matchData.player1.DisplayName) + "&p2=" + encodeURIComponent(matchData.player2.DisplayName);
            }, 600);
        },

        onInviteReceived: function(inviteData) {
            var self = this;
            if (window.GameAudio) window.GameAudio.playMove();

            var gameNames = { 1: "Tic-Tac-Toe", 2: "Connect 4", 3: "Rock-Paper-Scissors Reflex", 4: "Air Hockey", 5: "Archery Clash", 9: "Chess Championship" };
            var gameName = gameNames[inviteData.gameType] || "a game";

            var html = '<div id="invite-incoming-modal" class="modal-backdrop active">' +
                '<div class="modal-box">' +
                    '<div class="modal-icon-wrapper">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>' +
                    '</div>' +
                    '<h2 class="modal-title">Game Challenge!</h2>' +
                    '<p class="modal-text"><strong style="color: #fff;">' + inviteData.fromPlayer.DisplayName + '</strong> has challenged you to a match of <strong style="color: var(--accent-cyan);">' + gameName + '</strong>!</p>' +
                    '<div class="btn-group">' +
                        '<button type="button" class="btn btn-primary" id="accept-invite-btn">Accept Challenge</button>' +
                        '<button type="button" class="btn btn-outline" id="decline-invite-btn">Decline</button>' +
                    '</div>' +
                '</div>' +
            '</div>';

            $('#invite-incoming-modal').remove();
            $('body').append(html);

            $('#accept-invite-btn').on('click', function(e) {
                e.preventDefault();
                self.acceptInvite(inviteData.inviteId);
                $('#invite-incoming-modal').removeClass('active').remove();
            });

            $('#decline-invite-btn').on('click', function(e) {
                e.preventDefault();
                self.declineInvite(inviteData.inviteId);
                $('#invite-incoming-modal').removeClass('active').remove();
            });
        }
    };

    window.GameHubClient = GameHubClient;

})(window, jQuery);
