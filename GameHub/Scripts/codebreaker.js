/* ==========================================================================
   GAME HUB - Codebreaker: Cyber Cipher (Mastermind Deductive Logic Engine)
   Features:
   - 4-Slot & 5-Slot Secret Ciphers with 6-8 Glowing Cyber Gem Tokens
   - Multi-Instance Key Feedback Matching (🔴 Exact Match, ⚪ Color Match)
   - Laser Row Scanner Verification & Holographic Vault Unlock Animation
   - Real-time LAN Multiplayer Duel with Live Opponent Telemetry Radar
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

    // Config based on difficulty
    var CODE_LENGTH = 4;
    var MAX_ATTEMPTS = 9;
    var NUM_COLORS = 6;
    var ALLOW_DUPLICATES = true;

    // Gem Palette (100% Distinct Colors across spectrum - No similar shades)
    var GEM_COLORS = [
        { id: 0, name: "Ruby Red", color: "#ef4444", border: "#991b1b", glow: "rgba(239, 68, 68, 0.7)" },
        { id: 1, name: "Sapphire Blue", color: "#2563eb", border: "#1e40af", glow: "rgba(37, 99, 235, 0.7)" },
        { id: 2, name: "Emerald Green", color: "#10b981", border: "#065f46", glow: "rgba(16, 185, 129, 0.7)" },
        { id: 3, name: "Solar Yellow", color: "#facc15", border: "#a16207", glow: "rgba(250, 204, 21, 0.8)" },
        { id: 4, name: "Amethyst Purple", color: "#a855f7", border: "#6b21a8", glow: "rgba(168, 85, 247, 0.7)" },
        { id: 5, name: "Pearl White", color: "#f8fafc", border: "#94a3b8", glow: "rgba(255, 255, 255, 0.85)" },
        { id: 6, name: "Tangerine Orange", color: "#ea580c", border: "#9a3412", glow: "rgba(234, 88, 12, 0.7)" },
        { id: 7, name: "Neon Pink", color: "#ec4899", border: "#9d174d", glow: "rgba(236, 72, 153, 0.7)" }
    ];

    var secretCode = [];
    var currentAttempt = 0;
    var currentRowGuess = []; // Array of color ids
    var historyGuesses = []; // [{ guess: [], exact: 0, color: 0 }]
    var gameStartTime = Date.now();

    var Codebreaker = {
        init: function() {
            var urlParams = new URLSearchParams(window.location.search);
            sessionId = urlParams.get('session');
            difficulty = urlParams.get('diff') || 'medium';
            var p1Url = urlParams.get('p1') || '';
            var p2Url = urlParams.get('p2') || '';

            myPlayerName = window.App ? window.App.getPlayerName() : "Player";

            this.setupDifficulty();
            this.bindEvents();

            if (sessionId) {
                isMultiplayer = true;
                this.initMultiplayer(p1Url, p2Url);
            } else {
                isMultiplayer = false;
                this.initSinglePlayer();
            }
        },

        setupDifficulty: function() {
            if (difficulty === 'easy') {
                CODE_LENGTH = 4;
                MAX_ATTEMPTS = 10;
                NUM_COLORS = 6;
                ALLOW_DUPLICATES = false;
            } else if (difficulty === 'hard') {
                CODE_LENGTH = 5;
                MAX_ATTEMPTS = 8;
                NUM_COLORS = 8;
                ALLOW_DUPLICATES = true;
            } else {
                // Medium Standard
                CODE_LENGTH = 4;
                MAX_ATTEMPTS = 9;
                NUM_COLORS = 6;
                ALLOW_DUPLICATES = true;
            }
        },

        generateSecretCode: function(seed) {
            function seededRandom(s) {
                var x = Math.sin(s++) * 10000;
                return x - Math.floor(x);
            }

            var s = seed || Math.floor(Math.random() * 999999);
            var code = [];
            var availableColors = [];
            for (var i = 0; i < NUM_COLORS; i++) availableColors.push(i);

            while (code.length < CODE_LENGTH) {
                var randIdx = Math.floor(seededRandom(s + code.length * 13) * availableColors.length);
                var colorId = availableColors[randIdx];

                code.push(colorId);
                if (!ALLOW_DUPLICATES) {
                    availableColors.splice(randIdx, 1);
                }
            }

            return code;
        },

        initSinglePlayer: function() {
            opponentPlayerName = "Cyber AI";
            isP1 = true;

            $('#p1-name').text(myPlayerName);
            $('#p2-name').text(opponentPlayerName);
            $('#p1-avatar-letter').text(myPlayerName.charAt(0).toUpperCase());
            $('#p2-avatar-letter').text('AI');
            $('#game-mode-badge').text('🕵️ Codebreaker: ' + (difficulty.charAt(0).toUpperCase() + difficulty.slice(1)) + ' Cipher');

            $('#opponent-radar-panel').hide();

            this.resetGame();
        },

        initMultiplayer: function(p1Url, p2Url) {
            $('#game-mode-badge').text('⚔️ LAN Cipher Duel (Live Race)');
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
                hub.client.codebreakerProgressReceived = function(data) {
                    if (!data) return;
                    self.updateOpponentRadar(data);
                };

                hub.client.codebreakerGameFinished = function(result) {
                    var isMeWinner = (result.WinnerPlayerId === window.GameHubClient.hub.connection.id);
                    self.revealSecretVault(isMeWinner);
                    self.showGameOverModal(isMeWinner, result.ExtraData.winnerName, result.ExtraData.attemptsUsed);
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
                window.GameHubClient.hub.server.joinSession(sessionId, myName, 13, p1Url, p2Url);
            });

            // Deterministic session seed from SessionId hash
            var seed = 0;
            for (var i = 0; i < sessionId.length; i++) seed += sessionId.charCodeAt(i);
            this.resetGame(seed);
        },

        resetGame: function(seed) {
            // Generate a fresh new random secret cipher every round
            if (isMultiplayer && seed) {
                secretCode = this.generateSecretCode(seed);
            } else {
                secretCode = this.generateSecretCode();
            }

            currentAttempt = 0;
            currentRowGuess = [];
            historyGuesses = [];
            isGameOver = false;
            gameStartTime = Date.now();

            $('#vault-status-label').text("🔒 ENCRYPTED CIPHER VAULT").css('color', '#94a3b8');

            this.renderPaletteDock();
            this.renderTerminalRows();
            this.updateCurrentRowDisplay();
            this.updateAttemptCounter();

            // Hide Secret Vault Pegs
            var $vaultSlots = $('#vault-slots');
            $vaultSlots.empty();
            for (var i = 0; i < CODE_LENGTH; i++) {
                $vaultSlots.append('<div class="vault-peg-slot locked"><span class="lock-icon">🔒</span></div>');
            }
        },

        renderPaletteDock: function() {
            var $dock = $('#palette-dock');
            $dock.empty();

            for (var i = 0; i < NUM_COLORS; i++) {
                var gem = GEM_COLORS[i];
                var $btn = $('<button type="button" class="gem-btn" data-color="' + gem.id + '" style="background: radial-gradient(circle at 35% 35%, #fff 0%, ' + gem.color + ' 45%, ' + gem.border + ' 100%); box-shadow: 0 0 16px ' + gem.glow + ';" title="' + gem.name + '"></button>');
                $dock.append($btn);
            }
        },

        renderTerminalRows: function() {
            var $container = $('#terminal-rows-container');
            $container.empty();

            for (var r = 0; r < MAX_ATTEMPTS; r++) {
                var $row = $('<div class="cipher-row" id="cipher-row-' + r + '"></div>');
                var $num = $('<div class="row-num-badge">' + (r + 1) + '</div>');
                var $slots = $('<div class="row-peg-slots" id="row-slots-' + r + '"></div>');

                for (var s = 0; s < CODE_LENGTH; s++) {
                    $slots.append('<div class="guess-peg-slot" data-slot="' + s + '"></div>');
                }

                // Key Clue Peg Grid (2x2 or 2x3)
                var $keys = $('<div class="row-key-grid" id="row-keys-' + r + '"></div>');
                for (var k = 0; k < CODE_LENGTH; k++) {
                    $keys.append('<div class="key-peg-hole" data-key="' + k + '"></div>');
                }

                $row.append($num).append($slots).append($keys);
                $container.append($row);
            }
        },

        bindEvents: function() {
            var self = this;

            // Click gem from dock
            $('#palette-dock').on('click', '.gem-btn', function(e) {
                e.preventDefault();
                if (isGameOver) return;

                var colorId = parseInt($(this).data('color'), 10);
                self.addPegToCurrentRow(colorId);
            });

            // Click slot in current row to clear it
            $('#terminal-rows-container').on('click', '.cipher-row.active-row .guess-peg-slot', function(e) {
                e.preventDefault();
                if (isGameOver) return;

                var slotIdx = parseInt($(this).data('slot'), 10);
                self.removePegAtSlot(slotIdx);
            });

            // Backspace / Clear
            $('#clear-peg-btn').on('click', function(e) {
                e.preventDefault();
                if (isGameOver) return;
                self.popLastPeg();
            });

            // Submit / Scan Row
            $('#submit-guess-btn').on('click', function(e) {
                e.preventDefault();
                if (isGameOver) return;
                self.submitCurrentGuess();
            });

            // Forfeit
            $('#forfeit-game-btn').on('click', function(e) {
                e.preventDefault();
                if (confirm("Exit Codebreaker Match?")) {
                    if (isMultiplayer && window.GameHubClient.isConnected()) {
                        window.GameHubClient.hub.server.leaveGame(sessionId);
                    }
                    window.location.href = "../Default.aspx";
                }
            });
        },

        addPegToCurrentRow: function(colorId) {
            if (currentRowGuess.length >= CODE_LENGTH) return;

            if (!ALLOW_DUPLICATES && currentRowGuess.indexOf(colorId) !== -1) {
                if (window.App) window.App.toast("Duplicates not allowed in Easy mode!", "warning");
                return;
            }

            currentRowGuess.push(colorId);
            if (window.GameAudio && window.GameAudio.playPegPlace) {
                window.GameAudio.playPegPlace();
            }

            this.updateCurrentRowDisplay();
        },

        removePegAtSlot: function(slotIdx) {
            if (slotIdx >= 0 && slotIdx < currentRowGuess.length) {
                currentRowGuess.splice(slotIdx, 1);
                if (window.GameAudio && window.GameAudio.playPegPlace) {
                    window.GameAudio.playPegPlace();
                }
                this.updateCurrentRowDisplay();
            }
        },

        popLastPeg: function() {
            if (currentRowGuess.length > 0) {
                currentRowGuess.pop();
                if (window.GameAudio && window.GameAudio.playPegPlace) {
                    window.GameAudio.playPegPlace();
                }
                this.updateCurrentRowDisplay();
            }
        },

        updateCurrentRowDisplay: function() {
            // Update active styling
            $('.cipher-row').removeClass('active-row');
            var $activeRow = $('#cipher-row-' + currentAttempt);
            $activeRow.addClass('active-row');

            var $slots = $('#row-slots-' + currentAttempt).find('.guess-peg-slot');
            $slots.empty().removeClass('filled').removeAttr('style');

            for (var i = 0; i < CODE_LENGTH; i++) {
                var $slot = $($slots[i]);
                if (i < currentRowGuess.length) {
                    var gem = GEM_COLORS[currentRowGuess[i]];
                    $slot.addClass('filled')
                         .css({
                             'background': 'radial-gradient(circle at 35% 35%, #fff 0%, ' + gem.color + ' 45%, ' + gem.border + ' 100%)',
                             'box-shadow': '0 0 14px ' + gem.glow,
                             'border-color': gem.border
                         });
                }
            }

            // Enable/disable submit button
            var isComplete = (currentRowGuess.length === CODE_LENGTH);
            $('#submit-guess-btn').prop('disabled', !isComplete);
            if (isComplete) {
                $('#submit-guess-btn').addClass('ready-pulse');
            } else {
                $('#submit-guess-btn').removeClass('ready-pulse');
            }
        },

        evaluateGuess: function(guess, code) {
            var exactMatches = 0;
            var colorMatches = 0;

            var codeUsed = [];
            var guessUsed = [];
            for (var i = 0; i < CODE_LENGTH; i++) {
                codeUsed[i] = false;
                guessUsed[i] = false;
            }

            // 1st Pass: Exact position matches (Red keys)
            for (var i = 0; i < CODE_LENGTH; i++) {
                if (guess[i] === code[i]) {
                    exactMatches++;
                    codeUsed[i] = true;
                    guessUsed[i] = true;
                }
            }

            // 2nd Pass: Color exists elsewhere in code (White keys)
            for (var i = 0; i < CODE_LENGTH; i++) {
                if (!guessUsed[i]) {
                    for (var j = 0; j < CODE_LENGTH; j++) {
                        if (!codeUsed[j] && guess[i] === code[j]) {
                            colorMatches++;
                            codeUsed[j] = true;
                            break;
                        }
                    }
                }
            }

            return {
                exact: exactMatches,
                color: colorMatches
            };
        },

        submitCurrentGuess: function() {
            if (currentRowGuess.length !== CODE_LENGTH || isGameOver) return;

            var feedback = this.evaluateGuess(currentRowGuess, secretCode);
            historyGuesses.push({
                guess: currentRowGuess.slice(),
                exact: feedback.exact,
                color: feedback.color
            });

            if (window.GameAudio && window.GameAudio.playCodeScan) {
                window.GameAudio.playCodeScan();
            }

            var self = this;
            var $row = $('#cipher-row-' + currentAttempt);
            $row.addClass('scanning');

            // Render Key Clue Pegs
            var $keyHoles = $('#row-keys-' + currentAttempt).find('.key-peg-hole');
            var keyIdx = 0;

            for (var k = 0; k < feedback.exact; k++) {
                $($keyHoles[keyIdx]).addClass('key-exact'); // 🔴 Red
                keyIdx++;
            }
            for (var k = 0; k < feedback.color; k++) {
                $($keyHoles[keyIdx]).addClass('key-color'); // ⚪ White
                keyIdx++;
            }

            // Transmit progress in Multiplayer
            if (isMultiplayer && window.GameHubClient.isConnected()) {
                window.GameHubClient.hub.server.sendCodebreakerProgress(sessionId, {
                    attempt: currentAttempt + 1,
                    exact: feedback.exact,
                    color: feedback.color
                });
            }

            // Check Win Condition
            if (feedback.exact === CODE_LENGTH) {
                this.handleWin();
                return;
            }

            currentAttempt++;
            currentRowGuess = [];

            if (currentAttempt >= MAX_ATTEMPTS) {
                this.handleLoss();
                return;
            }

            setTimeout(function() {
                $row.removeClass('scanning');
                self.updateCurrentRowDisplay();
                self.updateAttemptCounter();
            }, 300);
        },

        updateAttemptCounter: function() {
            $('#attempts-left-badge').text((MAX_ATTEMPTS - currentAttempt) + ' Attempts Left');
        },

        updateOpponentRadar: function(data) {
            $('#opponent-radar-attempt').text('Row ' + data.attempt + ' / ' + MAX_ATTEMPTS);
            var clueText = '🔴 ' + data.exact + ' Exact  |  ⚪ ' + data.color + ' Color';
            $('#opponent-radar-clues').text(clueText);

            var pct = Math.round((data.attempt / MAX_ATTEMPTS) * 100);
            $('#opponent-radar-progress-bar').css('width', pct + '%');
        },

        handleWin: function() {
            isGameOver = true;
            this.revealSecretVault();

            if (window.GameAudio && window.GameAudio.playCipherSolved) {
                window.GameAudio.playCipherSolved();
            }

            var elapsedSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
            var attemptsUsed = currentAttempt + 1;

            if (isMultiplayer && window.GameHubClient.isConnected()) {
                window.GameHubClient.hub.server.finishCodebreakerGame(sessionId, attemptsUsed, elapsedSeconds);
            } else {
                var self = this;
                setTimeout(function() {
                    self.showGameOverModal(true, myPlayerName, attemptsUsed);
                }, 500);
            }
        },

        handleLoss: function() {
            isGameOver = true;
            this.revealSecretVault(false);

            if (window.GameAudio && window.GameAudio.playKeyPegPop) {
                window.GameAudio.playKeyPegPop(false);
            }

            var self = this;
            setTimeout(function() {
                self.showGameOverModal(false, opponentPlayerName, MAX_ATTEMPTS);
            }, 600);
        },

        revealSecretVault: function(isSuccess) {
            var $vaultSlots = $('#vault-slots');
            $vaultSlots.empty();

            for (var i = 0; i < CODE_LENGTH; i++) {
                var gem = GEM_COLORS[secretCode[i]];
                var $slot = $('<div class="vault-peg-slot unlocked" style="background: radial-gradient(circle at 35% 35%, #fff 0%, ' + gem.color + ' 45%, ' + gem.border + ' 100%); box-shadow: 0 0 22px ' + gem.glow + '; border: 2px solid ' + gem.border + ';" title="' + gem.name + '"></div>');
                $vaultSlots.append($slot);
            }

            if (isSuccess) {
                $('#vault-status-label').text("🔓 CIPHER DECRYPTED").css('color', '#34d399');
            } else {
                $('#vault-status-label').text("🔓 CIPHER REVEALED (MAINFRAME LOCK)").css('color', '#fb7185');
            }
        },

        showGameOverModal: function(isWin, winnerName, attempts) {
            var self = this;
            var secretNames = secretCode.map(function(cId) {
                return GEM_COLORS[cId].name;
            }).join(' - ');

            var secretBadgesHtml = '<div style="display: flex; justify-content: center; gap: 8px; margin: 12px 0;">';
            secretCode.forEach(function(cId) {
                var gem = GEM_COLORS[cId];
                secretBadgesHtml += '<div style="width: 28px; height: 28px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #fff 0%, ' + gem.color + ' 45%, ' + gem.border + ' 100%); box-shadow: 0 0 10px ' + gem.glow + '; border: 1.5px solid ' + gem.border + ';" title="' + gem.name + '"></div>';
            });
            secretBadgesHtml += '</div>';

            var modalText = isWin 
                ? ("Brilliant deduction! You cracked the secret cipher in " + attempts + " attempts!" + secretBadgesHtml)
                : ("Out of attempts! The secret cipher was:<br/><strong>" + secretNames + "</strong>" + secretBadgesHtml);

            window.App.showGameModal({
                title: isWin ? "🏆 Cipher Cracked!" : "🔒 Decryption Failed!",
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
        Codebreaker.init();
    });

    window.Codebreaker = Codebreaker;

})(window, jQuery);
