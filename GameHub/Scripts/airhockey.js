/* ==========================================================================
   GAME HUB - Air Hockey Client Engine (HTML5 Canvas, Bot AI + LAN Real-Time)
   ========================================================================== */

(function(window, $, Physics) {
    'use strict';

    var canvas, ctx;
    var isMultiplayer = false;
    var sessionId = null;
    var difficulty = "hard";
    var myPlayerName = "Player";
    var opponentPlayerName = "Bot";
    var isP1 = true; // Player 1 = Left / Cyan, Player 2 = Right / Rose

    var p1Score = 0;
    var p2Score = 0;
    var WIN_SCORE = 7;
    var isGameRunning = false;
    var isGoalPaused = false;
    var goalBannerText = "";
    var goalBannerTimer = 0;

    var puck = Physics.createPuck(400, 240, 0, 0);
    var p1Paddle = Physics.createPaddle(120, 240);
    var p2Paddle = Physics.createPaddle(680, 240);

    var animFrameId = null;
    var syncInterval = null;
    var lastPuckSyncTime = 0;

    var AirHockey = {
        init: function() {
            canvas = document.getElementById('airhockey-canvas');
            if (!canvas) return;
            ctx = canvas.getContext('2d');

            var urlParams = new URLSearchParams(window.location.search);
            sessionId = urlParams.get('session');
            difficulty = urlParams.get('diff') || 'hard';
            var p1Url = urlParams.get('p1') || '';
            var p2Url = urlParams.get('p2') || '';

            myPlayerName = window.App ? window.App.getPlayerName() : "Player";

            this.bindInputEvents();

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
            isP1 = true;
            $('#p1-name').text(myPlayerName);
            $('#p2-name').text(opponentPlayerName);
            $('#game-mode-badge').text('First to ' + WIN_SCORE + ' vs ' + opponentPlayerName);

            this.resetMatch();
            this.startLoop();
        },

        initMultiplayer: function(p1Url, p2Url) {
            $('#game-mode-badge').text('LAN Air Hockey (First to ' + WIN_SCORE + ')');
            var self = this;
            var myName = window.App ? window.App.getPlayerName() : "Player";

            // Pre-initialize player assignment from URL parameters
            isP1 = true;
            if (p1Url && p2Url) {
                if (myName.toLowerCase() === p2Url.toLowerCase()) {
                    isP1 = false;
                }
            }

            opponentPlayerName = isP1 ? (p2Url || "Opponent") : (p1Url || "Opponent");
            $('#p1-name').text(isP1 ? myName : (p1Url || "Player 1"));
            $('#p2-name').text(isP1 ? (p2Url || "Player 2") : myName);

            this.resetMatch();

            // Wire SignalR Handlers BEFORE connection handshake
            window.GameHubClient.init(function(hub) {
                hub.client.sessionState = function(state) {
                    isP1 = state.isP1;
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

                    p1Score = state.p1Score || 0;
                    p2Score = state.p2Score || 0;
                    self.updateScoreDisplay();
                };

                hub.client.opponentEnteredSession = function(data) {
                    window.App.toast(data.displayName + " joined the match!", "info");
                    if (isP1) {
                        opponentPlayerName = data.displayName;
                        $('#p2-name').text(data.displayName);
                    } else {
                        opponentPlayerName = data.displayName;
                        $('#p1-name').text(data.displayName);
                    }
                };

                // Opponent paddle position update
                hub.client.opponentPaddleMoved = function(data) {
                    if (data.playerNum === 1 && !isP1) {
                        p1Paddle.x = data.x;
                        p1Paddle.y = data.y;
                        p1Paddle.vx = data.vx;
                        p1Paddle.vy = data.vy;
                    } else if (data.playerNum === 2 && isP1) {
                        p2Paddle.x = data.x;
                        p2Paddle.y = data.y;
                        p2Paddle.vx = data.vx;
                        p2Paddle.vy = data.vy;
                    }
                };

                // Opponent struck the puck -> immediate trajectory update
                hub.client.puckHit = function(data) {
                    puck.x = data.px;
                    puck.y = data.py;
                    puck.vx = data.pvx;
                    puck.vy = data.pvy;
                    if (window.GameAudio) window.GameAudio.playPaddleHit();
                };

                // Periodic drift synchronization
                hub.client.puckSynced = function(data) {
                    var dx = data.px - puck.x;
                    var dy = data.py - puck.y;
                    var distSq = dx * dx + dy * dy;

                    if (distSq > 2500) {
                        // Large divergence -> snap immediately
                        puck.x = data.px;
                        puck.y = data.py;
                    } else {
                        // Gentle interpolation
                        puck.x += dx * 0.35;
                        puck.y += dy * 0.35;
                    }
                    puck.vx = data.pvx;
                    puck.vy = data.pvy;
                };

                // Synchronized Goal event on both screens
                hub.client.goalScored = function(data) {
                    p1Score = data.p1Score;
                    p2Score = data.p2Score;
                    self.updateScoreDisplay();
                    self.triggerGoalCelebration(data.scorerNum);
                };

                hub.client.rematchRequested = function() {
                    window.App.toast(opponentPlayerName + " wants a rematch! Click Rematch to accept.", "info");
                };

                hub.client.rematchStarted = function() {
                    window.App.hideGameModal();
                    window.App.toast("Rematch started!", "success");
                    self.resetMatch();
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
                window.GameHubClient.hub.server.joinSession(sessionId, myName, 4, p1Url, p2Url);
                self.startNetworkSync();
            });

            this.startLoop();
        },

        resetMatch: function() {
            p1Score = 0;
            p2Score = 0;
            isGameRunning = true;
            isGoalPaused = false;
            this.updateScoreDisplay();
            this.resetPuck(0);
        },

        resetPuck: function(scoredBy) {
            puck.x = 400;
            puck.y = 240;
            puck.vx = (scoredBy === 1) ? 4.0 : (scoredBy === 2 ? -4.0 : (Math.random() > 0.5 ? 4.0 : -4.0));
            puck.vy = (Math.random() - 0.5) * 3.5;

            p1Paddle.x = 120;
            p1Paddle.y = 240;
            p1Paddle.vx = 0;
            p1Paddle.vy = 0;

            p2Paddle.x = 680;
            p2Paddle.y = 240;
            p2Paddle.vx = 0;
            p2Paddle.vy = 0;

            isGoalPaused = true;
            setTimeout(function() {
                isGoalPaused = false;
            }, 1100);
        },

        updateScoreDisplay: function() {
            $('#p1-score-display').text(p1Score);
            $('#p2-score-display').text(p2Score);
        },

        triggerGoalCelebration: function(scorerNumber) {
            isGoalPaused = true;
            goalBannerText = (scorerNumber === 1 ? (isP1 ? "YOU SCORED!" : opponentPlayerName + " SCORED!") : (isP1 ? opponentPlayerName + " SCORED!" : "YOU SCORED!"));
            goalBannerTimer = 55;

            if (window.GameAudio) window.GameAudio.playGoalHorn();

            var self = this;
            setTimeout(function() {
                if (p1Score >= WIN_SCORE || p2Score >= WIN_SCORE) {
                    self.endGame();
                } else {
                    self.resetPuck(scorerNumber);
                }
            }, 1200);
        },

        endGame: function() {
            isGameRunning = false;
            var isWinner = isP1 ? (p1Score >= WIN_SCORE) : (p2Score >= WIN_SCORE);

            var self = this;
            setTimeout(function() {
                window.App.showGameModal({
                    title: isWinner ? "Champion!" : "Match Defeat!",
                    text: isWinner ? "Congratulations! You won the match (" + (isP1 ? p1Score : p2Score) + " - " + (isP1 ? p2Score : p1Score) + ")!" : opponentPlayerName + " won the match (" + (isP1 ? p2Score : p1Score) + " - " + (isP1 ? p1Score : p2Score) + ").",
                    isWin: isWinner,
                    isDraw: false,
                    onRematch: function() {
                        if (isMultiplayer && window.GameHubClient.isConnected()) {
                            window.GameHubClient.hub.server.requestRematch(sessionId);
                            window.App.toast("Rematch requested. Waiting for opponent...", "info");
                        } else {
                            self.resetMatch();
                            self.startLoop();
                        }
                    }
                });
            }, 400);
        },

        startLoop: function() {
            var self = this;
            function step(timestamp) {
                self.update();
                self.render();
                if (isGameRunning) {
                    animFrameId = requestAnimationFrame(step);
                }
            }
            if (animFrameId) cancelAnimationFrame(animFrameId);
            animFrameId = requestAnimationFrame(step);
        },

        startNetworkSync: function() {
            var self = this;
            if (syncInterval) clearInterval(syncInterval);

            // Fast 25ms LAN sync loop
            syncInterval = setInterval(function() {
                if (!isMultiplayer || !window.GameHubClient.isConnected() || !isGameRunning) return;

                var myPaddle = isP1 ? p1Paddle : p2Paddle;

                // Send local paddle movement
                window.GameHubClient.hub.server.updateAirHockeyPaddle(
                    sessionId,
                    myPaddle.x, myPaddle.y,
                    myPaddle.vx, myPaddle.vy,
                    isP1 ? 1 : 2
                );

                // Periodic drift synchronization by territory owner
                var now = Date.now();
                if (now - lastPuckSyncTime > 90) {
                    lastPuckSyncTime = now;
                    var inMyHalf = (isP1 && puck.x < 400) || (!isP1 && puck.x >= 400);
                    if (inMyHalf && !isGoalPaused) {
                        window.GameHubClient.hub.server.airHockeySyncPuck(
                            sessionId,
                            puck.x, puck.y,
                            puck.vx, puck.vy,
                            isP1 ? 1 : 2
                        );
                    }
                }
            }, 25);
        },

        update: function() {
            if (!isGameRunning) return;

            // Single Player vs Bot
            if (!isMultiplayer && !isGoalPaused) {
                this.updateBotAI();
                var collision = Physics.updatePuck(puck, p1Paddle, p2Paddle);
                if (collision && window.GameAudio) {
                    window.GameAudio.playPaddleHit();
                }

                var goal = Physics.checkGoal(puck);
                if (goal === 1) {
                    p1Score++;
                    this.updateScoreDisplay();
                    this.triggerGoalCelebration(1);
                } else if (goal === 2) {
                    p2Score++;
                    this.updateScoreDisplay();
                    this.triggerGoalCelebration(2);
                }
            } 
            // Multiplayer Mode: Full symmetric 60 FPS physics on both screens
            else if (isMultiplayer && !isGoalPaused) {
                var myPaddle = isP1 ? p1Paddle : p2Paddle;
                var myHit = Physics.resolvePaddleCollision(myPaddle, puck);

                if (myHit) {
                    if (window.GameAudio) window.GameAudio.playPaddleHit();
                    if (window.GameHubClient.isConnected()) {
                        // Broadcast immediate puck hit trajectory to opponent
                        window.GameHubClient.hub.server.airHockeyPuckHit(
                            sessionId,
                            puck.x, puck.y,
                            puck.vx, puck.vy,
                            isP1 ? 1 : 2
                        );
                    }
                }

                // Opponent paddle collision resolution
                var oppPaddle = isP1 ? p2Paddle : p1Paddle;
                Physics.resolvePaddleCollision(oppPaddle, puck);

                // Wall reflections & movement
                Physics.updatePuck(puck, null, null);

                // Goal detection on BOTH screens
                var mpGoal = Physics.checkGoal(puck);
                if (mpGoal > 0 && !isGoalPaused) {
                    isGoalPaused = true;
                    var nextP1 = p1Score + (mpGoal === 1 ? 1 : 0);
                    var nextP2 = p2Score + (mpGoal === 2 ? 1 : 0);

                    if (window.GameHubClient.isConnected()) {
                        window.GameHubClient.hub.server.airHockeyGoalScored(sessionId, mpGoal, nextP1, nextP2);
                    } else {
                        p1Score = nextP1;
                        p2Score = nextP2;
                        this.updateScoreDisplay();
                        this.triggerGoalCelebration(mpGoal);
                    }
                }
            }

            if (goalBannerTimer > 0) goalBannerTimer--;
        },

        updateBotAI: function() {
            var botSpeed = 6.0;
            if (difficulty === 'easy') botSpeed = 4.0;
            else if (difficulty === 'normal') botSpeed = 6.8;
            else if (difficulty === 'hard') botSpeed = 10.5;

            var targetX = 680;
            var targetY = 240;

            if (difficulty === 'easy') {
                targetY = Math.max(80, Math.min(400, puck.y));
            } else if (difficulty === 'normal') {
                if (puck.x > 400) {
                    targetX = Math.max(480, Math.min(720, puck.x + 15));
                    targetY = Math.max(70, Math.min(410, puck.y));
                } else {
                    targetY = Math.max(120, Math.min(360, puck.y));
                }
            } else {
                // Hard: predictive trajectory projection with cushion reflection
                var projectedY = puck.y;
                if (puck.vx > 0.5) {
                    var time = (660 - puck.x) / (puck.vx || 1);
                    if (time > 0 && time < 55) {
                        projectedY = puck.y + puck.vy * time;
                        while (projectedY < 30 || projectedY > 450) {
                            if (projectedY < 30) projectedY = 30 + (30 - projectedY);
                            if (projectedY > 450) projectedY = 450 - (projectedY - 450);
                        }
                    }
                }

                if (puck.x > 400) {
                    targetX = Math.max(460, Math.min(740, puck.x + 25));
                    targetY = Math.max(60, Math.min(420, projectedY));
                } else {
                    targetX = 680;
                    targetY = Math.max(140, Math.min(340, projectedY));
                }
            }

            var dx = targetX - p2Paddle.x;
            var dy = targetY - p2Paddle.y;
            var dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 1.5) {
                var moveDist = Math.min(dist, botSpeed);
                p2Paddle.vx = (dx / dist) * moveDist;
                p2Paddle.vy = (dy / dist) * moveDist;
                p2Paddle.x += p2Paddle.vx;
                p2Paddle.y += p2Paddle.vy;
            } else {
                p2Paddle.vx = 0;
                p2Paddle.vy = 0;
            }

            Physics.clampPaddle(p2Paddle, false);
        },

        bindInputEvents: function() {
            var self = this;

            function handlePointerMove(e) {
                var rect = canvas.getBoundingClientRect();
                var scaleX = canvas.width / rect.width;
                var scaleY = canvas.height / rect.height;

                var clientX = e.clientX;
                var clientY = e.clientY;

                if (e.touches && e.touches.length > 0) {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                }

                var mouseX = (clientX - rect.left) * scaleX;
                var mouseY = (clientY - rect.top) * scaleY;

                var myPaddle = isP1 ? p1Paddle : p2Paddle;
                myPaddle.vx = (mouseX - myPaddle.x) * 0.9;
                myPaddle.vy = (mouseY - myPaddle.y) * 0.9;
                myPaddle.x = mouseX;
                myPaddle.y = mouseY;

                Physics.clampPaddle(myPaddle, isP1);
            }

            $(canvas).on('mousemove', handlePointerMove);
            $(canvas).on('touchmove', function(e) {
                e.preventDefault();
                handlePointerMove(e);
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

        render: function() {
            var W = canvas.width;
            var H = canvas.height;

            // 1. Table Background Gradient & Rink Lines
            var grad = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, W / 1.5);
            grad.addColorStop(0, '#0f172a');
            grad.addColorStop(1, '#060b18');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);

            // Table Border & Outer Neon Glow
            ctx.lineWidth = 6;
            ctx.strokeStyle = '#334155';
            ctx.strokeRect(3, 3, W - 6, H - 6);

            // Center Dividing Line
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
            ctx.setLineDash([10, 8]);
            ctx.beginPath();
            ctx.moveTo(W / 2, 0);
            ctx.lineTo(W / 2, H);
            ctx.stroke();
            ctx.setLineDash([]);

            // Center Circle
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
            ctx.beginPath();
            ctx.arc(W / 2, H / 2, 70, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
            ctx.beginPath();
            ctx.arc(W / 2, H / 2, 8, 0, Math.PI * 2);
            ctx.fill();

            // Left & Right Defense Creases
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
            ctx.beginPath();
            ctx.arc(0, H / 2, 130, -Math.PI / 2, Math.PI / 2);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
            ctx.beginPath();
            ctx.arc(W, H / 2, 130, Math.PI / 2, 3 * Math.PI / 2);
            ctx.stroke();

            // Goal Mouths (Left = Blue, Right = Rose)
            var goalTop = Physics.GOAL_TOP;
            var goalBot = Physics.GOAL_BOTTOM;
            var goalH = goalBot - goalTop;

            ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
            ctx.fillRect(0, goalTop, 14, goalH);
            ctx.fillStyle = '#06b6d4';
            ctx.fillRect(0, goalTop, 4, goalH);

            ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
            ctx.fillRect(W - 14, goalTop, 14, goalH);
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(W - 4, goalTop, 4, goalH);

            // 2. Render Paddles
            // P1 Paddle (Cyan)
            this.drawPaddle(p1Paddle.x, p1Paddle.y, p1Paddle.radius, '#0284c7', '#38bdf8', '#06b6d4');
            // P2 Paddle (Rose)
            this.drawPaddle(p2Paddle.x, p2Paddle.y, p2Paddle.radius, '#be123c', '#fb7185', '#f43f5e');

            // 3. Render Puck
            this.drawPuck(puck.x, puck.y, puck.radius);

            // 4. Goal Overlay Banner
            if (goalBannerTimer > 0) {
                ctx.save();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
                ctx.fillRect(0, H / 2 - 50, W, 100);

                ctx.font = 'bold 38px Outfit, Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#f59e0b';
                ctx.shadowColor = '#f59e0b';
                ctx.shadowBlur = 18;
                ctx.fillText(goalBannerText, W / 2, H / 2);
                ctx.restore();
            }
        },

        drawPaddle: function(x, y, r, innerColor, outerColor, glowColor) {
            ctx.save();
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 16;

            // Outer ring
            var grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
            grad.addColorStop(0, outerColor);
            grad.addColorStop(0.7, innerColor);
            grad.addColorStop(1, '#090d16');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();

            // Inner knob
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(x, y, r * 0.35, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        },

        drawPuck: function(x, y, r) {
            ctx.save();
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 12;

            var grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
            grad.addColorStop(0, '#f8fafc');
            grad.addColorStop(0.6, '#cbd5e1');
            grad.addColorStop(1, '#475569');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();

            ctx.lineWidth = 2;
            ctx.strokeStyle = '#0284c7';
            ctx.stroke();

            ctx.restore();
        }
    };

    $(document).ready(function() {
        AirHockey.init();
    });

    window.AirHockey = AirHockey;

})(window, jQuery, window.AirHockeyPhysics);
