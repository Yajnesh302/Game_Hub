/* ==========================================================================
   GAME HUB - Interactive Chess UI & Controller
   Features: Dual-Mode (Vs Bot & LAN Multiplayer), Full White & Black Support,
   Board Flipping, Undo Moves, SVG Piece Set, Click/Drag Controls,
   Promotion Modal, Captured Trays, SAN Move List & Synthesized Audio
   ========================================================================== */

(function(window, $) {
    'use strict';

    var engine = null;
    var isVsBot = true;
    var botDifficulty = 'medium';
    var myColor = 'w'; // 'w' or 'b'
    var isFlipped = false; // true if viewing board from Black's perspective
    var sessionId = null;
    var p1Url = '';
    var p2Url = '';
    var selectedSquare = null;
    var legalMovesForSelected = [];
    var lastMove = null; // { from, to }
    var pendingPromotionMove = null;
    var moveHistorySAN = [];
    var capturedWhite = [];
    var capturedBlack = [];

    // SVG Piece Icons
    var PIECE_SVGS = {
        P: '<svg viewBox="0 0 45 45"><path d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 l 23,0 c 0,-7.92 -4.41,-12.41 -7.41,-13.47 C 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z" fill="#f8fafc" stroke="#38bdf8" stroke-width="1.5"/></svg>',
        R: '<svg viewBox="0 0 45 45"><path d="M 9,39 L 36,39 L 36,36 L 9,36 z M 12,36 L 12,32 L 33,32 L 33,36 z M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 L 31,17 L 14,17 z M 14,17 L 14,29.5 L 31,29.5 L 31,17 z M 14,16 L 31,16 L 31,16.5 L 14,16.5 z" fill="#f8fafc" stroke="#38bdf8" stroke-width="1.5"/></svg>',
        N: '<svg viewBox="0 0 45 45"><path d="M 22,10 C 22,10 17,11 15,14 C 13,17 14,20 14,20 C 14,20 10,21 9,25 C 8,29 11,30 11,30 C 11,30 10,32 10,34 C 10,36 12,36 12,36 L 33,36 C 33,36 33,32 30,28 C 27,24 28,19 28,19 C 28,19 31,18 31,14 C 31,10 27,9 27,9 C 27,9 25,8 22,10 z" fill="#f8fafc" stroke="#38bdf8" stroke-width="1.5"/></svg>',
        B: '<svg viewBox="0 0 45 45"><path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.65,38.99 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,28.5 28.5,26 C 26.5,23.5 25.5,18 25.5,14 C 25.5,10 22.5,8 22.5,8 C 22.5,8 19.5,10 19.5,14 C 19.5,18 18.5,23.5 16.5,26 C 15,28.5 14.5,30.5 15,32 z" fill="#f8fafc" stroke="#38bdf8" stroke-width="1.5"/></svg>',
        Q: '<svg viewBox="0 0 45 45"><path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 22.5,10 L 14,25 L 6.5,13.5 z M 9,26 L 9,36 L 36,36 L 36,26 z M 11.5,30 C 15,29 30,29 33.5,30 L 33.5,33 L 11.5,33 z" fill="#f8fafc" stroke="#38bdf8" stroke-width="1.5"/></svg>',
        K: '<svg viewBox="0 0 45 45"><path d="M 22.5,11.5 L 22.5,6 M 20,8 L 25,8 M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,14.5 C 38.5,14.5 31,22 22.5,14 C 14,22 6.5,14.5 6.5,14.5 z M 9,26 L 9,36 L 36,36 L 36,26 z M 11.5,30 C 15,29 30,29 33.5,30 L 33.5,33 L 11.5,33 z" fill="#f8fafc" stroke="#38bdf8" stroke-width="1.5"/></svg>',

        p: '<svg viewBox="0 0 45 45"><path d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 l 23,0 c 0,-7.92 -4.41,-12.41 -7.41,-13.47 C 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z" fill="#0f172a" stroke="#0284c7" stroke-width="1.5"/></svg>',
        r: '<svg viewBox="0 0 45 45"><path d="M 9,39 L 36,39 L 36,36 L 9,36 z M 12,36 L 12,32 L 33,32 L 33,36 z M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 L 31,17 L 14,17 z M 14,17 L 14,29.5 L 31,29.5 L 31,17 z M 14,16 L 31,16 L 31,16.5 L 14,16.5 z" fill="#0f172a" stroke="#0284c7" stroke-width="1.5"/></svg>',
        n: '<svg viewBox="0 0 45 45"><path d="M 22,10 C 22,10 17,11 15,14 C 13,17 14,20 14,20 C 14,20 10,21 9,25 C 8,29 11,30 11,30 C 11,30 10,32 10,34 C 10,36 12,36 12,36 L 33,36 C 33,36 33,32 30,28 C 27,24 28,19 28,19 C 28,19 31,18 31,14 C 31,10 27,9 27,9 C 27,9 25,8 22,10 z" fill="#0f172a" stroke="#0284c7" stroke-width="1.5"/></svg>',
        b: '<svg viewBox="0 0 45 45"><path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.65,38.99 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,28.5 28.5,26 C 26.5,23.5 25.5,18 25.5,14 C 25.5,10 22.5,8 22.5,8 C 22.5,8 19.5,10 19.5,14 C 19.5,18 18.5,23.5 16.5,26 C 15,28.5 14.5,30.5 15,32 z" fill="#0f172a" stroke="#0284c7" stroke-width="1.5"/></svg>',
        q: '<svg viewBox="0 0 45 45"><path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 22.5,10 L 14,25 L 6.5,13.5 z M 9,26 L 9,36 L 36,36 L 36,26 z M 11.5,30 C 15,29 30,29 33.5,30 L 33.5,33 L 11.5,33 z" fill="#0f172a" stroke="#0284c7" stroke-width="1.5"/></svg>',
        k: '<svg viewBox="0 0 45 45"><path d="M 22.5,11.5 L 22.5,6 M 20,8 L 25,8 M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,14.5 C 38.5,14.5 31,22 22.5,14 C 14,22 6.5,14.5 6.5,14.5 z M 9,26 L 9,36 L 36,36 L 36,26 z M 11.5,30 C 15,29 30,29 33.5,30 L 33.5,33 L 11.5,33 z" fill="#0f172a" stroke="#0284c7" stroke-width="1.5"/></svg>'
    };

    var ChessUI = {
        init: function() {
            var urlParams = new URLSearchParams(window.location.search);
            sessionId = urlParams.get('session');
            botDifficulty = urlParams.get('diff') || 'medium';
            p1Url = urlParams.get('p1') || '';
            p2Url = urlParams.get('p2') || '';

            isVsBot = !sessionId;
            engine = new window.ChessEngine();

            var myName = window.App ? window.App.getPlayerName() : "Player";

            if (isVsBot) {
                myColor = 'w';
                isFlipped = false;
                $('#undo-btn').show();
                $('#in-game-diff-container').show();
                this.setDifficulty(botDifficulty, false);
                $('#player-name').text(myName + ' (White)');
                $('#game-mode-badge').text('Vs Bot (' + botDifficulty.toUpperCase() + ')');
                this.initBoardDOM();
                this.bindEvents();
                this.render();
            } else {
                $('#undo-btn').hide();
                $('#in-game-diff-container').hide();
                $('#game-mode-badge').text('LAN Multiplayer');

                // Pre-detect role from URL
                var isP1 = true;
                if (p1Url && p2Url && myName.toLowerCase() === p2Url.toLowerCase()) {
                    isP1 = false;
                }
                myColor = isP1 ? 'w' : 'b';
                isFlipped = !isP1; // Black views from Black's side

                this.updatePlayerCards(isP1 ? myName : (p1Url || "Player 1"), isP1 ? (p2Url || "Player 2") : myName, isP1);
                this.initBoardDOM();
                this.bindEvents();
                this.initMultiplayer();
            }
        },

        updatePlayerCards: function(whitePlayerName, blackPlayerName, amIWhite) {
            if (amIWhite) {
                // Bottom is White (You), Top is Black (Opponent)
                $('#player-name').text(whitePlayerName + ' (White - You)');
                $('#opponent-name').text(blackPlayerName + ' (Black)');
                $('#opponent-subtext').text('Playing as Black');
            } else {
                // Bottom is Black (You), Top is White (Opponent)
                $('#player-name').text(blackPlayerName + ' (Black - You)');
                $('#opponent-name').text(whitePlayerName + ' (White)');
                $('#opponent-subtext').text('Playing as White');
            }
        },

        setDifficulty: function(diff, showToast) {
            botDifficulty = diff.toLowerCase();
            $('.seg-btn').removeClass('active');
            $('#diff-btn-' + botDifficulty).addClass('active');
            $('#opponent-name').text('Bot (' + botDifficulty.toUpperCase() + ')');
            $('#opponent-subtext').text('AI Difficulty: ' + botDifficulty.toUpperCase());
            $('#game-mode-badge').text('Vs Bot (' + botDifficulty.toUpperCase() + ')');

            if (showToast && window.App) {
                window.App.toast("Bot difficulty set to " + botDifficulty.toUpperCase(), "info");
            }
        },

        initBoardDOM: function() {
            var $board = $('#chess-board');
            $board.empty();

            for (var row = 0; row < 8; row++) {
                for (var col = 0; col < 8; col++) {
                    var r = isFlipped ? (7 - row) : row;
                    var c = isFlipped ? (7 - col) : col;
                    var sqIdx = r * 8 + c;
                    var isLight = ((r + c) % 2 === 0);
                    var sqName = window.ChessEngine.SQUARES_BY_INDEX[sqIdx];

                    var $sq = $('<div>')
                        .addClass('chess-square')
                        .addClass(isLight ? 'chess-sq-light' : 'chess-sq-dark')
                        .attr('data-square', sqIdx)
                        .attr('data-name', sqName);

                    // Coordinate labels along edges
                    if (col === 0) {
                        $sq.append($('<span>').addClass('chess-coord-rank').text(8 - r));
                    }
                    if (row === 7) {
                        $sq.append($('<span>').addClass('chess-coord-file').text(String.fromCharCode(97 + c)));
                    }

                    $board.append($sq);
                }
            }
        },

        render: function() {
            $('.chess-square').removeClass('chess-sq-selected chess-sq-legal chess-sq-capture chess-sq-last-from chess-sq-last-to chess-sq-check');
            $('.chess-piece').remove();
            $('.chess-legal-dot, .chess-legal-ring').remove();

            // 1. Render Pieces
            for (var sq = 0; sq < 64; sq++) {
                var p = engine.board[sq];
                if (p) {
                    var pieceChar = (p.color === 'w') ? p.type.toUpperCase() : p.type.toLowerCase();
                    var $piece = $('<div>')
                        .addClass('chess-piece')
                        .html(PIECE_SVGS[pieceChar] || '')
                        .attr('data-piece', pieceChar);

                    $('[data-square="' + sq + '"]').append($piece);
                }
            }

            // 2. Highlight Selected & Legal Moves
            if (selectedSquare !== null) {
                $('[data-square="' + selectedSquare + '"]').addClass('chess-sq-selected');

                legalMovesForSelected.forEach(function(m) {
                    var $dest = $('[data-square="' + m.to + '"]');
                    if (m.captured || m.enPassant) {
                        $dest.addClass('chess-sq-capture').append($('<div>').addClass('chess-legal-ring'));
                    } else {
                        $dest.addClass('chess-sq-legal').append($('<div>').addClass('chess-legal-dot'));
                    }
                });
            }

            // 3. Highlight Last Move
            if (lastMove) {
                $('[data-square="' + lastMove.from + '"]').addClass('chess-sq-last-from');
                $('[data-square="' + lastMove.to + '"]').addClass('chess-sq-last-to');
            }

            // 4. In Check Highlight
            if (engine.inCheck()) {
                var kingSq = engine.findKing(engine.turn);
                if (kingSq !== -1) {
                    $('[data-square="' + kingSq + '"]').addClass('chess-sq-check');
                }
            }

            // 5. Update HUD / Status
            this.updateTurnIndicator();
            this.updateCapturedTrays();
            this.updateMoveList();
        },

        updateTurnIndicator: function() {
            var turnColor = engine.turn;
            var isWhite = (turnColor === 'w');
            var text = isWhite ? "White's Turn" : "Black's Turn";

            if (!isVsBot) {
                if (turnColor === myColor) {
                    text += " (Your Move)";
                } else {
                    text += " (Opponent's Move)";
                }
            }

            if (engine.isCheckmate()) {
                text = "Checkmate! " + (isWhite ? "Black" : "White") + " wins!";
            } else if (engine.isDraw()) {
                text = "Game Drawn (Stalemate / 50-Move)";
            } else if (engine.inCheck()) {
                text += " - Check!";
            }

            $('#turn-status-text').text(text);
            $('#turn-badge').css('background', isWhite ? '#f8fafc' : '#0f172a');
            $('#turn-badge').css('color', isWhite ? '#0f172a' : '#f8fafc');
            $('#turn-badge').text(isWhite ? "White" : "Black");
        },

        updateCapturedTrays: function() {
            var $wTray = $('#captured-white-tray');
            var $bTray = $('#captured-black-tray');
            $wTray.empty();
            $bTray.empty();

            capturedWhite.forEach(function(p) {
                $wTray.append($('<div>').addClass('chess-mini-piece').html(PIECE_SVGS[p.toUpperCase()]));
            });
            capturedBlack.forEach(function(p) {
                $bTray.append($('<div>').addClass('chess-mini-piece').html(PIECE_SVGS[p.toLowerCase()]));
            });
        },

        updateMoveList: function() {
            var $history = $('#chess-move-history');
            $history.empty();

            if (moveHistorySAN.length === 0) {
                $history.append('<div style="color: var(--text-muted); font-size: 0.82rem; text-align: center; padding: 12px;">No moves played yet.</div>');
                return;
            }

            for (var i = 0; i < moveHistorySAN.length; i += 2) {
                var moveNum = Math.floor(i / 2) + 1;
                var wMove = moveHistorySAN[i];
                var bMove = moveHistorySAN[i + 1] || '';

                var $row = $('<div>').addClass('chess-history-row');
                $row.append($('<span>').addClass('chess-move-num').text(moveNum + '.'));
                $row.append($('<span>').addClass('chess-move-san').text(wMove));
                if (bMove) $row.append($('<span>').addClass('chess-move-san').text(bMove));

                $history.append($row);
            }

            // Scroll to bottom
            $history.scrollTop($history[0].scrollHeight);
        },

        onSquareClick: function(sqIdx) {
            if (engine.isCheckmate() || engine.isDraw()) return;

            // Turn & Color validation
            if (isVsBot) {
                if (engine.turn !== 'w') return;
            } else {
                if (engine.turn !== myColor) {
                    if (window.App) window.App.toast("Wait for your turn! You are playing " + (myColor === 'w' ? "White" : "Black") + ".", "warning");
                    return;
                }
            }

            var piece = engine.board[sqIdx];

            // 1. Selecting own piece (matches engine.turn and player's assigned color)
            if (piece && piece.color === engine.turn && (isVsBot || piece.color === myColor)) {
                if (selectedSquare === sqIdx) {
                    selectedSquare = null;
                    legalMovesForSelected = [];
                } else {
                    selectedSquare = sqIdx;
                    var allLegals = engine.legalMoves();
                    legalMovesForSelected = allLegals.filter(function(m) { return m.from === sqIdx; });
                }
                this.render();
                return;
            }

            // 2. Executing move to target square
            if (selectedSquare !== null) {
                var matchingMoves = legalMovesForSelected.filter(function(m) { return m.to === sqIdx; });
                if (matchingMoves.length > 0) {
                    var m = matchingMoves[0];

                    // Check if Promotion
                    if (m.piece.type === 'p' && (Math.floor(m.to / 8) === 0 || Math.floor(m.to / 8) === 7)) {
                        this.openPromotionModal(m);
                        return;
                    }

                    this.executeMove(m);
                } else {
                    selectedSquare = null;
                    legalMovesForSelected = [];
                    this.render();
                }
            }
        },

        openPromotionModal: function(move) {
            pendingPromotionMove = move;
            $('#chess-promotion-modal').addClass('active');
        },

        onPromotionChoice: function(choice) {
            $('#chess-promotion-modal').removeClass('active');
            if (pendingPromotionMove) {
                pendingPromotionMove.promotion = choice;
                var m = pendingPromotionMove;
                pendingPromotionMove = null;
                this.executeMove(m);
            }
        },

        executeMove: function(m) {
            selectedSquare = null;
            legalMovesForSelected = [];

            var san = engine.getSan(m);
            var captured = m.captured ? m.captured.type : null;
            if (captured) {
                if (m.piece.color === 'w') capturedBlack.push(captured);
                else capturedWhite.push(captured);
            }

            engine.makeMove(m);
            lastMove = { from: m.from, to: m.to };
            moveHistorySAN.push(san);

            // Play Audio
            if (window.GameAudio) {
                if (m.castle) window.GameAudio.playChessCastle();
                else if (captured) window.GameAudio.playChessCapture();
                else if (engine.inCheck()) window.GameAudio.playChessCheck();
                else window.GameAudio.playChessMove();
            }

            this.render();

            // Check game end
            if (engine.isCheckmate()) {
                var winner = (engine.turn === 'w') ? 'Black' : 'White';
                this.showGameOver("Checkmate! " + winner + " wins!");
                return;
            } else if (engine.isDraw()) {
                this.showGameOver("Game drawn by stalemate / 50-move rule.");
                return;
            }

            // Mode branches
            if (isVsBot && engine.turn === 'b') {
                var self = this;
                setTimeout(function() {
                    self.executeBotMove();
                }, 280);
            } else if (!isVsBot) {
                this.syncMultiplayerMove(m, san, captured);
            }
        },

        executeBotMove: function() {
            var botMove = window.ChessBot.getBestMove(engine, botDifficulty);
            if (botMove) {
                if (botMove.piece.type === 'p' && Math.floor(botMove.to / 8) === 7) {
                    botMove.promotion = 'q';
                }
                this.executeMove(botMove);
            }
        },

        undoLastMove: function() {
            if (!isVsBot || engine.history.length === 0) return;

            if (engine.turn === 'w' && engine.history.length >= 2) {
                engine.undoMove();
                engine.undoMove();
                moveHistorySAN.pop();
                moveHistorySAN.pop();
            } else if (engine.history.length === 1) {
                engine.undoMove();
                moveHistorySAN.pop();
            }

            selectedSquare = null;
            legalMovesForSelected = [];
            lastMove = (engine.history.length > 0) ? { from: engine.history[engine.history.length - 1].from, to: engine.history[engine.history.length - 1].to } : null;

            this.recalculateCaptured();

            if (window.GameAudio) window.GameAudio.playClick();
            if (window.App) window.App.toast("Move undone.", "info");

            this.render();
        },

        recalculateCaptured: function() {
            capturedWhite = [];
            capturedBlack = [];
            for (var i = 0; i < engine.history.length; i++) {
                var u = engine.history[i];
                if (u.captured) {
                    if (u.piece.color === 'w') capturedBlack.push(u.captured.type);
                    else capturedWhite.push(u.captured.type);
                }
            }
        },

        resetGame: function() {
            engine = new window.ChessEngine();
            selectedSquare = null;
            legalMovesForSelected = [];
            lastMove = null;
            pendingPromotionMove = null;
            moveHistorySAN = [];
            capturedWhite = [];
            capturedBlack = [];

            if (window.App) window.App.toast("Game reset. Good luck!", "info");
            this.render();
        },

        toggleFlipBoard: function() {
            isFlipped = !isFlipped;
            this.initBoardDOM();
            this.render();
            if (window.App) {
                window.App.toast("Board flipped to " + (isFlipped ? "Black" : "White") + " perspective.", "info");
            }
        },

        showGameOver: function(text) {
            var isWin = isVsBot ? (engine.turn === 'b' && engine.isCheckmate()) : (engine.turn !== myColor && engine.isCheckmate());
            var self = this;
            if (window.App && typeof window.App.showGameModal === 'function') {
                window.App.showGameModal({
                    title: "Game Over",
                    text: text,
                    isWin: isWin,
                    onRematch: function() {
                        self.resetGame();
                    }
                });
            } else {
                alert(text);
            }
        },

        initMultiplayer: function() {
            var self = this;
            var myName = window.App ? window.App.getPlayerName() : "Player";

            // Wire SignalR using GameHubClient pattern
            window.GameHubClient.init(function(hub) {
                // 1. Session State from Server
                hub.client.sessionState = function(state) {
                    var isP1 = state.isP1;
                    myColor = isP1 ? 'w' : 'b';
                    isFlipped = !isP1;

                    var wName = state.player1 ? state.player1.DisplayName : (p1Url || "Player 1");
                    var bName = state.player2 ? state.player2.DisplayName : (p2Url || "Player 2");

                    self.updatePlayerCards(wName, bName, isP1);

                    if (state.chessFen && state.chessFen !== window.ChessEngine.DEFAULT_FEN) {
                        engine.load(state.chessFen);
                    }
                    if (state.chessMoveHistory) moveHistorySAN = state.chessMoveHistory;
                    if (state.chessCapturedWhite) capturedWhite = state.chessCapturedWhite;
                    if (state.chessCapturedBlack) capturedBlack = state.chessCapturedBlack;

                    self.initBoardDOM();
                    self.render();
                };

                // 2. Opponent Entered
                hub.client.opponentEnteredSession = function(data) {
                    if (data.player1 && data.player2) {
                        var isP1 = (myColor === 'w');
                        self.updatePlayerCards(data.player1.DisplayName, data.player2.DisplayName, isP1);
                    }
                    if (window.App) window.App.toast((data.displayName || "Opponent") + " connected to the match!", "success");
                };

                // 3. Chess Move Broadcast
                hub.client.chessMoveMade = function(data) {
                    if (data.from !== undefined) {
                        var fromIdx = (typeof data.from === 'string') ? window.ChessEngine.SQUARES[data.from] : data.from;
                        var toIdx = (typeof data.to === 'string') ? window.ChessEngine.SQUARES[data.to] : data.to;

                        var moves = engine.legalMoves();
                        var match = moves.filter(function(m) {
                            return m.from === fromIdx && m.to === toIdx && (!data.promotion || m.promotion === data.promotion);
                        })[0];

                        if (match) {
                            if (data.promotion) match.promotion = data.promotion;
                            if (match.captured) {
                                if (match.piece.color === 'w') capturedBlack.push(match.captured.type);
                                else capturedWhite.push(match.captured.type);
                            }

                            engine.makeMove(match);
                            lastMove = { from: fromIdx, to: toIdx };
                            if (data.san) moveHistorySAN.push(data.san);

                            if (window.GameAudio) {
                                if (match.castle) window.GameAudio.playChessCastle();
                                else if (match.captured) window.GameAudio.playChessCapture();
                                else if (engine.inCheck()) window.GameAudio.playChessCheck();
                                else window.GameAudio.playChessMove();
                            }

                            self.render();

                            if (data.isCheckmate) {
                                var winnerColor = (engine.turn === 'w') ? 'Black' : 'White';
                                var amIWinner = (winnerColor === (myColor === 'w' ? 'White' : 'Black'));
                                self.showGameOver("Checkmate! " + (amIWinner ? "You win!" : "Opponent wins!"));
                            } else if (data.isDraw) {
                                self.showGameOver("Game drawn by stalemate / agreement.");
                            }
                        }
                    }
                };

                // 4. Draw & Resign
                hub.client.drawOfferReceived = function() {
                    if (confirm("Your opponent has offered a draw. Do you accept?")) {
                        hub.server.respondChessDraw(sessionId, true);
                    } else {
                        hub.server.respondChessDraw(sessionId, false);
                    }
                };

                hub.client.drawOfferDeclined = function() {
                    if (window.App) window.App.toast("Draw offer was declined.", "info");
                };

                hub.client.chessGameOver = function(data) {
                    self.showGameOver(data.reason);
                };
            }, function(connId) {
                // Connected -> Join Session on server
                var hub = $.connection.gameHub;
                if (hub && hub.server) {
                    hub.server.joinSession(sessionId, myName, 9, p1Url, p2Url);
                }
            });
        },

        syncMultiplayerMove: function(move, san, captured) {
            var hub = $.connection.gameHub;
            if (hub && hub.server) {
                var fromStr = window.ChessEngine.SQUARES_BY_INDEX[move.from];
                var toStr = window.ChessEngine.SQUARES_BY_INDEX[move.to];

                hub.server.makeChessMove(
                    sessionId,
                    fromStr,
                    toStr,
                    move.promotion || null,
                    engine.fen(),
                    san,
                    engine.inCheck(),
                    engine.isCheckmate(),
                    engine.isDraw(),
                    captured || null
                );
            }
        },

        bindEvents: function() {
            var self = this;

            // Click on Square
            $(document).on('click', '.chess-square', function(e) {
                e.preventDefault();
                var sqIdx = parseInt($(this).attr('data-square'), 10);
                self.onSquareClick(sqIdx);
            });

            // Promotion Choice Click
            $(document).on('click', '.chess-promo-btn', function(e) {
                e.preventDefault();
                var choice = $(this).attr('data-choice');
                self.onPromotionChoice(choice);
            });

            // Difficulty Buttons in Sidebar
            $(document).on('click', '.seg-btn', function(e) {
                e.preventDefault();
                var diff = $(this).data('diff');
                if (diff) {
                    self.setDifficulty(diff, true);
                }
            });

            // Undo Move Button
            $('#undo-btn').on('click', function(e) {
                e.preventDefault();
                self.undoLastMove();
            });

            // Flip Board Button
            $('#flip-board-btn').on('click', function(e) {
                e.preventDefault();
                self.toggleFlipBoard();
            });

            // Restart / New Game Button
            $('#new-game-btn').on('click', function(e) {
                e.preventDefault();
                if (confirm("Restart game from starting position?")) {
                    self.resetGame();
                }
            });

            // Resign Button
            $('#resign-btn').on('click', function(e) {
                e.preventDefault();
                if (confirm("Are you sure you want to resign the game?")) {
                    if (isVsBot) {
                        self.showGameOver("You resigned. Black (Bot) wins!");
                    } else {
                        var hub = $.connection.gameHub;
                        if (hub && hub.server) hub.server.resignChess(sessionId);
                    }
                }
            });

            // Offer Draw Button
            $('#draw-btn').on('click', function(e) {
                e.preventDefault();
                if (isVsBot) {
                    if (window.App) window.App.toast("Bot declined the draw offer.", "info");
                } else {
                    var hub = $.connection.gameHub;
                    if (hub && hub.server) {
                        hub.server.offerChessDraw(sessionId);
                        if (window.App) window.App.toast("Draw offer sent to opponent.", "info");
                    }
                }
            });
        }
    };

    $(document).ready(function() {
        ChessUI.init();
    });

    window.ChessUI = ChessUI;

})(window, jQuery);
