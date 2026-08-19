<%@ Page Title="Connect 4 - Game Hub" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Connect4.aspx.cs" Inherits="GameHub.Games.Connect4Page" %>

<asp:Content ID="Head" ContentPlaceHolderID="HeadContent" runat="server">
    <script src="<%= ResolveUrl("~/Scripts/connect4.js") %>" type="text/javascript"></script>
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
                <span class="game-mode-badge" id="game-mode-badge" style="background: rgba(244,63,94,0.15); border-color: rgba(244,63,94,0.3); color: #fb7185;">Connect 4</span>
            </div>
            <button type="button" class="btn btn-outline btn-sm" id="forfeit-game-btn" style="color: #fb7185; border-color: rgba(244,63,94,0.3);">
                Forfeit / Exit
            </button>
        </div>

        <!-- Match HUD (P1 vs P2) -->
        <div class="match-hud">
            <div class="player-hud-card p1" id="p1-hud">
                <div class="player-hud-avatar" style="background: linear-gradient(135deg, #0284c7, #06b6d4);">1</div>
                <div class="player-hud-info">
                    <div class="player-hud-name" id="p1-name">Player 1</div>
                    <div class="player-hud-sub" style="color: var(--accent-cyan);">Cyan Discs</div>
                </div>
            </div>

            <div class="match-center-status">
                <div class="vs-badge">VS</div>
                <div class="turn-indicator-text" id="turn-indicator">Your Turn (Cyan)</div>
            </div>

            <div class="player-hud-card p2" id="p2-hud">
                <div class="player-hud-avatar" style="background: linear-gradient(135deg, #e11d48, #f43f5e);">2</div>
                <div class="player-hud-info">
                    <div class="player-hud-name" id="p2-name">Opponent</div>
                    <div class="player-hud-sub" style="color: var(--accent-rose);">Ruby Discs</div>
                </div>
            </div>
        </div>

        <!-- Connect 4 Board (7 columns x 6 rows) -->
        <div class="c4-board-wrapper">
            <!-- Drop Indicator Guide Arrows -->
            <div class="c4-drop-row" id="c4-drop-row">
                <!-- 7 column guides generated dynamically -->
            </div>

            <div class="c4-board" id="c4-board">
                <!-- 42 slots generated dynamically -->
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
                Alpha-Beta Pruning AI | Physics Drop Bounce
            </div>
        </div>
    </div>
</asp:Content>
