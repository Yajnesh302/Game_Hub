/* ==========================================================================
   GAME HUB - Tic-Tac-Toe Game Engine (Single Player AI + LAN Multiplayer)
   ========================================================================== */

(function(window, $) {
    'use strict';

    var board = ["", "", "", "", "", "", "", "", ""];
    var isMultiplayer = false;
    var sessionId = null;
    var mySymbol = "X";
    var opponentSymbol = "O";
    var isMyTurn = true;
    var isGameOver = false;
    var difficulty = "hard";
    var myPlayerName = "Player";
    var opponentPlayerName = "Opponent";
    var localConnId = null;

    var TicTacToe = {
        init: function() {
            var urlParams = new URLSearchParams(window.location.search);
            sessionId = urlParams.get('session');
            difficulty = urlParams.get('diff') || 'hard';
            var p1Url = urlParams.get('p1') || '';
            var p2Url = urlParams.get('p2') || '';

            myPlayerName = window.App ? window.App.getPlayerName() : "Player";

            this.renderBoard();
            this.bindEvents();

            if (sessionId) {
                isMultiplayer = true;
                this.initMultiplayer(p1Url, p2Url);
            } else {
                isMultiplayer = false;
                this.initSinglePlayer();
            }
        },

        initSinglePlayer: function() {
            opponentPlayerName = "Bot (" + (difficulty.charAt(0).toUpperCase() + difficulty.slice(1)) + ")";
            mySymbol = "X";
            opponentSymbol = "O";
            isMyTurn = true;

            $('#p1-name').text(myPlayerName);
            $('#p2-name').text(opponentPlayerName);
            $('#game-mode-badge').text('Solo vs ' + opponentPlayerName);
            this.updateTurnIndicator();
        },

        initMultiplayer: function(p1Url, p2Url) {
            $('#game-mode-badge').text('LAN Multiplayer');
            var self = this;
            var myName = window.App ? window.App.getPlayerName() : "Player";

            // Pre-initialize player roles from URL parameters
            var isP1 = true;
            if (p1Url && p2Url) {
                if (myName.toLowerCase() === p2Url.toLowerCase()) {
                    isP1 = false;
                }
            }

            mySymbol = isP1 ? "X" : "O";
            opponentSymbol = isP1 ? "O" : "X";
            opponentPlayerName = isP1 ? (p2Url || "Opponent") : (p1Url || "Opponent");
            isMyTurn = isP1; // Player 1 (X) starts first

            $('#p1-name').text(isP1 ? myName : (p1Url || "Player 1"));
            $('#p2-name').text(isP1 ? (p2Url || "Player 2") : myName);
            self.updateTurnIndicator();

            // Wire handlers BEFORE connection starts
            window.GameHubClient.init(function(hub) {
                hub.client.sessionState = function(state) {
                    localConnId = state.callerConnectionId || window.GameHubClient.getConnectionId();
                    
                    mySymbol = state.yourSymbol || (state.isP1 ? "X" : "O");
                    opponentSymbol = (mySymbol === "X") ? "O" : "X";
                    
                    if (state.isP1) {
                        myPlayerName = state.player1 ? state.player1.DisplayName : myName;
                        opponentPlayerName = state.player2 ? state.player2.DisplayName : (p2Url || "Opponent");
                        $('#p1-name').text(myPlayerName);
                        $('#p2-name').text(opponentPlayerName);
                    } else {
                        myPlayerName = state.player2 ? state.player2.DisplayName : myName;
                        opponentPlayerName = state.player1 ? state.player1.DisplayName : (p1Url || "Opponent");
                        $('#p1-name').text(opponentPlayerName);
                        $('#p2-name').text(myPlayerName);
                    }

                    isMyTurn = state.isYourTurn;
                    self.updateTurnIndicator();

                    if (state.tttBoard) {
                        for (var i = 0; i < 9; i++) {
                            if (state.tttBoard[i]) {
                                self.applyMove(i, state.tttBoard[i]);
                            }
                        }
                    }
                };

                hub.client.opponentEnteredSession = function(data) {
                    window.App.toast(data.displayName + " is ready in the match!", "info");
                    if (mySymbol === "X") {
                        opponentPlayerName = data.displayName;
                        $('#p2-name').text(data.displayName);
                    } else {
                        opponentPlayerName = data.displayName;
                        $('#p1-name').text(data.displayName);
                    }
                    if (data.currentTurn) {
                        var myId = window.GameHubClient.getConnectionId();
                        isMyTurn = (data.currentTurn === myId);
                        self.updateTurnIndicator();
                    }
                };

                hub.client.ticTacToeMoveMade = function(res) {
                    self.applyMove(res.MoveIndex, res.PlayerSymbol);

                    if (res.IsGameOver) {
                        isGameOver = true;
                        if (res.WinningLine && res.WinningLine.length) {
                            self.highlightWinningLine(res.WinningLine);
                        }

                        var myId = window.GameHubClient.getConnectionId();
                        var isWinner = (res.WinnerPlayerId === myId || (res.PlayerSymbol === mySymbol && !res.IsDraw));
                        var isDraw = res.IsDraw;

                        setTimeout(function() {
                            window.App.showGameModal({
                                title: isDraw ? "Match Drawn!" : (isWinner ? "Victory!" : "Defeat!"),
                                text: isDraw ? "Well played! The grid is completely locked." : (isWinner ? "Congratulations, you won the match!" : opponentPlayerName + " won this match."),
                                isWin: isWinner,
                                isDraw: isDraw,
                                onRematch: function() {
                                    hub.server.requestRematch(sessionId);
                                    window.App.toast("Rematch requested. Waiting for opponent...", "info");
                                }
                            });
                        }, 500);
                    } else {
                        var myId = window.GameHubClient.getConnectionId();
                        isMyTurn = (res.NextTurnPlayerId === myId || (res.PlayerSymbol !== mySymbol));
                        self.updateTurnIndicator();
                    }
                };

                hub.client.moveError = function(msg) {
                    window.App.toast(msg, "warning");
                };

                hub.client.rematchRequested = function() {
                    window.App.toast(opponentPlayerName + " wants a rematch! Click Rematch to accept.", "info");
                };

                hub.client.rematchStarted = function(data) {
                    window.App.hideGameModal();
                    window.App.toast("Rematch started!", "success");
                    self.resetLocalBoard();
                    var myId = window.GameHubClient.getConnectionId();
                    isMyTurn = (data.currentTurn === myId || (mySymbol === "X"));
                    self.updateTurnIndicator();
                };

                hub.client.opponentLeft = function(data) {
                    window.App.showGameModal({
                        title: "Opponent Left",
                        text: data.message,
                        isWin: true,
                        onRematch: function() {
                            window.location.href = "../Default.aspx";
                        }
                    });
                };

                hub.client.reactionReceived = function(data) {
                    window.App.toast(data.sender + ": " + data.message, "info");
                };
            }, function(connId) {
                localConnId = connId;
                window.GameHubClient.hub.server.joinSession(sessionId, myName, 1, p1Url, p2Url);
            });
        },

        renderBoard: function() {
            var $board = $('#ttt-board');
            $board.empty();

            for (var i = 0; i < 9; i++) {
                var $cell = $('<div class="ttt-cell" data-index="' + i + '"></div>');
                $board.append($cell);
            }
        },

        bindEvents: function() {
            var self = this;
            $('#ttt-board').on('click', '.ttt-cell', function(e) {
                e.preventDefault();
                var index = parseInt($(this).data('index'), 10);
                self.handleCellClick(index);
            });

            $('#forfeit-game-btn').on('click', function(e) {
                e.preventDefault();
                if (confirm("Are you sure you want to forfeit and return to the Hub?")) {
                    if (isMultiplayer && window.GameHubClient.isConnected()) {
                        window.GameHubClient.hub.server.leaveGame(sessionId);
                    }
                    window.location.href = "../Default.aspx";
                }
            });

            $('.reaction-btn').on('click', function(e) {
                e.preventDefault();
                var msg = $(this).data('msg') || $(this).text();
                if (isMultiplayer && window.GameHubClient.isConnected()) {
                    window.GameHubClient.hub.server.sendGameReaction(sessionId, msg);
                    window.App.toast("Sent: " + msg, "info");
                }
            });
        },

        handleCellClick: function(index) {
            if (isGameOver || board[index] !== "") return;

            if (isMultiplayer) {
                if (!isMyTurn) {
                    window.App.toast("Wait for " + opponentPlayerName + "'s move!", "warning");
                    return;
                }

                if (window.GameHubClient.isConnected()) {
                    window.GameHubClient.hub.server.makeTicTacToeMove(sessionId, index);
                } else {
                    window.App.toast("Reconnecting to match...", "warning");
                }
            } else {
                if (!isMyTurn) return;

                this.applyMove(index, mySymbol);

                var winLine = this.checkWin(board, mySymbol);
                if (winLine) {
                    this.finishGame(true, false, winLine);
                    return;
                }

                if (this.isBoardFull(board)) {
                    this.finishGame(false, true, null);
                    return;
                }

                isMyTurn = false;
                this.updateTurnIndicator();

                var self = this;
                setTimeout(function() {
                    self.executeBotMove();
                }, 380);
            }
        },

        applyMove: function(index, symbol) {
            board[index] = symbol;
            var $cell = $('.ttt-cell[data-index="' + index + '"]');
            $cell.addClass('occupied');

            if (symbol === 'X') {
                $cell.html('<svg xmlns="http://www.w3.org/2000/svg" class="ttt-symbol-svg symbol-x" viewBox="0 0 100 100"><line x1="20" y1="20" x2="80" y2="80"/><line x1="80" y1="20" x2="20" y2="80"/></svg>');
            } else {
                $cell.html('<svg xmlns="http://www.w3.org/2000/svg" class="ttt-symbol-svg symbol-o" viewBox="0 0 100 100"><circle cx="50" cy="50" r="32"/></svg>');
            }

            if (window.GameAudio) window.GameAudio.playMove();
        },

        executeBotMove: function() {
            if (isGameOver) return;

            var botMove = this.getBotMoveMinimax(board, opponentSymbol, mySymbol, difficulty);
            if (botMove !== -1) {
                this.applyMove(botMove, opponentSymbol);

                var winLine = this.checkWin(board, opponentSymbol);
                if (winLine) {
                    this.finishGame(false, false, winLine);
                    return;
                }

                if (this.isBoardFull(board)) {
                    this.finishGame(false, true, null);
                    return;
                }

                isMyTurn = true;
                this.updateTurnIndicator();
            }
        },

        finishGame: function(isWin, isDraw, winLine) {
            isGameOver = true;
            if (winLine) {
                this.highlightWinningLine(winLine);
            }

            var self = this;
            setTimeout(function() {
                window.App.showGameModal({
                    title: isDraw ? "Tie Game!" : (isWin ? "You Won!" : "Bot Won!"),
                    text: isDraw ? "Evenly matched match." : (isWin ? "Great strategy! You beat the " + difficulty + " AI." : "The " + difficulty + " bot outplayed you. Try again!"),
                    isWin: isWin,
                    isDraw: isDraw,
                    onRematch: function() {
                        self.resetLocalBoard();
                        isMyTurn = true;
                        self.updateTurnIndicator();
                    }
                });
            }, 400);
        },

        highlightWinningLine: function(line) {
            line.forEach(function(idx) {
                $('.ttt-cell[data-index="' + idx + '"]').addClass('winning-cell');
            });
        },

        resetLocalBoard: function() {
            board = ["", "", "", "", "", "", "", "", ""];
            isGameOver = false;
            $('.ttt-cell').removeClass('occupied winning-cell').empty();
        },

        updateTurnIndicator: function() {
            if (isMyTurn) {
                $('#turn-indicator').text('Your Turn (' + mySymbol + ')');
                $('#p1-hud').toggleClass('active-turn', mySymbol === "X");
                $('#p2-hud').toggleClass('active-turn', mySymbol === "O");
            } else {
                $('#turn-indicator').text(opponentPlayerName + "'s Turn (" + opponentSymbol + ")");
                $('#p1-hud').toggleClass('active-turn', opponentSymbol === "X");
                $('#p2-hud').toggleClass('active-turn', opponentSymbol === "O");
            }
        },

        getBotMoveMinimax: function(b, bot, human, diff) {
            var available = [];
            for (var i = 0; i < 9; i++) {
                if (b[i] === "") available.push(i);
            }
            if (available.length === 0) return -1;
            if (available.length === 9) return 4;

            if (diff === 'easy') {
                if (Math.random() > 0.25) {
                    return available[Math.floor(Math.random() * available.length)];
                }
            } else if (diff === 'normal') {
                if (Math.random() > 0.60) {
                    return available[Math.floor(Math.random() * available.length)];
                }
            }

            var bestScore = -Infinity;
            var bestMove = available[0];

            for (var j = 0; j < available.length; j++) {
                var m = available[j];
                b[m] = bot;
                var score = this.minimax(b, 0, false, bot, human);
                b[m] = "";

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = m;
                }
            }
            return bestMove;
        },

        minimax: function(b, depth, isMax, bot, human) {
            if (this.checkWin(b, bot)) return 10 - depth;
            if (this.checkWin(b, human)) return depth - 10;
            if (this.isBoardFull(b)) return 0;

            if (isMax) {
                var maxVal = -Infinity;
                for (var i = 0; i < 9; i++) {
                    if (b[i] === "") {
                        b[i] = bot;
                        maxVal = Math.max(maxVal, this.minimax(b, depth + 1, false, bot, human));
                        b[i] = "";
                    }
                }
                return maxVal;
            } else {
                var minVal = Infinity;
                for (var j = 0; j < 9; j++) {
                    if (b[j] === "") {
                        b[j] = human;
                        minVal = Math.min(minVal, this.minimax(b, depth + 1, true, bot, human));
                        b[j] = "";
                    }
                }
                return minVal;
            }
        },

        checkWin: function(b, s) {
            var lines = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8],
                [0, 3, 6], [1, 4, 7], [2, 5, 8],
                [0, 4, 8], [2, 4, 6]
            ];
            for (var i = 0; i < lines.length; i++) {
                var p = lines[i];
                if (b[p[0]] === s && b[p[1]] === s && b[p[2]] === s) {
                    return p;
                }
            }
            return null;
        },

        isBoardFull: function(b) {
            for (var i = 0; i < 9; i++) {
                if (b[i] === "") return false;
            }
            return true;
        }
    };

    $(document).ready(function() {
        TicTacToe.init();
    });

    window.TicTacToe = TicTacToe;

})(window, jQuery);
