/* ==========================================================================
   GAME HUB - Memory Matrix: Cyber Recall (Visual Working Memory Engine)
   Features:
   - Dynamic 3x3 to 6x6 Grid Scaling with High-Energy Neon Pattern Flash
   - Spatial Matrix Rotation Transforms (90° / 180° Mental Rotation)
   - Combo Multipliers, Neural Shields (Lives), and Speed Precision Scoring
   - Real-Time LAN Multiplayer Sudden Death Race with Live Opponent Radar
   ========================================================================== */

(function(window, $) {
    'use strict';

    var isMultiplayer = false;
    var sessionId = null;
    var difficulty = "medium";
    var myPlayerName = "Player";
    var opponentPlayerName = "Opponent";
    var isP1 = true;
    var isGameOver = false;

    // Game Variables
    var currentLevel = 1;
    var score = 0;
    var lives = 3;
    var comboStreak = 0;
    var gridSize = 3; // 3, 4, 5, or 6
    var targetCount = 3;
    var rotationAngle = 0; // 0, 90, 180, 270
    var targetTileIndices = []; // Indices in original unrotated grid
    var activeTargetSet = {}; // Map of target indices in current rotated coordinates
    var revealedIndices = {};
    var errorIndices = {};
    var isRecallActive = false;
    var recallStartTime = 0;
    var gameStartTime = Date.now();
    var flashTimeoutId = null;

    // Level Config Generator
    function getLevelConfig(lvl) {
        var size = 3;
        var targets = 3;
        var flashMs = 1600;
        var rotation = 0;

        if (lvl === 1) {
            size = 3; targets = 3; flashMs = 1700; rotation = 0;
        } else if (lvl === 2) {
            size = 3; targets = 4; flashMs = 1600; rotation = 0;
        } else if (lvl === 3) {
            size = 3; targets = 4; flashMs = 1500; rotation = 90;
        } else if (lvl === 4) {
            size = 4; targets = 4; flashMs = 1800; rotation = 0;
        } else if (lvl === 5) {
            size = 4; targets = 5; flashMs = 1700; rotation = 90;
        } else if (lvl === 6) {
            size = 4; targets = 6; flashMs = 1600; rotation = 180;
        } else if (lvl === 7) {
            size = 5; targets = 6; flashMs = 2000; rotation = 0;
        } else if (lvl === 8) {
            size = 5; targets = 7; flashMs = 1900; rotation = 90;
        } else if (lvl === 9) {
            size = 5; targets = 8; flashMs = 1800; rotation = 270;
        } else if (lvl === 10) {
            size = 5; targets = 9; flashMs = 1700; rotation = 180;
        } else {
            // Level 11+
            size = 6;
            targets = Math.min(10 + (lvl - 11), 14);
            flashMs = Math.max(1600 - (lvl - 11) * 50, 1200);
            var rotations = [0, 90, 180, 270];
            rotation = rotations[lvl % 4];
        }

        // Adjust if easy difficulty
        if (difficulty === 'easy') {
            rotation = 0;
            flashMs += 400;
        }

        return {
            size: size,
            targets: targets,
            flashMs: flashMs,
            rotation: rotation
        };
    }

    var MemoryMatrix = {
        init: function() {
            var urlParams = new URLSearchParams(window.location.search);
            sessionId = urlParams.get('session');
            difficulty = urlParams.get('diff') || 'medium';
            var p1Url = urlParams.get('p1') || '';
            var p2Url = urlParams.get('p2') || '';

            myPlayerName = window.App ? window.App.getPlayerName() : "Player";

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
            opponentPlayerName = "Cyber AI";
            isP1 = true;

            $('#p1-name').text(myPlayerName);
            $('#p2-name').text(opponentPlayerName);
            $('#p1-avatar-letter').text(myPlayerName.charAt(0).toUpperCase());
            $('#p2-avatar-letter').text('AI');
            $('#game-mode-badge').text('🧠 Memory Matrix: Neural Climb');

            $('#opponent-radar-panel').hide();

            this.resetGame();
        },

        initMultiplayer: function(p1Url, p2Url) {
            $('#game-mode-badge').text('⚔️ LAN Sudden Death Duel');
            var self = this;
            var myName = window.App ? window.App.getPlayerName() : "Player";

            isP1 = true;
            if (p1Url && p2Url) {
                if (myName.toLowerCase() === p2Url.toLowerCase()) isP1 = false;
            }

            opponentPlayerName = isP1 ? (p2Url || "Opponent") : (p1Url || "Opponent");
            var p1DisplayName = isP1 ? myName : (p1Url || "Player 1");
            var p2DisplayName = isP1 ? (p2Url || "Player 2") : myName;

            $('#p1-name').text(p1DisplayName);
            $('#p2-name').text(p2DisplayName);
            $('#p1-avatar-letter').text(p1DisplayName.charAt(0).toUpperCase());
            $('#p2-avatar-letter').text(p2DisplayName.charAt(0).toUpperCase());

            $('#opponent-radar-panel').show();
            $('#opponent-radar-name').text(opponentPlayerName);

            window.GameHubClient.init(function(hub) {
                hub.client.memoryMatrixProgressReceived = function(data) {
                    if (!data) return;
                    self.updateOpponentRadar(data);
                };

                hub.client.memoryMatrixGameFinished = function(result) {
                    var isMeWinner = (result.WinnerPlayerId === window.GameHubClient.hub.connection.id);
                    self.showGameOverModal(isMeWinner, result.ExtraData.winnerName, result.ExtraData.levelReached, result.ExtraData.score);
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
            }, function(connId) {
                window.GameHubClient.hub.server.joinSession(sessionId, myName, 14, p1Url, p2Url);
            });

            this.resetGame();
        },

        resetGame: function() {
            currentLevel = 1;
            score = 0;
            lives = 3;
            comboStreak = 0;
            isGameOver = false;
            gameStartTime = Date.now();

            this.updateStatsDisplay();
            this.startRound();
        },

        updateStatsDisplay: function() {
            $('#current-level-badge').text('Stage ' + currentLevel);
            $('#current-score-badge').text(score.toLocaleString() + ' PTS');
            $('#current-combo-badge').text(comboStreak > 1 ? ('🔥 ' + comboStreak + 'x Streak') : '1x Multiplier');

            // Render 3 Neural Shields (Lives)
            var shieldHtml = '';
            for (var i = 0; i < 3; i++) {
                if (i < lives) {
                    shieldHtml += '<span class="shield-icon active" title="Neural Shield Active">🛡️</span>';
                } else {
                    shieldHtml += '<span class="shield-icon broken" title="Shield Depleted">💔</span>';
                }
            }
            $('#neural-shields-container').html(shieldHtml);
        },

        startRound: function() {
            if (isGameOver) return;

            var config = getLevelConfig(currentLevel);
            gridSize = config.size;
            targetCount = config.targets;
            rotationAngle = config.rotation;
            revealedIndices = {};
            errorIndices = {};
            isRecallActive = false;

            this.updateStatsDisplay();
            this.generateTargetPattern();
            this.renderGrid();

            // Phase 1: Memorization Flash
            $('#phase-indicator').text('⚡ MEMORIZE PATTERN').css('color', '#38bdf8');
            $('#status-subtext').text('Memorize ' + targetCount + ' active memory nodes');
            if (rotationAngle > 0) {
                $('#rotation-warning-badge').show().text('🔄 Matrix will rotate ' + rotationAngle + '°!');
            } else {
                $('#rotation-warning-badge').hide();
            }

            // Animate progress countdown bar
            var $bar = $('#countdown-energy-bar');
            $bar.stop().css({ width: '100%', transition: 'none' });
            setTimeout(function() {
                $bar.css({ width: '0%', transition: 'width ' + (config.flashMs / 1000) + 's linear' });
            }, 50);

            // Light up target tiles
            var $tiles = $('.matrix-tile');
            for (var i = 0; i < targetTileIndices.length; i++) {
                $($tiles[targetTileIndices[i]]).addClass('flashing-target');
            }

            if (window.GameAudio && window.GameAudio.playMemoryFlash) {
                window.GameAudio.playMemoryFlash();
            }

            var self = this;
            clearTimeout(flashTimeoutId);
            flashTimeoutId = setTimeout(function() {
                self.endMemorizePhase();
            }, config.flashMs);
        },

        generateTargetPattern: function() {
            var totalTiles = gridSize * gridSize;
            var indices = [];
            for (var i = 0; i < totalTiles; i++) indices.push(i);

            // Seeded shuffle or random shuffle
            for (var i = indices.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = indices[i];
                indices[i] = indices[j];
                indices[j] = temp;
            }

            targetTileIndices = indices.slice(0, targetCount);

            // Calculate new target positions after rotation transformation
            activeTargetSet = {};
            for (var i = 0; i < targetTileIndices.length; i++) {
                var origIdx = targetTileIndices[i];
                var rotatedIdx = this.rotateIndex(origIdx, gridSize, rotationAngle);
                activeTargetSet[rotatedIdx] = true;
            }
        },

        rotateIndex: function(idx, size, angle) {
            if (angle === 0) return idx;

            var r = Math.floor(idx / size);
            var c = idx % size;
            var newR = r;
            var newC = c;

            if (angle === 90) {
                newR = c;
                newC = size - 1 - r;
            } else if (angle === 180) {
                newR = size - 1 - r;
                newC = size - 1 - c;
            } else if (angle === 270) {
                newR = size - 1 - c;
                newC = r;
            }

            return newR * size + newC;
        },

        renderGrid: function() {
            var $grid = $('#matrix-grid');
            $grid.empty().removeClass('rotating-90 rotating-180 rotating-270');

            // Dynamic grid layout
            $grid.css({
                'grid-template-columns': 'repeat(' + gridSize + ', 1fr)',
                'grid-template-rows': 'repeat(' + gridSize + ', 1fr)'
            });

            var totalTiles = gridSize * gridSize;
            for (var i = 0; i < totalTiles; i++) {
                var $tile = $('<div class="matrix-tile" data-idx="' + i + '"><div class="tile-glow-inner"></div></div>');
                $grid.append($tile);
            }
        },

        endMemorizePhase: function() {
            var self = this;
            var $tiles = $('.matrix-tile');
            $tiles.removeClass('flashing-target');

            var config = getLevelConfig(currentLevel);

            if (config.rotation > 0) {
                $('#phase-indicator').text('🔄 TRANSFORMING MATRIX...').css('color', '#c084fc');
                var $grid = $('#matrix-grid');

                $grid.addClass('transforming-spin');
                setTimeout(function() {
                    $grid.removeClass('transforming-spin');
                    self.startRecallPhase();
                }, 600);
            } else {
                this.startRecallPhase();
            }
        },

        startRecallPhase: function() {
            isRecallActive = true;
            recallStartTime = Date.now();

            $('#phase-indicator').text('🎯 RECALL ACTIVE: TAP TARGETS').css('color', '#10b981');
            $('#status-subtext').text('Select all ' + targetCount + ' recalled memory nodes');
        },

        bindEvents: function() {
            var self = this;

            $('#matrix-grid').on('click', '.matrix-tile', function(e) {
                e.preventDefault();
                if (!isRecallActive || isGameOver) return;

                var idx = parseInt($(this).data('idx'), 10);
                self.handleTileClick(idx, $(this));
            });

            $('#forfeit-game-btn').on('click', function(e) {
                e.preventDefault();
                if (confirm("Exit Memory Matrix Match?")) {
                    if (isMultiplayer && window.GameHubClient.isConnected()) {
                        window.GameHubClient.hub.server.leaveGame(sessionId);
                    }
                    window.location.href = "../Default.aspx";
                }
            });
        },

        handleTileClick: function(idx, $tile) {
            // Check if already clicked
            if (revealedIndices[idx] || errorIndices[idx]) return;

            if (activeTargetSet[idx]) {
                // Correct target tile!
                revealedIndices[idx] = true;
                $tile.addClass('tile-correct');

                if (window.GameAudio && window.GameAudio.playMemoryCorrect) {
                    window.GameAudio.playMemoryCorrect();
                }

                // Transmit multiplayer telemetry
                if (isMultiplayer && window.GameHubClient.isConnected()) {
                    window.GameHubClient.hub.server.sendMemoryMatrixProgress(sessionId, {
                        level: currentLevel,
                        foundCount: Object.keys(revealedIndices).length,
                        totalTargets: targetCount,
                        lives: lives,
                        score: score
                    });
                }

                // Check if all targets found
                if (Object.keys(revealedIndices).length === targetCount) {
                    this.handleRoundComplete();
                }
            } else {
                // Incorrect tile click
                errorIndices[idx] = true;
                $tile.addClass('tile-wrong');

                if (window.GameAudio && window.GameAudio.playMemoryError) {
                    window.GameAudio.playMemoryError();
                }

                lives--;
                comboStreak = 0;
                this.updateStatsDisplay();

                // Transmit telemetry
                if (isMultiplayer && window.GameHubClient.isConnected()) {
                    window.GameHubClient.hub.server.sendMemoryMatrixProgress(sessionId, {
                        level: currentLevel,
                        foundCount: Object.keys(revealedIndices).length,
                        totalTargets: targetCount,
                        lives: lives,
                        score: score
                    });
                }

                if (lives <= 0) {
                    this.handleGameOver();
                }
            }
        },

        handleRoundComplete: function() {
            isRecallActive = false;
            comboStreak++;

            var elapsedSeconds = Math.max((Date.now() - recallStartTime) / 1000, 0.5);
            var speedBonus = Math.max(Math.round((5.0 - elapsedSeconds) * 60), 0);
            var multiplier = Math.min(1 + (comboStreak - 1) * 0.5, 3.0);
            var roundScore = Math.round((targetCount * 100 * (gridSize / 3) + speedBonus) * multiplier);

            score += roundScore;
            this.updateStatsDisplay();

            if (window.GameAudio && window.GameAudio.playMemoryRoundClear) {
                window.GameAudio.playMemoryRoundClear();
            }

            $('#phase-indicator').text('🌟 MATRIX CLEARED! +' + roundScore + ' PTS').css('color', '#34d399');

            var self = this;
            setTimeout(function() {
                currentLevel++;
                self.startRound();
            }, 1000);
        },

        handleGameOver: function() {
            isGameOver = true;
            isRecallActive = false;

            // Reveal missed targets in glowing amber
            var $tiles = $('.matrix-tile');
            for (var k in activeTargetSet) {
                if (!revealedIndices[k]) {
                    $($tiles[parseInt(k, 10)]).addClass('tile-missed');
                }
            }

            if (isMultiplayer && window.GameHubClient.isConnected()) {
                window.GameHubClient.hub.server.finishMemoryMatrixGame(sessionId, currentLevel, score);
            } else {
                var self = this;
                setTimeout(function() {
                    self.showGameOverModal(true, myPlayerName, currentLevel, score);
                }, 800);
            }
        },

        updateOpponentRadar: function(data) {
            $('#opponent-radar-stage').text('Stage ' + data.level + ' (' + data.score.toLocaleString() + ' PTS)');
            $('#opponent-radar-nodes').text('Nodes: ' + data.foundCount + ' / ' + data.totalTargets);

            var shieldIcons = '';
            for (var i = 0; i < 3; i++) {
                shieldIcons += (i < data.lives ? '🛡️' : '💔');
            }
            $('#opponent-radar-shields').html(shieldIcons);

            var pct = Math.min(Math.round((data.level / 15) * 100), 100);
            $('#opponent-radar-progress-bar').css('width', pct + '%');
        },

        showGameOverModal: function(isWin, winnerName, finalLevel, finalScore) {
            var self = this;
            var summaryHtml = '<div style="background: rgba(15,23,42,0.8); border: 1px solid #334155; border-radius: 12px; padding: 14px; margin: 14px 0; text-align: left;">' +
                '<div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>Max Level Reached:</span><strong style="color: #38bdf8;">Stage ' + finalLevel + '</strong></div>' +
                '<div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>Total Neural Score:</span><strong style="color: #34d399;">' + finalScore.toLocaleString() + ' PTS</strong></div>' +
                '<div style="display: flex; justify-content: space-between;"><span>Max Combo Multiplier:</span><strong style="color: #fbbf24;">' + comboStreak + 'x Streak</strong></div>' +
            '</div>';

            var modalText = isWin
                ? ("Outstanding spatial recall! You conquered the neural matrix!" + summaryHtml)
                : ("Neural shields depleted! " + winnerName + " won the showdown!" + summaryHtml);

            window.App.showGameModal({
                title: isWin ? "🏆 Neural Showdown Cleared!" : "💔 Neural Circuit Overload",
                text: modalText,
                html: modalText,
                isWin: isWin,
                onRematch: function() {
                    self.resetGame();
                }
            });
        }
    };

    $(document).ready(function() {
        MemoryMatrix.init();
    });

    window.MemoryMatrix = MemoryMatrix;

})(window, jQuery);
