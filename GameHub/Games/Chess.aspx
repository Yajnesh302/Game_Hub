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
                        <div style="font-weight: 700; font-size: 1rem; color: #f8fafc; margin-bottom: 4px;">&#9822; Promote Pawn</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 12px;">Choose a piece</div>
                        <div class="chess-promo-options">
                            <button type="button" class="chess-promo-btn" data-choice="q" title="Queen">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0m16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0M41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0M16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0M33 9a2 2 0 1 1-4 0 2 2 0 1 1 4 0"/><path stroke-linecap="butt" d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14z"/><path stroke-linecap="butt" d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path fill="none" d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0"/></g></svg>
                                <span>Queen</span>
                            </button>
                            <button type="button" class="chess-promo-btn" data-choice="r" title="Rook">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path stroke-linecap="butt" d="M9 39h27v-3H9zm3-3v-4h21v4zm-1-22V9h4v2h5V9h5v2h5V9h4v5"/><path d="m34 14-3 3H14l-3-3"/><path stroke-linecap="butt" stroke-linejoin="miter" d="M31 17v12.5H14V17"/><path d="m31 29.5 1.5 2.5h-20l1.5-2.5"/><path fill="none" stroke-linejoin="miter" d="M11 14h23"/></g></svg>
                                <span>Rook</span>
                            </button>
                            <button type="button" class="chess-promo-btn" data-choice="b" title="Bishop">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><g fill="#fff" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.94 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path stroke-linejoin="miter" d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5"/></g></svg>
                                <span>Bishop</span>
                            </button>
                            <button type="button" class="chess-promo-btn" data-choice="n" title="Knight">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path fill="#fff" d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path fill="#fff" d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"/><path fill="#000" d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0m5.433-9.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5"/></g></svg>
                                <span>Knight</span>
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
