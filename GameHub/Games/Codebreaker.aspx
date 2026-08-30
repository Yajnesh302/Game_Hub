<%@ Page Title="Codebreaker: Cyber Cipher - Game Hub" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Codebreaker.aspx.cs" Inherits="GameHub.Games.CodebreakerPage" %>

<asp:Content ID="Head" ContentPlaceHolderID="HeadContent" runat="server">
    <script src="<%= ResolveUrl("~/Scripts/codebreaker.js?v=2.2") %>" type="text/javascript"></script>
    <style>
        .codebreaker-container {
            max-width: 920px;
            margin: 0 auto;
        }

        .cipher-terminal-grid {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 20px;
            margin: 16px 0;
        }

        @media (max-width: 860px) {
            .cipher-terminal-grid {
                grid-template-columns: 1fr;
            }
        }

        /* Vault Header */
        .vault-panel {
            background: linear-gradient(180deg, #0f172a, #090d16);
            border: 2px solid #334155;
            border-radius: var(--radius-xl);
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        }

        .vault-slots-wrapper {
            display: flex;
            gap: 12px;
        }

        .vault-peg-slot {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            border: 2px dashed #475569;
            background: #020617;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .vault-peg-slot.locked .lock-icon {
            font-size: 1.1rem;
            opacity: 0.6;
        }

        /* Terminal Main Board */
        .terminal-board {
            background: #020617;
            border: 2px solid #1e293b;
            border-radius: var(--radius-xl);
            padding: 18px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.7);
        }

        .terminal-rows-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-height: 440px;
            overflow-y: auto;
            padding-right: 6px;
        }

        .cipher-row {
            display: flex;
            align-items: center;
            gap: 14px;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(51, 65, 85, 0.4);
            border-radius: var(--radius-lg);
            padding: 8px 14px;
            transition: all 0.25s ease;
        }

        .cipher-row.active-row {
            background: rgba(56, 189, 248, 0.08);
            border: 1.5px solid #38bdf8;
            box-shadow: 0 0 18px rgba(56, 189, 248, 0.2);
        }

        .cipher-row.scanning {
            animation: rowScanPulse 0.4s ease-in-out;
        }

        @keyframes rowScanPulse {
            0% { transform: scale(1); filter: brightness(1); }
            50% { transform: scale(1.02); filter: brightness(1.6); }
            100% { transform: scale(1); filter: brightness(1); }
        }

        .row-num-badge {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #1e293b;
            color: #94a3b8;
            font-size: 0.8rem;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .row-peg-slots {
            display: flex;
            gap: 10px;
            flex: 1;
        }

        .guess-peg-slot {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: #090d16;
            border: 2px solid #334155;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .guess-peg-slot.filled {
            transform: scale(1.05);
        }

        /* Key Feedback Grid */
        .row-key-grid {
            display: grid;
            grid-template-columns: repeat(2, 14px);
            gap: 5px;
            padding: 4px 8px;
            background: #0b1120;
            border-radius: var(--radius-sm);
            border: 1px solid #1e293b;
        }

        .key-peg-hole {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #1e293b;
            border: 1px solid #334155;
        }

        .key-peg-hole.key-exact {
            background: #ef4444;
            border-color: #f87171;
            box-shadow: 0 0 8px rgba(239, 68, 68, 0.8);
        }

        .key-peg-hole.key-color {
            background: #f8fafc;
            border-color: #e2e8f0;
            box-shadow: 0 0 8px rgba(248, 250, 252, 0.8);
        }

        /* Gem Palette Dock */
        .gem-dock-panel {
            background: #0f172a;
            border: 1.5px solid #334155;
            border-radius: var(--radius-xl);
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 14px;
        }

        .gem-palette-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            justify-items: center;
        }

        .gem-btn {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .gem-btn:hover {
            transform: scale(1.15) translateY(-2px);
        }

        .gem-btn:active {
            transform: scale(0.95);
        }

        .ready-pulse {
            animation: readyGlow 1.2s infinite alternate;
        }

        @keyframes readyGlow {
            from { box-shadow: 0 0 10px rgba(56, 189, 248, 0.4); }
            to { box-shadow: 0 0 25px rgba(56, 189, 248, 0.85); }
        }

        /* Opponent Radar */
        .radar-card {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(168, 85, 247, 0.3);
            border-radius: var(--radius-lg);
            padding: 12px 14px;
            margin-top: 10px;
        }

        .radar-progress {
            height: 6px;
            background: #1e293b;
            border-radius: 3px;
            overflow: hidden;
            margin-top: 6px;
        }

        .radar-progress-bar {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #9333ea, #c084fc);
            transition: width 0.3s ease;
        }
    </style>
</asp:Content>

<asp:Content ID="Body" ContentPlaceHolderID="MainContent" runat="server">
    <div class="game-screen-container codebreaker-container">
        <!-- Top Navigation -->
        <div class="game-top-bar">
            <div class="game-meta">
                <a href="<%= ResolveUrl("~/Default.aspx") %>" class="btn btn-outline btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Hub Menu
                </a>
                <span class="game-mode-badge" id="game-mode-badge" style="background: rgba(168, 85, 247, 0.15); border-color: rgba(168, 85, 247, 0.35); color: #c084fc;">
                    🕵️ Codebreaker Cipher
                </span>
                <span class="badge" id="attempts-left-badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 4px 10px; border-radius: 12px; font-weight: 700; font-size: 0.8rem;">
                    9 Attempts Left
                </span>
            </div>
            <button type="button" class="btn btn-outline btn-sm" id="forfeit-game-btn" style="color: #fb7185; border-color: rgba(244,63,94,0.3);">
                Exit Match
            </button>
        </div>

        <!-- Secret Cipher Vault Header -->
        <div class="vault-panel">
            <div>
                <div style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;" id="vault-status-label">
                    🔒 ENCRYPTED CIPHER VAULT
                </div>
                <div style="font-size: 0.85rem; color: #64748b; margin-top: 2px;">
                    Decrypt the secret code before attempts expire
                </div>
            </div>
            <div class="vault-slots-wrapper" id="vault-slots">
                <!-- Injected dynamically -->
            </div>
        </div>

        <!-- Main Terminal Workspace -->
        <div class="cipher-terminal-grid">
            <!-- Left: Guess History Rows -->
            <div class="terminal-board">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
                    <span style="font-size: 0.85rem; color: #94a3b8; font-weight: 700;">GUESS ATTEMPTS</span>
                    <span style="font-size: 0.75rem; color: #64748b;">🔴 Exact Position &nbsp;|&nbsp; ⚪ Correct Color</span>
                </div>
                <div class="terminal-rows-container" id="terminal-rows-container">
                    <!-- Injected dynamically -->
                </div>
            </div>

            <!-- Right: Gem Controls & Opponent Radar -->
            <div>
                <div class="gem-dock-panel">
                    <div style="font-size: 0.85rem; font-weight: 800; color: #f8fafc; text-align: center;">
                        CYBER GEM PALETTE
                    </div>
                    <div class="gem-palette-grid" id="palette-dock">
                        <!-- Injected dynamically -->
                    </div>

                    <div style="display: flex; gap: 8px; margin-top: 6px;">
                        <button type="button" class="btn btn-outline btn-sm" id="clear-peg-btn" style="flex: 1;">
                            ⌫ Backspace
                        </button>
                        <button type="button" class="btn btn-primary btn-sm" id="submit-guess-btn" style="flex: 1.3;" disabled="disabled">
                            ⚡ Scan Row
                        </button>
                    </div>
                </div>

                <!-- Opponent Radar in LAN Multiplayer -->
                <div class="radar-card" id="opponent-radar-panel" style="display: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: #c084fc;">📡 Opponent Telemetry</span>
                        <span style="font-size: 0.75rem; color: #94a3b8;" id="opponent-radar-name">Opponent</span>
                    </div>
                    <div style="font-size: 0.85rem; font-weight: 700; color: #f8fafc; margin-top: 4px;" id="opponent-radar-attempt">
                        Row 0 / 9
                    </div>
                    <div style="font-size: 0.75rem; color: #64748b; margin-top: 2px;" id="opponent-radar-clues">
                        Waiting for first scan...
                    </div>
                    <div class="radar-progress">
                        <div class="radar-progress-bar" id="opponent-radar-progress-bar"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bottom Game Toolbar -->
        <div class="game-toolbar">
            <div class="reaction-bar">
                <span style="font-size: 0.85rem; color: var(--text-muted); margin-right: 4px;">Quick Taunt:</span>
                <button type="button" class="reaction-btn btn-sm" data-msg="🧠 Almost Cracked!">Almost Cracked!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="🔴 Got 3 Exact!">Got 3 Exact!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="⚡ Code Decrypted!">Decrypted!</button>
                <button type="button" class="reaction-btn btn-sm" data-msg="🤝 Well Played!">GG!</button>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">
                💡 <strong>Clue Rules</strong>: 🔴 Red peg = correct color &amp; correct spot • ⚪ White peg = correct color in wrong spot
            </div>
        </div>
    </div>
</asp:Content>
