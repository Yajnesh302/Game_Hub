<%@ Page Title="Chess Championship - Game Hub" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Chess.aspx.cs" Inherits="GameHub.Games.ChessPage" %>

<asp:Content ID="Head" ContentPlaceHolderID="HeadContent" runat="server">
    <script src="<%= ResolveUrl("~/Scripts/chessRules.js") %>" type="text/javascript"></script>
    <script src="<%= ResolveUrl("~/Scripts/chessBot.js") %>" type="text/javascript"></script>
    <script src="<%= ResolveUrl("~/Scripts/chess.js") %>" type="text/javascript"></script>
</asp:Content>

<asp:Content ID="Body" ContentPlaceHolderID="MainContent" runat="server">
    <div class="game-screen-container" style="max-width: 960px;">
        <!-- Top Navigation Bar -->
        <div class="game-top-bar">
            <div class="game-meta">
                <a href="<%= ResolveUrl("~/Default.aspx") %>" class="btn btn-outline btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Hub Menu
                </a>
                <span class="game-mode-badge" id="game-mode-badge" style="background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;">
                    Chess Championship
                </span>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button type="button" class="btn btn-outline btn-sm" id="undo-btn" title="Undo Last Move (Vs Bot)" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                    Undo
                </button>
                <button type="button" class="btn btn-outline btn-sm" id="flip-board-btn" title="Flip Board Perspective" style="color: #a855f7; border-color: rgba(168, 85, 247, 0.4);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                    Flip
                </button>
                <button type="button" class="btn btn-outline btn-sm" id="draw-btn" title="Offer Draw" style="color: #facc15; border-color: rgba(250, 204, 21, 0.4);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
                    Offer Draw
                </button>
                <button type="button" class="btn btn-outline btn-sm" id="resign-btn" title="Resign Match" style="color: #f43f5e; border-color: rgba(244, 63, 94, 0.4);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                    Resign
                </button>
                <button type="button" class="btn btn-outline btn-sm" id="new-game-btn" title="Restart / New Match" style="color: #10b981; border-color: rgba(16, 185, 129, 0.4);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    Restart
                </button>
            </div>
        </div>

        <!-- Main Layout (Board + Sidebar) -->
        <div class="chess-layout">
            <!-- Left: Opponent Tray, 8x8 Board, Player Tray -->
            <div style="display: flex; flex-direction: column; gap: 10px; align-items: center; width: 100%;">
                <!-- Opponent Card & Captured White Pieces -->
                <div style="display: flex; align-items: center; justify-content: space-between; width: 520px; max-width: 100%;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="avatar" style="width: 32px; height: 32px; font-size: 0.85rem; background: #0f172a; border: 1.5px solid #0284c7;">♟️</div>
                        <div>
                            <div style="font-weight: 700; font-size: 0.95rem; color: #f8fafc;" id="opponent-name">Black (Opponent)</div>
                            <div style="font-size: 0.72rem; color: var(--text-muted);" id="opponent-subtext">Playing as Black</div>
                        </div>
                    </div>
                    <!-- Captured White Tray -->
                    <div class="chess-captured-tray" id="captured-white-tray"></div>
                </div>

                <!-- 8x8 Chess Board Container -->
                <div class="chess-board-wrapper">
                    <div class="chess-board" id="chess-board">
                        <!-- Populated dynamically via JS -->
                    </div>

                    <!-- Pawn Promotion Modal -->
                    <div class="chess-promo-modal" id="chess-promotion-modal">
                        <div style="font-weight: 700; font-size: 1rem; color: #38bdf8;">Promote Pawn</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">Choose your promotion piece</div>
                        <div class="chess-promo-options">
                            <button type="button" class="chess-promo-btn" data-choice="q" title="Queen">
                                <svg viewBox="0 0 45 45"><path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 22.5,10 L 14,25 L 6.5,13.5 z M 9,26 L 9,36 L 36,36 L 36,26 z M 11.5,30 C 15,29 30,29 33.5,30 L 33.5,33 L 11.5,33 z" fill="#f8fafc" stroke="#38bdf8" stroke-width="1.5"/></svg>
                            </button>
                            <button type="button" class="chess-promo-btn" data-choice="r" title="Rook">
                                <svg viewBox="0 0 45 45"><path d="M 9,39 L 36,39 L 36,36 L 9,36 z M 12,36 L 12,32 L 33,32 L 33,36 z M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 L 31,17 L 14,17 z M 14,17 L 14,29.5 L 31,29.5 L 31,17 z M 14,16 L 31,16 L 31,16.5 L 14,16.5 z" fill="#f8fafc" stroke="#38bdf8" stroke-width="1.5"/></svg>
                            </button>
                            <button type="button" class="chess-promo-btn" data-choice="b" title="Bishop">
                                <svg viewBox="0 0 45 45"><path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.65,38.99 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,28.5 28.5,26 C 26.5,23.5 25.5,18 25.5,14 C 25.5,10 22.5,8 22.5,8 C 22.5,8 19.5,10 19.5,14 C 19.5,18 18.5,23.5 16.5,26 C 15,28.5 14.5,30.5 15,32 z" fill="#f8fafc" stroke="#38bdf8" stroke-width="1.5"/></svg>
                            </button>
                            <button type="button" class="chess-promo-btn" data-choice="n" title="Knight">
                                <svg viewBox="0 0 45 45"><path d="M 22,10 C 22,10 17,11 15,14 C 13,17 14,20 14,20 C 14,20 10,21 9,25 C 8,29 11,30 11,30 C 11,30 10,32 10,34 C 10,36 12,36 12,36 L 33,36 C 33,36 33,32 30,28 C 27,24 28,19 28,19 C 28,19 31,18 31,14 C 31,10 27,9 27,9 C 27,9 25,8 22,10 z" fill="#f8fafc" stroke="#38bdf8" stroke-width="1.5"/></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- You Card & Captured Black Pieces -->
                <div style="display: flex; align-items: center; justify-content: space-between; width: 520px; max-width: 100%;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="avatar" style="width: 32px; height: 32px; font-size: 0.85rem; background: #f8fafc; color: #0f172a; border: 1.5px solid #38bdf8;">♙</div>
                        <div>
                            <div style="font-weight: 700; font-size: 0.95rem; color: #f8fafc;" id="player-name">White (You)</div>
                            <div style="font-size: 0.72rem; color: var(--text-muted);">Playing as White</div>
                        </div>
                    </div>
                    <!-- Captured Black Tray -->
                    <div class="chess-captured-tray" id="captured-black-tray"></div>
                </div>
            </div>

            <!-- Right: Turn Status, Difficulty, Move List & Controls -->
            <div class="game2048-sidebar">
                <!-- Turn Status Banner -->
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--panel-border); padding-bottom: 12px; margin-bottom: 14px;">
                    <div>
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Status</div>
                        <div style="font-size: 1.1rem; font-weight: 800; color: #38bdf8;" id="turn-status-text">White's Turn</div>
                    </div>
                    <span class="game-mode-badge" id="turn-badge" style="padding: 4px 10px; font-size: 0.75rem;">White</span>
                </div>

                <!-- In-Game Difficulty Segmented Selector (Vs Bot) -->
                <div id="in-game-diff-container" style="margin-bottom: 14px; border-bottom: 1px solid var(--panel-border); padding-bottom: 12px;">
                    <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 6px;">Bot Difficulty</div>
                    <div class="segmented-control" style="display: flex; width: 100%;">
                        <button type="button" class="seg-btn" id="diff-btn-easy" data-diff="easy" style="flex: 1;">Easy</button>
                        <button type="button" class="seg-btn" id="diff-btn-medium" data-diff="medium" style="flex: 1;">Medium</button>
                        <button type="button" class="seg-btn" id="diff-btn-hard" data-diff="hard" style="flex: 1;">Hard</button>
                    </div>
                </div>

                <!-- Move Notation Log -->
                <div style="margin-bottom: 14px;">
                    <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase;">Move History (SAN)</div>
                    <div class="chess-history-box" id="chess-move-history">
                        <div style="color: var(--text-muted); font-size: 0.82rem; text-align: center; padding: 12px;">No moves played yet.</div>
                    </div>
                </div>

                <!-- Quick Help -->
                <div style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; border-top: 1px solid var(--panel-border); padding-top: 12px;">
                    <strong style="color: #f8fafc;">Controls:</strong> Click your piece to view legal moves (<span style="color: #38bdf8;">blue dot</span> = move, <span style="color: #f43f5e;">red ring</span> = capture), then click target square.
                </div>
            </div>
        </div>
    </div>
</asp:Content>
