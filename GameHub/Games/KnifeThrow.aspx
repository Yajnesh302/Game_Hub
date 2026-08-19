<%@ Page Title="Knife Throw Precision - Game Hub" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="KnifeThrow.aspx.cs" Inherits="GameHub.Games.KnifeThrowPage" %>

<asp:Content ID="Head" ContentPlaceHolderID="HeadContent" runat="server">
    <script src="<%= ResolveUrl("~/Scripts/knifethrow.js") %>" type="text/javascript"></script>
    <style>
        .knifethrow-layout {
            display: grid;
            grid-template-columns: 1fr 340px;
            gap: 24px;
            align-items: start;
        }

        @media (max-width: 900px) {
            .knifethrow-layout {
                grid-template-columns: 1fr;
            }
        }

        .knifethrow-hud {
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

        .knifethrow-hud-stats {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .knifethrow-stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .knifethrow-stat-label {
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--text-muted);
            letter-spacing: 0.05em;
        }

        .knifethrow-stat-val {
            font-size: 1.35rem;
            font-weight: 800;
            color: #f8fafc;
            font-family: Outfit, Inter, sans-serif;
            line-height: 1.1;
        }

        .knifethrow-canvas-wrapper {
            position: relative;
            width: 540px;
            max-width: 100%;
            aspect-ratio: 27 / 32;
            background: #060b18;
            border: 4px solid #334155;
            border-radius: var(--radius-xl);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.15);
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        #knifethrow-canvas {
            width: 100%;
            height: 100%;
            display: block;
            cursor: pointer;
            touch-action: none;
        }

        .knifethrow-stack-hud {
            display: flex;
            align-items: center;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            padding: 4px 10px;
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
                <span class="game-mode-badge" style="background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;">Knife Throw Precision</span>
            </div>
            <div style="display: flex; gap: 8px;">
                <button type="button" class="btn btn-outline btn-sm" id="new-game-btn" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    New Game
                </button>
            </div>
        </div>

        <!-- Main Layout (Game Arena + Leaderboard Sidebar) -->
        <div class="knifethrow-layout">
            <!-- Left Area: HUD & Canvas -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 14px;">
                <!-- In-Game Minimal HUD -->
                <div class="knifethrow-hud">
                    <div class="knifethrow-hud-stats">
                        <div class="knifethrow-stat-item">
                            <span class="knifethrow-stat-label">Score</span>
                            <span class="knifethrow-stat-val" id="current-score" style="color: #38bdf8;">0</span>
                        </div>
                        <div class="knifethrow-stat-item">
                            <span class="knifethrow-stat-label">Best</span>
                            <span class="knifethrow-stat-val" id="best-score" style="color: #facc15;">0</span>
                        </div>
                        <div class="knifethrow-stat-item">
                            <span class="knifethrow-stat-label">Stage</span>
                            <span class="knifethrow-stat-val" id="current-level" style="color: #34d399;">1</span>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; align-items: flex-end;">
                        <span class="knifethrow-stat-label" style="margin-bottom: 4px;">Remaining Knives</span>
                        <div class="knifethrow-stack-hud" id="knife-stack-container">
                            <!-- Populated dynamically via JS -->
                        </div>
                    </div>
                </div>

                <!-- Canvas Arcade Arena -->
                <div class="knifethrow-canvas-wrapper">
                    <canvas id="knifethrow-canvas" width="540" height="640"></canvas>
                </div>

                <!-- Controls Guide -->
                <div style="font-size: 0.82rem; color: var(--text-muted); text-align: center; max-width: 480px;">
                    Timing is everything! <strong>Click / Tap</strong> anywhere or press <strong>Space / Up Arrow</strong> to throw your knife into open target wood. Avoid already-stuck knives and red obstacle wedges!
                </div>
            </div>

            <!-- Right Area: High-Score Leaderboard Sidebar -->
            <div class="game2048-sidebar">
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--panel-border); padding-bottom: 12px;">
                    <div style="font-weight: 700; font-size: 1.1rem; color: #f8fafc; display: flex; align-items: center; gap: 8px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>
                        Knife Throw Hall of Fame
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
                    <tbody id="leaderboard-knifethrow-body">
                        <tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 14px;">Loading top scores...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</asp:Content>
