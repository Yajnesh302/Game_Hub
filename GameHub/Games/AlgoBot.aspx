<%@ Page Title="AlgoBot: Maze Runner & Pathfinding - Game Hub" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="AlgoBot.aspx.cs" Inherits="GameHub.Games.AlgoBotPage" %>

<asp:Content ID="Head" ContentPlaceHolderID="HeadContent" runat="server">
    <script src="<%= ResolveUrl("~/Scripts/algobot.js?v=2.6") %>" type="text/javascript"></script>
    <style>
        .algobot-container {
            max-width: 960px;
            margin: 0 auto;
        }

        .algobot-workspace-grid {
            display: grid;
            grid-template-columns: 1fr 340px;
            gap: 20px;
            margin: 16px 0;
        }

        @media (max-width: 880px) {
            .algobot-workspace-grid {
                grid-template-columns: 1fr;
            }
        }

        /* Test Chamber Canvas Card */
        .chamber-view-card {
            background: #020617;
            border: 2px solid #1e293b;
            border-radius: var(--radius-xl);
            padding: 20px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.7);
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .chamber-canvas-wrapper {
            position: relative;
            width: 100%;
            max-width: 440px;
            aspect-ratio: 1 / 1;
            margin: 10px 0;
            background: rgba(15, 23, 42, 0.7);
            border: 2px solid #334155;
            border-radius: var(--radius-xl);
            box-shadow: inset 0 0 30px rgba(0,0,0,0.9);
            overflow: hidden;
        }

        .algobot-canvas {
            width: 100%;
            height: 100%;
            display: block;
        }

        /* Programming IDE Panel */
        .ide-panel {
            background: #0f172a;
            border: 1.5px solid #334155;
            border-radius: var(--radius-xl);
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 14px;
        }

        /* Palette Buttons */
        .palette-section {
            background: #020617;
            border: 1px solid #1e293b;
            border-radius: var(--radius-lg);
            padding: 10px;
        }

        .palette-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
            margin-top: 8px;
        }

        .cmd-palette-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 8px 4px;
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: var(--radius-md);
            color: #f8fafc;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            font-size: 0.7rem;
            font-weight: 700;
        }

        .cmd-palette-btn:hover {
            border-color: #38bdf8;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(56, 189, 248, 0.25);
        }

        .cmd-palette-icon {
            font-size: 1.2rem;
            margin-bottom: 2px;
        }

        /* Register Tabs */
        .reg-tabs {
            display: flex;
            gap: 4px;
            background: #020617;
            padding: 4px;
            border-radius: var(--radius-md);
            border: 1px solid #1e293b;
        }

        .reg-tab-btn {
            flex: 1;
            padding: 6px;
            background: transparent;
            border: none;
            color: #94a3b8;
            font-size: 0.8rem;
            font-weight: 800;
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.2s ease;
        }

        .reg-tab-btn.active-tab {
            background: #1e293b;
            color: #38bdf8;
            box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
        }

        .reg-tab-btn.disabled-tab {
            opacity: 0.3;
            cursor: not-allowed;
        }

        /* Register Slots Grid */
        .register-container {
            background: #020617;
            border: 1px solid #1e293b;
            border-radius: var(--radius-lg);
            padding: 10px;
        }

        .register-slots {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            min-height: 90px;
            max-height: 200px;
            overflow-y: auto;
            align-content: flex-start;
            padding-right: 4px;
        }

        .empty-cmd-slot {
            width: 48px;
            height: 38px;
            border: 1.5px dashed #1e293b;
            border-radius: 6px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #334155;
            font-size: 0.75rem;
            font-weight: 700;
        }

        .cmd-block {
            width: 48px;
            height: 38px;
            border-radius: 6px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-size: 0.65rem;
            font-weight: 800;
            cursor: pointer;
            user-select: none;
            transition: all 0.2s ease;
            position: relative;
        }

        .cmd-block.cmd-move { background: rgba(56, 189, 248, 0.15); border: 1.5px solid #38bdf8; color: #38bdf8; }
        .cmd-block.cmd-turn { background: rgba(168, 85, 247, 0.15); border: 1.5px solid #a855f7; color: #c084fc; }
        .cmd-block.cmd-jump { background: rgba(234, 88, 12, 0.15); border: 1.5px solid #ea580c; color: #fb923c; }
        .cmd-block.cmd-act { background: rgba(250, 204, 21, 0.15); border: 1.5px solid #facc15; color: #fde047; }
        .cmd-block.cmd-f1 { background: rgba(16, 185, 129, 0.15); border: 1.5px solid #10b981; color: #34d399; }
        .cmd-block.cmd-f2 { background: rgba(244, 63, 94, 0.15); border: 1.5px solid #f43f5e; color: #fb7185; }

        .cmd-block.executing-cmd {
            transform: scale(1.15);
            box-shadow: 0 0 16px #ffffff, 0 0 24px currentColor;
            border-color: #ffffff;
            z-index: 10;
        }

        /* Playback & Debugger Controls */
        .debugger-bar {
            display: flex;
            gap: 6px;
            align-items: center;
            justify-content: space-between;
        }

        .speed-group {
            display: flex;
            gap: 4px;
            background: #020617;
            padding: 2px 4px;
            border-radius: var(--radius-md);
            border: 1px solid #1e293b;
        }

        .speed-btn {
            background: transparent;
            border: none;
            color: #64748b;
            font-size: 0.75rem;
            font-weight: 800;
            padding: 4px 6px;
            cursor: pointer;
            border-radius: 4px;
        }

        .speed-btn.active-speed {
            background: #1e293b;
            color: #38bdf8;
        }

        /* Radar Card */
        .radar-card {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(168, 85, 247, 0.3);
            border-radius: var(--radius-lg);
            padding: 12px 14px;
        }
    </style>
</asp:Content>

<asp:Content ID="Body" ContentPlaceHolderID="MainContent" runat="server">
    <div class="game-screen-container algobot-container">
        <!-- Top Bar -->
        <div class="game-top-bar">
            <div class="game-meta">
                <a href="<%= ResolveUrl("~/Default.aspx") %>" class="btn btn-outline btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Hub Menu
                </a>
                <span class="game-mode-badge" id="game-mode-badge" style="background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.35); color: #38bdf8;">
                    ⚡ AlgoBot: Stage 1
                </span>
                <span class="badge" id="chips-count-badge" style="background: rgba(52, 211, 153, 0.15); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3); padding: 4px 10px; border-radius: 12px; font-weight: 700; font-size: 0.8rem;">
                    0 / 1 Data Chips
                </span>
            </div>
            <div style="display: flex; gap: 8px;">
                <button type="button" class="btn btn-outline btn-sm" id="btn-open-stages-modal">
                    🗺️ Stages
                </button>
                <button type="button" class="btn btn-outline btn-sm" id="forfeit-game-btn" style="color: #fb7185; border-color: rgba(244,63,94,0.3);">
                    Exit Match
                </button>
            </div>
        </div>

        <!-- Workspace Grid -->
        <div class="algobot-workspace-grid">
            <!-- Left: Maze Chamber Canvas -->
            <div class="chamber-view-card">
                <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; margin-bottom: 8px;">
                    <div>
                        <div style="font-size: 1.05rem; font-weight: 800; color: #f8fafc;" id="current-stage-title">
                            Stage 1: First Instructions
                        </div>
                        <div style="font-size: 0.8rem; color: #94a3b8;">
                            Program the bot to collect all chips and navigate to the exit 🏁
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span class="badge" id="total-bytes-badge" style="background: #1e293b; color: #94a3b8; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 0.75rem;">
                            0 / 4 Par
                        </span>
                    </div>
                </div>

                <div class="chamber-canvas-wrapper">
                    <canvas class="algobot-canvas" id="algobot-canvas"></canvas>
                </div>

                <!-- Debugger & Playback Bar -->
                <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; margin-top: 10px;">
                    <div class="debugger-bar">
                        <button type="button" class="btn btn-primary btn-sm" id="btn-run-program" style="background: linear-gradient(135deg, #059669, #10b981);">
                            ▶ Run Code
                        </button>
                        <button type="button" class="btn btn-outline btn-sm" id="btn-step-program" title="Step Next Command">
                            ⏭️ Step
                        </button>
                        <button type="button" class="btn btn-outline btn-sm" id="btn-reset-program" title="Reset Bot to Start">
                            ↺ Reset
                        </button>
                    </div>

                    <div class="speed-group">
                        <span style="font-size: 0.7rem; color: #64748b; margin-right: 4px; display: flex; align-items: center;">Speed:</span>
                        <button type="button" class="speed-btn active-speed" data-speed="250">1x</button>
                        <button type="button" class="speed-btn" data-speed="125">2x</button>
                        <button type="button" class="speed-btn" data-speed="60">4x</button>
                    </div>
                </div>
            </div>

            <!-- Right: Programming IDE & Instruction Register -->
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div class="ide-panel">
                    <!-- Instruction Palette -->
                    <div class="palette-section">
                        <div style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">
                            INSTRUCTION BLOCKS (Click to Add)
                        </div>
                        <div class="palette-grid">
                            <button type="button" class="cmd-palette-btn" data-cmd="MOVE">
                                <span class="cmd-palette-icon">🚶</span>
                                <span>MOVE</span>
                            </button>
                            <button type="button" class="cmd-palette-btn" data-cmd="LEFT">
                                <span class="cmd-palette-icon">↺</span>
                                <span>TURN_L</span>
                            </button>
                            <button type="button" class="cmd-palette-btn" data-cmd="RIGHT">
                                <span class="cmd-palette-icon">↻</span>
                                <span>TURN_R</span>
                            </button>
                            <button type="button" class="cmd-palette-btn" data-cmd="JUMP">
                                <span class="cmd-palette-icon">⚡</span>
                                <span>JUMP</span>
                            </button>
                            <button type="button" class="cmd-palette-btn" data-cmd="ACTIVATE">
                                <span class="cmd-palette-icon">💡</span>
                                <span>ACTIVATE</span>
                            </button>
                            <button type="button" class="cmd-palette-btn" data-cmd="F1" style="border-color: rgba(16, 185, 129, 0.4);">
                                <span class="cmd-palette-icon">📦</span>
                                <span style="color: #34d399;">CALL F1</span>
                            </button>
                            <button type="button" class="cmd-palette-btn" data-cmd="F2" style="border-color: rgba(244, 63, 94, 0.4);">
                                <span class="cmd-palette-icon">📦</span>
                                <span style="color: #fb7185;">CALL F2</span>
                            </button>
                        </div>
                    </div>

                    <!-- Register Tabs -->
                    <div>
                        <div class="reg-tabs">
                            <button type="button" class="reg-tab-btn active-tab" data-reg="MAIN">MAIN[]</button>
                            <button type="button" class="reg-tab-btn" data-reg="F1">FUNC F1[]</button>
                            <button type="button" class="reg-tab-btn" data-reg="F2">FUNC F2[]</button>
                        </div>
                    </div>

                    <!-- Register Memory Slots -->
                    <div class="register-container">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                            <span style="font-size: 0.75rem; color: #94a3b8; font-weight: 700;">ACTIVE MEMORY REGISTER</span>
                            <button type="button" class="btn btn-outline btn-sm" id="btn-clear-register" style="padding: 2px 6px; font-size: 0.7rem;">
                                Clear Register
                            </button>
                        </div>
                        <div class="register-slots" id="slots-MAIN">
                            <!-- Injected dynamically -->
                        </div>
                        <div class="register-slots" id="slots-F1" style="display: none;">
                            <!-- Injected dynamically -->
                        </div>
                        <div class="register-slots" id="slots-F2" style="display: none;">
                            <!-- Injected dynamically -->
                        </div>
                    </div>

                    <div style="font-size: 0.75rem; color: #64748b;">
                        💡 <strong>Tip</strong>: Click command blocks to delete them. Call Subroutines (`F1`/`F2`) for recursion and DRY loops!
                    </div>
                </div>

                <!-- Opponent Radar in LAN Multiplayer -->
                <div class="radar-card" id="opponent-radar-panel" style="display: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: #c084fc;">📡 Opponent Telemetry</span>
                        <span style="font-size: 0.75rem; color: #94a3b8;" id="opponent-radar-name">Rival</span>
                    </div>
                    <div style="font-size: 0.85rem; font-weight: 700; color: #f8fafc; margin-top: 4px;" id="opponent-radar-bytes">
                        0 Instructions
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; margin-top: 2px;">
                        <span id="opponent-radar-chips">Data Chips: 0</span>
                        <span id="opponent-radar-status" style="color: #38bdf8;">Status: Idle</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Comprehensive Interactive Field Manual / Instructions -->
        <div style="margin-top: 24px; background: #0b1329; border: 1.5px solid #1e293b; border-radius: var(--radius-xl); padding: 22px 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid #1e293b; padding-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(56, 189, 248, 0.15); border: 1.5px solid #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                        📖
                    </div>
                    <div>
                        <h3 style="font-size: 1.1rem; font-weight: 800; color: #f8fafc; margin: 0;">
                            AlgoBot Programming Manual &amp; Screen Guide
                        </h3>
                        <p style="font-size: 0.8rem; color: #94a3b8; margin: 0;">
                            Everything you need to know about the maze symbols, memory registers, and instruction blocks.
                        </p>
                    </div>
                </div>
                <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); font-weight: 700; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem;">
                    💡 Offline Sandboxed VM
                </span>
            </div>

            <!-- 3 Column Grid: Screen Elements, Command Blocks, Workflow -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
                <!-- Column 1: Screen & Map Symbols -->
                <div style="background: #020617; border: 1px solid #1e293b; border-radius: var(--radius-lg); padding: 14px;">
                    <h4 style="font-size: 0.9rem; font-weight: 800; color: #38bdf8; margin: 0 0 10px 0; display: flex; align-items: center; gap: 6px;">
                        <span>🗺️</span> Board Elements &amp; Symbols
                    </h4>
                    <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; font-size: 0.8rem; color: #cbd5e1;">
                        <li style="display: flex; gap: 8px; align-items: flex-start;">
                            <span style="background: #0284c7; color: #fff; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; flex-shrink: 0; font-weight: 800; border: 1px solid #38bdf8;">▲</span>
                            <div>
                                <strong style="color: #f8fafc;">Autonomous Bot Drone:</strong> The glowing cyan bot. The <span style="color: #38bdf8; font-weight: 700;">white arrow</span> inside indicates the bot's current heading (<strong style="color: #38bdf8;">North, East, South, West</strong>).
                            </div>
                        </li>
                        <li style="display: flex; gap: 8px; align-items: flex-start;">
                            <span style="font-size: 1.1rem; line-height: 1; flex-shrink: 0;">🏁</span>
                            <div>
                                <strong style="color: #34d399;">Exit Terminal (Green Box):</strong> Your target destination. Bot must reach this tile after collecting all chips.
                            </div>
                        </li>
                        <li style="display: flex; gap: 8px; align-items: flex-start;">
                            <span style="font-size: 1.1rem; line-height: 1; flex-shrink: 0;">💎</span>
                            <div>
                                <strong style="color: #38bdf8;">Data Chips:</strong> Stand on the chip's tile and run <strong style="color: #facc15;">ACTIVATE (💡)</strong> to harvest it.
                            </div>
                        </li>
                        <li style="display: flex; gap: 8px; align-items: flex-start;">
                            <span style="font-size: 1.1rem; line-height: 1; flex-shrink: 0;">🔘 / ⛔</span>
                            <div>
                                <strong style="color: #fbbf24;">Switch &amp; Laser Gate:</strong> Stand on the yellow button (<strong style="color: #facc15;">🔘</strong>) and run <strong style="color: #facc15;">ACTIVATE</strong> to open locked barriers (<strong style="color: #f43f5e;">⛔</strong>).
                            </div>
                        </li>
                        <li style="display: flex; gap: 8px; align-items: flex-start;">
                            <span style="font-size: 1.1rem; line-height: 1; flex-shrink: 0;">⚡</span>
                            <div>
                                <strong style="color: #f87171;">Electric Hazard / Gap:</strong> Walking into hazards causes a crash. Use <strong style="color: #fb923c;">JUMP (⚡)</strong> to leap over them.
                            </div>
                        </li>
                    </ul>
                </div>

                <!-- Column 2: Instruction Blocks Reference -->
                <div style="background: #020617; border: 1px solid #1e293b; border-radius: var(--radius-lg); padding: 14px;">
                    <h4 style="font-size: 0.9rem; font-weight: 800; color: #a855f7; margin: 0 0 10px 0; display: flex; align-items: center; gap: 6px;">
                        <span>⚙️</span> Instruction Set Reference
                    </h4>
                    <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; font-size: 0.8rem; color: #cbd5e1;">
                        <li style="display: flex; gap: 8px; align-items: flex-start;">
                            <span class="badge" style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid #38bdf8; font-weight: 800; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; flex-shrink: 0;">MOVE</span>
                            <div>Steps 1 tile forward in current heading. Avoid walls!</div>
                        </li>
                        <li style="display: flex; gap: 8px; align-items: flex-start;">
                            <span class="badge" style="background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid #a855f7; font-weight: 800; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; flex-shrink: 0;">TURN_L / R</span>
                            <div>Rotates the bot 90° left (↺) or right (↻) in place.</div>
                        </li>
                        <li style="display: flex; gap: 8px; align-items: flex-start;">
                            <span class="badge" style="background: rgba(234, 88, 12, 0.2); color: #fb923c; border: 1px solid #ea580c; font-weight: 800; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; flex-shrink: 0;">JUMP</span>
                            <div>Thruster leaps 2 tiles ahead over hazard pits.</div>
                        </li>
                        <li style="display: flex; gap: 8px; align-items: flex-start;">
                            <span class="badge" style="background: rgba(250, 204, 21, 0.2); color: #fde047; border: 1px solid #facc15; font-weight: 800; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; flex-shrink: 0;">ACTIVATE</span>
                            <div>Interacts with current tile: collects 💎 or flips 🔘.</div>
                        </li>
                        <li style="display: flex; gap: 8px; align-items: flex-start;">
                            <span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #10b981; font-weight: 800; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; flex-shrink: 0;">CALL F1/F2</span>
                            <div>Executes subroutine in <strong style="color: #34d399;">FUNC F1[]</strong> or <strong style="color: #fb7185;">FUNC F2[]</strong>.</div>
                        </li>
                    </ul>
                </div>

                <!-- Column 3: Programming Workflow & Tips -->
                <div style="background: #020617; border: 1px solid #1e293b; border-radius: var(--radius-lg); padding: 14px;">
                    <h4 style="font-size: 0.9rem; font-weight: 800; color: #34d399; margin: 0 0 10px 0; display: flex; align-items: center; gap: 6px;">
                        <span>🧠</span> How to Program &amp; Debug
                    </h4>
                    <ol style="padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 8px; font-size: 0.8rem; color: #cbd5e1;">
                        <li>
                            <strong style="color: #f8fafc;">Select Register Tab:</strong> Click <strong style="color: #38bdf8;">MAIN[]</strong>, <strong style="color: #34d399;">FUNC F1[]</strong>, or <strong style="color: #fb7185;">FUNC F2[]</strong> to choose which code block to edit.
                        </li>
                        <li>
                            <strong style="color: #f8fafc;">Add / Delete Blocks:</strong> Click palette buttons to append instructions into empty slots (<strong style="color: #94a3b8;">1, 2, 3...</strong>). Click any placed block to delete it.
                        </li>
                        <li>
                            <strong style="color: #f8fafc;">Execute &amp; Step:</strong> Click <strong style="color: #10b981;">▶ Run Code</strong> to run continuously, or <strong style="color: #38bdf8;">⏭️ Step</strong> to debug one step at a time.
                        </li>
                        <li>
                            <strong style="color: #f8fafc;">Subroutine Loops:</strong> Call <code style="color: #34d399; background: #0f172a; padding: 1px 4px; border-radius: 3px;">CALL F1</code> at the end of <code style="color: #34d399; background: #0f172a; padding: 1px 4px; border-radius: 3px;">FUNC F1[]</code> to create infinite loops or perimeter walking!
                        </li>
                    </ol>
                </div>
            </div>
        </div>

        <!-- Bottom Reaction Bar -->
        <div class="game-toolbar">
            <div class="reaction-bar">
                <span style="font-size: 0.85rem; color: var(--text-muted); margin-right: 4px;">Quick Taunt:</span>
                <button type="button" class="reaction-btn btn-sm" data-msg="⚡ Code Executed!">Code Executed!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="📦 Subroutine Optimized!">Optimized!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="💎 Chips Harvested!">Chips Harvested!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="🤝 GG!">GG!</button>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">
                💡 <strong>Computational Law</strong>: Subroutines allow recursion and DRY code loops to solve strict memory constraints.
            </div>
        </div>
    </div>
</asp:Content>
