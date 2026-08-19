<%@ Page Title="Tic-Tac-Toe - Game Hub" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="TicTacToe.aspx.cs" Inherits="GameHub.Games.TicTacToePage" %>

<asp:Content ID="Head" ContentPlaceHolderID="HeadContent" runat="server">
    <script src="<%= ResolveUrl("~/Scripts/tictactoe.js") %>" type="text/javascript"></script>
</asp:Content>

<asp:Content ID="Body" ContentPlaceHolderID="MainContent" runat="server">
    <div class="game-screen-container">
        <!-- Top Bar -->
        <div class="game-top-bar">
            <div class="game-meta">
                <a href="<%= ResolveUrl("~/Default.aspx") %>" class="btn btn-outline btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Hub Menu
                </a>
                <span class="game-mode-badge" id="game-mode-badge">Tic-Tac-Toe</span>
            </div>
            <button type="button" class="btn btn-outline btn-sm" id="forfeit-game-btn" style="color: #fb7185; border-color: rgba(244,63,94,0.3);">
                Forfeit / Exit
            </button>
        </div>

        <!-- Match HUD (P1 vs P2) -->
        <div class="match-hud">
            <div class="player-hud-card p1" id="p1-hud">
                <div class="player-hud-avatar">X</div>
                <div class="player-hud-info">
                    <div class="player-hud-name" id="p1-name">Player 1</div>
                    <div class="player-hud-sub" style="color: var(--accent-cyan);">Cyan Marker (X)</div>
                </div>
            </div>

            <div class="match-center-status">
                <div class="vs-badge">VS</div>
                <div class="turn-indicator-text" id="turn-indicator">Your Turn (X)</div>
            </div>

            <div class="player-hud-card p2" id="p2-hud">
                <div class="player-hud-avatar">O</div>
                <div class="player-hud-info">
                    <div class="player-hud-name" id="p2-name">Opponent</div>
                    <div class="player-hud-sub" style="color: var(--accent-rose);">Rose Marker (O)</div>
                </div>
            </div>
        </div>

        <!-- 3x3 Grid Board -->
        <div class="ttt-board-wrapper">
            <div class="ttt-board" id="ttt-board">
                <!-- 9 cells rendered dynamically via JS -->
            </div>
        </div>

        <!-- Bottom Game Toolbar -->
        <div class="game-toolbar">
            <div class="reaction-bar">
                <span style="font-size: 0.85rem; color: var(--text-muted); margin-right: 4px;">Quick Chat:</span>
                <button type="button" class="reaction-btn btn-sm" data-msg="Good Game!" title="Good Game">GG!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="Nice Move!" title="Nice Move">Nice!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="Well Played!" title="Well Played">WP</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="Rematch?" title="Rematch Request">Rematch?</button>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">
                Minimax AI | LAN Real-time Sync
            </div>
        </div>
    </div>
</asp:Content>
