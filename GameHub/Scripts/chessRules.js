/* ==========================================================================
   GAME HUB - Standards-Compliant Chess Rules Engine
   Features: FEN Parsing, Legal Move Generation, Check/Checkmate/Stalemate,
   Castling, En Passant, Pawn Promotion & SAN Notation
   ========================================================================== */

(function(window) {
    'use strict';

    var SQUARES = {
        a8: 0, b8: 1, c8: 2, d8: 3, e8: 4, f8: 5, g8: 6, h8: 7,
        a7: 8, b7: 9, c7: 10, d7: 11, e7: 12, f7: 13, g7: 14, h7: 15,
        a6: 16, b6: 17, c6: 18, d6: 19, e6: 20, f6: 21, g6: 22, h6: 23,
        a5: 24, b5: 25, c5: 26, d5: 27, e5: 28, f5: 29, g5: 30, h5: 31,
        a4: 32, b4: 33, c4: 34, d4: 35, e4: 36, f4: 37, g4: 38, h4: 39,
        a3: 40, b3: 41, c3: 42, d3: 43, e3: 44, f3: 45, g3: 46, h3: 47,
        a2: 48, b2: 49, c2: 50, d2: 51, e2: 52, f2: 53, g2: 54, h2: 55,
        a1: 56, b1: 57, c1: 58, d1: 59, e1: 60, f1: 61, g1: 62, h1: 63
    };

    var SQUARES_BY_INDEX = [];
    for (var sq in SQUARES) {
        SQUARES_BY_INDEX[SQUARES[sq]] = sq;
    }

    var DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    function ChessEngine(fen) {
        this.board = new Array(64);
        this.turn = 'w';
        this.castling = { K: true, Q: true, k: true, q: true };
        this.epSquare = -1;
        this.halfMoves = 0;
        this.moveNumber = 1;
        this.history = [];

        this.load(fen || DEFAULT_FEN);
    }

    ChessEngine.prototype.load = function(fen) {
        var tokens = fen.split(/\s+/);
        var position = tokens[0];
        var square = 0;

        for (var i = 0; i < 64; i++) this.board[i] = null;

        for (var k = 0; k < position.length; k++) {
            var piece = position.charAt(k);
            if (piece === '/') continue;
            if (piece >= '1' && piece <= '8') {
                square += parseInt(piece, 10);
            } else {
                var color = (piece <= 'Z') ? 'w' : 'b';
                this.board[square] = { type: piece.toLowerCase(), color: color };
                square++;
            }
        }

        this.turn = tokens[1] || 'w';
        var c = tokens[2] || 'KQkq';
        this.castling = {
            K: c.indexOf('K') > -1,
            Q: c.indexOf('Q') > -1,
            k: c.indexOf('k') > -1,
            q: c.indexOf('q') > -1
        };

        this.epSquare = (tokens[3] && tokens[3] !== '-') ? SQUARES[tokens[3]] : -1;
        this.halfMoves = parseInt(tokens[4], 10) || 0;
        this.moveNumber = parseInt(tokens[5], 10) || 1;
        this.history = [];
    };

    ChessEngine.prototype.fen = function() {
        var empty = 0;
        var fenStr = '';

        for (var i = 0; i < 64; i++) {
            var piece = this.board[i];
            if (piece === null) {
                empty++;
            } else {
                if (empty > 0) {
                    fenStr += empty;
                    empty = 0;
                }
                var char = piece.type;
                fenStr += (piece.color === 'w') ? char.toUpperCase() : char.toLowerCase();
            }

            if ((i + 1) % 8 === 0) {
                if (empty > 0) {
                    fenStr += empty;
                    empty = 0;
                }
                if (i < 63) fenStr += '/';
            }
        }

        var cStr = '';
        if (this.castling.K) cStr += 'K';
        if (this.castling.Q) cStr += 'Q';
        if (this.castling.k) cStr += 'k';
        if (this.castling.q) cStr += 'q';
        if (cStr === '') cStr = '-';

        var epStr = (this.epSquare > -1) ? SQUARES_BY_INDEX[this.epSquare] : '-';

        return [fenStr, this.turn, cStr, epStr, this.halfMoves, this.moveNumber].join(' ');
    };

    ChessEngine.prototype.getPiece = function(sq) {
        var idx = (typeof sq === 'string') ? SQUARES[sq] : sq;
        return this.board[idx];
    };

    ChessEngine.prototype.isAttacked = function(sq, byColor) {
        var r = Math.floor(sq / 8);
        var c = sq % 8;

        // 1. Pawn attacks
        var pDir = (byColor === 'w') ? 1 : -1; // Pawns attack downwards from black, upwards from white
        var pr = r + pDir;
        if (pr >= 0 && pr < 8) {
            if (c > 0) {
                var p1 = this.board[pr * 8 + (c - 1)];
                if (p1 && p1.color === byColor && p1.type === 'p') return true;
            }
            if (c < 7) {
                var p2 = this.board[pr * 8 + (c + 1)];
                if (p2 && p2.color === byColor && p2.type === 'p') return true;
            }
        }

        // 2. Knight attacks
        var knightOffsets = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        for (var k = 0; k < knightOffsets.length; k++) {
            var kr = r + knightOffsets[k][0];
            var kc = c + knightOffsets[k][1];
            if (kr >= 0 && kr < 8 && kc >= 0 && kc < 8) {
                var kn = this.board[kr * 8 + kc];
                if (kn && kn.color === byColor && kn.type === 'n') return true;
            }
        }

        // 3. Sliding Bishop / Queen (Diagonals)
        var diagOffsets = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        for (var d = 0; d < diagOffsets.length; d++) {
            var dr = r + diagOffsets[d][0];
            var dc = c + diagOffsets[d][1];
            while (dr >= 0 && dr < 8 && dc >= 0 && dc < 8) {
                var dp = this.board[dr * 8 + dc];
                if (dp) {
                    if (dp.color === byColor && (dp.type === 'b' || dp.type === 'q')) return true;
                    break;
                }
                dr += diagOffsets[d][0];
                dc += diagOffsets[d][1];
            }
        }

        // 4. Sliding Rook / Queen (Straights)
        var straightOffsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (var s = 0; s < straightOffsets.length; s++) {
            var sr = r + straightOffsets[s][0];
            var sc = c + straightOffsets[s][1];
            while (sr >= 0 && sr < 8 && sc >= 0 && sc < 8) {
                var sp = this.board[sr * 8 + sc];
                if (sp) {
                    if (sp.color === byColor && (sp.type === 'r' || dp?.type === 'q' || sp.type === 'q')) return true;
                    break;
                }
                sr += straightOffsets[s][0];
                sc += straightOffsets[s][1];
            }
        }

        // 5. King attacks (1 step)
        for (var kr1 = -1; kr1 <= 1; kr1++) {
            for (var kc1 = -1; kc1 <= 1; kc1++) {
                if (kr1 === 0 && kc1 === 0) continue;
                var nr = r + kr1;
                var nc = c + kc1;
                if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                    var kp = this.board[nr * 8 + nc];
                    if (kp && kp.color === byColor && kp.type === 'k') return true;
                }
            }
        }

        return false;
    };

    ChessEngine.prototype.findKing = function(color) {
        for (var i = 0; i < 64; i++) {
            var p = this.board[i];
            if (p && p.color === color && p.type === 'k') return i;
        }
        return -1;
    };

    ChessEngine.prototype.inCheck = function(color) {
        var c = color || this.turn;
        var kSq = this.findKing(c);
        if (kSq === -1) return false;
        var enemy = (c === 'w') ? 'b' : 'w';
        return this.isAttacked(kSq, enemy);
    };

    ChessEngine.prototype.generatePseudoMoves = function(color) {
        var moves = [];
        var c = color || this.turn;
        var enemy = (c === 'w') ? 'b' : 'w';

        for (var sq = 0; sq < 64; sq++) {
            var p = this.board[sq];
            if (!p || p.color !== c) continue;

            var r = Math.floor(sq / 8);
            var col = sq % 8;

            switch (p.type) {
                case 'p':
                    var fDir = (c === 'w') ? -1 : 1;
                    var startRow = (c === 'w') ? 6 : 1;
                    var promoRow = (c === 'w') ? 0 : 7;

                    // 1 square forward
                    var fSq = (r + fDir) * 8 + col;
                    if (r + fDir >= 0 && r + fDir < 8 && this.board[fSq] === null) {
                        if (r + fDir === promoRow) {
                            ['q', 'r', 'b', 'n'].forEach(function(pr) {
                                moves.push({ from: sq, to: fSq, promotion: pr, piece: p });
                            });
                        } else {
                            moves.push({ from: sq, to: fSq, piece: p });
                            // 2 squares forward from starting rank
                            if (r === startRow) {
                                var f2Sq = (r + 2 * fDir) * 8 + col;
                                if (this.board[f2Sq] === null) {
                                    moves.push({ from: sq, to: f2Sq, piece: p, doubleStep: true });
                                }
                            }
                        }
                    }

                    // Diagonal captures
                    [-1, 1].forEach(function(dc) {
                        var tc = col + dc;
                        var tr = r + fDir;
                        if (tc >= 0 && tc < 8 && tr >= 0 && tr < 8) {
                            var tSq = tr * 8 + tc;
                            var tp = this.board[tSq];
                            if (tp && tp.color === enemy) {
                                if (tr === promoRow) {
                                    ['q', 'r', 'b', 'n'].forEach(function(pr) {
                                        moves.push({ from: sq, to: tSq, promotion: pr, piece: p, captured: tp });
                                    });
                                } else {
                                    moves.push({ from: sq, to: tSq, piece: p, captured: tp });
                                }
                            } else if (tSq === this.epSquare) {
                                // En Passant
                                var epCapturedSq = (c === 'w') ? (tSq + 8) : (tSq - 8);
                                var epPiece = this.board[epCapturedSq];
                                moves.push({ from: sq, to: tSq, piece: p, enPassant: true, captured: epPiece });
                            }
                        }
                    }, this);
                    break;

                case 'n':
                    var knightOffsets = [
                        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                        [1, -2], [1, 2], [2, -1], [2, 1]
                    ];
                    for (var k = 0; k < knightOffsets.length; k++) {
                        var nr = r + knightOffsets[k][0];
                        var nc = col + knightOffsets[k][1];
                        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                            var nSq = nr * 8 + nc;
                            var np = this.board[nSq];
                            if (!np) {
                                moves.push({ from: sq, to: nSq, piece: p });
                            } else if (np.color === enemy) {
                                moves.push({ from: sq, to: nSq, piece: p, captured: np });
                            }
                        }
                    }
                    break;

                case 'b':
                case 'r':
                case 'q':
                    var dirs = [];
                    if (p.type === 'b' || p.type === 'q') dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
                    if (p.type === 'r' || p.type === 'q') dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);

                    for (var d = 0; d < dirs.length; d++) {
                        var dr = r + dirs[d][0];
                        var dc = col + dirs[d][1];
                        while (dr >= 0 && dr < 8 && dc >= 0 && dc < 8) {
                            var dSq = dr * 8 + dc;
                            var dp = this.board[dSq];
                            if (!dp) {
                                moves.push({ from: sq, to: dSq, piece: p });
                            } else {
                                if (dp.color === enemy) {
                                    moves.push({ from: sq, to: dSq, piece: p, captured: dp });
                                }
                                break;
                            }
                            dr += dirs[d][0];
                            dc += dirs[d][1];
                        }
                    }
                    break;

                case 'k':
                    for (var kr = -1; kr <= 1; kr++) {
                        for (var kc = -1; kc <= 1; kc++) {
                            if (kr === 0 && kc === 0) continue;
                            var kingR = r + kr;
                            var kingC = col + kc;
                            if (kingR >= 0 && kingR < 8 && kingC >= 0 && kingC < 8) {
                                var kSq = kingR * 8 + kingC;
                                var kp = this.board[kSq];
                                if (!kp) {
                                    moves.push({ from: sq, to: kSq, piece: p });
                                } else if (kp.color === enemy) {
                                    moves.push({ from: sq, to: kSq, piece: p, captured: kp });
                                }
                            }
                        }
                    }

                    // Castling
                    if (c === 'w' && sq === SQUARES.e1) {
                        // Kingside: e1 -> g1 (f1, g1 must be empty, e1, f1, g1 not attacked)
                        if (this.castling.K && !this.board[SQUARES.f1] && !this.board[SQUARES.g1]) {
                            if (!this.isAttacked(SQUARES.e1, 'b') && !this.isAttacked(SQUARES.f1, 'b') && !this.isAttacked(SQUARES.g1, 'b')) {
                                moves.push({ from: sq, to: SQUARES.g1, piece: p, castle: 'K' });
                            }
                        }
                        // Queenside: e1 -> c1 (d1, c1, b1 must be empty, e1, d1, c1 not attacked)
                        if (this.castling.Q && !this.board[SQUARES.d1] && !this.board[SQUARES.c1] && !this.board[SQUARES.b1]) {
                            if (!this.isAttacked(SQUARES.e1, 'b') && !this.isAttacked(SQUARES.d1, 'b') && !this.isAttacked(SQUARES.c1, 'b')) {
                                moves.push({ from: sq, to: SQUARES.c1, piece: p, castle: 'Q' });
                            }
                        }
                    } else if (c === 'b' && sq === SQUARES.e8) {
                        // Kingside: e8 -> g8
                        if (this.castling.k && !this.board[SQUARES.f8] && !this.board[SQUARES.g8]) {
                            if (!this.isAttacked(SQUARES.e8, 'w') && !this.isAttacked(SQUARES.f8, 'w') && !this.isAttacked(SQUARES.g8, 'w')) {
                                moves.push({ from: sq, to: SQUARES.g8, piece: p, castle: 'k' });
                            }
                        }
                        // Queenside: e8 -> c8
                        if (this.castling.q && !this.board[SQUARES.d8] && !this.board[SQUARES.c8] && !this.board[SQUARES.b8]) {
                            if (!this.isAttacked(SQUARES.e8, 'w') && !this.isAttacked(SQUARES.d8, 'w') && !this.isAttacked(SQUARES.c8, 'w')) {
                                moves.push({ from: sq, to: SQUARES.c8, piece: p, castle: 'q' });
                            }
                        }
                    }
                    break;
            }
        }

        return moves;
    };

    ChessEngine.prototype.makeMove = function(m) {
        var p = this.board[m.from];
        var undo = {
            from: m.from,
            to: m.to,
            piece: p,
            captured: this.board[m.to],
            castling: { K: this.castling.K, Q: this.castling.Q, k: this.castling.k, q: this.castling.q },
            epSquare: this.epSquare,
            halfMoves: this.halfMoves,
            moveNumber: this.moveNumber,
            castle: m.castle,
            enPassant: m.enPassant
        };

        // En passant capture execution
        if (m.enPassant) {
            var epSq = (p.color === 'w') ? (m.to + 8) : (m.to - 8);
            undo.captured = this.board[epSq];
            this.board[epSq] = null;
        }

        // Move piece
        this.board[m.to] = m.promotion ? { type: m.promotion, color: p.color } : p;
        this.board[m.from] = null;

        // Castling rook move
        if (m.castle) {
            if (m.castle === 'K') {
                this.board[SQUARES.f1] = this.board[SQUARES.h1];
                this.board[SQUARES.h1] = null;
            } else if (m.castle === 'Q') {
                this.board[SQUARES.d1] = this.board[SQUARES.a1];
                this.board[SQUARES.a1] = null;
            } else if (m.castle === 'k') {
                this.board[SQUARES.f8] = this.board[SQUARES.h8];
                this.board[SQUARES.h8] = null;
            } else if (m.castle === 'q') {
                this.board[SQUARES.d8] = this.board[SQUARES.a8];
                this.board[SQUARES.a8] = null;
            }
        }

        // Update castling rights
        if (p.type === 'k') {
            if (p.color === 'w') { this.castling.K = false; this.castling.Q = false; }
            else { this.castling.k = false; this.castling.q = false; }
        }
        if (p.type === 'r') {
            if (m.from === SQUARES.a1) this.castling.Q = false;
            if (m.from === SQUARES.h1) this.castling.K = false;
            if (m.from === SQUARES.a8) this.castling.q = false;
            if (m.from === SQUARES.h8) this.castling.k = false;
        }
        if (undo.captured && undo.captured.type === 'r') {
            if (m.to === SQUARES.a1) this.castling.Q = false;
            if (m.to === SQUARES.h1) this.castling.K = false;
            if (m.to === SQUARES.a8) this.castling.q = false;
            if (m.to === SQUARES.h8) this.castling.k = false;
        }

        // Update En Passant square
        if (m.doubleStep) {
            this.epSquare = (p.color === 'w') ? (m.from - 8) : (m.from + 8);
        } else {
            this.epSquare = -1;
        }

        // Half moves & move number
        if (p.type === 'p' || undo.captured) {
            this.halfMoves = 0;
        } else {
            this.halfMoves++;
        }

        if (this.turn === 'b') this.moveNumber++;
        this.turn = (this.turn === 'w') ? 'b' : 'w';

        this.history.push(undo);
        return undo;
    };

    ChessEngine.prototype.undoMove = function() {
        var u = this.history.pop();
        if (!u) return null;

        this.turn = (this.turn === 'w') ? 'b' : 'w';
        this.castling = u.castling;
        this.epSquare = u.epSquare;
        this.halfMoves = u.halfMoves;
        this.moveNumber = u.moveNumber;

        this.board[u.from] = u.piece;
        this.board[u.to] = u.enPassant ? null : u.captured;

        if (u.enPassant) {
            var epSq = (u.piece.color === 'w') ? (u.to + 8) : (u.to - 8);
            this.board[epSq] = u.captured;
        }

        if (u.castle) {
            if (u.castle === 'K') {
                this.board[SQUARES.h1] = this.board[SQUARES.f1];
                this.board[SQUARES.f1] = null;
            } else if (u.castle === 'Q') {
                this.board[SQUARES.a1] = this.board[SQUARES.d1];
                this.board[SQUARES.d1] = null;
            } else if (u.castle === 'k') {
                this.board[SQUARES.h8] = this.board[SQUARES.f8];
                this.board[SQUARES.f8] = null;
            } else if (u.castle === 'q') {
                this.board[SQUARES.a8] = this.board[SQUARES.d8];
                this.board[SQUARES.d8] = null;
            }
        }

        return u;
    };

    ChessEngine.prototype.legalMoves = function(color) {
        var pseudo = this.generatePseudoMoves(color || this.turn);
        var legal = [];
        var c = color || this.turn;

        for (var i = 0; i < pseudo.length; i++) {
            var m = pseudo[i];
            this.makeMove(m);
            if (!this.inCheck(c)) {
                legal.push(m);
            }
            this.undoMove();
        }

        return legal;
    };

    ChessEngine.prototype.isCheckmate = function() {
        return this.inCheck() && this.legalMoves().length === 0;
    };

    ChessEngine.prototype.isStalemate = function() {
        return !this.inCheck() && this.legalMoves().length === 0;
    };

    ChessEngine.prototype.isDraw = function() {
        return this.isStalemate() || this.halfMoves >= 100;
    };

    ChessEngine.prototype.getSan = function(move) {
        if (move.castle === 'K' || move.castle === 'k') return 'O-O';
        if (move.castle === 'Q' || move.castle === 'q') return 'O-O-O';

        var p = move.piece;
        var pChar = (p.type === 'p') ? '' : p.type.toUpperCase();
        var fromStr = SQUARES_BY_INDEX[move.from];
        var toStr = SQUARES_BY_INDEX[move.to];
        var isCapture = !!move.captured;

        var san = '';
        if (p.type === 'p') {
            if (isCapture) san += fromStr.charAt(0) + 'x';
            san += toStr;
            if (move.promotion) san += '=' + move.promotion.toUpperCase();
        } else {
            san += pChar;
            if (isCapture) san += 'x';
            san += toStr;
        }

        this.makeMove(move);
        if (this.isCheckmate()) {
            san += '#';
        } else if (this.inCheck()) {
            san += '+';
        }
        this.undoMove();

        return san;
    };

    ChessEngine.SQUARES = SQUARES;
    ChessEngine.SQUARES_BY_INDEX = SQUARES_BY_INDEX;

    window.ChessEngine = ChessEngine;

})(window);
