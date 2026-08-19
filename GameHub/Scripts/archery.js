/* ==========================================================================
   GAME HUB - Archery Clash: Professional 3D Olympic Range & Sight Engine
   Features: Optical Scope Lens, Air Flow Streamlines, Dynamic Wind Physics,
   Harmonic Breathing Sway, Cinematic Arrow Cam & Slow-Mo Impact Zoom
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
    var p1Shots = [];
    var p2Shots = [];
    var currentWindX = 0; // m/s (-4.0 to +4.0)
    var currentWindY = 0; // m/s (-2.0 to +2.0)

    // Aim & Optical Sight Mechanics
    var isAiming = false;
    var rawAimX = 0; // Target coordinates in cm
    var rawAimY = 0;
    var smoothAimX = 0; // Inertia-smoothed aim
    var smoothAimY = 0;
    var drawTension = 0; // 0.0 to 1.0
    var holdDuration = 0; // frames held
    var dragOrigin = null;

    // Harmonic Breathing Sway
    var swayPhase = 0;
    var currentSwayX = 0;
    var currentSwayY = 0;

    // Air Flow & Environmental Particles
    var airflowStreams = [];
    var windLeaves = [];

    // Camera & Flight Mechanics
    var cameraState = "shooter"; // "shooter", "flight", "impact_zoom", "return"
    var cameraZoom = 1.0;
    var cameraPanX = 0;
    var cameraPanY = 0;
    var activeFlight = null;
    var impactBanner = null;
    var targetShudder = 0;
    var screenShake = 0;
    var impactRingPulse = 0;
    var hitPunctures = []; // Logged punctures on target

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

            this.initAirflow();
            this.bindInputEvents();

            if (sessionId) {
                isMultiplayer = true;
                this.initMultiplayer(p1Url, p2Url);
            } else {
                isMultiplayer = false;
                this.initSinglePlayer();
            }
        },

        initAirflow: function() {
            airflowStreams = [];
            for (var i = 0; i < 18; i++) {
                airflowStreams.push({
                    x: Math.random() * 900,
                    y: Math.random() * 320 + 60,
                    length: Math.random() * 80 + 60,
                    speed: Math.random() * 1.5 + 1.8,
                    curve: Math.random() * 10 - 5,
                    opacity: Math.random() * 0.35 + 0.15
                });
            }

            windLeaves = [];
            for (var j = 0; j < 24; j++) {
                windLeaves.push({
                    x: Math.random() * 900,
                    y: Math.random() * 450,
                    size: Math.random() * 3 + 2,
                    speed: Math.random() * 1.2 + 0.8,
                    rotation: Math.random() * Math.PI * 2,
                    rotSpeed: Math.random() * 0.08 - 0.04,
                    opacity: Math.random() * 0.5 + 0.3
                });
            }
        },

        initSinglePlayer: function() {
            opponentPlayerName = "Bot (" + (difficulty.charAt(0).toUpperCase() + difficulty.slice(1)) + ")";
            isP1 = true;
            isMyTurn = true;

            $('#p1-name').text(myPlayerName);
            $('#p2-name').text(opponentPlayerName);
            $('#game-mode-badge').text('Olympic Range vs ' + opponentPlayerName);

            this.resetMatch();
            this.startLoop();
        },

        initMultiplayer: function(p1Url, p2Url) {
            $('#game-mode-badge').text('Olympic LAN Match (5 Rounds)');
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

            $('#p1-name').text(isP1 ? myName : (p1Url || "Player 1"));
            $('#p2-name').text(isP1 ? (p2Url || "Player 2") : myName);

            this.resetMatch();
            this.updateTurnIndicator();

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
                    currentRound = state.round || 1;
                    currentWindX = (typeof state.archeryWindX === 'number') ? state.archeryWindX : 0;
                    currentWindY = (typeof state.archeryWindY === 'number') ? state.archeryWindY : 0;

                    isMyTurn = state.isYourTurn;
                    self.updateScoreboard();
                    self.updateTurnIndicator();
                };

                hub.client.opponentEnteredSession = function(data) {
                    window.App.toast(data.displayName + " stepped onto the Olympic range!", "info");
                    if (isP1) {
                        opponentPlayerName = data.displayName;
                        $('#p2-name').text(data.displayName);
                    } else {
                        opponentPlayerName = data.displayName;
                        $('#p1-name').text(data.displayName);
                    }
                };

                hub.client.archeryShotTaken = function(res) {
                    var data = res.ExtraData;
                    var shooterNum = data.shooterPlayerNum;

                    self.triggerCinematicFlight(data.aimX, data.aimY, data.power, currentWindX, currentWindY, function(impact) {
                        p1Score = data.p1Total;
                        p2Score = data.p2Total;
                        currentRound = data.currentRound;
                        currentWindX = data.nextWindX;
                        currentWindY = data.nextWindY;

                        if (shooterNum === 1) {
                            p1Shots.push({ score: data.scoreEarned, hitX: data.hitX, hitY: data.hitY, isBullseye: data.isBullseye });
                        } else {
                            p2Shots.push({ score: data.scoreEarned, hitX: data.hitX, hitY: data.hitY, isBullseye: data.isBullseye });
                        }

                        hitPunctures.push({ x: data.hitX, y: data.hitY, player: shooterNum, score: data.scoreEarned });

                        self.updateScoreboard();
                        self.renderTargetMiniMap();

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
                    window.App.toast(opponentPlayerName + " wants a rematch! Click Rematch to accept.", "info");
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
            hitPunctures = [];
            activeFlight = null;
            impactBanner = null;
            cameraState = "shooter";
            cameraZoom = 1.0;
            cameraPanX = 0;
            cameraPanY = 0;
            isAiming = false;
            drawTension = 0;
            holdDuration = 0;
            rawAimX = 0;
            rawAimY = 0;
            smoothAimX = 0;
            smoothAimY = 0;

            // Generate noticeable crosswinds (-3.8 to +3.8 m/s)
            currentWindX = Math.round((Math.random() * 7.6 - 3.8) * 10) / 10;
            currentWindY = Math.round((Math.random() * 3.4 - 1.7) * 10) / 10;

            this.updateScoreboard();
            this.updateTurnIndicator();
            this.renderTargetMiniMap();
        },

        updateScoreboard: function() {
            $('#p1-score-display').text(p1Score);
            $('#p2-score-display').text(p2Score);
            $('#round-number-text').text('Round ' + Math.min(TOTAL_ROUNDS, currentRound) + ' / ' + TOTAL_ROUNDS);

            // Update shot score pills
            var $p1Dots = $('#p1-shot-history');
            var $p2Dots = $('#p2-shot-history');
            $p1Dots.empty();
            $p2Dots.empty();

            for (var i = 0; i < TOTAL_ROUNDS; i++) {
                var s1 = (i < p1Shots.length) ? p1Shots[i].score : "-";
                var s2 = (i < p2Shots.length) ? p2Shots[i].score : "-";

                $p1Dots.append('<span class="archery-score-pill ' + (s1 === 10 ? 'bullseye' : (s1 > 0 ? 'scored' : '')) + '">' + s1 + '</span>');
                $p2Dots.append('<span class="archery-score-pill ' + (s2 === 10 ? 'bullseye' : (s2 > 0 ? 'scored' : '')) + '">' + s2 + '</span>');
            }

            // Wind Compass HUD Widget
            var speed = Math.sqrt(currentWindX * currentWindX + currentWindY * currentWindY);
            var angleDeg = Math.atan2(currentWindY, currentWindX) * (180 / Math.PI);
            $('#wind-status-text').html('Air Flow: <strong>' + speed.toFixed(1) + ' m/s</strong>');
            $('#wind-arrow-icon').css('transform', 'rotate(' + angleDeg + 'deg)');
            $('#wind-status-badge').toggleClass('wind-active', speed > 0.5);
        },

        updateTurnIndicator: function() {
            if (isMyTurn) {
                $('#turn-indicator').text('Your Turn - Drag optical sight onto target & release');
                $('#p1-hud').toggleClass('active-turn', isP1);
                $('#p2-hud').toggleClass('active-turn', !isP1);
            } else {
                $('#turn-indicator').text(opponentPlayerName + "'s Turn to Aim");
                $('#p1-hud').toggleClass('active-turn', !isP1);
                $('#p2-hud').toggleClass('active-turn', isP1);
            }
        },

        renderTargetMiniMap: function() {
            var mapCanvas = document.getElementById('target-minimap');
            if (!mapCanvas) return;
            var mctx = mapCanvas.getContext('2d');
            var W = mapCanvas.width;
            var H = mapCanvas.height;
            var cx = W / 2;
            var cy = H / 2;
            var scale = (W * 0.46) / 60;

            mctx.clearRect(0, 0, W, H);

            // Shaded Olympic Target Rings
            var rings = [
                { r: 60, col: '#f8fafc', stroke: '#cbd5e1' },
                { r: 48, col: '#0f172a', stroke: '#334155' },
                { r: 36, col: '#0284c7', stroke: '#38bdf8' },
                { r: 24, col: '#e11d48', stroke: '#fb7185' },
                { r: 12, col: '#f59e0b', stroke: '#fbbf24' },
                { r: 6,  col: '#d97706', stroke: '#ffffff' }
            ];

            rings.forEach(function(ring) {
                mctx.fillStyle = ring.col;
                mctx.strokeStyle = ring.stroke;
                mctx.lineWidth = 1;
                mctx.beginPath();
                mctx.arc(cx, cy, ring.r * scale, 0, Math.PI * 2);
                mctx.fill();
                mctx.stroke();
            });

            // Target Cross
            mctx.strokeStyle = 'rgba(0,0,0,0.35)';
            mctx.lineWidth = 1;
            mctx.beginPath();
            mctx.moveTo(cx - 30, cy); mctx.lineTo(cx + 30, cy);
            mctx.moveTo(cx, cy - 30); mctx.lineTo(cx, cy + 30);
            mctx.stroke();

            // Punctures
            hitPunctures.forEach(function(p) {
                var px = cx + (p.x * scale);
                var py = cy + (p.y * scale);

                mctx.fillStyle = (p.player === 1) ? '#06b6d4' : '#f43f5e';
                mctx.strokeStyle = '#ffffff';
                mctx.lineWidth = 1.5;

                mctx.beginPath();
                mctx.arc(px, py, 3.5, 0, Math.PI * 2);
                mctx.fill();
                mctx.stroke();
            });
        },

        bindInputEvents: function() {
            var self = this;

            function getCanvasPos(e) {
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
                if (!isMyTurn || cameraState !== "shooter") return;
                var pos = getCanvasPos(e);

                isAiming = true;
                drawTension = 0.2;
                holdDuration = 0;
                dragOrigin = pos;

                // Center sight position
                rawAimX = (pos.x - 450) * 0.32;
                rawAimY = (pos.y - 230) * 0.32;
                smoothAimX = rawAimX;
                smoothAimY = rawAimY;

                if (window.GameAudio) window.GameAudio.playBowDraw();
            });

            $(canvas).on('mousemove touchmove', function(e) {
                if (!isAiming || !dragOrigin) return;
                e.preventDefault();
                var pos = getCanvasPos(e);

                rawAimX = Math.max(-55, Math.min(55, (pos.x - 450) * 0.42));
                rawAimY = Math.max(-55, Math.min(55, (pos.y - 230) * 0.42));
            });

            $(window).on('mouseup touchend', function(e) {
                if (!isAiming) return;
                isAiming = false;
                dragOrigin = null;

                if (!isMyTurn || cameraState !== "shooter") return;

                // Compute release quality (holding too long or releasing early reduces power)
                var power = Math.min(100, Math.max(70, drawTension * 100));
                self.executePlayerShot(smoothAimX + currentSwayX, smoothAimY + currentSwayY, power);
            });

            $('#forfeit-game-btn').on('click', function(e) {
                e.preventDefault();
                if (confirm("Are you sure you want to exit the archery range?")) {
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
                    window.App.toast("Reconnecting...", "warning");
                }
            } else {
                isMyTurn = false;
                this.updateTurnIndicator();

                this.triggerCinematicFlight(finalAimX, finalAimY, power, currentWindX, currentWindY, function(impact) {
                    p1Score += impact.score;
                    p1Shots.push({ score: impact.score, hitX: impact.hitX, hitY: impact.hitY, isBullseye: impact.isBullseye });
                    hitPunctures.push({ x: impact.hitX, y: impact.hitY, player: 1, score: impact.score });

                    self.updateScoreboard();
                    self.renderTargetMiniMap();

                    setTimeout(function() {
                        self.executeBotTurn();
                    }, 1400);
                });
            }
        },

        executeBotTurn: function() {
            var self = this;
            var ideal = Physics.getIdealAimPoint(currentWindX, currentWindY);

            // Bot scatter based on difficulty
            var scatter = 28;
            if (difficulty === 'easy') scatter = 36;
            else if (difficulty === 'normal') scatter = 16;
            else if (difficulty === 'hard') scatter = 4.5;

            var botAimX = ideal.aimX + (Math.random() * (scatter * 2) - scatter);
            var botAimY = ideal.aimY + (Math.random() * (scatter * 2) - scatter);
            var botPower = (difficulty === 'hard') ? 100 : (90 + Math.random() * 10);

            this.triggerCinematicFlight(botAimX, botAimY, botPower, currentWindX, currentWindY, function(impact) {
                p2Score += impact.score;
                p2Shots.push({ score: impact.score, hitX: impact.hitX, hitY: impact.hitY, isBullseye: impact.isBullseye });
                hitPunctures.push({ x: impact.hitX, y: impact.hitY, player: 2, score: impact.score });

                currentRound++;
                currentWindX = Math.round((Math.random() * 7.6 - 3.8) * 10) / 10;
                currentWindY = Math.round((Math.random() * 3.4 - 1.7) * 10) / 10;

                self.updateScoreboard();
                self.renderTargetMiniMap();

                if (currentRound > TOTAL_ROUNDS) {
                    var isWin = (p1Score > p2Score);
                    var isDraw = (p1Score === p2Score);

                    setTimeout(function() {
                        window.App.showGameModal({
                            title: isDraw ? "Match Tied!" : (isWin ? "Olympic Champion!" : "Bot Won!"),
                            text: isDraw ? "Tied at " + p1Score + " - " + p2Score + "." : (isWin ? "Spectacular shooting! You won (" + p1Score + " - " + p2Score + ")." : "The " + difficulty + " bot won (" + p2Score + " - " + p1Score + "). Rematch?"),
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
            if (window.GameAudio) window.GameAudio.playBowRelease();

            var impact = Physics.calculateImpact(aimX, aimY, power, windX, windY);
            var self = this;

            cameraState = "flight";
            var flightDurationMs = 750;
            var startTime = performance.now();

            activeFlight = {
                progress: 0,
                aimX: aimX,
                aimY: aimY,
                hitX: impact.hitX,
                hitY: impact.hitY,
                driftX: impact.driftX,
                driftY: impact.driftY,
                impactInfo: impact
            };

            function flightStep(now) {
                var elapsed = now - startTime;
                var prog = Math.min(1.0, elapsed / flightDurationMs);
                activeFlight.progress = prog;

                // 3D Camera Follow Curve
                cameraZoom = 1.0 + (prog * 1.85);
                cameraPanX = (impact.hitX * 2.1) * prog;
                cameraPanY = (impact.hitY * 2.1) * prog;

                if (prog >= 1.0) {
                    // Impact Zoom & Target Shudder
                    cameraState = "impact_zoom";
                    activeFlight = null;
                    targetShudder = 28;
                    screenShake = 14;
                    impactRingPulse = 30;

                    if (window.GameAudio) window.GameAudio.playTargetHit(impact.isBullseye, impact.isXRing);

                    impactBanner = {
                        title: impact.ringName,
                        score: impact.score,
                        color: impact.ringColor,
                        isBullseye: impact.isBullseye,
                        opacity: 1.0
                    };

                    if (typeof onComplete === 'function') {
                        onComplete(impact);
                    }

                    // Return to Shooter Camera
                    setTimeout(function() {
                        cameraState = "return";
                        var returnStart = performance.now();
                        var returnDur = 480;

                        function returnStep(rNow) {
                            var rElapsed = rNow - returnStart;
                            var rProg = Math.min(1.0, rElapsed / returnDur);

                            cameraZoom = 1.0 + 1.85 * (1.0 - rProg);
                            cameraPanX *= (1.0 - rProg);
                            cameraPanY *= (1.0 - rProg);

                            if (rProg >= 1.0) {
                                cameraState = "shooter";
                                cameraZoom = 1.0;
                                cameraPanX = 0;
                                cameraPanY = 0;
                                impactBanner = null;
                            } else {
                                requestAnimationFrame(returnStep);
                            }
                        }
                        requestAnimationFrame(returnStep);
                    }, 1400);

                    return;
                }

                requestAnimationFrame(flightStep);
            }

            requestAnimationFrame(flightStep);
        },

        startLoop: function() {
            var self = this;
            function step() {
                self.update();
                self.render();
                animFrameId = requestAnimationFrame(step);
            }
            if (animFrameId) cancelAnimationFrame(animFrameId);
            animFrameId = requestAnimationFrame(step);
        },

        update: function() {
            // 1. Aim Inertia Smoothing
            smoothAimX += (rawAimX - smoothAimX) * 0.22;
            smoothAimY += (rawAimY - smoothAimY) * 0.22;

            // 2. Harmonic Breathing Sway
            swayPhase += 0.042;
            var swayMagnitude = 2.4;
            if (isAiming) {
                holdDuration++;
                if (holdDuration > 140) {
                    // Fatigue sway penalty if held too long
                    swayMagnitude += (holdDuration - 140) * 0.04;
                }
            } else {
                holdDuration = 0;
            }

            currentSwayX = Math.sin(swayPhase * 0.8) * swayMagnitude;
            currentSwayY = Math.cos(swayPhase * 1.6) * (swayMagnitude * 0.8);

            // 3. Draw Tension Arc
            if (isAiming) {
                drawTension = Math.min(1.0, drawTension + 0.045);
            } else {
                drawTension = Math.max(0, drawTension - 0.1);
            }

            // 4. Air Flow Streamlines Simulation
            var windSpeedMagnitude = Math.sqrt(currentWindX * currentWindX + currentWindY * currentWindY);
            var windNormX = (windSpeedMagnitude > 0.01) ? (currentWindX / windSpeedMagnitude) : 1;
            var windNormY = (windSpeedMagnitude > 0.01) ? (currentWindY / windSpeedMagnitude) : 0;

            airflowStreams.forEach(function(s) {
                s.x += (currentWindX * 1.8 + 0.6) * s.speed;
                s.y += (currentWindY * 0.8) * s.speed;

                if (s.x > 940) s.x = -100;
                if (s.x < -100) s.x = 940;
                if (s.y > 490) s.y = 20;
                if (s.y < 20) s.y = 490;
            });

            windLeaves.forEach(function(l) {
                l.x += (currentWindX * 1.2 + 0.5) * l.speed;
                l.y += (currentWindY * 0.6 + 0.2) * l.speed;
                l.rotation += l.rotSpeed;

                if (l.x > 920) l.x = -20;
                if (l.x < -20) l.x = 920;
                if (l.y > 490) l.y = -10;
                if (l.y < -10) l.y = 490;
            });

            // 5. Decays
            if (targetShudder > 0) targetShudder--;
            if (screenShake > 0) screenShake--;
            if (impactRingPulse > 0) impactRingPulse--;
        },

        render: function() {
            var W = canvas.width;
            var H = canvas.height;

            ctx.save();

            // Screen Shake
            if (screenShake > 0) {
                var sx = (Math.random() - 0.5) * screenShake * 0.8;
                var sy = (Math.random() - 0.5) * screenShake * 0.8;
                ctx.translate(sx, sy);
            }

            // Camera Transformation
            ctx.translate(W / 2, H / 2);
            ctx.scale(cameraZoom, cameraZoom);
            ctx.translate(-W / 2 - cameraPanX, -H / 2 - cameraPanY);

            // 1. Sky & Sun Atmospheric Rays
            var skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.75);
            skyGrad.addColorStop(0, '#020617');
            skyGrad.addColorStop(0.25, '#0c192c');
            skyGrad.addColorStop(0.6, '#1e3a5f');
            skyGrad.addColorStop(0.85, '#2e5b88');
            skyGrad.addColorStop(1, '#0e2b36');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(-W, -H, W * 3, H * 2);

            // Sun Rays / Lens Flare Glow
            var sunGlow = ctx.createRadialGradient(W * 0.72, 70, 10, W * 0.72, 70, 260);
            sunGlow.addColorStop(0, 'rgba(253, 224, 71, 0.45)');
            sunGlow.addColorStop(0.4, 'rgba(245, 158, 11, 0.18)');
            sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = sunGlow;
            ctx.fillRect(0, 0, W, 280);

            // Distant Mountains & Pine Forests
            ctx.fillStyle = '#061325';
            ctx.beginPath();
            ctx.moveTo(0, 220);
            ctx.lineTo(160, 120);
            ctx.lineTo(340, 200);
            ctx.lineTo(540, 95);
            ctx.lineTo(740, 185);
            ctx.lineTo(W, 140);
            ctx.lineTo(W, 300);
            ctx.lineTo(0, 300);
            ctx.fill();

            // Midground Stadium Banners & Hedge Wall
            ctx.fillStyle = '#0f291e';
            ctx.fillRect(0, 210, W, 20);

            // 2. 3D Grass Range Field with Depth Perspective
            var lawnGrad = ctx.createLinearGradient(0, 220, 0, H);
            lawnGrad.addColorStop(0, '#064e3b');
            lawnGrad.addColorStop(0.2, '#043e2e');
            lawnGrad.addColorStop(0.6, '#032c21');
            lawnGrad.addColorStop(1, '#021c15');
            ctx.fillStyle = lawnGrad;
            ctx.fillRect(-W, 220, W * 3, H);

            // Perspective Lane Ropes & Lawn Stripes
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(450, 230); ctx.lineTo(60, H);
            ctx.moveTo(450, 230); ctx.lineTo(840, H);
            ctx.stroke();

            // Distance Yard Lines (10m, 20m, 30m, 40m, 50m Target Line)
            [
                { y: 245, txt: "40m" },
                { y: 285, txt: "30m" },
                { y: 345, txt: "20m" },
                { y: 425, txt: "10m" }
            ].forEach(function(d) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(0, d.y); ctx.lineTo(W, d.y);
                ctx.stroke();

                ctx.font = 'bold 11px Outfit, sans-serif';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillText(d.txt, 80, d.y - 4);
                ctx.fillText(d.txt, 800, d.y - 4);
            });

            // 3. Lane Flags on Posts Fluttering in Wind
            this.drawLaneFlags(currentWindX);

            // 4. Visible Air Flow Streamlines & Wind Dust
            this.drawAirflowStreams();

            // 5. 3D Target Stand & Rings (At Center 450, 230)
            this.draw3DTarget(450, 230);

            // 6. In-Flight 3D Arrow
            if (activeFlight) {
                this.drawInFlightArrow(activeFlight);
            }

            ctx.restore();

            // 7. First-Person Modern Optical Bow Scope & Sight (Shooter view)
            if (cameraState === "shooter") {
                this.drawOpticalBowSight(W / 2, H);
            }

            // 8. Impact Score Banner
            if (impactBanner) {
                this.drawImpactBanner(impactBanner);
            }
        },

        drawLaneFlags: function(windX) {
            ctx.save();
            var flagTilt = Math.max(-25, Math.min(25, windX * 6.5));
            var flapOffset = Math.sin(Date.now() * 0.015) * (Math.abs(windX) * 2 + 2);

            [
                { x: 120, y: 380, h: 65 },
                { x: 780, y: 380, h: 65 },
                { x: 220, y: 310, h: 48 },
                { x: 680, y: 310, h: 48 },
                { x: 320, y: 260, h: 32 },
                { x: 580, y: 260, h: 32 }
            ].forEach(function(post) {
                // Post
                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(post.x, post.y);
                ctx.lineTo(post.x, post.y - post.h);
                ctx.stroke();

                // Fluttering Fabric Flag
                ctx.fillStyle = '#06b6d4';
                ctx.beginPath();
                ctx.moveTo(post.x, post.y - post.h);
                ctx.lineTo(post.x + flagTilt + flapOffset, post.y - post.h + 8);
                ctx.lineTo(post.x, post.y - post.h + 16);
                ctx.fill();
            });
            ctx.restore();
        },

        drawAirflowStreams: function() {
            ctx.save();
            // Air Flow Curved Streamlines
            airflowStreams.forEach(function(s) {
                ctx.strokeStyle = 'rgba(56, 189, 248, ' + s.opacity + ')';
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.quadraticCurveTo(s.x + s.length * 0.5, s.y + s.curve, s.x + s.length, s.y);
                ctx.stroke();
            });

            // Drifting Wind Particles / Leaves
            windLeaves.forEach(function(l) {
                ctx.save();
                ctx.translate(l.x, l.y);
                ctx.rotate(l.rotation);
                ctx.fillStyle = 'rgba(251, 191, 36, ' + l.opacity + ')';
                ctx.beginPath();
                ctx.ellipse(0, 0, l.size * 1.8, l.size * 0.8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
            ctx.restore();
        },

        draw3DTarget: function(cx, cy) {
            ctx.save();

            // Target Shudder Wobble
            var shX = (targetShudder > 0) ? Math.sin(targetShudder * 1.8) * targetShudder * 0.45 : 0;
            var shY = (targetShudder > 0) ? Math.cos(targetShudder * 1.8) * targetShudder * 0.35 : 0;
            ctx.translate(shX, shY);

            // 3D Wooden Tripod Stand
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(cx - 60, cy + 190); ctx.lineTo(cx, cy); ctx.lineTo(cx + 60, cy + 190);
            ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + 185);
            ctx.stroke();

            // Target Stand Cast Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.ellipse(cx, cy + 190, 85, 16, 0, 0, Math.PI * 2);
            ctx.fill();

            // Target Rim (Straw Boss Frame)
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(cx, cy, 112, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Olympic Concentric Rings (60cm scaled to 104px)
            var scale = 104 / 60;
            var rings = [
                { r: 60 * scale, fill: '#f8fafc', stroke: '#cbd5e1' },
                { r: 48 * scale, fill: '#0f172a', stroke: '#334155' },
                { r: 36 * scale, fill: '#0284c7', stroke: '#38bdf8' },
                { r: 24 * scale, fill: '#e11d48', stroke: '#fb7185' },
                { r: 12 * scale, fill: '#f59e0b', stroke: '#fbbf24' },
                { r: 6  * scale, fill: '#d97706', stroke: '#ffffff' },
                { r: 3.2* scale, fill: '#92400e', stroke: '#ffffff' }
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

            // Target Center Cross "+"
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx - 12, cy); ctx.lineTo(cx + 12, cy);
            ctx.moveTo(cx, cy - 12); ctx.lineTo(cx, cy + 12);
            ctx.stroke();

            // Impact Expansion Pulse
            if (impactRingPulse > 0) {
                ctx.strokeStyle = 'rgba(251, 191, 36, ' + (impactRingPulse / 30) + ')';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(cx, cy, (30 - impactRingPulse) * 4, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Embedded Stuck Arrows
            hitPunctures.forEach(function(arr) {
                var ax = cx + (arr.x * scale);
                var ay = cy + (arr.y * scale);

                // Carbon Shaft
                ctx.strokeStyle = '#f8fafc';
                ctx.lineWidth = 3.2;
                ctx.beginPath();
                ctx.moveTo(ax - 30, ay - 20);
                ctx.lineTo(ax, ay);
                ctx.stroke();

                // Fletching
                ctx.fillStyle = (arr.player === 1) ? '#06b6d4' : '#f43f5e';
                ctx.beginPath();
                ctx.moveTo(ax - 30, ay - 20);
                ctx.lineTo(ax - 38, ay - 26);
                ctx.lineTo(ax - 32, ay - 16);
                ctx.fill();

                // Hole
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(ax, ay, 2.8, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.restore();
        },

        drawOpticalBowSight: function(cx, cy) {
            ctx.save();

            // Scope Sight Center Position with Smooth Aim & Breath Sway
            var sightX = 450 + (smoothAimX + currentSwayX) * 2.8;
            var sightY = 230 + (smoothAimY + currentSwayY) * 2.8;

            // 1. Magnifying Optical Scope Housing
            ctx.save();
            ctx.shadowColor = isAiming ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)';
            ctx.shadowBlur = isAiming ? 20 : 10;

            // Metallic Scope Ring
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(sightX, sightY, 38, 0, Math.PI * 2);
            ctx.stroke();

            // Outer Scope Anodized Ring
            ctx.strokeStyle = isAiming ? '#38bdf8' : '#64748b';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(sightX, sightY, 36, 0, Math.PI * 2);
            ctx.stroke();

            // Optical Glass Lens Reflection (Blue anti-reflective coating)
            var lensGrad = ctx.createRadialGradient(sightX - 10, sightY - 10, 5, sightX, sightY, 36);
            lensGrad.addColorStop(0, 'rgba(56, 189, 248, 0.18)');
            lensGrad.addColorStop(0.7, 'rgba(14, 165, 233, 0.08)');
            lensGrad.addColorStop(1, 'rgba(2, 132, 199, 0.25)');
            ctx.fillStyle = lensGrad;
            ctx.beginPath();
            ctx.arc(sightX, sightY, 35, 0, Math.PI * 2);
            ctx.fill();

            // Illuminated Precision Crosshairs
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(sightX - 35, sightY); ctx.lineTo(sightX - 8, sightY);
            ctx.moveTo(sightX + 8, sightY); ctx.lineTo(sightX + 35, sightY);
            ctx.moveTo(sightX, sightY - 35); ctx.lineTo(sightX, sightY - 8);
            ctx.moveTo(sightX, sightY + 8); ctx.lineTo(sightX, sightY + 35);
            ctx.stroke();

            // Range Tick Graduations
            [-20, -10, 10, 20].forEach(function(offset) {
                ctx.beginPath();
                ctx.moveTo(sightX + offset, sightY - 3); ctx.lineTo(sightX + offset, sightY + 3);
                ctx.moveTo(sightX - 3, sightY + offset); ctx.lineTo(sightX + 3, sightY + offset);
                ctx.stroke();
            });

            // Center Fiber-Optic Glowing Aim Pin
            var pinColor = isAiming ? '#22c55e' : '#ef4444';
            ctx.fillStyle = pinColor;
            ctx.shadowColor = pinColor;
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.arc(sightX, sightY, 3.8, 0, Math.PI * 2);
            ctx.fill();

            // Draw Hold Countdown Tension Arc
            if (isAiming) {
                var arcColor = (holdDuration > 140) ? '#ef4444' : (drawTension >= 0.95 ? '#22c55e' : '#38bdf8');
                ctx.strokeStyle = arcColor;
                ctx.lineWidth = 3.5;
                ctx.beginPath();
                ctx.arc(sightX, sightY, 44, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * drawTension));
                ctx.stroke();
            }

            ctx.restore();

            // 2. Foreground 3D Tournament Carbon Bow
            var pullBack = drawTension * 38;
            var bowX = cx - 110;
            var bowY = cy + 40;

            // Stabilizer Rod with Damper Weights
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 9;
            ctx.beginPath();
            ctx.moveTo(bowX + 50, bowY - 110);
            ctx.lineTo(sightX + 15, sightY + 50);
            ctx.stroke();

            // Carbon Riser
            var riserGrad = ctx.createLinearGradient(bowX, bowY, bowX + 70, bowY - 360);
            riserGrad.addColorStop(0, '#060b18');
            riserGrad.addColorStop(0.5, '#334155');
            riserGrad.addColorStop(1, '#060b18');
            ctx.strokeStyle = riserGrad;
            ctx.lineWidth = 19;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(bowX - 35, bowY + 10);
            ctx.lineTo(bowX + 35, bowY - 150);
            ctx.lineTo(bowX - 25, bowY - 370);
            ctx.stroke();

            // Carbon Fiber Arrow Resting on Arrow Rest
            ctx.strokeStyle = '#f8fafc';
            ctx.lineWidth = 4.8;
            ctx.beginPath();
            ctx.moveTo(bowX + 15, bowY - 140 + pullBack * 0.35);
            ctx.lineTo(sightX, sightY);
            ctx.stroke();

            // Steel Arrow Point Tip
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.moveTo(sightX, sightY);
            ctx.lineTo(sightX - 11, sightY - 5);
            ctx.lineTo(sightX - 11, sightY + 5);
            ctx.fill();

            ctx.restore();
        },

        drawInFlightArrow: function(flight) {
            ctx.save();
            var prog = flight.progress;

            var startX = 450;
            var startY = 480;
            var targetX = 450 + (flight.hitX * (104 / 60));
            var targetY = 230 + (flight.hitY * (104 / 60));

            // Parabolic Flight Arc with Wind Drift
            var currentX = startX + (targetX - startX) * prog;
            var currentY = startY + (targetY - startY) * prog - Math.sin(prog * Math.PI) * 50;
            var currentScale = 1.7 * (1.0 - prog * 0.7);

            // Motion Trail
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
            ctx.lineWidth = 3.5 * currentScale;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(currentX, currentY);
            ctx.stroke();

            // Arrow Body
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.arc(currentX, currentY, 4.2 * currentScale, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        },

        drawImpactBanner: function(banner) {
            ctx.save();
            var W = canvas.width;

            // Glassmorphic Impact Banner
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.strokeStyle = banner.color;
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.roundRect(W / 2 - 230, 32, 460, 72, 18);
            ctx.fill();
            ctx.stroke();

            // Text
            ctx.font = 'bold 28px Outfit, Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = banner.color;
            ctx.shadowColor = banner.color;
            ctx.shadowBlur = 18;
            ctx.fillText(banner.title, W / 2, 68);

            ctx.restore();
        }
    };

    $(document).ready(function() {
        Archery.init();
    });

    window.Archery = Archery;

})(window, jQuery, window.ArcheryPhysics);
