<%@ Page Title="Sling Puck Frenzy - Game Hub" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="SlingPuck.aspx.cs" Inherits="GameHub.Games.SlingPuckPage" %>

<asp:Content ID="Head" ContentPlaceHolderID="HeadContent" runat="server">
    <script src="<%= ResolveUrl("~/Scripts/slingpuck.js") %>" type="text/javascript"></script>
    <style>
        .slingpuck-container {
            max-width: 960px;
            margin: 0 auto;
        }

        .slingpuck-arena-wrapper {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 12px 0;
        }

        #slingpuck-canvas {
            display: block;
            max-width: 100%;
            height: auto;
            border-radius: var(--radius-xl);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(56, 189, 248, 0.2);
            border: 4px solid #334155;
            background: #020617;
            cursor: grab;
            touch-action: none;
        }

        #slingpuck-canvas:active {
            cursor: grabbing;
        }

        .puck-count-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 14px;
            border-radius: var(--radius-full);
            font-size: 0.85rem;
            font-weight: 800;
            margin-top: 4px;
        }

        .puck-count-badge.p1 {
            background: rgba(56, 189, 248, 0.15);
            border: 1px solid rgba(56, 189, 248, 0.4);
            color: #38bdf8;
        }

        .puck-count-badge.p2 {
            background: rgba(244, 63, 94, 0.15);
            border: 1px solid rgba(244, 63, 94, 0.4);
            color: #fb7185;
        }
    </style>
</asp:Content>

<asp:Content ID="Body" ContentPlaceHolderID="MainContent" runat="server">
    <div class="game-screen-container slingpuck-container">
        <!-- Top Navigation -->
        <div class="game-top-bar">
            <div class="game-meta">
                <a href="<%= ResolveUrl("~/Default.aspx") %>" class="btn btn-outline btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Hub Menu
                </a>
                <span class="game-mode-badge" id="game-mode-badge" style="background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.35); color: #38bdf8;">
                    ⚡ Sling Puck Frenzy
                </span>
            </div>
            <button type="button" class="btn btn-outline btn-sm" id="forfeit-game-btn" style="color: #fb7185; border-color: rgba(244,63,94,0.3);">
                Exit Match
            </button>
        </div>

        <!-- Sleek Tournament HUD -->
        <div class="match-hud" style="grid-template-columns: 1fr auto 1fr;">
            <!-- Player 1 Card -->
            <div class="player-hud-card p1" id="p1-card">
                <div class="player-hud-avatar" style="background: linear-gradient(135deg, #0284c7, #38bdf8);">
                    <span id="p1-avatar-letter" style="font-weight: 800; font-size: 1.1rem; color: #fff;">1</span>
                </div>
                <div class="player-hud-info">
                    <div class="player-hud-name" id="p1-name">Player 1</div>
                    <div class="puck-count-badge p1">
                        Pucks Remaining: <strong id="p1-puck-count" style="font-size: 1.05rem;">5</strong>
                    </div>
                </div>
            </div>

            <!-- Match Score Center -->
            <div class="match-center-status">
                <div style="font-size: 1.8rem; font-weight: 900; font-family: Outfit, sans-serif; color: #f8fafc; letter-spacing: 1px;">
                    CLEAR ALL PUCKS
                </div>
                <div style="font-size: 0.8rem; font-weight: 600; color: var(--accent-cyan); margin-top: 2px;">
                    Simultaneous Fast Sling Action
                </div>
            </div>

            <!-- Player 2 Card -->
            <div class="player-hud-card p2" id="p2-card">
                <div class="player-hud-avatar" style="background: linear-gradient(135deg, #e11d48, #f43f5e);">
                    <span id="p2-avatar-letter" style="font-weight: 800; font-size: 1.1rem; color: #fff;">2</span>
                </div>
                <div class="player-hud-info" style="text-align: right;">
                    <div class="player-hud-name" id="p2-name">Opponent</div>
                    <div class="puck-count-badge p2">
                        Pucks Remaining: <strong id="p2-puck-count" style="font-size: 1.05rem;">5</strong>
                    </div>
                </div>
            </div>
        </div>

        <!-- 2D Canvas Arena -->
        <div class="slingpuck-arena-wrapper">
            <canvas id="slingpuck-canvas" width="900" height="540"></canvas>
        </div>

        <!-- Bottom Game Toolbar -->
        <div class="game-toolbar">
            <div class="reaction-bar">
                <span style="font-size: 0.85rem; color: var(--text-muted); margin-right: 4px;">Quick Taunt:</span>
                <button type="button" class="reaction-btn btn-sm" data-msg="⚡ Rapid Fire!">Rapid Fire!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="🎯 Nice Aim!">Nice Aim!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="🔥 Almost Cleared!">Almost Cleared!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="🤝 Good Game!">GG!</button>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">
                💡 <strong>Controls</strong>: Drag any puck on your half backward into the elastic band • Release to slingshot through the gate
            </div>
        </div>
    </div>
</asp:Content>
