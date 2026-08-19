/* ==========================================================================
   GAME HUB - Connect 4 Game Engine (Physics Drop, Alpha-Beta AI + LAN)
   ========================================================================== */

(function(window, $) {
    'use strict';

    var ROWS = 6;
    var COLS = 7;
    var board = []; // 6 rows x 7 cols (0 = empty, 1 = p1/cyan, 2 = p2/rose)
    var isMultiplayer = false;
    var sessionId = null;
    var myPlayerNum = 1;
    var opponentPlayerNum = 2;
    var isMyTurn = true;
    var isGameOver = false;
    var isDropping = false;
    var difficulty = "hard";
    var myPlayerName = "Player";
    var opponentPlayerName = "Opponent";
    var localConnId = null;

    var Connect4 = {
        init: function() {
            var urlParams = new URLSearchParams(window.location.search);
            sessionId = urlParams.get('session');
            difficulty = urlParams.get('diff') || 'hard';
            var p1Url = urlParams.get('p1') || '';
            var p2Url = urlParams.get('p2') || '';

            myPlayerName = window.App ? window.App.getPlayerName() : "Player";

            this.initBoardArray();
            this.renderGrid();
            this.bindEvents();

            if (sessionId) {
                isMultiplayer = true;
                this.initMultiplayer(p1Url, p2Url);
            } else {
                isMultiplayer = false;
                this.initSinglePlayer();
            }
        },

        initBoardArray: function() {
            board = [];
            for (var r = 0; r < ROWS; r++) {
                var row = [];
                for (var c = 0; c < COLS; c++) {
                    row.push(0);
                }
                board.push(row);
            }
        },

        initSinglePlayer: function() {
            opponentPlayerName = "Bot (" + (difficulty.charAt(0).toUpperCase() + difficulty.slice(1)) + ")";
            myPlayerNum = 1;
            opponentPlayerNum = 2;
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

            myPlayerNum = isP1 ? 1 : 2;
            opponentPlayerNum = isP1 ? 2 : 1;
            opponentPlayerName = isP1 ? (p2Url || "Opponent") : (p1Url || "Opponent");
            isMyTurn = isP1; // Player 1 starts first

            $('#p1-name').text(isP1 ? myName : (p1Url || "Player 1"));
            $('#p2-name').text(isP1 ? (p2Url || "Player 2") : myName);
            self.updateTurnIndicator();

            // Wire handlers BEFORE connection starts
            window.GameHubClient.init(function(hub) {
                hub.client.sessionState = function(state) {
                    localConnId = state.callerConnectionId || window.GameHubClient.getConnectionId();
                    
                    myPlayerNum = state.yourNumber || (state.isP1 ? 1 : 2);
                    opponentPlayerNum = (myPlayerNum === 1) ? 2 : 1;

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

                    if (state.c4Board) {
                        for (var r = 0; r < ROWS; r++) {
                            for (var c = 0; c < COLS; c++) {
                                var val = state.c4Board[r * COLS + c];
                                if (val > 0) {
                                    board[r][c] = val;
                                    var $slot = $('.c4-slot[data-row="' + r + '"][data-col="' + c + '"]');
                                    var $hole = $slot.find('.c4-hole');
                                    $hole.empty();
                                    var dClass = (val === 1) ? 'disc-p1' : 'disc-p2';
                                    $hole.append('<div class="c4-disc ' + dClass + '"></div>');
                                }
                            }
                        }
                    }
                };

                hub.client.opponentEnteredSession = function(data) {
                    window.App.toast(data.displayName + " is ready in the match!", "info");
                    if (myPlayerNum === 1) {
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

                hub.client.connect4MoveMade = function(res) {
                    var pNum = parseInt(res.PlayerSymbol, 10);
                    self.animateDrop(res.Col, res.Row, pNum, function() {
                        if (res.IsGameOver) {
                            isGameOver = true;
                            if (res.WinningLine && res.WinningLine.length) {
                                self.highlightWinningLine(res.WinningLine);
                            }

                            var myId = window.GameHubClient.getConnectionId();
                            var isWinner = (res.WinnerPlayerId === myId || (pNum === myPlayerNum && !res.IsDraw));
                            var isDraw = res.IsDraw;

                            setTimeout(function() {
                                window.App.showGameModal({
                                    title: isDraw ? "Board Full! Draw" : (isWinner ? "Four Connected! Victory" : "Defeat!"),
                                    text: isDraw ? "Great battle! The board is completely filled." : (isWinner ? "Incredible connection! You won the game." : opponentPlayerName + " connected 4 discs and won."),
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
                            isMyTurn = (res.NextTurnPlayerId === myId || (pNum !== myPlayerNum));
                            self.updateTurnIndicator();
                        }
                    });
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
                    isMyTurn = (data.currentTurn === myId || (myPlayerNum === 1));
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
                window.GameHubClient.hub.server.joinSession(sessionId, myName, 2, p1Url, p2Url);
            });
        },

        renderGrid: function() {
            var $dropRow = $('#c4-drop-row');
            var $board = $('#c4-board');
            $dropRow.empty();
            $board.empty();

            for (var c = 0; c < COLS; c++) {
                var $guide = $('<div class="c4-drop-guide" data-col="' + c + '">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>' +
                '</div>');
                $dropRow.append($guide);
            }

            for (var r = 0; r < ROWS; r++) {
                for (var col = 0; col < COLS; col++) {
                    var $slot = $('<div class="c4-slot" data-row="' + r + '" data-col="' + col + '"><div class="c4-hole"></div></div>');
                    $board.append($slot);
                }
            }
        },

        bindEvents: function() {
            var self = this;

            $('#c4-drop-row').on('click', '.c4-drop-guide', function(e) {
                e.preventDefault();
                var col = parseInt($(this).data('col'), 10);
                self.handleColumnClick(col);
            });

            $('#c4-board').on('click', '.c4-slot', function(e) {
                e.preventDefault();
                var col = parseInt($(this).data('col'), 10);
                self.handleColumnClick(col);
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

        handleColumnClick: function(col) {
            if (isGameOver || isDropping) return;
            if (board[0][col] !== 0) {
                window.App.toast("Column is full!", "warning");
                return;
            }

            if (isMultiplayer) {
                if (!isMyTurn) {
                    window.App.toast("Wait for " + opponentPlayerName + "'s move!", "warning");
                    return;
                }

                if (window.GameHubClient.isConnected()) {
                    window.GameHubClient.hub.server.makeConnect4Move(sessionId, col);
                } else {
                    window.App.toast("Reconnecting to match...", "warning");
                }
            } else {
                if (!isMyTurn) return;

                var targetRow = this.getLowestEmptyRow(col);
                if (targetRow === -1) return;

                var self = this;
                isMyTurn = false;
                this.updateTurnIndicator();

                this.animateDrop(col, targetRow, myPlayerNum, function() {
                    var winCells = self.checkWin(board, myPlayerNum);
                    if (winCells) {
                        self.finishGame(true, false, winCells);
                        return;
                    }

                    if (self.isBoardFull(board)) {
                        self.finishGame(false, true, null);
                        return;
                    }

                    setTimeout(function() {
                        self.executeBotMove();
                    }, 400);
                });
            }
        },

        animateDrop: function(col, row, playerNum, onComplete) {
            isDropping = true;
            board[row][col] = playerNum;

            var $targetSlot = $('.c4-slot[data-row="' + row + '"][data-col="' + col + '"]');
            var $hole = $targetSlot.find('.c4-hole');
            if ($hole.length === 0) {
                $targetSlot.html('<div class="c4-hole"></div>');
                $hole = $targetSlot.find('.c4-hole');
            }
            $hole.empty();

            var discClass = (playerNum === 1) ? 'disc-p1' : 'disc-p2';
            var $disc = $('<div class="c4-disc ' + discClass + '"></div>');
            $hole.append($disc);

            if (window.GameAudio) window.GameAudio.playDrop();

            setTimeout(function() {
                isDropping = false;
                if (typeof onComplete === 'function') {
                    onComplete();
                }
            }, 400);
        },

        executeBotMove: function() {
            if (isGameOver) return;

            var botCol = this.getBotMoveAlphaBeta(board, opponentPlayerNum, myPlayerNum, difficulty);
            if (botCol === -1) return;

            var targetRow = this.getLowestEmptyRow(botCol);
            var self = this;

            this.animateDrop(botCol, targetRow, opponentPlayerNum, function() {
                var winCells = self.checkWin(board, opponentPlayerNum);
                if (winCells) {
                    self.finishGame(false, false, winCells);
                    return;
                }

                if (self.isBoardFull(board)) {
                    self.finishGame(false, true, null);
                    return;
                }

                isMyTurn = true;
                self.updateTurnIndicator();
            });
        },

        getLowestEmptyRow: function(col) {
            for (var r = ROWS - 1; r >= 0; r--) {
                if (board[r][col] === 0) return r;
            }
            return -1;
        },

        finishGame: function(isWin, isDraw, winCells) {
            isGameOver = true;
            if (winCells) {
                this.highlightWinningLine(winCells);
            }

            var self = this;
            setTimeout(function() {
                window.App.showGameModal({
                    title: isDraw ? "Board Full! Draw" : (isWin ? "Four Connected! Victory" : "Bot Won!"),
                    text: isDraw ? "Evenly matched." : (isWin ? "Brilliant line! You defeated the " + difficulty + " AI." : "The " + difficulty + " bot connected four discs. Rematch?"),
                    isWin: isWin,
                    isDraw: isDraw,
                    onRematch: function() {
                        self.resetLocalBoard();
                        isMyTurn = true;
                        self.updateTurnIndicator();
                    }
                });
            }, 500);
        },

        highlightWinningLine: function(cells) {
            cells.forEach(function(pos) {
                var r, c;
                if (typeof pos === 'number') {
                    r = Math.floor(pos / COLS);
                    c = pos % COLS;
                } else {
                    r = pos.r;
                    c = pos.c;
                }
                $('.c4-slot[data-row="' + r + '"][data-col="' + c + '"] .c4-disc').addClass('winning-disc');
            });
        },

        resetLocalBoard: function() {
            this.initBoardArray();
            isGameOver = false;
            isDropping = false;
            $('.c4-hole').empty();
        },

        updateTurnIndicator: function() {
            if (isMyTurn) {
                $('#turn-indicator').text('Your Turn (' + (myPlayerNum === 1 ? 'Cyan' : 'Ruby') + ')');
                $('#p1-hud').toggleClass('active-turn', myPlayerNum === 1);
                $('#p2-hud').toggleClass('active-turn', myPlayerNum === 2);
            } else {
                $('#turn-indicator').text(opponentPlayerName + "'s Turn (" + (opponentPlayerNum === 1 ? 'Cyan' : 'Ruby') + ")");
                $('#p1-hud').toggleClass('active-turn', opponentPlayerNum === 1);
                $('#p2-hud').toggleClass('active-turn', opponentPlayerNum === 2);
            }
        },

        checkWin: function(b, p) {
            // Horizontal
            for (var r = 0; r < ROWS; r++) {
                for (var c = 0; c < COLS - 3; c++) {
                    if (b[r][c] === p && b[r][c + 1] === p && b[r][c + 2] === p && b[r][c + 3] === p) {
                        return [{ r: r, c: c }, { r: r, c: c + 1 }, { r: r, c: c + 2 }, { r: r, c: c + 3 }];
                    }
                }
            }
            // Vertical
            for (var col = 0; col < COLS; col++) {
                for (var row = 0; row < ROWS - 3; row++) {
                    if (b[row][col] === p && b[row + 1][col] === p && b[row + 2][col] === p && b[row + 3][col] === p) {
                        return [{ r: row, c: col }, { r: row + 1, c: col }, { r: row + 2, c: col }, { r: row + 3, c: col }];
                    }
                }
            }
            // Diagonal positive slope
            for (var r2 = 3; r2 < ROWS; r2++) {
                for (var c2 = 0; c2 < COLS - 3; c2++) {
                    if (b[r2][c2] === p && b[r2 - 1][c2 + 1] === p && b[r2 - 2][c2 + 2] === p && b[r2 - 3][c2 + 3] === p) {
                        return [{ r: r2, c: c2 }, { r: r2 - 1, c: c2 + 1 }, { r: r2 - 2, c: c2 + 2 }, { r: r2 - 3, c: c2 + 3 }];
                    }
                }
            }
            // Diagonal negative slope
            for (var r3 = 0; r3 < ROWS - 3; r3++) {
                for (var c3 = 0; c3 < COLS - 3; c3++) {
                    if (b[r3][c3] === p && b[r3 + 1][c3 + 1] === p && b[r3 + 2][c3 + 2] === p && b[r3 + 3][c3 + 3] === p) {
                        return [{ r: r3, c: c3 }, { r: r3 + 1, c: c3 + 1 }, { r: r3 + 2, c: c3 + 2 }, { r: r3 + 3, c: c3 + 3 }];
                    }
                }
            }
            return null;
        },

        isBoardFull: function(b) {
            for (var c = 0; c < COLS; c++) {
                if (b[0][c] === 0) return false;
            }
            return true;
        },

        getValidColumns: function(b) {
            var valid = [];
            var order = [3, 2, 4, 1, 5, 0, 6];
            for (var i = 0; i < order.length; i++) {
                var c = order[i];
                if (b[0][c] === 0) valid.push(c);
            }
            return valid;
        },

        getBotMoveAlphaBeta: function(b, bot, human, diff) {
            var valid = this.getValidColumns(b);
            if (valid.length === 0) return -1;

            // 1-ply winning move check
            for (var i = 0; i < valid.length; i++) {
                var c = valid[i];
                var r = this.getLowestEmptyRowInCopy(b, c);
                b[r][c] = bot;
                if (this.checkWin(b, bot)) {
                    b[r][c] = 0;
                    return c;
                }
                b[r][c] = 0;
            }

            // 1-ply block human winning move
            for (var j = 0; j < valid.length; j++) {
                var c2 = valid[j];
                var r2 = this.getLowestEmptyRowInCopy(b, c2);
                b[r2][c2] = human;
                if (this.checkWin(b, human)) {
                    b[r2][c2] = 0;
                    return c2;
                }
                b[r2][c2] = 0;
            }

            if (diff === 'easy') {
                return valid[Math.floor(Math.random() * valid.length)];
            }

            return valid[0]; // Center preference
        },

        getLowestEmptyRowInCopy: function(b, col) {
            for (var r = ROWS - 1; r >= 0; r--) {
                if (b[r][col] === 0) return r;
            }
            return -1;
        }
    };

    $(document).ready(function() {
        Connect4.init();
    });

    window.Connect4 = Connect4;

})(window, jQuery);
