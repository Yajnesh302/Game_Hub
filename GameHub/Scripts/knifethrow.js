/* ==========================================================================
   GAME HUB - Knife Throw Professional Arcade Engine
   Features: 60 FPS Precision Angular Math, Dynamic Rotation Profiles,
   Elastic Impact Recoil, Spark/Wood Splinter Physics, Apple Slicing,
   Radial Disc Shatter, Synthesized Audio & High-Score Leaderboard
   ========================================================================== */

(function(window, $) {
    'use strict';

    var canvas, ctx;
    var W = 540;
    var H = 640;

    var isRunning = false;
    var isPaused = false;
    var lastTime = 0;

    // Game Progression
    var score = 0;
    var bestScore = 0;
    var level = 1;
    var totalKnivesStuck = 0;
    var comboCount = 0;
    var lastThrowTime = 0;

    // Lives & Heart System (3 Lives)
    var maxLives = 3;
    var lives = 3;
    var isThrowCooldown = false;

    // Target Physics & Kinematics
    var target = {
        x: 270,
        y: 200,
        baseY: 200,
        radius: 88,
        angle: 0,
        baseSpeed: 1.8,
        speed: 1.8,
        dir: 1, // 1 = CW, -1 = CCW
        recoilY: 0,
        bumpScale: 1.0,
        shake: 0,
        // Rotation profile modes: 'constant', 'wave', 'reverse_pulse'
        mode: 'constant',
        modeTimer: 0
    };

    // Knives & Target Entities (All angles in radians relative to target base rotation)
    var totalStack = 7;
    var knivesInStack = 7;
    var stuckKnives = [];     // Array of angles [0, 2pi) where 0 = bottom
    var obstacles = [];       // Array of { angle, width }
    var collectibles = [];    // Array of { angle, alive, type }

    // Flying Knife
    var flyingKnife = null;
    var KNIFE_START_Y = 550;
    var KNIFE_TARGET_Y = 288;
    var THROW_SPEED = 2800; // px/sec

    // Visual Effects (Particles, Shards, Shockwaves, Sliced Apples)
    var particles = [];
    var shockwaves = [];
    var slicedApples = [];
    var targetShards = [];
    var floatingScores = [];

    // Safe Collision Thresholds (radians)
    // Knife handle/guard is 14px wide at R=88 -> 14/88 = 0.159 rad (~9.1 deg)
    var MIN_KNIFE_GAP = 0.16;       // ~9.2 degrees (Exact pixel-accurate knife width)
    var KNIFE_HALF_WIDTH = 0.075;   // ~4.3 degrees knife tip/guard half-width
    var COLLECTIBLE_GAP = 0.24;

    var KnifeThrow = {
        init: function() {
            canvas = document.getElementById('knifethrow-canvas');
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
                var saved = localStorage.getItem('gamehub_knifethrow_best');
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
                localStorage.setItem('gamehub_knifethrow_best', bestScore.toString());
            } catch (e) {}
        },

        newGame: function() {
            score = 0;
            level = 1;
            lives = maxLives;
            totalKnivesStuck = 0;
            comboCount = 0;
            isThrowCooldown = false;

            this.updateHUD();
            this.renderLivesHUD();
            this.loadLevel(1);

            isPaused = false;
            isRunning = true;
            lastTime = performance.now();

            this.startLoop();
        },

        renderLivesHUD: function() {
            var $container = $('#knifethrow-lives-container');
            if (!$container.length) return;
            $container.empty();

            for (var i = 0; i < maxLives; i++) {
                var isAlive = (i < lives);
                var svgHeart = '<svg class="knifethrow-heart-icon ' + (isAlive ? 'knifethrow-heart-active' : '') + '" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="' + (isAlive ? '#f43f5e' : 'none') + '" stroke="' + (isAlive ? '#fb7185' : '#475569') + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: ' + (isAlive ? '1' : '0.35') + ';">' +
                    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>' +
                '</svg>';
                $container.append(svgHeart);
            }
        },

        loadLevel: function(lvl) {
            level = lvl;
            stuckKnives = [];
            obstacles = [];
            collectibles = [];
            flyingKnife = null;
            particles = [];
            shockwaves = [];
            slicedApples = [];
            targetShards = [];
            comboCount = 0;
            isThrowCooldown = false;

            // Target positioning reset
            target.y = target.baseY;
            target.recoilY = 0;
            target.bumpScale = 1.0;
            target.shake = 0;
            target.angle = 0;
            target.modeTimer = 0;

            // Stack count scales with level (6 to 10)
            totalStack = 6 + Math.min(4, Math.floor((level - 1) / 2));
            knivesInStack = totalStack;

            // Rotation direction & dynamic speed profile
            target.dir = (level % 2 === 1) ? 1 : -1;
            target.baseSpeed = 1.7 + Math.min(2.2, (level - 1) * 0.22);
            target.speed = target.baseSpeed;

            // Select Rotation Profile
            if (level >= 5 && level % 3 === 0) {
                target.mode = 'reverse_pulse'; // Stops and reverses briefly!
            } else if (level >= 3) {
                target.mode = 'wave';          // Smooth sinusoidal speed variation
            } else {
                target.mode = 'constant';
            }

            // Pre-stuck knives (Fair spacing, keeping bottom firing area clear)
            var preStuckCount = Math.min(4, Math.floor((level - 1) / 2));
            if (preStuckCount > 0) {
                var step = (Math.PI * 2) / (preStuckCount + 1);
                for (var p = 0; p < preStuckCount; p++) {
                    var ang = (p + 1) * step + (Math.random() * 0.15 - 0.075);
                    // Ensure clearance from angle 0 (bottom starting area)
                    var normAng = this.normalizeAngle(ang);
                    var distFromBottom = Math.min(normAng, Math.PI * 2 - normAng);
                    if (distFromBottom < 0.35) {
                        normAng = this.normalizeAngle(normAng + 0.4);
                    }
                    stuckKnives.push(normAng);
                }
            }

            // Obstacles (Starting level 4, kept away from starting bottom area)
            if (level >= 4) {
                var obstCount = (level >= 8) ? 2 : 1;
                for (var o = 0; o < obstCount; o++) {
                    var obstAngle = Math.PI + (o * Math.PI * 0.6) + (Math.random() * 0.25);
                    var normObstAng = this.normalizeAngle(obstAngle);
                    var distFromBot = Math.min(normObstAng, Math.PI * 2 - normObstAng);
                    if (distFromBot < 0.45) {
                        normObstAng = this.normalizeAngle(normObstAng + 0.5);
                    }
                    obstacles.push({
                        angle: normObstAng,
                        width: 0.26
                    });
                }
            }

            // Collectibles (Apple / Gem bonus chance: 70%)
            if (Math.random() < 0.7) {
                var collAngle = Math.random() * Math.PI * 2;
                collectibles.push({
                    angle: this.normalizeAngle(collAngle),
                    alive: true
                });
            }

            this.updateHUD();
            this.renderLivesHUD();
            this.renderKnifeStackHUD();
        },

        normalizeAngle: function(ang) {
            var twoPi = Math.PI * 2;
            return ((ang % twoPi) + twoPi) % twoPi;
        },

        throwKnife: function() {
            if (!isRunning || isPaused || isThrowCooldown || flyingKnife !== null || knivesInStack <= 0) return;

            knivesInStack--;
            this.renderKnifeStackHUD();

            var now = performance.now();
            if (now - lastThrowTime < 450) {
                comboCount++;
            } else {
                comboCount = 1;
            }
            lastThrowTime = now;

            flyingKnife = {
                x: target.x,
                y: KNIFE_START_Y,
                vy: -THROW_SPEED,
                shattered: false,
                trail: []
            };

            if (window.GameAudio) window.GameAudio.playKnifeThrow();
        },

        updateHUD: function() {
            $('#current-score').text(score);
            $('#current-level').text(level);

            if (score > bestScore) {
                bestScore = score;
                $('#best-score').text(bestScore);
                this.saveBestScore();
            }
        },

        renderKnifeStackHUD: function() {
            var $stack = $('#knife-stack-container');
            $stack.empty();

            for (var i = 0; i < totalStack; i++) {
                var isAvailable = (i < knivesInStack);
                var color = isAvailable ? '#38bdf8' : '#334155';
                var opacity = isAvailable ? '1' : '0.3';
                var shadow = isAvailable ? 'filter: drop-shadow(0 0 4px rgba(56,189,248,0.6));' : '';

                var svgIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="30" viewBox="0 0 16 30" style="margin: 0 3px; opacity: ' + opacity + '; ' + shadow + '">' +
                    '<polygon points="8 2 4 13 12 13" fill="' + color + '"/>' +
                    '<rect x="6" y="13" width="4" height="14" rx="2" fill="' + (isAvailable ? '#0284c7' : '#1e293b') + '"/>' +
                    '<circle cx="8" cy="28" r="2" fill="' + (isAvailable ? '#f8fafc' : '#475569') + '"/>' +
                '</svg>';

                $stack.append(svgIcon);
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
            // 1. Dynamic Rotation Profiles
            target.modeTimer += dt;
            if (target.mode === 'wave') {
                target.speed = target.baseSpeed * (1.0 + 0.65 * Math.sin(target.modeTimer * 2.5));
            } else if (target.mode === 'reverse_pulse') {
                var cycle = Math.sin(target.modeTimer * 1.8);
                target.speed = target.baseSpeed * (cycle > -0.2 ? 1.0 : -0.8);
            } else {
                target.speed = target.baseSpeed;
            }

            // Update Target Angle
            target.angle = this.normalizeAngle(target.angle + target.dir * target.speed * dt);

            // Elastic Recoil Recovery
            if (target.recoilY < 0) {
                target.recoilY += dt * 32;
                if (target.recoilY > 0) target.recoilY = 0;
            }
            target.y = target.baseY + target.recoilY;

            if (target.bumpScale > 1.0) {
                target.bumpScale -= dt * 3.0;
                if (target.bumpScale < 1.0) target.bumpScale = 1.0;
            }
            if (target.shake > 0) target.shake -= dt * 4.5;

            // 2. Flying Knife Update
            if (flyingKnife !== null) {
                if (!flyingKnife.shattered) {
                    flyingKnife.trail.push({ x: flyingKnife.x, y: flyingKnife.y, alpha: 0.7 });
                    if (flyingKnife.trail.length > 5) flyingKnife.trail.shift();

                    flyingKnife.y += flyingKnife.vy * dt;

                    // Exact Target Edge Arrival
                    if (flyingKnife.y <= KNIFE_TARGET_Y + target.recoilY) {
                        flyingKnife.y = KNIFE_TARGET_Y + target.recoilY;
                        this.resolveKnifeImpact();
                    }
                } else {
                    flyingKnife.y += 680 * dt;
                    flyingKnife.x += flyingKnife.vx * dt;
                    flyingKnife.rot = (flyingKnife.rot || 0) + 14 * dt;
                }
            }

            // 3. Update Particles
            for (var p = particles.length - 1; p >= 0; p--) {
                var part = particles[p];
                part.x += part.vx * dt;
                part.y += part.vy * dt;
                part.vy += 450 * dt; // gravity
                part.alpha -= dt * part.fadeRate;
                if (part.alpha <= 0) particles.splice(p, 1);
            }

            // 4. Update Shockwaves
            for (var w = shockwaves.length - 1; w >= 0; w--) {
                var sw = shockwaves[w];
                sw.radius += dt * 280;
                sw.alpha -= dt * 2.8;
                if (sw.alpha <= 0) shockwaves.splice(w, 1);
            }

            // 5. Update Sliced Apples
            for (var a = slicedApples.length - 1; a >= 0; a--) {
                var sa = slicedApples[a];
                sa.x += sa.vx * dt;
                sa.y += sa.vy * dt;
                sa.vy += 600 * dt;
                sa.rot += sa.vrot * dt;
                sa.alpha -= dt * 1.5;
                if (sa.alpha <= 0) slicedApples.splice(a, 1);
            }

            // 6. Update Target Shatter Shards
            for (var s = targetShards.length - 1; s >= 0; s--) {
                var sh = targetShards[s];
                sh.x += sh.vx * dt;
                sh.y += sh.vy * dt;
                sh.vy += 750 * dt;
                sh.rot += sh.vrot * dt;
                sh.alpha -= dt * 1.4;
                if (sh.alpha <= 0) targetShards.splice(s, 1);
            }

            // 7. Update Floating Scores
            for (var f = floatingScores.length - 1; f >= 0; f--) {
                var fs = floatingScores[f];
                fs.y -= dt * 45;
                fs.alpha -= dt * 1.6;
                if (fs.alpha <= 0) floatingScores.splice(f, 1);
            }
        },

        resolveKnifeImpact: function() {
            // In our unified angular model:
            // Point (0, R) at angle 0 in local coords is the bottom impact point.
            // When target has rotated by target.angle, the local angle at the bottom is:
            var landingAngle = this.normalizeAngle(-target.angle);

            // A. Check Collision with Stuck Knives
            for (var i = 0; i < stuckKnives.length; i++) {
                var diff = Math.abs(landingAngle - stuckKnives[i]);
                var angDist = Math.min(diff, Math.PI * 2 - diff);

                if (angDist < MIN_KNIFE_GAP) {
                    this.handleCollision();
                    return;
                }
            }

            // B. Check Collision with Obstacle Wedges (Pixel-Accurate)
            for (var j = 0; j < obstacles.length; j++) {
                var oDiff = Math.abs(landingAngle - obstacles[j].angle);
                var oDist = Math.min(oDiff, Math.PI * 2 - oDiff);

                if (oDist < (obstacles[j].width + KNIFE_HALF_WIDTH)) {
                    this.handleCollision();
                    return;
                }
            }

            // C. Check Slicing Collectibles (Apple / Gem)
            for (var c = 0; c < collectibles.length; c++) {
                var col = collectibles[c];
                if (col.alive) {
                    var cDiff = Math.abs(landingAngle - col.angle);
                    var cDist = Math.min(cDiff, Math.PI * 2 - cDiff);

                    if (cDist < COLLECTIBLE_GAP) {
                        col.alive = false;
                        var bonusPts = 50;
                        score += bonusPts;

                        this.spawnSlicedApple(target.x, target.y + target.radius);
                        this.spawnFloatingScore(target.x, target.y + target.radius + 10, bonusPts, '#facc15');
                        if (window.GameAudio) window.GameAudio.playCollectibleHit();
                    }
                }
            }

            // D. SUCCESSFUL EMBEDDING
            stuckKnives.push(landingAngle);
            flyingKnife = null;
            totalKnivesStuck++;

            // Elastic Impact Feel
            target.recoilY = -6.5;
            target.bumpScale = 1.06;

            var stickPts = (10 * level) + (comboCount > 1 ? (comboCount * 5) : 0);
            score += stickPts;

            // Spawn Spark Particles & Shockwave
            this.spawnSparks(target.x, target.y + target.radius, '#38bdf8', 10);
            this.spawnShockwave(target.x, target.y + target.radius);
            this.spawnFloatingScore(target.x, target.y + target.radius + 20, stickPts, '#38bdf8');

            this.updateHUD();
            if (window.GameAudio) window.GameAudio.playKnifeStick();

            // E. Level Complete Check
            if (knivesInStack <= 0) {
                var self = this;
                if (window.GameAudio) window.GameAudio.playKnifeLevelClear();
                this.spawnTargetShatter();

                // Bonus Life Recovery on Boss / Milestone Stages (every 4 levels)
                if (level % 4 === 0 && lives < maxLives) {
                    lives++;
                    self.renderLivesHUD();
                    self.spawnFloatingScore(target.x, target.y, '❤ +1 Life Restored!', '#34d399');
                    if (window.GameAudio && window.GameAudio.playPowerUpCollect) {
                        window.GameAudio.playPowerUpCollect();
                    }
                }

                setTimeout(function() {
                    self.loadLevel(level + 1);
                }, 520);
            }
        },

        handleCollision: function() {
            var self = this;
            target.shake = 1.3;

            if (lives > 1) {
                // Heart lost - player continues!
                lives--;
                this.renderLivesHUD();
                knivesInStack++; // Refund knife so stage is still beatable
                this.renderKnifeStackHUD();

                if (flyingKnife) {
                    flyingKnife.shattered = true;
                    flyingKnife.vx = (Math.random() - 0.5) * 300;
                    this.spawnSparks(flyingKnife.x, flyingKnife.y, '#f43f5e', 14);
                    this.spawnShockwave(flyingKnife.x, flyingKnife.y);
                }

                this.spawnFloatingScore(target.x, target.y + target.radius + 30, '💔 -1 Life! (' + lives + ' left)', '#f43f5e');

                if (window.GameAudio) {
                    window.GameAudio.playKnifeClank();
                    if (window.GameAudio.playLifeLost) window.GameAudio.playLifeLost();
                }

                // Short cooldown so player doesn't spam into the same spot
                isThrowCooldown = true;
                setTimeout(function() {
                    isThrowCooldown = false;
                    flyingKnife = null;
                }, 400);
            } else {
                // Final life lost - Game Over
                lives = 0;
                this.renderLivesHUD();

                if (flyingKnife) {
                    flyingKnife.shattered = true;
                    flyingKnife.vx = (Math.random() - 0.5) * 260;
                    this.spawnSparks(flyingKnife.x, flyingKnife.y, '#f43f5e', 16);
                }

                if (window.GameAudio) {
                    window.GameAudio.playKnifeClank();
                    if (window.GameAudio.playLifeLost) window.GameAudio.playLifeLost();
                }

                // Hit-Stop pause before Game Over modal
                setTimeout(function() {
                    self.handleGameOver();
                }, 380);
            }
        },

        handleGameOver: function() {
            isRunning = false;
            var playerName = window.App ? window.App.getPlayerName() : "Player";
            var self = this;

            this.submitScore(playerName, score, level);

            window.App.showGameModal({
                title: "Game Over",
                text: "Final Score: " + score + " | Stage Reached: " + level + " | Knives Stuck: " + totalKnivesStuck,
                isWin: false,
                onRematch: function() {
                    self.newGame();
                }
            });
        },

        spawnSparks: function(x, y, color, count) {
            for (var i = 0; i < count; i++) {
                var ang = Math.random() * Math.PI * 2;
                var spd = Math.random() * 220 + 80;
                particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(ang) * spd,
                    vy: Math.sin(ang) * spd - 60,
                    size: Math.random() * 3.5 + 2,
                    color: color,
                    alpha: 1.0,
                    fadeRate: Math.random() * 2.0 + 1.8
                });
            }
        },

        spawnShockwave: function(x, y) {
            shockwaves.push({
                x: x,
                y: y,
                radius: 6,
                alpha: 0.85
            });
        },

        spawnSlicedApple: function(x, y) {
            // Left Half
            slicedApples.push({
                x: x - 6,
                y: y,
                vx: -140,
                vy: -160,
                rot: 0,
                vrot: -6,
                alpha: 1.0,
                isLeft: true
            });
            // Right Half
            slicedApples.push({
                x: x + 6,
                y: y,
                vx: 140,
                vy: -160,
                rot: 0,
                vrot: 6,
                alpha: 1.0,
                isLeft: false
            });
            this.spawnSparks(x, y, '#facc15', 12);
        },

        spawnTargetShatter: function() {
            var numSlices = 10;
            var sliceAng = (Math.PI * 2) / numSlices;
            for (var i = 0; i < numSlices; i++) {
                var ang = i * sliceAng + target.angle;
                var spd = Math.random() * 280 + 140;
                targetShards.push({
                    x: target.x,
                    y: target.y,
                    vx: Math.sin(ang) * spd,
                    vy: Math.cos(ang) * spd - 120,
                    rot: ang,
                    vrot: (Math.random() - 0.5) * 8,
                    size: target.radius * 0.75,
                    color: (i % 2 === 0) ? '#0284c7' : '#0f172a',
                    alpha: 1.0
                });
            }
        },

        spawnFloatingScore: function(x, y, text, color) {
            floatingScores.push({
                x: x,
                y: y,
                text: (typeof text === 'number' ? '+' + text : text),
                color: color || '#38bdf8',
                alpha: 1.0
            });
        },

        submitScore: function(playerName, finalScore, levelReached) {
            var self = this;
            $.ajax({
                type: "POST",
                url: "KnifeThrow.aspx/SaveScore",
                data: JSON.stringify({ playerName: playerName, score: finalScore, levelReached: levelReached }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(response) {
                    self.loadLeaderboard();
                },
                error: function(err) {
                    console.warn("Could not save Knife Throw score:", err);
                }
            });
        },

        loadLeaderboard: function() {
            $.ajax({
                type: "POST",
                url: "KnifeThrow.aspx/GetLeaderboard",
                data: "{}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(response) {
                    var records = response.d || [];
                    var $tbody = $('#leaderboard-knifethrow-body');
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

            // 1. Background Arena
            ctx.fillStyle = '#060b18';
            ctx.fillRect(0, 0, W, H);

            // Subtle trajectory aimline guide
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.09)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(target.x, target.y + target.radius);
            ctx.lineTo(target.x, KNIFE_START_Y);
            ctx.stroke();
            ctx.setLineDash([]);

            // 2. Render Rotating Target Disc (Only if not shattering)
            if (targetShards.length === 0) {
                ctx.save();
                var shakeX = (target.shake > 0) ? (Math.random() * 8 - 4) * target.shake : 0;
                var shakeY = (target.shake > 0) ? (Math.random() * 8 - 4) * target.shake : 0;

                ctx.translate(target.x + shakeX, target.y + shakeY);
                ctx.scale(target.bumpScale, target.bumpScale);
                ctx.rotate(target.angle);

                // Outer Glowing Border Ring
                ctx.save();
                ctx.fillStyle = '#0f172a';
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 4.5;
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 14;

                ctx.beginPath();
                ctx.arc(0, 0, target.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.restore();

                // Concentric Cyber Grain Rings
                ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, target.radius * 0.72, 0, Math.PI * 2);
                ctx.stroke();

                ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, target.radius * 0.42, 0, Math.PI * 2);
                ctx.stroke();

                // Radial Segment Lines
                for (var s = 0; s < 8; s++) {
                    var rAng = (s * Math.PI) / 4;
                    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(Math.sin(rAng) * (target.radius * 0.42), Math.cos(rAng) * (target.radius * 0.42));
                    ctx.lineTo(Math.sin(rAng) * target.radius, Math.cos(rAng) * target.radius);
                    ctx.stroke();
                }

                // Center Core Bolt
                var coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
                coreGrad.addColorStop(0, '#f8fafc');
                coreGrad.addColorStop(0.5, '#38bdf8');
                coreGrad.addColorStop(1, '#0284c7');

                ctx.fillStyle = coreGrad;
                ctx.beginPath();
                ctx.arc(0, 0, 12, 0, Math.PI * 2);
                ctx.fill();

                // Render Obstacle Wedges
                for (var o = 0; o < obstacles.length; o++) {
                    ctx.save();
                    ctx.rotate(obstacles[o].angle);

                    ctx.fillStyle = '#f43f5e';
                    ctx.strokeStyle = '#fb7185';
                    ctx.lineWidth = 2.5;

                    ctx.beginPath();
                    // Draw arc around bottom (+Y / Math.PI / 2 in canvas angles) matching local angle 0
                    ctx.arc(0, 0, target.radius + 6, Math.PI / 2 - obstacles[o].width, Math.PI / 2 + obstacles[o].width);
                    ctx.lineTo(0, 0);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                }

                // Render Collectibles (Apples / Gems)
                for (var c = 0; c < collectibles.length; c++) {
                    var col = collectibles[c];
                    if (col.alive) {
                        ctx.save();
                        ctx.rotate(col.angle);
                        ctx.translate(0, target.radius - 8);

                        // Apple Body
                        ctx.fillStyle = '#facc15';
                        ctx.shadowColor = '#fbbf24';
                        ctx.shadowBlur = 10;
                        ctx.beginPath();
                        ctx.arc(0, 0, 9, 0, Math.PI * 2);
                        ctx.fill();

                        // Apple Leaf
                        ctx.fillStyle = '#34d399';
                        ctx.shadowBlur = 0;
                        ctx.beginPath();
                        ctx.ellipse(0, -9, 3, 5, Math.PI / 4, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    }
                }

                // Render Stuck Knives (Embedded at angle, where angle 0 = bottom)
                for (var i = 0; i < stuckKnives.length; i++) {
                    ctx.save();
                    ctx.rotate(stuckKnives[i]);
                    this.drawKnifeAt(0, target.radius, true);
                    ctx.restore();
                }

                ctx.restore();
            }

            // 3. Render Flying Knife & Trail
            if (flyingKnife !== null) {
                // Motion Trail
                for (var t = 0; t < flyingKnife.trail.length; t++) {
                    var tr = flyingKnife.trail[t];
                    ctx.save();
                    ctx.globalAlpha = tr.alpha * 0.4;
                    ctx.fillStyle = '#38bdf8';
                    ctx.fillRect(tr.x - 3, tr.y - 12, 6, 24);
                    ctx.restore();
                }

                ctx.save();
                ctx.translate(flyingKnife.x, flyingKnife.y);
                if (flyingKnife.rot) ctx.rotate(flyingKnife.rot);
                this.drawKnifeAt(0, 0, false);
                ctx.restore();
            }

            // 4. Render Ready Knife at Launch Origin
            if (knivesInStack > 0 && flyingKnife === null) {
                ctx.save();
                ctx.translate(target.x, KNIFE_START_Y);
                this.drawKnifeAt(0, 0, false);
                ctx.restore();
            }

            // 5. Render Shockwaves
            for (var w = 0; w < shockwaves.length; w++) {
                var sw = shockwaves[w];
                ctx.save();
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2.5;
                ctx.globalAlpha = Math.max(0, sw.alpha);
                ctx.beginPath();
                ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            // 6. Render Sliced Apples
            for (var a = 0; a < slicedApples.length; a++) {
                var sa = slicedApples[a];
                ctx.save();
                ctx.globalAlpha = Math.max(0, sa.alpha);
                ctx.translate(sa.x, sa.y);
                ctx.rotate(sa.rot);
                ctx.fillStyle = '#facc15';
                ctx.beginPath();
                ctx.arc(0, 0, 9, sa.isLeft ? Math.PI / 2 : -Math.PI / 2, sa.isLeft ? (3 * Math.PI) / 2 : Math.PI / 2);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            // 7. Render Shattered Target Shards
            for (var s = 0; s < targetShards.length; s++) {
                var sh = targetShards[s];
                ctx.save();
                ctx.globalAlpha = Math.max(0, sh.alpha);
                ctx.translate(sh.x, sh.y);
                ctx.rotate(sh.rot);
                ctx.fillStyle = sh.color;
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(-sh.size * 0.4, sh.size);
                ctx.lineTo(sh.size * 0.4, sh.size);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }

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
                ctx.font = 'bold 17px Outfit, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = fs.color || '#38bdf8';
                ctx.shadowColor = fs.color || '#38bdf8';
                ctx.shadowBlur = 8;
                ctx.fillText(fs.text, fs.x, fs.y);
                ctx.restore();
            }

            // 10. Tap to Throw Prompt
            if (flyingKnife === null && knivesInStack > 0) {
                ctx.save();
                ctx.font = '14px Outfit, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
                ctx.fillText('Click, Tap, or Space to Throw Knife', W / 2, KNIFE_START_Y + 52);
                ctx.restore();
            }
        },

        drawKnifeAt: function(x, y, isEmbedded) {
            ctx.save();
            ctx.translate(x, y);

            if (isEmbedded) {
                // Pointing inward toward (0, 0) center (along -y axis), handle pointing outwards (+y)
                // Embedded Blade
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.moveTo(-5, 0);
                ctx.lineTo(5, 0);
                ctx.lineTo(0, -16);
                ctx.closePath();
                ctx.fill();

                // Blade Guard
                ctx.fillStyle = '#7dd3fc';
                ctx.fillRect(-7, -2, 14, 3);

                // Protruding Handle
                var handleGrad = ctx.createLinearGradient(-4, 0, 4, 0);
                handleGrad.addColorStop(0, '#0284c7');
                handleGrad.addColorStop(0.5, '#38bdf8');
                handleGrad.addColorStop(1, '#0284c7');

                ctx.fillStyle = handleGrad;
                ctx.strokeStyle = '#7dd3fc';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(-4, 1, 8, 36, 3);
                ctx.fill();
                ctx.stroke();

                // Pommel
                ctx.fillStyle = '#f8fafc';
                ctx.beginPath();
                ctx.arc(0, 37, 3.5, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Pointing upward (-y)
                // Blade Tip & Bevel
                var bladeGrad = ctx.createLinearGradient(-6, 0, 6, 0);
                bladeGrad.addColorStop(0, '#0284c7');
                bladeGrad.addColorStop(0.5, '#7dd3fc');
                bladeGrad.addColorStop(1, '#0284c7');

                ctx.fillStyle = bladeGrad;
                ctx.beginPath();
                ctx.moveTo(0, -32);
                ctx.lineTo(-6, -10);
                ctx.lineTo(6, -10);
                ctx.closePath();
                ctx.fill();

                // Center Blade Spine Glow
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-1, -26, 2, 16);

                // Guard
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(-8, -10, 16, 3);

                // Handle
                var hGrad = ctx.createLinearGradient(-4, 0, 4, 0);
                hGrad.addColorStop(0, '#0284c7');
                hGrad.addColorStop(0.5, '#38bdf8');
                hGrad.addColorStop(1, '#0284c7');

                ctx.fillStyle = hGrad;
                ctx.strokeStyle = '#7dd3fc';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(-4, -7, 8, 28, 3);
                ctx.fill();
                ctx.stroke();

                // Pommel
                ctx.fillStyle = '#f8fafc';
                ctx.beginPath();
                ctx.arc(0, 22, 3.5, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        },

        bindEvents: function() {
            var self = this;

            // Click anywhere on canvas / arena
            $(canvas).on('click', function(e) {
                e.preventDefault();
                self.throwKnife();
            });

            // Touch anywhere on canvas
            canvas.addEventListener('touchstart', function(e) {
                e.preventDefault();
                self.throwKnife();
            }, { passive: false });

            // Keyboard Space / Arrow Up
            $(document).on('keydown', function(e) {
                if (e.which === 32 || e.which === 38) { // Space / Up Arrow
                    e.preventDefault();
                    self.throwKnife();
                }
            });

            $('#new-game-btn').on('click', function() {
                self.newGame();
            });
        }
    };

    $(document).ready(function() {
        KnifeThrow.init();
    });

    window.KnifeThrow = KnifeThrow;

})(window, jQuery);
