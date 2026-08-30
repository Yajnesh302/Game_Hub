/* ==========================================================================
   LIGHTS OUT: QUANTUM SWITCH - Client Game Engine
   Grid Inversion, Parity Mathematics & GF(2) Linear Algebra Solver
   ========================================================================== */

(function (window, $) {
    'use strict';

    // --------------------------------------------------------------------------
    // Pre-computed Handcrafted Stages (50 Chambers across 5 Tiers)
    // --------------------------------------------------------------------------
    var STAGES = [
        // Tier 1: Apprentice Core (Stages 1-10) - 3x3 to 4x4
        { stage: 1, tier: 1, name: "Photon Spark", size: 3, mode: "cross", torus: false, par: 1, lights: [[1,1]], desc: "Single center node toggle." },
        { stage: 2, tier: 1, name: "Corner Singularity", size: 3, mode: "cross", torus: false, par: 2, lights: [[0,0],[2,2]], desc: "Symmetric diagonal corners." },
        { stage: 3, tier: 1, name: "Tri-Phase", size: 3, mode: "cross", torus: false, par: 3, lights: [[0,1],[1,0],[1,2]], desc: "Triangular flux distribution." },
        { stage: 4, tier: 1, name: "Cross Symmetry", size: 3, mode: "cross", torus: false, par: 4, lights: [[0,1],[1,0],[1,1],[1,2],[2,1]], desc: "Full center cross." },
        { stage: 5, tier: 1, name: "Quantum Square", size: 4, mode: "cross", torus: false, par: 4, lights: [[1,1],[1,2],[2,1],[2,2]], desc: "Central core quad." },
        { stage: 6, tier: 1, name: "Binary Perimeter", size: 4, mode: "cross", torus: false, par: 4, lights: [[0,0],[0,3],[3,0],[3,3]], desc: "Four corner anchors." },
        { stage: 7, tier: 1, name: "Flux Bar", size: 4, mode: "cross", torus: false, par: 3, lights: [[1,0],[1,1],[1,2],[1,3]], desc: "Horizontal parity wave." },
        { stage: 8, tier: 1, name: "Checker Flux", size: 4, mode: "cross", torus: false, par: 5, lights: [[0,1],[0,3],[1,0],[1,2],[2,1],[2,3],[3,0],[3,2]], desc: "Alternating parity." },
        { stage: 9, tier: 1, name: "Diamond Core", size: 4, mode: "cross", torus: false, par: 4, lights: [[0,2],[1,1],[1,3],[2,0],[2,2],[3,1]], desc: "Tilted diamond ring." },
        { stage: 10, tier: 1, name: "Apprentice Exam", size: 4, mode: "cross", torus: false, par: 6, lights: [[0,0],[1,2],[2,1],[3,3],[1,1],[2,2]], desc: "Multi-axis inversion." },

        // Tier 2: Parity Symmetry (Stages 11-20) - 5x5 Classic
        { stage: 11, tier: 2, name: "Classic Spark", size: 5, mode: "cross", torus: false, par: 1, lights: [[2,2]], desc: "The legendary center start." },
        { stage: 12, tier: 2, name: "Outer Frame", size: 5, mode: "cross", torus: false, par: 4, lights: [[0,0],[0,4],[4,0],[4,4]], desc: "Boundary anchor nodes." },
        { stage: 13, tier: 2, name: "Plus Matrix", size: 5, mode: "cross", torus: false, par: 5, lights: [[2,0],[2,1],[2,2],[2,3],[2,4],[0,2],[1,2],[3,2],[4,2]], desc: "Great center cross." },
        { stage: 14, tier: 2, name: "Dual Orbit", size: 5, mode: "cross", torus: false, par: 6, lights: [[1,1],[1,3],[3,1],[3,3]], desc: "Inner quadrant square." },
        { stage: 15, tier: 2, name: "Diamond Vault", size: 5, mode: "cross", torus: false, par: 6, lights: [[2,0],[1,1],[3,1],[0,2],[4,2],[1,3],[3,3],[2,4]], desc: "Octagonal diamond shell." },
        { stage: 16, tier: 2, name: "Checkerboard 5x5", size: 5, mode: "cross", torus: false, par: 7, lights: [[0,0],[0,2],[0,4],[1,1],[1,3],[2,0],[2,2],[2,4],[3,1],[3,3],[4,0],[4,2],[4,4]], desc: "Parity interference matrix." },
        { stage: 17, tier: 2, name: "Spiral Loop", size: 5, mode: "cross", torus: false, par: 7, lights: [[0,1],[0,2],[0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[2,1],[1,1]], desc: "Fibonacci photon spiral." },
        { stage: 18, tier: 2, name: "Hourglass", size: 5, mode: "cross", torus: false, par: 8, lights: [[0,0],[0,1],[0,2],[0,3],[0,4],[1,1],[1,2],[1,3],[2,2],[3,1],[3,2],[3,3],[4,0],[4,1],[4,2],[4,3],[4,4]], desc: "Chrono parity bridge." },
        { stage: 19, tier: 2, name: "Stargate", size: 5, mode: "cross", torus: false, par: 9, lights: [[1,2],[2,1],[2,3],[3,2],[0,0],[0,4],[4,0],[4,4]], desc: "Quantum gate alignment." },
        { stage: 20, tier: 2, name: "Symmetry Master", size: 5, mode: "cross", torus: false, par: 10, lights: [[0,2],[1,1],[1,2],[1,3],[2,0],[2,1],[2,3],[2,4],[3,1],[3,2],[3,3],[4,2]], desc: "Fractal parity web." },

        // Tier 3: Torus Topology (Stages 21-30) - Wrap-around grids
        { stage: 21, tier: 3, name: "Torus Portal Alpha", size: 4, mode: "cross", torus: true, par: 2, lights: [[0,0],[0,3]], desc: "Edge wraps across borders." },
        { stage: 22, tier: 3, name: "Wrap Horizon", size: 4, mode: "cross", torus: true, par: 4, lights: [[0,1],[3,1],[1,0],[1,3]], desc: "Looping topological conduit." },
        { stage: 23, tier: 3, name: "Circulation", size: 4, mode: "cross", torus: true, par: 4, lights: [[0,0],[1,1],[2,2],[3,3]], desc: "Continuous diagonal torus." },
        { stage: 24, tier: 3, name: "Ring Topology", size: 5, mode: "cross", torus: true, par: 5, lights: [[0,2],[4,2],[2,0],[2,4]], desc: "Seamless 5x5 torus perimeter." },
        { stage: 25, tier: 3, name: "Infinite Corridor", size: 5, mode: "cross", torus: true, par: 6, lights: [[0,0],[0,4],[4,0],[4,4],[2,2]], desc: "Quad portal singularity." },
        { stage: 26, tier: 3, name: "Torus Cross", size: 5, mode: "cross", torus: true, par: 6, lights: [[0,2],[1,2],[3,2],[4,2],[2,0],[2,1],[2,3],[2,4]], desc: "Wrapped center crossbars." },
        { stage: 27, tier: 3, name: "Moebius Knot", size: 5, mode: "cross", torus: true, par: 7, lights: [[0,1],[1,0],[3,4],[4,3],[2,2]], desc: "Non-orientable flux loop." },
        { stage: 28, tier: 3, name: "Klein Matrix", size: 5, mode: "cross", torus: true, par: 8, lights: [[0,0],[0,2],[0,4],[4,0],[4,2],[4,4]], desc: "Topological manifold." },
        { stage: 29, tier: 3, name: "Singularity Core", size: 5, mode: "cross", torus: true, par: 9, lights: [[1,1],[1,3],[3,1],[3,3],[0,2],[4,2],[2,0],[2,4]], desc: "Harmonic torus balance." },
        { stage: 30, tier: 3, name: "Topology Master", size: 5, mode: "cross", torus: true, par: 10, lights: [[0,0],[0,1],[1,0],[3,4],[4,3],[4,4],[2,2]], desc: "Torus resonance matrix." },

        // Tier 4: Superposition Diagonal (Stages 31-40) - Diagonal 'X' toggling
        { stage: 31, tier: 4, name: "Diagonal Spark", size: 4, mode: "diag", torus: false, par: 1, lights: [[1,1]], desc: "Toggles diagonal 'X' neighbors." },
        { stage: 32, tier: 4, name: "X-Cross", size: 4, mode: "diag", torus: false, par: 2, lights: [[0,0],[3,3]], desc: "Diagonal corner parity." },
        { stage: 33, tier: 4, name: "Quad Superposition", size: 4, mode: "diag", torus: false, par: 4, lights: [[1,1],[1,2],[2,1],[2,2]], desc: "Inner diagonal block." },
        { stage: 34, tier: 4, name: "Starlight X", size: 5, mode: "diag", torus: false, par: 3, lights: [[2,2]], desc: "5x5 Center diagonal burst." },
        { stage: 35, tier: 4, name: "Outer X", size: 5, mode: "diag", torus: false, par: 4, lights: [[0,0],[0,4],[4,0],[4,4]], desc: "Diagonal boundary reflection." },
        { stage: 36, tier: 4, name: "Superposition Box", size: 5, mode: "diag", torus: false, par: 5, lights: [[1,1],[1,3],[3,1],[3,3]], desc: "Dual diagonal quadrant." },
        { stage: 37, tier: 4, name: "Interference Web", size: 5, mode: "diag", torus: false, par: 7, lights: [[0,2],[2,0],[2,4],[4,2],[2,2]], desc: "Diagonal star network." },
        { stage: 38, tier: 4, name: "Prism Dispersion", size: 5, mode: "diag", torus: false, par: 8, lights: [[0,1],[1,0],[3,4],[4,3],[1,2],[3,2]], desc: "Spectral refraction." },
        { stage: 39, tier: 4, name: "Quantum Vortex", size: 5, mode: "diag", torus: false, par: 9, lights: [[0,0],[1,1],[2,2],[3,3],[4,4],[0,4],[1,3],[3,1],[4,0]], desc: "Full diagonal X-axis." },
        { stage: 40, tier: 4, name: "Superposition Master", size: 5, mode: "diag", torus: false, par: 11, lights: [[1,0],[0,1],[3,0],[4,1],[0,3],[1,4],[4,3],[3,4],[2,2]], desc: "Multi-diagonal superposition." },

        // Tier 5: Grandmaster Turing Singularity (Stages 41-50) - 5x5 and 6x6 Advanced
        { stage: 41, tier: 5, name: "Hexa Core 6x6", size: 6, mode: "cross", torus: false, par: 5, lights: [[2,2],[2,3],[3,2],[3,3]], desc: "6x6 Matrix core expansion." },
        { stage: 42, tier: 5, name: "Hyper Hex", size: 6, mode: "cross", torus: false, par: 6, lights: [[0,0],[0,5],[5,0],[5,5],[2,2],[3,3]], desc: "Hypercube vertex inversion." },
        { stage: 43, tier: 5, name: "Turing Labyrinth", size: 5, mode: "cross", torus: false, par: 10, lights: [[0,1],[0,3],[1,0],[1,4],[2,2],[3,0],[3,4],[4,1],[4,3]], desc: "Deep parity labyrinth." },
        { stage: 44, tier: 5, name: "Quantum Nullspace", size: 5, mode: "cross", torus: false, par: 11, lights: [[0,0],[0,4],[1,1],[1,3],[2,2],[3,1],[3,3],[4,0],[4,4]], desc: "Kernel subspace parity." },
        { stage: 45, tier: 5, name: "Torus Supercluster", size: 6, mode: "cross", torus: true, par: 8, lights: [[0,0],[0,5],[5,0],[5,5],[2,3],[3,2]], desc: "6x6 Toroidal manifold." },
        { stage: 46, tier: 5, name: "Galois Field 2", size: 5, mode: "cross", torus: false, par: 12, lights: [[0,2],[1,1],[1,3],[2,0],[2,4],[3,1],[3,3],[4,2],[0,0],[4,4]], desc: "Linear algebra singularity." },
        { stage: 47, tier: 5, name: "Parity Inversion", size: 5, mode: "cross", torus: false, par: 12, lights: [[0,1],[1,0],[2,1],[1,2],[2,3],[3,2],[4,3],[3,4],[2,2]], desc: "Cascading parity waves." },
        { stage: 48, tier: 5, name: "Quantum Entanglement", size: 6, mode: "cross", torus: false, par: 10, lights: [[1,1],[1,4],[4,1],[4,4],[2,2],[2,3],[3,2],[3,3]], desc: "Entangled node matrix." },
        { stage: 49, tier: 5, name: "Singularity Overload", size: 5, mode: "cross", torus: false, par: 14, lights: [[0,0],[0,2],[0,4],[2,0],[2,4],[4,0],[4,2],[4,4],[1,2],[2,1],[2,3],[3,2]], desc: "Extreme combinatorial density." },
        { stage: 50, tier: 5, name: "Grandmaster Turing Omega", size: 6, mode: "cross", torus: true, par: 15, lights: [[0,1],[0,4],[1,0],[1,5],[4,0],[4,5],[5,1],[5,4],[2,2],[2,3],[3,2],[3,3]], desc: "The ultimate quantum parity challenge." }
    ];

    var LightsOut = {
        gridSize: 5,
        toggleMode: "cross", // "cross" (+) or "diag" (X)
        isTorus: false,
        currentStageNum: 1,
        isCustomMode: false,

        grid: [], // 2D array [r][c] = boolean (true = ON, false = OFF)
        movesCount: 0,
        parMoves: 5,
        startTime: null,
        timerInterval: null,
        isSolved: false,

        // Multiplayer state
        isMultiplayer: false,
        sessionId: null,
        myPlayerName: "Player",
        opponentName: "Opponent",

        init: function () {
            var urlParams = new URLSearchParams(window.location.search);
            this.sessionId = urlParams.get('session');
            this.isMultiplayer = !!this.sessionId;

            var stageParam = parseInt(urlParams.get('stage') || urlParams.get('lvl') || '1', 10);
            if (stageParam >= 1 && stageParam <= 50) {
                this.currentStageNum = stageParam;
            }

            var sizeParam = parseInt(urlParams.get('size') || '0', 10);
            if ([3, 4, 5, 6].indexOf(sizeParam) !== -1) {
                this.gridSize = sizeParam;
                this.isCustomMode = true;
            }

            var modeParam = urlParams.get('mode');
            if (modeParam === "diag" || modeParam === "torus") {
                if (modeParam === "diag") this.toggleMode = "diag";
                if (modeParam === "torus") this.isTorus = true;
                this.isCustomMode = true;
            }

            if (this.isMultiplayer) {
                this.initMultiplayer();
            }

            this.bindEvents();
            this.loadStage(this.currentStageNum);
        },

        initMultiplayer: function () {
            var self = this;
            var urlParams = new URLSearchParams(window.location.search);
            var p1 = urlParams.get('p1') || "Player 1";
            var p2 = urlParams.get('p2') || "Player 2";
            var myName = window.App ? window.App.getPlayerName() : "Player";

            this.myPlayerName = myName;
            this.opponentName = (stringEquals(myName, p1)) ? p2 : p1;

            $('#multiplayer-telemetry-card').show();
            $('#opponent-radar-name').text(this.opponentName);

            window.GameHubClient.init(function (hub) {
                hub.client.lightsOutProgressReceived = function (data) {
                    self.updateOpponentRadar(data);
                };

                hub.client.lightsOutGameFinished = function (result) {
                    if (result && result.ExtraData) {
                        var winner = result.ExtraData.winnerName;
                        var isWin = (winner === self.myPlayerName);
                        self.showGameOverModal(isWin, winner, result.ExtraData.movesUsed, result.ExtraData.elapsedSeconds);
                    }
                };
            });
        },

        bindEvents: function () {
            var self = this;

            // Reset / Reload stage
            $('#btn-reset-grid').on('click', function (e) {
                e.preventDefault();
                if (window.GameAudio && window.GameAudio.playQuantumGridReset) window.GameAudio.playQuantumGridReset();
                self.loadStage(self.currentStageNum);
            });

            // Random Scramble (Sandbox)
            $('#btn-random-scramble').on('click', function (e) {
                e.preventDefault();
                self.scrambleRandomSolvable();
            });

            // Hint Button (GF(2) Gaussian Elimination Solver)
            $('#btn-get-hint').on('click', function (e) {
                e.preventDefault();
                self.showGF2Hint();
            });

            // Level Selector Modal Trigger
            $('#btn-select-stage').on('click', function (e) {
                e.preventDefault();
                self.showStageSelectModal();
            });

            // Next Stage Button
            $('#btn-next-stage').on('click', function (e) {
                e.preventDefault();
                if (self.currentStageNum < 50) {
                    self.currentStageNum++;
                    self.loadStage(self.currentStageNum);
                }
            });

            // Previous Stage Button
            $('#btn-prev-stage').on('click', function (e) {
                e.preventDefault();
                if (self.currentStageNum > 1) {
                    self.currentStageNum--;
                    self.loadStage(self.currentStageNum);
                }
            });

            // Size Selector Change
            $('#select-grid-size').on('change', function () {
                var sz = parseInt($(this).val(), 10);
                if ([3, 4, 5, 6].indexOf(sz) !== -1) {
                    self.gridSize = sz;
                    self.isCustomMode = true;
                    self.scrambleRandomSolvable();
                }
            });

            // Toggle Mode Change
            $('#select-toggle-mode').on('change', function () {
                var m = $(this).val();
                if (m === "cross" || m === "diag") {
                    self.toggleMode = m;
                    self.isCustomMode = true;
                    self.scrambleRandomSolvable();
                }
            });

            // Torus Checkbox Change
            $('#chk-torus-mode').on('change', function () {
                self.isTorus = $(this).is(':checked');
                self.isCustomMode = true;
                self.scrambleRandomSolvable();
            });
        },

        loadStage: function (stageNum) {
            this.currentStageNum = stageNum;
            var stg = STAGES[stageNum - 1];

            if (stg) {
                this.gridSize = stg.size;
                this.toggleMode = stg.mode;
                this.isTorus = stg.torus;
                this.parMoves = stg.par;

                $('#stage-title-text').text("Stage " + stg.stage + ": " + stg.name);
                $('#stage-desc-text').text(stg.desc);
                $('#tier-badge').text("Tier " + stg.tier + (stg.torus ? " (Torus)" : (stg.mode === "diag" ? " (Diagonal)" : "")));
            } else {
                this.parMoves = 8;
                $('#stage-title-text').text("Custom Matrix: " + this.gridSize + "x" + this.gridSize);
                $('#stage-desc-text').text("Randomized solvable quantum configuration.");
                $('#tier-badge').text("Custom");
            }

            $('#select-grid-size').val(this.gridSize);
            $('#select-toggle-mode').val(this.toggleMode);
            $('#chk-torus-mode').prop('checked', this.isTorus);

            // Initialize Grid
            this.grid = [];
            for (var r = 0; r < this.gridSize; r++) {
                this.grid[r] = [];
                for (var c = 0; c < this.gridSize; c++) {
                    this.grid[r][c] = false; // All off initially
                }
            }

            // Apply Stage Initial Active Lights
            if (stg && stg.lights) {
                for (var i = 0; i < stg.lights.length; i++) {
                    var r = stg.lights[i][0];
                    var c = stg.lights[i][1];
                    if (r >= 0 && r < this.gridSize && c >= 0 && c < this.gridSize) {
                        this.grid[r][c] = true;
                    }
                }
            }

            this.movesCount = 0;
            this.isSolved = false;
            this.startTime = Date.now();

            this.renderBoard();
            this.updateHUD();
            this.startTimer();
        },

        scrambleRandomSolvable: function () {
            // Guarantee solvability by starting from all-off and executing K random clicks
            this.grid = [];
            for (var r = 0; r < this.gridSize; r++) {
                this.grid[r] = [];
                for (var c = 0; c < this.gridSize; c++) {
                    this.grid[r][c] = false;
                }
            }

            var numClicks = Math.floor(this.gridSize * 1.5) + Math.floor(Math.random() * 3);
            for (var k = 0; k < numClicks; k++) {
                var rr = Math.floor(Math.random() * this.gridSize);
                var cc = Math.floor(Math.random() * this.gridSize);
                this.executeToggle(rr, cc, true); // Silent toggle
            }

            // Ensure at least 1 light is on
            if (this.getRemainingLightsCount() === 0) {
                this.executeToggle(0, 0, true);
            }

            this.movesCount = 0;
            this.isSolved = false;
            this.parMoves = Math.max(numClicks - 1, 3);
            this.startTime = Date.now();

            $('#stage-title-text').text("Custom Matrix: " + this.gridSize + "x" + this.gridSize);
            $('#stage-desc-text').text("Randomized quantum state with guaranteed solvability.");
            $('#tier-badge').text(this.isTorus ? "Torus" : (this.toggleMode === "diag" ? "Diagonal" : "Standard"));

            this.renderBoard();
            this.updateHUD();
            this.startTimer();
        },

        renderBoard: function () {
            var $board = $('#lightsout-grid');
            $board.empty();

            $board.css({
                'grid-template-columns': 'repeat(' + this.gridSize + ', 1fr)',
                'grid-template-rows': 'repeat(' + this.gridSize + ', 1fr)',
                'max-width': (this.gridSize * 74) + 'px'
            });

            for (var r = 0; r < this.gridSize; r++) {
                for (var c = 0; c < this.gridSize; c++) {
                    var isOn = this.grid[r][c];
                    var $node = $('<button type="button" class="quantum-node ' + (isOn ? 'node-active' : 'node-dormant') + '" data-row="' + r + '" data-col="' + c + '" id="node-' + r + '-' + c + '"></button>');
                    
                    // Internal photon core element
                    $node.append('<div class="node-core"></div><div class="node-glow"></div>');
                    $board.append($node);
                }
            }

            var self = this;
            $('.quantum-node').off('click').on('click', function (e) {
                e.preventDefault();
                if (self.isSolved) return;

                var r = parseInt($(this).data('row'), 10);
                var c = parseInt($(this).data('col'), 10);
                self.onNodeClicked(r, c);
            });
        },

        onNodeClicked: function (r, c) {
            if (this.isSolved) return;

            this.movesCount++;
            this.executeToggle(r, c, false);

            var remaining = this.getRemainingLightsCount();
            this.updateHUD();

            // Multiplayer telemetry broadcast
            if (this.isMultiplayer && window.GameHubClient && window.GameHubClient.isConnected()) {
                window.GameHubClient.hub.server.sendLightsOutProgress(this.sessionId, {
                    remainingLights: remaining,
                    moves: this.movesCount,
                    grid: this.grid,
                    solved: (remaining === 0)
                });
            }

            // Check Win Condition
            if (remaining === 0) {
                this.concludeGame(true);
            }
        },

        executeToggle: function (r, c, silent) {
            var toggledPositions = [];

            // 1. Center node
            toggledPositions.push([r, c]);

            // 2. Neighbor nodes based on mode
            if (this.toggleMode === "cross") {
                // Cross pattern: N, S, E, W
                var deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                for (var i = 0; i < deltas.length; i++) {
                    var nr = r + deltas[i][0];
                    var nc = c + deltas[i][1];

                    if (this.isTorus) {
                        nr = (nr + this.gridSize) % this.gridSize;
                        nc = (nc + this.gridSize) % this.gridSize;
                        toggledPositions.push([nr, nc]);
                    } else if (nr >= 0 && nr < this.gridSize && nc >= 0 && nc < this.gridSize) {
                        toggledPositions.push([nr, nc]);
                    }
                }
            } else if (this.toggleMode === "diag") {
                // Diagonal pattern: NW, NE, SW, SE
                var deltas = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
                for (var i = 0; i < deltas.length; i++) {
                    var nr = r + deltas[i][0];
                    var nc = c + deltas[i][1];

                    if (this.isTorus) {
                        nr = (nr + this.gridSize) % this.gridSize;
                        nc = (nc + this.gridSize) % this.gridSize;
                        toggledPositions.push([nr, nc]);
                    } else if (nr >= 0 && nr < this.gridSize && nc >= 0 && nc < this.gridSize) {
                        toggledPositions.push([nr, nc]);
                    }
                }
            }

            // Invert states
            for (var i = 0; i < toggledPositions.length; i++) {
                var pr = toggledPositions[i][0];
                var pc = toggledPositions[i][1];
                this.grid[pr][pc] = !this.grid[pr][pc];

                if (!silent) {
                    var $el = $('#node-' + pr + '-' + pc);
                    var isOn = this.grid[pr][pc];
                    $el.removeClass('node-active node-dormant').addClass(isOn ? 'node-active' : 'node-dormant');
                    $el.addClass('node-pulse');
                    (function ($nodeElem) {
                        setTimeout(function () { $nodeElem.removeClass('node-pulse'); }, 250);
                    })($el);
                }
            }

            if (!silent && window.GameAudio && window.GameAudio.playQuantumNodeToggle) {
                window.GameAudio.playQuantumNodeToggle(this.grid[r][c]);
            }
        },

        getRemainingLightsCount: function () {
            var count = 0;
            for (var r = 0; r < this.gridSize; r++) {
                for (var c = 0; c < this.gridSize; c++) {
                    if (this.grid[r][c]) count++;
                }
            }
            return count;
        },

        updateHUD: function () {
            var remaining = this.getRemainingLightsCount();
            $('#lights-remaining-badge').text(remaining);
            $('#moves-count-badge').text(this.movesCount + ' / ' + this.parMoves + ' (Par)');

            var totalNodes = this.gridSize * this.gridSize;
            var progressPct = Math.round(((totalNodes - remaining) / totalNodes) * 100);
            $('#parity-progress-bar').css('width', progressPct + '%');
        },

        startTimer: function () {
            if (this.timerInterval) clearInterval(this.timerInterval);
            var self = this;
            this.timerInterval = setInterval(function () {
                if (self.isSolved) return;
                var elapsedSec = Math.floor((Date.now() - self.startTime) / 1000);
                var mins = Math.floor(elapsedSec / 60);
                var secs = elapsedSec % 60;
                $('#timer-badge').text((mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs);
            }, 1000);
        },

        // ----------------------------------------------------------------------
        // GF(2) Galois Field Linear Algebra Solver
        // Solves A * x = b (mod 2) where addition = XOR and multiplication = AND
        // ----------------------------------------------------------------------
        solveGF2: function () {
            var N = this.gridSize;
            var total = N * N;

            // Construct Adjacency Matrix A (total x total)
            var A = [];
            for (var i = 0; i < total; i++) {
                A[i] = [];
                for (var j = 0; j < total; j++) {
                    A[i][j] = 0;
                }
            }

            // Current State Vector b
            var b = [];
            for (var r = 0; r < N; r++) {
                for (var c = 0; c < N; c++) {
                    var idx = r * N + c;
                    b[idx] = this.grid[r][c] ? 1 : 0;

                    // Which cells are toggled by clicking (r, c)?
                    A[idx][idx] = 1; // Self

                    if (this.toggleMode === "cross") {
                        var deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                        for (var d = 0; d < deltas.length; d++) {
                            var nr = r + deltas[d][0];
                            var nc = c + deltas[d][1];
                            if (this.isTorus) {
                                nr = (nr + N) % N;
                                nc = (nc + N) % N;
                                A[nr * N + nc][idx] = 1;
                            } else if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
                                A[nr * N + nc][idx] = 1;
                            }
                        }
                    } else if (this.toggleMode === "diag") {
                        var deltas = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
                        for (var d = 0; d < deltas.length; d++) {
                            var nr = r + deltas[d][0];
                            var nc = c + deltas[d][1];
                            if (this.isTorus) {
                                nr = (nr + N) % N;
                                nc = (nc + N) % N;
                                A[nr * N + nc][idx] = 1;
                            } else if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
                                A[nr * N + nc][idx] = 1;
                            }
                        }
                    }
                }
            }

            // Augmented matrix [A | b]
            var M = [];
            for (var i = 0; i < total; i++) {
                M[i] = A[i].slice();
                M[i].push(b[i]);
            }

            // Forward Gaussian Elimination over GF(2)
            var lead = 0;
            var pivotCols = [];
            for (var r = 0; r < total && lead < total; r++) {
                var pivot = r;
                while (pivot < total && M[pivot][lead] === 0) {
                    pivot++;
                }

                if (pivot === total) {
                    lead++;
                    r--;
                    continue;
                }

                // Swap rows
                var temp = M[r];
                M[r] = M[pivot];
                M[pivot] = temp;

                pivotCols.push({ row: r, col: lead });

                // Eliminate lead column in all other rows
                for (var i = 0; i < total; i++) {
                    if (i !== r && M[i][lead] === 1) {
                        for (var j = 0; j <= total; j++) {
                            M[i][j] = M[i][j] ^ M[r][j];
                        }
                    }
                }
                lead++;
            }

            // Back substitution
            var x = new Array(total).fill(0);
            for (var p = pivotCols.length - 1; p >= 0; p--) {
                var row = pivotCols[p].row;
                var col = pivotCols[p].col;
                x[col] = M[row][total];
            }

            return x;
        },

        showGF2Hint: function () {
            if (this.isSolved) return;

            var solution = this.solveGF2();
            var hintList = [];
            var N = this.gridSize;

            for (var i = 0; i < solution.length; i++) {
                if (solution[i] === 1) {
                    var r = Math.floor(i / N);
                    var c = i % N;
                    hintList.push({ r: r, c: c });
                }
            }

            if (hintList.length === 0) {
                if (window.App) window.App.toast("Board is already solved or parity state is clear!", "info");
                return;
            }

            // Highlight the first recommended optimal move
            var pick = hintList[0];
            var $node = $('#node-' + pick.r + '-' + pick.c);

            $node.addClass('node-hint-aura');
            if (window.GameAudio && window.GameAudio.playQuantumHintChime) window.GameAudio.playQuantumHintChime();

            if (window.App) {
                window.App.toast("💡 Quantum Hint: Invert node (" + (pick.r + 1) + ", " + (pick.c + 1) + ")", "info");
            }

            setTimeout(function () {
                $node.removeClass('node-hint-aura');
            }, 3000);
        },

        concludeGame: function (isWin) {
            if (this.isSolved) return;
            this.isSolved = true;
            if (this.timerInterval) clearInterval(this.timerInterval);

            var elapsedSeconds = Math.max(Math.floor((Date.now() - this.startTime) / 1000), 1);

            if (isWin && window.GameAudio && window.GameAudio.playQuantumSolveFanfare) {
                window.GameAudio.playQuantumSolveFanfare();
            }

            // Calculate Stars Rating
            var stars = 1;
            if (this.movesCount <= this.parMoves) {
                stars = 3;
            } else if (this.movesCount <= this.parMoves + 3) {
                stars = 2;
            }

            // Save Progress
            this.saveStageProgress(this.currentStageNum, stars, this.movesCount);

            if (this.isMultiplayer && window.GameHubClient && window.GameHubClient.isConnected()) {
                window.GameHubClient.hub.server.finishLightsOutGame(this.sessionId, this.movesCount, elapsedSeconds);
            } else {
                var self = this;
                setTimeout(function () {
                    self.showGameOverModal(isWin, self.myPlayerName, self.movesCount, elapsedSeconds, stars);
                }, 400);
            }
        },

        updateOpponentRadar: function (data) {
            if (!data) return;
            $('#opp-lights-count').text(data.remainingLights);
            $('#opp-moves-count').text(data.moves);

            var $grid = $('#opponent-radar-grid');
            $grid.empty();

            var g = data.grid || [];
            var sz = g.length || 5;

            $grid.css({
                'grid-template-columns': 'repeat(' + sz + ', 1fr)',
                'grid-template-rows': 'repeat(' + sz + ', 1fr)'
            });

            for (var r = 0; r < sz; r++) {
                for (var c = 0; c < sz; c++) {
                    var on = g[r] && g[r][c];
                    $grid.append('<div class="opp-mini-node ' + (on ? 'opp-on' : 'opp-off') + '"></div>');
                }
            }

            if (data.solved) {
                $('#opponent-radar-status').text('Status: Discharged Matrix! ⚡').css('color', '#34d399');
            }
        },

        saveStageProgress: function (stageNum, stars, moves) {
            try {
                var raw = localStorage.getItem('lightsout_progress') || '{}';
                var progress = JSON.parse(raw);
                var current = progress[stageNum] || { stars: 0, bestMoves: 999 };

                progress[stageNum] = {
                    stars: Math.max(current.stars, stars),
                    bestMoves: Math.min(current.bestMoves, moves),
                    completed: true
                };

                localStorage.setItem('lightsout_progress', JSON.stringify(progress));
            } catch (e) { }
        },

        getStageProgress: function (stageNum) {
            try {
                var raw = localStorage.getItem('lightsout_progress') || '{}';
                var progress = JSON.parse(raw);
                return progress[stageNum] || { stars: 0, bestMoves: 0, completed: false };
            } catch (e) {
                return { stars: 0, bestMoves: 0, completed: false };
            }
        },

        showStageSelectModal: function () {
            var self = this;
            var html = '<div id="stage-select-modal" class="modal-backdrop active">' +
                '<div class="modal-box" style="max-width: 600px; width: 95%; max-height: 85vh; display: flex; flex-direction: column;">' +
                    '<h2 class="modal-title">⚡ Quantum Parity Chambers</h2>' +
                    '<p class="modal-text">Select a chamber stage (1 - 50):</p>' +

                    '<!-- Tier Tabs -->' +
                    '<div style="display: flex; gap: 6px; overflow-x: auto; margin-bottom: 12px; padding-bottom: 4px;">' +
                        '<button type="button" class="btn btn-outline tier-tab active" data-tier="all">All</button>' +
                        '<button type="button" class="btn btn-outline tier-tab" data-tier="1">Tier 1: Apprentice</button>' +
                        '<button type="button" class="btn btn-outline tier-tab" data-tier="2">Tier 2: Classic 5x5</button>' +
                        '<button type="button" class="btn btn-outline tier-tab" data-tier="3">Tier 3: Torus</button>' +
                        '<button type="button" class="btn btn-outline tier-tab" data-tier="4">Tier 4: Diagonal</button>' +
                        '<button type="button" class="btn btn-outline tier-tab" data-tier="5">Tier 5: Grandmaster</button>' +
                    '</div>' +

                    '<!-- Stage Grid -->' +
                    '<div id="stages-grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(88px, 1fr)); gap: 8px; overflow-y: auto; flex: 1; padding: 4px;">';

            for (var i = 0; i < STAGES.length; i++) {
                var s = STAGES[i];
                var prog = this.getStageProgress(s.stage);
                var starStr = prog.stars === 3 ? "⭐⭐⭐" : (prog.stars === 2 ? "⭐⭐" : (prog.stars === 1 ? "⭐" : ""));

                html += '<button type="button" class="btn btn-outline stage-tile-btn ' + (s.stage === self.currentStageNum ? 'active-stage' : '') + '" data-stage="' + s.stage + '" data-tier="' + s.tier + '" style="display: flex; flex-direction: column; align-items: center; padding: 8px 4px; font-size: 0.85rem; border-color: ' + (prog.completed ? '#34d399' : '#334155') + ';">' +
                    '<strong style="color: #38bdf8;">' + s.stage + '</strong>' +
                    '<span style="font-size: 0.65rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 75px;">' + s.name + '</span>' +
                    '<span style="font-size: 0.6rem; color: #fbbf24; margin-top: 2px;">' + (starStr || (s.size + 'x' + s.size)) + '</span>' +
                '</button>';
            }

            html += '</div>' +
                    '<button type="button" class="btn btn-outline" id="close-stage-modal" style="margin-top: 14px;">Close</button>' +
                '</div></div>';

            $('#stage-select-modal').remove();
            $('body').append(html);

            // Tier Tab Filter
            $('.tier-tab').on('click', function () {
                $('.tier-tab').removeClass('active');
                $(this).addClass('active');
                var tier = $(this).data('tier');

                if (tier === 'all') {
                    $('.stage-tile-btn').show();
                } else {
                    $('.stage-tile-btn').hide();
                    $('.stage-tile-btn[data-tier="' + tier + '"]').show();
                }
            });

            // Stage Tile Click
            $('.stage-tile-btn').on('click', function (e) {
                e.preventDefault();
                var stg = parseInt($(this).data('stage'), 10);
                $('#stage-select-modal').remove();
                self.loadStage(stg);
            });

            $('#close-stage-modal').on('click', function (e) {
                e.preventDefault();
                $('#stage-select-modal').remove();
            });
        },

        showGameOverModal: function (isWin, winnerName, movesUsed, elapsedSeconds, stars) {
            var self = this;
            var starDisplay = stars === 3 ? "⭐⭐⭐ Master Inversion" : (stars === 2 ? "⭐⭐ Great Parity" : "⭐ Stage Cleared");

            var summaryHtml = '<div style="background: rgba(15,23,42,0.85); border: 1px solid #334155; border-radius: 12px; padding: 16px; margin: 14px 0; text-align: left;">' +
                '<div style="text-align: center; margin-bottom: 10px;">' +
                    '<div style="font-size: 1.4rem; color: #fbbf24; font-weight: 800;">' + starDisplay + '</div>' +
                '</div>' +
                '<div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.9rem;"><span>Moves Used:</span><strong style="color: #38bdf8;">' + movesUsed + ' (Par: ' + this.parMoves + ')</strong></div>' +
                '<div style="display: flex; justify-content: space-between; font-size: 0.9rem;"><span>Elapsed Time:</span><strong style="color: #fbbf24;">' + elapsedSeconds + 's</strong></div>' +
            '</div>';

            var modalText = isWin
                ? ("All photon conduits discharged! Parity matrix fully unlinked." + summaryHtml)
                : ("Match concluded." + summaryHtml);

            window.App.showGameModal({
                title: isWin ? "⚡ Quantum Matrix Cleared!" : "⚡ Round Concluded",
                text: modalText,
                html: modalText,
                isWin: isWin,
                onRematch: function () {
                    if (self.currentStageNum < 50) {
                        self.currentStageNum++;
                    }
                    self.loadStage(self.currentStageNum);
                }
            });
        }
    };

    function stringEquals(a, b) {
        return (a || '').toLowerCase() === (b || '').toLowerCase();
    }

    $(document).ready(function () {
        LightsOut.init();
    });

    window.LightsOut = LightsOut;

})(window, jQuery);
