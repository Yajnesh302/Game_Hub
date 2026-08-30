<%@ Page Title="Brick Blast Swarm - Game Hub" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="BrickBlast.aspx.cs" Inherits="GameHub.Games.BrickBlastPage" %>

<asp:Content ID="Head" ContentPlaceHolderID="HeadContent" runat="server">
    <script src="<%= ResolveUrl("~/Scripts/brickblast.js") %>" type="text/javascript"></script>
    <style>
        .brickblast-layout {
            display: grid;
            grid-template-columns: 1fr 340px;
            gap: 24px;
            align-items: start;
        }

        @media (max-width: 900px) {
            .brickblast-layout {
                grid-template-columns: 1fr;
            }
        }

        .brickblast-hud {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            max-width: 540px;
            background: var(--panel-bg);
            border: 1px solid var(--panel-border);
            border-radius: var(--radius-lg);
            padding: 12px 20px;
            backdrop-filter: var(--glass-blur);
        }

        .brickblast-hud-stats {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .brickblast-stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .brickblast-stat-label {
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--text-muted);
            letter-spacing: 0.05em;
        }

        .brickblast-stat-val {
            font-size: 1.35rem;
            font-weight: 800;
            color: #f8fafc;
            font-family: Outfit, Inter, sans-serif;
            line-height: 1.1;
        }

        .brickblast-canvas-wrapper {
            position: relative;
            width: 540px;
            max-width: 100%;
            aspect-ratio: 27 / 34;
            background: #060b18;
            border: 4px solid #334155;
            border-radius: var(--radius-xl);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.15);
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        #brickblast-canvas {
            width: 100%;
            height: 100%;
            display: block;
            cursor: crosshair;
            touch-action: none;
        }

        .btn-speed-active {
            background: rgba(250, 204, 21, 0.2) !important;
            border-color: #facc15 !important;
            color: #facc15 !important;
            font-weight: 800;
        }
    </style>
</asp:Content>

<asp:Content ID="Body" ContentPlaceHolderID="MainContent" runat="server">
    <div class="game-screen-container" style="max-width: 940px;">
        <!-- Top Bar -->
        <div class="game-top-bar">
            <div class="game-meta">
                <a href="<%= ResolveUrl("~/Default.aspx") %>" class="btn btn-outline btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Hub Menu
                </a>
                <span class="game-mode-badge" style="background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;">Brick Blast: Ball Crusher</span>
            </div>
            <div style="display: flex; gap: 8px;">
                <button type="button" class="btn btn-outline btn-sm" id="speed-btn" style="color: #facc15; border-color: rgba(250, 204, 21, 0.4);" title="Toggle 1x / 2x / 3x Speed">
                    ⚡ 1x Speed
                </button>
                <button type="button" class="btn btn-outline btn-sm" id="recall-btn" style="color: #a855f7; border-color: rgba(168, 85, 247, 0.4);" title="Recall all balls instantly">
                    ⏩ Recall
                </button>
                <button type="button" class="btn btn-outline btn-sm" id="new-game-btn" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    New Game
                </button>
            </div>
        </div>

        <!-- Main Layout (Game Area + Leaderboard Sidebar) -->
        <div class="brickblast-layout">
            <!-- Left Area: HUD & Canvas -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 14px;">
                <!-- In-Game Minimal HUD -->
                <div class="brickblast-hud">
                    <div class="brickblast-hud-stats">
                        <div class="brickblast-stat-item">
                            <span class="brickblast-stat-label">Score</span>
                            <span class="brickblast-stat-val" id="current-score" style="color: #38bdf8;">0</span>
                        </div>
                        <div class="brickblast-stat-item">
                            <span class="brickblast-stat-label">Best</span>
                            <span class="brickblast-stat-val" id="best-score" style="color: #facc15;">0</span>
                        </div>
                        <div class="brickblast-stat-item">
                            <span class="brickblast-stat-label">Stage</span>
                            <span class="brickblast-stat-val" id="current-level" style="color: #34d399;">1</span>
                        </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div class="brickblast-stat-item">
                            <span class="brickblast-stat-label">Swarm Size</span>
                            <span class="brickblast-stat-val" id="swarm-count" style="color: #38bdf8;">25 ⚪</span>
                        </div>
                        <div class="brickblast-stat-item">
                            <span class="brickblast-stat-label">Combo</span>
                            <span class="brickblast-stat-val" id="current-combo" style="color: #fb7185;">1x</span>
                        </div>
                    </div>
                </div>

                <!-- Canvas Arcade Field -->
                <div class="brickblast-canvas-wrapper">
                    <canvas id="brickblast-canvas" width="540" height="680"></canvas>
                </div>

                <!-- Controls Guide -->
                <div style="font-size: 0.82rem; color: var(--text-muted); text-align: center; max-width: 540px;">
                    🎯 <strong>Aim & Shoot:</strong> Drag / Move pointer to aim laser preview, <strong>Release / Click / Space</strong> to unleash ball swarm! Collect <strong>+1 Orbs</strong>, <strong>⚡ Laser Beams</strong>, and <strong>💣 Bombs</strong>. Destroy bricks before they reach the red bottom danger line!
                </div>
            </div>

            <!-- Right Area: High-Score Leaderboard Sidebar -->
            <div class="game2048-sidebar">
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--panel-border); padding-bottom: 12px;">
                    <div style="font-weight: 700; font-size: 1.1rem; color: #f8fafc; display: flex; align-items: center; gap: 8px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
                        Brick Blast Hall of Fame
                    </div>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">Top 10</span>
                </div>

                <table class="game2048-leaderboard-table">
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>Score</th>
                            <th>Stage</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody id="leaderboard-brickblast-body">
                        <tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 14px;">Loading top scores...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</asp:Content>
