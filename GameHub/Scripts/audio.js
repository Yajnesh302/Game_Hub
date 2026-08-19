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
        }
    };

    window.GameAudio = SoundSystem;

})(window);
