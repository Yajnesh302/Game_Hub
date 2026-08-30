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

    // SVG Piece Icons — Official Lichess cburnett set (open source, GPL)
    // Self-contained: fill/stroke are inline so no CSS override needed.
    var PIECE_SVGS = {
        // ---- WHITE PIECES ----
        K: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path stroke-linejoin="miter" d="M22.5 11.63V6M20 8h5"/><path fill="#fff" stroke-linecap="butt" stroke-linejoin="miter" d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path fill="#fff" d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10z"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"/></g></svg>',
        Q: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0m16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0M41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0M16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0M33 9a2 2 0 1 1-4 0 2 2 0 1 1 4 0"/><path stroke-linecap="butt" d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14z"/><path stroke-linecap="butt" d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path fill="none" d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0"/></g></svg>',
        R: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path stroke-linecap="butt" d="M9 39h27v-3H9zm3-3v-4h21v4zm-1-22V9h4v2h5V9h5v2h5V9h4v5"/><path d="m34 14-3 3H14l-3-3"/><path stroke-linecap="butt" stroke-linejoin="miter" d="M31 17v12.5H14V17"/><path d="m31 29.5 1.5 2.5h-20l1.5-2.5"/><path fill="none" stroke-linejoin="miter" d="M11 14h23"/></g></svg>',
        B: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><g fill="#fff" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.94 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path stroke-linejoin="miter" d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5"/></g></svg>',
        N: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path fill="#fff" d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path fill="#fff" d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"/><path fill="#000" d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0m5.433-9.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5"/></g></svg>',
        P: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path fill="#fff" stroke="#000" stroke-linecap="round" stroke-width="1.5" d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"/></svg>',

        // ---- BLACK PIECES ----
        k: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path stroke-linejoin="miter" d="M22.5 11.6V6"/><path fill="#000" stroke-linecap="butt" stroke-linejoin="miter" d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path fill="#000" d="M11.5 37a22.3 22.3 0 0 0 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10z"/><path stroke-linejoin="miter" d="M20 8h5"/><path stroke="#ececec" d="M32 29.5s8.5-4 6-9.7C34.1 14 25 18 22.5 24.6v2.1-2.1C20 18 9.9 14 7 19.9c-2.5 5.6 4.8 9 4.8 9"/><path stroke="#ececec" d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"/></g></svg>',
        q: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><g stroke="none"><circle cx="6" cy="12" r="2.75"/><circle cx="14" cy="9" r="2.75"/><circle cx="22.5" cy="8" r="2.75"/><circle cx="31" cy="9" r="2.75"/><circle cx="39" cy="12" r="2.75"/></g><path stroke-linecap="butt" d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5z"/><path stroke-linecap="butt" d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path fill="none" stroke-linecap="butt" d="M11 38.5a35 35 1 0 0 23 0"/><path fill="none" stroke="#ececec" d="M11 29a35 35 1 0 1 23 0m-21.5 2.5h20m-21 3a35 35 1 0 0 22 0m-23 3a35 35 1 0 0 24 0"/></g></svg>',
        r: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path stroke-linecap="butt" d="M9 39h27v-3H9zm3.5-7 1.5-2.5h17l1.5 2.5zm-.5 4v-4h21v4z"/><path stroke-linecap="butt" stroke-linejoin="miter" d="M14 29.5v-13h17v13z"/><path stroke-linecap="butt" d="M14 16.5 11 14h23l-3 2.5zM11 14V9h4v2h5V9h5v2h5V9h4v5z"/><path fill="none" stroke="#ececec" stroke-linejoin="miter" stroke-width="1" d="M12 35.5h21m-20-4h19m-18-2h17m-17-13h17M11 14h23"/></g></svg>',
        b: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><g fill="#000" stroke-linecap="butt"><path d="M9 36c3.4-1 10.1.4 13.5-2 3.4 2.4 10.1 1 13.5 2 0 0 1.6.5 3 2-.7 1-1.6 1-3 .5-3.4-1-10.1.5-13.5-1-3.4 1.5-10.1 0-13.5 1-1.4.5-2.3.5-3-.5 1.4-2 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path stroke="#ececec" stroke-linejoin="miter" d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5"/></g></svg>',
        n: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path fill="#000" d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path fill="#000" d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.04-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-1-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-2 2.5-3c1 0 1 3 1 3"/><path fill="#ececec" stroke="#ececec" d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0m5.43-9.75a.5 1.5 30 1 1-.86-.5.5 1.5 30 1 1 .86.5"/><path fill="#ececec" stroke="none" d="m24.55 10.4-.45 1.45.5.15c3.15 1 5.65 2.49 7.9 6.75S35.75 29.06 35.25 39l-.05.5h2.25l.05-.5c.5-10.06-.88-16.85-3.25-21.34s-5.79-6.64-9.19-7.16z"/></g></svg>',
        p: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path stroke="#000" stroke-linecap="round" stroke-width="1.5" d="M22.5 9a4 4 0 0 0-3.22 6.38 6.48 6.48 0 0 0-.87 10.65c-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47a6.46 6.46 0 0 0-.87-10.65A4.01 4.01 0 0 0 22.5 9z"/></svg>'
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
