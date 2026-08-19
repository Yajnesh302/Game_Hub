/* ==========================================================================
   GAME HUB - 2048 Sliding Tile Puzzle Engine
   Features: Smooth CSS Translate Animations, Merge Pop, Undo, Floating Score,
   Touch/Mouse Swipe, Web Audio Integration & High-Score Leaderboard
   ========================================================================== */

(function(window, $) {
    'use strict';

    var SIZE = 4;
    var grid = []; // 4x4 array of Tile objects or null
    var score = 0;
    var bestScore = 0;
    var bestTile = 2;
    var won = false;
    var keepPlaying = false;
    var isMoving = false;
    var tileIdCounter = 1;

    // 1-Level Undo History State
    var previousState = null;

    // DOM References
    var $tilesContainer;
    var $scoreDisplay;
    var $bestScoreDisplay;
    var $undoBtn;

    var Game2048 = {
        init: function() {
            $tilesContainer = $('#tiles-container');
            $scoreDisplay = $('#current-score');
            $bestScoreDisplay = $('#best-score');
            $undoBtn = $('#undo-btn');

            this.loadBestScore();
            this.bindEvents();
            this.loadLeaderboard();
            this.newGame();
        },

        loadBestScore: function() {
            try {
                var saved = localStorage.getItem('gamehub_2048_best');
                if (saved) {
                    bestScore = parseInt(saved, 10) || 0;
                    $bestScoreDisplay.text(bestScore);
                }
            } catch (e) {
                bestScore = 0;
            }
        },

        saveBestScore: function() {
            try {
                localStorage.setItem('gamehub_2048_best', bestScore.toString());
            } catch (e) {}
        },

        newGame: function() {
            grid = this.createEmptyGrid();
            score = 0;
            bestTile = 2;
            won = false;
            keepPlaying = false;
            previousState = null;
            isMoving = false;

            this.updateScore(0);
            $undoBtn.prop('disabled', true);

            // Spawn two starting tiles
            this.spawnRandomTile();
            this.spawnRandomTile();

            this.render();
        },

        createEmptyGrid: function() {
            var g = [];
            for (var r = 0; r < SIZE; r++) {
                g[r] = [];
                for (var c = 0; c < SIZE; c++) {
                    g[r][c] = null;
                }
            }
            return g;
        },

        saveUndoState: function() {
            var gridClone = [];
            for (var r = 0; r < SIZE; r++) {
                gridClone[r] = [];
                for (var c = 0; c < SIZE; c++) {
                    var t = grid[r][c];
                    gridClone[r][c] = t ? { id: t.id, value: t.value, r: t.r, c: t.c } : null;
                }
            }

            previousState = {
                grid: gridClone,
                score: score,
                bestScore: bestScore,
                bestTile: bestTile,
                won: won
            };

            $undoBtn.prop('disabled', false);
        },

        undo: function() {
            if (!previousState || isMoving) return;

            grid = [];
            for (var r = 0; r < SIZE; r++) {
                grid[r] = [];
                for (var c = 0; c < SIZE; c++) {
                    var t = previousState.grid[r][c];
                    grid[r][c] = t ? { id: t.id, value: t.value, r: t.r, c: t.c } : null;
                }
            }

            score = previousState.score;
            bestScore = previousState.bestScore;
            bestTile = previousState.bestTile;
            won = previousState.won;

            $scoreDisplay.text(score);
            $bestScoreDisplay.text(bestScore);

            previousState = null;
            $undoBtn.prop('disabled', true);

            this.render();
            if (window.GameAudio) window.GameAudio.playTileSlide();
        },

        getEmptyCells: function() {
            var empty = [];
            for (var r = 0; r < SIZE; r++) {
                for (var c = 0; c < SIZE; c++) {
                    if (!grid[r][c]) {
                        empty.push({ r: r, c: c });
                    }
                }
            }
            return empty;
        },

        spawnRandomTile: function() {
            var empty = this.getEmptyCells();
            if (empty.length === 0) return null;

            var spot = empty[Math.floor(Math.random() * empty.length)];
            // 90% chance of 2, 10% chance of 4
            var val = (Math.random() < 0.9) ? 2 : 4;

            var tile = {
                id: tileIdCounter++,
                value: val,
                r: spot.r,
                c: spot.c,
                previousR: spot.r,
                previousC: spot.c,
                isNew: true
            };

            grid[spot.r][spot.c] = tile;
            return tile;
        },

        move: function(direction) {
            // direction: 0 = Up, 1 = Right, 2 = Down, 3 = Left
            if (isMoving) return;

            var vectors = [
                { r: -1, c: 0 },  // Up
                { r: 0, c: 1 },   // Right
                { r: 1, c: 0 },   // Down
                { r: 0, c: -1 }   // Left
            ];

            var vector = vectors[direction];
            var traversals = this.buildTraversals(vector);
            var moved = false;
            var scoreGained = 0;
            var highestMerged = 0;

            // Prepare tiles: clear merge and isNew flags
            for (var r = 0; r < SIZE; r++) {
                for (var c = 0; c < SIZE; c++) {
                    if (grid[r][c]) {
                        grid[r][c].mergedFrom = null;
                        grid[r][c].isNew = false;
                        grid[r][c].previousR = grid[r][c].r;
                        grid[r][c].previousC = grid[r][c].c;
                    }
                }
            }

            // Save undo state before making move
            var stateBefore = {
                grid: grid,
                score: score,
                bestScore: bestScore,
                bestTile: bestTile,
                won: won
            };

            // Execute Movement
            traversals.r.forEach(function(row) {
                traversals.c.forEach(function(col) {
                    var cell = { r: row, c: col };
                    var tile = grid[cell.r][cell.c];

                    if (tile) {
                        var positions = Game2048.findFarthestPosition(cell, vector);
                        var next = grid[positions.next.r] ? grid[positions.next.r][positions.next.c] : null;

                        // Classic merge rule: same value and target hasn't already merged this turn
                        if (next && next.value === tile.value && !next.mergedFrom) {
                            var mergedTile = {
                                id: tileIdCounter++,
                                value: tile.value * 2,
                                r: positions.next.r,
                                c: positions.next.c,
                                mergedFrom: [tile, next]
                            };

                            grid[cell.r][cell.c] = null;
                            grid[positions.next.r][positions.next.c] = mergedTile;

                            tile.r = positions.next.r;
                            tile.c = positions.next.c;

                            scoreGained += mergedTile.value;
                            if (mergedTile.value > highestMerged) highestMerged = mergedTile.value;
                            if (mergedTile.value > bestTile) bestTile = mergedTile.value;

                            moved = true;
                        } else {
                            if (positions.farthest.r !== cell.r || positions.farthest.c !== cell.c) {
                                grid[cell.r][cell.c] = null;
                                grid[positions.farthest.r][positions.farthest.c] = tile;

                                tile.r = positions.farthest.r;
                                tile.c = positions.farthest.c;

                                moved = true;
                            }
                        }
                    }
                });
            });

            if (moved) {
                // Save undo snapshot
                this.saveUndoState();

                isMoving = true;

                if (scoreGained > 0) {
                    this.updateScore(score + scoreGained, scoreGained);
                    if (window.GameAudio) window.GameAudio.playTileMerge(highestMerged);
                } else {
                    if (window.GameAudio) window.GameAudio.playTileSlide();
                }

                // Render moving animation
                this.render();

                // Spawn new tile after slide completes
                setTimeout(function() {
                    Game2048.spawnRandomTile();
                    Game2048.render();
                    isMoving = false;

                    // Check Win Condition (2048 tile reached)
                    if (!won && !keepPlaying && highestMerged >= 2048) {
                        won = true;
                        if (window.GameAudio) window.GameAudio.play2048Win();
                        window.App.showGameModal({
                            title: "You Reached 2048! 🎉",
                            text: "Incredible mastery! You conquered the 2048 tile with a score of " + score + ". Would you like to keep playing for a higher score?",
                            isWin: true,
                            onRematch: function() {
                                keepPlaying = true;
                                window.App.hideGameModal();
                            }
                        });
                    }

                    // Check Game Over
                    if (!Game2048.movesAvailable()) {
                        if (window.GameAudio) window.GameAudio.playGameOver();
                        Game2048.handleGameOver();
                    }
                }, 120);
            }
        },

        buildTraversals: function(vector) {
            var traversals = { r: [], c: [] };
            for (var pos = 0; pos < SIZE; pos++) {
                traversals.r.push(pos);
                traversals.c.push(pos);
            }

            // Always traverse from the farthest cell in the direction of motion
            if (vector.r === 1) traversals.r = traversals.r.reverse();
            if (vector.c === 1) traversals.c = traversals.c.reverse();

            return traversals;
        },

        findFarthestPosition: function(cell, vector) {
            var previous;
            do {
                previous = cell;
                cell = { r: previous.r + vector.r, c: previous.c + vector.c };
            } while (this.withinBounds(cell) && !grid[cell.r][cell.c]);

            return {
                farthest: previous,
                next: cell
            };
        },

        withinBounds: function(cell) {
            return cell.r >= 0 && cell.r < SIZE && cell.c >= 0 && cell.c < SIZE;
        },

        movesAvailable: function() {
            if (this.getEmptyCells().length > 0) return true;

            for (var r = 0; r < SIZE; r++) {
                for (var c = 0; c < SIZE; c++) {
                    var tile = grid[r][c];
                    if (tile) {
                        var vectors = [{ r: 1, c: 0 }, { r: 0, c: 1 }];
                        for (var i = 0; i < vectors.length; i++) {
                            var v = vectors[i];
                            var neighbor = { r: r + v.r, c: c + v.c };
                            if (this.withinBounds(neighbor)) {
                                var other = grid[neighbor.r][neighbor.c];
                                if (other && other.value === tile.value) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
            return false;
        },

        updateScore: function(newScore, scoreGain) {
            score = newScore;
            $scoreDisplay.text(score);

            if (score > bestScore) {
                bestScore = score;
                $bestScoreDisplay.text(bestScore);
                this.saveBestScore();
            }

            if (scoreGain && scoreGain > 0) {
                var $floating = $('<div class="game2048-floating-score">+' + scoreGain + '</div>');
                $('#score-box-wrapper').append($floating);
                setTimeout(function() {
                    $floating.remove();
                }, 600);
            }
        },

        render: function() {
            $tilesContainer.empty();

            for (var r = 0; r < SIZE; r++) {
                for (var c = 0; c < SIZE; c++) {
                    var tile = grid[r][c];
                    if (tile) {
                        var tileClass = 'tile-' + (tile.value > 2048 ? 'super' : tile.value);
                        var animClass = tile.isNew ? 'tile-new' : (tile.mergedFrom ? 'tile-merged' : '');

                        // Calculate translation percentage
                        var xPercent = c * 100;
                        var yPercent = r * 100;
                        var gapOffset = (c * 12) + 'px';
                        var gapOffsetY = (r * 12) + 'px';

                        var transformStyle = 'transform: translate(calc(' + c + '00% + ' + (c * 12) + 'px), calc(' + r + '00% + ' + (r * 12) + 'px));';

                        var $tileEl = $(
                            '<div class="game2048-tile ' + tileClass + ' ' + animClass + '" style="' + transformStyle + '">' +
                                '<div class="game2048-tile-inner">' + tile.value + '</div>' +
                            '</div>'
                        );

                        $tilesContainer.append($tileEl);
                    }
                }
            }
        },

        handleGameOver: function() {
            var playerName = window.App ? window.App.getPlayerName() : "Player";
            var self = this;

            this.submitScore(playerName, score, bestTile);

            window.App.showGameModal({
                title: "Game Over",
                text: "No moves remaining! Final Score: " + score + " | Best Tile: " + bestTile,
                isWin: false,
                onRematch: function() {
                    self.newGame();
                }
            });
        },

        submitScore: function(playerName, finalScore, highestTile) {
            var self = this;
            $.ajax({
                type: "POST",
                url: "Game2048.aspx/SaveScore",
                data: JSON.stringify({ playerName: playerName, score: finalScore, bestTile: highestTile }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(response) {
                    self.loadLeaderboard();
                },
                error: function(err) {
                    console.warn("Could not save 2048 score:", err);
                }
            });
        },

        loadLeaderboard: function() {
            $.ajax({
                type: "POST",
                url: "Game2048.aspx/GetLeaderboard",
                data: "{}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(response) {
                    var records = response.d || [];
                    var $tbody = $('#leaderboard-2048-body');
                    $tbody.empty();

                    if (records.length === 0) {
                        $tbody.append('<tr><td colspan="4" style="text-align:center; color: var(--text-muted); padding: 14px;">No high scores recorded yet. Be the first!</td></tr>');
                        return;
                    }

                    records.forEach(function(rec, idx) {
                        var rankBadge = (idx === 0) ? '🥇 ' : ((idx === 1) ? '🥈 ' : ((idx === 2) ? '🥉 ' : (idx + 1) + '. '));
                        $tbody.append(
                            '<tr>' +
                                '<td>' + rankBadge + rec.PlayerName + '</td>' +
                                '<td style="font-weight: 700; color: #38bdf8;">' + rec.Score + '</td>' +
                                '<td><span class="archery-score-pill" style="width: auto; height: auto; padding: 2px 8px; border-radius: 4px;">' + rec.BestTile + '</span></td>' +
                                '<td style="color: var(--text-muted); font-size: 0.75rem;">' + rec.FormattedDate + '</td>' +
                            '</tr>'
                        );
                    });
                }
            });
        },

        bindEvents: function() {
            var self = this;

            // Keyboard Arrow & WASD Navigation
            $(document).on('keydown', function(e) {
                var map = {
                    38: 0, // Up
                    39: 1, // Right
                    40: 2, // Down
                    37: 3, // Left
                    87: 0, // W
                    68: 1, // D
                    83: 2, // S
                    65: 3  // A
                };

                if (map[e.which] !== undefined) {
                    e.preventDefault();
                    self.move(map[e.which]);
                }
            });

            // Touch & Mouse Swipe Navigation
            var startX = 0;
            var startY = 0;
            var isPointerDown = false;
            var boardEl = document.getElementById('game2048-board');

            if (boardEl) {
                function onPointerStart(x, y) {
                    startX = x;
                    startY = y;
                    isPointerDown = true;
                }

                function onPointerEnd(x, y) {
                    if (!isPointerDown) return;
                    isPointerDown = false;

                    var dx = x - startX;
                    var dy = y - startY;
                    var absDx = Math.abs(dx);
                    var absDy = Math.abs(dy);

                    if (Math.max(absDx, absDy) > 28) {
                        if (absDx > absDy) {
                            // Horizontal Swipe
                            self.move(dx > 0 ? 1 : 3);
                        } else {
                            // Vertical Swipe
                            self.move(dy > 0 ? 2 : 0);
                        }
                    }
                }

                // Touch Events
                boardEl.addEventListener('touchstart', function(e) {
                    if (e.touches.length > 0) {
                        onPointerStart(e.touches[0].clientX, e.touches[0].clientY);
                    }
                }, { passive: true });

                boardEl.addEventListener('touchend', function(e) {
                    if (e.changedTouches.length > 0) {
                        onPointerEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                    }
                }, { passive: true });

                // Mouse Drag Events
                $(boardEl).on('mousedown', function(e) {
                    onPointerStart(e.clientX, e.clientY);
                });

                $(window).on('mouseup', function(e) {
                    if (isPointerDown) {
                        onPointerEnd(e.clientX, e.clientY);
                    }
                });
            }

            $('#new-game-btn').on('click', function() {
                self.newGame();
            });

            $undoBtn.on('click', function() {
                self.undo();
            });
        }
    };

    $(document).ready(function() {
        Game2048.init();
    });

    window.Game2048 = Game2048;

})(window, jQuery);
