<%@ Page Title="Olympic Archery Clash - Game Hub" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Archery.aspx.cs" Inherits="GameHub.Games.ArcheryPage" %>

<asp:Content ID="Head" ContentPlaceHolderID="HeadContent" runat="server">
    <script src="<%= ResolveUrl("~/Scripts/archeryPhysics.js") %>" type="text/javascript"></script>
    <script src="<%= ResolveUrl("~/Scripts/archery.js") %>" type="text/javascript"></script>
    <style>
        .archery-container {
            max-width: 1000px;
            margin: 0 auto;
        }

        .tournament-hud {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            gap: 16px;
            align-items: center;
            background: linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.6) 100%);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: var(--radius-xl);
            padding: 14px 20px;
            margin-bottom: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }

        .player-card {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 8px 14px;
            border-radius: var(--radius-lg);
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid transparent;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .player-card.active-turn {
            background: rgba(14, 165, 233, 0.12);
            border-color: rgba(56, 189, 248, 0.6);
            box-shadow: 0 0 24px rgba(56, 189, 248, 0.25);
        }

        .player-card.p2 {
            flex-direction: row-reverse;
            text-align: right;
        }

        .player-avatar {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 1.2rem;
            color: #fff;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            flex-shrink: 0;
        }

        .player-avatar.p1 {
            background: linear-gradient(135deg, #059669, #10b981);
            border: 2px solid #34d399;
        }

        .player-avatar.p2 {
            background: linear-gradient(135deg, #e11d48, #f43f5e);
            border: 2px solid #fb7185;
        }

        .player-meta {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .player-name {
            font-weight: 700;
            font-size: 0.95rem;
            color: #f8fafc;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .player-score-pills {
            display: flex;
            gap: 5px;
        }

        .archery-pill {
            width: 26px;
            height: 26px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 800;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: var(--text-muted);
            transition: all 0.25s ease;
        }

        .archery-pill.gold {
            background: linear-gradient(135deg, #d97706, #fbbf24);
            border-color: #fef08a;
            color: #78350f;
            box-shadow: 0 0 10px rgba(245, 158, 11, 0.6);
            transform: scale(1.06);
        }

        .archery-pill.red {
            background: linear-gradient(135deg, #dc2626, #f87171);
            border-color: #fca5a5;
            color: #ffffff;
            box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
        }

        .archery-pill.blue {
            background: linear-gradient(135deg, #2563eb, #60a5fa);
            border-color: #93c5fd;
            color: #ffffff;
        }

        .archery-pill.black {
            background: #0f172a;
            border-color: #475569;
            color: #cbd5e1;
        }

        .archery-pill.white {
            background: #f1f5f9;
            border-color: #cbd5e1;
            color: #0f172a;
        }

        .archery-pill.miss {
            background: rgba(100, 116, 139, 0.2);
            border-color: #64748b;
            color: #94a3b8;
        }

        .match-center {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;
        }

        .match-score-board {
            display: flex;
            align-items: center;
            gap: 14px;
            font-size: 2.2rem;
            font-weight: 900;
            font-family: Outfit, sans-serif;
            letter-spacing: 1px;
        }

        .round-badge {
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .turn-status-text {
            font-size: 0.82rem;
            color: var(--accent-cyan);
            font-weight: 600;
            margin-top: 2px;
        }

        .wind-widget {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 4px 14px;
            border-radius: var(--radius-full);
            background: rgba(15, 23, 42, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.12);
            font-size: 0.85rem;
            color: var(--text-secondary);
            margin-top: 4px;
            transition: all 0.3s ease;
        }

        .wind-widget.active {
            border-color: rgba(56, 189, 248, 0.5);
            background: rgba(14, 165, 233, 0.15);
            color: #38bdf8;
            box-shadow: 0 0 14px rgba(56, 189, 248, 0.2);
        }

        .wind-arrow {
            display: inline-block;
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .archery-canvas-box {
            position: relative;
            width: 100%;
            border-radius: var(--radius-xl);
            overflow: hidden;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.75), 0 0 40px rgba(16, 185, 129, 0.15);
            border: 3px solid rgba(255, 255, 255, 0.1);
            background: #020617;
            margin-bottom: 12px;
        }

        #archery-canvas {
            display: block;
            width: 100%;
            height: auto;
            cursor: crosshair;
            touch-action: none;
        }

        @media (max-width: 768px) {
            .tournament-hud {
                grid-template-columns: 1fr;
                gap: 10px;
                text-align: center;
            }
            .player-card, .player-card.p2 {
                flex-direction: row;
                justify-content: center;
                text-align: left;
            }
        }
    </style>
</asp:Content>

<asp:Content ID="Body" ContentPlaceHolderID="MainContent" runat="server">
    <div class="game-screen-container archery-container">
        <!-- Top Navigation -->
        <div class="game-top-bar">
            <div class="game-meta">
                <a href="<%= ResolveUrl("~/Default.aspx") %>" class="btn btn-outline btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Hub Menu
                </a>
                <span class="game-mode-badge" id="game-mode-badge" style="background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.35); color: #34d399;">
                    🎯 Olympic Archery Championship
                </span>
            </div>
            <button type="button" class="btn btn-outline btn-sm" id="forfeit-game-btn" style="color: #fb7185; border-color: rgba(244,63,94,0.3);">
                Forfeit Match
            </button>
        </div>

        <!-- Sleek Olympic Tournament HUD -->
        <div class="tournament-hud">
            <!-- Player 1 Card -->
            <div class="player-card p1" id="p1-card">
                <div class="player-avatar p1" id="p1-avatar-letter">1</div>
                <div class="player-meta">
                    <div class="player-name" id="p1-name">Player 1</div>
                    <div class="player-score-pills" id="p1-shot-history"></div>
                </div>
            </div>

            <!-- Match Score & Wind Widget -->
            <div class="match-center">
                <div class="match-score-board">
                    <span id="p1-score-display" style="color: #10b981;">0</span>
                    <span style="color: var(--text-muted); font-size: 1.4rem; opacity: 0.6;">:</span>
                    <span id="p2-score-display" style="color: #f43f5e;">0</span>
                </div>
                <div class="round-badge" id="round-number-text">Round 1 / 5</div>
                <div class="turn-status-text" id="turn-indicator">Your Turn - Hold &amp; Drag to Aim</div>
                <div class="wind-widget" id="wind-status-widget">
                    <svg id="wind-arrow-icon" class="wind-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    <span id="wind-status-text">Wind: <strong>0.0 m/s</strong></span>
                </div>
            </div>

            <!-- Player 2 Card -->
            <div class="player-card p2" id="p2-card">
                <div class="player-avatar p2" id="p2-avatar-letter">2</div>
                <div class="player-meta">
                    <div class="player-name" id="p2-name">Opponent</div>
                    <div class="player-score-pills" id="p2-shot-history"></div>
                </div>
            </div>
        </div>

        <!-- 3D Canvas Arena -->
        <div class="archery-canvas-box">
            <canvas id="archery-canvas" width="960" height="540"></canvas>
        </div>

        <!-- Bottom Tournament Toolbar -->
        <div class="game-toolbar">
            <div class="reaction-bar">
                <span style="font-size: 0.85rem; color: var(--text-muted); margin-right: 4px;">Taunts:</span>
                <button type="button" class="reaction-btn btn-sm" data-msg="🎯 Bullseye!">Bullseye!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="👏 Nice Shot!">Nice Shot!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="💨 Windy!">Windy!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="🤝 Good Game!">GG!</button>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">
                💡 <strong>Controls</strong>: Click &amp; Drag anywhere on the screen to aim with magnified sight • Release to shoot
            </div>
        </div>
    </div>
</asp:Content>
