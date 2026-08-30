/* ==========================================================================
   GAME HUB - Modern Brick Blast: Swarm & Ball Crusher Engine
   Features: Multi-Ball Swarm Launcher, Laser Trajectory Preview with Reflection,
   Numbered Health Bricks, +1 Ball Orbs, Row/Column Lasers, Bomb Explosions,
   Prism Ball Splitters, 1x/2x/3x Speed Toggle, Fast Recall & Leaderboard
   ========================================================================== */

(function(window, $) {
    'use strict';

    var canvas, ctx;
    var W = 540;
    var H = 680;

    var isRunning = false;
    var isPaused = false;
    var lastTime = 0;

    // Grid Dimensions
    var COLS = 7;
    var ROWS = 9;
    var GRID_TOP = 65;
    var GRID_LEFT = 21;
    var BRICK_W = 65;
    var BRICK_H = 42;
    var BRICK_PAD = 7;
    var DANGER_Y = 560;
    var LAUNCHER_Y = 635;

    // Game Progression
    var score = 0;
    var bestScore = 0;
    var level = 1; // Round / Turn number
    var totalBalls = 25; // Permanent swarm size
    var addedBallsNextTurn = 0;

    // Launcher & Ball Physics
    var launcherX = 270;
    var targetLauncherX = 270;
    var aimAngle = -Math.PI / 2; // Default up
    var isAiming = false;
    var isFiring = false;
    var ballsToSpawn = 0;
    var spawnTimer = 0;
    var SPAWN_INTERVAL = 0.055; // sec per ball launched
    var BALL_SPEED = 720; // px/sec
    var BALL_RADIUS = 5.5;

    var activeBalls = [];
    var firstReturnedX = null;
    var speedMultiplier = 1; // 1x, 2x, 3x

    // Grid Elements: Bricks & Power-Ups
    var grid = [];

    // Visual Effects
    var particles = [];
    var floatingScores = [];
    var laserBeams = [];
    var bombExplosions = [];
    var screenShake = 0;
    var comboMultiplier = 1;
    var turnHitCount = 0;

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
            level = 1;
            totalBalls = 25; // Great fast-paced starting swarm
            addedBallsNextTurn = 0;
            launcherX = 270;
            targetLauncherX = 270;
            aimAngle = -Math.PI / 2;
            isAiming = false;
            isFiring = false;
            ballsToSpawn = 0;
            activeBalls = [];
            firstReturnedX = null;
            speedMultiplier = 1;
            comboMultiplier = 1;
            turnHitCount = 0;
            screenShake = 0;

            grid = [];
            particles = [];
            floatingScores = [];
            laserBeams = [];
            bombExplosions = [];

            // Spawn initial 3 rows of blocks
            for (var r = 0; r < 3; r++) {
                this.spawnRowAt(r, r + 1);
            }

            this.updateHUD();
            this.updateSpeedButton();

            isPaused = false;
            isRunning = true;
            lastTime = performance.now();

            this.startLoop();
        },

        spawnRowAt: function(targetRow, difficultyLvl) {
            var hasOrb = false;
            var numBlocks = Math.floor(Math.random() * 3) + 3; // 3 to 5 blocks per row
            var availableCols = [0, 1, 2, 3, 4, 5, 6];

            // Shuffle available columns
            for (var i = availableCols.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = availableCols[i];
                availableCols[i] = availableCols[j];
                availableCols[j] = temp;
            }

            for (var b = 0; b < numBlocks; b++) {
                var c = availableCols[b];
                var rand = Math.random();
                var blockType = 'brick';

                // Determine block type
                if (!hasOrb && (b === numBlocks - 1 || rand < 0.35)) {
                    blockType = 'add_ball';
                    hasOrb = true;
                } else if (rand < 0.12) {
                    blockType = 'bomb';
                } else if (rand < 0.22) {
                    blockType = (Math.random() < 0.5) ? 'laser_h' : 'laser_v';
                } else if (rand < 0.28) {
                    blockType = 'prism';
                }

                var baseHp = Math.max(1, Math.round(difficultyLvl * (1.0 + Math.random() * 0.4)));
                if (blockType === 'brick' && Math.random() < 0.2) {
                    baseHp = Math.round(baseHp * 1.8); // Tougher gold brick
                }

                grid.push({
                    row: targetRow,
                    col: c,
                    type: blockType,
                    hp: baseHp,
                    maxHp: baseHp,
                    x: GRID_LEFT + c * (BRICK_W + BRICK_PAD),
                    y: GRID_TOP + targetRow * (BRICK_H + BRICK_PAD),
                    flash: 0,
                    scale: 0.2 // Pop-in animation
                });
            }
        },

        updateHUD: function() {
            $('#current-score').text(score);
            $('#current-level').text(level);
            $('#swarm-count').text(totalBalls + ' ⚪');
            $('#current-combo').text(comboMultiplier + 'x');

            if (score > bestScore) {
                bestScore = score;
                $('#best-score').text(bestScore);
                this.saveBestScore();
            }
        },

        updateSpeedButton: function() {
            var $btn = $('#speed-btn');
            $btn.text('⚡ ' + speedMultiplier + 'x Speed');
            if (speedMultiplier > 1) {
                $btn.addClass('btn-speed-active');
            } else {
                $btn.removeClass('btn-speed-active');
            }
        },

        toggleSpeed: function() {
            if (speedMultiplier === 1) speedMultiplier = 2;
            else if (speedMultiplier === 2) speedMultiplier = 3;
            else speedMultiplier = 1;

            this.updateSpeedButton();
        },

        recallBalls: function() {
            if (!isFiring) return;

            // Instantly pull all flying balls to the ground
            var targetX = (firstReturnedX !== null) ? firstReturnedX : launcherX;
            for (var i = 0; i < activeBalls.length; i++) {
                var b = activeBalls[i];
                if (!b.landed) {
                    b.landed = true;
                    b.y = LAUNCHER_Y;
                    b.x = targetX;
                    b.vx = 0;
                    b.vy = 0;
                }
            }
            ballsToSpawn = 0;

            if (window.GameAudio && window.GameAudio.playPowerUpCollect) {
                window.GameAudio.playPowerUpCollect();
            }
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
            var subSteps = speedMultiplier;
            var subDt = (dt * speedMultiplier) / subSteps;

            for (var s = 0; s < subSteps; s++) {
                this.physicsStep(subDt);
            }

            // Screen Shake decay
            if (screenShake > 0) {
                screenShake -= dt * 7.0;
                if (screenShake < 0) screenShake = 0;
            }

            // Launcher smooth position interpolation
            if (!isFiring && Math.abs(launcherX - targetLauncherX) > 0.5) {
                launcherX += (targetLauncherX - launcherX) * Math.min(1.0, dt * 14.0);
            }

            // Update Laser Beams
            for (var l = laserBeams.length - 1; l >= 0; l--) {
                var lb = laserBeams[l];
                lb.alpha -= dt * 4.0;
                if (lb.alpha <= 0) laserBeams.splice(l, 1);
            }

            // Update Bomb Explosions
            for (var b = bombExplosions.length - 1; b >= 0; b--) {
                var be = bombExplosions[b];
                be.radius += dt * 360;
                be.alpha -= dt * 3.5;
                if (be.alpha <= 0) bombExplosions.splice(b, 1);
            }

            // Update Particles
            for (var p = particles.length - 1; p >= 0; p--) {
                var pt = particles[p];
                pt.x += pt.vx * dt;
                pt.y += pt.vy * dt;
                pt.vy += 380 * dt; // gravity
                pt.alpha -= dt * pt.fade;
                if (pt.alpha <= 0) particles.splice(p, 1);
            }

            // Update Floating Scores
            for (var f = floatingScores.length - 1; f >= 0; f--) {
                var fs = floatingScores[f];
                fs.y -= dt * 45;
                fs.alpha -= dt * 1.8;
                if (fs.alpha <= 0) floatingScores.splice(f, 1);
            }
        },

        physicsStep: function(dt) {
            // 1. Spawning Swarm Stream
            if (isFiring && ballsToSpawn > 0) {
                spawnTimer += dt;
                if (spawnTimer >= SPAWN_INTERVAL) {
                    spawnTimer -= SPAWN_INTERVAL;
                    ballsToSpawn--;

                    activeBalls.push({
                        x: launcherX,
                        y: LAUNCHER_Y,
                        vx: Math.cos(aimAngle) * BALL_SPEED,
                        vy: Math.sin(aimAngle) * BALL_SPEED,
                        radius: BALL_RADIUS,
                        landed: false
                    });
                }
            }

            // 2. Animate Grid Block Pop-in & Flash
            for (var g = 0; g < grid.length; g++) {
                var block = grid[g];
                if (block.scale < 1.0) {
                    block.scale += dt * 8.0;
                    if (block.scale > 1.0) block.scale = 1.0;
                }
                if (block.flash > 0) {
                    block.flash -= dt * 6.0;
                    if (block.flash < 0) block.flash = 0;
                }
            }

            // 3. Update & Bounce Active Balls
            var allLanded = true;

            for (var i = 0; i < activeBalls.length; i++) {
                var ball = activeBalls[i];
                if (ball.landed) continue;

                allLanded = false;

                // Move ball
                ball.x += ball.vx * dt;
                ball.y += ball.vy * dt;

                // Left & Right Wall Reflection
                if (ball.x - ball.radius <= 0) {
                    ball.x = ball.radius;
                    ball.vx = Math.abs(ball.vx);
                } else if (ball.x + ball.radius >= W) {
                    ball.x = W - ball.radius;
                    ball.vx = -Math.abs(ball.vx);
                }

                // Top Wall Reflection
                if (ball.y - ball.radius <= 10) {
                    ball.y = 10 + ball.radius;
                    ball.vy = Math.abs(ball.vy);
                }

                // Bottom Floor Arrival (Ball completes turn)
                if (ball.y + ball.radius >= LAUNCHER_Y) {
                    ball.landed = true;
                    ball.y = LAUNCHER_Y;
                    ball.vx = 0;
                    ball.vy = 0;

                    if (firstReturnedX === null) {
                        firstReturnedX = Math.max(30, Math.min(W - 30, ball.x));
                        targetLauncherX = firstReturnedX;
                    }
                    continue;
                }

                // Brick & Power-Up Collisions
                this.checkBallGridCollisions(ball);
            }

            // 4. Turn Completion Check
            if (isFiring && ballsToSpawn <= 0 && allLanded && activeBalls.length > 0) {
                this.completeTurn();
            }
        },

        checkBallGridCollisions: function(ball) {
            for (var j = grid.length - 1; j >= 0; j--) {
                var block = grid[j];

                // Bounding Box
                var bx = block.x;
                var by = block.y;
                var bw = BRICK_W;
                var bh = BRICK_H;

                // Closest point on rectangle to circle
                var closestX = Math.max(bx, Math.min(ball.x, bx + bw));
                var closestY = Math.max(by, Math.min(ball.y, by + bh));

                var distX = ball.x - closestX;
                var distY = ball.y - closestY;
                var distSq = (distX * distX) + (distY * distY);

                if (distSq < (ball.radius * ball.radius)) {
                    // Collision Detected!
                    if (block.type === 'add_ball') {
                        // Collect +1 Orb without bouncing (passes through smoothly)
                        this.collectAddBallOrb(block, j);
                    } else if (block.type === 'prism') {
                        // Split ball into +2 extra bouncing balls!
                        this.triggerPrismSplit(block, ball);
                        this.reflectBallFromBox(ball, bx, by, bw, bh);
                    } else {
                        // Solid Brick, Laser, or Bomb
                        this.reflectBallFromBox(ball, bx, by, bw, bh);
                        this.hitBlock(block, j, 1);
                    }
                    break;
                }
            }
        },

        reflectBallFromBox: function(ball, bx, by, bw, bh) {
            var overlapLeft = ball.x - bx;
            var overlapRight = (bx + bw) - ball.x;
            var overlapTop = ball.y - by;
            var overlapBottom = (by + bh) - ball.y;

            var minOverlapX = Math.min(overlapLeft, overlapRight);
            var minOverlapY = Math.min(overlapTop, overlapBottom);

            if (minOverlapX < minOverlapY) {
                // Horizontal reflection
                ball.vx = -ball.vx;
                ball.x += (overlapLeft < overlapRight) ? -minOverlapX : minOverlapX;
            } else {
                // Vertical reflection
                ball.vy = -ball.vy;
                ball.y += (overlapTop < overlapBottom) ? -minOverlapY : minOverlapY;
            }
        },

        hitBlock: function(block, index, damage) {
            turnHitCount++;
            if (turnHitCount % 12 === 0) {
                comboMultiplier = Math.min(8, comboMultiplier + 1);
                this.updateHUD();
            }

            block.flash = 1.0;
            block.hp -= damage;

            var pts = 10 * comboMultiplier;
            score += pts;
            this.updateHUD();

            this.spawnSparks(block.x + BRICK_W / 2, block.y + BRICK_H / 2, this.getBrickColor(block.hp, block.maxHp), 4);

            if (window.GameAudio && window.GameAudio.playBrickHit) {
                window.GameAudio.playBrickHit(comboMultiplier);
            }

            // Block Destroyed
            if (block.hp <= 0) {
                this.destroyBlock(block, index);
            }
        },

        destroyBlock: function(block, index) {
            grid.splice(index, 1);
            screenShake = Math.max(screenShake, 0.4);

            var cx = block.x + BRICK_W / 2;
            var cy = block.y + BRICK_H / 2;

            // Spawn Destruction Particles
            this.spawnBlockShards(block);
            this.spawnFloatingScore(cx, cy, '+' + (100 * comboMultiplier), '#facc15');

            // Special Block Triggers
            if (block.type === 'bomb') {
                this.triggerBombBlast(block.row, block.col, cx, cy);
            } else if (block.type === 'laser_h') {
                this.triggerLaserH(block.row, cy);
            } else if (block.type === 'laser_v') {
                this.triggerLaserV(block.col, cx);
            }
        },

        collectAddBallOrb: function(block, index) {
            grid.splice(index, 1);
            addedBallsNextTurn++;

            var cx = block.x + BRICK_W / 2;
            var cy = block.y + BRICK_H / 2;

            this.spawnFloatingScore(cx, cy, '+1 Ball', '#34d399');
            this.spawnSparks(cx, cy, '#34d399', 10);

            if (window.GameAudio && window.GameAudio.playCollectibleHit) {
                window.GameAudio.playCollectibleHit();
            }
        },

        triggerPrismSplit: function(block, ball) {
            block.flash = 1.0;
            // Spawn 2 extra active balls flying at angled deflections
            var ang1 = Math.atan2(ball.vy, ball.vx) + 0.35;
            var ang2 = Math.atan2(ball.vy, ball.vx) - 0.35;

            activeBalls.push({
                x: ball.x,
                y: ball.y,
                vx: Math.cos(ang1) * BALL_SPEED,
                vy: Math.sin(ang1) * BALL_SPEED,
                radius: BALL_RADIUS,
                landed: false
            });

            activeBalls.push({
                x: ball.x,
                y: ball.y,
                vx: Math.cos(ang2) * BALL_SPEED,
                vy: Math.sin(ang2) * BALL_SPEED,
                radius: BALL_RADIUS,
                landed: false
            });

            this.spawnSparks(block.x + BRICK_W / 2, block.y + BRICK_H / 2, '#38bdf8', 8);
        },

        triggerBombBlast: function(targetRow, targetCol, cx, cy) {
            screenShake = 1.0;
            bombExplosions.push({ x: cx, y: cy, radius: 10, alpha: 1.0 });

            if (window.GameAudio && window.GameAudio.playClash) {
                window.GameAudio.playClash();
            }

            // Damage all 8 surrounding cells
            for (var i = grid.length - 1; i >= 0; i--) {
                var b = grid[i];
                if (Math.abs(b.row - targetRow) <= 1 && Math.abs(b.col - targetCol) <= 1) {
                    this.hitBlock(b, i, Math.max(10, Math.round(level * 1.5)));
                }
            }
        },

        triggerLaserH: function(targetRow, cy) {
            laserBeams.push({ isHorizontal: true, y: cy, x: 0, alpha: 1.0 });

            if (window.GameAudio && window.GameAudio.playCollectibleHit) {
                window.GameAudio.playCollectibleHit();
            }

            // Hit every brick in this row
            for (var i = grid.length - 1; i >= 0; i--) {
                var b = grid[i];
                if (b.row === targetRow) {
                    this.hitBlock(b, i, Math.max(8, Math.round(level * 1.2)));
                }
            }
        },

        triggerLaserV: function(targetCol, cx) {
            laserBeams.push({ isHorizontal: false, x: cx, y: 0, alpha: 1.0 });

            if (window.GameAudio && window.GameAudio.playCollectibleHit) {
                window.GameAudio.playCollectibleHit();
            }

            // Hit every brick in this column
            for (var i = grid.length - 1; i >= 0; i--) {
                var b = grid[i];
                if (b.col === targetCol) {
                    this.hitBlock(b, i, Math.max(8, Math.round(level * 1.2)));
                }
            }
        },

        completeTurn: function() {
            isFiring = false;
            activeBalls = [];

            // Add collected balls
            totalBalls += addedBallsNextTurn;
            addedBallsNextTurn = 0;

            if (firstReturnedX !== null) {
                targetLauncherX = firstReturnedX;
                firstReturnedX = null;
            }

            // Reset combo per round
            comboMultiplier = 1;
            turnHitCount = 0;

            // Shift all grid rows down by 1
            for (var i = 0; i < grid.length; i++) {
                grid[i].row++;
                grid[i].y = GRID_TOP + grid[i].row * (BRICK_H + BRICK_PAD);
            }

            // Check Game Over: any brick crosses Danger Line
            var isGameOver = false;
            for (var j = 0; j < grid.length; j++) {
                var b = grid[j];
                if (b.type !== 'add_ball' && b.y + BRICK_H >= DANGER_Y) {
                    isGameOver = true;
                    break;
                }
            }

            if (isGameOver) {
                this.handleGameOver();
                return;
            }

            // Spawn new top row
            level++;
            this.spawnRowAt(0, level);

            this.updateHUD();

            if (window.GameAudio && window.GameAudio.playLevelClear) {
                window.GameAudio.playLevelClear();
            }
        },

        handleGameOver: function() {
            isRunning = false;
            var playerName = window.App ? window.App.getPlayerName() : "Player";
            var self = this;

            this.submitScore(playerName, score, level);

            window.App.showGameModal({
                title: "Game Over",
                text: "Final Score: " + score + " | Stage Reached: " + level + " | Swarm Size: " + totalBalls + " Balls",
                isWin: false,
                onRematch: function() {
                    self.newGame();
                }
            });
        },

        fireSwarm: function() {
            if (isFiring || !isRunning || isPaused) return;

            isFiring = true;
            isAiming = false;
            ballsToSpawn = totalBalls;
            spawnTimer = 0;
            activeBalls = [];
            firstReturnedX = null;

            if (window.GameAudio && window.GameAudio.playDrop) {
                window.GameAudio.playDrop();
            }
        },

        getBrickColor: function(hp, maxHp) {
            if (hp <= 5) return '#0284c7'; // Sky blue
            if (hp <= 15) return '#059669'; // Emerald
            if (hp <= 30) return '#eab308'; // Gold
            if (hp <= 60) return '#ea580c'; // Orange
            if (hp <= 120) return '#e11d48'; // Rose
            return '#9333ea'; // Electric Purple
        },

        spawnBlockShards: function(block) {
            var cx = block.x + BRICK_W / 2;
            var cy = block.y + BRICK_H / 2;
            var color = this.getBrickColor(block.maxHp, block.maxHp);

            for (var i = 0; i < 8; i++) {
                var ang = Math.random() * Math.PI * 2;
                var spd = Math.random() * 220 + 80;
                particles.push({
                    x: cx,
                    y: cy,
                    vx: Math.cos(ang) * spd,
                    vy: Math.sin(ang) * spd - 60,
                    size: Math.random() * 5 + 3,
                    color: color,
                    alpha: 1.0,
                    fade: Math.random() * 2.2 + 1.5
                });
            }
        },

        spawnSparks: function(x, y, color, count) {
            for (var i = 0; i < count; i++) {
                var ang = Math.random() * Math.PI * 2;
                var spd = Math.random() * 160 + 40;
                particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(ang) * spd,
                    vy: Math.sin(ang) * spd - 30,
                    size: Math.random() * 3.5 + 2,
                    color: color,
                    alpha: 1.0,
                    fade: Math.random() * 2.8 + 2.0
                });
            }
        },

        spawnFloatingScore: function(x, y, text, color) {
            floatingScores.push({
                x: x,
                y: y,
                text: text,
                color: color || '#38bdf8',
                alpha: 1.0
            });
        },

        submitScore: function(playerName, finalScore, stageReached) {
            var self = this;
            $.ajax({
                type: "POST",
                url: "BrickBlast.aspx/SaveScore",
                data: JSON.stringify({ playerName: playerName, score: finalScore, levelReached: stageReached }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function() {
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
                                '<td><span class="archery-score-pill" style="width: auto; height: auto; padding: 2px 8px; border-radius: 4px;">Stage ' + rec.LevelReached + '</span></td>' +
                                '<td style="color: var(--text-muted); font-size: 0.75rem;">' + rec.FormattedDate + '</td>' +
                            '</tr>'
                        );
                    });
                }
            });
        },

        render: function() {
            ctx.clearRect(0, 0, W, H);

            // Screen Shake Effect
            ctx.save();
            if (screenShake > 0) {
                var shakeX = (Math.random() * 8 - 4) * screenShake;
                var shakeY = (Math.random() * 8 - 4) * screenShake;
                ctx.translate(shakeX, shakeY);
            }

            // 1. Background Arena Grid
            ctx.fillStyle = '#060b18';
            ctx.fillRect(0, 0, W, H);

            // Subtle Grid Dots
            ctx.fillStyle = 'rgba(56, 189, 248, 0.05)';
            for (var gx = 20; gx < W; gx += 30) {
                for (var gy = 20; gy < H; gy += 30) {
                    ctx.fillRect(gx, gy, 1.5, 1.5);
                }
            }

            // 2. Danger Bottom Line
            ctx.save();
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([8, 6]);
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.moveTo(10, DANGER_Y);
            ctx.lineTo(W - 10, DANGER_Y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();

            // Danger Label
            ctx.font = 'bold 11px Outfit, sans-serif';
            ctx.fillStyle = 'rgba(244, 63, 94, 0.65)';
            ctx.textAlign = 'right';
            ctx.fillText('⚠ DANGER LINE', W - 18, DANGER_Y - 6);

            // 3. Render Laser Beams & Bomb Explosions
            for (var l = 0; l < laserBeams.length; l++) {
                var lb = laserBeams[l];
                ctx.save();
                ctx.globalAlpha = Math.max(0, lb.alpha);
                ctx.fillStyle = '#38bdf8';
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 16;
                if (lb.isHorizontal) {
                    ctx.fillRect(0, lb.y - 6, W, 12);
                } else {
                    ctx.fillRect(lb.x - 6, 0, 12, H);
                }
                ctx.restore();
            }

            for (var be = 0; be < bombExplosions.length; be++) {
                var exp = bombExplosions[be];
                ctx.save();
                ctx.globalAlpha = Math.max(0, exp.alpha);
                ctx.strokeStyle = '#f97316';
                ctx.lineWidth = 4;
                ctx.shadowColor = '#fb923c';
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            // 4. Render Grid Elements (Bricks, Orbs, Lasers, Bombs)
            for (var g = 0; g < grid.length; g++) {
                this.drawGridBlock(grid[g]);
            }

            // 5. Render Laser Trajectory Preview Line
            if (!isFiring && isAiming) {
                this.drawAimTrajectory();
            }

            // 6. Render Active Flying Balls
            for (var b = 0; b < activeBalls.length; b++) {
                var ball = activeBalls[b];
                if (!ball.landed) {
                    ctx.save();
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowColor = '#38bdf8';
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }

            // 7. Render Launcher Base & Swarm Counter
            ctx.save();
            ctx.fillStyle = '#0284c7';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 12;

            ctx.beginPath();
            ctx.arc(launcherX, LAUNCHER_Y, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Inner Pulse Dot
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.arc(launcherX, LAUNCHER_Y, 5, 0, Math.PI * 2);
            ctx.fill();

            // Swarm Remaining Label
            if (!isFiring) {
                ctx.font = 'bold 13px Outfit, sans-serif';
                ctx.fillStyle = '#38bdf8';
                ctx.textAlign = 'center';
                ctx.shadowBlur = 0;
                ctx.fillText('x' + totalBalls, launcherX, LAUNCHER_Y + 28);
            } else if (ballsToSpawn > 0) {
                ctx.font = 'bold 12px Outfit, sans-serif';
                ctx.fillStyle = '#facc15';
                ctx.textAlign = 'center';
                ctx.shadowBlur = 0;
                ctx.fillText('x' + ballsToSpawn, launcherX, LAUNCHER_Y + 28);
            }
            ctx.restore();

            // 8. Render Particles
            for (var p = 0; p < particles.length; p++) {
                var pt = particles[p];
                ctx.save();
                ctx.globalAlpha = Math.max(0, pt.alpha);
                ctx.fillStyle = pt.color;
                ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
                ctx.restore();
            }

            // 9. Render Floating Scores
            for (var f = 0; f < floatingScores.length; f++) {
                var fs = floatingScores[f];
                ctx.save();
                ctx.globalAlpha = Math.max(0, fs.alpha);
                ctx.font = 'bold 16px Outfit, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = fs.color || '#38bdf8';
                ctx.shadowColor = fs.color || '#38bdf8';
                ctx.shadowBlur = 8;
                ctx.fillText(fs.text, fs.x, fs.y);
                ctx.restore();
            }

            // 10. Aim Prompt
            if (!isFiring && !isAiming) {
                ctx.save();
                ctx.font = '14px Outfit, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
                ctx.fillText('Drag / Move to Aim & Fire Swarm', W / 2, LAUNCHER_Y - 26);
                ctx.restore();
            }

            ctx.restore(); // Screen shake restore
        },

        drawGridBlock: function(block) {
            ctx.save();
            var cx = block.x + BRICK_W / 2;
            var cy = block.y + BRICK_H / 2;

            ctx.translate(cx, cy);
            ctx.scale(block.scale, block.scale);

            var hw = BRICK_W / 2;
            var hh = BRICK_H / 2;

            if (block.type === 'brick') {
                var baseColor = this.getBrickColor(block.hp, block.maxHp);
                ctx.fillStyle = (block.flash > 0) ? '#ffffff' : baseColor;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.shadowColor = baseColor;
                ctx.shadowBlur = 8;

                ctx.beginPath();
                ctx.roundRect(-hw, -hh, BRICK_W, BRICK_H, 6);
                ctx.fill();
                ctx.stroke();

                // Inner Gloss Bevel
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.beginPath();
                ctx.roundRect(-hw + 3, -hh + 3, BRICK_W - 6, (BRICK_H - 6) / 2, 4);
                ctx.fill();

                // HP Text in Center
                ctx.font = 'bold 16px Outfit, sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowBlur = 0;
                ctx.fillText(block.hp, 0, 0);

            } else if (block.type === 'add_ball') {
                // Pulsing Emerald Orb
                var pulse = 1.0 + 0.1 * Math.sin(performance.now() * 0.006);
                ctx.scale(pulse, pulse);

                ctx.fillStyle = '#059669';
                ctx.strokeStyle = '#34d399';
                ctx.lineWidth = 2.5;
                ctx.shadowColor = '#34d399';
                ctx.shadowBlur = 14;

                ctx.beginPath();
                ctx.arc(0, 0, 16, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.font = 'bold 13px Outfit, sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowBlur = 0;
                ctx.fillText('+1', 0, 0);

            } else if (block.type === 'bomb') {
                // Bomb Block
                ctx.fillStyle = '#c2410c';
                ctx.strokeStyle = '#f97316';
                ctx.lineWidth = 2;
                ctx.shadowColor = '#fb923c';
                ctx.shadowBlur = 10;

                ctx.beginPath();
                ctx.roundRect(-hw, -hh, BRICK_W, BRICK_H, 6);
                ctx.fill();
                ctx.stroke();

                ctx.font = '18px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('💣', 0, 0);

            } else if (block.type === 'laser_h') {
                // Horizontal Laser Block
                ctx.fillStyle = '#0369a1';
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 10;

                ctx.beginPath();
                ctx.roundRect(-hw, -hh, BRICK_W, BRICK_H, 6);
                ctx.fill();
                ctx.stroke();

                ctx.font = 'bold 15px Outfit, sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('⬌ LASER', 0, 0);

            } else if (block.type === 'laser_v') {
                // Vertical Laser Block
                ctx.fillStyle = '#6b21a8';
                ctx.strokeStyle = '#c084fc';
                ctx.lineWidth = 2;
                ctx.shadowColor = '#c084fc';
                ctx.shadowBlur = 10;

                ctx.beginPath();
                ctx.roundRect(-hw, -hh, BRICK_W, BRICK_H, 6);
                ctx.fill();
                ctx.stroke();

                ctx.font = 'bold 15px Outfit, sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('⬍ LASER', 0, 0);

            } else if (block.type === 'prism') {
                // Prism Splitter
                ctx.fillStyle = '#4338ca';
                ctx.strokeStyle = '#818cf8';
                ctx.lineWidth = 2;
                ctx.shadowColor = '#818cf8';
                ctx.shadowBlur = 10;

                ctx.beginPath();
                ctx.roundRect(-hw, -hh, BRICK_W, BRICK_H, 6);
                ctx.fill();
                ctx.stroke();

                ctx.font = 'bold 14px Outfit, sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('✦ SPLIT', 0, 0);
            }

            ctx.restore();
        },

        drawAimTrajectory: function() {
            var curX = launcherX;
            var curY = LAUNCHER_Y;
            var dirX = Math.cos(aimAngle);
            var dirY = Math.sin(aimAngle);

            ctx.save();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([6, 6]);
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 10;

            ctx.beginPath();
            ctx.moveTo(curX, curY);

            // Raycast simulation with 1 bounce
            var maxDistance = 900;
            var traveled = 0;
            var stepSize = 12;

            while (traveled < maxDistance) {
                curX += dirX * stepSize;
                curY += dirY * stepSize;
                traveled += stepSize;

                // Wall reflections
                if (curX <= BALL_RADIUS) {
                    curX = BALL_RADIUS;
                    dirX = Math.abs(dirX);
                    ctx.lineTo(curX, curY);
                } else if (curX >= W - BALL_RADIUS) {
                    curX = W - BALL_RADIUS;
                    dirX = -Math.abs(dirX);
                    ctx.lineTo(curX, curY);
                }

                if (curY <= 10 + BALL_RADIUS) {
                    curY = 10 + BALL_RADIUS;
                    dirY = Math.abs(dirY);
                    ctx.lineTo(curX, curY);
                    break;
                }

                // Check hit against active bricks
                var hitBrick = false;
                for (var i = 0; i < grid.length; i++) {
                    var b = grid[i];
                    if (b.type !== 'add_ball') {
                        if (curX >= b.x && curX <= b.x + BRICK_W && curY >= b.y && curY <= b.y + BRICK_H) {
                            hitBrick = true;
                            break;
                        }
                    }
                }

                if (hitBrick) {
                    ctx.lineTo(curX, curY);
                    break;
                }
            }

            ctx.lineTo(curX, curY);
            ctx.stroke();

            // End Target Aim Dot
            ctx.setLineDash([]);
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.arc(curX, curY, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        },

        bindEvents: function() {
            var self = this;

            function updateAimFromPointer(clientX, clientY) {
                if (isFiring) return;

                var rect = canvas.getBoundingClientRect();
                var px = (clientX - rect.left) * (W / rect.width);
                var py = (clientY - rect.top) * (H / rect.height);

                var dx = px - launcherX;
                var dy = py - LAUNCHER_Y;

                // Restrict aim upwards (between -170 deg and -10 deg)
                var ang = Math.atan2(dy, dx);
                if (ang > -0.15 && ang < Math.PI / 2) ang = -0.15;
                if (ang < -Math.PI + 0.15 || ang >= Math.PI / 2) ang = -Math.PI + 0.15;

                aimAngle = ang;
                isAiming = true;
            }

            // Mouse Aim & Fire
            $(canvas).on('mousedown', function(e) {
                if (isFiring) return;
                updateAimFromPointer(e.clientX, e.clientY);
            });

            $(canvas).on('mousemove', function(e) {
                if (!isFiring) {
                    updateAimFromPointer(e.clientX, e.clientY);
                }
            });

            $(canvas).on('mouseup', function(e) {
                if (!isFiring && isAiming) {
                    self.fireSwarm();
                }
            });

            // Touch Drag Aim & Release
            canvas.addEventListener('touchstart', function(e) {
                if (isFiring) return;
                e.preventDefault();
                var touch = e.touches[0];
                updateAimFromPointer(touch.clientX, touch.clientY);
            }, { passive: false });

            canvas.addEventListener('touchmove', function(e) {
                if (isFiring) return;
                e.preventDefault();
                var touch = e.touches[0];
                updateAimFromPointer(touch.clientX, touch.clientY);
            }, { passive: false });

            canvas.addEventListener('touchend', function(e) {
                if (!isFiring && isAiming) {
                    e.preventDefault();
                    self.fireSwarm();
                }
            }, { passive: false });

            // Keyboard Aim (Left / Right) & Fire (Space / Up)
            $(document).on('keydown', function(e) {
                if (e.which === 37) { // Left Arrow
                    aimAngle = Math.max(-Math.PI + 0.15, aimAngle - 0.05);
                    isAiming = true;
                } else if (e.which === 39) { // Right Arrow
                    aimAngle = Math.min(-0.15, aimAngle + 0.05);
                    isAiming = true;
                } else if (e.which === 32 || e.which === 38) { // Space / Up Arrow
                    e.preventDefault();
                    if (!isFiring) {
                        self.fireSwarm();
                    } else {
                        // Accelerate or recall
                        self.toggleSpeed();
                    }
                } else if (e.which === 83) { // 'S' key toggles speed
                    self.toggleSpeed();
                } else if (e.which === 82) { // 'R' key recalls
                    self.recallBalls();
                }
            });

            // Top Bar Buttons
            $('#speed-btn').on('click', function() {
                self.toggleSpeed();
            });

            $('#recall-btn').on('click', function() {
                self.recallBalls();
            });

            $('#new-game-btn').on('click', function() {
                self.newGame();
            });
        }
    };

    $(document).ready(function() {
        BrickBlast.init();
    });

    window.BrickBlast = BrickBlast;

})(window, jQuery);
