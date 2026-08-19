/* ==========================================================================
   GAME HUB - Rock-Paper-Scissors Reflex Engine (Best-of-5, Reflex Timer + AI)
   ========================================================================== */

(function(window, $) {
    'use strict';

    var ROUND_TIME = 5; // seconds per reflex round
    var isMultiplayer = false;
    var sessionId = null;
    var difficulty = "hard";
    var myPlayerName = "Player";
    var opponentPlayerName = "Opponent";

    var currentRound = 1;
    var myScore = 0;
    var opponentScore = 0;
    var myChoice = null;
    var opponentChoice = null;
    var isRoundActive = false;
    var timerInterval = null;
    var timeLeft = ROUND_TIME;
    var humanHistory = [];
    var isCallerP1Global = true;
    var localConnId = null;

    var choices = ["rock", "paper", "scissors"];

    var RPS = {
        init: function() {
            var urlParams = new URLSearchParams(window.location.search);
            sessionId = urlParams.get('session');
            difficulty = urlParams.get('diff') || 'hard';
            var p1Url = urlParams.get('p1') || '';
            var p2Url = urlParams.get('p2') || '';

            myPlayerName = window.App ? window.App.getPlayerName() : "Player";

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
            opponentPlayerName = "Bot (" + (difficulty.charAt(0).toUpperCase() + difficulty.slice(1)) + ")";
            $('#p1-name').text(myPlayerName);
            $('#p2-name').text(opponentPlayerName);
            $('#game-mode-badge').text('Best of 5 vs ' + opponentPlayerName);

            this.startNewSeries();
        },

        initMultiplayer: function(p1Url, p2Url) {
            $('#game-mode-badge').text('Best of 5 LAN Match');
            var self = this;
            var myName = window.App ? window.App.getPlayerName() : "Player";

            // Pre-initialize player roles from URL parameters
            var isP1 = true;
            if (p1Url && p2Url) {
                if (myName.toLowerCase() === p2Url.toLowerCase()) {
                    isP1 = false;
                }
            }
            isCallerP1Global = isP1;
            opponentPlayerName = isP1 ? (p2Url || "Opponent") : (p1Url || "Opponent");

            $('#p1-name').text(isP1 ? myName : (p1Url || "Player 1"));
            $('#p2-name').text(isP1 ? (p2Url || "Player 2") : myName);

            // Wire handlers BEFORE connection starts
            window.GameHubClient.init(function(hub) {
                hub.client.sessionState = function(state) {
                    localConnId = state.callerConnectionId || window.GameHubClient.getConnectionId();
                    isCallerP1Global = state.isP1;

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

                    self.startNewSeries();
                };

                hub.client.opponentEnteredSession = function(data) {
                    window.App.toast(data.displayName + " joined the arena!", "info");
                    if (isCallerP1Global) {
                        $('#p2-name').text(data.displayName);
                    } else {
                        $('#p1-name').text(data.displayName);
                    }
                };

                hub.client.rpsChoiceLocked = function() {
                    window.App.toast("Choice locked in! Waiting for opponent...", "info");
                    $('#arena-status-text').text('Waiting for opponent...');
                };

                hub.client.opponentReady = function() {
                    window.App.toast(opponentPlayerName + " has locked their pick!", "info");
                };

                hub.client.rpsRoundCompleted = function(res) {
                    var roundData = res.ExtraData;
                    var myPick = isCallerP1Global ? roundData.Player1Choice : roundData.Player2Choice;
                    var oppPick = isCallerP1Global ? roundData.Player2Choice : roundData.Player1Choice;

                    var myId = window.GameHubClient.getConnectionId();
                    var isWin = (roundData.WinnerPlayerId === myId);
                    var winnerNum = roundData.WinnerPlayerNumber; // 0=draw, 1=P1, 2=P2
                    var roundWinnerCode = isCallerP1Global ? winnerNum : (winnerNum === 1 ? 2 : (winnerNum === 2 ? 1 : 0));

                    self.revealRound(myPick, oppPick, res.IsGameOver, isWin, roundWinnerCode, roundData.IsDraw);
                };

                hub.client.rematchRequested = function() {
                    window.App.toast(opponentPlayerName + " wants a rematch! Click Rematch to accept.", "info");
                };

                hub.client.rematchStarted = function() {
                    window.App.hideGameModal();
                    window.App.toast("Rematch started!", "success");
                    self.startNewSeries();
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
                localConnId = connId;
                window.GameHubClient.hub.server.joinSession(sessionId, myName, 3, p1Url, p2Url);
            });
        },

        startNewSeries: function() {
            currentRound = 1;
            myScore = 0;
            opponentScore = 0;
            humanHistory = [];
            $('.round-dot').removeClass('dot-p1 dot-p2 dot-draw');
            this.renderScoreboard();
            this.startNewRound();
        },

        startNewRound: function() {
            isRoundActive = true;
            myChoice = null;
            opponentChoice = null;
            timeLeft = ROUND_TIME;

            $('.rps-choice-btn').removeClass('selected').prop('disabled', false);
            $('#round-number-text').text('Round ' + currentRound);
            $('#arena-status-text').text('Pick your weapon!');
            $('#p1-reveal-card, #p2-reveal-card').removeClass('revealed');
            $('#p1-reveal-icon').html('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>');
            $('#p2-reveal-icon').html('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>');

            this.startTimer();
        },

        startTimer: function() {
            var self = this;
            clearInterval(timerInterval);

            var totalCircumference = 283;
            $('#rps-timer-num').text(timeLeft);
            $('#rps-timer-bar').css('stroke-dashoffset', 0).removeClass('urgent');

            timerInterval = setInterval(function() {
                timeLeft -= 0.1;

                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    $('#rps-timer-num').text('0');
                    if (isRoundActive && !myChoice) {
                        var autoPick = choices[Math.floor(Math.random() * choices.length)];
                        self.handleChoice(autoPick);
                    }
                    return;
                }

                var secondsDisplay = Math.ceil(timeLeft);
                $('#rps-timer-num').text(secondsDisplay);

                var progress = (ROUND_TIME - timeLeft) / ROUND_TIME;
                var offset = totalCircumference * progress;
                $('#rps-timer-bar').css('stroke-dashoffset', offset);

                if (timeLeft <= 2.0) {
                    $('#rps-timer-bar').addClass('urgent');
                    if (window.GameAudio && Math.abs(timeLeft % 1) < 0.15) {
                        window.GameAudio.playTick();
                    }
                }
            }, 100);
        },

        bindEvents: function() {
            var self = this;

            $('.rps-choice-btn').on('click', function(e) {
                e.preventDefault();
                if (!isRoundActive || myChoice) return;
                var choice = $(this).data('choice');
                $(this).addClass('selected');
                $('.rps-choice-btn').prop('disabled', true);
                self.handleChoice(choice);
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

        handleChoice: function(choice) {
            myChoice = choice;
            humanHistory.push(choice);

            if (window.GameAudio) window.GameAudio.playClick();

            if (isMultiplayer) {
                if (window.GameHubClient.isConnected()) {
                    window.GameHubClient.hub.server.makeRPSChoice(sessionId, choice);
                } else {
                    window.App.toast("Reconnecting to match...", "warning");
                }
            } else {
                var self = this;
                var botChoice = this.getBotRPSMove(humanHistory, difficulty);
                opponentChoice = botChoice;

                clearInterval(timerInterval);
                setTimeout(function() {
                    self.evaluateSinglePlayerRound(myChoice, botChoice);
                }, 300);
            }
        },

        evaluateSinglePlayerRound: function(p1Choice, p2Choice) {
            var winner = this.determineWinner(p1Choice, p2Choice); // 0 = draw, 1 = p1, 2 = p2
            var isDraw = (winner === 0);
            var isWin = (winner === 1);

            var isSeriesOver = (myScore + (isWin ? 1 : 0) >= 3 || opponentScore + (winner === 2 ? 1 : 0) >= 3);
            var isSeriesWin = (myScore + (isWin ? 1 : 0) >= 3);

            this.revealRound(p1Choice, p2Choice, isSeriesOver, isSeriesWin, winner, isDraw);
        },

        revealRound: function(p1Pick, p2Pick, isSeriesOver, isSeriesWin, winnerCode, isDraw) {
            isRoundActive = false;
            clearInterval(timerInterval);

            if (winnerCode === 1) myScore++;
            else if (winnerCode === 2) opponentScore++;

            if (window.GameAudio) window.GameAudio.playClash();
            $('.rps-clash-arena').addClass('shake-element');
            setTimeout(function() { $('.rps-clash-arena').removeClass('shake-element'); }, 450);

            $('#p1-reveal-icon').html(this.getWeaponSvg(p1Pick));
            $('#p2-reveal-icon').html(this.getWeaponSvg(p2Pick));
            $('#p1-reveal-card, #p2-reveal-card').addClass('revealed');

            var statusMsg = isDraw ? "Round Draw!" : (winnerCode === 1 ? myPlayerName + " wins the round!" : opponentPlayerName + " wins the round!");
            $('#arena-status-text').text(statusMsg);

            this.updateRoundDot(currentRound, isDraw ? 'draw' : (winnerCode === 1 ? 'p1' : 'p2'));
            this.renderScoreboard();

            var self = this;
            if (isSeriesOver) {
                setTimeout(function() {
                    window.App.showGameModal({
                        title: isSeriesWin ? "Champion!" : "Match Lost!",
                        text: isSeriesWin ? "You won the Best-of-5 series (" + myScore + " - " + opponentScore + ")!" : opponentPlayerName + " won the series (" + opponentScore + " - " + myScore + ").",
                        isWin: isSeriesWin,
                        isDraw: false,
                        onRematch: function() {
                            if (isMultiplayer && window.GameHubClient.isConnected()) {
                                window.GameHubClient.hub.server.requestRematch(sessionId);
                                window.App.toast("Rematch requested. Waiting for opponent...", "info");
                            } else {
                                self.startNewSeries();
                            }
                        }
                    });
                }, 1100);
            } else {
                currentRound++;
                setTimeout(function() {
                    self.startNewRound();
                }, 1800);
            }
        },

        determineWinner: function(c1, c2) {
            if (c1 === c2) return 0;
            if ((c1 === 'rock' && c2 === 'scissors') ||
                (c1 === 'scissors' && c2 === 'paper') ||
                (c1 === 'paper' && c2 === 'rock')) {
                return 1;
            }
            return 2;
        },

        getWeaponSvg: function(choice) {
            if (choice === 'rock') {
                return '<svg xmlns="http://www.w3.org/2000/svg" class="rps-choice-svg" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M12 2l8 4v6c0 5.25-3.5 10-8 11-4.5-1-8-5.75-8-11V6l8-4z"/><circle cx="12" cy="12" r="3"/></svg>';
            } else if (choice === 'paper') {
                return '<svg xmlns="http://www.w3.org/2000/svg" class="rps-choice-svg" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
            } else {
                return '<svg xmlns="http://www.w3.org/2000/svg" class="rps-choice-svg" viewBox="0 0 24 24" fill="none" stroke="#fb7185" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>';
            }
        },

        renderScoreboard: function() {
            $('#p1-score-display').text(myScore);
            $('#p2-score-display').text(opponentScore);
        },

        updateRoundDot: function(roundNum, result) {
            var $dot = $('.round-dot[data-round="' + roundNum + '"]');
            $dot.removeClass('dot-p1 dot-p2 dot-draw');
            if (result === 'p1') $dot.addClass('dot-p1');
            else if (result === 'p2') $dot.addClass('dot-p2');
            else if (result === 'draw') $dot.addClass('dot-draw');
        },

        getBotRPSMove: function(history, diff) {
            if (diff === 'easy' || !history || history.length === 0) {
                return choices[Math.floor(Math.random() * choices.length)];
            }

            if (diff === 'normal') {
                var counts = { rock: 0, paper: 0, scissors: 0 };
                history.forEach(function(h) { counts[h]++; });
                var most = 'rock';
                if (counts.paper > counts[most]) most = 'paper';
                if (counts.scissors > counts[most]) most = 'scissors';

                if (Math.random() < 0.65) {
                    return this.getCounter(most);
                }
                return choices[Math.floor(Math.random() * choices.length)];
            }

            if (history.length >= 2) {
                var last = history[history.length - 1];
                var prev = history[history.length - 2];
                if (last === prev) {
                    var nextPred = (last === 'rock') ? 'paper' : (last === 'paper' ? 'scissors' : 'rock');
                    return this.getCounter(nextPred);
                }
            }

            var recent = history[history.length - 1];
            return this.getCounter(recent);
        },

        getCounter: function(move) {
            if (move === 'rock') return 'paper';
            if (move === 'paper') return 'scissors';
            return 'rock';
        }
    };

    $(document).ready(function() {
        RPS.init();
    });

    window.RPS = RPS;

})(window, jQuery);
