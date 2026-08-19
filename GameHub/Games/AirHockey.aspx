<%@ Page Title="Air Hockey - Game Hub" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="AirHockey.aspx.cs" Inherits="GameHub.Games.AirHockeyPage" %>

<asp:Content ID="Head" ContentPlaceHolderID="HeadContent" runat="server">
    <script src="<%= ResolveUrl("~/Scripts/airhockeyPhysics.js") %>" type="text/javascript"></script>
    <script src="<%= ResolveUrl("~/Scripts/airhockey.js") %>" type="text/javascript"></script>
</asp:Content>

<asp:Content ID="Body" ContentPlaceHolderID="MainContent" runat="server">
    <div class="game-screen-container" style="max-width: 900px;">
        <!-- Top Bar -->
        <div class="game-top-bar">
            <div class="game-meta">
                <a href="<%= ResolveUrl("~/Default.aspx") %>" class="btn btn-outline btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Hub Menu
                </a>
                <span class="game-mode-badge" id="game-mode-badge" style="background: rgba(245, 158, 11, 0.15); border-color: rgba(245, 158, 11, 0.3); color: #fbbf24;">Air Hockey</span>
            </div>
            <button type="button" class="btn btn-outline btn-sm" id="forfeit-game-btn" style="color: #fb7185; border-color: rgba(244,63,94,0.3);">
                Forfeit / Exit
            </button>
        </div>

        <!-- Match HUD (P1 vs P2 with Score Displays) -->
        <div class="match-hud">
            <div class="player-hud-card p1" id="p1-hud">
                <div class="player-hud-avatar" style="background: linear-gradient(135deg, #0284c7, #06b6d4);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
                </div>
                <div class="player-hud-info">
                    <div class="player-hud-name" id="p1-name">Player 1</div>
                    <div class="player-hud-sub" style="color: var(--accent-cyan);">Left Paddle (Cyan)</div>
                </div>
            </div>

            <div class="match-center-status">
                <div class="scoreboard-display" style="display: flex; align-items: center; gap: 12px; font-size: 2rem; font-weight: 800; color: #f8fafc; font-family: Outfit, sans-serif;">
                    <span id="p1-score-display" style="color: var(--accent-cyan); text-shadow: 0 0 14px rgba(6,182,212,0.6);">0</span>
                    <span style="color: var(--text-muted); font-size: 1.4rem;">:</span>
                    <span id="p2-score-display" style="color: var(--accent-rose); text-shadow: 0 0 14px rgba(244,63,94,0.6);">0</span>
                </div>
                <div class="turn-indicator-text" style="font-size: 0.82rem; color: var(--text-muted);">First to 7 Goals Wins</div>
            </div>

            <div class="player-hud-card p2" id="p2-hud">
                <div class="player-hud-avatar" style="background: linear-gradient(135deg, #e11d48, #f43f5e);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
                </div>
                <div class="player-hud-info">
                    <div class="player-hud-name" id="p2-name">Opponent</div>
                    <div class="player-hud-sub" style="color: var(--accent-rose);">Right Paddle (Rose)</div>
                </div>
            </div>
        </div>

        <!-- Air Hockey Canvas Board -->
        <div class="airhockey-canvas-wrapper" style="display: flex; justify-content: center; align-items: center; margin: 12px 0;">
            <canvas id="airhockey-canvas" width="800" height="480" style="max-width: 100%; height: auto; border-radius: var(--radius-xl); box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 25px rgba(56,189,248,0.15); cursor: crosshair; touch-action: none; background: #060b18; border: 4px solid #334155;"></canvas>
        </div>

        <!-- Bottom Game Toolbar -->
        <div class="game-toolbar">
            <div class="reaction-bar">
                <span style="font-size: 0.85rem; color: var(--text-muted); margin-right: 4px;">Quick Chat:</span>
                <button type="button" class="reaction-btn btn-sm" data-msg="Nice Shot!" title="Nice Shot">Nice Shot!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="Great Save!" title="Great Save">What a Save!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="Good Game!" title="Good Game">GG!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="Rematch?" title="Rematch Request">Rematch?</button>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">
                Predictive AI | Real-time Physics
            </div>
        </div>
    </div>
</asp:Content>
