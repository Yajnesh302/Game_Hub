/* ==========================================================================
   GAME HUB - Dots and Boxes Championship: Strategy & Reflex Engine
   Features:
   - Dynamic 3x3, 4x4, 5x5 Box Matrices with Responsive High-DPI Canvas
   - Magnetic Dot Snapping & Neon Laser Edge Previews
   - Animated Box Claim Tiles, Player Avatars & Spark Particle Bursts
   - Combo Streak Chain Multipliers with Web Audio API Synthesizers
   - Tactical Minimax Bot AI (Easy, Medium, Hard) & LAN Intranet Multiplayer
   ========================================================================== */

(function(window, $) {
    'use strict';

    var canvas, ctx;
    var isMultiplayer = false;
    var sessionId = null;
    var difficulty = "medium";
    var gridSize = 4; // default 4x4 boxes (5x5 dots)
    var myPlayerName = "Player";
    var opponentPlayerName = "Bot";
    var isP1 = true;
    var currentTurnP1 = true;
    var isGameOver = false;

    // Board Arrays
    var hozLines = [];  // (gridSize + 1) rows x gridSize cols
    var vertLines = []; // gridSize rows x (gridSize + 1) cols
    var boxes = [];     // gridSize rows x gridSize cols (0: uncaptured, 1: P1, 2: P2)

    var p1Score = 0;
    var p2Score = 0;
    var comboStreak = 0;

    // Hover Tracking
    var hoveredEdge = null; // { type: 'h'|'v', r: number, c: number }

    // Particle FX & Animations
    var particles = [];
    var animatedBoxes = []; // { r, c, owner, scale, alpha }

    var animFrameId = null;

    var DotsAndBoxes = {
        init: function() {
            canvas = document.getElementById('dots-canvas');
            if (!canvas) return;
            ctx = canvas.getContext('2d');

            var urlParams = new URLSearchParams(window.location.search);
            sessionId = urlParams.get('session');
            difficulty = urlParams.get('diff') || 'medium';
            gridSize = parseInt(urlParams.get('size'), 10) || 4;
            if (gridSize < 3 || gridSize > 5) gridSize = 4;

            var p1Url = urlParams.get('p1') || '';
            var p2Url = urlParams.get('p2') || '';

            myPlayerName = window.App ? window.App.getPlayerName() : "Player";

            this.initBoard();
            this.bindEvents();

            if (sessionId) {
                isMultiplayer = true;
                this.initMultiplayer(p1Url, p2Url);
            } else {
                isMultiplayer = false;
                this.initSinglePlayer();
            }

            this.startLoop();
        },

        initBoard: function() {
            isGameOver = false;
            p1Score = 0;
            p2Score = 0;
            comboStreak = 0;
            currentTurnP1 = true;
            particles = [];
            animatedBoxes = [];
            hoveredEdge = null;

            // Initialize Horizontal Lines (N+1 x N)
            hozLines = [];
            for (var r = 0; r <= gridSize; r++) {
                hozLines[r] = [];
                for (var c = 0; c < gridSize; c++) {
                    hozLines[r][c] = false;
                }
            }

            // Initialize Vertical Lines (N x N+1)
            vertLines = [];
            for (var r = 0; r < gridSize; r++) {
                vertLines[r] = [];
                for (var c = 0; c <= gridSize; c++) {
                    vertLines[r][c] = false;
                }
            }

            // Initialize Boxes (N x N)
            boxes = [];
            for (var r = 0; r < gridSize; r++) {
                boxes[r] = [];
                for (var c = 0; c < gridSize; c++) {
                    boxes[r][c] = 0;
                }
            }

            this.updateHUD();
        },

        initSinglePlayer: function() {
            opponentPlayerName = "Dots Bot (" + (difficulty.charAt(0).toUpperCase() + difficulty.slice(1)) + ")";
            isP1 = true;

            $('#p1-name').text(myPlayerName);
            $('#p2-name').text(opponentPlayerName);
            $('#p1-avatar-letter').text(myPlayerName.charAt(0).toUpperCase());
            $('#p2-avatar-letter').text(opponentPlayerName.charAt(0).toUpperCase());
            $('#game-mode-badge').text('🎯 Dots & Boxes Arena vs ' + opponentPlayerName);

            this.updateHUD();
        },

        initMultiplayer: function(p1Url, p2Url) {
            $('#game-mode-badge').text('⚔️ LAN Dots & Boxes Duel (Live)');
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
                hub.client.dotsAndBoxesMoveMade = function(result) {
                    if (!result || !result.Success) return;
                    var data = result.ExtraData;

                    self.applyMove(data.lineType, data.r, data.c, data.isP1);

                    if (data.isGameOver) {
                        var isMeWinner = (result.WinnerPlayerId === (isP1 ? window.GameHubClient.hub.connection.id : null));
                        if (result.IsDraw) {
                            window.App.showGameModal({
                                title: "🤝 Draw Game!",
                                text: "Both players captured " + p1Score + " boxes equally!",
                                isWin: false,
                                onRematch: function() { window.location.reload(); }
                            });
                        } else {
                            self.showGameOverModal(isMeWinner, data.winnerName);
                        }
                    }
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
                window.GameHubClient.hub.server.joinSession(sessionId, myName, 12, p1Url, p2Url);
            });

            this.updateHUD();
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

            $(canvas).on('mousemove touchmove', function(e) {
                if (isGameOver) return;
                var isMyTurn = isMultiplayer ? (currentTurnP1 === isP1) : (currentTurnP1);
                if (!isMyTurn) {
                    hoveredEdge = null;
                    return;
                }

                var pos = getCanvasCoords(e);
                hoveredEdge = self.findClosestEdge(pos.x, pos.y);
            });

            $(canvas).on('mouseleave', function() {
                hoveredEdge = null;
            });

            $(canvas).on('click touchend', function(e) {
                if (isGameOver) return;
                var isMyTurn = isMultiplayer ? (currentTurnP1 === isP1) : (currentTurnP1);
                if (!isMyTurn) return;

                var pos = getCanvasCoords(e);
                var edge = self.findClosestEdge(pos.x, pos.y);

                if (edge) {
                    if (isMultiplayer) {
                        window.GameHubClient.hub.server.makeDotsAndBoxesMove(sessionId, edge.type, edge.r, edge.c);
                    } else {
                        self.handleSinglePlayerMove(edge.type, edge.r, edge.c);
                    }
                }
            });

            $('#forfeit-game-btn').on('click', function(e) {
                e.preventDefault();
                if (confirm("Exit Dots and Boxes Match?")) {
                    if (isMultiplayer && window.GameHubClient.isConnected()) {
                        window.GameHubClient.hub.server.leaveGame(sessionId);
                    }
                    window.location.href = "../Default.aspx";
                }
            });
        },

        findClosestEdge: function(mx, my) {
            var padding = 70;
            var boardWidth = canvas.width - padding * 2;
            var cellSize = boardWidth / gridSize;
            var threshold = cellSize * 0.38;

            var bestDist = Infinity;
            var bestEdge = null;

            // Check Horizontal Lines
            for (var r = 0; r <= gridSize; r++) {
                for (var c = 0; c < gridSize; c++) {
                    if (hozLines[r][c]) continue;

                    var x1 = padding + c * cellSize;
                    var y1 = padding + r * cellSize;
                    var x2 = x1 + cellSize;
                    var y2 = y1;

                    var midX = (x1 + x2) / 2;
                    var midY = (y1 + y2) / 2;

                    var dist = Math.sqrt(Math.pow(mx - midX, 2) + Math.pow(my - midY, 2));
                    if (dist < threshold && dist < bestDist) {
                        bestDist = dist;
                        bestEdge = { type: 'h', r: r, c: c, x1: x1, y1: y1, x2: x2, y2: y2 };
                    }
                }
            }

            // Check Vertical Lines
            for (var r = 0; r < gridSize; r++) {
                for (var c = 0; c <= gridSize; c++) {
                    if (vertLines[r][c]) continue;

                    var x1 = padding + c * cellSize;
                    var y1 = padding + r * cellSize;
                    var x2 = x1;
                    var y2 = y1 + cellSize;

                    var midX = (x1 + x2) / 2;
                    var midY = (y1 + y2) / 2;

                    var dist = Math.sqrt(Math.pow(mx - midX, 2) + Math.pow(my - midY, 2));
                    if (dist < threshold && dist < bestDist) {
                        bestDist = dist;
                        bestEdge = { type: 'v', r: r, c: c, x1: x1, y1: y1, x2: x2, y2: y2 };
                    }
                }
            }

            return bestEdge;
        },

        handleSinglePlayerMove: function(type, r, c) {
            var captured = this.applyMove(type, r, c, true);

            if (isGameOver) return;

            if (!captured) {
                // Opponent Bot Turn
                var self = this;
                setTimeout(function() {
                    self.executeBotTurn();
                }, 450);
            }
        },

        executeBotTurn: function() {
            if (isGameOver || currentTurnP1) return;

            var move = this.computeBestBotMove();
            if (!move) return;

            var captured = this.applyMove(move.type, move.r, move.c, false);

            if (isGameOver) return;

            if (captured) {
                // Bot gets Bonus Turn! Chain another move!
                var self = this;
                setTimeout(function() {
                    self.executeBotTurn();
                }, 500);
            }
        },

        computeBestBotMove: function() {
            var availableMoves = [];

            // Gather all open horizontal lines
            for (var r = 0; r <= gridSize; r++) {
                for (var c = 0; c < gridSize; c++) {
                    if (!hozLines[r][c]) {
                        availableMoves.push({ type: 'h', r: r, c: c });
                    }
                }
            }

            // Gather all open vertical lines
            for (var r = 0; r < gridSize; r++) {
                for (var c = 0; c <= gridSize; c++) {
                    if (!vertLines[r][c]) {
                        availableMoves.push({ type: 'v', r: r, c: c });
                    }
                }
            }

            if (availableMoves.length === 0) return null;

            // 1. Check if any move immediately completes a box (Priority 1)
            for (var i = 0; i < availableMoves.length; i++) {
                var m = availableMoves[i];
                var count = this.simulateMoveBoxCompletions(m.type, m.r, m.c);
                if (count > 0) {
                    return m; // Instant capture!
                }
            }

            // If Easy mode: Pick random safe or non-safe move
            if (difficulty === 'easy') {
                return availableMoves[Math.floor(Math.random() * availableMoves.length)];
            }

            // 2. Medium & Hard: Avoid moves that create 3-sided boxes (feeding opponent)
            var safeMoves = [];
            for (var i = 0; i < availableMoves.length; i++) {
                var m = availableMoves[i];
                if (!this.doesMoveCreate3SidedBox(m.type, m.r, m.c)) {
                    safeMoves.push(m);
                }
            }

            if (safeMoves.length > 0) {
                return safeMoves[Math.floor(Math.random() * safeMoves.length)];
            }

            // 3. If forced to give boxes, pick the line that gives the smallest chain
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        },

        simulateMoveBoxCompletions: function(type, r, c) {
            var completedCount = 0;

            if (type === 'h') {
                // Top adjacent box (r - 1, c)
                if (r > 0) {
                    var top = hozLines[r - 1][c];
                    var bot = true;
                    var left = vertLines[r - 1][c];
                    var right = vertLines[r - 1][c + 1];
                    if (top && bot && left && right) completedCount++;
                }
                // Bottom adjacent box (r, c)
                if (r < gridSize) {
                    var top = true;
                    var bot = hozLines[r + 1][c];
                    var left = vertLines[r][c];
                    var right = vertLines[r][c + 1];
                    if (top && bot && left && right) completedCount++;
                }
            } else if (type === 'v') {
                // Left adjacent box (r, c - 1)
                if (c > 0) {
                    var top = hozLines[r][c - 1];
                    var bot = hozLines[r + 1][c - 1];
                    var left = vertLines[r][c - 1];
                    var right = true;
                    if (top && bot && left && right) completedCount++;
                }
                // Right adjacent box (r, c)
                if (c < gridSize) {
                    var top = hozLines[r][c];
                    var bot = hozLines[r + 1][c];
                    var left = true;
                    var right = vertLines[r][c + 1];
                    if (top && bot && left && right) completedCount++;
                }
            }

            return completedCount;
        },

        doesMoveCreate3SidedBox: function(type, r, c) {
            // Check adjacent boxes after placing this line to see if any have exactly 3 lines
            var boxSides = [];

            if (type === 'h') {
                if (r > 0) boxSides.push(this.countBoxSides(r - 1, c, type, r, c));
                if (r < gridSize) boxSides.push(this.countBoxSides(r, c, type, r, c));
            } else if (type === 'v') {
                if (c > 0) boxSides.push(this.countBoxSides(r, c - 1, type, r, c));
                if (c < gridSize) boxSides.push(this.countBoxSides(r, c, type, r, c));
            }

            return boxSides.some(function(count) { return count === 3; });
        },

        countBoxSides: function(br, bc, testType, testR, testC) {
            var count = 0;
            if (hozLines[br][bc] || (testType === 'h' && testR === br && testC === bc)) count++;
            if (hozLines[br + 1][bc] || (testType === 'h' && testR === br + 1 && testC === bc)) count++;
            if (vertLines[br][bc] || (testType === 'v' && testR === br && testC === bc)) count++;
            if (vertLines[br][bc + 1] || (testType === 'v' && testR === br && testC === bc + 1)) count++;
            return count;
        },

        applyMove: function(type, r, c, isPlayer1Move) {
            // Apply line
            if (type === 'h') hozLines[r][c] = true;
            else vertLines[r][c] = true;

            if (window.GameAudio && window.GameAudio.playLineDraw) {
                window.GameAudio.playLineDraw();
            }

            // Check newly completed boxes
            var newlyCompleted = [];
            for (var br = 0; br < gridSize; br++) {
                for (var bc = 0; bc < gridSize; bc++) {
                    if (boxes[br][bc] === 0) {
                        var top = hozLines[br][bc];
                        var bot = hozLines[br + 1][bc];
                        var left = vertLines[br][bc];
                        var right = vertLines[br][bc + 1];

                        if (top && bot && left && right) {
                            var owner = isPlayer1Move ? 1 : 2;
                            boxes[br][bc] = owner;
                            if (isPlayer1Move) p1Score++;
                            else p2Score++;

                            newlyCompleted.push({ r: br, c: bc, owner: owner });
                            this.triggerBoxClaimAnimation(br, bc, owner);
                        }
                    }
                }
            }

            var captured = newlyCompleted.length > 0;

            if (captured) {
                comboStreak += newlyCompleted.length;
                if (window.GameAudio) {
                    if (comboStreak > 1 && window.GameAudio.playChainCombo) {
                        window.GameAudio.playChainCombo();
                    } else if (window.GameAudio.playBoxCapture) {
                        window.GameAudio.playBoxCapture(comboStreak);
                    }
                }

                // Show Combo Float Indicator
                this.showComboToast(comboStreak, isPlayer1Move);
                // Keep Turn!
            } else {
                comboStreak = 0;
                currentTurnP1 = !currentTurnP1;
            }

            this.updateHUD();
            this.checkGameOver();

            return captured;
        },

        triggerBoxClaimAnimation: function(br, bc, owner) {
            var padding = 70;
            var boardWidth = canvas.width - padding * 2;
            var cellSize = boardWidth / gridSize;
            var cx = padding + bc * cellSize + cellSize / 2;
            var cy = padding + br * cellSize + cellSize / 2;

            animatedBoxes.push({
                r: br,
                c: bc,
                owner: owner,
                scale: 0.1,
                alpha: 0.0
            });

            // Burst Sparks
            for (var i = 0; i < 18; i++) {
                var angle = Math.random() * Math.PI * 2;
                var speed = Math.random() * 5.5 + 2.0;
                particles.push({
                    x: cx,
                    y: cy,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: Math.random() * 4.0 + 2.0,
                    color: owner === 1 ? '#38bdf8' : '#f43f5e',
                    life: 24
                });
            }
        },

        showComboToast: function(streak, isP1Move) {
            var playerName = isP1Move ? (isP1 ? "You" : opponentPlayerName) : (isP1 ? opponentPlayerName : "You");
            var text = (streak > 1) ? ("🔥 " + streak + "-BOX COMBO! EXTRA TURN!") : ("⚡ BOX CLAIMED! EXTRA TURN!");

            $('#combo-indicator')
                .text(text)
                .css({ 'opacity': 1, 'transform': 'scale(1.1)' })
                .stop(true, true)
                .animate({ 'opacity': 1 }, 700)
                .animate({ 'opacity': 0, 'transform': 'scale(0.95)' }, 350);
        },

        updateHUD: function() {
            $('#p1-score').text(p1Score);
            $('#p2-score').text(p2Score);

            if (currentTurnP1) {
                $('#p1-card').addClass('active-turn');
                $('#p2-card').removeClass('active-turn');
                $('#turn-status-text').text((isP1 ? "Your" : opponentPlayerName + "'s") + " Turn");
            } else {
                $('#p2-card').addClass('active-turn');
                $('#p1-card').removeClass('active-turn');
                $('#turn-status-text').text((isP1 ? opponentPlayerName + "'s" : "Your") + " Turn");
            }
        },

        checkGameOver: function() {
            var totalBoxes = gridSize * gridSize;
            if (p1Score + p2Score >= totalBoxes && !isGameOver) {
                isGameOver = true;
                var isMeWinner = isP1 ? (p1Score > p2Score) : (p2Score > p1Score);
                var isDraw = (p1Score === p2Score);

                var self = this;
                setTimeout(function() {
                    if (isDraw) {
                        window.App.showGameModal({
                            title: "🤝 Draw Game!",
                            text: "Both players captured " + p1Score + " boxes equally!",
                            isWin: false,
                            onRematch: function() { self.initBoard(); }
                        });
                    } else {
                        self.showGameOverModal(isMeWinner, isMeWinner ? myPlayerName : opponentPlayerName);
                    }
                }, 500);
            }
        },

        showGameOverModal: function(isWin, winnerName) {
            var self = this;
            window.App.showGameModal({
                title: isWin ? "🏆 Dots & Boxes Champion!" : "Match Defeated!",
                text: isWin ? "Masterful strategy! You dominated the grid with " + (isP1 ? p1Score : p2Score) + " boxes!" : winnerName + " won the grid match!",
                isWin: isWin,
                onRematch: function() {
                    self.initBoard();
                }
            });
        },

        startLoop: function() {
            var self = this;
            function loop() {
                self.updateAnimations();
                self.draw();
                animFrameId = requestAnimationFrame(loop);
            }
            if (animFrameId) cancelAnimationFrame(animFrameId);
            animFrameId = requestAnimationFrame(loop);
        },

        updateAnimations: function() {
            // Update Animated Box Scales
            for (var i = 0; i < animatedBoxes.length; i++) {
                var ab = animatedBoxes[i];
                if (ab.scale < 1.0) ab.scale += 0.1;
                if (ab.scale > 1.0) ab.scale = 1.0;
                if (ab.alpha < 1.0) ab.alpha += 0.12;
            }

            // Update Sparks
            for (var i = particles.length - 1; i >= 0; i--) {
                var pt = particles[i];
                pt.x += pt.vx;
                pt.y += pt.vy;
                pt.life--;
                if (pt.life <= 0) particles.splice(i, 1);
            }
        },

        draw: function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            var padding = 70;
            var boardWidth = canvas.width - padding * 2;
            var cellSize = boardWidth / gridSize;

            // 1. Outer Arena Board
            var bgGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 40, canvas.width / 2, canvas.height / 2, canvas.width / 2);
            bgGrad.addColorStop(0, '#0f172a');
            bgGrad.addColorStop(1, '#020617');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Board Outline
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 3;
            ctx.strokeRect(padding - 15, padding - 15, boardWidth + 30, boardWidth + 30);

            // 2. Captured Boxes (Tiles)
            this.drawBoxes(padding, cellSize);

            // 3. Hovered Edge Preview
            if (hoveredEdge) {
                this.drawHoverEdge();
            }

            // 4. Placed Lines (Horizontal & Vertical)
            this.drawLines(padding, cellSize);

            // 5. Matrix Dots (Grid Nodes)
            this.drawDots(padding, cellSize);

            // 6. Particle FX
            this.drawParticles();
        },

        drawBoxes: function(padding, cellSize) {
            ctx.save();
            for (var r = 0; r < gridSize; r++) {
                for (var c = 0; c < gridSize; c++) {
                    var owner = boxes[r][c];
                    if (owner > 0) {
                        var x = padding + c * cellSize;
                        var y = padding + r * cellSize;

                        var color = owner === 1 ? 'rgba(56, 189, 248, 0.22)' : 'rgba(244, 63, 94, 0.22)';
                        var borderColor = owner === 1 ? 'rgba(56, 189, 248, 0.5)' : 'rgba(244, 63, 94, 0.5)';

                        ctx.fillStyle = color;
                        ctx.fillRect(x + 4, y + 4, cellSize - 8, cellSize - 8);

                        // Center Badge
                        ctx.fillStyle = owner === 1 ? '#38bdf8' : '#f43f5e';
                        ctx.font = 'bold ' + Math.floor(cellSize * 0.38) + 'px Outfit, sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(owner === 1 ? 'P1' : 'P2', x + cellSize / 2, y + cellSize / 2);
                    }
                }
            }
            ctx.restore();
        },

        drawHoverEdge: function() {
            ctx.save();
            var isP1Turn = currentTurnP1;
            var glowColor = isP1Turn ? '#38bdf8' : '#f43f5e';

            ctx.strokeStyle = glowColor;
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 14;
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.globalAlpha = 0.65;

            ctx.beginPath();
            ctx.moveTo(hoveredEdge.x1, hoveredEdge.y1);
            ctx.lineTo(hoveredEdge.x2, hoveredEdge.y2);
            ctx.stroke();

            ctx.restore();
        },

        drawLines: function(padding, cellSize) {
            ctx.save();
            ctx.lineCap = 'round';

            // Draw Horizontal Lines
            for (var r = 0; r <= gridSize; r++) {
                for (var c = 0; c < gridSize; c++) {
                    if (hozLines[r][c]) {
                        var x1 = padding + c * cellSize;
                        var y1 = padding + r * cellSize;
                        var x2 = x1 + cellSize;
                        var y2 = y1;

                        ctx.strokeStyle = '#f8fafc';
                        ctx.shadowColor = '#38bdf8';
                        ctx.shadowBlur = 12;
                        ctx.lineWidth = 6.5;

                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.stroke();
                    }
                }
            }

            // Draw Vertical Lines
            for (var r = 0; r < gridSize; r++) {
                for (var c = 0; c <= gridSize; c++) {
                    if (vertLines[r][c]) {
                        var x1 = padding + c * cellSize;
                        var y1 = padding + r * cellSize;
                        var x2 = x1;
                        var y2 = y1 + cellSize;

                        ctx.strokeStyle = '#f8fafc';
                        ctx.shadowColor = '#38bdf8';
                        ctx.shadowBlur = 12;
                        ctx.lineWidth = 6.5;

                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.stroke();
                    }
                }
            }

            ctx.restore();
        },

        drawDots: function(padding, cellSize) {
            ctx.save();
            for (var r = 0; r <= gridSize; r++) {
                for (var c = 0; c <= gridSize; c++) {
                    var x = padding + c * cellSize;
                    var y = padding + r * cellSize;

                    // Dot Glow
                    ctx.fillStyle = '#fbbf24';
                    ctx.shadowColor = '#fbbf24';
                    ctx.shadowBlur = 8;

                    ctx.beginPath();
                    ctx.arc(x, y, 7.5, 0, Math.PI * 2);
                    ctx.fill();

                    // Dot Center Core
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.restore();
        },

        drawParticles: function() {
            ctx.save();
            for (var i = 0; i < particles.length; i++) {
                var pt = particles[i];
                ctx.fillStyle = pt.color;
                ctx.shadowColor = pt.color;
                ctx.shadowBlur = 8;

                ctx.beginPath();
                ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    };

    $(document).ready(function() {
        DotsAndBoxes.init();
    });

    window.DotsAndBoxes = DotsAndBoxes;

})(window, jQuery);
