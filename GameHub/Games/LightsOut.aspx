<%@ Page Title="Lights Out: Quantum Switch - Game Hub" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="LightsOut.aspx.cs" Inherits="GameHub.Games.LightsOutPage" %>

<asp:Content ID="Head" ContentPlaceHolderID="HeadContent" runat="server">
    <script src="<%= ResolveUrl("~/Scripts/lightsout.js?v=1.0") %>" type="text/javascript"></script>
    <style>
        .lightsout-container {
            max-width: 860px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 10px;
        }

        /* Top HUD Bar */
        .lightsout-hud {
            width: 100%;
            max-width: 620px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(15, 23, 42, 0.85);
            border: 1px solid #1e293b;
            border-radius: var(--radius-lg);
            padding: 10px 16px;
            margin-bottom: 14px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.4);
            flex-wrap: wrap;
            gap: 8px;
        }

        .hud-stat-box {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.85rem;
            font-weight: 700;
        }

        .hud-badge {
            background: #020617;
            border: 1px solid #334155;
            color: #38bdf8;
            padding: 4px 10px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 0.95rem;
        }

        /* Stage Title Header */
        .stage-header-card {
            width: 100%;
            max-width: 620px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding: 0 4px;
        }

        .stage-title {
            font-size: 1.15rem;
            font-weight: 900;
            color: #f8fafc;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .tier-tag {
            background: rgba(56, 189, 248, 0.15);
            border: 1px solid rgba(56, 189, 248, 0.35);
            color: #38bdf8;
            font-size: 0.72rem;
            padding: 2px 8px;
            border-radius: 4px;
            text-transform: uppercase;
            font-weight: 700;
        }

        /* Progress Bar */
        .parity-bar-track {
            width: 100%;
            max-width: 620px;
            height: 6px;
            background: #1e293b;
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 16px;
        }

        .parity-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #38bdf8, #34d399);
            width: 0%;
            transition: width 0.3s ease;
        }

        /* Quantum Matrix Board */
        .lightsout-grid-container {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 16px;
            background: rgba(2, 6, 23, 0.75);
            border: 2px solid #1e293b;
            border-radius: var(--radius-xl);
            box-shadow: inset 0 0 24px rgba(0,0,0,0.8), 0 8px 32px rgba(0,0,0,0.5);
            margin-bottom: 16px;
        }

        .quantum-grid {
            display: grid;
            gap: 10px;
            width: 100%;
        }

        /* Quantum Node Button */
        .quantum-node {
            aspect-ratio: 1 / 1;
            min-width: 48px;
            min-height: 48px;
            background: #0f172a;
            border: 2px solid #334155;
            border-radius: 12px;
            cursor: pointer;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            outline: none;
            padding: 0;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        }

        .quantum-node:hover {
            transform: scale(1.05);
            border-color: #64748b;
        }

        .quantum-node:active {
            transform: scale(0.95);
        }

        /* Active Light Node State */
        .quantum-node.node-active {
            background: linear-gradient(135deg, #0284c7, #38bdf8);
            border-color: #7dd3fc;
            box-shadow: 0 0 16px rgba(56, 189, 248, 0.6), inset 0 0 8px rgba(255,255,255,0.4);
        }

        .quantum-node.node-active .node-core {
            width: 50%;
            height: 50%;
            background: #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 12px #ffffff;
            transition: all 0.2s ease;
        }

        .quantum-node.node-dormant .node-core {
            width: 20%;
            height: 20%;
            background: #1e293b;
            border-radius: 50%;
            transition: all 0.2s ease;
        }

        /* Pulse & Hint Animations */
        .quantum-node.node-pulse {
            animation: nodePulse 0.25s ease-out;
        }

        @keyframes nodePulse {
            0% { transform: scale(0.9); }
            50% { transform: scale(1.12); }
            100% { transform: scale(1); }
        }

        .quantum-node.node-hint-aura {
            animation: hintAura 0.8s ease-in-out infinite alternate;
            border-color: #fbbf24 !important;
            box-shadow: 0 0 24px #fbbf24, inset 0 0 12px #fbbf24 !important;
        }

        @keyframes hintAura {
            0% { transform: scale(1); box-shadow: 0 0 12px #fbbf24; }
            100% { transform: scale(1.1); box-shadow: 0 0 28px #f59e0b; }
        }

        /* Control Toolbar */
        .toolbar-panel {
            width: 100%;
            max-width: 620px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid #1e293b;
            border-radius: var(--radius-lg);
            padding: 10px 14px;
            margin-bottom: 16px;
            flex-wrap: wrap;
            gap: 8px;
        }

        .sandbox-controls {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.8rem;
            color: #94a3b8;
        }

        .sandbox-select {
            background: #020617;
            border: 1px solid #334155;
            color: #f8fafc;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.8rem;
        }

        /* Multiplayer Opponent Radar */
        .opp-radar-card {
            width: 100%;
            max-width: 620px;
            background: rgba(15, 23, 42, 0.85);
            border: 1px solid #334155;
            border-radius: var(--radius-lg);
            padding: 12px 16px;
            margin-bottom: 16px;
        }

        .opp-mini-grid {
            display: grid;
            gap: 4px;
            width: 140px;
            height: 140px;
            margin: 8px auto;
        }

        .opp-mini-node {
            border-radius: 3px;
            background: #1e293b;
            border: 1px solid #334155;
        }

        .opp-mini-node.opp-on {
            background: #38bdf8;
            box-shadow: 0 0 4px #38bdf8;
        }

        /* Mathematical Strategy Guide */
        .lightsout-guide {
            max-width: 680px;
            width: 100%;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid #1e293b;
            border-radius: var(--radius-lg);
            padding: 16px 20px;
            margin-top: 16px;
            text-align: left;
        }
    </style>
</asp:Content>

<asp:Content ID="Main" ContentPlaceHolderID="MainContent" runat="server">
    <div class="lightsout-container">

        <!-- Stage Title Header -->
        <div class="stage-header-card">
            <div class="stage-title">
                <span id="stage-title-text">Stage 1: Photon Spark</span>
                <span class="tier-tag" id="tier-badge">Tier 1</span>
            </div>
            <div style="display: flex; gap: 6px;">
                <button type="button" class="btn btn-outline" id="btn-prev-stage" style="padding: 4px 8px; font-size: 0.8rem;" title="Previous Stage">◀ Prev</button>
                <button type="button" class="btn btn-outline" id="btn-select-stage" style="padding: 4px 10px; font-size: 0.8rem;" title="Select Chamber 1-50">🗺️ Stages</button>
                <button type="button" class="btn btn-outline" id="btn-next-stage" style="padding: 4px 8px; font-size: 0.8rem;" title="Next Stage">Next ▶</button>
            </div>
        </div>

        <!-- Parity Progress Bar -->
        <div class="parity-bar-track">
            <div class="parity-bar-fill" id="parity-progress-bar"></div>
        </div>

        <!-- Top HUD Bar -->
        <div class="lightsout-hud">
            <div class="hud-stat-box">
                <span>💡 Remaining:</span>
                <span class="hud-badge" id="lights-remaining-badge">0</span>
            </div>

            <div class="hud-stat-box">
                <span>🎯 Moves:</span>
                <span class="hud-badge" id="moves-count-badge">0 / 5 (Par)</span>
            </div>

            <div class="hud-stat-box">
                <span>⏱️ Time:</span>
                <span class="hud-badge" id="timer-badge">00:00</span>
            </div>

            <div style="display: flex; align-items: center; gap: 6px;">
                <button type="button" class="btn btn-primary" id="btn-get-hint" style="padding: 4px 10px; font-size: 0.8rem; background: linear-gradient(135deg, #f59e0b, #fbbf24); color: #0f172a; font-weight: 800; border: none; box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);" title="Calculate Galois Field GF(2) Hint">
                    💡 Hint
                </button>
                <button type="button" class="btn btn-outline" id="btn-reset-grid" style="padding: 4px 8px; font-size: 0.8rem;" title="Reset Stage">
                    🔄 Reset
                </button>
                <a href="../Default.aspx" class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" title="Exit to Game Hub">
                    🚪 Exit
                </a>
            </div>
        </div>

        <!-- Quantum Matrix Board -->
        <div class="lightsout-grid-container">
            <div id="lightsout-grid" class="quantum-grid"></div>
        </div>

        <!-- Sandbox & Mode Customizer Toolbar -->
        <div class="toolbar-panel">
            <div class="sandbox-controls">
                <span>Grid:</span>
                <select id="select-grid-size" class="sandbox-select">
                    <option value="3">3x3 (Fast)</option>
                    <option value="4">4x4 (Tactical)</option>
                    <option value="5" selected="selected">5x5 (Classic)</option>
                    <option value="6">6x6 (Grandmaster)</option>
                </select>

                <span>Mode:</span>
                <select id="select-toggle-mode" class="sandbox-select">
                    <option value="cross" selected="selected">Cross (+)</option>
                    <option value="diag">Diagonal (X)</option>
                </select>

                <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; font-size: 0.78rem;">
                    <input type="checkbox" id="chk-torus-mode" style="cursor: pointer;" />
                    <span>Torus (Wrap Edges)</span>
                </label>
            </div>

            <button type="button" class="btn btn-outline" id="btn-random-scramble" style="padding: 4px 8px; font-size: 0.8rem;" title="Generate Solvable Scramble">
                🎲 Scramble
            </button>
        </div>

        <!-- Multiplayer Opponent Telemetry Radar -->
        <div id="multiplayer-telemetry-card" class="opp-radar-card" style="display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: #f43f5e; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">📡 Opponent Radar (<span id="opponent-radar-name">Opponent</span>)</strong>
                <span style="font-size: 0.8rem; color: #94a3b8;">Remaining: <strong id="opp-lights-count" style="color: #38bdf8;">0</strong> | Moves: <strong id="opp-moves-count" style="color: #fbbf24;">0</strong></span>
            </div>
            <div id="opponent-radar-grid" class="opp-mini-grid"></div>
            <div id="opponent-radar-status" style="font-size: 0.75rem; color: #38bdf8; text-align: center;">Status: Solving quantum parity matrix...</div>
        </div>

        <!-- Strategy & Mathematical Guide -->
        <div class="lightsout-guide">
            <h3 style="color: #38bdf8; font-size: 0.95rem; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">📐 Quantum Parity &amp; Linear Algebra Manual</h3>
            <p style="font-size: 0.8rem; color: #94a3b8; line-height: 1.4; margin-bottom: 12px;">
                <strong>Objective:</strong> Turn OFF all glowing quantum nodes. Clicking any node inverts its state and all adjacent neighbors. Because toggles are commutative over Galois Field $\mathbb{Z}_2$, clicking a node twice cancels out (order does not matter!).
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                <div style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 10px;">
                    <strong style="color: #34d399; font-size: 0.82rem;">1. "Light Chasing" Strategy</strong>
                    <p style="font-size: 0.75rem; color: #cbd5e1; margin-top: 4px;">Start from row 1 and click the nodes directly below any lit node in row 2, continuing down to row 5 to push all lights to the bottom.</p>
                </div>
                <div style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 10px;">
                    <strong style="color: #fbbf24; font-size: 0.82rem;">2. Galois Field $\text{GF}(2)$ Solver</strong>
                    <p style="font-size: 0.75rem; color: #cbd5e1; margin-top: 4px;">Hit <strong>💡 Hint</strong> anytime to compute the exact nullspace linear equation solution vector $A \cdot x = b \pmod 2$.</p>
                </div>
                <div style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 10px;">
                    <strong style="color: #c084fc; font-size: 0.82rem;">3. Torus Topology &amp; Diagonal</strong>
                    <p style="font-size: 0.75rem; color: #cbd5e1; margin-top: 4px;">In Torus mode, energy conduits loop across borders! In Diagonal mode, nodes toggle their 'X' cross neighbors.</p>
                </div>
            </div>
        </div>

    </div>
</asp:Content>
