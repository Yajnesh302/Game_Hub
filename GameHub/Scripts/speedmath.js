/* ==========================================================================
   GAME HUB - Speed Math Arena: High-Octane Mental Arithmetic Engine
   Operations: Addition (+), Subtraction (-), Multiplication (×), Division (÷), Mixed
   Difficulties: Easy, Medium, Hard (Master)
   Game Modes: 60s Blitz, 10-Question Sprint, Survival Streak, LAN Multiplayer Duel
   ========================================================================== */

(function(window, $) {
    'use strict';

    var isMultiplayer = false;
    var sessionId = null;
    var operation = "mix"; // add, sub, mul, div, mix
    var difficulty = "medium"; // easy, medium, hard
    var gameMode = "blitz"; // blitz (60s), sprint (10 Qs), survival
    var myPlayerName = "Player";
    var opponentPlayerName = "Bot";
    var isP1 = true;

    // PRNG for Deterministic Synchronized Questions
    var seed = 123456;
    function seededRandom() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    }

    // Match State
    var currentQIndex = 0;
    var currentQuestion = null;
    var score = 0;
    var opponentScore = 0;
    var streak = 0;
    var opponentStreak = 0;
    var bestStreak = 0;
    var totalAnswered = 0;
    var correctCount = 0;
    var isGameActive = false;

    // Timers
    var timeRemaining = 60.0;
    var maxTime = 60.0;
    var timerInterval = null;
    var questionStartTime = 0;
    var reactionTimes = [];

    // Particle FX Canvas
    var canvas, ctx, particles = [];

    var SpeedMath = {
        init: function() {
            canvas = document.getElementById('math-fx-canvas');
            if (canvas) ctx = canvas.getContext('2d');

            var urlParams = new URLSearchParams(window.location.search);
            sessionId = urlParams.get('session');
            operation = urlParams.get('op') || 'mix';
            difficulty = urlParams.get('diff') || 'medium';
            gameMode = urlParams.get('mode') || 'blitz';
            var p1Url = urlParams.get('p1') || '';
            var p2Url = urlParams.get('p2') || '';

            myPlayerName = window.App ? window.App.getPlayerName() : "Player";

            this.initParticles();
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
            opponentPlayerName = "Math Bot (" + (difficulty.charAt(0).toUpperCase() + difficulty.slice(1)) + ")";
            seed = Math.floor(Math.random() * 900000) + 100000;

            $('#p1-name').text(myPlayerName);
            $('#p2-name').text(opponentPlayerName);
            $('#p1-avatar-letter').text(myPlayerName.charAt(0).toUpperCase());
            $('#p2-avatar-letter').text(opponentPlayerName.charAt(0).toUpperCase());
            $('#game-mode-badge').text('⚡ ' + this.getModeTitle());

            this.startMatch();
        },

        initMultiplayer: function(p1Url, p2Url) {
            $('#game-mode-badge').text('⚔️ LAN Math Duel: ' + this.getModeTitle());
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
                hub.client.mathAnswerProcessed = function(data) {
                    if (data.isP1) {
                        if (!isP1) {
                            opponentScore = data.p1Score;
                            opponentStreak = data.p1Streak;
                            self.updateOpponentHUD();
                        }
                    } else {
                        if (isP1) {
                            opponentScore = data.p2Score;
                            opponentStreak = data.p2Streak;
                            self.updateOpponentHUD();
                        }
                    }
                };

                hub.client.mathGameFinished = function(result) {
                    self.showGameOverModal(result.ExtraData);
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
                    self.startMatch();
                };

                hub.client.opponentLeft = function(data) {
                    window.App.showGameModal({
                        title: "Opponent Disconnected",
                        text: data.message,
                        isWin: true,
                        onRematch: function() {
                            window.location.href = "../Default.aspx";
                        }
                    });
                };
            }, function(connId) {
                window.GameHubClient.hub.server.joinSession(sessionId, myName, 10, p1Url, p2Url);
            });

            this.startMatch();
        },

        getModeTitle: function() {
            var opNames = { add: "Addition", sub: "Subtraction", mul: "Multiplication", div: "Division", mix: "Mixed Operations" };
            var modeNames = { blitz: "60s Blitz", sprint: "10-Q Sprint", survival: "Survival Streak" };
            return (opNames[operation] || "Math") + " (" + (modeNames[gameMode] || "Blitz") + " - " + difficulty.toUpperCase() + ")";
        },

        startMatch: function() {
            isGameActive = true;
            currentQIndex = 0;
            score = 0;
            opponentScore = 0;
            streak = 0;
            opponentStreak = 0;
            bestStreak = 0;
            totalAnswered = 0;
            correctCount = 0;
            reactionTimes = [];

            if (gameMode === 'blitz') {
                maxTime = 60.0;
                timeRemaining = 60.0;
            } else if (gameMode === 'survival') {
                maxTime = 10.0;
                timeRemaining = 10.0;
            } else {
                maxTime = 90.0;
                timeRemaining = 0.0; // counts up in sprint
            }

            this.updateHUD();
            this.nextQuestion();
            this.startTimer();

            if (!isMultiplayer && gameMode === 'blitz') {
                this.startBotSimulation();
            }
        },

        startTimer: function() {
            var self = this;
            if (timerInterval) clearInterval(timerInterval);

            var lastTick = performance.now();
            timerInterval = setInterval(function() {
                if (!isGameActive) return;
                var now = performance.now();
                var delta = (now - lastTick) / 1000;
                lastTick = now;

                if (gameMode === 'sprint') {
                    timeRemaining += delta;
                    self.updateTimerUI();
                } else {
                    timeRemaining = Math.max(0, timeRemaining - delta);
                    self.updateTimerUI();

                    if (timeRemaining <= 5.0 && Math.floor(timeRemaining * 2) % 2 === 0) {
                        if (window.GameAudio && window.GameAudio.playMathCountdown) {
                            window.GameAudio.playMathCountdown();
                        }
                    }

                    if (timeRemaining <= 0) {
                        self.handleTimeExpired();
                    }
                }
            }, 100);
        },

        updateTimerUI: function() {
            var pct = (gameMode === 'sprint') ? 1.0 : (timeRemaining / maxTime);
            var circle = document.getElementById('timer-ring-progress');
            if (circle) {
                var circumference = 2 * Math.PI * 44; // r=44
                var offset = circumference * (1 - pct);
                circle.style.strokeDashoffset = offset;
                circle.style.stroke = (pct < 0.25) ? '#f43f5e' : (pct < 0.5 ? '#f59e0b' : '#38bdf8');
            }

            var timeText = (gameMode === 'sprint') ? timeRemaining.toFixed(1) + 's' : Math.ceil(timeRemaining) + 's';
            $('#timer-text').text(timeText);
        },

        generateQuestion: function(index) {
            var op = operation;
            if (op === 'mix') {
                var ops = ['add', 'sub', 'mul', 'div'];
                op = ops[Math.floor(seededRandom() * ops.length)];
            }

            var num1 = 1, num2 = 1, answer = 2, symbol = "+", questionText = "";

            if (op === 'add') {
                symbol = "+";
                if (difficulty === 'easy') {
                    num1 = Math.floor(seededRandom() * 18) + 2;
                    num2 = Math.floor(seededRandom() * 18) + 2;
                } else if (difficulty === 'medium') {
                    num1 = Math.floor(seededRandom() * 75) + 15;
                    num2 = Math.floor(seededRandom() * 75) + 15;
                } else {
                    num1 = Math.floor(seededRandom() * 450) + 75;
                    num2 = Math.floor(seededRandom() * 450) + 75;
                }
                answer = num1 + num2;
                questionText = num1 + " + " + num2;
            } else if (op === 'sub') {
                symbol = "−";
                if (difficulty === 'easy') {
                    num1 = Math.floor(seededRandom() * 20) + 6;
                    num2 = Math.floor(seededRandom() * (num1 - 2)) + 1;
                } else if (difficulty === 'medium') {
                    num1 = Math.floor(seededRandom() * 90) + 30;
                    num2 = Math.floor(seededRandom() * (num1 - 10)) + 5;
                } else {
                    num1 = Math.floor(seededRandom() * 750) + 150;
                    num2 = Math.floor(seededRandom() * (num1 - 50)) + 25;
                }
                answer = num1 - num2;
                questionText = num1 + " − " + num2;
            } else if (op === 'mul') {
                symbol = "×";
                if (difficulty === 'easy') {
                    num1 = Math.floor(seededRandom() * 9) + 2;
                    num2 = Math.floor(seededRandom() * 9) + 2;
                } else if (difficulty === 'medium') {
                    num1 = Math.floor(seededRandom() * 14) + 4;
                    num2 = Math.floor(seededRandom() * 14) + 4;
                } else {
                    num1 = Math.floor(seededRandom() * 25) + 11;
                    num2 = Math.floor(seededRandom() * 20) + 6;
                }
                answer = num1 * num2;
                questionText = num1 + " × " + num2;
            } else if (op === 'div') {
                symbol = "÷";
                var divisor = 2, quotient = 2;
                if (difficulty === 'easy') {
                    divisor = Math.floor(seededRandom() * 8) + 2;
                    quotient = Math.floor(seededRandom() * 9) + 2;
                } else if (difficulty === 'medium') {
                    divisor = Math.floor(seededRandom() * 12) + 3;
                    quotient = Math.floor(seededRandom() * 15) + 3;
                } else {
                    divisor = Math.floor(seededRandom() * 22) + 6;
                    quotient = Math.floor(seededRandom() * 30) + 8;
                }
                num1 = divisor * quotient;
                num2 = divisor;
                answer = quotient;
                questionText = num1 + " ÷ " + num2;
            }

            // Generate 3 clever distractors
            var choices = [answer];
            var offsets = [-1, 1, -2, 2, -10, 10, -5, 5, -3, 3];

            while (choices.length < 4) {
                var off = offsets[Math.floor(seededRandom() * offsets.length)];
                var cand = answer + off;
                if (cand < 0 && answer >= 0) cand = answer + Math.abs(off) + 2;
                if (choices.indexOf(cand) === -1) {
                    choices.push(cand);
                }
            }

            // Shuffle choices deterministically
            for (var i = choices.length - 1; i > 0; i--) {
                var j = Math.floor(seededRandom() * (i + 1));
                var temp = choices[i];
                choices[i] = choices[j];
                choices[j] = temp;
            }

            return {
                text: questionText,
                symbol: symbol,
                num1: num1,
                num2: num2,
                answer: answer,
                choices: choices,
                correctIndex: choices.indexOf(answer)
            };
        },

        nextQuestion: function() {
            if (!isGameActive) return;

            if (gameMode === 'sprint' && currentQIndex >= 10) {
                this.handleSprintFinish();
                return;
            }

            currentQuestion = this.generateQuestion(currentQIndex);
            currentQIndex++;
            questionStartTime = performance.now();

            if (gameMode === 'survival') {
                // Decay timer per question
                maxTime = Math.max(3.0, 10.0 - (currentQIndex * 0.35));
                timeRemaining = maxTime;
            }

            $('#question-counter').text('Question ' + currentQIndex + (gameMode === 'sprint' ? ' / 10' : ''));
            $('#equation-display').html(currentQuestion.text + ' = <span style="color: var(--accent-cyan);">?</span>');

            var $grid = $('#answers-grid');
            $grid.empty();

            currentQuestion.choices.forEach(function(val, idx) {
                var keyHint = (idx + 1);
                var btn = $('<button type="button" class="math-answer-btn" data-index="' + idx + '" data-val="' + val + '">' +
                    '<span class="btn-num-hint">[' + keyHint + ']</span>' +
                    '<span class="btn-val">' + val + '</span>' +
                    '</button>');
                $grid.append(btn);
            });
        },

        handleAnswer: function(chosenIndex) {
            if (!isGameActive || !currentQuestion) return;

            var timeTaken = (performance.now() - questionStartTime) / 1000;
            reactionTimes.push(timeTaken);
            totalAnswered++;

            var isCorrect = (chosenIndex === currentQuestion.correctIndex);
            var $chosenBtn = $('.math-answer-btn[data-index="' + chosenIndex + '"]');

            if (isCorrect) {
                correctCount++;
                streak++;
                if (streak > bestStreak) bestStreak = streak;

                // Multiplier based on streak
                var mult = 1;
                if (streak >= 10) mult = 5;
                else if (streak >= 6) mult = 3;
                else if (streak >= 3) mult = 2;

                // Speed bonus: faster answer = more base points
                var speedBonus = Math.max(10, Math.round(100 - (timeTaken * 25)));
                var pointsEarned = (100 + speedBonus) * mult;
                score += pointsEarned;

                $chosenBtn.addClass('btn-correct');
                this.spawnParticles(pointsEarned);

                if (streak >= 5 && streak % 5 === 0) {
                    if (window.GameAudio && window.GameAudio.playMathStreak) window.GameAudio.playMathStreak();
                } else {
                    if (window.GameAudio && window.GameAudio.playMathCorrect) window.GameAudio.playMathCorrect(streak);
                }

                if (isMultiplayer && window.GameHubClient.isConnected()) {
                    window.GameHubClient.hub.server.submitMathAnswer(sessionId, pointsEarned, streak, true);
                }

                this.updateHUD();
                var self = this;
                setTimeout(function() {
                    self.nextQuestion();
                }, 180);
            } else {
                streak = 0;
                $chosenBtn.addClass('btn-wrong');
                $('.math-answer-btn[data-index="' + currentQuestion.correctIndex + '"]').addClass('btn-correct');

                if (window.GameAudio && window.GameAudio.playMathWrong) {
                    window.GameAudio.playMathWrong();
                }

                if (isMultiplayer && window.GameHubClient.isConnected()) {
                    window.GameHubClient.hub.server.submitMathAnswer(sessionId, 0, 0, false);
                }

                this.updateHUD();

                if (gameMode === 'survival') {
                    var self = this;
                    setTimeout(function() {
                        self.handleSurvivalDefeat();
                    }, 500);
                    return;
                }

                var self = this;
                setTimeout(function() {
                    self.nextQuestion();
                }, 380);
            }
        },

        startBotSimulation: function() {
            var self = this;
            var botInterval = setInterval(function() {
                if (!isGameActive) {
                    clearInterval(botInterval);
                    return;
                }

                // Bot answers with accuracy based on difficulty
                var botAccuracy = (difficulty === 'hard') ? 0.94 : (difficulty === 'medium' ? 0.82 : 0.65);
                var isBotCorrect = Math.random() < botAccuracy;

                if (isBotCorrect) {
                    opponentStreak++;
                    var mult = (opponentStreak >= 6 ? 3 : (opponentStreak >= 3 ? 2 : 1));
                    opponentScore += (120 * mult);
                } else {
                    opponentStreak = 0;
                }

                self.updateOpponentHUD();
            }, (difficulty === 'hard' ? 2100 : (difficulty === 'medium' ? 2700 : 3400)));
        },

        updateHUD: function() {
            $('#p1-score-display').text(score);
            $('#streak-badge-text').text(streak > 1 ? (streak + 'x STREAK 🔥') : '');

            var multText = "1x";
            if (streak >= 10) multText = "5x ULTRA";
            else if (streak >= 6) multText = "3x SUPER";
            else if (streak >= 3) multText = "2x COMBO";

            $('#multiplier-text').text(multText);
            $('#multiplier-text').toggleClass('active-multi', streak >= 3);
        },

        updateOpponentHUD: function() {
            $('#p2-score-display').text(opponentScore);
            $('#p2-streak-badge').text(opponentStreak > 2 ? (opponentStreak + 'x Streak') : '');
        },

        handleTimeExpired: function() {
            isGameActive = false;
            if (timerInterval) clearInterval(timerInterval);

            if (isMultiplayer && window.GameHubClient.isConnected()) {
                window.GameHubClient.hub.server.finishMathGame(sessionId);
            } else {
                this.showSinglePlayerResults();
            }
        },

        handleSprintFinish: function() {
            isGameActive = false;
            if (timerInterval) clearInterval(timerInterval);

            if (isMultiplayer && window.GameHubClient.isConnected()) {
                window.GameHubClient.hub.server.finishMathGame(sessionId);
            } else {
                this.showSinglePlayerResults();
            }
        },

        handleSurvivalDefeat: function() {
            isGameActive = false;
            if (timerInterval) clearInterval(timerInterval);
            this.showSinglePlayerResults("Survival Run Ended!");
        },

        showSinglePlayerResults: function(customTitle) {
            var self = this;
            var acc = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
            var avgTime = reactionTimes.length > 0 ? (reactionTimes.reduce(function(a, b) { return a + b; }, 0) / reactionTimes.length).toFixed(2) : "0.00";

            var isWin = score >= opponentScore;
            var title = customTitle || (isWin ? "🏆 Victory Champion!" : "Match Complete!");
            var msg = "Final Score: " + score + " pts | Accuracy: " + acc + "% (" + correctCount + "/" + totalAnswered + ") | Best Streak: " + bestStreak + " 🔥 | Avg Speed: " + avgTime + "s";

            window.App.showGameModal({
                title: title,
                text: msg,
                isWin: isWin,
                onRematch: function() {
                    self.startMatch();
                }
            });
        },

        showGameOverModal: function(extra) {
            var self = this;
            var myFinal = isP1 ? extra.p1FinalScore : extra.p2FinalScore;
            var oppFinal = isP1 ? extra.p2FinalScore : extra.p1FinalScore;
            var isWin = myFinal > oppFinal;
            var isDraw = myFinal === oppFinal;

            window.App.showGameModal({
                title: isDraw ? "Tie Game!" : (isWin ? "🏆 LAN Math Champion!" : "Match Defeat!"),
                text: isDraw ? "Tied at " + myFinal + " pts!" : (isWin ? "You won with " + myFinal + " pts against " + opponentPlayerName + " (" + oppFinal + " pts)!" : opponentPlayerName + " won (" + oppFinal + " - " + myFinal + " pts)."),
                isWin: isWin,
                isDraw: isDraw,
                onRematch: function() {
                    if (window.GameHubClient.isConnected()) {
                        window.GameHubClient.hub.server.requestRematch(sessionId);
                        window.App.toast("Rematch requested. Waiting for opponent...", "info");
                    }
                }
            });
        },

        bindEvents: function() {
            var self = this;

            $(document).on('click', '.math-answer-btn', function(e) {
                e.preventDefault();
                var idx = parseInt($(this).data('index'), 10);
                self.handleAnswer(idx);
            });

            $(document).on('keydown', function(e) {
                if (!isGameActive) return;
                var key = e.key;
                if (key === '1' || key === 'Numpad1') self.handleAnswer(0);
                else if (key === '2' || key === 'Numpad2') self.handleAnswer(1);
                else if (key === '3' || key === 'Numpad3') self.handleAnswer(2);
                else if (key === '4' || key === 'Numpad4') self.handleAnswer(3);
            });

            $('#forfeit-game-btn').on('click', function(e) {
                e.preventDefault();
                if (confirm("Forfeit and return to menu?")) {
                    if (isMultiplayer && window.GameHubClient.isConnected()) {
                        window.GameHubClient.hub.server.leaveGame(sessionId);
                    }
                    window.location.href = "../Default.aspx";
                }
            });
        },

        initParticles: function() {
            if (!canvas) return;
            particles = [];
            var self = this;

            function renderParticles() {
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    for (var i = particles.length - 1; i >= 0; i--) {
                        var p = particles[i];
                        p.x += p.vx;
                        p.y += p.vy;
                        p.vy += 0.2;
                        p.alpha -= 0.03;
                        p.scale *= 0.97;

                        if (p.alpha <= 0) {
                            particles.splice(i, 1);
                            continue;
                        }

                        ctx.save();
                        ctx.globalAlpha = p.alpha;
                        ctx.fillStyle = p.color;
                        ctx.shadowColor = p.color;
                        ctx.shadowBlur = 10;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size * p.scale, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    }
                }
                requestAnimationFrame(renderParticles);
            }
            requestAnimationFrame(renderParticles);
        },

        spawnParticles: function(points) {
            if (!canvas) return;
            var cx = canvas.width / 2;
            var cy = canvas.height / 2;
            var colors = ['#38bdf8', '#34d399', '#fbbf24', '#f43f5e', '#a855f7'];

            for (var i = 0; i < 28; i++) {
                var angle = Math.random() * Math.PI * 2;
                var speed = Math.random() * 8.0 + 3.0;
                particles.push({
                    x: cx + (Math.random() * 80 - 40),
                    y: cy + (Math.random() * 40 - 20),
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 2.0,
                    size: Math.random() * 5.0 + 2.5,
                    scale: 1.0,
                    alpha: 1.0,
                    color: colors[Math.floor(Math.random() * colors.length)]
                });
            }
        }
    };

    $(document).ready(function() {
        SpeedMath.init();
    });

    window.SpeedMath = SpeedMath;

})(window, jQuery);
