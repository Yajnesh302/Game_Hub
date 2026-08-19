/* ==========================================================================
   GAME HUB - Minimax Alpha-Beta Chess AI Engine
   Features: Material Evaluation, Piece-Square Positional Tables,
   MVV-LVA Capture Ordering, Alpha-Beta Pruning (Easy/Medium/Hard)
   ========================================================================== */

(function(window) {
    'use strict';

    var PIECE_VALUES = {
        p: 100,
        n: 320,
        b: 330,
        r: 500,
        q: 900,
        k: 20000
    };

    // Standard Simplified Piece-Square Tables (Midgame)
    var PST_PAWN = [
         0,  0,  0,  0,  0,  0,  0,  0,
        50, 50, 50, 50, 50, 50, 50, 50,
        10, 10, 20, 30, 30, 20, 10, 10,
         5,  5, 10, 25, 25, 10,  5,  5,
         0,  0,  0, 20, 20,  0,  0,  0,
         5, -5,-10,  0,  0,-10, -5,  5,
         5, 10, 10,-20,-20, 10, 10,  5,
         0,  0,  0,  0,  0,  0,  0,  0
    ];

    var PST_KNIGHT = [
        -50,-40,-30,-30,-30,-30,-40,-50,
        -40,-20,  0,  0,  0,  0,-20,-40,
        -30,  0, 10, 15, 15, 10,  0,-30,
        -30,  5, 15, 20, 20, 15,  5,-30,
        -30,  0, 15, 20, 20, 15,  0,-30,
        -30,  5, 10, 15, 15, 10,  5,-30,
        -40,-20,  0,  5,  5,  0,-20,-40,
        -50,-40,-30,-30,-30,-30,-40,-50
    ];

    var PST_BISHOP = [
        -20,-10,-10,-10,-10,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0,  5, 10, 10,  5,  0,-10,
        -10,  5,  5, 10, 10,  5,  5,-10,
        -10,  0, 10, 10, 10, 10,  0,-10,
        -10, 10, 10, 10, 10, 10, 10,-10,
        -10,  5,  0,  0,  0,  0,  5,-10,
        -20,-10,-10,-10,-10,-10,-10,-20
    ];

    var PST_ROOK = [
          0,  0,  0,  0,  0,  0,  0,  0,
          5, 10, 10, 10, 10, 10, 10,  5,
         -5,  0,  0,  0,  0,  0,  0, -5,
         -5,  0,  0,  0,  0,  0,  0, -5,
         -5,  0,  0,  0,  0,  0,  0, -5,
         -5,  0,  0,  0,  0,  0,  0, -5,
         -5,  0,  0,  0,  0,  0,  0, -5,
          0,  0,  0,  5,  5,  0,  0,  0
    ];

    var PST_QUEEN = [
        -20,-10,-10, -5, -5,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0,  5,  5,  5,  5,  0,-10,
         -5,  0,  5,  5,  5,  5,  0, -5,
          0,  0,  5,  5,  5,  5,  0, -5,
        -10,  5,  5,  5,  5,  5,  0,-10,
        -10,  0,  5,  0,  0,  0,  0,-10,
        -20,-10,-10, -5, -5,-10,-10,-20
    ];

    var PST_KING_MID = [
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -20,-30,-30,-40,-40,-30,-30,-20,
        -10,-20,-20,-20,-20,-20,-20,-10,
         20, 20,  0,  0,  0,  0, 20, 20,
         20, 30, 10,  0,  0, 10, 30, 20
    ];

    function getPstBonus(type, color, sq) {
        // Table index for White: mirrored for Black
        var idx = (color === 'w') ? sq : (63 - sq);
        switch (type) {
            case 'p': return PST_PAWN[idx];
            case 'n': return PST_KNIGHT[idx];
            case 'b': return PST_BISHOP[idx];
            case 'r': return PST_ROOK[idx];
            case 'q': return PST_QUEEN[idx];
            case 'k': return PST_KING_MID[idx];
        }
        return 0;
    }

    function evaluateBoard(engine) {
        var score = 0;
        for (var sq = 0; sq < 64; sq++) {
            var p = engine.board[sq];
            if (!p) continue;

            var val = PIECE_VALUES[p.type] + getPstBonus(p.type, p.color, sq);
            if (p.color === 'w') score += val;
            else score -= val;
        }
        return score;
    }

    function orderMoves(moves) {
        return moves.sort(function(a, b) {
            var aScore = 0;
            var bScore = 0;

            // MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
            if (a.captured) aScore += PIECE_VALUES[a.captured.type] * 10 - PIECE_VALUES[a.piece.type];
            if (b.captured) bScore += PIECE_VALUES[b.captured.type] * 10 - PIECE_VALUES[b.piece.type];

            if (a.promotion) aScore += 800;
            if (b.promotion) bScore += 800;

            return bScore - aScore;
        });
    }

    var ChessBot = {
        getBestMove: function(engine, difficulty) {
            var moves = engine.legalMoves();
            if (moves.length === 0) return null;

            var diff = (difficulty || 'medium').toLowerCase();
            var botColor = engine.turn;

            if (diff === 'easy') {
                // Easy: 70% prefers capture or check, otherwise random
                var captures = moves.filter(function(m) { return !!m.captured || !!m.promotion; });
                if (captures.length > 0 && Math.random() < 0.7) {
                    return captures[Math.floor(Math.random() * captures.length)];
                }
                return moves[Math.floor(Math.random() * moves.length)];
            }

            var maxDepth = (diff === 'hard') ? 3 : 2;
            var isMaximizing = (botColor === 'w');
            var bestScore = isMaximizing ? -Infinity : Infinity;
            var bestMove = moves[0];

            var sortedMoves = orderMoves(moves);

            for (var i = 0; i < sortedMoves.length; i++) {
                var m = sortedMoves[i];
                engine.makeMove(m);

                var evalScore = this.minimax(engine, maxDepth - 1, -Infinity, Infinity, !isMaximizing);
                engine.undoMove();

                if (isMaximizing) {
                    if (evalScore > bestScore) {
                        bestScore = evalScore;
                        bestMove = m;
                    }
                } else {
                    if (evalScore < bestScore) {
                        bestScore = evalScore;
                        bestMove = m;
                    }
                }
            }

            return bestMove;
        },

        minimax: function(engine, depth, alpha, beta, isMaximizing) {
            if (depth === 0) {
                return evaluateBoard(engine);
            }

            var moves = engine.legalMoves();
            if (moves.length === 0) {
                if (engine.inCheck()) {
                    return isMaximizing ? -25000 : 25000; // Checkmate
                }
                return 0; // Stalemate
            }

            var sortedMoves = orderMoves(moves);

            if (isMaximizing) {
                var maxEval = -Infinity;
                for (var i = 0; i < sortedMoves.length; i++) {
                    engine.makeMove(sortedMoves[i]);
                    var evalScore = this.minimax(engine, depth - 1, alpha, beta, false);
                    engine.undoMove();

                    maxEval = Math.max(maxEval, evalScore);
                    alpha = Math.max(alpha, evalScore);
                    if (beta <= alpha) break;
                }
                return maxEval;
            } else {
                var minEval = Infinity;
                for (var j = 0; j < sortedMoves.length; j++) {
                    engine.makeMove(sortedMoves[j]);
                    var evalScore2 = this.minimax(engine, depth - 1, alpha, beta, true);
                    engine.undoMove();

                    minEval = Math.min(minEval, evalScore2);
                    beta = Math.min(beta, evalScore2);
                    if (beta <= alpha) break;
                }
                return minEval;
            }
        }
    };

    window.ChessBot = ChessBot;

})(window);
