/* ==========================================================================
   GAME HUB - Olympic Archery Clash: Professional AAA Archery King Engine
   Features:
   - Real-time 2.4x Magnified Optical Scope Lens with Illuminated Fiber Pin
   - Photorealistic Olympic 50m Stadium with 3D Depth Perspective & Sun Bloom
   - Dynamic Animated Wind Socks & Fabric Flags driven by Live Wind Vectors
   - Organic Human Breathing Sway & Arm Fatigue Jitter Mechanics
   - 3D Parabolic Ballistics & Aerodynamic Crosswind Drift
   - Spring-Damped Target Impact Shudder, Shaft Wobble & Wood Splinters
   - Persistent Lodged Embedded Arrows & Color-Coded Tournament Scorecards
   ========================================================================== */

(function(window, $, Physics) {
    'use strict';

    var canvas, ctx;
    var isMultiplayer = false;
    var sessionId = null;
    var difficulty = "hard";
    var myPlayerName = "Player";
    var opponentPlayerName = "Bot";
    var isP1 = true;
    var isMyTurn = true;

    var TOTAL_ROUNDS = 5;
    var currentRound = 1;
    var p1Score = 0;
    var p2Score = 0;
    var p1Shots = []; // [{score, ringTier, isBullseye, hitX, hitY}]
    var p2Shots = [];
    var currentWindX = 0; // m/s (-3.6 to +3.6)
    var currentWindY = 0; // m/s (-1.8 to +1.8)

    // Aiming & Magnifier Scope State
    var isAiming = false;
    var aimCmX = 0; // Coordinates on 61cm target face
    var aimCmY = 0;
    var smoothAimX = 0; // Inertia-smoothed aim coordinates
    var smoothAimY = 0;
    var drawTension = 0; // 0.0 to 1.0
    var holdDuration = 0; // Frames held
    var dragAnchor = null;

    // Harmonic Breathing Sway & Fatigue
    var swayTime = 0;
    var swayX = 0;
    var swayY = 0;
    var fatigueShakeX = 0;
    var fatigueShakeY = 0;

    // Environmental Effects
    var windParticles = [];
    var airflowLines = [];
    var clouds = [];

    // Flight, Impact & Animation State
    var activeFlight = null; // {progress, aimX, aimY, hitX, hitY, driftX, driftY, impact}
    var lodgedArrows = []; // [{x, y, player, shaftAngle, score}]
    var woodSplinters = []; // Particle bursts on impact
    var scoreSparks = []; // Celebration sparks on bullseyes
    var targetWobbleX = 0;
    var targetWobbleY = 0;
    var targetWobbleVelocity = 0;
    var screenShake = 0;
    var impactBanner = null; // {text, color, score, isBullseye, opacity, scale}

    var animFrameId = null;

    var Archery = {
        init: function() {
            canvas = document.getElementById('archery-canvas');
            if (!canvas) return;
            ctx = canvas.getContext('2d');

            var urlParams = new URLSearchParams(window.location.search);
            sessionId = urlParams.get('session');
            difficulty = urlParams.get('diff') || 'hard';
            var p1Url = urlParams.get('p1') || '';
            var p2Url = urlParams.get('p2') || '';

            myPlayerName = window.App ? window.App.getPlayerName() : "Player";

            this.initEnvironment();
            this.bindEvents();

            if (sessionId) {
                isMultiplayer = true;
                this.initMultiplayer(p1Url, p2Url);
            } else {
                isMultiplayer = false;
                this.initSinglePlayer();
            }
        },

        initEnvironment: function() {
            // Wind Particles (floating dandelion pollen)
            windParticles = [];
            for (var i = 0; i < 28; i++) {
                windParticles.push({
                    x: Math.random() * 960,
                    y: Math.random() * 540,
                    size: Math.random() * 2.5 + 1.2,
                    speed: Math.random() * 1.2 + 0.6,
                    opacity: Math.random() * 0.5 + 0.25,
                    rot: Math.random() * Math.PI * 2,
                    rotSpeed: Math.random() * 0.04 - 0.02
                });
            }

            // Airflow Streamlines
            airflowLines = [];
            for (var j = 0; j < 16; j++) {
                airflowLines.push({
                    x: Math.random() * 960,
                    y: Math.random() * 320 + 40,
                    len: Math.random() * 80 + 50,
                    speed: Math.random() * 1.8 + 1.2,
                    curve: Math.random() * 10 - 5,
                    alpha: Math.random() * 0.25 + 0.1
                });
            }

            // Clouds
            clouds = [
                { x: 120, y: 55,  w: 180, h: 48, speed: 0.14 },
                { x: 480, y: 75,  w: 240, h: 60, speed: 0.20 },
                { x: 800, y: 40,  w: 190, h: 50, speed: 0.16 }
            ];
        },

        initSinglePlayer: function() {
            opponentPlayerName = "Bot (" + (difficulty.charAt(0).toUpperCase() + difficulty.slice(1)) + ")";
            isP1 = true;
            isMyTurn = true;

            $('#p1-name').text(myPlayerName);
            $('#p2-name').text(opponentPlayerName);
            $('#p1-avatar-letter').text(myPlayerName.charAt(0).toUpperCase());
            $('#p2-avatar-letter').text(opponentPlayerName.charAt(0).toUpperCase());
            $('#game-mode-badge').text('🎯 Olympic Range vs ' + opponentPlayerName);

            this.resetMatch();
            this.startLoop();
        },

        initMultiplayer: function(p1Url, p2Url) {
            $('#game-mode-badge').text('🎯 Olympic LAN Match (5 Rounds)');
            var self = this;
            var myName = window.App ? window.App.getPlayerName() : "Player";

            isP1 = true;
            if (p1Url && p2Url) {
                if (myName.toLowerCase() === p2Url.toLowerCase()) {
                    isP1 = false;
                }
            }

            opponentPlayerName = isP1 ? (p2Url || "Opponent") : (p1Url || "Opponent");
            isMyTurn = isP1;

            var p1DisplayName = isP1 ? myName : (p1Url || "Player 1");
            var p2DisplayName = isP1 ? (p2Url || "Player 2") : myName;

            $('#p1-name').text(p1DisplayName);
            $('#p2-name').text(p2DisplayName);
            $('#p1-avatar-letter').text(p1DisplayName.charAt(0).toUpperCase());
            $('#p2-avatar-letter').text(p2DisplayName.charAt(0).toUpperCase());

            this.resetMatch();
            this.updateTurnIndicator();

            window.GameHubClient.init(function(hub) {
                hub.client.sessionState = function(state) {
                    isP1 = state.isP1;
                    self.updateTurnIndicator();
                };

                hub.client.archeryShotProcessed = function(res) {
                    if (!res || !res.ExtraData) return;
                    var data = res.ExtraData;
                    var shooterNum = data.shooterPlayerNum;

                    self.triggerCinematicFlight(data.aimX, data.aimY, data.power, currentWindX, currentWindY, function(impact) {
                        p1Score = data.p1Total;
                        p2Score = data.p2Total;
                        currentRound = data.currentRound;
                        currentWindX = data.nextWindX;
                        currentWindY = data.nextWindY;

                        var shotEntry = {
                            score: data.scoreEarned,
                            ringTier: impact.ringTier,
                            isBullseye: data.isBullseye,
                            hitX: data.hitX,
                            hitY: data.hitY
                        };

                        if (shooterNum === 1) p1Shots.push(shotEntry);
                        else p2Shots.push(shotEntry);

                        lodgedArrows.push({
                            x: data.hitX,
                            y: data.hitY,
                            player: shooterNum,
                            shaftAngle: (Math.random() * 0.16 - 0.08),
                            score: data.scoreEarned
                        });

                        self.updateScoreboard();

                        if (res.IsGameOver) {
                            var myId = window.GameHubClient.getConnectionId();
                            var isWin = (res.WinnerPlayerId === myId);
                            var isDraw = res.IsDraw;

                            setTimeout(function() {
                                window.App.showGameModal({
                                    title: isDraw ? "Tournament Tie!" : (isWin ? "Olympic Gold Champion!" : "Tournament Defeat!"),
                                    text: isDraw ? "Tied at " + p1Score + " - " + p2Score + " points." : (isWin ? "Magnificent marksmanship! You won with " + (isP1 ? p1Score : p2Score) + " points." : opponentPlayerName + " won (" + (isP1 ? p2Score : p1Score) + " - " + (isP1 ? p1Score : p2Score) + ")."),
                                    isWin: isWin,
                                    isDraw: isDraw,
                                    onRematch: function() {
                                        hub.server.requestRematch(sessionId);
                                        window.App.toast("Rematch requested. Waiting for opponent...", "info");
                                    }
                                });
                            }, 1200);
                        } else {
                            var myId = window.GameHubClient.getConnectionId();
                            isMyTurn = (res.NextTurnPlayerId === myId);
                            self.updateTurnIndicator();
                        }
                    });
                };

                hub.client.moveError = function(msg) {
                    window.App.toast(msg, "warning");
                };

                hub.client.rematchRequested = function() {
                    window.App.toast(opponentPlayerName + " requested a rematch!", "info");
                };

                hub.client.rematchStarted = function() {
                    window.App.hideGameModal();
                    window.App.toast("Rematch started!", "success");
                    self.resetMatch();
                    isMyTurn = isP1;
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
                window.GameHubClient.hub.server.joinSession(sessionId, myName, 5, p1Url, p2Url);
            });

            this.startLoop();
        },

        resetMatch: function() {
            currentRound = 1;
            p1Score = 0;
            p2Score = 0;
            p1Shots = [];
            p2Shots = [];
            lodgedArrows = [];
            woodSplinters = [];
            scoreSparks = [];
            activeFlight = null;
            impactBanner = null;
            isAiming = false;
            drawTension = 0;
            holdDuration = 0;
            aimCmX = 0;
            aimCmY = 0;
            smoothAimX = 0;
            smoothAimY = 0;

            // Generate initial crosswind (-3.5 to +3.5 m/s)
            currentWindX = Math.round((Math.random() * 7.0 - 3.5) * 10) / 10;
            currentWindY = Math.round((Math.random() * 2.6 - 1.3) * 10) / 10;

            this.updateScoreboard();
            this.updateTurnIndicator();
        },

        updateScoreboard: function() {
            $('#p1-score-display').text(p1Score);
            $('#p2-score-display').text(p2Score);
            $('#round-number-text').text('Round ' + Math.min(TOTAL_ROUNDS, currentRound) + ' / ' + TOTAL_ROUNDS);

            // Update shot score pills with World Archery colors
            var $p1Dots = $('#p1-shot-history');
            var $p2Dots = $('#p2-shot-history');
            $p1Dots.empty();
            $p2Dots.empty();

            for (var i = 0; i < TOTAL_ROUNDS; i++) {
                var s1 = (i < p1Shots.length) ? p1Shots[i] : null;
                var s2 = (i < p2Shots.length) ? p2Shots[i] : null;

                var p1Text = s1 ? (s1.score === 10 ? (s1.isXRing ? "10X" : "10") : (s1.score === 0 ? "M" : s1.score)) : "-";
                var p1Tier = s1 ? s1.ringTier : "";
                $p1Dots.append('<span class="archery-pill ' + p1Tier + '">' + p1Text + '</span>');

                var p2Text = s2 ? (s2.score === 10 ? (s2.isXRing ? "10X" : "10") : (s2.score === 0 ? "M" : s2.score)) : "-";
                var p2Tier = s2 ? s2.ringTier : "";
                $p2Dots.append('<span class="archery-pill ' + p2Tier + '">' + p2Text + '</span>');
            }

            // Update Wind Gauge Widget
            var windSpeed = Math.sqrt(currentWindX * currentWindX + currentWindY * currentWindY);
            var windAngleDeg = Math.atan2(currentWindY, currentWindX) * (180 / Math.PI);

            $('#wind-status-text').html('Wind: <strong>' + windSpeed.toFixed(1) + ' m/s</strong>');
            $('#wind-arrow-icon').css('transform', 'rotate(' + windAngleDeg + 'deg)');
            $('#wind-status-widget').toggleClass('active', windSpeed > 0.4);
        },

        updateTurnIndicator: function() {
            if (isMyTurn) {
                $('#turn-indicator').text('Your Turn - Hold & Drag anywhere to Aim');
                $('#p1-card').toggleClass('active-turn', isP1);
                $('#p2-card').toggleClass('active-turn', !isP1);
            } else {
                $('#turn-indicator').text(opponentPlayerName + "'s Turn to Aim");
                $('#p1-card').toggleClass('active-turn', !isP1);
                $('#p2-card').toggleClass('active-turn', isP1);
            }
        },

        bindEvents: function() {
            var self = this;

            function getCanvasCoords(e) {
                var rect = canvas.getBoundingClientRect();
                var scaleX = canvas.width / rect.width;
                var scaleY = canvas.height / rect.height;

                var clientX = e.clientX;
                var clientY = e.clientY;

                if (e.touches && e.touches.length > 0) {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                }

                return {
                    x: (clientX - rect.left) * scaleX,
                    y: (clientY - rect.top) * scaleY
                };
            }

            $(canvas).on('mousedown touchstart', function(e) {
                if (!isMyTurn || activeFlight) return;
                var pos = getCanvasCoords(e);

                isAiming = true;
                drawTension = 0.3;
                holdDuration = 0;
                dragAnchor = pos;

                // Center aim on target relative to (480, 250)
                aimCmX = (pos.x - 480) * 0.28;
                aimCmY = (pos.y - 250) * 0.28;
                smoothAimX = aimCmX;
                smoothAimY = aimCmY;

                if (window.GameAudio && window.GameAudio.playBowDraw) {
                    window.GameAudio.playBowDraw();
                }
            });

            $(canvas).on('mousemove touchmove', function(e) {
                if (!isAiming || !dragAnchor) return;
                e.preventDefault();
                var pos = getCanvasCoords(e);

                // Map canvas drag directly to cm offset on target (-55cm to +55cm)
                aimCmX = Math.max(-55, Math.min(55, (pos.x - 480) * 0.35));
                aimCmY = Math.max(-55, Math.min(55, (pos.y - 250) * 0.35));
            });

            $(window).on('mouseup touchend', function(e) {
                if (!isAiming) return;
                isAiming = false;
                dragAnchor = null;

                if (!isMyTurn || activeFlight) return;

                // Release shot
                var finalAimX = smoothAimX + swayX + fatigueShakeX;
                var finalAimY = smoothAimY + swayY + fatigueShakeY;
                var power = Math.min(100, Math.max(75, drawTension * 100));

                self.executePlayerShot(finalAimX, finalAimY, power);
            });

            $('#forfeit-game-btn').on('click', function(e) {
                e.preventDefault();
                if (confirm("Are you sure you want to forfeit this match?")) {
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

        executePlayerShot: function(finalAimX, finalAimY, power) {
            var self = this;

            if (isMultiplayer) {
                if (window.GameHubClient.isConnected()) {
                    isMyTurn = false;
                    self.updateTurnIndicator();
                    window.GameHubClient.hub.server.shootArcheryArrow(sessionId, finalAimX, finalAimY, power);
                } else {
                    window.App.toast("Connecting to LAN...", "warning");
                }
            } else {
                isMyTurn = false;
                this.updateTurnIndicator();

                this.triggerCinematicFlight(finalAimX, finalAimY, power, currentWindX, currentWindY, function(impact) {
                    p1Score += impact.score;
                    p1Shots.push({
                        score: impact.score,
                        ringTier: impact.ringTier,
                        isBullseye: impact.isBullseye,
                        isXRing: impact.isXRing,
                        hitX: impact.hitX,
                        hitY: impact.hitY
                    });

                    lodgedArrows.push({
                        x: impact.hitX,
                        y: impact.hitY,
                        player: 1,
                        shaftAngle: (Math.random() * 0.16 - 0.08),
                        score: impact.score
                    });

                    self.updateScoreboard();

                    setTimeout(function() {
                        self.executeBotTurn();
                    }, 1300);
                });
            }
        },

        executeBotTurn: function() {
            var self = this;
            var ideal = Physics.getIdealAimPoint(currentWindX, currentWindY);

            // Bot accuracy & scatter based on difficulty
            var scatter = 28;
            if (difficulty === 'easy') scatter = 38;
            else if (difficulty === 'normal') scatter = 16;
            else if (difficulty === 'hard') scatter = 4.0;

            var botAimX = ideal.aimX + (Math.random() * (scatter * 2) - scatter);
            var botAimY = ideal.aimY + (Math.random() * (scatter * 2) - scatter);
            var botPower = (difficulty === 'hard') ? 100 : (90 + Math.random() * 10);

            this.triggerCinematicFlight(botAimX, botAimY, botPower, currentWindX, currentWindY, function(impact) {
                p2Score += impact.score;
                p2Shots.push({
                    score: impact.score,
                    ringTier: impact.ringTier,
                    isBullseye: impact.isBullseye,
                    isXRing: impact.isXRing,
                    hitX: impact.hitX,
                    hitY: impact.hitY
                });

                lodgedArrows.push({
                    x: impact.hitX,
                    y: impact.hitY,
                    player: 2,
                    shaftAngle: (Math.random() * 0.16 - 0.08),
                    score: impact.score
                });

                currentRound++;
                currentWindX = Math.round((Math.random() * 7.0 - 3.5) * 10) / 10;
                currentWindY = Math.round((Math.random() * 2.6 - 1.3) * 10) / 10;

                self.updateScoreboard();

                if (currentRound > TOTAL_ROUNDS) {
                    var isWin = (p1Score > p2Score);
                    var isDraw = (p1Score === p2Score);

                    setTimeout(function() {
                        window.App.showGameModal({
                            title: isDraw ? "Match Tied!" : (isWin ? "Olympic Champion!" : "Opponent Won!"),
                            text: isDraw ? "Tied at " + p1Score + " - " + p2Score + " points." : (isWin ? "Outstanding marksmanship! You won with " + p1Score + " points!" : opponentPlayerName + " won (" + p2Score + " - " + p1Score + ")."),
                            isWin: isWin,
                            isDraw: isDraw,
                            onRematch: function() {
                                self.resetMatch();
                                isMyTurn = true;
                                self.updateTurnIndicator();
                            }
                        });
                    }, 1200);
                } else {
                    isMyTurn = true;
                    self.updateTurnIndicator();
                }
            });
        },

        triggerCinematicFlight: function(aimX, aimY, power, windX, windY, onComplete) {
            if (window.GameAudio && window.GameAudio.playBowRelease) {
                window.GameAudio.playBowRelease();
            }

            var impact = Physics.calculateImpact(aimX, aimY, power, windX, windY);
            var self = this;

            var flightDurationMs = 620;
            var startTime = performance.now();

            activeFlight = {
                progress: 0,
                aimX: aimX,
                aimY: aimY,
                hitX: impact.hitX,
                hitY: impact.hitY,
                driftX: impact.driftX,
                driftY: impact.driftY,
                impact: impact
            };

            function stepFlight(now) {
                var elapsed = now - startTime;
                var prog = Math.min(1.0, elapsed / flightDurationMs);
                activeFlight.progress = prog;

                if (prog >= 1.0) {
                    // Impact moment
                    activeFlight = null;
                    targetWobbleVelocity = 14.0;
                    screenShake = 12;

                    // Impact Splinters
                    self.spawnSplinters(480 + impact.hitX * 1.8, 250 + impact.hitY * 1.8);

                    if (window.GameAudio && window.GameAudio.playTargetHit) {
                        window.GameAudio.playTargetHit(impact.isBullseye, impact.isXRing);
                    }

                    if (impact.isBullseye) {
                        self.spawnScoreSparks(480 + impact.hitX * 1.8, 250 + impact.hitY * 1.8);
                        if (window.GameAudio && window.GameAudio.playCrowdCheer) {
                            window.GameAudio.playCrowdCheer();
                        }
                    }

                    impactBanner = {
                        title: impact.ringName,
                        score: impact.score,
                        color: impact.ringColor,
                        isBullseye: impact.isBullseye,
                        opacity: 1.0,
                        scale: 1.2
                    };

                    if (typeof onComplete === 'function') {
                        onComplete(impact);
                    }

                    setTimeout(function() {
                        impactBanner = null;
                    }, 1300);

                    return;
                }

                requestAnimationFrame(stepFlight);
            }

            requestAnimationFrame(stepFlight);
        },

        spawnSplinters: function(x, y) {
            woodSplinters = [];
            for (var i = 0; i < 18; i++) {
                var angle = Math.random() * Math.PI * 2;
                var speed = Math.random() * 5.5 + 2.0;
                woodSplinters.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 1.5,
                    size: Math.random() * 3.5 + 1.5,
                    color: Math.random() > 0.5 ? '#f59e0b' : '#d97706',
                    life: 22
                });
            }
        },

        spawnScoreSparks: function(x, y) {
            scoreSparks = [];
            for (var i = 0; i < 26; i++) {
                var angle = Math.random() * Math.PI * 2;
                var speed = Math.random() * 7.0 + 3.0;
                scoreSparks.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: Math.random() * 4.0 + 2.0,
                    color: '#fbbf24',
                    life: 30
                });
            }
        },

        startLoop: function() {
            var self = this;
            function renderStep() {
                self.update();
                self.draw();
                animFrameId = requestAnimationFrame(renderStep);
            }
            if (animFrameId) cancelAnimationFrame(animFrameId);
            animFrameId = requestAnimationFrame(renderStep);
        },

        update: function() {
            // 1. Aim Inertia Smoothing
            smoothAimX += (aimCmX - smoothAimX) * 0.25;
            smoothAimY += (aimCmY - smoothAimY) * 0.25;

            // 2. Harmonic Breathing Sway
            swayTime += 0.045;
            var baseSway = 2.0;
            fatigueShakeX = 0;
            fatigueShakeY = 0;

            if (isAiming) {
                holdDuration++;
                drawTension = Math.min(1.0, drawTension + 0.04);

                if (holdDuration > 130) {
                    // Arm fatigue tremor after ~4.5s
                    var jitter = (holdDuration - 130) * 0.09;
                    fatigueShakeX = (Math.random() - 0.5) * jitter;
                    fatigueShakeY = (Math.random() - 0.5) * jitter;
                }
            } else {
                holdDuration = 0;
                drawTension = Math.max(0, drawTension - 0.1);
            }

            swayX = Math.sin(swayTime * 0.9) * baseSway;
            swayY = Math.cos(swayTime * 1.8) * (baseSway * 0.7);

            // 3. Target Wobble Physics (Spring-Damper)
            targetWobbleX += targetWobbleVelocity;
            targetWobbleVelocity -= targetWobbleX * 0.25; // Spring force
            targetWobbleVelocity *= 0.85; // Damping

            // 4. Airflow & Particles
            var windSpeed = Math.sqrt(currentWindX * currentWindX + currentWindY * currentWindY);

            windParticles.forEach(function(p) {
                p.x += (currentWindX * 1.5 + 0.6) * p.speed;
                p.y += (currentWindY * 0.7 + 0.2) * p.speed;
                p.rot += p.rotSpeed;

                if (p.x > 980) p.x = -20;
                if (p.x < -20) p.x = 980;
                if (p.y > 550) p.y = -10;
                if (p.y < -10) p.y = 550;
            });

            airflowLines.forEach(function(s) {
                s.x += (currentWindX * 2.2 + 0.8) * s.speed;
                s.y += (currentWindY * 0.9) * s.speed;

                if (s.x > 1000) s.x = -120;
                if (s.x < -120) s.x = 1000;
                if (s.y > 550) s.y = 20;
                if (s.y < 20) s.y = 550;
            });

            clouds.forEach(function(c) {
                c.x += c.speed + (currentWindX * 0.06);
                if (c.x > 980) c.x = -260;
                if (c.x < -260) c.x = 980;
            });

            // Splinters
            for (var k = woodSplinters.length - 1; k >= 0; k--) {
                var sp = woodSplinters[k];
                sp.x += sp.vx;
                sp.y += sp.vy;
                sp.vy += 0.35;
                sp.life--;
                if (sp.life <= 0) woodSplinters.splice(k, 1);
            }

            // Score Sparks
            for (var m = scoreSparks.length - 1; m >= 0; m--) {
                var sk = scoreSparks[m];
                sk.x += sk.vx;
                sk.y += sk.vy;
                sk.life--;
                if (sk.life <= 0) scoreSparks.splice(m, 1);
            }

            // Decays
            if (screenShake > 0) screenShake--;
        },

        draw: function() {
            var W = canvas.width;
            var H = canvas.height;

            ctx.save();

            // Screen Shake on impact
            if (screenShake > 0) {
                var sx = (Math.random() - 0.5) * screenShake * 0.7;
                var sy = (Math.random() - 0.5) * screenShake * 0.7;
                ctx.translate(sx, sy);
            }

            // 1. Sky & Sun Atmosphere
            var skyGrad = ctx.createLinearGradient(0, 0, 0, 240);
            skyGrad.addColorStop(0, '#030a1a');
            skyGrad.addColorStop(0.3, '#0b1d3a');
            skyGrad.addColorStop(0.7, '#1b3b64');
            skyGrad.addColorStop(1, '#0e2b36');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, W, 250);

            // Sun Glare in Upper Right
            var sunGlow = ctx.createRadialGradient(W * 0.78, 60, 10, W * 0.78, 60, 240);
            sunGlow.addColorStop(0, 'rgba(253, 224, 71, 0.45)');
            sunGlow.addColorStop(0.35, 'rgba(245, 158, 11, 0.16)');
            sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = sunGlow;
            ctx.fillRect(0, 0, W, 250);

            // Clouds
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            clouds.forEach(function(c) {
                ctx.beginPath();
                ctx.ellipse(c.x, c.y, c.w * 0.5, c.h * 0.5, 0, 0, Math.PI * 2);
                ctx.ellipse(c.x + 30, c.y - 10, c.w * 0.35, c.h * 0.4, 0, 0, Math.PI * 2);
                ctx.fill();
            });

            // Distant Mountains & Pine Backdrop
            ctx.fillStyle = '#061426';
            ctx.beginPath();
            ctx.moveTo(0, 220);
            ctx.lineTo(180, 120);
            ctx.lineTo(380, 195);
            ctx.lineTo(580, 95);
            ctx.lineTo(780, 175);
            ctx.lineTo(W, 130);
            ctx.lineTo(W, 250);
            ctx.lineTo(0, 250);
            ctx.fill();

            // 2. Lush Olympic Grass Lawn with 3D Depth
            var lawnGrad = ctx.createLinearGradient(0, 240, 0, H);
            lawnGrad.addColorStop(0, '#064e3b');
            lawnGrad.addColorStop(0.2, '#043e2e');
            lawnGrad.addColorStop(0.6, '#032c21');
            lawnGrad.addColorStop(1, '#021812');
            ctx.fillStyle = lawnGrad;
            ctx.fillRect(0, 240, W, H - 240);

            // Perspective Lane Lines
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(480, 250); ctx.lineTo(80, H);
            ctx.moveTo(480, 250); ctx.lineTo(880, H);
            ctx.stroke();

            // Distance Markers (10m, 20m, 30m, 40m, 50m)
            [
                { y: 265, txt: "40m" },
                { y: 310, txt: "30m" },
                { y: 375, txt: "20m" },
                { y: 460, txt: "10m" }
            ].forEach(function(d) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(60, d.y); ctx.lineTo(W - 60, d.y);
                ctx.stroke();

                ctx.font = 'bold 11px Outfit, sans-serif';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
                ctx.fillText(d.txt, 110, d.y - 4);
                ctx.fillText(d.txt, 820, d.y - 4);
            });

            // 3. Dynamic Animated Lane Wind Socks & Flags
            this.drawWindSocks();

            // 4. Airflow Streamlines & Pollen Particles
            this.drawAtmosphere();

            // 5. 3D Target Stand & 10-Ring Face (Centered at 480, 250)
            this.drawTarget(480, 250);

            // 6. In-Flight Arrow (If Active)
            if (activeFlight) {
                this.drawFlightArrow(activeFlight);
            }

            // 7. Splinters & Score Sparks
            this.drawParticles();

            // 8. Magnified Optical Sight Scope (If Aiming)
            if (isAiming && !activeFlight) {
                this.drawMagnifiedScope(480, 250);
            }

            // 9. Floating Impact Score Banner
            if (impactBanner) {
                this.drawImpactBanner(impactBanner);
            }

            ctx.restore();
        },

        drawWindSocks: function() {
            ctx.save();
            var windSpeed = Math.sqrt(currentWindX * currentWindX + currentWindY * currentWindY);
            var flagTilt = Math.max(-28, Math.min(28, currentWindX * 7.5));
            var flap = Math.sin(Date.now() * 0.018) * (windSpeed * 3 + 2);

            [
                { x: 140, y: 400, h: 68, sock: true },
                { x: 820, y: 400, h: 68, sock: true },
                { x: 250, y: 320, h: 50, sock: false },
                { x: 710, y: 320, h: 50, sock: false }
            ].forEach(function(post) {
                // Post
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 3.5;
                ctx.beginPath();
                ctx.moveTo(post.x, post.y);
                ctx.lineTo(post.x, post.y - post.h);
                ctx.stroke();

                if (post.sock) {
                    // Wind Sock (Orange/White)
                    ctx.save();
                    ctx.translate(post.x, post.y - post.h);
                    ctx.rotate(flagTilt * Math.PI / 180);

                    var len = 30 + windSpeed * 4;
                    ctx.fillStyle = '#f97316';
                    ctx.beginPath();
                    ctx.moveTo(0, -6);
                    ctx.lineTo(len, -2 + flap * 0.2);
                    ctx.lineTo(len, 2 + flap * 0.2);
                    ctx.lineTo(0, 6);
                    ctx.fill();

                    // White Stripes
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(len * 0.33, -4.5); ctx.lineTo(len * 0.33, 4.5);
                    ctx.moveTo(len * 0.66, -3.2); ctx.lineTo(len * 0.66, 3.2);
                    ctx.stroke();
                    ctx.restore();
                } else {
                    // Olympic Fabric Flag
                    ctx.fillStyle = '#06b6d4';
                    ctx.beginPath();
                    ctx.moveTo(post.x, post.y - post.h);
                    ctx.lineTo(post.x + flagTilt + flap, post.y - post.h + 8);
                    ctx.lineTo(post.x, post.y - post.h + 16);
                    ctx.fill();
                }
            });
            ctx.restore();
        },

        drawAtmosphere: function() {
            ctx.save();
            // Airflow Streams
            airflowLines.forEach(function(s) {
                ctx.strokeStyle = 'rgba(56, 189, 248, ' + s.alpha + ')';
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.quadraticCurveTo(s.x + s.len * 0.5, s.y + s.curve, s.x + s.len, s.y);
                ctx.stroke();
            });

            // Pollen Motes
            windParticles.forEach(function(p) {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.fillStyle = 'rgba(251, 191, 36, ' + p.opacity + ')';
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size * 1.8, p.size * 0.8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
            ctx.restore();
        },

        drawTarget: function(cx, cy) {
            ctx.save();

            // Spring-damped Target Wobble
            ctx.translate(targetWobbleX, targetWobbleY);

            // 3D Wooden Tripod Stand
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(cx - 65, cy + 195); ctx.lineTo(cx, cy); ctx.lineTo(cx + 65, cy + 195);
            ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + 190);
            ctx.stroke();

            // Stand Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.ellipse(cx, cy + 195, 90, 16, 0, 0, Math.PI * 2);
            ctx.fill();

            // Straw Boss Outer Frame
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(cx, cy, 118, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // World Archery Official 10-Ring Face (61cm scaled to 108px)
            var scale = 108 / 61.0;
            var rings = [
                { r: 61.0 * scale, fill: '#f8fafc', stroke: '#cbd5e1' },
                { r: 48.8 * scale, fill: '#0f172a', stroke: '#334155' },
                { r: 36.6 * scale, fill: '#0284c7', stroke: '#38bdf8' },
                { r: 24.4 * scale, fill: '#e11d48', stroke: '#fb7185' },
                { r: 12.2 * scale, fill: '#f59e0b', stroke: '#fbbf24' },
                { r: 6.1  * scale, fill: '#d97706', stroke: '#ffffff' },
                { r: 3.05 * scale, fill: '#92400e', stroke: '#ffffff' }
            ];

            rings.forEach(function(ring) {
                ctx.fillStyle = ring.fill;
                ctx.strokeStyle = ring.stroke;
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            });

            // Center "+" Cross
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(cx - 10, cy); ctx.lineTo(cx + 10, cy);
            ctx.moveTo(cx, cy - 10); ctx.lineTo(cx, cy + 10);
            ctx.stroke();

            // Persistent Stuck Embedded Arrows
            lodgedArrows.forEach(function(arr) {
                var ax = cx + (arr.x * scale);
                var ay = cy + (arr.y * scale);

                // Carbon Shaft
                ctx.strokeStyle = '#f8fafc';
                ctx.lineWidth = 3.2;
                ctx.beginPath();
                ctx.moveTo(ax - 28, ay - 20 + (arr.shaftAngle * 10));
                ctx.lineTo(ax, ay);
                ctx.stroke();

                // Fletchings
                ctx.fillStyle = (arr.player === 1) ? '#06b6d4' : '#f43f5e';
                ctx.beginPath();
                ctx.moveTo(ax - 28, ay - 20 + (arr.shaftAngle * 10));
                ctx.lineTo(ax - 36, ay - 26 + (arr.shaftAngle * 10));
                ctx.lineTo(ax - 30, ay - 16 + (arr.shaftAngle * 10));
                ctx.fill();

                // Puncture Hole
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(ax, ay, 2.8, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.restore();
        },

        // Archery King-Style Magnified Optical Scope Lens
        drawMagnifiedScope: function(targetCx, targetCy) {
            ctx.save();

            // Calculate screen position of scope center
            var currentAimX = smoothAimX + swayX + fatigueShakeX;
            var currentAimY = smoothAimY + swayY + fatigueShakeY;

            var scopeX = targetCx + (currentAimX * 1.8);
            var scopeY = targetCy + (currentAimY * 1.8);
            var scopeRadius = 56;
            var magFactor = 2.4;

            // 1. Clip inside scope circle for magnified view
            ctx.save();
            ctx.beginPath();
            ctx.arc(scopeX, scopeY, scopeRadius, 0, Math.PI * 2);
            ctx.clip();

            // Magnified Background
            ctx.fillStyle = '#020617';
            ctx.fillRect(scopeX - scopeRadius, scopeY - scopeRadius, scopeRadius * 2, scopeRadius * 2);

            // Draw Magnified Target Face centered inside scope
            var magScale = (108 / 61.0) * magFactor;
            var magOffsetX = scopeX - (currentAimX * 1.8 * magFactor);
            var magOffsetY = scopeY - (currentAimY * 1.8 * magFactor);

            var rings = [
                { r: 61.0 * magScale, fill: '#f8fafc', stroke: '#cbd5e1' },
                { r: 48.8 * magScale, fill: '#0f172a', stroke: '#334155' },
                { r: 36.6 * magScale, fill: '#0284c7', stroke: '#38bdf8' },
                { r: 24.4 * magScale, fill: '#e11d48', stroke: '#fb7185' },
                { r: 12.2 * magScale, fill: '#f59e0b', stroke: '#fbbf24' },
                { r: 6.1  * magScale, fill: '#d97706', stroke: '#ffffff' },
                { r: 3.05 * magScale, fill: '#92400e', stroke: '#ffffff' }
            ];

            rings.forEach(function(ring) {
                ctx.fillStyle = ring.fill;
                ctx.strokeStyle = ring.stroke;
                ctx.lineWidth = 2.0;
                ctx.beginPath();
                ctx.arc(magOffsetX, magOffsetY, ring.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            });

            // Magnified Embedded Arrows
            lodgedArrows.forEach(function(arr) {
                var max = magOffsetX + (arr.x * magScale);
                var may = magOffsetY + (arr.y * magScale);

                ctx.strokeStyle = '#f8fafc';
                ctx.lineWidth = 4.5;
                ctx.beginPath();
                ctx.moveTo(max - 40, may - 28);
                ctx.lineTo(max, may);
                ctx.stroke();

                ctx.fillStyle = (arr.player === 1) ? '#06b6d4' : '#f43f5e';
                ctx.beginPath();
                ctx.moveTo(max - 40, may - 28);
                ctx.lineTo(max - 52, may - 38);
                ctx.lineTo(max - 44, may - 22);
                ctx.fill();
            });

            // Optical Lens Anti-Reflective Coating & Glass Vignette
            var lensGrad = ctx.createRadialGradient(scopeX - 15, scopeY - 15, 10, scopeX, scopeY, scopeRadius);
            lensGrad.addColorStop(0, 'rgba(56, 189, 248, 0.18)');
            lensGrad.addColorStop(0.7, 'rgba(14, 165, 233, 0.08)');
            lensGrad.addColorStop(1, 'rgba(2, 132, 199, 0.35)');
            ctx.fillStyle = lensGrad;
            ctx.fillRect(scopeX - scopeRadius, scopeY - scopeRadius, scopeRadius * 2, scopeRadius * 2);

            // Precision Optical Reticle Crosshairs
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(scopeX - scopeRadius, scopeY); ctx.lineTo(scopeX - 10, scopeY);
            ctx.moveTo(scopeX + 10, scopeY); ctx.lineTo(scopeX + scopeRadius, scopeY);
            ctx.moveTo(scopeX, scopeY - scopeRadius); ctx.lineTo(scopeX, scopeY - 10);
            ctx.moveTo(scopeX, scopeY + 10); ctx.lineTo(scopeX, scopeY + scopeRadius);
            ctx.stroke();

            // Illuminated Center Aim Pin
            var pinColor = (holdDuration > 130) ? '#ef4444' : '#22c55e';
            ctx.fillStyle = pinColor;
            ctx.shadowColor = pinColor;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(scopeX, scopeY, 4.0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore(); // Exit clipping

            // 2. Outer Scope Metallic Bezel & Tension Progress Ring
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 9;
            ctx.beginPath();
            ctx.arc(scopeX, scopeY, scopeRadius + 2, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(scopeX, scopeY, scopeRadius, 0, Math.PI * 2);
            ctx.stroke();

            // Circular Power Ring
            var arcColor = (holdDuration > 130) ? '#ef4444' : (drawTension >= 0.95 ? '#22c55e' : '#38bdf8');
            ctx.strokeStyle = arcColor;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(scopeX, scopeY, scopeRadius + 7, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * drawTension));
            ctx.stroke();

            ctx.restore();
        },

        drawFlightArrow: function(flight) {
            ctx.save();
            var t = flight.progress;

            var traj = Physics.getTrajectoryPoint(
                t,
                480, 520, // Start from shooter bow rest
                480, 250, // Target center
                flight.hitX, flight.hitY,
                currentWindX, currentWindY
            );

            ctx.translate(traj.x, traj.y);
            ctx.rotate(traj.pitch);
            ctx.scale(traj.scale, traj.scale);

            // Arrow Shaft
            ctx.strokeStyle = '#f8fafc';
            ctx.lineWidth = 5.0;
            ctx.beginPath();
            ctx.moveTo(-45, 0);
            ctx.lineTo(35, 0);
            ctx.stroke();

            // Tip
            ctx.fillStyle = '#94a3b8';
            ctx.beginPath();
            ctx.moveTo(35, -4);
            ctx.lineTo(46, 0);
            ctx.lineTo(35, 4);
            ctx.fill();

            // Spinning Fletchings
            var spin = Date.now() * 0.04;
            var fletchColor = (isMyTurn ? (isP1 ? '#06b6d4' : '#f43f5e') : (isP1 ? '#f43f5e' : '#06b6d4'));
            ctx.fillStyle = fletchColor;

            ctx.beginPath();
            ctx.moveTo(-45, 0);
            ctx.lineTo(-32, -9 * Math.cos(spin));
            ctx.lineTo(-20, 0);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(-45, 0);
            ctx.lineTo(-32, 9 * Math.cos(spin));
            ctx.lineTo(-20, 0);
            ctx.fill();

            ctx.restore();
        },

        drawParticles: function() {
            ctx.save();
            woodSplinters.forEach(function(sp) {
                ctx.fillStyle = sp.color;
                ctx.beginPath();
                ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
                ctx.fill();
            });

            scoreSparks.forEach(function(sk) {
                ctx.fillStyle = sk.color;
                ctx.shadowColor = '#fbbf24';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(sk.x, sk.y, sk.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
        },

        drawImpactBanner: function(b) {
            ctx.save();
            var W = canvas.width;
            ctx.translate(W / 2, 70);

            ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
            ctx.strokeStyle = b.color;
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.roundRect(-200, -28, 400, 56, 12);
            ctx.fill();
            ctx.stroke();

            ctx.font = 'bold 22px Outfit, sans-serif';
            ctx.fillStyle = b.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText((b.isBullseye ? "🎯 " : "") + b.title, 0, 0);

            ctx.restore();
        }
    };

    $(document).ready(function() {
        Archery.init();
    });

    window.Archery = Archery;

})(window, jQuery, window.ArcheryPhysics);
