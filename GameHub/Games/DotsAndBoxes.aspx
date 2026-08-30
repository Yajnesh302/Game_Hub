<%@ Page Title="Dots & Boxes Championship - Game Hub" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="DotsAndBoxes.aspx.cs" Inherits="GameHub.Games.DotsAndBoxesPage" %>

<asp:Content ID="Head" ContentPlaceHolderID="HeadContent" runat="server">
    <script src="<%= ResolveUrl("~/Scripts/dotsandboxes.js") %>" type="text/javascript"></script>
    <style>
        .dots-container {
            max-width: 820px;
            margin: 0 auto;
        }

        .dots-arena-wrapper {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 14px 0;
        }

        #dots-canvas {
            display: block;
            max-width: 100%;
            height: auto;
            border-radius: var(--radius-xl);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(251, 191, 36, 0.2);
            border: 4px solid #334155;
            background: #020617;
            cursor: pointer;
            touch-action: none;
        }

        .combo-floating-badge {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #f59e0b, #ef4444);
            color: #ffffff;
            padding: 8px 22px;
            border-radius: var(--radius-full);
            font-size: 0.95rem;
            font-weight: 800;
            box-shadow: 0 10px 25px rgba(239, 68, 68, 0.5);
            pointer-events: none;
            opacity: 0;
            z-index: 10;
            transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
    </style>
</asp:Content>

<asp:Content ID="Body" ContentPlaceHolderID="MainContent" runat="server">
    <div class="game-screen-container dots-container">
        <!-- Top Navigation -->
        <div class="game-top-bar">
            <div class="game-meta">
                <a href="<%= ResolveUrl("~/Default.aspx") %>" class="btn btn-outline btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Hub Menu
                </a>
                <span class="game-mode-badge" id="game-mode-badge" style="background: rgba(251, 191, 36, 0.15); border-color: rgba(251, 191, 36, 0.35); color: #fbbf24;">
                    🎯 Dots &amp; Boxes Arena
                </span>
            </div>
            <button type="button" class="btn btn-outline btn-sm" id="forfeit-game-btn" style="color: #fb7185; border-color: rgba(244,63,94,0.3);">
                Exit Match
            </button>
        </div>

        <!-- Strategy Match HUD -->
        <div class="match-hud" style="grid-template-columns: 1fr auto 1fr;">
            <!-- Player 1 Card -->
            <div class="player-hud-card p1" id="p1-card">
                <div class="player-hud-avatar" style="background: linear-gradient(135deg, #0284c7, #38bdf8);">
                    <span id="p1-avatar-letter" style="font-weight: 800; font-size: 1.1rem; color: #fff;">1</span>
                </div>
                <div class="player-hud-info">
                    <div class="player-hud-name" id="p1-name">Player 1</div>
                    <div style="font-size: 0.85rem; color: #38bdf8; font-weight: 700; margin-top: 2px;">
                        Boxes Claimed: <strong id="p1-score" style="font-size: 1.15rem; color: #fff;">0</strong>
                    </div>
                </div>
            </div>

            <!-- Match Center Status -->
            <div class="match-center-status">
                <div id="turn-status-text" style="font-size: 1.25rem; font-weight: 800; font-family: Outfit, sans-serif; color: #f8fafc;">
                    Your Turn
                </div>
                <div style="font-size: 0.8rem; font-weight: 600; color: var(--accent-cyan); margin-top: 2px;">
                    Complete 4 sides of a box to capture &amp; keep turn
                </div>
            </div>

            <!-- Player 2 Card -->
            <div class="player-hud-card p2" id="p2-card">
                <div class="player-hud-avatar" style="background: linear-gradient(135deg, #e11d48, #f43f5e);">
                    <span id="p2-avatar-letter" style="font-weight: 800; font-size: 1.1rem; color: #fff;">2</span>
                </div>
                <div class="player-hud-info" style="text-align: right;">
                    <div class="player-hud-name" id="p2-name">Opponent</div>
                    <div style="font-size: 0.85rem; color: #fb7185; font-weight: 700; margin-top: 2px;">
                        Boxes Claimed: <strong id="p2-score" style="font-size: 1.15rem; color: #fff;">0</strong>
                    </div>
                </div>
            </div>
        </div>

        <!-- 2D Canvas Arena -->
        <div class="dots-arena-wrapper">
            <div id="combo-indicator" class="combo-floating-badge">🔥 2-BOX COMBO! EXTRA TURN!</div>
            <canvas id="dots-canvas" width="640" height="640"></canvas>
        </div>

        <!-- Bottom Game Toolbar -->
        <div class="game-toolbar">
            <div class="reaction-bar">
                <span style="font-size: 0.85rem; color: var(--text-muted); margin-right: 4px;">Quick Taunt:</span>
                <button type="button" class="reaction-btn btn-sm" data-msg="🎯 Nice Chain!">Nice Chain!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="🧠 Big Brain Move!">Big Brain!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="🔥 Box Captured!">Mine!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="🤝 Well Played!">GG!</button>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">
                💡 <strong>Strategy</strong>: Hover between dots to preview line • Complete the 4th side to earn a box &amp; an extra move
            </div>
        </div>
    </div>
</asp:Content>
