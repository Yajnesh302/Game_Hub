/* ==========================================================================
   GAME HUB - Brick Blast Canvas Arcade Engine
   Features: 60 FPS Delta-Time Canvas Physics, Variable Paddle Reflection,
   Destructible Bricks, Combo Multipliers, Shard Particles, Power-Ups,
   Audio Synthesis & High-Score Leaderboard
   ========================================================================== */

(function(window, $) {
    'use strict';

    var canvas, ctx;
    var W = 800;
    var H = 600;

    var isRunning = false;
    var isPaused = false;
    var lastTime = 0;

    // Game Variables
    var score = 0;
    var bestScore = 0;
    var lives = 3;
    var level = 1;
    var combo = 1;
    var bricksCleared = 0;

    // Paddle
    var paddle = {
        x: 345,
        y: 550,
        w: 110,
        baseW: 110,
        h: 16,
        speed: 9,
        targetX: 345,
        flash: 0
    };

    // Balls (Supports Multi-Ball)
    var balls = [];
    var baseBallSpeed = 6.4;

    // Bricks
    var bricks = [];
    var BRICK_ROWS = 6;
    var BRICK_COLS = 10;
    var BRICK_W = 70;
    var BRICK_H = 22;
    var BRICK_PAD = 8;
    var BRICK_TOP = 65;
    var BRICK_LEFT = 15;

    // Particles & Floating Scores
    var particles = [];
    var floatingScores = [];
    var powerUps = [];

    // Active Power-Up Timers
    var widePaddleTimer = 0;
    var slowBallTimer = 0;

    // Input State
    var keys = { left: false, right: false };
    var mouseX = null;

    var BrickBlast = {
        init: function() {
            canvas = document.getElementById('brickblast-canvas');
            if (!canvas) return;
            ctx = canvas.getContext('2d');

            W = canvas.width;
            H = canvas.height;

            this.loadBestScore();
            this.bindEvents();
            this.loadLeaderboard();
            this.newGame();
        },

        loadBestScore: function() {
            try {
                var saved = localStorage.getItem('gamehub_brickblast_best');
                if (saved) {
                    bestScore = parseInt(saved, 10) || 0;
                    $('#best-score').text(bestScore);
                }
            } catch (e) {
                bestScore = 0;
            }
        },

        saveBestScore: function() {
            try {
                localStorage.setItem('gamehub_brickblast_best', bestScore.toString());
            } catch (e) {}
        },

        newGame: function() {
            score = 0;
            lives = 3;
            level = 1;
            combo = 1;
            bricksCleared = 0;
            baseBallSpeed = 6.4;

            this.updateHUD();
            this.loadLevel(1);
            this.resetPaddleAndBall();

            isPaused = false;
            isRunning = true;
            lastTime = performance.now();

            this.startLoop();
        },

        loadLevel: function(lvl) {
            level = lvl;
            bricks = [];
            powerUps = [];
            particles = [];
            floatingScores = [];

            // Speed scales subtly with level
            baseBallSpeed = 6.2 + Math.min(3.0, (level - 1) * 0.45);

            // Generate Layout based on Level
            var pattern = (level % 3);

            for (var r = 0; r < BRICK_ROWS; r++) {
                for (var c = 0; c < BRICK_COLS; c++) {
                    var hp = 1;

                    // Row-based HP tiers
                    if (r < 2) hp = 3;
                    else if (r < 4) hp = 2;
                    else hp = 1;

                    // Checkerboard or pyramid holes for variety
                    if (pattern === 1 && (r + c) % 2 === 1 && r > 1) {
                        continue;
                    } else if (pattern === 2 && (c < r - 1 || c > BRICK_COLS - r)) {
                        continue;
                    }

                    var bx = BRICK_LEFT + c * (BRICK_W + BRICK_PAD);
                    var by = BRICK_TOP + r * (BRICK_H + BRICK_PAD);

                    bricks.push({
                        x: bx,
                        y: by,
                        w: BRICK_W,
                        h: BRICK_H,
                        hp: hp,
                        maxHp: hp,
                        color: this.getBrickColor(hp),
                        alive: true,
                        flash: 0
                    });
                }
            }

            this.updateHUD();
        },

        getBrickColor: function(hp) {
            if (hp >= 3) return { bg: '#d97706', border: '#fbbf24', text: '#fde047' }; // Amber
            if (hp === 2) return { bg: '#059669', border: '#34d399', text: '#a7f3d0' }; // Emerald
            return { bg: '#0284c7', border: '#38bdf8', text: '#bae6fd' };              // Cyan
        },

        resetPaddleAndBall: function() {
            paddle.w = paddle.baseW;
            paddle.x = (W - paddle.w) / 2;
            paddle.targetX = paddle.x;
            widePaddleTimer = 0;
            slowBallTimer = 0;

            balls = [{
                x: paddle.x + paddle.w / 2,
                y: paddle.y - 8,
                radius: 7,
                vx: 0,
                vy: 0,
                speed: baseBallSpeed,
                isLaunched: false
            }];
        },

        launchBall: function() {
            if (balls.length > 0 && !balls[0].isLaunched) {
                var b = balls[0];
                b.isLaunched = true;
                // Launch slightly angled
                var angle = (Math.random() * 0.4 - 0.2) - (Math.PI / 2);
                b.vx = b.speed * Math.cos(angle);
                b.vy = b.speed * Math.sin(angle);

                if (window.GameAudio) window.GameAudio.playPaddleHit();
            }
        },

        updateHUD: function() {
            $('#current-score').text(score);
            $('#current-level').text(level);
            $('#current-combo').text(combo + 'x');

            if (score > bestScore) {
                bestScore = score;
                $('#best-score').text(bestScore);
                this.saveBestScore();
            }

            // Render Lives Hearts
            var heartsHtml = '';
            for (var i = 0; i < 3; i++) {
                if (i < lives) {
                    heartsHtml += '<span style="color: #f43f5e; font-size: 1.1rem; margin-right: 2px;">❤️</span>';
                } else {
                    heartsHtml += '<span style="color: #475569; font-size: 1.1rem; margin-right: 2px; opacity: 0.4;">🖤</span>';
                }
            }
            $('#lives-container').html(heartsHtml);
        },

        startLoop: function() {
            var self = this;
            function loop(now) {
                if (!isRunning) return;
                var dt = Math.min(32, now - lastTime) / 1000;
                lastTime = now;

                if (!isPaused) {
                    self.update(dt);
                }
                self.render();

                requestAnimationFrame(loop);
            }
            requestAnimationFrame(loop);
        },

        update: function(dt) {
            // 1. Paddle Movement
            if (mouseX !== null) {
                paddle.x += (paddle.targetX - paddle.x) * 0.35;
            } else if (keys.left) {
                paddle.x -= paddle.speed;
            } else if (keys.right) {
                paddle.x += paddle.speed;
            }

            paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));
            if (paddle.flash > 0) paddle.flash -= dt * 8;

            // Power-Up Timers
            if (widePaddleTimer > 0) {
                widePaddleTimer -= dt;
                if (widePaddleTimer <= 0) paddle.w = paddle.baseW;
            }

            if (slowBallTimer > 0) {
                slowBallTimer -= dt;
            }

            // 2. Ball Updates
            var activeBalls = [];
            var unlaunched = false;

            for (var i = 0; i < balls.length; i++) {
                var b = balls[i];

                if (!b.isLaunched) {
                    b.x = paddle.x + paddle.w / 2;
                    b.y = paddle.y - b.radius;
                    unlaunched = true;
                    activeBalls.push(b);
                    continue;
                }

                // Apply Slow Ball power-up speed factor
                var curSpeed = (slowBallTimer > 0) ? (baseBallSpeed * 0.75) : baseBallSpeed;
                var currentMag = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
                if (currentMag > 0) {
                    b.vx = (b.vx / currentMag) * curSpeed;
                    b.vy = (b.vy / currentMag) * curSpeed;
                }

                b.x += b.vx;
                b.y += b.vy;

                // Wall Collisions
                if (b.x - b.radius <= 0) {
                    b.x = b.radius;
                    b.vx = Math.abs(b.vx);
                } else if (b.x + b.radius >= W) {
                    b.x = W - b.radius;
                    b.vx = -Math.abs(b.vx);
                }

                if (b.y - b.radius <= 0) {
                    b.y = b.radius;
                    b.vy = Math.abs(b.vy);
                }

                // Paddle Collision
                if (b.y + b.radius >= paddle.y && b.y - b.radius <= paddle.y + paddle.h &&
                    b.x >= paddle.x - b.radius && b.x <= paddle.x + paddle.w + b.radius) {

                    if (b.vy > 0) {
                        // Variable Angle Reflection based on hit position
                        var hitOffset = (b.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
                        hitOffset = Math.max(-0.92, Math.min(0.92, hitOffset));

                        var maxAngle = 60 * (Math.PI / 180);
                        var bounceAngle = hitOffset * maxAngle;

                        b.vx = curSpeed * Math.sin(bounceAngle);
                        b.vy = -curSpeed * Math.cos(bounceAngle);
                        b.y = paddle.y - b.radius;

                        paddle.flash = 1.0;
                        combo = 1; // Reset combo on paddle bounce
                        this.updateHUD();

                        if (window.GameAudio) window.GameAudio.playPaddleHit();
                    }
                }

                // Brick Collisions
                var hitBrick = false;
                for (var j = 0; j < bricks.length; j++) {
                    var br = bricks[j];
                    if (!br.alive) continue;

                    // AABB Check
                    if (b.x + b.radius >= br.x && b.x - b.radius <= br.x + br.w &&
                        b.y + b.radius >= br.y && b.y - b.radius <= br.y + br.h) {

                        // Determine collision face using overlap depth
                        var overlapLeft = (b.x + b.radius) - br.x;
                        var overlapRight = (br.x + br.w) - (b.x - b.radius);
                        var overlapTop = (b.y + b.radius) - br.y;
                        var overlapBottom = (br.y + br.h) - (b.y - b.radius);

                        var minOverlapX = Math.min(overlapLeft, overlapRight);
                        var minOverlapY = Math.min(overlapTop, overlapBottom);

                        if (minOverlapX < minOverlapY) {
                            b.vx = (overlapLeft < overlapRight) ? -Math.abs(b.vx) : Math.abs(b.vx);
                        } else {
                            b.vy = (overlapTop < overlapBottom) ? -Math.abs(b.vy) : Math.abs(b.vy);
                        }

                        // Apply Brick Damage
                        br.hp--;
                        br.flash = 1.0;

                        if (br.hp <= 0) {
                            br.alive = false;
                            bricksCleared++;

                            var pts = (br.maxHp * 15) * combo;
                            score += pts;

                            this.spawnParticles(br.x + br.w / 2, br.y + br.h / 2, br.color.bg);
                            this.spawnFloatingScore(br.x + br.w / 2, br.y, pts);

                            // Power-Up Chance (14%)
                            if (Math.random() < 0.14) {
                                this.spawnPowerUp(br.x + br.w / 2, br.y + br.h / 2);
                            }

                            combo++;
                            if (window.GameAudio) window.GameAudio.playBrickHit(combo);
                        } else {
                            br.color = this.getBrickColor(br.hp);
                            if (window.GameAudio) window.GameAudio.playBrickHit(1);
                        }

                        this.updateHUD();
                        hitBrick = true;
                        break;
                    }
                }

                // Check Bottom Drop
                if (b.y - b.radius < H) {
                    activeBalls.push(b);
                }
            }

            balls = activeBalls;

            // 3. Handle Ball Drop / Life Loss
            if (balls.length === 0 && !unlaunched) {
                lives--;
                combo = 1;
                this.updateHUD();

                if (window.GameAudio) window.GameAudio.playLifeLost();

                if (lives > 0) {
                    this.resetPaddleAndBall();
                } else {
                    this.handleGameOver();
                }
            }

            // 4. Check Level Clear
            var remainingBricks = bricks.filter(function(b) { return b.alive; }).length;
            if (remainingBricks === 0) {
                if (window.GameAudio) window.GameAudio.playLevelClear();
                this.loadLevel(level + 1);
                this.resetPaddleAndBall();
            }

            // 5. Update Power-Ups
            for (var p = powerUps.length - 1; p >= 0; p--) {
                var pu = powerUps[p];
                pu.y += pu.vy;

                // Check Paddle Collection
                if (pu.y + pu.radius >= paddle.y && pu.y - pu.radius <= paddle.y + paddle.h &&
                    pu.x >= paddle.x && pu.x <= paddle.x + paddle.w) {

                    this.applyPowerUp(pu.type);
                    if (window.GameAudio) window.GameAudio.playPowerUpCollect();
                    powerUps.splice(p, 1);
                    continue;
                }

                if (pu.y > H + 20) {
                    powerUps.splice(p, 1);
                }
            }

            // 6. Update Particles
            for (var k = particles.length - 1; k >= 0; k--) {
                var part = particles[k];
                part.x += part.vx;
                part.y += part.vy;
                part.alpha -= dt * 2.2;
                if (part.alpha <= 0) {
                    particles.splice(k, 1);
                }
            }

            // 7. Update Floating Scores
            for (var f = floatingScores.length - 1; f >= 0; f--) {
                var fs = floatingScores[f];
                fs.y -= dt * 45;
                fs.alpha -= dt * 1.8;
                if (fs.alpha <= 0) {
                    floatingScores.splice(f, 1);
                }
            }
        },

        spawnParticles: function(x, y, color) {
            for (var i = 0; i < 7; i++) {
                var angle = Math.random() * Math.PI * 2;
                var spd = Math.random() * 3.5 + 1.2;
                particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * spd,
                    vy: Math.sin(angle) * spd,
                    size: Math.random() * 4 + 3,
                    color: color,
                    alpha: 1.0
                });
            }
        },

        spawnFloatingScore: function(x, y, points) {
            floatingScores.push({
                x: x,
                y: y,
                text: '+' + points,
                alpha: 1.0
            });
        },

        spawnPowerUp: function(x, y) {
            var types = ['W', 'M', 'S']; // Wide Paddle, Multi-Ball, Slow Ball
            var t = types[Math.floor(Math.random() * types.length)];
            powerUps.push({
                x: x,
                y: y,
                vy: 2.2,
                radius: 12,
                type: t
            });
        },

        applyPowerUp: function(type) {
            if (type === 'W') {
                paddle.w = paddle.baseW + 50;
                widePaddleTimer = 12.0;
            } else if (type === 'M') {
                if (balls.length > 0) {
                    var main = balls[0];
                    balls.push({
                        x: main.x,
                        y: main.y,
                        radius: 7,
                        vx: -main.vx * 0.9,
                        vy: main.vy,
                        speed: main.speed,
                        isLaunched: true
                    });
                    balls.push({
                        x: main.x,
                        y: main.y,
                        radius: 7,
                        vx: main.vx * 0.7,
                        vy: -Math.abs(main.vy),
                        speed: main.speed,
                        isLaunched: true
                    });
                }
            } else if (type === 'S') {
                slowBallTimer = 10.0;
            }
        },

        render: function() {
            ctx.clearRect(0, 0, W, H);

            // 1. Background Grid Glow
            ctx.fillStyle = '#060b18';
            ctx.fillRect(0, 0, W, H);

            // Subtle Horizon Guide Line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, paddle.y + paddle.h + 8);
            ctx.lineTo(W, paddle.y + paddle.h + 8);
            ctx.stroke();

            // 2. Render Bricks
            for (var i = 0; i < bricks.length; i++) {
                var br = bricks[i];
                if (!br.alive) continue;

                ctx.save();
                if (br.flash > 0) {
                    ctx.fillStyle = '#ffffff';
                    ctx.strokeStyle = '#ffffff';
                } else {
                    ctx.fillStyle = br.color.bg;
                    ctx.strokeStyle = br.color.border;
                }

                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(br.x, br.y, br.w, br.h, 6);
                ctx.fill();
                ctx.stroke();

                // Subtle HP dots
                if (br.maxHp > 1) {
                    for (var h = 0; h < br.hp; h++) {
                        ctx.fillStyle = br.color.text;
                        ctx.beginPath();
                        ctx.arc(br.x + 12 + h * 8, br.y + br.h / 2, 2.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                ctx.restore();
            }

            // 3. Render Power-Up Pills
            for (var p = 0; p < powerUps.length; p++) {
                var pu = powerUps[p];
                ctx.save();
                ctx.fillStyle = '#0f172a';
                ctx.strokeStyle = (pu.type === 'W' ? '#38bdf8' : (pu.type === 'M' ? '#f43f5e' : '#facc15'));
                ctx.lineWidth = 2.5;

                ctx.beginPath();
                ctx.arc(pu.x, pu.y, pu.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.font = 'bold 12px Outfit, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = ctx.strokeStyle;
                ctx.fillText(pu.type, pu.x, pu.y);
                ctx.restore();
            }

            // 4. Render Paddle
            ctx.save();
            var padGrad = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.h);
            padGrad.addColorStop(0, paddle.flash > 0 ? '#ffffff' : '#38bdf8');
            padGrad.addColorStop(1, '#0284c7');

            ctx.fillStyle = padGrad;
            ctx.strokeStyle = '#7dd3fc';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 8);
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            // 5. Render Balls
            for (var b = 0; b < balls.length; b++) {
                var ball = balls[b];
                ctx.save();
                ctx.fillStyle = '#f8fafc';
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 12;

                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // 6. Render Particles
            for (var k = 0; k < particles.length; k++) {
                var part = particles[k];
                ctx.save();
                ctx.globalAlpha = Math.max(0, part.alpha);
                ctx.fillStyle = part.color;
                ctx.fillRect(part.x, part.y, part.size, part.size);
                ctx.restore();
            }

            // 7. Render Floating Scores
            for (var f = 0; f < floatingScores.length; f++) {
                var fs = floatingScores[f];
                ctx.save();
                ctx.globalAlpha = Math.max(0, fs.alpha);
                ctx.font = 'bold 16px Outfit, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#38bdf8';
                ctx.fillText(fs.text, fs.x, fs.y);
                ctx.restore();
            }

            // 8. Launch & Pause Overlays
            if (balls.length > 0 && !balls[0].isLaunched) {
                ctx.save();
                ctx.font = 'bold 16px Outfit, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fillText('Click, Space, or Tap to Launch Ball', W / 2, paddle.y - 35);
                ctx.restore();
            }

            if (isPaused) {
                ctx.save();
                ctx.fillStyle = 'rgba(6, 11, 24, 0.75)';
                ctx.fillRect(0, 0, W, H);

                ctx.font = 'bold 32px Outfit, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#facc15';
                ctx.fillText('PAUSED', W / 2, H / 2);

                ctx.font = '16px Outfit, sans-serif';
                ctx.fillStyle = '#94a3b8';
                ctx.fillText('Press P or Click Pause to Resume', W / 2, H / 2 + 35);
                ctx.restore();
            }
        },

        handleGameOver: function() {
            isRunning = false;
            var playerName = window.App ? window.App.getPlayerName() : "Player";
            var self = this;

            this.submitScore(playerName, score, level);

            window.App.showGameModal({
                title: "Game Over",
                text: "Final Score: " + score + " | Level Reached: " + level + " | Bricks Cleared: " + bricksCleared,
                isWin: false,
                onRematch: function() {
                    self.newGame();
                }
            });
        },

        submitScore: function(playerName, finalScore, levelReached) {
            var self = this;
            $.ajax({
                type: "POST",
                url: "BrickBlast.aspx/SaveScore",
                data: JSON.stringify({ playerName: playerName, score: finalScore, levelReached: levelReached }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(response) {
                    self.loadLeaderboard();
                },
                error: function(err) {
                    console.warn("Could not save Brick Blast score:", err);
                }
            });
        },

        loadLeaderboard: function() {
            $.ajax({
                type: "POST",
                url: "BrickBlast.aspx/GetLeaderboard",
                data: "{}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(response) {
                    var records = response.d || [];
                    var $tbody = $('#leaderboard-brickblast-body');
                    $tbody.empty();

                    if (records.length === 0) {
                        $tbody.append('<tr><td colspan="4" style="text-align:center; color: var(--text-muted); padding: 14px;">No high scores recorded yet. Play to set a record!</td></tr>');
                        return;
                    }

                    records.forEach(function(rec, idx) {
                        var rankBadge = (idx === 0) ? '🥇 ' : ((idx === 1) ? '🥈 ' : ((idx === 2) ? '🥉 ' : (idx + 1) + '. '));
                        $tbody.append(
                            '<tr>' +
                                '<td>' + rankBadge + rec.PlayerName + '</td>' +
                                '<td style="font-weight: 700; color: #38bdf8;">' + rec.Score + '</td>' +
                                '<td><span class="archery-score-pill" style="width: auto; height: auto; padding: 2px 8px; border-radius: 4px;">Lvl ' + rec.LevelReached + '</span></td>' +
                                '<td style="color: var(--text-muted); font-size: 0.75rem;">' + rec.FormattedDate + '</td>' +
                            '</tr>'
                        );
                    });
                }
            });
        },

        bindEvents: function() {
            var self = this;

            function getCanvasX(clientX) {
                var rect = canvas.getBoundingClientRect();
                var scaleX = W / rect.width;
                return (clientX - rect.left) * scaleX;
            }

            // Keyboard Controls
            $(document).on('keydown', function(e) {
                if (e.which === 37 || e.which === 65) { // Left / A
                    keys.left = true;
                    mouseX = null;
                } else if (e.which === 39 || e.which === 68) { // Right / D
                    keys.right = true;
                    mouseX = null;
                } else if (e.which === 32) { // Space
                    e.preventDefault();
                    self.launchBall();
                } else if (e.which === 80) { // P (Pause)
                    self.togglePause();
                }
            });

            $(document).on('keyup', function(e) {
                if (e.which === 37 || e.which === 65) keys.left = false;
                if (e.which === 39 || e.which === 68) keys.right = false;
            });

            // Mouse Controls
            $(canvas).on('mousemove', function(e) {
                var cx = getCanvasX(e.clientX);
                paddle.targetX = cx - paddle.w / 2;
                mouseX = cx;
            });

            $(canvas).on('click', function() {
                self.launchBall();
            });

            // Touch Controls
            canvas.addEventListener('touchmove', function(e) {
                if (e.touches.length > 0) {
                    var cx = getCanvasX(e.touches[0].clientX);
                    paddle.targetX = cx - paddle.w / 2;
                    mouseX = cx;
                }
            }, { passive: true });

            canvas.addEventListener('touchstart', function(e) {
                self.launchBall();
            }, { passive: true });

            // Pause on Window Blur
            $(window).on('blur', function() {
                if (isRunning && !isPaused) {
                    self.togglePause();
                }
            });

            $('#new-game-btn').on('click', function() {
                self.newGame();
            });

            $('#pause-btn').on('click', function() {
                self.togglePause();
            });
        },

        togglePause: function() {
            isPaused = !isPaused;
            $('#pause-btn').text(isPaused ? 'Resume' : 'Pause');
        }
    };

    $(document).ready(function() {
        BrickBlast.init();
    });

    window.BrickBlast = BrickBlast;

})(window, jQuery);
