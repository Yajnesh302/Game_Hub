/* ==========================================================================
   GAME HUB - AlgoBot: Maze Runner & Pathfinding (Visual Programming VM)
   Features:
   - Visual Instruction Pipeline (MAIN, Subroutine F1, Subroutine F2)
   - Call Stack Virtual Machine with Tail-Recursion & Step-Through Debugger
   - 20 Handcrafted Algorithmic Stages with 3-Star Memory Efficiency Ratings
   - Real-Time LAN Multiplayer Duel with Live Telemetry Radar
   ========================================================================== */

(function(window, $) {
    'use strict';

    var isMultiplayer = false;
    var sessionId = null;
    var currentLevelIdx = 0;
    var myPlayerName = "Coder";
    var opponentPlayerName = "Rival";
    var isP1 = true;
    var isGameOver = false;

    // Registers
    var registers = {
        MAIN: [],
        F1: [],
        F2: []
    };
    var activeRegister = 'MAIN';

    // VM State
    var vm = {
        isRunning: false,
        isPaused: false,
        timer: null,
        speed: 250, // ms per step
        stepCount: 0,
        callStack: [], // [{ reg: 'MAIN', ip: 0 }]
        botX: 0,
        botY: 0,
        botDir: 'E', // 'N', 'E', 'S', 'W'
        chipsCollected: 0,
        switchesActivated: {},
        gatesOpen: {}
    };

    var canvas, ctx;
    var GRID_SIZE = 7;
    var CELL_SIZE = 56;
    var gameStartTime = Date.now();

    // 100 Handcrafted & Procedural Algorithmic Level Dataset
    function generate100Levels() {
        var levels = [
            // Tier 1: Fundamentals (1-20)
            { id: 1, name: "First Instructions", grid: 6, bot: { x: 1, y: 3, dir: "E" }, exit: { x: 4, y: 3 }, chips: [{ x: 3, y: 3 }], walls: [{ x: 2, y: 1 }, { x: 2, y: 5 }], hazards: [], limits: { MAIN: 24, F1: 16, F2: 16 }, parInstructions: 4 },
            { id: 2, name: "Navigation & Turning", grid: 6, bot: { x: 1, y: 1, dir: "E" }, exit: { x: 4, y: 4 }, chips: [{ x: 4, y: 1 }, { x: 2, y: 4 }], walls: [{ x: 2, y: 2 }, { x: 3, y: 2 }], hazards: [], limits: { MAIN: 24, F1: 16, F2: 16 }, parInstructions: 7 },
            { id: 3, name: "Thruster Jumps", grid: 6, bot: { x: 1, y: 2, dir: "E" }, exit: { x: 5, y: 2 }, chips: [{ x: 4, y: 2 }], walls: [], hazards: [{ x: 2, y: 2 }, { x: 3, y: 2 }], limits: { MAIN: 24, F1: 16, F2: 16 }, parInstructions: 4 },
            { id: 4, name: "Data Chip Harvester", grid: 6, bot: { x: 1, y: 4, dir: "N" }, exit: { x: 4, y: 1 }, chips: [{ x: 1, y: 1 }, { x: 4, y: 3 }, { x: 4, y: 4 }], walls: [{ x: 2, y: 2 }, { x: 3, y: 3 }], hazards: [], limits: { MAIN: 24, F1: 16, F2: 16 }, parInstructions: 11 },
            { id: 5, name: "Canyon Zigzag", grid: 6, bot: { x: 0, y: 1, dir: "E" }, exit: { x: 5, y: 4 }, chips: [{ x: 2, y: 1 }, { x: 3, y: 4 }], walls: [{ x: 2, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 2 }, { x: 3, y: 3 }], hazards: [{ x: 1, y: 1 }], limits: { MAIN: 24, F1: 16, F2: 16 }, parInstructions: 11 },
            { id: 6, name: "Function Subroutine F1", grid: 7, bot: { x: 1, y: 5, dir: "N" }, exit: { x: 5, y: 1 }, chips: [{ x: 1, y: 1 }, { x: 3, y: 1 }], walls: [{ x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }], hazards: [], limits: { MAIN: 24, F1: 16, F2: 16 }, parInstructions: 7 },
            { id: 7, name: "Square Perimeter Loop", grid: 6, bot: { x: 1, y: 1, dir: "E" }, exit: { x: 1, y: 2 }, chips: [{ x: 4, y: 1 }, { x: 4, y: 4 }, { x: 1, y: 4 }], walls: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 3 }], hazards: [], limits: { MAIN: 24, F1: 16, F2: 16 }, parInstructions: 6 },
            { id: 8, name: "Staircase Climbing", grid: 7, bot: { x: 1, y: 5, dir: "N" }, exit: { x: 5, y: 1 }, chips: [{ x: 2, y: 4 }, { x: 3, y: 3 }, { x: 4, y: 2 }], walls: [{ x: 1, y: 4 }, { x: 2, y: 3 }, { x: 3, y: 2 }], hazards: [], limits: { MAIN: 24, F1: 16, F2: 16 }, parInstructions: 6 },
            { id: 9, name: "Recursive Tail-Call", grid: 7, bot: { x: 1, y: 1, dir: "E" }, exit: { x: 5, y: 5 }, chips: [{ x: 3, y: 1 }, { x: 5, y: 1 }, { x: 5, y: 3 }], walls: [{ x: 2, y: 3 }, { x: 3, y: 3 }], hazards: [], limits: { MAIN: 24, F1: 16, F2: 16 }, parInstructions: 5 },
            { id: 10, name: "Hazard Slalom", grid: 7, bot: { x: 0, y: 3, dir: "E" }, exit: { x: 6, y: 3 }, chips: [{ x: 2, y: 3 }, { x: 4, y: 3 }], walls: [], hazards: [{ x: 1, y: 3 }, { x: 3, y: 3 }, { x: 5, y: 3 }], limits: { MAIN: 24, F1: 16, F2: 16 }, parInstructions: 4 },
            { id: 11, name: "Dual Functions (F1 & F2)", grid: 7, bot: { x: 1, y: 5, dir: "E" }, exit: { x: 5, y: 1 }, chips: [{ x: 3, y: 5 }, { x: 5, y: 5 }, { x: 5, y: 3 }], walls: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }], hazards: [], limits: { MAIN: 24, F1: 16, F2: 16 }, parInstructions: 8 },
            { id: 12, name: "Switch & Laser Gate", grid: 7, bot: { x: 1, y: 3, dir: "E" }, exit: { x: 5, y: 3 }, chips: [{ x: 4, y: 3 }], switches: [{ x: 1, y: 1, gateId: 'G1' }], gates: [{ x: 3, y: 3, id: 'G1', open: false }], walls: [{ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 4 }, { x: 3, y: 5 }], hazards: [], limits: { MAIN: 24, F1: 16, F2: 16 }, parInstructions: 9 },
            { id: 13, name: "Nested Subroutine Matrix", grid: 7, bot: { x: 0, y: 0, dir: "E" }, exit: { x: 6, y: 6 }, chips: [{ x: 2, y: 2 }, { x: 4, y: 4 }], walls: [{ x: 1, y: 3 }, { x: 3, y: 1 }, { x: 3, y: 5 }, { x: 5, y: 3 }], hazards: [], limits: { MAIN: 24, F1: 16, F2: 16 }, parInstructions: 8 },
            { id: 14, name: "Dual Switch Vault", grid: 7, bot: { x: 1, y: 3, dir: "N" }, exit: { x: 5, y: 3 }, chips: [{ x: 4, y: 3 }], switches: [{ x: 1, y: 1, gateId: 'G1' }, { x: 1, y: 5, gateId: 'G2' }], gates: [{ x: 3, y: 2, id: 'G1', open: false }, { x: 3, y: 4, id: 'G2', open: false }], walls: [{ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 3 }, { x: 3, y: 5 }, { x: 3, y: 6 }], hazards: [], limits: { MAIN: 24, F1: 16, F2: 16 }, parInstructions: 12 },
            { id: 15, name: "Diamond Recursion", grid: 7, bot: { x: 3, y: 0, dir: "E" }, exit: { x: 3, y: 1 }, chips: [{ x: 6, y: 3 }, { x: 3, y: 6 }, { x: 0, y: 3 }], walls: [{ x: 3, y: 3 }, { x: 2, y: 3 }, { x: 4, y: 3 }], hazards: [], limits: { MAIN: 24, F1: 16, F2: 16 }, parInstructions: 7 },
            { id: 16, name: "Labyrinth Memory Golf", grid: 7, bot: { x: 1, y: 1, dir: "E" }, exit: { x: 5, y: 5 }, chips: [{ x: 1, y: 5 }, { x: 3, y: 3 }, { x: 5, y: 1 }], walls: [{ x: 2, y: 1 }, { x: 4, y: 3 }, { x: 2, y: 5 }], hazards: [{ x: 3, y: 1 }, { x: 3, y: 5 }], limits: { MAIN: 24, F1: 16, F2: 16 }, parInstructions: 9 },
            { id: 17, name: "Switch & Trench Jump", grid: 7, bot: { x: 0, y: 2, dir: "E" }, exit: { x: 6, y: 4 }, chips: [{ x: 5, y: 2 }], switches: [{ x: 2, y: 0, gateId: 'G1' }], gates: [{ x: 4, y: 4, id: 'G1', open: false }], walls: [{ x: 4, y: 0 }, { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }], hazards: [{ x: 1, y: 2 }, { x: 3, y: 2 }, { x: 5, y: 4 }], limits: { MAIN: 24, F1: 16, F2: 16 }, parInstructions: 11 },
            { id: 18, name: "Spiral Memory Crunch", grid: 7, bot: { x: 0, y: 0, dir: "E" }, exit: { x: 3, y: 3 }, chips: [{ x: 6, y: 0 }, { x: 6, y: 6 }, { x: 1, y: 6 }, { x: 1, y: 2 }, { x: 4, y: 2 }], walls: [{ x: 2, y: 4 }, { x: 4, y: 4 }], hazards: [], limits: { MAIN: 24, F1: 16, F2: 16 }, parInstructions: 8 },
            { id: 19, name: "Quantum Gate Network", grid: 7, bot: { x: 0, y: 3, dir: "E" }, exit: { x: 6, y: 3 }, chips: [{ x: 2, y: 3 }, { x: 5, y: 3 }], switches: [{ x: 1, y: 1, gateId: 'G1' }, { x: 5, y: 1, gateId: 'G2' }], gates: [{ x: 3, y: 3, id: 'G1', open: false }, { x: 4, y: 3, id: 'G2', open: false }], walls: [{ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 4, y: 4 }, { x: 4, y: 5 }], hazards: [], limits: { MAIN: 24, F1: 16, F2: 16 }, parInstructions: 11 },
            { id: 20, name: "Grandmaster Turing Maze", grid: 7, bot: { x: 0, y: 0, dir: "S" }, exit: { x: 6, y: 6 }, chips: [{ x: 0, y: 6 }, { x: 6, y: 0 }, { x: 3, y: 3 }], switches: [{ x: 0, y: 4, gateId: 'G1' }], gates: [{ x: 5, y: 5, id: 'G1', open: false }], walls: [{ x: 2, y: 2 }, { x: 4, y: 2 }, { x: 2, y: 4 }, { x: 4, y: 4 }], hazards: [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 5, y: 6 }], limits: { MAIN: 24, F1: 16, F2: 16 }, parInstructions: 12 }
        ];

        // Generate Levels 21 to 100
        var titles = [
            // Tier 2: DRY & Function 1 Loops (21-40)
            "Perimeter Sentry", "Binary Tree Branch", "Orthogonal Stepper", "Cross Corridor Relay", "Double Stairway",
            "Diamond Perimeter", "Zigzag Promenade", "Symmetric Vault", "Mirror Track", "Concentric Square A",
            "Trench Hurdle Alpha", "Radial Sensor Array", "Matrix Helix", "Subroutine Cascades", "Quadrilateral Scan",
            "Lattice Walk", "Corridor Sweeper", "Alternating Step", "Box Loop Recursive", "Fortress Ramparts",

            // Tier 3: Dual Subroutines F1 & F2 (41-60)
            "Dual Relay Delta", "Nested Diamond Loop", "Bifurcated Canyon", "Helix Ladder", "Fractal Tree Grid",
            "Interlocking Subroutines", "Symmetric Octagon", "Two-Stage Pipeline", "Concentric Square B", "Checkerboard Hop",
            "Recursive Fractal", "Quadrant Harvester", "Dual Axis Reflex", "Prism Chamber", "Zigzag Recursion B",
            "Dual Stair Climber", "Labyrinth Pinwheel", "Vector Matrix", "Star Polygon Loop", "Binary Search Path",

            // Tier 4: Gate Networks & Switches (61-80)
            "Laser Relay Alpha", "Switch Sequence Beta", "Dual Gate Lockout", "Vault Perimeter Key", "Laser Crossroad",
            "Trench & Switch Jump", "Quantum Sentry Gate", "Logic Circuit A", "Bypass Switch Corridor", "Tri-Gate Network",
            "Laser Vault Labyrinth", "Keycard Relay", "Security Grid Gamma", "Backtrack Trigger", "Switch Corridor Sprint",
            "Dynamic Obstacle Gate", "High-Voltage Grid", "Dual Sector Unlocking", "Logic Gate Array", "Citadel Security Core",

            // Tier 5: Grandmaster Turing Challenges (81-100)
            "Turing Machine Array", "Quantum Memory Golf", "Omega Labyrinth A", "Recursive Hypercube", "Concentric Mega-Loop",
            "Infinite Stack Depth", "Master Pathfinding Test", "Hexagonal Circuit", "Multi-Phase Relay", "Quantum Entanglement",
            "Zero-Byte Optimization", "Turing Machine Beta", "Singularity Corridor", "Memory Crunch Ultima", "Omega Laser Grid",
            "Fractal Matrix Extreme", "Logic Gate Citadel", "Recursive Depth 99", "Grandmaster Path", "The Omega Turing Labyrinth"
        ];

        for (var i = 21; i <= 100; i++) {
            var tier = Math.ceil(i / 20); // 2, 3, 4, 5
            var title = titles[i - 21] || ("Algorithmic Chamber " + i);
            var gSize = 7;
            var startX = (i % 3 === 0) ? 0 : 1;
            var startY = (i % 2 === 0) ? 5 : 1;
            var startDir = (startY === 5) ? "N" : "E";
            var exitX = (startX === 0) ? 6 : 5;
            var exitY = (startY === 5) ? 1 : 5;

            var lvlChips = [];
            var lvlWalls = [];
            var lvlHazards = [];
            var lvlSwitches = [];
            var lvlGates = [];

            // Clean, reachable geometry per tier
            if (tier === 2) {
                // Tier 2: Symmetrical loops & subroutines
                lvlChips.push({ x: 3, y: 1 }, { x: 5, y: 3 });
                lvlWalls.push({ x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 });
                if (i % 2 === 0) lvlHazards.push({ x: 2, y: 1 });
            } else if (tier === 3) {
                // Tier 3: Dual subroutines & nested functions
                lvlChips.push({ x: 2, y: 2 }, { x: 4, y: 2 }, { x: 2, y: 4 });
                lvlWalls.push({ x: 3, y: 1 }, { x: 3, y: 5 }, { x: 1, y: 3 }, { x: 5, y: 3 });
                if (i % 3 === 0) lvlHazards.push({ x: 3, y: 2 }, { x: 3, y: 4 });
            } else if (tier === 4) {
                // Tier 4: Switches and laser gates
                lvlChips.push({ x: 3, y: 1 }, { x: 5, y: 3 });
                var swX = (i % 2 === 0) ? 1 : 5;
                var swY = (i % 2 === 0) ? 1 : 5;
                lvlSwitches.push({ x: swX, y: swY, gateId: 'G1' });
                lvlGates.push({ x: 3, y: 3, id: 'G1', open: false });
                lvlWalls.push({ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 4 }, { x: 3, y: 5 });
                if (i % 2 === 1) {
                    lvlSwitches.push({ x: 1, y: 5, gateId: 'G2' });
                    lvlGates.push({ x: 4, y: 3, id: 'G2', open: false });
                }
            } else {
                // Tier 5: Turing Grandmaster (Stage 99 etc)
                lvlChips.push({ x: 1, y: 3 }, { x: 3, y: 1 }, { x: 5, y: 3 });
                lvlSwitches.push({ x: 1, y: 1, gateId: 'G1' });
                lvlGates.push({ x: 4, y: 4, id: 'G1', open: false });
                lvlWalls.push({ x: 2, y: 2 }, { x: 4, y: 2 }, { x: 2, y: 4 });
                lvlHazards.push({ x: 3, y: 3 });
            }

            levels.push({
                id: i,
                name: title,
                grid: gSize,
                bot: { x: startX, y: startY, dir: startDir },
                exit: { x: exitX, y: exitY },
                chips: lvlChips,
                walls: lvlWalls,
                hazards: lvlHazards,
                switches: lvlSwitches.length > 0 ? lvlSwitches : undefined,
                gates: lvlGates.length > 0 ? lvlGates : undefined,
                limits: { MAIN: 24, F1: 16, F2: 16 },
                parInstructions: 6 + (i % 6)
            });
        }

        return levels;
    }

    var LEVELS = generate100Levels();

    var AlgoBot = {
        init: function() {
            var urlParams = new URLSearchParams(window.location.search);
            sessionId = urlParams.get('session');
            var lvlParam = parseInt(urlParams.get('lvl'), 10);
            if (!isNaN(lvlParam) && lvlParam >= 1 && lvlParam <= LEVELS.length) {
                currentLevelIdx = lvlParam - 1;
            }
            var p1Url = urlParams.get('p1') || '';
            var p2Url = urlParams.get('p2') || '';

            myPlayerName = window.App ? window.App.getPlayerName() : "Coder";

            canvas = document.getElementById('algobot-canvas');
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
            $('#game-mode-badge').text('⚡ AlgoBot: Stage ' + (currentLevelIdx + 1));

            $('#opponent-radar-panel').hide();

            this.loadLevel(currentLevelIdx);
        },

        initMultiplayer: function(p1Url, p2Url) {
            $('#game-mode-badge').text('⚔️ LAN Algorithm Duel (Live Race)');
            var self = this;
            var myName = window.App ? window.App.getPlayerName() : "Coder";

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
                hub.client.algoBotProgressReceived = function(data) {
                    if (!data) return;
                    self.updateOpponentRadar(data);
                };

                hub.client.algoBotGameFinished = function(result) {
                    var isMeWinner = (result.WinnerPlayerId === window.GameHubClient.hub.connection.id);
                    self.showGameOverModal(isMeWinner, result.ExtraData.winnerName, result.ExtraData.instructionsUsed, result.ExtraData.elapsedSeconds);
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
                window.GameHubClient.hub.server.joinSession(sessionId, myName, 16, p1Url, p2Url);
            });

            // Multiplayer loads deterministic level (e.g., Level 7)
            this.loadLevel(6);
        },

        loadLevel: function(lvlIdx) {
            this.stopExecution();
            currentLevelIdx = lvlIdx;
            var lvl = LEVELS[currentLevelIdx];
            GRID_SIZE = lvl.grid || 7;
            isGameOver = false;
            gameStartTime = Date.now();

            $('#current-stage-title').text('Stage ' + lvl.id + ': ' + lvl.name);
            $('#game-mode-badge').text('⚡ AlgoBot: Stage ' + lvl.id);

            registers = { MAIN: [], F1: [], F2: [] };
            activeRegister = 'MAIN';
            $('.reg-tab-btn').removeClass('active-tab');
            $('.reg-tab-btn[data-reg="MAIN"]').addClass('active-tab');
            $('.register-slots').hide();
            $('#slots-MAIN').show();

            this.resetBotToStart();
            this.renderRegisters();
            this.renderBoard();
        },

        resetBotToStart: function() {
            var lvl = LEVELS[currentLevelIdx];
            vm.botX = lvl.bot.x;
            vm.botY = lvl.bot.y;
            vm.botDir = lvl.bot.dir;
            vm.chipsCollected = 0;
            vm.switchesActivated = {};
            vm.gatesOpen = {};
            vm.callStack = [];
            vm.stepCount = 0;

            if (lvl.chips) {
                lvl.chips.forEach(function(ch) {
                    ch.collected = false;
                });
            }

            if (lvl.gates) {
                lvl.gates.forEach(function(g) {
                    vm.gatesOpen[g.id] = g.open || false;
                });
            }

            this.updateChipsBadge();
            this.clearHighlights();
            this.renderBoard();
        },

        updateChipsBadge: function() {
            var lvl = LEVELS[currentLevelIdx];
            var total = lvl.chips ? lvl.chips.length : 0;
            $('#chips-count-badge').text(vm.chipsCollected + ' / ' + total + ' Data Chips');
        },

        bindEvents: function() {
            var self = this;

            // Command Block Palette Click
            $('.cmd-palette-btn').on('click', function(e) {
                e.preventDefault();
                if (vm.isRunning) return;

                var cmd = $(this).data('cmd');
                self.addCommandToActiveRegister(cmd);
            });

            // Active Register Switch
            $('.reg-tab-btn').on('click', function(e) {
                e.preventDefault();
                if ($(this).hasClass('disabled-tab')) return;
                $('.reg-tab-btn').removeClass('active-tab');
                $(this).addClass('active-tab');
                activeRegister = $(this).data('reg');
                $('.register-slots').hide();
                $('#slots-' + activeRegister).show();
            });

            // Remove Command from Register
            $('.register-slots').on('click', '.cmd-block', function(e) {
                e.preventDefault();
                if (vm.isRunning) return;

                var reg = $(this).data('reg');
                var idx = parseInt($(this).data('idx'), 10);
                registers[reg].splice(idx, 1);
                self.renderRegisters();
            });

            // Play / Run Program
            $('#btn-run-program').on('click', function(e) {
                e.preventDefault();
                self.runProgram();
            });

            // Step Debugger
            $('#btn-step-program').on('click', function(e) {
                e.preventDefault();
                self.stepProgram();
            });

            // Reset Execution
            $('#btn-reset-program').on('click', function(e) {
                e.preventDefault();
                self.stopExecution();
                self.resetBotToStart();
            });

            // Clear Code Register
            $('#btn-clear-register').on('click', function(e) {
                e.preventDefault();
                if (vm.isRunning) return;
                registers[activeRegister] = [];
                self.renderRegisters();
            });

            // Speed Controls
            $('.speed-btn').on('click', function(e) {
                e.preventDefault();
                $('.speed-btn').removeClass('active-speed');
                $(this).addClass('active-speed');
                vm.speed = parseInt($(this).data('speed'), 10);
            });

            // Level Selector Modal Open
            $('#btn-open-stages-modal').on('click', function(e) {
                e.preventDefault();
                self.openLevelSelectModal();
            });

            // Forfeit Match
            $('#forfeit-game-btn').on('click', function(e) {
                e.preventDefault();
                if (confirm("Exit AlgoBot Terminal?")) {
                    if (isMultiplayer && window.GameHubClient.isConnected()) {
                        window.GameHubClient.hub.server.leaveGame(sessionId);
                    }
                    window.location.href = "../Default.aspx";
                }
            });
        },

        addCommandToActiveRegister: function(cmd) {
            var lvl = LEVELS[currentLevelIdx];
            var limit = lvl.limits[activeRegister] || 0;

            if (registers[activeRegister].length >= limit) {
                if (window.GameAudio && window.GameAudio.playBotCrash) {
                    window.GameAudio.playBotCrash();
                }
                return;
            }

            registers[activeRegister].push(cmd);
            if (window.GameAudio && window.GameAudio.playBotStep) {
                window.GameAudio.playBotStep();
            }

            this.renderRegisters();
        },

        renderRegisters: function() {
            var lvl = LEVELS[currentLevelIdx];

            ['MAIN', 'F1', 'F2'].forEach(function(reg) {
                var $container = $('#slots-' + reg);
                $container.empty();

                var limit = lvl.limits[reg] || 0;
                var $tab = $('.reg-tab-btn[data-reg="' + reg + '"]');

                if (limit === 0) {
                    $tab.addClass('disabled-tab').prop('disabled', true);
                    $container.append('<div style="font-size: 0.75rem; color: #475569; padding: 6px;">Locked in this stage</div>');
                    return;
                } else {
                    $tab.removeClass('disabled-tab').prop('disabled', false);
                }

                var list = registers[reg];
                for (var i = 0; i < limit; i++) {
                    if (i < list.length) {
                        var cmd = list[i];
                        var info = AlgoBot.getCommandInfo(cmd);
                        var $slot = $('<div class="cmd-block ' + info.cls + '" data-reg="' + reg + '" data-idx="' + i + '" id="slot-' + reg + '-' + i + '" title="Click to delete">' +
                            '<span>' + info.icon + '</span>' +
                            '<span>' + info.name + '</span>' +
                        '</div>');
                        $container.append($slot);
                    } else {
                        $container.append('<div class="empty-cmd-slot">' + (i + 1) + '</div>');
                    }
                }
            });

            var totalUsed = registers.MAIN.length + registers.F1.length + registers.F2.length;
            $('#total-bytes-badge').text(totalUsed + ' / ' + lvl.parInstructions + ' Par Instructions');

            // Send telemetry in Multiplayer
            if (isMultiplayer && window.GameHubClient.isConnected()) {
                window.GameHubClient.hub.server.sendAlgoBotProgress(sessionId, {
                    instructionsUsed: totalUsed,
                    chipsCollected: vm.chipsCollected,
                    status: vm.isRunning ? "Running" : "Idle"
                });
            }
        },

        getCommandInfo: function(cmd) {
            switch (cmd) {
                case 'MOVE': return { name: 'MOVE', icon: '🚶', cls: 'cmd-move' };
                case 'LEFT': return { name: 'TURN_L', icon: '↺', cls: 'cmd-turn' };
                case 'RIGHT': return { name: 'TURN_R', icon: '↻', cls: 'cmd-turn' };
                case 'JUMP': return { name: 'JUMP', icon: '⚡', cls: 'cmd-jump' };
                case 'ACTIVATE': return { name: 'ACTIVATE', icon: '💡', cls: 'cmd-act' };
                case 'F1': return { name: 'CALL F1', icon: '📦', cls: 'cmd-f1' };
                case 'F2': return { name: 'CALL F2', icon: '📦', cls: 'cmd-f2' };
                default: return { name: cmd, icon: '⚙️', cls: '' };
            }
        },

        renderBoard: function() {
            if (!canvas || !ctx) return;

            var rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * (window.devicePixelRatio || 1);
            canvas.height = rect.height * (window.devicePixelRatio || 1);
            ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

            ctx.clearRect(0, 0, rect.width, rect.height);

            var cellW = rect.width / GRID_SIZE;
            var cellH = rect.height / GRID_SIZE;
            var lvl = LEVELS[currentLevelIdx];

            // 1. Draw Grid Tiles
            for (var r = 0; r < GRID_SIZE; r++) {
                for (var c = 0; c < GRID_SIZE; c++) {
                    var x = c * cellW;
                    var y = r * cellH;

                    // Base tile
                    ctx.fillStyle = '#0f172a';
                    ctx.strokeStyle = '#1e293b';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.rect(x + 2, y + 2, cellW - 4, cellH - 4);
                    ctx.fill();
                    ctx.stroke();

                    // Grid coordinate subtle text
                    ctx.fillStyle = '#334155';
                    ctx.font = '9px monospace';
                    ctx.fillText(c + ',' + r, x + 5, y + 12);
                }
            }

            // 2. Draw Hazards
            if (lvl.hazards) {
                lvl.hazards.forEach(function(h) {
                    var x = h.x * cellW;
                    var y = h.y * cellH;
                    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
                    ctx.strokeStyle = '#ef4444';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.rect(x + 4, y + 4, cellW - 8, cellH - 8);
                    ctx.fill();
                    ctx.stroke();

                    ctx.fillStyle = '#ef4444';
                    ctx.font = '16px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('⚡', x + cellW / 2, y + cellH / 2 + 6);
                });
            }

            // 3. Draw Obsidian Walls
            if (lvl.walls) {
                lvl.walls.forEach(function(w) {
                    var x = w.x * cellW;
                    var y = w.y * cellH;
                    ctx.fillStyle = '#1e293b';
                    ctx.strokeStyle = '#334155';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.rect(x + 3, y + 3, cellW - 6, cellH - 6);
                    ctx.fill();
                    ctx.stroke();

                    ctx.fillStyle = '#0f172a';
                    ctx.beginPath();
                    ctx.rect(x + 7, y + 7, cellW - 14, cellH - 14);
                    ctx.fill();
                });
            }

            // 4. Draw Switches & Laser Gates
            if (lvl.switches) {
                lvl.switches.forEach(function(sw) {
                    var x = sw.x * cellW;
                    var y = sw.y * cellH;
                    var isPressed = vm.switchesActivated[sw.gateId];
                    ctx.fillStyle = isPressed ? 'rgba(52, 211, 153, 0.4)' : 'rgba(250, 204, 21, 0.3)';
                    ctx.strokeStyle = isPressed ? '#34d399' : '#facc15';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(x + cellW / 2, y + cellH / 2, 14, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();

                    ctx.font = '12px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('🔘', x + cellW / 2, y + cellH / 2 + 4);
                });
            }

            if (lvl.gates) {
                lvl.gates.forEach(function(gt) {
                    var x = gt.x * cellW;
                    var y = gt.y * cellH;
                    var isOpen = vm.gatesOpen[gt.id];
                    if (!isOpen) {
                        ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
                        ctx.strokeStyle = '#f43f5e';
                        ctx.lineWidth = 3;
                        ctx.beginPath();
                        ctx.moveTo(x + 4, y + cellH / 2);
                        ctx.lineTo(x + cellW - 4, y + cellH / 2);
                        ctx.stroke();

                        ctx.font = '12px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.fillText('⛔', x + cellW / 2, y + cellH / 2 + 4);
                    }
                });
            }

            // 5. Draw Data Chips
            if (lvl.chips) {
                lvl.chips.forEach(function(ch) {
                    if (ch.collected) return;
                    var x = ch.x * cellW;
                    var y = ch.y * cellH;

                    ctx.save();
                    ctx.shadowColor = '#38bdf8';
                    ctx.shadowBlur = 12;
                    ctx.font = '20px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('💎', x + cellW / 2, y + cellH / 2 + 7);
                    ctx.restore();
                });
            }

            // 6. Draw Exit Terminal
            if (lvl.exit) {
                var ex = lvl.exit.x * cellW;
                var ey = lvl.exit.y * cellH;
                ctx.save();
                ctx.strokeStyle = '#34d399';
                ctx.lineWidth = 2.5;
                ctx.shadowColor = '#34d399';
                ctx.shadowBlur = 14;
                ctx.beginPath();
                ctx.rect(ex + 4, ey + 4, cellW - 8, cellH - 8);
                ctx.stroke();

                ctx.font = '18px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🏁', ex + cellW / 2, ey + cellH / 2 + 6);
                ctx.restore();
            }

            // 7. Draw Cyber Bot Drone
            var bx = vm.botX * cellW + cellW / 2;
            var by = vm.botY * cellH + cellH / 2;

            ctx.save();
            ctx.translate(bx, by);

            var angle = 0;
            if (vm.botDir === 'E') angle = 0;
            else if (vm.botDir === 'S') angle = Math.PI / 2;
            else if (vm.botDir === 'W') angle = Math.PI;
            else if (vm.botDir === 'N') angle = -Math.PI / 2;

            ctx.rotate(angle);

            // Bot Glow Chassis
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 16;
            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.arc(0, 0, 16, 0, Math.PI * 2);
            ctx.fill();

            // Cockpit & Directional Arrow
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(12, 0);
            ctx.lineTo(-6, -8);
            ctx.lineTo(-2, 0);
            ctx.lineTo(-6, 8);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        },

        runProgram: function() {
            if (registers.MAIN.length === 0) {
                if (window.App) window.App.toast("Add instruction blocks to MAIN first!", "warning");
                return;
            }

            this.stopExecution();
            this.resetBotToStart();

            vm.isRunning = true;
            vm.isPaused = false;
            vm.callStack = [{ reg: 'MAIN', ip: 0 }];

            var self = this;
            vm.timer = setInterval(function() {
                self.executeNextStep();
            }, vm.speed);
        },

        stepProgram: function() {
            if (!vm.isRunning) {
                if (registers.MAIN.length === 0) return;
                this.resetBotToStart();
                vm.isRunning = true;
                vm.isPaused = true;
                vm.callStack = [{ reg: 'MAIN', ip: 0 }];
            }

            this.executeNextStep();
        },

        stopExecution: function() {
            if (vm.timer) {
                clearInterval(vm.timer);
                vm.timer = null;
            }
            vm.isRunning = false;
            vm.isPaused = false;
            this.clearHighlights();
        },

        clearHighlights: function() {
            $('.cmd-block').removeClass('executing-cmd');
        },

        executeNextStep: function() {
            if (vm.callStack.length === 0) {
                this.stopExecution();
                if (!this.checkWinCondition()) {
                    var lvl = LEVELS[currentLevelIdx];
                    var totalChips = lvl.chips ? lvl.chips.length : 0;
                    var isAtExit = (vm.botX === lvl.exit.x && vm.botY === lvl.exit.y);
                    if (!isAtExit) {
                        if (window.App) window.App.toast("Execution ended. The bot stopped before the 🏁 Exit Terminal.", "info");
                    } else if (vm.chipsCollected < totalChips) {
                        if (window.App) window.App.toast("⚠️ Incomplete! Collected " + vm.chipsCollected + " of " + totalChips + " chips. Collect all 💎 chips to clear.", "warning");
                    }
                }
                return;
            }

            vm.stepCount++;
            if (vm.stepCount > 250) {
                // Infinite loop guard
                this.stopExecution();
                if (window.GameAudio && window.GameAudio.playBotCrash) window.GameAudio.playBotCrash();
                if (window.App) window.App.toast("Execution error: Stack Overflow (Infinite recursion)!", "error");
                return;
            }

            var frame = vm.callStack[vm.callStack.length - 1];
            var reg = frame.reg;
            var ip = frame.ip;

            if (ip >= registers[reg].length) {
                // Subroutine completed -> pop stack
                vm.callStack.pop();
                if (vm.callStack.length > 0) {
                    vm.callStack[vm.callStack.length - 1].ip++;
                }
                this.executeNextStep();
                return;
            }

            var cmd = registers[reg][ip];

            // Highlight active command
            this.clearHighlights();
            $('#slot-' + reg + '-' + ip).addClass('executing-cmd');

            // Execute Instruction
            this.executeCommand(cmd, frame);
            this.renderBoard();

            // Check if win condition reached
            if (this.checkWinCondition()) {
                this.stopExecution();
            }
        },

        executeCommand: function(cmd, frame) {
            var lvl = LEVELS[currentLevelIdx];
            var self = this;

            switch (cmd) {
                case 'MOVE':
                    var dx = vm.botDir === 'E' ? 1 : (vm.botDir === 'W' ? -1 : 0);
                    var dy = vm.botDir === 'S' ? 1 : (vm.botDir === 'N' ? -1 : 0);
                    var nx = vm.botX + dx;
                    var ny = vm.botY + dy;

                    if (this.isWalkable(nx, ny)) {
                        vm.botX = nx;
                        vm.botY = ny;
                        if (window.GameAudio && window.GameAudio.playBotStep) window.GameAudio.playBotStep();
                    } else {
                        // Crash
                        this.handleCrash("Crash! Bot walked into an obstacle or off-grid!");
                        return;
                    }
                    frame.ip++;
                    break;

                case 'LEFT':
                    var leftMap = { 'E': 'N', 'N': 'W', 'W': 'S', 'S': 'E' };
                    vm.botDir = leftMap[vm.botDir];
                    if (window.GameAudio && window.GameAudio.playBotTurn) window.GameAudio.playBotTurn();
                    frame.ip++;
                    break;

                case 'RIGHT':
                    var rightMap = { 'E': 'S', 'S': 'W', 'W': 'N', 'N': 'E' };
                    vm.botDir = rightMap[vm.botDir];
                    if (window.GameAudio && window.GameAudio.playBotTurn) window.GameAudio.playBotTurn();
                    frame.ip++;
                    break;

                case 'JUMP':
                    var jx = vm.botDir === 'E' ? 2 : (vm.botDir === 'W' ? -2 : 0);
                    var jy = vm.botDir === 'S' ? 2 : (vm.botDir === 'N' ? -2 : 0);
                    var tx = vm.botX + jx;
                    var ty = vm.botY + jy;

                    if (this.isWalkable(tx, ty, true)) {
                        vm.botX = tx;
                        vm.botY = ty;
                        if (window.GameAudio && window.GameAudio.playBotJump) window.GameAudio.playBotJump();
                    } else {
                        this.handleCrash("Crash! Invalid jump target!");
                        return;
                    }
                    frame.ip++;
                    break;

                case 'ACTIVATE':
                    // Collect Chip on current cell
                    if (lvl.chips) {
                        lvl.chips.forEach(function(ch) {
                            if (ch.x === vm.botX && ch.y === vm.botY && !ch.collected) {
                                ch.collected = true;
                                vm.chipsCollected++;
                                if (window.GameAudio && window.GameAudio.playBotCollect) window.GameAudio.playBotCollect();
                                self.updateChipsBadge();
                            }
                        });
                    }

                    // Activate Switch on current cell
                    if (lvl.switches) {
                        lvl.switches.forEach(function(sw) {
                            if (sw.x === vm.botX && sw.y === vm.botY) {
                                vm.switchesActivated[sw.gateId] = true;
                                vm.gatesOpen[sw.gateId] = true;
                                if (window.GameAudio && window.GameAudio.playBotCollect) window.GameAudio.playBotCollect();
                            }
                        });
                    }
                    frame.ip++;
                    break;

                case 'F1':
                    if (registers.F1.length === 0) {
                        if (window.App) window.App.toast("⚠️ Subroutine F1 is empty! Click 'FUNC F1[]' tab to add instructions.", "warning");
                        frame.ip++;
                    } else {
                        vm.callStack.push({ reg: 'F1', ip: 0 });
                    }
                    break;

                case 'F2':
                    if (registers.F2.length === 0) {
                        if (window.App) window.App.toast("⚠️ Subroutine F2 is empty! Click 'FUNC F2[]' tab to add instructions.", "warning");
                        frame.ip++;
                    } else {
                        vm.callStack.push({ reg: 'F2', ip: 0 });
                    }
                    break;
            }
        },

        isWalkable: function(x, y, isJump) {
            var lvl = LEVELS[currentLevelIdx];
            if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return false;

            // Check Walls
            if (lvl.walls) {
                for (var i = 0; i < lvl.walls.length; i++) {
                    if (lvl.walls[i].x === x && lvl.walls[i].y === y) return false;
                }
            }

            // Check Closed Gates
            if (lvl.gates) {
                for (var i = 0; i < lvl.gates.length; i++) {
                    if (lvl.gates[i].x === x && lvl.gates[i].y === y && !vm.gatesOpen[lvl.gates[i].id]) {
                        return false;
                    }
                }
            }

            // Check Hazards (Hazard landing without jump)
            if (lvl.hazards && !isJump) {
                for (var i = 0; i < lvl.hazards.length; i++) {
                    if (lvl.hazards[i].x === x && lvl.hazards[i].y === y) return false;
                }
            }

            return true;
        },

        handleCrash: function(msg) {
            this.stopExecution();
            if (window.GameAudio && window.GameAudio.playBotCrash) window.GameAudio.playBotCrash();
            if (window.App) window.App.toast(msg, "error");
        },

        checkWinCondition: function() {
            var lvl = LEVELS[currentLevelIdx];
            var totalChips = lvl.chips ? lvl.chips.length : 0;
            var isAtExit = (vm.botX === lvl.exit.x && vm.botY === lvl.exit.y);

            if (isAtExit && vm.chipsCollected >= totalChips && !isGameOver) {
                isGameOver = true;

                if (window.GameAudio && window.GameAudio.playAlgoVictory) {
                    window.GameAudio.playAlgoVictory();
                }

                var elapsedSeconds = Math.max(Math.floor((Date.now() - gameStartTime) / 1000), 1);
                var totalInstructions = registers.MAIN.length + registers.F1.length + registers.F2.length;
                var stars = 3;
                if (totalInstructions > lvl.parInstructions + 3) stars = 1;
                else if (totalInstructions > lvl.parInstructions) stars = 2;

                if (isMultiplayer && window.GameHubClient.isConnected()) {
                    window.GameHubClient.hub.server.finishAlgoBotGame(sessionId, currentLevelIdx + 1, totalInstructions, elapsedSeconds);
                } else {
                    var self = this;
                    setTimeout(function() {
                        self.showGameOverModal(true, myPlayerName, totalInstructions, elapsedSeconds, stars);
                    }, 400);
                }
                return true;
            }
            return false;
        },

        updateOpponentRadar: function(data) {
            $('#opponent-radar-bytes').text(data.instructionsUsed + ' Instructions');
            $('#opponent-radar-chips').text('Data Chips: ' + (data.chipsCollected || 0));
            $('#opponent-radar-status').text('Status: ' + (data.status || 'Idle'));
        },

        openLevelSelectModal: function() {
            var self = this;
            var currentTier = Math.floor(currentLevelIdx / 20) + 1; // 1..5

            var html = '<div id="stage-select-modal" class="modal-backdrop active">' +
                '<div class="modal-box" style="max-width: 580px; width: 95%;">' +
                    '<h2 class="modal-title">⚡ Select Algorithmic Chamber (100 Stages)</h2>' +
                    '<p class="modal-text">Select a programming tier or jump directly to any stage (1–100):</p>' +

                    '<!-- Tier Tabs -->' +
                    '<div style="display: flex; gap: 4px; background: #020617; padding: 4px; border-radius: 8px; margin: 12px 0; border: 1px solid #1e293b; overflow-x: auto;">' +
                        '<button type="button" class="btn tier-tab-btn ' + (currentTier === 1 ? 'btn-primary' : 'btn-outline') + '" data-tier="1" style="flex: 1; padding: 6px 4px; font-size: 0.75rem; font-weight: 800;">T1 (1-20)</button>' +
                        '<button type="button" class="btn tier-tab-btn ' + (currentTier === 2 ? 'btn-primary' : 'btn-outline') + '" data-tier="2" style="flex: 1; padding: 6px 4px; font-size: 0.75rem; font-weight: 800;">T2 (21-40)</button>' +
                        '<button type="button" class="btn tier-tab-btn ' + (currentTier === 3 ? 'btn-primary' : 'btn-outline') + '" data-tier="3" style="flex: 1; padding: 6px 4px; font-size: 0.75rem; font-weight: 800;">T3 (41-60)</button>' +
                        '<button type="button" class="btn tier-tab-btn ' + (currentTier === 4 ? 'btn-primary' : 'btn-outline') + '" data-tier="4" style="flex: 1; padding: 6px 4px; font-size: 0.75rem; font-weight: 800;">T4 (61-80)</button>' +
                        '<button type="button" class="btn tier-tab-btn ' + (currentTier === 5 ? 'btn-primary' : 'btn-outline') + '" data-tier="5" style="flex: 1; padding: 6px 4px; font-size: 0.75rem; font-weight: 800;">T5 (81-100)</button>' +
                    '</div>' +

                    '<!-- Stage Grid Container -->' +
                    '<div id="modal-stages-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin: 14px 0; max-height: 320px; overflow-y: auto; padding: 2px;">' +
                    '</div>' +

                    '<div style="display: flex; gap: 8px; margin-top: 12px;">' +
                        '<input type="number" id="quick-stage-input" min="1" max="100" placeholder="Jump to (1-100)..." style="flex: 1; background: #020617; border: 1px solid #334155; color: #fff; border-radius: 6px; padding: 8px 12px; font-size: 0.85rem;" />' +
                        '<button type="button" class="btn btn-primary" id="btn-quick-jump-stage" style="font-weight: 800;">Go</button>' +
                        '<button type="button" class="btn btn-outline" id="close-stages-modal">Close</button>' +
                    '</div>' +
                '</div></div>';

            $('#stage-select-modal').remove();
            $('body').append(html);

            function renderTierStages(tier) {
                var startIdx = (tier - 1) * 20;
                var endIdx = Math.min(startIdx + 20, LEVELS.length);
                var $grid = $('#modal-stages-grid');
                $grid.empty();

                for (var idx = startIdx; idx < endIdx; idx++) {
                    var lvl = LEVELS[idx];
                    var isCurrent = (idx === currentLevelIdx);
                    var $btn = $('<button type="button" class="btn ' + (isCurrent ? 'btn-primary' : 'btn-outline') + ' stage-pick-btn" data-idx="' + idx + '" style="padding: 10px 4px; font-size: 0.85rem; font-weight: 800; display: flex; flex-direction: column; align-items: center;">' +
                        '<span>' + lvl.id + '</span>' +
                        '<span style="font-size: 0.65rem; opacity: 0.75; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 90%;">' + lvl.name + '</span>' +
                    '</button>');
                    $grid.append($btn);
                }

                $('.stage-pick-btn').on('click', function(e) {
                    e.preventDefault();
                    var pickIdx = parseInt($(this).data('idx'), 10);
                    $('#stage-select-modal').removeClass('active').remove();
                    self.loadLevel(pickIdx);
                });
            }

            // Initial render
            renderTierStages(currentTier);

            // Tier Tab Switching
            $('.tier-tab-btn').on('click', function(e) {
                e.preventDefault();
                $('.tier-tab-btn').removeClass('btn-primary').addClass('btn-outline');
                $(this).removeClass('btn-outline').addClass('btn-primary');
                var tier = parseInt($(this).data('tier'), 10);
                renderTierStages(tier);
            });

            // Quick Jump Input
            $('#btn-quick-jump-stage').on('click', function(e) {
                e.preventDefault();
                var jumpNum = parseInt($('#quick-stage-input').val(), 10);
                if (!isNaN(jumpNum) && jumpNum >= 1 && jumpNum <= 100) {
                    $('#stage-select-modal').removeClass('active').remove();
                    self.loadLevel(jumpNum - 1);
                } else {
                    if (window.App) window.App.toast("Please enter a stage number between 1 and 100", "warning");
                }
            });

            $('#quick-stage-input').on('keypress', function(e) {
                if (e.which === 13) {
                    $('#btn-quick-jump-stage').click();
                }
            });

            $('#close-stages-modal').on('click', function(e) {
                e.preventDefault();
                $('#stage-select-modal').removeClass('active').remove();
            });
        },

        showGameOverModal: function(isWin, winnerName, instructionsUsed, elapsedSeconds, stars) {
            var self = this;
            var starsHtml = '⭐'.repeat(stars || 3);
            var isLastStage = (currentLevelIdx >= LEVELS.length - 1);

            var summaryHtml = '<div style="background: rgba(15,23,42,0.8); border: 1px solid #334155; border-radius: 12px; padding: 14px; margin: 14px 0; text-align: left;">' +
                '<div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>Algorithm Efficiency:</span><strong style="color: #fbbf24; font-size: 1.1rem;">' + starsHtml + '</strong></div>' +
                '<div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span>Instructions Used:</span><strong style="color: #38bdf8;">' + instructionsUsed + ' Blocks</strong></div>' +
                '<div style="display: flex; justify-content: space-between;"><span>Execution Time:</span><strong style="color: #34d399;">' + elapsedSeconds + 's</strong></div>' +
            '</div>';

            var modalText = isWin 
                ? ("Algorithm verified! Autonomous cyber bot successfully cleared the maze!" + summaryHtml)
                : ("Terminal shutdown! " + winnerName + " conquered the algorithmic challenge!" + summaryHtml);

            window.App.showGameModal({
                title: isWin ? "🏆 Algorithm Executed!" : "⚡ Challenge Concluded",
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
        AlgoBot.init();
    });

    window.AlgoBot = AlgoBot;

})(window, jQuery);
