<%@ Page Title="Wordle / Word Duel Arena - Game Hub" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="WordDuel.aspx.cs" Inherits="GameHub.Games.WordDuelPage" %>

<asp:Content ID="Head" ContentPlaceHolderID="HeadContent" runat="server">
    <script src="<%= ResolveUrl("~/Scripts/wordduel.js?v=1.1") %>" type="text/javascript"></script>
    <style>
        .wordduel-container {
            max-width: 800px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 10px;
            perspective: 1000px;
        }

        /* Top HUD Bar */
        .wordduel-hud {
            width: 100%;
            max-width: 520px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(15, 23, 42, 0.85);
            border: 1px solid #1e293b;
            border-radius: var(--radius-lg);
            padding: 10px 16px;
            margin-bottom: 16px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        }

        .hud-stat-box {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.85rem;
            font-weight: 700;
        }

        .hud-badge {
            background: #020617;
            border: 1px solid #334155;
            color: #38bdf8;
            padding: 4px 10px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 0.95rem;
        }

        /* Wordle Grid */
        .wordle-board-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            width: 100%;
        }

        .wordle-grid {
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding: 6px;
        }

        .wordle-row {
            display: flex;
            gap: 6px;
        }

        .wordle-tile {
            width: 56px;
            height: 56px;
            border: 2px solid #334155;
            border-radius: 6px;
            display: flex;
            justify-content: center;
            align-items: center;
            background: rgba(2, 6, 23, 0.7);
            font-family: 'Inter', -apple-system, sans-serif;
            font-size: 1.8rem;
            font-weight: 900;
            color: #ffffff;
            text-transform: uppercase;
            user-select: none;
            transition: transform 0.15s ease, border-color 0.15s ease;
        }

        @media (max-width: 480px) {
            .wordle-tile {
                width: 46px;
                height: 46px;
                font-size: 1.4rem;
            }
        }

        .wordle-tile.tile-filled {
            border-color: #64748b;
        }

        .wordle-tile.tile-pop {
            transform: scale(1.12);
        }

        /* 3D Tile Flip Animation */
        .wordle-tile.tile-flip {
            animation: tileFlip 0.5s ease forwards;
        }

        @keyframes tileFlip {
            0% {
                transform: rotateX(0deg);
            }
            50% {
                transform: rotateX(90deg);
            }
            100% {
                transform: rotateX(0deg);
            }
        }

        /* Evaluated Letter States */
        .wordle-tile.tile-correct {
            background: #22c55e !important;
            border-color: #22c55e !important;
            color: #ffffff !important;
            box-shadow: 0 0 12px rgba(34, 197, 94, 0.4);
        }

        .wordle-tile.tile-present {
            background: #eab308 !important;
            border-color: #eab308 !important;
            color: #ffffff !important;
            box-shadow: 0 0 12px rgba(234, 179, 8, 0.4);
        }

        .wordle-tile.tile-absent {
            background: #334155 !important;
            border-color: #334155 !important;
            color: #94a3b8 !important;
        }

        /* Shake & Dance Animations */
        .row-shake {
            animation: rowShake 0.5s ease-in-out;
        }

        @keyframes rowShake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-8px); }
            40%, 80% { transform: translateX(8px); }
        }

        .tile-dance {
            animation: tileDance 0.6s ease;
        }

        @keyframes tileDance {
            0%, 100% { transform: translateY(0); }
            40% { transform: translateY(-24px); }
            60% { transform: translateY(-8px); }
        }

        /* On-Screen Virtual Keyboard */
        .wordle-keyboard {
            width: 100%;
            max-width: 500px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-top: 14px;
            padding: 4px;
        }

        .kb-row {
            display: flex;
            justify-content: center;
            gap: 5px;
            width: 100%;
        }

        .kb-key {
            flex: 1;
            height: 52px;
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 6px;
            color: #f8fafc;
            font-size: 0.95rem;
            font-weight: 800;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            user-select: none;
            transition: all 0.15s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .kb-key:hover {
            background: #334155;
            transform: translateY(-2px);
        }

        .kb-key:active {
            transform: translateY(1px);
        }

        .kb-key.kb-special {
            flex: 1.5;
            font-size: 0.75rem;
            background: #0f172a;
            color: #38bdf8;
        }

        .kb-key.kb-correct {
            background: #22c55e !important;
            border-color: #22c55e !important;
            color: #ffffff !important;
        }

        .kb-key.kb-present {
            background: #eab308 !important;
            border-color: #eab308 !important;
            color: #ffffff !important;
        }

        .kb-key.kb-absent {
            background: #090d16 !important;
            border-color: #1e293b !important;
            color: #475569 !important;
        }

        /* Multiplayer Opponent Telemetry Radar */
        .opp-radar-card {
            width: 100%;
            max-width: 520px;
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid #334155;
            border-radius: var(--radius-lg);
            padding: 12px 16px;
            margin-top: 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .opp-radar-grid {
            display: flex;
            flex-direction: column;
            gap: 4px;
            align-items: center;
        }

        .opp-radar-row {
            display: flex;
            gap: 4px;
        }

        .opp-radar-tile {
            width: 20px;
            height: 20px;
            border-radius: 3px;
            background: #1e293b;
            border: 1px solid #334155;
        }

        .opp-radar-tile.opp-correct { background: #22c55e; border-color: #22c55e; }
        .opp-radar-tile.opp-present { background: #eab308; border-color: #eab308; }
        .opp-radar-tile.opp-absent { background: #475569; border-color: #475569; }

        /* Guide Manual Card */
        .wordduel-guide {
            max-width: 680px;
            width: 100%;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid #1e293b;
            border-radius: var(--radius-lg);
            padding: 16px 20px;
            margin-top: 24px;
            text-align: left;
        }
    </style>
</asp:Content>

<asp:Content ID="Main" ContentPlaceHolderID="MainContent" runat="server">
    <div class="wordduel-container">
        
        <!-- Header HUD -->
        <div class="wordduel-hud">
            <div class="hud-stat-box">
                <span>Guess:</span>
                <span class="hud-badge" id="guess-count-badge">1 / 6</span>
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
                <label style="display: flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 700; color: #94a3b8; cursor: pointer;">
                    <input type="checkbox" id="hard-mode-toggle" style="cursor: pointer;" />
                    <span>Hard Mode</span>
                </label>
                <button type="button" class="btn btn-primary" id="btn-get-hint" style="padding: 4px 10px; font-size: 0.8rem; background: linear-gradient(135deg, #f59e0b, #fbbf24); color: #0f172a; font-weight: 800; border: none; box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);" title="Get a Clue or Letter Hint">
                    💡 Clue
                </button>
                <button type="button" class="btn btn-outline" id="btn-show-stats" style="padding: 4px 8px; font-size: 0.8rem;" title="View Vocabulary Stats">
                    📊 Stats
                </button>
                <button type="button" class="btn btn-outline" id="btn-new-word" style="padding: 4px 8px; font-size: 0.8rem;" title="Next Mystery Word">
                    🔄 New
                </button>
                <a href="../Default.aspx" class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" title="Exit to Game Hub">
                    🚪 Exit
                </a>
            </div>
        </div>

        <!-- Active Hint / Clue Banner (Collapsible) -->
        <div id="active-clue-banner" style="display: none; width: 100%; max-width: 520px; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: var(--radius-lg); padding: 8px 14px; margin-bottom: 12px; font-size: 0.82rem; color: #fde047; text-align: left; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span id="active-clue-text" style="font-weight: 700;">💡 Clue: ...</span>
                <button type="button" id="btn-dismiss-clue" style="background: none; border: none; color: #fde047; cursor: pointer; font-size: 0.9rem; font-weight: 800; padding: 0 4px;">✕</button>
            </div>
        </div>

        <!-- 6x5 Wordle Matrix -->
        <div class="wordle-board-container">
            <div id="wordle-grid" class="wordle-grid"></div>
            <div id="wordle-keyboard" class="wordle-keyboard"></div>
        </div>

        <!-- Live Opponent Radar (Multiplayer LAN Duels) -->
        <div id="multiplayer-telemetry-card" class="opp-radar-card" style="display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: #f43f5e; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">📡 Opponent Live Telemetry</strong>
                <span id="opponent-radar-attempts" style="font-size: 0.8rem; color: #94a3b8;">Attempts: 0 / 6</span>
            </div>
            <div id="opponent-radar-grid" class="opp-radar-grid"></div>
            <div id="opponent-radar-status" style="font-size: 0.75rem; color: #38bdf8; text-align: center;">Status: Decrypting secret word...</div>
        </div>

        <!-- Deductive Rules & How-To-Play Guide -->
        <div class="wordduel-guide">
            <h3 style="color: #38bdf8; font-size: 0.95rem; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">📖 Deductive Vocabulary Manual</h3>
            <p style="font-size: 0.8rem; color: #94a3b8; line-height: 1.4; margin-bottom: 12px;">
                Guess the 5-letter hidden English word in 6 attempts. Each guess must be a valid English dictionary word. Hit <strong>ENTER</strong> to submit. After each guess, the color of the tiles will change to show how close your guess was to the word:
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 32px; height: 32px; background: #22c55e; border-radius: 4px; display: flex; justify-content: center; align-items: center; font-weight: 900; color: #fff;">W</div>
                    <div style="font-size: 0.75rem; color: #cbd5e1;"><strong>Green</strong>: Letter is in the word and in the correct spot.</div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 32px; height: 32px; background: #eab308; border-radius: 4px; display: flex; justify-content: center; align-items: center; font-weight: 900; color: #fff;">I</div>
                    <div style="font-size: 0.75rem; color: #cbd5e1;"><strong>Yellow</strong>: Letter is in the word but in the wrong spot.</div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 32px; height: 32px; background: #334155; border-radius: 4px; display: flex; justify-content: center; align-items: center; font-weight: 900; color: #94a3b8;">N</div>
                    <div style="font-size: 0.75rem; color: #cbd5e1;"><strong>Gray</strong>: Letter is not in the word in any spot.</div>
                </div>
            </div>
        </div>

    </div>
</asp:Content>
