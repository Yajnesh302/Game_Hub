/* ==========================================================================
   GAME HUB - Web Audio API Synthesized Sound System (100% Offline, Zero Assets)
   ========================================================================== */

(function(window) {
    'use strict';

    var AudioContextClass = window.AudioContext || window.webkitAudioContext;
    var ctx = null;
    var isMuted = false;

    // Load persisted sound preference
    try {
        var savedMute = localStorage.getItem('gamehub_muted');
        if (savedMute === 'true') {
            isMuted = true;
        }
    } catch(e) {}

    function getContext() {
        if (!ctx && AudioContextClass) {
            ctx = new AudioContextClass();
        }
        if (ctx && ctx.state === 'suspended') {
            ctx.resume();
        }
        return ctx;
    }

    var SoundSystem = {
        isMuted: function() {
            return isMuted;
        },

        toggleMute: function() {
            isMuted = !isMuted;
            try {
                localStorage.setItem('gamehub_muted', isMuted ? 'true' : 'false');
            } catch(e) {}
            return isMuted;
        },

        playClick: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(300, ac.currentTime + 0.06);

            gain.gain.setValueAtTime(0.15, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.06);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start();
            osc.stop(ac.currentTime + 0.06);
        },

        playMove: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ac.currentTime + 0.08);

            gain.gain.setValueAtTime(0.2, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start();
            osc.stop(ac.currentTime + 0.08);
        },

        playDrop: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(220, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(110, ac.currentTime + 0.12);

            gain.gain.setValueAtTime(0.3, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.12);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start();
            osc.stop(ac.currentTime + 0.12);
        },

        playTick: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ac.currentTime);

            gain.gain.setValueAtTime(0.12, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.04);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start();
            osc.stop(ac.currentTime + 0.04);
        },

        playClash: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            // Multi-tone impact
            [320, 480, 640].forEach(function(freq, idx) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, ac.currentTime + idx * 0.02);
                osc.frequency.exponentialRampToValueAtTime(freq / 2, ac.currentTime + 0.25);

                gain.gain.setValueAtTime(0.12, ac.currentTime + idx * 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(ac.currentTime + idx * 0.02);
                osc.stop(ac.currentTime + 0.25);
            });
        },

        playWin: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach(function(freq, index) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                var start = ac.currentTime + (index * 0.12);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, start);

                gain.gain.setValueAtTime(0.2, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(start);
                osc.stop(start + 0.4);
            });
        },

        playLoss: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var notes = [400, 350, 300, 250];
            notes.forEach(function(freq, index) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                var start = ac.currentTime + (index * 0.14);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, start);

                gain.gain.setValueAtTime(0.2, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(start);
                osc.stop(start + 0.35);
            });
        },

        playPaddleHit: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(580, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(140, ac.currentTime + 0.08);

            gain.gain.setValueAtTime(0.25, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start();
            osc.stop(ac.currentTime + 0.08);
        },

        playWallBounce: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(320, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(180, ac.currentTime + 0.05);

            gain.gain.setValueAtTime(0.15, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.05);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start();
            osc.stop(ac.currentTime + 0.05);
        },

        playGoalHorn: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            [220, 277.18, 329.63].forEach(function(freq) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, ac.currentTime);

                gain.gain.setValueAtTime(0.18, ac.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.65);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start();
                osc.stop(ac.currentTime + 0.65);
            });
        },

        playBowDraw: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(90, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(180, ac.currentTime + 0.18);

            gain.gain.setValueAtTime(0.04, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start();
            osc.stop(ac.currentTime + 0.18);
        },

        playBowRelease: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            // 1. High string twang
            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(680, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(80, ac.currentTime + 0.12);

            gain.gain.setValueAtTime(0.28, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start();
            osc.stop(ac.currentTime + 0.12);

            // 2. Low limb vibration
            var limb = ac.createOscillator();
            var limbGain = ac.createGain();
            limb.type = 'triangle';
            limb.frequency.setValueAtTime(120, ac.currentTime);
            limb.frequency.exponentialRampToValueAtTime(40, ac.currentTime + 0.2);
            limbGain.gain.setValueAtTime(0.2, ac.currentTime);
            limbGain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2);
            limb.connect(limbGain);
            limbGain.connect(ac.destination);
            limb.start();
            limb.stop(ac.currentTime + 0.2);
        },

        playTargetHit: function(isBullseye, isXRing) {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            // Deep solid impact thunk
            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(240, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(45, ac.currentTime + 0.18);

            gain.gain.setValueAtTime(0.45, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start();
            osc.stop(ac.currentTime + 0.18);

            if (isBullseye || isXRing) {
                // Gold Bell Chime & Fanfare
                [880, 1108.73, 1318.51, 1760].forEach(function(freq, idx) {
                    var bell = ac.createOscillator();
                    var bellGain = ac.createGain();

                    bell.type = 'sine';
                    bell.frequency.setValueAtTime(freq, ac.currentTime + idx * 0.05);

                    bellGain.gain.setValueAtTime(0.18, ac.currentTime + idx * 0.05);
                    bellGain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + idx * 0.05 + 0.45);

                    bell.connect(bellGain);
                    bellGain.connect(ac.destination);

                    bell.start(ac.currentTime + idx * 0.05);
                    bell.stop(ac.currentTime + idx * 0.05 + 0.45);
                });
            }
        },

        playTileSlide: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(220, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(140, ac.currentTime + 0.08);

            gain.gain.setValueAtTime(0.06, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start();
            osc.stop(ac.currentTime + 0.08);
        },

        playTileMerge: function(value) {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            // Pitch scales logarithmically with tile value (2->260Hz, 4->300Hz, 8->340Hz, ... 2048->780Hz)
            var power = Math.log2(value || 4);
            var baseFreq = 220 + (power * 45);

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ac.currentTime + 0.12);

            gain.gain.setValueAtTime(0.18, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start();
            osc.stop(ac.currentTime + 0.12);
        },

        play2048Win: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5 Major chord
            notes.forEach(function(freq, idx) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ac.currentTime + idx * 0.08);

                gain.gain.setValueAtTime(0.2, ac.currentTime + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + idx * 0.08 + 0.45);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(ac.currentTime + idx * 0.08);
                osc.stop(ac.currentTime + idx * 0.08 + 0.45);
            });
        },

        playGameOver: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var notes = [440, 392, 349.23, 293.66]; // Descending D minor
            notes.forEach(function(freq, idx) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ac.currentTime + idx * 0.12);

                gain.gain.setValueAtTime(0.15, ac.currentTime + idx * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + idx * 0.12 + 0.35);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(ac.currentTime + idx * 0.12);
                osc.stop(ac.currentTime + idx * 0.12 + 0.35);
            });
        },

        playPaddleHit: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(160, ac.currentTime + 0.07);

            gain.gain.setValueAtTime(0.2, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.07);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start();
            osc.stop(ac.currentTime + 0.07);
        },

        playBrickHit: function(combo) {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            // Pitch rises with combo multiplier
            var mult = Math.min(8, combo || 1);
            var baseFreq = 440 + (mult * 65);

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, ac.currentTime + 0.09);

            gain.gain.setValueAtTime(0.22, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.09);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start();
            osc.stop(ac.currentTime + 0.09);
        },

        playPowerUpCollect: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            [587.33, 880, 1174.66].forEach(function(freq, idx) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ac.currentTime + idx * 0.06);

                gain.gain.setValueAtTime(0.18, ac.currentTime + idx * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + idx * 0.06 + 0.25);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(ac.currentTime + idx * 0.06);
                osc.stop(ac.currentTime + idx * 0.06 + 0.25);
            });
        },

        playLifeLost: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(50, ac.currentTime + 0.25);

            gain.gain.setValueAtTime(0.25, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start();
            osc.stop(ac.currentTime + 0.25);
        },

        playLevelClear: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var notes = [440, 554.37, 659.25, 880]; // A Major fanfare
            notes.forEach(function(freq, idx) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ac.currentTime + idx * 0.09);

                gain.gain.setValueAtTime(0.22, ac.currentTime + idx * 0.09);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + idx * 0.09 + 0.4);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(ac.currentTime + idx * 0.09);
                osc.stop(ac.currentTime + idx * 0.09 + 0.4);
            });
        },

        playKnifeThrow: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(160, ac.currentTime + 0.08);

            gain.gain.setValueAtTime(0.2, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start();
            osc.stop(ac.currentTime + 0.08);
        },

        playKnifeStick: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(260, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(70, ac.currentTime + 0.12);

            gain.gain.setValueAtTime(0.4, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start();
            osc.stop(ac.currentTime + 0.12);
        },

        playKnifeClank: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            // High metallic clash
            [880, 1320, 1760].forEach(function(freq) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, ac.currentTime);
                osc.frequency.exponentialRampToValueAtTime(freq * 0.4, ac.currentTime + 0.22);

                gain.gain.setValueAtTime(0.25, ac.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.22);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start();
                osc.stop(ac.currentTime + 0.22);
            });
        },

        playKnifeLevelClear: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var notes = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
            notes.forEach(function(freq, idx) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ac.currentTime + idx * 0.07);

                gain.gain.setValueAtTime(0.2, ac.currentTime + idx * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + idx * 0.07 + 0.35);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(ac.currentTime + idx * 0.07);
                osc.stop(ac.currentTime + idx * 0.07 + 0.35);
            });
        },

        playCollectibleHit: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(1046.50, ac.currentTime); // High C6
            osc.frequency.exponentialRampToValueAtTime(2093.00, ac.currentTime + 0.18);

            gain.gain.setValueAtTime(0.25, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start();
            osc.stop(ac.currentTime + 0.18);
        },

        playChessMove: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(420, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(180, ac.currentTime + 0.06);

            gain.gain.setValueAtTime(0.2, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.06);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start();
            osc.stop(ac.currentTime + 0.06);
        },

        playChessCapture: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(240, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(60, ac.currentTime + 0.12);

            gain.gain.setValueAtTime(0.3, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start();
            osc.stop(ac.currentTime + 0.12);
        },

        playChessCheck: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            [659.25, 880].forEach(function(freq, idx) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ac.currentTime + idx * 0.07);

                gain.gain.setValueAtTime(0.22, ac.currentTime + idx * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + idx * 0.07 + 0.28);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(ac.currentTime + idx * 0.07);
                osc.stop(ac.currentTime + idx * 0.07 + 0.28);
            });
        },

        playChessCastle: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            [320, 480].forEach(function(freq, idx) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ac.currentTime + idx * 0.08);

                gain.gain.setValueAtTime(0.2, ac.currentTime + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + idx * 0.08 + 0.1);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(ac.currentTime + idx * 0.08);
                osc.stop(ac.currentTime + idx * 0.08 + 0.1);
            });
        },

        // Archery Sound Effects
        playBowDraw: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(80, ac.currentTime);
            osc.frequency.linearRampToValueAtTime(220, ac.currentTime + 0.35);

            gain.gain.setValueAtTime(0.08, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.35);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start();
            osc.stop(ac.currentTime + 0.35);
        },

        playBowRelease: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            // Bowstring Twang (Sharp snap with vibrating decay)
            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(480, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(110, ac.currentTime + 0.22);

            gain.gain.setValueAtTime(0.35, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.22);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start();
            osc.stop(ac.currentTime + 0.22);
        },

        playArrowWhoosh: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(320, ac.currentTime);
            osc.frequency.linearRampToValueAtTime(160, ac.currentTime + 0.18);

            gain.gain.setValueAtTime(0.15, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start();
            osc.stop(ac.currentTime + 0.18);
        },

        playTargetHit: function(isBullseye, isXRing) {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            // 1. Heavy Solid Target Impact Thud
            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(180, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(45, ac.currentTime + 0.16);

            gain.gain.setValueAtTime(0.5, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.16);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start();
            osc.stop(ac.currentTime + 0.16);

            // 2. High Resonance Ring for Bullseyes (10 or 10X)
            if (isBullseye || isXRing) {
                var notes = isXRing ? [880, 1174.66, 1760] : [783.99, 1046.50];
                notes.forEach(function(freq, idx) {
                    var bOsc = ac.createOscillator();
                    var bGain = ac.createGain();

                    bOsc.type = 'sine';
                    bOsc.frequency.setValueAtTime(freq, ac.currentTime + 0.04 + idx * 0.05);

                    bGain.gain.setValueAtTime(0.2, ac.currentTime + 0.04 + idx * 0.05);
                    bGain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.04 + idx * 0.05 + 0.45);

                    bOsc.connect(bGain);
                    bGain.connect(ac.destination);

                    bOsc.start(ac.currentTime + 0.04 + idx * 0.05);
                    bOsc.stop(ac.currentTime + 0.04 + idx * 0.05 + 0.45);
                });
            }
        },

        playCrowdCheer: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            [523.25, 659.25, 783.99, 1046.50].forEach(function(freq, idx) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ac.currentTime + idx * 0.06);

                gain.gain.setValueAtTime(0.18, ac.currentTime + idx * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + idx * 0.06 + 0.6);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(ac.currentTime + idx * 0.06);
                osc.stop(ac.currentTime + idx * 0.06 + 0.6);
            });
        },

        /* Speed Math Synthesized Sound Suite */
        playMathCorrect: function(streak) {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var baseFreq = 440 * Math.pow(1.05946, Math.min(12, (streak || 0) * 2));
            var freqs = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];

            freqs.forEach(function(f, idx) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, ac.currentTime + idx * 0.04);

                gain.gain.setValueAtTime(0.2, ac.currentTime + idx * 0.04);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + idx * 0.04 + 0.22);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(ac.currentTime + idx * 0.04);
                osc.stop(ac.currentTime + idx * 0.04 + 0.22);
            });
        },

        playMathWrong: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(160, ac.currentTime);
            osc.frequency.linearRampToValueAtTime(90, ac.currentTime + 0.28);

            gain.gain.setValueAtTime(0.25, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.28);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + 0.28);
        },

        playMathStreak: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            [587.33, 739.99, 880.00, 1174.66].forEach(function(f, idx) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(f, ac.currentTime + idx * 0.05);

                gain.gain.setValueAtTime(0.22, ac.currentTime + idx * 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + idx * 0.05 + 0.35);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(ac.currentTime + idx * 0.05);
                osc.stop(ac.currentTime + idx * 0.05 + 0.35);
            });
        },

        playMathCountdown: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ac.currentTime);

            gain.gain.setValueAtTime(0.12, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.06);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + 0.06);
        },

        /* Sling Puck Synthesized Sound Suite */
        playSlingPull: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(140, ac.currentTime);
            osc.frequency.linearRampToValueAtTime(260, ac.currentTime + 0.12);

            gain.gain.setValueAtTime(0.08, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + 0.12);
        },

        playSlingSnap: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(480, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(80, ac.currentTime + 0.14);

            gain.gain.setValueAtTime(0.3, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.14);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + 0.14);
        },

        playPuckClack: function(velocity) {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var vol = Math.min(0.28, Math.max(0.06, (velocity || 200) / 1200));
            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(620 + Math.random() * 120, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(180, ac.currentTime + 0.05);

            gain.gain.setValueAtTime(vol, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.05);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + 0.05);
        },

        playGatePass: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            [587.33, 880.00, 1174.66].forEach(function(f, idx) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, ac.currentTime + idx * 0.03);

                gain.gain.setValueAtTime(0.18, ac.currentTime + idx * 0.03);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + idx * 0.03 + 0.18);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(ac.currentTime + idx * 0.03);
                osc.stop(ac.currentTime + idx * 0.03 + 0.18);
            });
        },

        /* Dots and Boxes Sound Suite */
        playLineDraw: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(420, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(780, ac.currentTime + 0.08);

            gain.gain.setValueAtTime(0.15, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + 0.08);
        },

        playBoxCapture: function(comboCount) {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var baseFreq = (comboCount > 1) ? 659.25 : 523.25;
            var chords = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];

            chords.forEach(function(f, idx) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(f, ac.currentTime);

                gain.gain.setValueAtTime(0.12, ac.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.28);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(ac.currentTime + idx * 0.02);
                osc.stop(ac.currentTime + 0.3);
            });
        },

        playChainCombo: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            [523.25, 659.25, 783.99, 1046.50].forEach(function(f, idx) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, ac.currentTime + idx * 0.05);

                gain.gain.setValueAtTime(0.2, ac.currentTime + idx * 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + idx * 0.05 + 0.35);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(ac.currentTime + idx * 0.05);
                osc.stop(ac.currentTime + idx * 0.05 + 0.35);
            });
        },

        /* Codebreaker / Mastermind Sound Suite */
        playPegPlace: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(780, ac.currentTime + 0.06);

            gain.gain.setValueAtTime(0.14, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.06);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + 0.06);
        },

        playCodeScan: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, ac.currentTime);
            osc.frequency.linearRampToValueAtTime(880, ac.currentTime + 0.22);

            gain.gain.setValueAtTime(0.12, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.22);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + 0.22);
        },

        playKeyPegPop: function(isExact) {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(isExact ? 880 : 587.33, ac.currentTime);

            gain.gain.setValueAtTime(0.12, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + 0.08);
        },

        playCipherSolved: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach(function(f, idx) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(f, ac.currentTime + idx * 0.06);

                gain.gain.setValueAtTime(0.2, ac.currentTime + idx * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + idx * 0.06 + 0.45);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(ac.currentTime + idx * 0.06);
                osc.stop(ac.currentTime + idx * 0.06 + 0.45);
            });
        },

        /* Memory Matrix / Cyber Recall Sound Suite */
        playMemoryFlash: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(640, ac.currentTime + 0.18);

            gain.gain.setValueAtTime(0.15, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + 0.18);
        },

        playMemoryCorrect: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(660, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1320, ac.currentTime + 0.08);

            gain.gain.setValueAtTime(0.16, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + 0.08);
        },

        playMemoryError: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(140, ac.currentTime);
            osc.frequency.linearRampToValueAtTime(90, ac.currentTime + 0.15);

            gain.gain.setValueAtTime(0.18, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + 0.15);
        },

        playMemoryRoundClear: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            [523.25, 659.25, 783.99, 1046.50].forEach(function(f, idx) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(f, ac.currentTime + idx * 0.05);

                gain.gain.setValueAtTime(0.18, ac.currentTime + idx * 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + idx * 0.05 + 0.28);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(ac.currentTime + idx * 0.05);
                osc.stop(ac.currentTime + idx * 0.05 + 0.28);
            });
        },

        /* Laser & Mirrors / Photon Flow Sound Suite */
        playMirrorRotate: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ac.currentTime + 0.06);

            gain.gain.setValueAtTime(0.12, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.06);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + 0.06);
        },

        playCrystalPower: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            [659.25, 830.61, 1046.50, 1318.51].forEach(function(f, idx) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, ac.currentTime + idx * 0.03);

                gain.gain.setValueAtTime(0.15, ac.currentTime + idx * 0.03);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + idx * 0.03 + 0.35);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(ac.currentTime + idx * 0.03);
                osc.stop(ac.currentTime + idx * 0.03 + 0.35);
            });
        },

        playLaserPulse: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ac.currentTime + 0.12);

            gain.gain.setValueAtTime(0.1, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + 0.12);
        },

        playOpticsWin: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98].forEach(function(f, idx) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(f, ac.currentTime + idx * 0.06);

                gain.gain.setValueAtTime(0.2, ac.currentTime + idx * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + idx * 0.06 + 0.45);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(ac.currentTime + idx * 0.06);
                osc.stop(ac.currentTime + idx * 0.06 + 0.45);
            });
        },

        /* AlgoBot: Maze Runner & Pathfinding Sound Suite */
        playBotStep: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(160, ac.currentTime + 0.05);

            gain.gain.setValueAtTime(0.12, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.05);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + 0.05);
        },

        playBotTurn: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(780, ac.currentTime + 0.06);

            gain.gain.setValueAtTime(0.1, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.06);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + 0.06);
        },

        playBotJump: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(240, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, ac.currentTime + 0.1);

            gain.gain.setValueAtTime(0.14, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + 0.1);
        },

        playBotCollect: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            [659.25, 880.00, 1318.51].forEach(function(f, idx) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(f, ac.currentTime + idx * 0.04);

                gain.gain.setValueAtTime(0.15, ac.currentTime + idx * 0.04);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + idx * 0.04 + 0.2);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(ac.currentTime + idx * 0.04);
                osc.stop(ac.currentTime + idx * 0.04 + 0.2);
            });
        },

        playBotCrash: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, ac.currentTime);
            osc.frequency.linearRampToValueAtTime(60, ac.currentTime + 0.18);

            gain.gain.setValueAtTime(0.2, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + 0.18);
        },

        playAlgoVictory: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach(function(f, idx) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, ac.currentTime + idx * 0.06);

                gain.gain.setValueAtTime(0.2, ac.currentTime + idx * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + idx * 0.06 + 0.4);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(ac.currentTime + idx * 0.06);
                osc.stop(ac.currentTime + idx * 0.06 + 0.4);
            });
        },

        // Wordle / Word Duel Synthesizers
        playKeyType: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(140, ac.currentTime + 0.04);

            gain.gain.setValueAtTime(0.12, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.04);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + 0.04);
        },

        playLetterFlip: function(tileIndex) {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var notes = [440, 493.88, 554.37, 659.25, 739.99, 880];
            var freq = notes[(tileIndex || 0) % notes.length];

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.02, ac.currentTime + 0.12);

            gain.gain.setValueAtTime(0.15, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + 0.12);
        },

        playWordInvalid: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc1 = ac.createOscillator();
            var osc2 = ac.createOscillator();
            var gain = ac.createGain();

            osc1.type = 'sawtooth';
            osc2.type = 'sawtooth';
            osc1.frequency.setValueAtTime(140, ac.currentTime);
            osc2.frequency.setValueAtTime(148, ac.currentTime);

            gain.gain.setValueAtTime(0.18, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ac.destination);

            osc1.start(ac.currentTime);
            osc2.start(ac.currentTime);
            osc1.stop(ac.currentTime + 0.18);
            osc2.stop(ac.currentTime + 0.18);
        },

        playWordVictory: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98].forEach(function(f, idx) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, ac.currentTime + idx * 0.08);

                gain.gain.setValueAtTime(0.22, ac.currentTime + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + idx * 0.08 + 0.5);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(ac.currentTime + idx * 0.08);
                osc.stop(ac.currentTime + idx * 0.08 + 0.5);
            });
        },

        // ==========================================
        // Lights Out / Quantum Switch Synthesizers
        // ==========================================
        playQuantumNodeToggle: function(isOn) {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var subOsc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'triangle';
            subOsc.type = 'sine';

            var baseFreq = isOn ? 587.33 : 329.63; // D5 vs E4
            var subFreq = isOn ? 880.00 : 220.00;

            osc.frequency.setValueAtTime(baseFreq, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * (isOn ? 1.2 : 0.8), ac.currentTime + 0.09);

            subOsc.frequency.setValueAtTime(subFreq, ac.currentTime);

            gain.gain.setValueAtTime(0.18, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);

            osc.connect(gain);
            subOsc.connect(gain);
            gain.connect(ac.destination);

            osc.start(ac.currentTime);
            subOsc.start(ac.currentTime);
            osc.stop(ac.currentTime + 0.12);
            subOsc.stop(ac.currentTime + 0.12);
        },

        playQuantumSolveFanfare: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            // Quantum harmonic ascending cascade
            var notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760];
            notes.forEach(function(f, idx) {
                var osc = ac.createOscillator();
                var gain = ac.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, ac.currentTime + idx * 0.06);

                gain.gain.setValueAtTime(0.24, ac.currentTime + idx * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + idx * 0.06 + 0.6);

                osc.connect(gain);
                gain.connect(ac.destination);

                osc.start(ac.currentTime + idx * 0.06);
                osc.stop(ac.currentTime + idx * 0.06 + 0.6);
            });
        },

        playQuantumHintChime: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc1 = ac.createOscillator();
            var osc2 = ac.createOscillator();
            var gain = ac.createGain();

            osc1.type = 'sine';
            osc2.type = 'triangle';

            osc1.frequency.setValueAtTime(880, ac.currentTime);
            osc2.frequency.setValueAtTime(1320, ac.currentTime);

            gain.gain.setValueAtTime(0.18, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.35);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ac.destination);

            osc1.start(ac.currentTime);
            osc2.start(ac.currentTime);
            osc1.stop(ac.currentTime + 0.35);
            osc2.stop(ac.currentTime + 0.35);
        },

        playQuantumGridReset: function() {
            if (isMuted) return;
            var ac = getContext();
            if (!ac) return;

            var osc = ac.createOscillator();
            var gain = ac.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(600, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(120, ac.currentTime + 0.2);

            gain.gain.setValueAtTime(0.12, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2);

            osc.connect(gain);
            gain.connect(ac.destination);

            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + 0.2);
        }
    };

    window.GameAudio = SoundSystem;

})(window);
