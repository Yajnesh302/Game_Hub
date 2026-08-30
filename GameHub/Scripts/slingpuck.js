/* ==========================================================================
   GAME HUB - Sling Puck Frenzy: Fast-Sling Tabletop Physics Engine
   Features:
   - 2D Rigid Body Circle-Circle Elastic Collisions & Restitution
   - Elastic Bungee Cord Simulation with Quadratic Spline Stretch & Recoil
   - Narrow Center Gate Divider with Rounded Ricochet Posts
   - Dual-Player Simultaneous Slingshot Action (Solo vs AI & LAN Multiplayer)
   - Real-time Puck Count Telemetry & Victory Celebration Sparks
   ========================================================================== */

(function(window, $) {
    'use strict';

    var canvas, ctx;
    var isMultiplayer = false;
    var sessionId = null;
    var difficulty = "medium";
    var myPlayerName = "Player";
    var opponentPlayerName = "Bot";
    var isP1 = true;
    var isGameOver = false;

    var W = 900;
    var H = 540;
    var PUCK_RADIUS = 19;
    var GATE_Y1 = 215; // Gate opening: Y 215 to 325 (height 110px)
    var GATE_Y2 = 325;
    var GATE_X = 450;
    var DIVIDER_THICKNESS = 18;

    // Elastic Bungee Slings
    var P1_SLING_X = 85;
    var P2_SLING_X = 815;
    var SLING_Y1 = 45;
    var SLING_Y2 = 495;

    // Slings recoil state
    var p1SlingRecoil = 0;
    var p2SlingRecoil = 0;

    // Pucks Array: 10 pucks total
    var pucks = [];
    var draggedPuck = null; // {puck, pointerId, startX, startY, currentX, currentY}

    // Remote opponent dragging puck tracking
    var remoteDraggedPuckId = null;

    // Bot AI State
    var botTargetPuck = null;
    var botDragState = null; // {puck, progress, pullX, pullY, aimY}
    var lastBotActionTime = 0;

    // Effects & Sparks
    var sparkParticles = [];

    var animFrameId = null;
    var lastSyncSendTime = 0;
    var lastDragSendTime = 0;

    var SlingPuck = {
        init: function() {
            canvas = document.getElementById('slingpuck-canvas');
            if (!canvas) return;
            ctx = canvas.getContext('2d');

            var urlParams = new URLSearchParams(window.location.search);
            sessionId = urlParams.get('session');
            difficulty = urlParams.get('diff') || 'medium';
            var p1Url = urlParams.get('p1') || '';
            var p2Url = urlParams.get('p2') || '';

            myPlayerName = window.App ? window.App.getPlayerName() : "Player";

            this.initPucks();
            this.bindEvents();

            if (sessionId) {
                isMultiplayer = true;
                this.initMultiplayer(p1Url, p2Url);
            } else {
                isMultiplayer = false;
                this.initSinglePlayer();
            }
        },

        initPucks: function() {
            pucks = [];
            isGameOver = false;
            draggedPuck = null;
            remoteDraggedPuckId = null;
            botDragState = null;
            sparkParticles = [];

            // 5 Left Pucks (P1 Cyan)
            var leftPositions = [
                { x: 170, y: 130 },
                { x: 170, y: 270 },
                { x: 170, y: 410 },
                { x: 280, y: 190 },
                { x: 280, y: 350 }
            ];

            leftPositions.forEach(function(pos, idx) {
                pucks.push({
                    id: idx,
                    x: pos.x,
                    y: pos.y,
                    vx: 0,
                    vy: 0,
                    owner: 1,
                    color: '#38bdf8'
                });
            });

            // 5 Right Pucks (P2 Rose)
            var rightPositions = [
                { x: 730, y: 130 },
                { x: 730, y: 270 },
                { x: 730, y: 410 },
                { x: 620, y: 190 },
                { x: 620, y: 350 }
            ];

            rightPositions.forEach(function(pos, idx) {
                pucks.push({
                    id: idx + 5,
                    x: pos.x,
                    y: pos.y,
                    vx: 0,
                    vy: 0,
                    owner: 2,
                    color: '#f43f5e'
                });
            });

            this.updatePuckCounters();
        },

        initSinglePlayer: function() {
            opponentPlayerName = "Sling Bot (" + (difficulty.charAt(0).toUpperCase() + difficulty.slice(1)) + ")";
            isP1 = true;

            $('#p1-name').text(myPlayerName);
            $('#p2-name').text(opponentPlayerName);
            $('#p1-avatar-letter').text(myPlayerName.charAt(0).toUpperCase());
            $('#p2-avatar-letter').text(opponentPlayerName.charAt(0).toUpperCase());
            $('#game-mode-badge').text('⚡ Sling Puck Arena vs ' + opponentPlayerName);

            this.startLoop();
        },

        initMultiplayer: function(p1Url, p2Url) {
            $('#game-mode-badge').text('⚔️ LAN Sling Puck Duel (Live)');
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

            window.GameHubClient.init(function(hub) {
                hub.client.slingPuckStateReceived = function(state) {
                    if (!state) return;

                    if (state.action === 'shoot') {
                        // Remote player fired a puck
                        var targetPuck = pucks[state.puckId];
                        if (targetPuck) {
                            targetPuck.x = state.x;
                            targetPuck.y = state.y;
                            targetPuck.vx = state.vx;
                            targetPuck.vy = state.vy;

                            if (state.player === 1) p1SlingRecoil = 14.0;
                            else p2SlingRecoil = 14.0;

                            if (window.GameAudio && window.GameAudio.playSlingSnap) {
                                window.GameAudio.playSlingSnap();
                            }
                        }
                        if (remoteDraggedPuckId === state.puckId) {
                            remoteDraggedPuckId = null;
                        }
                    } else if (state.action === 'drag') {
                        // Remote player is dragging a puck
                        var dp = pucks[state.puckId];
                        if (dp) {
                            dp.x = state.x;
                            dp.y = state.y;
                            dp.vx = 0;
                            dp.vy = 0;
                            remoteDraggedPuckId = state.puckId;
                        }
                    } else if (state.action === 'sync' && !isP1) {
                        // Player 2 reconciles pucks from Host Player 1
                        if (state.pucks && Array.isArray(state.pucks)) {
                            state.pucks.forEach(function(remotePuck, idx) {
                                if (idx < pucks.length) {
                                    // Don't overwrite puck currently being dragged by Player 2
                                    if (!draggedPuck || draggedPuck.puck.id !== idx) {
                                        pucks[idx].x += (remotePuck.x - pucks[idx].x) * 0.45;
                                        pucks[idx].y += (remotePuck.y - pucks[idx].y) * 0.45;
                                        pucks[idx].vx = remotePuck.vx;
                                        pucks[idx].vy = remotePuck.vy;
                                    }
                                }
                            });
                            self.updatePuckCounters();
                        }
                    }
                };

                hub.client.slingPuckGameFinished = function(result) {
                    var isMeWinner = (result.ExtraData.winnerPlayerNumber === (isP1 ? 1 : 2));
                    self.showGameOverModal(isMeWinner, result.ExtraData.winnerName);
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
                window.GameHubClient.hub.server.joinSession(sessionId, myName, 11, p1Url, p2Url);
            });

            this.startLoop();
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
                if (isGameOver) return;
                var pos = getCanvasCoords(e);

                // Check which puck was clicked on the local player's half
                var myCourtMinX = isP1 ? 40 : 460;
                var myCourtMaxX = isP1 ? 440 : 860;

                for (var i = 0; i < pucks.length; i++) {
                    var p = pucks[i];
                    var dx = pos.x - p.x;
                    var dy = pos.y - p.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist <= PUCK_RADIUS + 12) {
                        // Ensure puck is in local player's half
                        if (p.x >= myCourtMinX && p.x <= myCourtMaxX) {
                            draggedPuck = {
                                puck: p,
                                startX: p.x,
                                startY: p.y,
                                currentX: pos.x,
                                currentY: pos.y
                            };

                            p.vx = 0;
                            p.vy = 0;

                            if (window.GameAudio && window.GameAudio.playSlingPull) {
                                window.GameAudio.playSlingPull();
                            }
                            break;
                        }
                    }
                }
            });

            $(canvas).on('mousemove touchmove', function(e) {
                if (!draggedPuck || isGameOver) return;
                e.preventDefault();
                var pos = getCanvasCoords(e);

                draggedPuck.currentX = pos.x;
                draggedPuck.currentY = pos.y;

                // Drag puck backwards toward the elastic band
                var p = draggedPuck.puck;
                if (isP1) {
                    p.x = Math.max(48, Math.min(220, pos.x));
                } else {
                    p.x = Math.max(680, Math.min(852, pos.x));
                }
                p.y = Math.max(55, Math.min(485, pos.y));

                // Send throttled drag position over SignalR
                var now = performance.now();
                if (isMultiplayer && window.GameHubClient.isConnected() && (now - lastDragSendTime > 40)) {
                    lastDragSendTime = now;
                    window.GameHubClient.hub.server.sendSlingPuckState(sessionId, {
                        action: 'drag',
                        puckId: p.id,
                        x: p.x,
                        y: p.y
                    });
                }
            });

            $(window).on('mouseup touchend', function(e) {
                if (!draggedPuck || isGameOver) return;
                var p = draggedPuck.puck;

                // Calculate slingshot release impulse
                var slingX = isP1 ? P1_SLING_X : P2_SLING_X;
                var displacement = isP1 ? (slingX - p.x) : (p.x - slingX);

                if (displacement > 8) {
                    var power = Math.min(38, displacement) * 30.0;
                    var shootAngle = 0;

                    if (isP1) {
                        var targetGateY = H / 2;
                        var dy = targetGateY - p.y;
                        var dx = GATE_X - p.x;
                        shootAngle = Math.atan2(dy, dx);
                        p.vx = Math.cos(shootAngle) * power;
                        p.vy = Math.sin(shootAngle) * power * 0.85;
                        p1SlingRecoil = 14.0;
                    } else {
                        var targetGateY = H / 2;
                        var dy = targetGateY - p.y;
                        var dx = GATE_X - p.x;
                        shootAngle = Math.atan2(dy, dx);
                        p.vx = Math.cos(shootAngle) * power;
                        p.vy = Math.sin(shootAngle) * power * 0.85;
                        p2SlingRecoil = 14.0;
                    }

                    if (window.GameAudio && window.GameAudio.playSlingSnap) {
                        window.GameAudio.playSlingSnap();
                    }

                    if (isMultiplayer && window.GameHubClient.isConnected()) {
                        // Broadcast shot event to opponent
                        window.GameHubClient.hub.server.sendSlingPuckState(sessionId, {
                            action: 'shoot',
                            player: isP1 ? 1 : 2,
                            puckId: p.id,
                            x: p.x,
                            y: p.y,
                            vx: p.vx,
                            vy: p.vy
                        });
                    }
                }

                draggedPuck = null;
            });

            $('#forfeit-game-btn').on('click', function(e) {
                e.preventDefault();
                if (confirm("Exit Sling Puck Match?")) {
                    if (isMultiplayer && window.GameHubClient.isConnected()) {
                        window.GameHubClient.hub.server.leaveGame(sessionId);
                    }
                    window.location.href = "../Default.aspx";
                }
            });
        },

        startLoop: function() {
            var self = this;
            var lastTime = performance.now();

            function loop(now) {
                var dt = Math.min(32, now - lastTime) / 1000;
                lastTime = now;

                self.update(dt);
                self.draw();
                animFrameId = requestAnimationFrame(loop);
            }

            if (animFrameId) cancelAnimationFrame(animFrameId);
            animFrameId = requestAnimationFrame(loop);
        },

        update: function(dt) {
            if (isGameOver) return;

            // Recoil decay
            p1SlingRecoil *= 0.82;
            p2SlingRecoil *= 0.82;

            // Bot AI in Solo Mode
            if (!isMultiplayer && isP1) {
                this.updateBotAI(dt);
            }

            // Real-Time Physics Update on Both Clients
            for (var i = 0; i < pucks.length; i++) {
                var p = pucks[i];

                if (draggedPuck && draggedPuck.puck === p) continue;
                if (remoteDraggedPuckId === p.id) continue;
                if (botDragState && botDragState.puck === p) continue;

                // Move
                p.x += p.vx * dt;
                p.y += p.vy * dt;

                // Friction Damping
                p.vx *= 0.988;
                p.vy *= 0.988;

                if (Math.abs(p.vx) < 3.0) p.vx = 0;
                if (Math.abs(p.vy) < 3.0) p.vy = 0;

                // Outer Wall Collisions
                if (p.x - PUCK_RADIUS <= 40) {
                    p.x = 40 + PUCK_RADIUS;
                    p.vx = Math.abs(p.vx) * 0.85;
                    if (Math.abs(p.vx) > 30 && window.GameAudio && window.GameAudio.playPuckClack) window.GameAudio.playPuckClack(Math.abs(p.vx));
                } else if (p.x + PUCK_RADIUS >= 860) {
                    p.x = 860 - PUCK_RADIUS;
                    p.vx = -Math.abs(p.vx) * 0.85;
                    if (Math.abs(p.vx) > 30 && window.GameAudio && window.GameAudio.playPuckClack) window.GameAudio.playPuckClack(Math.abs(p.vx));
                }

                if (p.y - PUCK_RADIUS <= 40) {
                    p.y = 40 + PUCK_RADIUS;
                    p.vy = Math.abs(p.vy) * 0.85;
                    if (Math.abs(p.vy) > 30 && window.GameAudio && window.GameAudio.playPuckClack) window.GameAudio.playPuckClack(Math.abs(p.vy));
                } else if (p.y + PUCK_RADIUS >= 500) {
                    p.y = 500 - PUCK_RADIUS;
                    p.vy = -Math.abs(p.vy) * 0.85;
                    if (Math.abs(p.vy) > 30 && window.GameAudio && window.GameAudio.playPuckClack) window.GameAudio.playPuckClack(Math.abs(p.vy));
                }

                // Center Divider & Gate Collision
                var divLeft = GATE_X - DIVIDER_THICKNESS / 2;
                var divRight = GATE_X + DIVIDER_THICKNESS / 2;

                // Check if colliding with Top Divider (Y <= GATE_Y1)
                if (p.y - PUCK_RADIUS < GATE_Y1) {
                    if (p.x + PUCK_RADIUS >= divLeft && p.x - PUCK_RADIUS <= divRight) {
                        if (p.x < GATE_X) {
                            p.x = divLeft - PUCK_RADIUS;
                            p.vx = -Math.abs(p.vx) * 0.85;
                        } else {
                            p.x = divRight + PUCK_RADIUS;
                            p.vx = Math.abs(p.vx) * 0.85;
                        }
                    }
                }
                // Check if colliding with Bottom Divider (Y >= GATE_Y2)
                else if (p.y + PUCK_RADIUS > GATE_Y2) {
                    if (p.x + PUCK_RADIUS >= divLeft && p.x - PUCK_RADIUS <= divRight) {
                        if (p.x < GATE_X) {
                            p.x = divLeft - PUCK_RADIUS;
                            p.vx = -Math.abs(p.vx) * 0.85;
                        } else {
                            p.x = divRight + PUCK_RADIUS;
                            p.vx = Math.abs(p.vx) * 0.85;
                        }
                    }
                }
                // Passing cleanly through the Center Gate!
                else {
                    if (Math.abs(p.x - GATE_X) < 12 && Math.abs(p.vx) > 80) {
                        this.triggerGatePassEffect(p.x, p.y);
                    }
                }
            }

            // Circle-Circle Rigid Body Collisions
            for (var a = 0; a < pucks.length; a++) {
                for (var b = a + 1; b < pucks.length; b++) {
                    var p1 = pucks[a];
                    var p2 = pucks[b];

                    var cdx = p2.x - p1.x;
                    var cdy = p2.y - p1.y;
                    var cdist = Math.sqrt(cdx * cdx + cdy * cdy);
                    var minDist = PUCK_RADIUS * 2;

                    if (cdist < minDist && cdist > 0.001) {
                        var nx = cdx / cdist;
                        var ny = cdy / cdist;
                        var overlap = (minDist - cdist) * 0.5;

                        p1.x -= nx * overlap;
                        p1.y -= ny * overlap;
                        p2.x += nx * overlap;
                        p2.y += ny * overlap;

                        // Velocity exchange along normal
                        var kx = p1.vx - p2.vx;
                        var ky = p1.vy - p2.vy;
                        var pNormal = 2 * (nx * kx + ny * ky) / 2.0;

                        p1.vx -= pNormal * nx * 0.92;
                        p1.vy -= pNormal * ny * 0.92;
                        p2.vx += pNormal * nx * 0.92;
                        p2.vy += pNormal * ny * 0.92;

                        if (Math.abs(pNormal) > 40 && window.GameAudio && window.GameAudio.playPuckClack) {
                            window.GameAudio.playPuckClack(Math.abs(pNormal));
                        }
                    }
                }
            }

            // Update Counts & Win Check
            this.updatePuckCounters();

            // Periodic Host Broadcast in Multiplayer (at 20 Hz)
            var now = performance.now();
            if (isMultiplayer && isP1 && window.GameHubClient.isConnected() && (now - lastSyncSendTime > 50)) {
                lastSyncSendTime = now;
                var puckData = pucks.map(function(pk) {
                    return { x: pk.x, y: pk.y, vx: pk.vx, vy: pk.vy };
                });
                window.GameHubClient.hub.server.sendSlingPuckState(sessionId, {
                    action: 'sync',
                    pucks: puckData
                });
            }
        },

        updateBotAI: function(dt) {
            var now = performance.now();

            if (!botDragState) {
                var interval = (difficulty === 'hard') ? 500 : (difficulty === 'medium' ? 950 : 1600);
                if (now - lastBotActionTime > interval) {
                    lastBotActionTime = now;

                    // Find closest available puck in Bot's court (x > 460)
                    var rightPucks = pucks.filter(function(pk) { return pk.x > 460; });
                    if (rightPucks.length === 0) return;

                    var chosen = rightPucks[Math.floor(Math.random() * rightPucks.length)];
                    var scatter = (difficulty === 'hard') ? 8 : (difficulty === 'medium' ? 22 : 48);
                    var aimY = (H / 2) + (Math.random() * (scatter * 2) - scatter);

                    botDragState = {
                        puck: chosen,
                        progress: 0,
                        startX: chosen.x,
                        startY: chosen.y,
                        targetX: 840,
                        aimY: aimY
                    };
                }
            } else {
                botDragState.progress += dt * (difficulty === 'hard' ? 4.5 : (difficulty === 'medium' ? 3.0 : 1.8));
                var bp = botDragState.puck;

                if (botDragState.progress < 1.0) {
                    // Pull back towards right elastic cord
                    bp.x = botDragState.startX + (botDragState.targetX - botDragState.startX) * botDragState.progress;
                    bp.y = botDragState.startY;
                } else {
                    // Release with slingshot force towards gate
                    var pullDist = bp.x - P2_SLING_X;
                    var power = Math.min(38, pullDist) * 30.0;

                    var dy = botDragState.aimY - bp.y;
                    var dx = GATE_X - bp.x;
                    var angle = Math.atan2(dy, dx);

                    bp.vx = Math.cos(angle) * power;
                    bp.vy = Math.sin(angle) * power * 0.85;

                    p2SlingRecoil = 14.0;
                    if (window.GameAudio && window.GameAudio.playSlingSnap) window.GameAudio.playSlingSnap();

                    botDragState = null;
                }
            }
        },

        updatePuckCounters: function() {
            var p1CourtCount = 0;
            var p2CourtCount = 0;

            pucks.forEach(function(pk) {
                if (pk.x < GATE_X) p1CourtCount++;
                else p2CourtCount++;
            });

            $('#p1-puck-count').text(p1CourtCount);
            $('#p2-puck-count').text(p2CourtCount);

            if (!isGameOver) {
                if (p1CourtCount === 0) {
                    this.handleWin(1);
                } else if (p2CourtCount === 0) {
                    this.handleWin(2);
                }
            }
        },

        triggerGatePassEffect: function(x, y) {
            if (window.GameAudio && window.GameAudio.playGatePass) {
                window.GameAudio.playGatePass();
            }

            for (var i = 0; i < 14; i++) {
                var angle = Math.random() * Math.PI * 2;
                var speed = Math.random() * 6.0 + 2.0;
                sparkParticles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: Math.random() * 3.5 + 1.5,
                    color: '#fbbf24',
                    life: 20
                });
            }
        },

        handleWin: function(winnerPlayerNum) {
            isGameOver = true;
            var isMeWinner = (winnerPlayerNum === (isP1 ? 1 : 2));

            if (isMultiplayer && window.GameHubClient.isConnected()) {
                window.GameHubClient.hub.server.finishSlingPuckGame(sessionId, winnerPlayerNum);
            } else if (!isMultiplayer) {
                var self = this;
                setTimeout(function() {
                    self.showGameOverModal(isMeWinner, isMeWinner ? myPlayerName : opponentPlayerName);
                }, 500);
            }
        },

        showGameOverModal: function(isWin, winnerName) {
            var self = this;
            window.App.showGameModal({
                title: isWin ? "🏆 Sling Puck Champion!" : "Match Defeated!",
                text: isWin ? "Incredible speed! You cleared all pucks from your court!" : winnerName + " cleared all their pucks first!",
                isWin: isWin,
                onRematch: function() {
                    self.initPucks();
                }
            });
        },

        draw: function() {
            ctx.clearRect(0, 0, W, H);

            // 1. Handcrafted Polished Maple Wooden Court
            var courtGrad = ctx.createLinearGradient(0, 0, W, H);
            courtGrad.addColorStop(0, '#1e293b');
            courtGrad.addColorStop(0.5, '#0f172a');
            courtGrad.addColorStop(1, '#0b1120');
            ctx.fillStyle = courtGrad;
            ctx.fillRect(0, 0, W, H);

            // Wood Rim Outer Border
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 14;
            ctx.strokeRect(33, 33, W - 66, H - 66);

            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(40, 40, W - 80, H - 80);

            // Center Line
            ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.moveTo(GATE_X, 40); ctx.lineTo(GATE_X, H - 40);
            ctx.stroke();
            ctx.setLineDash([]);

            // Center Circle
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(GATE_X, H / 2, 70, 0, Math.PI * 2);
            ctx.stroke();

            // 2. Elastic Bungee Slings (P1 Left & P2 Right)
            this.drawSlingBands();

            // 3. Center Solid Wood Dividers & Gate Opening
            this.drawCenterDividers();

            // 4. Pucks
            this.drawPucks();

            // 5. Sparks & FX
            this.drawSparks();
        },

        drawSlingBands: function() {
            ctx.save();

            // Left Elastic Band (P1 Cyan)
            var p1PullPuck = (draggedPuck && isP1) ? draggedPuck.puck : (remoteDraggedPuckId !== null && remoteDraggedPuckId < 5 ? pucks[remoteDraggedPuckId] : null);
            var p1MidX = p1PullPuck ? p1PullPuck.x : (P1_SLING_X - p1SlingRecoil);
            var p1MidY = p1PullPuck ? p1PullPuck.y : (H / 2);

            ctx.strokeStyle = '#38bdf8';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = p1PullPuck ? 16 : 8;
            ctx.lineWidth = p1PullPuck ? 6.5 : 5.0;

            ctx.beginPath();
            ctx.moveTo(P1_SLING_X, SLING_Y1);
            ctx.quadraticCurveTo(p1MidX, p1MidY, P1_SLING_X, SLING_Y2);
            ctx.stroke();

            // Left Sling Mount Posts
            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.arc(P1_SLING_X, SLING_Y1, 6.5, 0, Math.PI * 2);
            ctx.arc(P1_SLING_X, SLING_Y2, 6.5, 0, Math.PI * 2);
            ctx.fill();

            // Right Elastic Band (P2 Rose)
            var p2PullPuck = (draggedPuck && !isP1) ? draggedPuck.puck : (remoteDraggedPuckId !== null && remoteDraggedPuckId >= 5 ? pucks[remoteDraggedPuckId] : (botDragState ? botDragState.puck : null));
            var p2MidX = p2PullPuck ? p2PullPuck.x : (P2_SLING_X + p2SlingRecoil);
            var p2MidY = p2PullPuck ? p2PullPuck.y : (H / 2);

            ctx.strokeStyle = '#f43f5e';
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = p2PullPuck ? 16 : 8;
            ctx.lineWidth = p2PullPuck ? 6.5 : 5.0;

            ctx.beginPath();
            ctx.moveTo(P2_SLING_X, SLING_Y1);
            ctx.quadraticCurveTo(p2MidX, p2MidY, P2_SLING_X, SLING_Y2);
            ctx.stroke();

            // Right Sling Mount Posts
            ctx.fillStyle = '#be123c';
            ctx.beginPath();
            ctx.arc(P2_SLING_X, SLING_Y1, 6.5, 0, Math.PI * 2);
            ctx.arc(P2_SLING_X, SLING_Y2, 6.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        },

        drawCenterDividers: function() {
            ctx.save();
            ctx.fillStyle = '#334155';
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 2.5;

            // Top Divider Wall (Y 40 to GATE_Y1)
            ctx.fillRect(GATE_X - DIVIDER_THICKNESS / 2, 40, DIVIDER_THICKNESS, GATE_Y1 - 40);
            ctx.strokeRect(GATE_X - DIVIDER_THICKNESS / 2, 40, DIVIDER_THICKNESS, GATE_Y1 - 40);

            // Bottom Divider Wall (GATE_Y2 to H-40)
            ctx.fillRect(GATE_X - DIVIDER_THICKNESS / 2, GATE_Y2, DIVIDER_THICKNESS, (H - 40) - GATE_Y2);
            ctx.strokeRect(GATE_X - DIVIDER_THICKNESS / 2, GATE_Y2, DIVIDER_THICKNESS, (H - 40) - GATE_Y2);

            // Rounded Gate Post Bumpers (Top & Bottom of slot)
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(GATE_X, GATE_Y1, 7.5, 0, Math.PI * 2);
            ctx.arc(GATE_X, GATE_Y2, 7.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        },

        drawPucks: function() {
            ctx.save();
            pucks.forEach(function(pk) {
                var isLeft = pk.x < GATE_X;
                var baseColor = isLeft ? '#38bdf8' : '#f43f5e';

                // Puck Shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
                ctx.beginPath();
                ctx.arc(pk.x + 3, pk.y + 4, PUCK_RADIUS, 0, Math.PI * 2);
                ctx.fill();

                // Puck Outer Rim
                ctx.fillStyle = isLeft ? '#0284c7' : '#be123c';
                ctx.beginPath();
                ctx.arc(pk.x, pk.y, PUCK_RADIUS, 0, Math.PI * 2);
                ctx.fill();

                // Inner Disc with Glow
                ctx.fillStyle = baseColor;
                ctx.beginPath();
                ctx.arc(pk.x, pk.y, PUCK_RADIUS - 3.5, 0, Math.PI * 2);
                ctx.fill();

                // Center Recess Indentation
                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.arc(pk.x, pk.y, 6.0, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
        },

        drawSparks: function() {
            ctx.save();
            for (var i = sparkParticles.length - 1; i >= 0; i--) {
                var sp = sparkParticles[i];
                sp.x += sp.vx;
                sp.y += sp.vy;
                sp.life--;

                if (sp.life <= 0) {
                    sparkParticles.splice(i, 1);
                    continue;
                }

                ctx.fillStyle = sp.color;
                ctx.shadowColor = sp.color;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    };

    $(document).ready(function() {
        SlingPuck.init();
    });

    window.SlingPuck = SlingPuck;

})(window, jQuery);
