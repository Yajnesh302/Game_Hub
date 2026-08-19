<%@ Page Title="Rock-Paper-Scissors Reflex - Game Hub" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="RPS.aspx.cs" Inherits="GameHub.Games.RPSPage" %>

<asp:Content ID="Head" ContentPlaceHolderID="HeadContent" runat="server">
    <script src="<%= ResolveUrl("~/Scripts/rps.js") %>" type="text/javascript"></script>
</asp:Content>

<asp:Content ID="Body" ContentPlaceHolderID="MainContent" runat="server">
    <div class="rps-screen-container">
        <!-- Top Bar -->
        <div class="game-top-bar">
            <div class="game-meta">
                <a href="<%= ResolveUrl("~/Default.aspx") %>" class="btn btn-outline btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Hub Menu
                </a>
                <span class="game-mode-badge" id="game-mode-badge" style="background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.3); color: #34d399;">Best of 5</span>
            </div>
            <button type="button" class="btn btn-outline btn-sm" id="forfeit-game-btn" style="color: #fb7185; border-color: rgba(244,63,94,0.3);">
                Forfeit / Exit
            </button>
        </div>

        <!-- Series Tracker (Best of 5 Rounds) -->
        <div class="rps-series-tracker">
            <div class="rps-round-badge" id="round-number-text">Round 1</div>
            <div class="rps-series-dots">
                <span style="font-size: 0.85rem; color: var(--text-muted); margin-right: 6px;">Series:</span>
                <div class="round-dot" data-round="1" title="Round 1"></div>
                <div class="round-dot" data-round="2" title="Round 2"></div>
                <div class="round-dot" data-round="3" title="Round 3"></div>
                <div class="round-dot" data-round="4" title="Round 4"></div>
                <div class="round-dot" data-round="5" title="Round 5"></div>
            </div>
            <div style="font-weight: 700; font-size: 1rem;">
                <span id="p1-score-display" style="color: var(--accent-cyan);">0</span>
                <span style="color: var(--text-muted); margin: 0 4px;">:</span>
                <span id="p2-score-display" style="color: var(--accent-rose);">0</span>
            </div>
        </div>

        <!-- Reflex Countdown Timer (5s Circle) -->
        <div class="rps-timer-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" class="rps-timer-circle" viewBox="0 0 100 100">
                <circle class="rps-timer-bg" cx="50" cy="50" r="45"/>
                <circle class="rps-timer-bar" id="rps-timer-bar" cx="50" cy="50" r="45"/>
            </svg>
            <div class="rps-timer-number" id="rps-timer-num">5</div>
        </div>

        <!-- Battle Arena (Simultaneous Reveal Cards) -->
        <div class="rps-clash-arena">
            <div class="rps-reveal-card" id="p1-reveal-card">
                <div class="rps-reveal-icon" id="p1-reveal-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                </div>
                <div style="font-weight: 700;" id="p1-name">You</div>
            </div>

            <div style="text-align: center;">
                <div class="rps-clash-vs">VS</div>
                <div id="arena-status-text" style="font-size: 0.95rem; color: var(--accent-cyan); font-weight: 600; margin-top: 6px;">Pick your weapon!</div>
            </div>

            <div class="rps-reveal-card p2-card" id="p2-reveal-card">
                <div class="rps-reveal-icon" id="p2-reveal-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                </div>
                <div style="font-weight: 700;" id="p2-name">Bot</div>
            </div>
        </div>

        <!-- Weapon Choice Buttons (Rock, Paper, Scissors) -->
        <div class="rps-cards-grid">
            <button type="button" class="rps-choice-btn" data-choice="rock" id="btn-rock">
                <svg xmlns="http://www.w3.org/2000/svg" class="rps-choice-svg" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2">
                    <path d="M12 2l8 4v6c0 5.25-3.5 10-8 11-4.5-1-8-5.75-8-11V6l8-4z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
                <span class="rps-choice-name">Rock</span>
            </button>

            <button type="button" class="rps-choice-btn" data-choice="paper" id="btn-paper">
                <svg xmlns="http://www.w3.org/2000/svg" class="rps-choice-svg" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <span class="rps-choice-name">Paper</span>
            </button>

            <button type="button" class="rps-choice-btn" data-choice="scissors" id="btn-scissors">
                <svg xmlns="http://www.w3.org/2000/svg" class="rps-choice-svg" viewBox="0 0 24 24" fill="none" stroke="#fb7185" stroke-width="2">
                    <circle cx="6" cy="6" r="3"/>
                    <circle cx="6" cy="18" r="3"/>
                    <line x1="20" y1="4" x2="8.12" y2="15.88"/>
                    <line x1="14.47" y1="14.48" x2="20" y2="20"/>
                    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
                </svg>
                <span class="rps-choice-name">Scissors</span>
            </button>
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
                Best-of-5 | 5-Second Reflex Timer | Pattern AI
            </div>
        </div>
    </div>
</asp:Content>
