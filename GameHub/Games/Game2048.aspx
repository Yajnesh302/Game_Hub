<%@ Page Title="2048 Puzzle - Game Hub" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Game2048.aspx.cs" Inherits="GameHub.Games.Game2048Page" %>

<asp:Content ID="Head" ContentPlaceHolderID="HeadContent" runat="server">
    <script src="<%= ResolveUrl("~/Scripts/game2048.js") %>" type="text/javascript"></script>
</asp:Content>

<asp:Content ID="Body" ContentPlaceHolderID="MainContent" runat="server">
    <div class="game-screen-container" style="max-width: 960px;">
        <!-- Top Bar -->
        <div class="game-top-bar">
            <div class="game-meta">
                <a href="<%= ResolveUrl("~/Default.aspx") %>" class="btn btn-outline btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Hub Menu
                </a>
                <span class="game-mode-badge" style="background: rgba(234, 179, 8, 0.15); border-color: rgba(234, 179, 8, 0.4); color: #facc15;">2048 Single Player</span>
            </div>
            <button type="button" class="btn btn-outline btn-sm" id="new-game-btn" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                New Game
            </button>
        </div>

        <!-- 2048 Main Layout (Grid + Leaderboard Sidebar) -->
        <div class="game2048-layout">
            <!-- Left Area: Board & Controls -->
            <div class="game2048-main-area">
                <!-- Header Score & Undo Controls -->
                <div class="game2048-header-controls">
                    <div class="game2048-scores">
                        <div class="game2048-score-box" id="score-box-wrapper">
                            <div class="game2048-score-title">Score</div>
                            <div class="game2048-score-val" id="current-score">0</div>
                        </div>
                        <div class="game2048-score-box">
                            <div class="game2048-score-title">Best</div>
                            <div class="game2048-score-val" id="best-score" style="color: #facc15;">0</div>
                        </div>
                    </div>

                    <div class="game2048-actions">
                        <button type="button" class="btn btn-outline btn-sm" id="undo-btn" disabled="disabled" title="Undo Last Move">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
                            Undo
                        </button>
                    </div>
                </div>

                <!-- 4x4 Grid Board -->
                <div class="game2048-board-wrapper" id="game2048-board">
                    <div class="game2048-grid">
                        <div class="game2048-cell"></div><div class="game2048-cell"></div><div class="game2048-cell"></div><div class="game2048-cell"></div>
                        <div class="game2048-cell"></div><div class="game2048-cell"></div><div class="game2048-cell"></div><div class="game2048-cell"></div>
                        <div class="game2048-cell"></div><div class="game2048-cell"></div><div class="game2048-cell"></div><div class="game2048-cell"></div>
                        <div class="game2048-cell"></div><div class="game2048-cell"></div><div class="game2048-cell"></div><div class="game2048-cell"></div>
                    </div>
                    <div class="game2048-tiles-container" id="tiles-container"></div>
                </div>

                <!-- Controls Guide -->
                <div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; max-width: 440px;">
                    Use <strong>Arrow Keys</strong> / <strong>WASD</strong> or <strong>swipe</strong> to slide tiles. Matching tiles merge and double in value!
                </div>
            </div>

            <!-- Right Area: High-Score Leaderboard Sidebar -->
            <div class="game2048-sidebar">
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--panel-border); padding-bottom: 12px;">
                    <div style="font-weight: 700; font-size: 1.1rem; color: #f8fafc; display: flex; align-items: center; gap: 8px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                        2048 Champions
                    </div>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">Top 10</span>
                </div>

                <table class="game2048-leaderboard-table">
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>Score</th>
                            <th>Tile</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody id="leaderboard-2048-body">
                        <tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 14px;">Loading top scores...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</asp:Content>
