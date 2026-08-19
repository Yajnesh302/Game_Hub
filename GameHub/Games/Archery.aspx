<%@ Page Title="Olympic Archery Clash - Game Hub" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Archery.aspx.cs" Inherits="GameHub.Games.ArcheryPage" %>

<asp:Content ID="Head" ContentPlaceHolderID="HeadContent" runat="server">
    <script src="<%= ResolveUrl("~/Scripts/archeryPhysics.js") %>" type="text/javascript"></script>
    <script src="<%= ResolveUrl("~/Scripts/archery.js") %>" type="text/javascript"></script>
    <style>
        .archery-score-pill {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.12);
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--text-muted);
            transition: all 0.2s ease;
        }
        .archery-score-pill.scored {
            background: rgba(56, 189, 248, 0.15);
            border-color: rgba(56, 189, 248, 0.5);
            color: #38bdf8;
        }
        .archery-score-pill.bullseye {
            background: rgba(245, 158, 11, 0.3);
            border-color: #f59e0b;
            color: #fbbf24;
            box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
        }
        .wind-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 5px 14px;
            border-radius: var(--radius-full);
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid var(--border-color);
            font-size: 0.85rem;
            color: var(--text-secondary);
        }
        .wind-badge.wind-active {
            border-color: rgba(56, 189, 248, 0.4);
            color: #38bdf8;
        }
        .wind-compass-arrow {
            display: inline-block;
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .target-minimap-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 8px 14px;
            border-radius: var(--radius-lg);
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid var(--border-color);
        }
    </style>
</asp:Content>

<asp:Content ID="Body" ContentPlaceHolderID="MainContent" runat="server">
    <div class="game-screen-container" style="max-width: 980px;">
        <!-- Top Bar -->
        <div class="game-top-bar">
            <div class="game-meta">
                <a href="<%= ResolveUrl("~/Default.aspx") %>" class="btn btn-outline btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Hub Menu
                </a>
                <span class="game-mode-badge" id="game-mode-badge" style="background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.35); color: #34d399;">Olympic Archery Clash</span>
            </div>
            <button type="button" class="btn btn-outline btn-sm" id="forfeit-game-btn" style="color: #fb7185; border-color: rgba(244,63,94,0.3);">
                Forfeit / Exit
            </button>
        </div>

        <!-- Match HUD (P1 vs P2 with Round Scorecards & Minimap) -->
        <div class="match-hud" style="grid-template-columns: 1fr auto auto 1fr;">
            <!-- Player 1 Card -->
            <div class="player-hud-card p1" id="p1-hud">
                <div class="player-hud-avatar" style="background: linear-gradient(135deg, #059669, #10b981);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
                </div>
                <div class="player-hud-info">
                    <div class="player-hud-name" id="p1-name">Player 1</div>
                    <div id="p1-shot-history" style="display: flex; gap: 4px; margin-top: 4px;"></div>
                </div>
            </div>

            <!-- Match Score & Wind Center Status -->
            <div class="match-center-status">
                <div class="scoreboard-display" style="display: flex; align-items: center; gap: 12px; font-size: 2.2rem; font-weight: 800; color: #f8fafc; font-family: Outfit, sans-serif;">
                    <span id="p1-score-display" style="color: #10b981; text-shadow: 0 0 14px rgba(16,185,129,0.5);">0</span>
                    <span style="color: var(--text-muted); font-size: 1.4rem;">:</span>
                    <span id="p2-score-display" style="color: #f43f5e; text-shadow: 0 0 14px rgba(244,63,94,0.5);">0</span>
                </div>
                <div id="round-number-text" style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">Round 1 / 5</div>
                <div class="turn-indicator-text" id="turn-indicator" style="font-size: 0.82rem; color: var(--accent-cyan); margin-top: 2px;">Your Shot - Drag sight onto target &amp; release</div>
                <div class="wind-badge" id="wind-status-badge" style="margin-top: 6px;">
                    <svg id="wind-arrow-icon" class="wind-compass-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    <span id="wind-status-text">Wind: <strong>0.0 m/s</strong></span>
                </div>
            </div>

            <!-- Target Impact Mini-Map -->
            <div class="target-minimap-card">
                <canvas id="target-minimap" width="70" height="70" style="width: 70px; height: 70px; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.5);"></canvas>
                <span style="font-size: 0.68rem; color: var(--text-muted); margin-top: 4px;">Impact Log</span>
            </div>

            <!-- Player 2 Card -->
            <div class="player-hud-card p2" id="p2-hud">
                <div class="player-hud-avatar" style="background: linear-gradient(135deg, #e11d48, #f43f5e);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
                </div>
                <div class="player-hud-info">
                    <div class="player-hud-name" id="p2-name">Opponent</div>
                    <div id="p2-shot-history" style="display: flex; gap: 4px; margin-top: 4px;"></div>
                </div>
            </div>
        </div>

        <!-- Archery 3D Canvas Range -->
        <div class="archery-canvas-wrapper" style="display: flex; justify-content: center; align-items: center; margin: 12px 0;">
            <canvas id="archery-canvas" width="900" height="480" style="max-width: 100%; height: auto; border-radius: var(--radius-xl); box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(16,185,129,0.18); cursor: crosshair; touch-action: none; background: #060b18; border: 4px solid #334155;"></canvas>
        </div>

        <!-- Bottom Game Toolbar -->
        <div class="game-toolbar">
            <div class="reaction-bar">
                <span style="font-size: 0.85rem; color: var(--text-muted); margin-right: 4px;">Quick Chat:</span>
                <button type="button" class="reaction-btn btn-sm" data-msg="Bullseye!" title="Bullseye">Bullseye!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="Nice shot!" title="Nice shot">Nice Shot!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="Watch the wind!" title="Watch the wind">Windy!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="Good Game!" title="Good Game">GG!</button>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">
                3D Olympic Range | Sight-Pin Aiming &amp; Slow-Mo Impact Cam
            </div>
        </div>
    </div>
</asp:Content>
