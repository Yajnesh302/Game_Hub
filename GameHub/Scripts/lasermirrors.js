/* ==========================================================================
   GAME HUB - Laser & Mirrors: Photon Flow (2D Optical Raytracing Engine)
   Features:
   - Real-Time Optical Raycasting on HTML5 Canvas with Dynamic Bloom
   - 45° Planar Mirrors (/ and \), Beam Splitters (Prisms), Filters, & Portals
   - 20 Handcrafted Progressive Optical Stages with 3-Star Efficiency Ratings
   - Real-Time LAN Multiplayer Duel with Live Crystal Illumination Telemetry
   ========================================================================== */

(function(window, $) {
    'use strict';

    var isMultiplayer = false;
    var sessionId = null;
    var currentLevelIdx = 0;
    var myPlayerName = "Player";
    var opponentPlayerName = "Opponent";
    var isP1 = true;
    var isGameOver = false;

    var GRID_SIZE = 6;
    var CELL_SIZE = 64;
    var canvas, ctx;
    var board = []; // 2D array of cell objects: { type, dir, color, rotatable, fixed, angle }
    var availableInventory = []; // [{ type, count, angle }]
    var selectedTool = null; // 'mirror_slash', 'mirror_backslash', 'prism'
    var moveCount = 0;
    var gameStartTime = Date.now();
    var raySegments = []; // [{ x1, y1, x2, y2, color }]
    var poweredCrystals = 0;
    var totalCrystals = 0;

    // 20 Handcrafted Level Dataset
    var LEVELS = [
        // Tier 1: Apprentice Optics (1-5)
        {
            id: 1, name: "First Refraction", grid: 6,
            emitters: [{ r: 2, c: 0, dir: "E", color: "#38bdf8" }],
            crystals: [{ r: 0, c: 3 }],
            blocks: [{ r: 1, c: 1 }, { r: 3, c: 2 }],
            fixed: [],
            inventory: [{ type: "slash", count: 1 }, { type: "backslash", count: 0 }],
            parMoves: 1
        },
        {
            id: 2, name: "Double Reflection", grid: 6,
            emitters: [{ r: 4, c: 0, dir: "E", color: "#38bdf8" }],
            crystals: [{ r: 1, c: 5 }],
            blocks: [{ r: 4, c: 4 }, { r: 2, c: 2 }],
            fixed: [],
            inventory: [{ type: "slash", count: 1 }, { type: "backslash", count: 1 }],
            parMoves: 2
        },
        {
            id: 3, name: "Labyrinth Bypass", grid: 6,
            emitters: [{ r: 0, c: 1, dir: "S", color: "#ef4444" }],
            crystals: [{ r: 5, c: 4 }],
            blocks: [{ r: 2, c: 1 }, { r: 3, c: 1 }, { r: 4, c: 4 }],
            fixed: [{ r: 1, c: 1, type: "backslash", fixed: true }],
            inventory: [{ type: "slash", count: 2 }, { type: "backslash", count: 1 }],
            parMoves: 3
        },
        {
            id: 4, name: "Dual Crystal Matrix", grid: 6,
            emitters: [{ r: 1, c: 0, dir: "E", color: "#10b981" }, { r: 5, c: 2, dir: "N", color: "#38bdf8" }],
            crystals: [{ r: 1, c: 4 }, { r: 2, c: 2 }],
            blocks: [{ r: 1, c: 2 }, { r: 3, c: 2 }],
            fixed: [],
            inventory: [{ type: "slash", count: 2 }, { type: "backslash", count: 2 }],
            parMoves: 3
        },
        {
            id: 5, name: "Corner Ricochet", grid: 6,
            emitters: [{ r: 0, c: 0, dir: "E", color: "#a855f7" }],
            crystals: [{ r: 0, c: 5 }],
            blocks: [{ r: 0, c: 2 }, { r: 0, c: 3 }, { r: 2, c: 4 }],
            fixed: [],
            inventory: [{ type: "slash", count: 2 }, { type: "backslash", count: 2 }],
            parMoves: 4
        },

        // Tier 2: Prism Division & Multi-Beam (6-10)
        {
            id: 6, name: "Prism Splitting", grid: 6,
            emitters: [{ r: 2, c: 0, dir: "E", color: "#38bdf8" }],
            crystals: [{ r: 0, c: 3 }, { r: 2, c: 5 }],
            blocks: [{ r: 1, c: 1 }],
            fixed: [],
            inventory: [{ type: "prism", count: 1, dir: "E" }],
            parMoves: 1
        },
        {
            id: 7, name: "Tri-Crystal Prism", grid: 6,
            emitters: [{ r: 3, c: 0, dir: "E", color: "#facc15" }],
            crystals: [{ r: 0, c: 2 }, { r: 5, c: 4 }, { r: 3, c: 5 }],
            blocks: [{ r: 2, c: 2 }],
            fixed: [{ r: 3, c: 2, type: "prism", dir: "E", fixed: true }],
            inventory: [{ type: "slash", count: 1 }, { type: "backslash", count: 1 }, { type: "prism", count: 1 }],
            parMoves: 2
        },
        {
            id: 8, name: "Crossbeam Synchronization", grid: 6,
            emitters: [{ r: 0, c: 2, dir: "S", color: "#ef4444" }, { r: 2, c: 0, dir: "E", color: "#38bdf8" }],
            crystals: [{ r: 5, c: 2 }, { r: 2, c: 5 }],
            blocks: [{ r: 4, c: 2 }, { r: 2, c: 4 }],
            fixed: [],
            inventory: [{ type: "slash", count: 2 }, { type: "backslash", count: 2 }],
            parMoves: 4
        },
        {
            id: 9, name: "Quad Beam Cascade", grid: 6,
            emitters: [{ r: 1, c: 0, dir: "E", color: "#10b981" }],
            crystals: [{ r: 0, c: 3 }, { r: 4, c: 3 }, { r: 1, c: 5 }],
            blocks: [{ r: 2, c: 3 }, { r: 3, c: 3 }],
            fixed: [],
            inventory: [{ type: "prism", count: 2 }, { type: "slash", count: 2 }, { type: "backslash", count: 1 }],
            parMoves: 4
        },
        {
            id: 10, name: "Obsidian Fortress", grid: 6,
            emitters: [{ r: 5, c: 0, dir: "N", color: "#38bdf8" }],
            crystals: [{ r: 1, c: 1 }, { r: 1, c: 4 }, { r: 4, c: 4 }],
            blocks: [{ r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, { r: 3, c: 4 }],
            fixed: [],
            inventory: [{ type: "prism", count: 1 }, { type: "slash", count: 3 }, { type: "backslash", count: 2 }],
            parMoves: 5
        },

        // Tier 3: Chromatics & Portal Wormholes (11-15)
        {
            id: 11, name: "Portal Gateway", grid: 6,
            emitters: [{ r: 0, c: 1, dir: "S", color: "#a855f7" }],
            crystals: [{ r: 4, c: 5 }],
            blocks: [{ r: 2, c: 1 }, { r: 3, c: 1 }, { r: 4, c: 1 }],
            portals: [{ r1: 1, c1: 1, r2: 4, c2: 2, exitDir: "E" }],
            fixed: [],
            inventory: [{ type: "slash", count: 1 }, { type: "backslash", count: 1 }],
            parMoves: 2
        },
        {
            id: 12, name: "Chromatic Convergence", grid: 6,
            emitters: [{ r: 0, c: 0, dir: "E", color: "#ef4444" }, { r: 5, c: 0, dir: "E", color: "#38bdf8" }],
            crystals: [{ r: 1, c: 5 }, { r: 4, c: 5 }],
            blocks: [{ r: 2, c: 2 }, { r: 3, c: 2 }],
            fixed: [],
            inventory: [{ type: "slash", count: 2 }, { type: "backslash", count: 2 }],
            parMoves: 4
        },
        {
            id: 13, name: "Wormhole Triangulation", grid: 6,
            emitters: [{ r: 2, c: 0, dir: "E", color: "#10b981" }],
            crystals: [{ r: 0, c: 4 }, { r: 5, c: 4 }],
            blocks: [{ r: 2, c: 3 }],
            portals: [{ r1: 2, c1: 2, r2: 4, c2: 1, exitDir: "E" }],
            fixed: [],
            inventory: [{ type: "prism", count: 1 }, { type: "slash", count: 2 }, { type: "backslash", count: 2 }],
            parMoves: 4
        },
        {
            id: 14, name: "Prism Teleportation", grid: 6,
            emitters: [{ r: 0, c: 2, dir: "S", color: "#facc15" }],
            crystals: [{ r: 5, c: 0 }, { r: 5, c: 5 }, { r: 1, c: 5 }],
            blocks: [{ r: 3, c: 2 }],
            portals: [{ r1: 2, c1: 2, r2: 3, c2: 4, exitDir: "S" }],
            fixed: [],
            inventory: [{ type: "prism", count: 2 }, { type: "slash", count: 2 }, { type: "backslash", count: 2 }],
            parMoves: 5
        },
        {
            id: 15, name: "Spectrum Overdrive", grid: 6,
            emitters: [{ r: 0, c: 0, dir: "S", color: "#ef4444" }, { r: 0, c: 5, dir: "S", color: "#38bdf8" }],
            crystals: [{ r: 3, c: 2 }, { r: 3, c: 3 }],
            blocks: [{ r: 1, c: 0 }, { r: 1, c: 5 }, { r: 4, c: 2 }, { r: 4, c: 3 }],
            fixed: [],
            inventory: [{ type: "slash", count: 2 }, { type: "backslash", count: 2 }, { type: "prism", count: 1 }],
            parMoves: 4
        },

        // Tier 4: Quantum Master Labyrinths (16-20)
        {
            id: 16, name: "Quantum Labyrinth I", grid: 6,
            emitters: [{ r: 5, c: 1, dir: "N", color: "#38bdf8" }],
            crystals: [{ r: 0, c: 0 }, { r: 0, c: 5 }, { r: 5, c: 5 }],
            blocks: [{ r: 2, c: 1 }, { r: 2, c: 3 }, { r: 4, c: 3 }],
            fixed: [],
            inventory: [{ type: "prism", count: 2 }, { type: "slash", count: 3 }, { type: "backslash", count: 3 }],
            parMoves: 6
        },
        {
            id: 17, name: "Double Portal Circuit", grid: 6,
            emitters: [{ r: 0, c: 1, dir: "S", color: "#a855f7" }],
            crystals: [{ r: 5, c: 0 }, { r: 5, c: 3 }, { r: 0, c: 4 }],
            blocks: [{ r: 2, c: 0 }, { r: 2, c: 3 }],
            portals: [{ r1: 3, c1: 1, r2: 1, c2: 4, exitDir: "S" }],
            fixed: [],
            inventory: [{ type: "prism", count: 2 }, { type: "slash", count: 3 }, { type: "backslash", count: 2 }],
            parMoves: 6
        },
        {
            id: 18, name: "Tri-Emitter Nexus", grid: 6,
            emitters: [
                { r: 0, c: 1, dir: "S", color: "#ef4444" },
                { r: 0, c: 3, dir: "S", color: "#10b981" },
                { r: 0, c: 5, dir: "S", color: "#38bdf8" }
            ],
            crystals: [{ r: 5, c: 1 }, { r: 5, c: 3 }, { r: 5, c: 5 }],
            blocks: [{ r: 2, c: 1 }, { r: 3, c: 3 }, { r: 2, c: 5 }],
            fixed: [],
            inventory: [{ type: "slash", count: 3 }, { type: "backslash", count: 3 }],
            parMoves: 6
        },
        {
            id: 19, name: "Photon Hypercube", grid: 6,
            emitters: [{ r: 2, c: 0, dir: "E", color: "#facc15" }],
            crystals: [{ r: 0, c: 2 }, { r: 0, c: 4 }, { r: 5, c: 2 }, { r: 5, c: 4 }],
            blocks: [{ r: 2, c: 2 }, { r: 2, c: 4 }, { r: 3, c: 3 }],
            fixed: [],
            inventory: [{ type: "prism", count: 3 }, { type: "slash", count: 3 }, { type: "backslash", count: 3 }],
            parMoves: 7
        },
        {
            id: 20, name: "Grandmaster Singularity", grid: 6,
            emitters: [{ r: 0, c: 0, dir: "E", color: "#38bdf8" }, { r: 5, c: 5, dir: "W", color: "#ef4444" }],
            crystals: [{ r: 0, c: 5 }, { r: 5, c: 0 }, { r: 2, c: 2 }, { r: 3, c: 3 }],
            blocks: [{ r: 1, c: 2 }, { r: 4, c: 3 }, { r: 2, c: 4 }, { r: 3, c: 1 }],
            portals: [{ r1: 1, c1: 4, r2: 4, c2: 1, exitDir: "N" }],
            fixed: [],
            inventory: [{ type: "prism", count: 2 }, { type: "slash", count: 4 }, { type: "backslash", count: 4 }],
            parMoves: 8
        }
    ];

    var LaserMirrors = {
        init: function() {
            var urlParams = new URLSearchParams(window.location.search);
            sessionId = urlParams.get('session');
            var lvlParam = parseInt(urlParams.get('lvl'), 10);
            if (!isNaN(lvlParam) && lvlParam >= 1 && lvlParam <= LEVELS.length) {
                currentLevelIdx = lvlParam - 1;
            }
            var p1Url = urlParams.get('p1') || '';
            var p2Url = urlParams.get('p2') || '';

            myPlayerName = window.App ? window.App.getPlayerName() : "Player";

            canvas = document.getElementById('optics-ray-canvas');
            if (canvas) {
                ctx = canvas.getContext('2d');
            }

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
            opponentPlayerName = "Cyber AI";
            isP1 = true;

            $('#p1-name').text(myPlayerName);
            $('#p2-name').text(opponentPlayerName);
            $('#p1-avatar-letter').text(myPlayerName.charAt(0).toUpperCase());
            $('#p2-avatar-letter').text('AI');
            $('#game-mode-badge').text('⚡ Laser & Mirrors: Stage ' + (currentLevelIdx + 1));

            $('#opponent-radar-panel').hide();

            this.loadLevel(currentLevelIdx);
        },

        initMultiplayer: function(p1Url, p2Url) {
            $('#game-mode-badge').text('⚔️ LAN Photon Duel (Live Race)');
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
                hub.client.laserMirrorsProgressReceived = function(data) {
                    if (!data) return;
                    self.updateOpponentRadar(data);
                };

                hub.client.laserMirrorsGameFinished = function(result) {
                    var isMeWinner = (result.WinnerPlayerId === window.GameHubClient.hub.connection.id);
                    self.showGameOverModal(isMeWinner, result.ExtraData.winnerName, result.ExtraData.elapsedSeconds);
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
                window.GameHubClient.hub.server.joinSession(sessionId, myName, 15, p1Url, p2Url);
            });

            // Multiplayer loads deterministic level (Level 8 or 10)
            this.loadLevel(7);
        },

        loadLevel: function(lvlIdx) {
            currentLevelIdx = lvlIdx;
            var lvl = LEVELS[currentLevelIdx];
            GRID_SIZE = lvl.grid || 6;
            moveCount = 0;
            isGameOver = false;
            gameStartTime = Date.now();

            $('#current-stage-title').text('Stage ' + lvl.id + ': ' + lvl.name);
            $('#move-count-badge').text('0 Moves');
            $('#game-mode-badge').text('⚡ Laser & Mirrors: Stage ' + lvl.id);

            // Initialize Board Matrix
            board = [];
            for (var r = 0; r < GRID_SIZE; r++) {
                board[r] = [];
                for (var c = 0; c < GRID_SIZE; c++) {
                    board[r][c] = { type: 'empty' };
                }
            }

            // Place Emitters
            lvl.emitters.forEach(function(em) {
                board[em.r][em.c] = { type: 'emitter', dir: em.dir, color: em.color };
            });

            // Place Crystals
            totalCrystals = lvl.crystals.length;
            lvl.crystals.forEach(function(cr) {
                board[cr.r][cr.c] = { type: 'crystal', powered: false };
            });

            // Place Obsidian Blocks
            if (lvl.blocks) {
                lvl.blocks.forEach(function(bl) {
                    board[bl.r][bl.c] = { type: 'block' };
                });
            }

            // Place Portals
            if (lvl.portals) {
                lvl.portals.forEach(function(p) {
                    board[p.r1][p.c1] = { type: 'portal', targetR: p.r2, targetC: p.c2, exitDir: p.exitDir, id: 'A' };
                    board[p.r2][p.c2] = { type: 'portal', targetR: p.r1, targetC: p.c1, exitDir: p.exitDir, id: 'B' };
                });
            }

            // Place Fixed Mirrors/Prisms
            if (lvl.fixed) {
                lvl.fixed.forEach(function(fx) {
                    board[fx.r][fx.c] = { type: fx.type, fixed: true, dir: fx.dir || 'E' };
                });
            }

            // Setup Inventory
            availableInventory = [];
            if (lvl.inventory) {
                lvl.inventory.forEach(function(inv) {
                    availableInventory.push({
                        type: inv.type,
                        count: inv.count,
                        total: inv.count
                    });
                });
            }

            selectedTool = (availableInventory.length > 0 && availableInventory[0].count > 0) ? availableInventory[0].type : null;

            this.renderChamberGrid();
            this.renderInventoryDock();
            this.computeAndDrawRays();
        },

        renderChamberGrid: function() {
            var $grid = $('#optics-grid-board');
            $grid.empty();

            $grid.css({
                'grid-template-columns': 'repeat(' + GRID_SIZE + ', 1fr)',
                'grid-template-rows': 'repeat(' + GRID_SIZE + ', 1fr)'
            });

            for (var r = 0; r < GRID_SIZE; r++) {
                for (var c = 0; c < GRID_SIZE; c++) {
                    var cell = board[r][c];
                    var $slot = $('<div class="chamber-slot" data-r="' + r + '" data-c="' + c + '"></div>');

                    if (cell.type === 'emitter') {
                        var emHtml = '<div class="element-emitter dir-' + cell.dir + '" style="color: ' + cell.color + '; box-shadow: 0 0 16px ' + cell.color + ';"><span class="emitter-arrow">➤</span></div>';
                        $slot.append(emHtml);
                    } else if (cell.type === 'crystal') {
                        var crHtml = '<div class="element-crystal" id="crystal-' + r + '-' + c + '"><div class="crystal-core">💎</div></div>';
                        $slot.append(crHtml);
                    } else if (cell.type === 'block') {
                        $slot.append('<div class="element-block">⬛</div>');
                    } else if (cell.type === 'portal') {
                        $slot.append('<div class="element-portal">🌀</div>');
                    } else if (cell.type === 'slash') {
                        $slot.append('<div class="element-mirror mirror-slash ' + (cell.fixed ? 'fixed-mirror' : '') + '">╱</div>');
                    } else if (cell.type === 'backslash') {
                        $slot.append('<div class="element-mirror mirror-backslash ' + (cell.fixed ? 'fixed-mirror' : '') + '">╲</div>');
                    } else if (cell.type === 'prism') {
                        $slot.append('<div class="element-prism ' + (cell.fixed ? 'fixed-mirror' : '') + '">🔺</div>');
                    }

                    $grid.append($slot);
                }
            }
        },

        renderInventoryDock: function() {
            var $dock = $('#inventory-dock');
            $dock.empty();

            var self = this;
            availableInventory.forEach(function(item) {
                var symbol = item.type === 'slash' ? '╱ (45°)' : (item.type === 'backslash' ? '╲ (135°)' : '🔺 (Prism)');
                var name = item.type === 'slash' ? 'Mirror A' : (item.type === 'backslash' ? 'Mirror B' : 'Beam Splitter');
                var isSelected = (selectedTool === item.type);

                var $btn = $('<button type="button" class="tool-btn ' + (isSelected ? 'active-tool' : '') + '" data-type="' + item.type + '">' +
                    '<span class="tool-symbol">' + symbol + '</span>' +
                    '<span class="tool-name">' + name + '</span>' +
                    '<span class="tool-badge">' + item.count + ' Left</span>' +
                '</button>');

                if (item.count <= 0) {
                    $btn.prop('disabled', true).addClass('depleted');
                }

                $dock.append($btn);
            });
        },

        bindEvents: function() {
            var self = this;

            // Click Tool in Inventory Dock
            $('#inventory-dock').on('click', '.tool-btn', function(e) {
                e.preventDefault();
                var toolType = $(this).data('type');
                selectedTool = toolType;
                self.renderInventoryDock();
            });

            // Click Cell on Grid Board
            $('#optics-grid-board').on('click', '.chamber-slot', function(e) {
                e.preventDefault();
                if (isGameOver) return;

                var r = parseInt($(this).data('r'), 10);
                var c = parseInt($(this).data('c'), 10);
                self.handleCellClick(r, c);
            });

            // Reset Level
            $('#btn-reset-chamber').on('click', function(e) {
                e.preventDefault();
                self.loadLevel(currentLevelIdx);
            });

            // Level Selector Modal Open
            $('#btn-open-stages-modal').on('click', function(e) {
                e.preventDefault();
                self.openLevelSelectModal();
            });

            // Forfeit Match
            $('#forfeit-game-btn').on('click', function(e) {
                e.preventDefault();
                if (confirm("Exit Optics Chamber?")) {
                    if (isMultiplayer && window.GameHubClient.isConnected()) {
                        window.GameHubClient.hub.server.leaveGame(sessionId);
                    }
                    window.location.href = "../Default.aspx";
                }
            });
        },

        handleCellClick: function(r, c) {
            var cell = board[r][c];

            // 1. If cell has a player-placed mirror, rotate it!
            if ((cell.type === 'slash' || cell.type === 'backslash') && !cell.fixed) {
                cell.type = (cell.type === 'slash') ? 'backslash' : 'slash';
                moveCount++;
                if (window.GameAudio && window.GameAudio.playMirrorRotate) {
                    window.GameAudio.playMirrorRotate();
                }
                this.updateAfterBoardChange();
                return;
            }

            // 2. If cell is empty and a tool is selected, place it!
            if (cell.type === 'empty' && selectedTool) {
                var invItem = availableInventory.find(function(i) { return i.type === selectedTool; });
                if (invItem && invItem.count > 0) {
                    invItem.count--;
                    board[r][c] = { type: selectedTool, fixed: false };
                    moveCount++;

                    if (window.GameAudio && window.GameAudio.playMirrorRotate) {
                        window.GameAudio.playMirrorRotate();
                    }

                    if (invItem.count <= 0) {
                        // Switch to next available tool
                        var nextAvailable = availableInventory.find(function(i) { return i.count > 0; });
                        selectedTool = nextAvailable ? nextAvailable.type : null;
                    }

                    this.updateAfterBoardChange();
                    return;
                }
            }

            // 3. If cell has placed mirror, right-click/remove
            if ((cell.type === 'slash' || cell.type === 'backslash' || cell.type === 'prism') && !cell.fixed) {
                var removedType = cell.type;
                board[r][c] = { type: 'empty' };
                var invItem = availableInventory.find(function(i) { return i.type === removedType; });
                if (invItem) invItem.count++;
                selectedTool = removedType;
                moveCount++;
                this.updateAfterBoardChange();
            }
        },

        updateAfterBoardChange: function() {
            $('#move-count-badge').text(moveCount + ' Moves');
            this.renderChamberGrid();
            this.renderInventoryDock();
            this.computeAndDrawRays();
        },

        computeAndDrawRays: function() {
            if (!canvas || !ctx) return;

            var rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * (window.devicePixelRatio || 1);
            canvas.height = rect.height * (window.devicePixelRatio || 1);
            ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

            ctx.clearRect(0, 0, rect.width, rect.height);

            var cellW = rect.width / GRID_SIZE;
            var cellH = rect.height / GRID_SIZE;

            // Reset powered crystals
            for (var r = 0; r < GRID_SIZE; r++) {
                for (var c = 0; c < GRID_SIZE; c++) {
                    if (board[r][c].type === 'crystal') {
                        board[r][c].powered = false;
                    }
                }
            }

            raySegments = [];
            var rayQueue = [];

            // Find all emitters and initialize rays
            for (var r = 0; r < GRID_SIZE; r++) {
                for (var c = 0; c < GRID_SIZE; c++) {
                    if (board[r][c].type === 'emitter') {
                        var em = board[r][c];
                        var dx = em.dir === 'E' ? 1 : (em.dir === 'W' ? -1 : 0);
                        var dy = em.dir === 'S' ? 1 : (em.dir === 'N' ? -1 : 0);
                        rayQueue.push({
                            r: r, c: c,
                            dx: dx, dy: dy,
                            color: em.color,
                            depth: 0
                        });
                    }
                }
            }

            // Raytracing propagation loop
            var visitedStates = {};

            while (rayQueue.length > 0) {
                var ray = rayQueue.shift();
                if (ray.depth > 30) continue;

                var stateKey = ray.r + ',' + ray.c + ',' + ray.dx + ',' + ray.dy + ',' + ray.color;
                if (visitedStates[stateKey]) continue;
                visitedStates[stateKey] = true;

                var startX = ray.c * cellW + cellW / 2;
                var startY = ray.r * cellH + cellH / 2;

                var nextR = ray.r + ray.dy;
                var nextC = ray.c + ray.dx;

                // Check bounds
                if (nextR < 0 || nextR >= GRID_SIZE || nextC < 0 || nextC >= GRID_SIZE) {
                    var endX = (ray.c + ray.dx * 0.5) * cellW + cellW / 2;
                    var endY = (ray.r + ray.dy * 0.5) * cellH + cellH / 2;
                    raySegments.push({ x1: startX, y1: startY, x2: endX, y2: endY, color: ray.color });
                    continue;
                }

                var targetX = nextC * cellW + cellW / 2;
                var targetY = nextR * cellH + cellH / 2;
                raySegments.push({ x1: startX, y1: startY, x2: targetX, y2: targetY, color: ray.color });

                var nextCell = board[nextR][nextC];

                if (nextCell.type === 'block') {
                    // Absorbed by wall
                    continue;
                } else if (nextCell.type === 'crystal') {
                    nextCell.powered = true;
                    // Continue beam straight through crystal
                    rayQueue.push({
                        r: nextR, c: nextC,
                        dx: ray.dx, dy: ray.dy,
                        color: ray.color,
                        depth: ray.depth + 1
                    });
                } else if (nextCell.type === 'slash') {
                    // '/' Diagonal Mirror
                    // East (dx=1, dy=0) -> North (dx=0, dy=-1)
                    // West (dx=-1, dy=0) -> South (dx=0, dy=1)
                    // South (dx=0, dy=1) -> West (dx=-1, dy=0)
                    // North (dx=0, dy=-1) -> East (dx=1, dy=0)
                    var newDx = -ray.dy;
                    var newDy = -ray.dx;
                    rayQueue.push({
                        r: nextR, c: nextC,
                        dx: newDx, dy: newDy,
                        color: ray.color,
                        depth: ray.depth + 1
                    });
                } else if (nextCell.type === 'backslash') {
                    // '\' Diagonal Mirror
                    // East (dx=1, dy=0) -> South (dx=0, dy=1)
                    // West (dx=-1, dy=0) -> North (dx=0, dy=-1)
                    // South (dx=0, dy=1) -> East (dx=1, dy=0)
                    // North (dx=0, dy=-1) -> West (dx=-1, dy=0)
                    var newDx = ray.dy;
                    var newDy = ray.dx;
                    rayQueue.push({
                        r: nextR, c: nextC,
                        dx: newDx, dy: newDy,
                        color: ray.color,
                        depth: ray.depth + 1
                    });
                } else if (nextCell.type === 'prism') {
                    // Beam Splitter (Straight + 90 deg split)
                    rayQueue.push({
                        r: nextR, c: nextC,
                        dx: ray.dx, dy: ray.dy,
                        color: ray.color,
                        depth: ray.depth + 1
                    });
                    var splitDx = -ray.dy;
                    var splitDy = -ray.dx;
                    rayQueue.push({
                        r: nextR, c: nextC,
                        dx: splitDx, dy: splitDy,
                        color: ray.color,
                        depth: ray.depth + 1
                    });
                } else if (nextCell.type === 'portal') {
                    // Wormhole teleportation
                    var exitDx = ray.dx;
                    var exitDy = ray.dy;
                    if (nextCell.exitDir === 'E') { exitDx = 1; exitDy = 0; }
                    else if (nextCell.exitDir === 'W') { exitDx = -1; exitDy = 0; }
                    else if (nextCell.exitDir === 'S') { exitDx = 0; exitDy = 1; }
                    else if (nextCell.exitDir === 'N') { exitDx = 0; exitDy = -1; }

                    rayQueue.push({
                        r: nextCell.targetR, c: nextCell.targetC,
                        dx: exitDx, dy: exitDy,
                        color: ray.color,
                        depth: ray.depth + 1
                    });
                } else {
                    // Empty cell - continue ray
                    rayQueue.push({
                        r: nextR, c: nextC,
                        dx: ray.dx, dy: ray.dy,
                        color: ray.color,
                        depth: ray.depth + 1
                    });
                }
            }

            // Draw Neon Rays with Multi-Pass Bloom
            raySegments.forEach(function(seg) {
                // Outer Glow Bloom
                ctx.save();
                ctx.strokeStyle = seg.color;
                ctx.lineWidth = 6;
                ctx.shadowColor = seg.color;
                ctx.shadowBlur = 18;
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.moveTo(seg.x1, seg.y1);
                ctx.lineTo(seg.x2, seg.y2);
                ctx.stroke();
                ctx.restore();

                // Bright High-Energy Core
                ctx.save();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2.5;
                ctx.shadowColor = seg.color;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.moveTo(seg.x1, seg.y1);
                ctx.lineTo(seg.x2, seg.y2);
                ctx.stroke();
                ctx.restore();
            });

            // Update Crystal DOM Visual States
            poweredCrystals = 0;
            for (var r = 0; r < GRID_SIZE; r++) {
                for (var c = 0; c < GRID_SIZE; c++) {
                    if (board[r][c].type === 'crystal') {
                        var $cr = $('#crystal-' + r + '-' + c);
                        if (board[r][c].powered) {
                            poweredCrystals++;
                            $cr.addClass('crystal-powered');
                        } else {
                            $cr.removeClass('crystal-powered');
                        }
                    }
                }
            }

            $('#crystal-power-badge').text(poweredCrystals + ' / ' + totalCrystals + ' Crystals Energized');

            // Transmit progress in Multiplayer
            if (isMultiplayer && window.GameHubClient.isConnected()) {
                window.GameHubClient.hub.server.sendLaserMirrorsProgress(sessionId, {
                    poweredCrystals: poweredCrystals,
                    totalCrystals: totalCrystals,
                    moves: moveCount
                });
            }

            // Check Win Condition
            if (poweredCrystals === totalCrystals && totalCrystals > 0 && !isGameOver) {
                this.handleLevelComplete();
            }
        },

        handleLevelComplete: function() {
            isGameOver = true;

            if (window.GameAudio && window.GameAudio.playOpticsWin) {
                window.GameAudio.playOpticsWin();
            }

            var elapsedSeconds = Math.max(Math.floor((Date.now() - gameStartTime) / 1000), 1);
            var lvl = LEVELS[currentLevelIdx];
            var stars = 3;
            if (moveCount > lvl.parMoves + 2) stars = 1;
            else if (moveCount > lvl.parMoves) stars = 2;

            if (isMultiplayer && window.GameHubClient.isConnected()) {
                window.GameHubClient.hub.server.finishLaserMirrorsGame(sessionId, currentLevelIdx + 1, elapsedSeconds);
            } else {
                var self = this;
                setTimeout(function() {
                    self.showGameOverModal(true, myPlayerName, elapsedSeconds, stars);
                }, 600);
            }
        },

        updateOpponentRadar: function(data) {
            $('#opponent-radar-crystals').text('Energized: ' + data.poweredCrystals + ' / ' + data.totalCrystals);
            $('#opponent-radar-moves').text(data.moves + ' Moves');

            var pct = Math.round((data.poweredCrystals / data.totalCrystals) * 100);
            $('#opponent-radar-progress-bar').css('width', pct + '%');
        },

        openLevelSelectModal: function() {
            var self = this;
            var html = '<div id="stage-select-modal" class="modal-backdrop active">' +
                '<div class="modal-box" style="max-width: 520px;">' +
                    '<h2 class="modal-title">⚡ Select Optics Chamber</h2>' +
                    '<p class="modal-text">Select any of the 20 progressive optical stages:</p>' +
                    '<div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin: 16px 0; max-height: 360px; overflow-y: auto;">';

            LEVELS.forEach(function(lvl, idx) {
                var isCurrent = (idx === currentLevelIdx);
                html += '<button type="button" class="btn ' + (isCurrent ? 'btn-primary' : 'btn-outline') + ' stage-pick-btn" data-idx="' + idx + '" style="padding: 12px 6px; font-size: 0.9rem; font-weight: 800; display: flex; flex-direction: column; align-items: center;">' +
                    '<span>' + lvl.id + '</span>' +
                    '<span style="font-size: 0.7rem; opacity: 0.8; margin-top: 2px;">' + (lvl.grid + 'x' + lvl.grid) + '</span>' +
                '</button>';
            });

            html += '</div>' +
                '<button type="button" class="btn btn-outline" id="close-stages-modal" style="width: 100%;">Close</button>' +
                '</div></div>';

            $('#stage-select-modal').remove();
            $('body').append(html);

            $('.stage-pick-btn').on('click', function(e) {
                e.preventDefault();
                var idx = parseInt($(this).data('idx'), 10);
                $('#stage-select-modal').removeClass('active').remove();
                self.loadLevel(idx);
            });

            $('#close-stages-modal').on('click', function(e) {
                e.preventDefault();
                $('#stage-select-modal').removeClass('active').remove();
            });
        },

        showGameOverModal: function(isWin, winnerName, elapsedSeconds, stars) {
            var self = this;
            var starsHtml = '⭐'.repeat(stars || 3);
            var isLastStage = (currentLevelIdx >= LEVELS.length - 1);

            var summaryHtml = '<div style="background: rgba(15,23,42,0.8); border: 1px solid #334155; border-radius: 12px; padding: 14px; margin: 14px 0; text-align: left;">' +
                '<div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>Stage Efficiency:</span><strong style="color: #fbbf24; font-size: 1.1rem;">' + starsHtml + '</strong></div>' +
                '<div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>Moves Used:</span><strong style="color: #38bdf8;">' + moveCount + ' Moves</strong></div>' +
                '<div style="display: flex; justify-content: space-between;"><span>Elapsed Time:</span><strong style="color: #34d399;">' + elapsedSeconds + 's</strong></div>' +
            '</div>';

            var modalText = isWin 
                ? ("Photon network fully synchronized! All target crystals energized!" + summaryHtml)
                : ("Chamber overloaded! " + winnerName + " won the photon duel!" + summaryHtml);

            window.App.showGameModal({
                title: isWin ? "🏆 Chamber Energized!" : "⚡ Photon Race Over",
                text: modalText,
                html: modalText,
                isWin: isWin,
                onRematch: function() {
                    if (isWin && !isLastStage) {
                        self.loadLevel(currentLevelIdx + 1);
                    } else {
                        self.loadLevel(currentLevelIdx);
                    }
                }
            });
        }
    };

    $(document).ready(function() {
        LaserMirrors.init();
    });

    window.LaserMirrors = LaserMirrors;

})(window, jQuery);
