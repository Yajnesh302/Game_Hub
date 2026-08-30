<%@ Page Title="Laser & Mirrors: Photon Flow - Game Hub" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="LaserMirrors.aspx.cs" Inherits="GameHub.Games.LaserMirrorsPage" %>

<asp:Content ID="Head" ContentPlaceHolderID="HeadContent" runat="server">
    <script src="<%= ResolveUrl("~/Scripts/lasermirrors.js?v=2.2") %>" type="text/javascript"></script>
    <style>
        .optics-container {
            max-width: 920px;
            margin: 0 auto;
        }

        .optics-dashboard-grid {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 20px;
            margin: 16px 0;
        }

        @media (max-width: 860px) {
            .optics-dashboard-grid {
                grid-template-columns: 1fr;
            }
        }

        /* Chamber Arena Card */
        .chamber-arena-card {
            background: #020617;
            border: 2px solid #1e293b;
            border-radius: var(--radius-xl);
            padding: 20px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.7);
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
        }

        /* Relative Raytracing Overlay Container */
        .chamber-board-wrapper {
            position: relative;
            width: 100%;
            max-width: 440px;
            aspect-ratio: 1 / 1;
            margin: 10px 0;
        }

        .optics-grid-board {
            position: absolute;
            inset: 0;
            display: grid;
            gap: 8px;
            padding: 8px;
            background: rgba(15, 23, 42, 0.7);
            border: 2px solid #334155;
            border-radius: var(--radius-xl);
            box-shadow: inset 0 0 30px rgba(0,0,0,0.9);
            z-index: 2;
        }

        .optics-ray-canvas {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 5;
        }

        /* Chamber Slots */
        .chamber-slot {
            background: #090d16;
            border: 1.5px solid #1e293b;
            border-radius: var(--radius-lg);
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            position: relative;
            user-select: none;
            transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .chamber-slot:hover {
            border-color: #38bdf8;
            background: rgba(56, 189, 248, 0.05);
        }

        /* Elements */
        .element-emitter {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #0f172a;
            border: 2px solid currentColor;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1.2rem;
            font-weight: 900;
        }

        .element-emitter.dir-E .emitter-arrow { transform: rotate(0deg); }
        .element-emitter.dir-S .emitter-arrow { transform: rotate(90deg); }
        .element-emitter.dir-W .emitter-arrow { transform: rotate(180deg); }
        .element-emitter.dir-N .emitter-arrow { transform: rotate(270deg); }

        .element-crystal {
            width: 38px;
            height: 38px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1.5rem;
            filter: drop-shadow(0 0 4px rgba(255,255,255,0.2));
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .element-crystal.crystal-powered {
            transform: scale(1.15);
            filter: drop-shadow(0 0 16px #38bdf8) drop-shadow(0 0 28px #38bdf8);
            animation: crystalPulse 1.2s infinite alternate;
        }

        @keyframes crystalPulse {
            from { transform: scale(1.15); filter: drop-shadow(0 0 14px #38bdf8); }
            to { transform: scale(1.25); filter: drop-shadow(0 0 24px #38bdf8) drop-shadow(0 0 32px #818cf8); }
        }

        .element-block {
            font-size: 1.4rem;
            opacity: 0.85;
        }

        .element-portal {
            font-size: 1.6rem;
            animation: portalSpin 4s linear infinite;
        }

        @keyframes portalSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .element-mirror {
            font-size: 1.6rem;
            font-weight: 900;
            color: #38bdf8;
            filter: drop-shadow(0 0 8px rgba(56,189,248,0.7));
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .element-mirror.fixed-mirror {
            color: #94a3b8;
            filter: none;
        }

        .element-prism {
            font-size: 1.5rem;
            filter: drop-shadow(0 0 10px rgba(250, 204, 21, 0.8));
        }

        /* Tool Dock */
        .tools-panel {
            background: #0f172a;
            border: 1.5px solid #334155;
            border-radius: var(--radius-xl);
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .inventory-dock {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .tool-btn {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #020617;
            border: 1.5px solid #334155;
            border-radius: var(--radius-lg);
            padding: 10px 14px;
            color: #f8fafc;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .tool-btn:hover:not(:disabled) {
            border-color: #38bdf8;
            transform: translateX(4px);
        }

        .tool-btn.active-tool {
            border-color: #38bdf8;
            background: rgba(56, 189, 248, 0.1);
            box-shadow: 0 0 16px rgba(56, 189, 248, 0.3);
        }

        .tool-btn.depleted {
            opacity: 0.4;
            cursor: not-allowed;
        }

        .tool-symbol {
            font-size: 1.1rem;
            font-weight: 800;
            color: #38bdf8;
        }

        .tool-name {
            font-size: 0.85rem;
            font-weight: 700;
        }

        .tool-badge {
            font-size: 0.75rem;
            font-weight: 800;
            background: #1e293b;
            padding: 2px 8px;
            border-radius: 10px;
            color: #94a3b8;
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
    <div class="game-screen-container optics-container">
        <!-- Top Navigation -->
        <div class="game-top-bar">
            <div class="game-meta">
                <a href="<%= ResolveUrl("~/Default.aspx") %>" class="btn btn-outline btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Hub Menu
                </a>
                <span class="game-mode-badge" id="game-mode-badge" style="background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.35); color: #38bdf8;">
                    ⚡ Laser &amp; Mirrors
                </span>
                <span class="badge" id="crystal-power-badge" style="background: rgba(52, 211, 153, 0.15); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3); padding: 4px 10px; border-radius: 12px; font-weight: 700; font-size: 0.8rem;">
                    0 / 1 Crystals Energized
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

        <!-- Main Chamber Grid Workspace -->
        <div class="optics-dashboard-grid">
            <!-- Left: Laser Chamber -->
            <div class="chamber-arena-card">
                <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; margin-bottom: 8px;">
                    <div>
                        <div style="font-size: 1.05rem; font-weight: 800; color: #f8fafc;" id="current-stage-title">
                            Stage 1: First Refraction
                        </div>
                        <div style="font-size: 0.8rem; color: #94a3b8;">
                            Rotate or place mirrors to guide photons into all target crystals
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span class="badge" id="move-count-badge" style="background: #1e293b; color: #94a3b8; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 0.75rem;">
                            0 Moves
                        </span>
                        <button type="button" class="btn btn-outline btn-sm" id="btn-reset-chamber" title="Reset Level">
                            ↺ Reset
                        </button>
                    </div>
                </div>

                <div class="chamber-board-wrapper">
                    <div class="optics-grid-board" id="optics-grid-board">
                        <!-- Injected dynamically -->
                    </div>
                    <canvas class="optics-ray-canvas" id="optics-ray-canvas"></canvas>
                </div>
            </div>

            <!-- Right: Inventory & Opponent Radar -->
            <div style="display: flex; flex-direction: column; gap: 14px;">
                <div class="tools-panel">
                    <div style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">
                        OPTICAL MIRROR TOOLKIT
                    </div>
                    <div class="inventory-dock" id="inventory-dock">
                        <!-- Injected dynamically -->
                    </div>
                    <div style="font-size: 0.75rem; color: #64748b; margin-top: 4px;">
                        💡 <strong>Controls</strong>: Select a mirror from toolkit and click an empty slot to place. Click placed mirrors on board to rotate 90°!
                    </div>
                </div>

                <!-- Opponent Radar in LAN Multiplayer -->
                <div class="radar-card" id="opponent-radar-panel" style="display: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: #c084fc;">📡 Opponent Telemetry</span>
                        <span style="font-size: 0.75rem; color: #94a3b8;" id="opponent-radar-name">Opponent</span>
                    </div>
                    <div style="font-size: 0.85rem; font-weight: 700; color: #f8fafc; margin-top: 4px;" id="opponent-radar-crystals">
                        Energized: 0 / 1
                    </div>
                    <div style="font-size: 0.75rem; color: #64748b; margin-top: 2px;" id="opponent-radar-moves">
                        0 Moves
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
                <button type="button" class="reaction-btn btn-sm" data-msg="⚡ Photons Aligned!">Photons Aligned!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="💎 Crystal Powered!">Crystal Powered!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="✨ Quantum Overdrive!">Overdrive!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="🤝 Well Played!">GG!</button>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">
                💡 <strong>Optics Law</strong>: Diagonal planar mirrors reflect light rays by 90°. Prisms split 1 beam into 2 perpendicular beams!
            </div>
        </div>
    </div>
</asp:Content>
