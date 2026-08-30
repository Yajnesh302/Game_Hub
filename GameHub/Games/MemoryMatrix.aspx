<%@ Page Title="Memory Matrix: Cyber Recall - Game Hub" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="MemoryMatrix.aspx.cs" Inherits="GameHub.Games.MemoryMatrixPage" %>

<asp:Content ID="Head" ContentPlaceHolderID="HeadContent" runat="server">
    <script src="<%= ResolveUrl("~/Scripts/memorymatrix.js?v=2.2") %>" type="text/javascript"></script>
    <style>
        .memory-container {
            max-width: 880px;
            margin: 0 auto;
        }

        .memory-dashboard-grid {
            display: grid;
            grid-template-columns: 1fr 280px;
            gap: 20px;
            margin: 16px 0;
        }

        @media (max-width: 840px) {
            .memory-dashboard-grid {
                grid-template-columns: 1fr;
            }
        }

        /* Arena Card */
        .matrix-arena-card {
            background: #020617;
            border: 2px solid #1e293b;
            border-radius: var(--radius-xl);
            padding: 24px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.7);
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
        }

        /* Countdown Energy Bar */
        .countdown-bar-wrapper {
            width: 100%;
            height: 6px;
            background: #0f172a;
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 20px;
        }

        .countdown-energy-bar {
            height: 100%;
            width: 100%;
            background: linear-gradient(90deg, #38bdf8, #818cf8);
            box-shadow: 0 0 10px rgba(56, 189, 248, 0.8);
        }

        /* Matrix Dynamic Grid */
        .matrix-grid-frame {
            width: 100%;
            max-width: 440px;
            aspect-ratio: 1 / 1;
            background: rgba(15, 23, 42, 0.7);
            border: 2px solid #334155;
            border-radius: var(--radius-xl);
            padding: 14px;
            display: grid;
            gap: 10px;
            box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.1);
            perspective: 1000px;
            transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .matrix-grid-frame.transforming-spin {
            animation: matrixSpin3D 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes matrixSpin3D {
            0% { transform: scale(1) rotate(0deg); opacity: 1; }
            50% { transform: scale(0.85) rotate(180deg); opacity: 0.5; }
            100% { transform: scale(1) rotate(360deg); opacity: 1; }
        }

        /* Matrix Tiles */
        .matrix-tile {
            background: linear-gradient(135deg, #090d16 0%, #1e293b 100%);
            border: 2px solid #334155;
            border-radius: var(--radius-lg);
            cursor: pointer;
            position: relative;
            transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
            user-select: none;
        }

        .matrix-tile:hover {
            border-color: #64748b;
            transform: scale(1.04);
        }

        .matrix-tile:active {
            transform: scale(0.96);
        }

        /* Flashing target phase */
        .matrix-tile.flashing-target {
            background: radial-gradient(circle at 50% 50%, #ffffff 0%, #38bdf8 50%, #0284c7 100%);
            border-color: #7dd3fc;
            box-shadow: 0 0 24px rgba(56, 189, 248, 0.9), inset 0 0 10px #ffffff;
            transform: scale(1.06);
            animation: targetPulse 0.8s infinite alternate;
        }

        @keyframes targetPulse {
            from { filter: brightness(1); }
            to { filter: brightness(1.35); }
        }

        /* Correct Recall */
        .matrix-tile.tile-correct {
            background: radial-gradient(circle at 50% 50%, #ffffff 0%, #34d399 50%, #059669 100%);
            border-color: #6ee7b7;
            box-shadow: 0 0 24px rgba(52, 211, 153, 0.9);
            transform: scale(1.04);
            cursor: default;
        }

        /* Wrong Recall */
        .matrix-tile.tile-wrong {
            background: radial-gradient(circle at 50% 50%, #ffffff 0%, #f43f5e 50%, #be123c 100%);
            border-color: #fda4af;
            box-shadow: 0 0 24px rgba(244, 63, 94, 0.9);
            transform: scale(0.96);
            cursor: default;
        }

        /* Missed target on game over */
        .matrix-tile.tile-missed {
            background: radial-gradient(circle at 50% 50%, #ffffff 0%, #fbbf24 50%, #d97706 100%);
            border-color: #fde68a;
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.8);
        }

        /* Stats & Radar Panel */
        .neural-sidebar {
            display: flex;
            flex-direction: column;
            gap: 14px;
        }

        .neural-card {
            background: #0f172a;
            border: 1.5px solid #334155;
            border-radius: var(--radius-xl);
            padding: 16px;
        }

        .shield-icon {
            font-size: 1.3rem;
            margin-right: 4px;
            filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.6));
        }

        .shield-icon.broken {
            opacity: 0.35;
            filter: grayscale(1);
        }

        /* Opponent Radar */
        .radar-card {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(168, 85, 247, 0.3);
            border-radius: var(--radius-lg);
            padding: 12px 14px;
        }

        .radar-progress {
            height: 6px;
            background: #1e293b;
            border-radius: 3px;
            overflow: hidden;
            margin-top: 6px;
        }

        .radar-progress-bar {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #9333ea, #c084fc);
            transition: width 0.3s ease;
        }
    </style>
</asp:Content>

<asp:Content ID="Body" ContentPlaceHolderID="MainContent" runat="server">
    <div class="game-screen-container memory-container">
        <!-- Top Navigation -->
        <div class="game-top-bar">
            <div class="game-meta">
                <a href="<%= ResolveUrl("~/Default.aspx") %>" class="btn btn-outline btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Hub Menu
                </a>
                <span class="game-mode-badge" id="game-mode-badge" style="background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.35); color: #38bdf8;">
                    🧠 Memory Matrix
                </span>
                <span class="badge" id="current-level-badge" style="background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); padding: 4px 10px; border-radius: 12px; font-weight: 700; font-size: 0.8rem;">
                    Stage 1
                </span>
            </div>
            <button type="button" class="btn btn-outline btn-sm" id="forfeit-game-btn" style="color: #fb7185; border-color: rgba(244,63,94,0.3);">
                Exit Match
            </button>
        </div>

        <!-- Main Workspace Grid -->
        <div class="memory-dashboard-grid">
            <!-- Left: Matrix Area -->
            <div class="matrix-arena-card">
                <div class="countdown-bar-wrapper">
                    <div class="countdown-energy-bar" id="countdown-energy-bar"></div>
                </div>

                <div style="text-align: center; margin-bottom: 16px;">
                    <div style="font-size: 1.15rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px;" id="phase-indicator">
                        ⚡ MEMORIZE PATTERN
                    </div>
                    <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 2px;" id="status-subtext">
                        Memorize the illuminated nodes before they flip dark
                    </div>
                    <div id="rotation-warning-badge" style="display: none; font-size: 0.8rem; color: #fbbf24; font-weight: 800; margin-top: 4px; background: rgba(245, 158, 11, 0.15); padding: 2px 10px; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.3); display: inline-block;">
                        🔄 Matrix will rotate 90°!
                    </div>
                </div>

                <!-- Dynamic Neural Matrix Grid -->
                <div class="matrix-grid-frame" id="matrix-grid">
                    <!-- Injected dynamically -->
                </div>
            </div>

            <!-- Right: Stats & Opponent Telemetry -->
            <div class="neural-sidebar">
                <div class="neural-card">
                    <div style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">
                        NEURAL SHIELDS (LIVES)
                    </div>
                    <div id="neural-shields-container" style="display: flex; gap: 4px; margin: 8px 0 14px;">
                        <span class="shield-icon active">🛡️</span>
                        <span class="shield-icon active">🛡️</span>
                        <span class="shield-icon active">🛡️</span>
                    </div>

                    <div style="display: flex; justify-content: space-between; border-top: 1px solid #1e293b; padding-top: 10px;">
                        <div>
                            <div style="font-size: 0.75rem; color: #64748b;">SCORE</div>
                            <div style="font-size: 1.15rem; font-weight: 800; color: #34d399;" id="current-score-badge">0 PTS</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 0.75rem; color: #64748b;">MULTIPLIER</div>
                            <div style="font-size: 1rem; font-weight: 800; color: #fbbf24;" id="current-combo-badge">1x Multiplier</div>
                        </div>
                    </div>
                </div>

                <!-- Opponent Radar in LAN Multiplayer -->
                <div class="radar-card" id="opponent-radar-panel" style="display: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: #c084fc;">📡 Opponent Radar</span>
                        <span style="font-size: 0.75rem; color: #94a3b8;" id="opponent-radar-name">Opponent</span>
                    </div>
                    <div style="font-size: 0.85rem; font-weight: 700; color: #f8fafc; margin-top: 4px;" id="opponent-radar-stage">
                        Stage 1 (0 PTS)
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; margin-top: 2px;">
                        <span id="opponent-radar-nodes">Nodes: 0 / 3</span>
                        <span id="opponent-radar-shields">🛡️🛡️🛡️</span>
                    </div>
                    <div class="radar-progress">
                        <div class="radar-progress-bar" id="opponent-radar-progress-bar"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bottom Game Toolbar -->
        <div class="game-toolbar">
            <div class="reaction-bar">
                <span style="font-size: 0.85rem; color: var(--text-muted); margin-right: 4px;">Quick Taunt:</span>
                <button type="button" class="reaction-btn btn-sm" data-msg="🧠 Flawless Recall!">Flawless!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="🔥 On a Streak!">Streak!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="⚡ Stage Cleared!">Cleared!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="🤝 Great Memory!">GG!</button>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">
                💡 <strong>Brain Workout</strong>: Visual working memory, spatial transformation, and rapid pattern recall.
            </div>
        </div>
    </div>
</asp:Content>
