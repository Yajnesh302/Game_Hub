/* ==========================================================================
   GAME HUB - Core UI, Toasts, Profile & Confetti Manager
   ========================================================================== */

(function(window, $) {
    'use strict';

    var App = {
        init: function() {
            this.initProfile();
            this.initAudioButton();
            this.initToastContainer();
        },

        // Profile & Local Display Name
        initProfile: function() {
            var name = this.getPlayerName();
            $('#header-profile-name').text(name);
            $('#header-avatar-letter').text(name.charAt(0).toUpperCase());

            var self = this;
            $('#profile-pill-btn').on('click', function(e) {
                e.preventDefault();
                self.openNameModal();
            });
        },

        getPlayerName: function() {
            var name = 'Player';
            try {
                name = localStorage.getItem('gamehub_player_name');
            } catch(e) {}

            if (!name || name.trim() === '') {
                name = 'Player_' + Math.floor(1000 + Math.random() * 9000);
                this.setPlayerName(name);
            }
            return name;
        },

        setPlayerName: function(name) {
            if (!name || name.trim() === '') return;
            name = name.trim().substring(0, 16);
            try {
                localStorage.setItem('gamehub_player_name', name);
            } catch(e) {}

            $('#header-profile-name').text(name);
            $('#header-avatar-letter').text(name.charAt(0).toUpperCase());
            
            // If SignalR is connected, notify hub
            if (window.GameHubClient && window.GameHubClient.isConnected()) {
                window.GameHubClient.register(name);
            }
        },

        openNameModal: function() {
            var current = this.getPlayerName();
            var newName = prompt("Enter your display name for LAN games:", current);
            if (newName && newName.trim() !== '') {
                this.setPlayerName(newName);
                this.toast("Display name updated to: " + newName.trim(), "success");
            }
        },

        // Sound Toggle
        initAudioButton: function() {
            var $btn = $('#sound-toggle-btn');
            function updateIcon() {
                var muted = window.GameAudio ? window.GameAudio.isMuted() : false;
                if (muted) {
                    $btn.html('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>');
                    $btn.attr('title', 'Sound Muted (Click to Unmute)');
                } else {
                    $btn.html('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>');
                    $btn.attr('title', 'Sound Enabled (Click to Mute)');
                }
            }

            updateIcon();

            $btn.on('click', function(e) {
                e.preventDefault();
                if (window.GameAudio) {
                    window.GameAudio.toggleMute();
                    updateIcon();
                    if (!window.GameAudio.isMuted()) {
                        window.GameAudio.playClick();
                    }
                }
            });
        },

        // Toast notifications
        initToastContainer: function() {
            if ($('#toast-container').length === 0) {
                $('body').append('<div id="toast-container"></div>');
            }
        },

        toast: function(message, type) {
            type = type || 'info';
            this.initToastContainer();

            var $toast = $('<div class="toast toast-' + type + '">' + message + '</div>');
            $('#toast-container').append($toast);

            setTimeout(function() {
                $toast.css({ opacity: 0, transform: 'translateX(60px)' });
                setTimeout(function() { $toast.remove(); }, 300);
            }, 3500);
        },

        showToast: function(message, type) {
            this.toast(message, type);
        },

        // Confetti celebration
        spawnConfetti: function() {
            var colors = ['#06b6d4', '#818cf8', '#f43f5e', '#fbbf24', '#10b981', '#ffffff'];
            var count = 55;

            for (var i = 0; i < count; i++) {
                var $piece = $('<div class="confetti-piece"></div>');
                var color = colors[Math.floor(Math.random() * colors.length)];
                var left = Math.random() * 100;
                var delay = Math.random() * 1.5;
                var duration = 2.0 + Math.random() * 1.5;
                var size = 6 + Math.random() * 8;

                $piece.css({
                    left: left + 'vw',
                    backgroundColor: color,
                    width: size + 'px',
                    height: (size * 1.4) + 'px',
                    animationDelay: delay + 's',
                    animationDuration: duration + 's'
                });

                $('body').append($piece);

                (function($p, time) {
                    setTimeout(function() { $p.remove(); }, time * 1000 + 500);
                })($piece, duration + delay);
            }
        },

        // Game Over Result Modal
        showGameModal: function(options) {
            // options: { title, text, isWin, isDraw, onRematch, onHub }
            var $modal = $('#game-result-modal');
            if ($modal.length === 0) {
                var html = '<div id="game-result-modal" class="modal-backdrop">' +
                    '<div class="modal-box">' +
                        '<div class="modal-icon-wrapper" id="modal-result-icon"></div>' +
                        '<h2 class="modal-title" id="modal-result-title">Victory!</h2>' +
                        '<p class="modal-text" id="modal-result-text">Congratulations on your win!</p>' +
                        '<div class="btn-group" style="margin-top: 24px;">' +
                            '<button type="button" class="btn btn-primary" id="modal-rematch-btn">' +
                                '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>' +
                                'Rematch' +
                            '</button>' +
                            '<a href="../Default.aspx" class="btn btn-outline" id="modal-hub-btn">' +
                                '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' +
                                'Game Hub' +
                            '</a>' +
                        '</div>' +
                    '</div>' +
                '</div>';
                $('body').append(html);
                $modal = $('#game-result-modal');
            }

            var iconHtml = '';
            if (options.isWin) {
                iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34c3.48-.68 6-3.7 6-7.32V4H4v5.34c0 3.62 2.52 6.64 6 7.32z"/></svg>';
                if (window.GameAudio) window.GameAudio.playWin();
                this.spawnConfetti();
            } else if (options.isDraw) {
                iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>';
                if (window.GameAudio) window.GameAudio.playTick();
            } else {
                iconHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
                if (window.GameAudio) window.GameAudio.playLoss();
            }

            $('#modal-result-icon').html(iconHtml);
            $('#modal-result-title').text(options.title || 'Game Over');
            $('#modal-result-text').html(options.html || options.text || '');

            $('#modal-rematch-btn').off('click').on('click', function(e) {
                e.preventDefault();
                $modal.removeClass('active');
                if (typeof options.onRematch === 'function') {
                    options.onRematch();
                }
            });

            $modal.addClass('active');
        },

        hideGameModal: function() {
            $('#game-result-modal').removeClass('active');
        }
    };

    $(document).ready(function() {
        App.init();
    });

    window.App = App;

})(window, jQuery);
