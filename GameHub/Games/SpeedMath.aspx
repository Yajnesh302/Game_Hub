<%@ Page Title="Speed Math Arena - Game Hub" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="SpeedMath.aspx.cs" Inherits="GameHub.Games.SpeedMathPage" %>

<asp:Content ID="Head" ContentPlaceHolderID="HeadContent" runat="server">
    <script src="<%= ResolveUrl("~/Scripts/speedmath.js") %>" type="text/javascript"></script>
    <style>
        .speedmath-container {
            max-width: 900px;
            margin: 0 auto;
        }

        .math-arena-box {
            position: relative;
            background: linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(10, 15, 30, 0.95) 100%);
            border: 2px solid rgba(56, 189, 248, 0.25);
            border-radius: var(--radius-2xl);
            padding: 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(56, 189, 248, 0.15);
            backdrop-filter: blur(16px);
            overflow: hidden;
            margin-bottom: 16px;
        }

        #math-fx-canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        }

        .math-content-layer {
            position: relative;
            z-index: 2;
        }

        /* Center Timer & Multiplier Section */
        .math-hud-center {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .timer-circle-container {
            position: relative;
            width: 100px;
            height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .timer-svg {
            transform: rotate(-90deg);
        }

        .timer-bg {
            fill: none;
            stroke: rgba(255, 255, 255, 0.08);
            stroke-width: 8;
        }

        .timer-progress {
            fill: none;
            stroke: var(--accent-cyan);
            stroke-width: 8;
            stroke-linecap: round;
            stroke-dasharray: 276.46;
            stroke-dashoffset: 0;
            transition: stroke-dashoffset 0.1s linear, stroke 0.3s ease;
        }

        .timer-text-display {
            position: absolute;
            font-size: 1.5rem;
            font-weight: 900;
            font-family: Outfit, sans-serif;
            color: #f8fafc;
        }

        .multiplier-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 18px;
            border-radius: var(--radius-full);
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.12);
            font-size: 1.1rem;
            font-weight: 900;
            color: var(--text-secondary);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .multiplier-badge.active-multi {
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(239, 68, 68, 0.35));
            border-color: #f59e0b;
            color: #fbbf24;
            box-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
            transform: scale(1.05);
        }

        /* Equation Card */
        .equation-card {
            text-align: center;
            background: rgba(2, 6, 23, 0.6);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: var(--radius-xl);
            padding: 32px 20px;
            margin-bottom: 24px;
            box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);
        }

        .question-number-tag {
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 8px;
        }

        .equation-text {
            font-size: 3.2rem;
            font-weight: 900;
            font-family: Outfit, sans-serif;
            color: #f8fafc;
            letter-spacing: 2px;
            text-shadow: 0 0 24px rgba(56, 189, 248, 0.35);
        }

        /* 4-Option Multiple Choice Grid */
        .answers-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
        }

        .math-answer-btn {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(30, 41, 59, 0.85);
            border: 2px solid rgba(255, 255, 255, 0.14);
            border-radius: var(--radius-xl);
            padding: 22px 16px;
            font-size: 2.0rem;
            font-weight: 800;
            font-family: Outfit, sans-serif;
            color: #f8fafc;
            cursor: pointer;
            transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 6px 16px rgba(0,0,0,0.3);
        }

        .math-answer-btn:hover {
            background: rgba(56, 189, 248, 0.2);
            border-color: #38bdf8;
            transform: translateY(-2px);
            box-shadow: 0 10px 24px rgba(56, 189, 248, 0.25);
        }

        .math-answer-btn:active {
            transform: translateY(1px);
        }

        .btn-num-hint {
            position: absolute;
            top: 8px;
            left: 12px;
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--text-muted);
            font-family: sans-serif;
        }

        .math-answer-btn.btn-correct {
            background: linear-gradient(135deg, #059669, #10b981) !important;
            border-color: #34d399 !important;
            color: #ffffff !important;
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.6) !important;
            transform: scale(1.02);
        }

        .math-answer-btn.btn-wrong {
            background: linear-gradient(135deg, #dc2626, #f43f5e) !important;
            border-color: #fb7185 !important;
            color: #ffffff !important;
            box-shadow: 0 0 30px rgba(244, 63, 94, 0.6) !important;
        }

        @media (max-width: 640px) {
            .equation-text { font-size: 2.4rem; }
            .math-answer-btn { font-size: 1.6rem; padding: 16px 10px; }
            .answers-grid { grid-template-columns: 1fr; gap: 10px; }
        }
    </style>
</asp:Content>

<asp:Content ID="Body" ContentPlaceHolderID="MainContent" runat="server">
    <div class="game-screen-container speedmath-container">
        <!-- Top Bar -->
        <div class="game-top-bar">
            <div class="game-meta">
                <a href="<%= ResolveUrl("~/Default.aspx") %>" class="btn btn-outline btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Hub Menu
                </a>
                <span class="game-mode-badge" id="game-mode-badge" style="background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.35); color: #38bdf8;">
                    ⚡ Speed Math Arena
                </span>
            </div>
            <button type="button" class="btn btn-outline btn-sm" id="forfeit-game-btn" style="color: #fb7185; border-color: rgba(244,63,94,0.3);">
                Exit Match
            </button>
        </div>

        <!-- Sleek Tournament HUD -->
        <div class="match-hud" style="grid-template-columns: 1fr auto 1fr; margin-bottom: 14px;">
            <!-- Player 1 Card -->
            <div class="player-hud-card p1" id="p1-card">
                <div class="player-hud-avatar" style="background: linear-gradient(135deg, #0284c7, #38bdf8);">
                    <span id="p1-avatar-letter" style="font-weight: 800; font-size: 1.1rem; color: #fff;">1</span>
                </div>
                <div class="player-hud-info">
                    <div class="player-hud-name" id="p1-name">Player 1</div>
                    <div id="streak-badge-text" style="font-size: 0.8rem; font-weight: 800; color: #f59e0b; margin-top: 2px;"></div>
                </div>
            </div>

            <!-- Match Score Center -->
            <div class="match-center-status">
                <div class="scoreboard-display" style="display: flex; align-items: center; gap: 12px; font-size: 2.4rem; font-weight: 900; font-family: Outfit, sans-serif;">
                    <span id="p1-score-display" style="color: #38bdf8; text-shadow: 0 0 16px rgba(56, 189, 248, 0.4);">0</span>
                    <span style="color: var(--text-muted); font-size: 1.4rem; opacity: 0.5;">:</span>
                    <span id="p2-score-display" style="color: #f43f5e; text-shadow: 0 0 16px rgba(244, 63, 94, 0.4);">0</span>
                </div>
                <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px;">Points Race</div>
            </div>

            <!-- Player 2 Card -->
            <div class="player-hud-card p2" id="p2-card">
                <div class="player-hud-avatar" style="background: linear-gradient(135deg, #e11d48, #f43f5e);">
                    <span id="p2-avatar-letter" style="font-weight: 800; font-size: 1.1rem; color: #fff;">2</span>
                </div>
                <div class="player-hud-info" style="text-align: right;">
                    <div class="player-hud-name" id="p2-name">Opponent</div>
                    <div id="p2-streak-badge" style="font-size: 0.8rem; font-weight: 800; color: #fb7185; margin-top: 2px;"></div>
                </div>
            </div>
        </div>

        <!-- Math Arena Interactive Box -->
        <div class="math-arena-box">
            <canvas id="math-fx-canvas" width="900" height="420"></canvas>

            <div class="math-content-layer">
                <!-- Center Timer & Multiplier Section -->
                <div class="math-hud-center">
                    <div class="timer-circle-container">
                        <svg class="timer-svg" width="100" height="100" viewBox="0 0 100 100">
                            <circle class="timer-bg" cx="50" cy="50" r="44"></circle>
                            <circle id="timer-ring-progress" class="timer-progress" cx="50" cy="50" r="44"></circle>
                        </svg>
                        <div class="timer-text-display" id="timer-text">60s</div>
                    </div>

                    <div class="multiplier-badge" id="multiplier-text">
                        1x MULTIPLIER
                    </div>
                </div>

                <!-- Equation Card -->
                <div class="equation-card">
                    <div class="question-number-tag" id="question-counter">Question 1</div>
                    <div class="equation-text" id="equation-display">12 + 8 = ?</div>
                </div>

                <!-- 4 Multiple Choice Options -->
                <div class="answers-grid" id="answers-grid">
                    <!-- Dynamic Buttons with Keyboard Hints [1], [2], [3], [4] -->
                </div>
            </div>
        </div>

        <!-- Bottom Game Toolbar -->
        <div class="game-toolbar">
            <div class="reaction-bar">
                <span style="font-size: 0.85rem; color: var(--text-muted); margin-right: 4px;">Quick Taunt:</span>
                <button type="button" class="reaction-btn btn-sm" data-msg="⚡ Too Fast!">Too Fast!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="🔥 On Fire!">On Fire!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="🧠 Math Genius!">Genius!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="🤝 Good Game!">GG!</button>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">
                💡 <strong>Tip</strong>: Click answer or press Keys <strong>[1]</strong>, <strong>[2]</strong>, <strong>[3]</strong>, <strong>[4]</strong>
            </div>
        </div>
    </div>
</asp:Content>
