<%@ Page Title="Game Hub - Offline LAN Arena" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="GameHub.Default" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">
    <!-- Hero Banner -->
    <section class="hero-section">
        <div class="hero-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10 8 16 12 10 16 10 8"/>
            </svg>
            Intranet Real-Time Multiplayer
        </div>
        <h1 class="hero-title">
            Play Classic Mini-Games <br/>
            <span style="background: linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #f43f5e 100%); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                Solo or Over Local LAN
            </span>
        </h1>
        <p class="hero-subtitle">
            Challenge smart Minimax AI bots offline or battle colleagues in real time over your local office network with zero internet connection required.
        </p>
    </section>

    <!-- Games Grid (3 Games) -->
    <div class="game-grid">
        <!-- Game 1: Tic-Tac-Toe -->
        <div class="game-card" id="card-tictactoe">
            <div class="game-thumb">
                <div class="game-tag">Minimax AI</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="game-thumb-svg" viewBox="0 0 340 190" fill="none">
                    <rect width="340" height="190" fill="#0f172a"/>
                    <!-- Grid Lines -->
                    <line x1="130" y1="30" x2="130" y2="160" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
                    <line x1="210" y1="30" x2="210" y2="160" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
                    <line x1="60" y1="75" x2="280" y2="75" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
                    <line x1="60" y1="120" x2="280" y2="120" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
                    <!-- X Marker -->
                    <line x1="80" y1="42" x2="110" y2="65" stroke="#06b6d4" stroke-width="6" stroke-linecap="round"/>
                    <line x1="110" y1="42" x2="80" y2="65" stroke="#06b6d4" stroke-width="6" stroke-linecap="round"/>
                    <!-- O Marker -->
                    <circle cx="170" cy="98" r="14" stroke="#f43f5e" stroke-width="6"/>
                    <!-- Second X -->
                    <line x1="230" y1="130" x2="260" y2="152" stroke="#06b6d4" stroke-width="6" stroke-linecap="round"/>
                    <line x1="260" y1="130" x2="230" y2="152" stroke="#06b6d4" stroke-width="6" stroke-linecap="round"/>
                </svg>
            </div>
            <div class="game-body">
                <h2 class="game-title">Tic-Tac-Toe</h2>
                <p class="game-desc">The classic 3x3 strategic grid. Features neon glowing markers, animated win-line strikes, and an unbeatable Minimax bot on Hard.</p>
                <div class="game-controls">
                    <div class="difficulty-select-wrapper">
                        <span class="difficulty-label">Bot Level:</span>
                        <select class="difficulty-select" id="diff-ttt">
                            <option value="easy">Easy (Casual)</option>
                            <option value="normal">Normal (Smart)</option>
                            <option value="hard" selected="selected">Hard (Minimax Perfect)</option>
                        </select>
                    </div>
                    <div class="btn-group">
                        <button type="button" class="btn btn-primary play-bot-btn" data-game="ttt">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                            Play Bot
                        </button>
                        <button type="button" class="btn btn-secondary play-online-btn" data-type="1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            Play Online
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Game 2: Connect 4 -->
        <div class="game-card" id="card-connect4">
            <div class="game-thumb">
                <div class="game-tag" style="color: #fb7185;">Alpha-Beta AI</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="game-thumb-svg" viewBox="0 0 340 190" fill="none">
                    <rect width="340" height="190" fill="#0b1329"/>
                    <rect x="50" y="25" width="240" height="145" rx="14" fill="#1e293b" stroke="#334155" stroke-width="3"/>
                    <!-- Discs Grid -->
                    <circle cx="85" cy="55" r="11" fill="#090d16"/>
                    <circle cx="120" cy="55" r="11" fill="#090d16"/>
                    <circle cx="155" cy="55" r="11" fill="#090d16"/>
                    <circle cx="190" cy="55" r="11" fill="#090d16"/>
                    <circle cx="225" cy="55" r="11" fill="#090d16"/>
                    <circle cx="260" cy="55" r="11" fill="#090d16"/>

                    <circle cx="85" cy="95" r="11" fill="#090d16"/>
                    <circle cx="120" cy="95" r="11" fill="#0284c7"/>
                    <circle cx="155" cy="95" r="11" fill="#e11d48"/>
                    <circle cx="190" cy="95" r="11" fill="#0284c7"/>
                    <circle cx="225" cy="95" r="11" fill="#090d16"/>
                    <circle cx="260" cy="95" r="11" fill="#090d16"/>

                    <circle cx="85" cy="135" r="11" fill="#e11d48"/>
                    <circle cx="120" cy="135" r="11" fill="#0284c7"/>
                    <circle cx="155" cy="135" r="11" fill="#e11d48"/>
                    <circle cx="190" cy="135" r="11" fill="#0284c7"/>
                    <circle cx="225" cy="135" r="11" fill="#e11d48"/>
                    <circle cx="260" cy="135" r="11" fill="#090d16"/>
                </svg>
            </div>
            <div class="game-body">
                <h2 class="game-title">Connect 4</h2>
                <p class="game-desc">7x6 vertical gravity grid. Connect four discs of your color. Features animated physics drop, bounce easing, and Alpha-Beta pruning AI.</p>
                <div class="game-controls">
                    <div class="difficulty-select-wrapper">
                        <span class="difficulty-label">Bot Level:</span>
                        <select class="difficulty-select" id="diff-c4">
                            <option value="easy">Easy (Depth 1)</option>
                            <option value="normal">Normal (Depth 3)</option>
                            <option value="hard" selected="selected">Hard (Alpha-Beta Depth 6)</option>
                        </select>
                    </div>
                    <div class="btn-group">
                        <button type="button" class="btn btn-primary play-bot-btn" data-game="c4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                            Play Bot
                        </button>
                        <button type="button" class="btn btn-secondary play-online-btn" data-type="2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            Play Online
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Game 3: Rock-Paper-Scissors Reflex -->
        <div class="game-card" id="card-rps">
            <div class="game-thumb">
                <div class="game-tag" style="color: #34d399;">Pattern AI</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="game-thumb-svg" viewBox="0 0 340 190" fill="none">
                    <rect width="340" height="190" fill="#13112c"/>
                    <!-- Shield / Rock -->
                    <circle cx="90" cy="95" r="32" fill="#1e1b4b" stroke="#38bdf8" stroke-width="2.5"/>
                    <path d="M90 75l14 8v14c0 10-14 18-14 18s-14-8-14-18V83l14-8z" fill="#0284c7"/>
                    <!-- Clash Spark -->
                    <polygon points="170,70 178,90 200,95 178,100 170,120 162,100 140,95 162,90" fill="#f59e0b"/>
                    <!-- Scissors -->
                    <circle cx="250" cy="95" r="32" fill="#2d1222" stroke="#fb7185" stroke-width="2.5"/>
                    <circle cx="242" cy="104" r="5" stroke="#fb7185" stroke-width="2.5"/>
                    <circle cx="258" cy="104" r="5" stroke="#fb7185" stroke-width="2.5"/>
                    <line x1="242" y1="99" x2="258" y2="82" stroke="#fb7185" stroke-width="3" stroke-linecap="round"/>
                    <line x1="258" y1="99" x2="242" y2="82" stroke="#fb7185" stroke-width="3" stroke-linecap="round"/>
                </svg>
            </div>
            <div class="game-body">
                <h2 class="game-title">RPS Reflex</h2>
                <p class="game-desc">Best-of-5 championship match. 5-second reflex timer, dramatic simultaneous reveal clashes, and human pattern-detection AI.</p>
                <div class="game-controls">
                    <div class="difficulty-select-wrapper">
                        <span class="difficulty-label">Bot Level:</span>
                        <select class="difficulty-select" id="diff-rps">
                            <option value="easy">Easy (Random)</option>
                            <option value="normal">Normal (Frequency)</option>
                            <option value="hard" selected="selected">Hard (Pattern Recognition)</option>
                        </select>
                    </div>
                    <div class="btn-group">
                        <button type="button" class="btn btn-primary play-bot-btn" data-game="rps">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                            Play Bot
                        </button>
                        <button type="button" class="btn btn-secondary play-online-btn" data-type="3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            Play Online
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Game 4: Air Hockey -->
        <div class="game-card" id="card-airhockey">
            <div class="game-thumb">
                <div class="game-tag" style="color: #fbbf24;">Physics &amp; AI</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="game-thumb-svg" viewBox="0 0 340 190" fill="none">
                    <rect width="340" height="190" fill="#060b18"/>
                    <!-- Table outline -->
                    <rect x="25" y="20" width="290" height="150" rx="16" fill="#0f172a" stroke="#334155" stroke-width="3"/>
                    <!-- Center Line and Circle -->
                    <line x1="170" y1="20" x2="170" y2="170" stroke="rgba(148,163,184,0.3)" stroke-width="2" stroke-dasharray="6,6"/>
                    <circle cx="170" cy="95" r="35" stroke="rgba(56,189,248,0.35)" stroke-width="2"/>
                    <!-- Goal Mouths -->
                    <rect x="25" y="70" width="8" height="50" fill="#06b6d4" rx="3"/>
                    <rect x="307" y="70" width="8" height="50" fill="#f43f5e" rx="3"/>
                    <!-- P1 Paddle -->
                    <circle cx="80" cy="95" r="18" fill="url(#p1-pad-grad)" stroke="#38bdf8" stroke-width="2"/>
                    <circle cx="80" cy="95" r="6" fill="#ffffff"/>
                    <!-- P2 Paddle -->
                    <circle cx="260" cy="95" r="18" fill="url(#p2-pad-grad)" stroke="#fb7185" stroke-width="2"/>
                    <circle cx="260" cy="95" r="6" fill="#ffffff"/>
                    <!-- Puck -->
                    <circle cx="150" cy="85" r="10" fill="#f8fafc" stroke="#0284c7" stroke-width="2"/>
                    <defs>
                        <radialGradient id="p1-pad-grad" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#38bdf8"/>
                            <stop offset="100%" stop-color="#0284c7"/>
                        </radialGradient>
                        <radialGradient id="p2-pad-grad" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#fb7185"/>
                            <stop offset="100%" stop-color="#be123c"/>
                        </radialGradient>
                    </defs>
                </svg>
            </div>
            <div class="game-body">
                <h2 class="game-title">Air Hockey</h2>
                <p class="game-desc">Real-time canvas Air Hockey. Features mouse &amp; touch paddle control, wall reflections, first-to-7 score, and predictive trajectory AI.</p>
                <div class="game-controls">
                    <div class="difficulty-select-wrapper">
                        <span class="difficulty-label">Bot Level:</span>
                        <select class="difficulty-select" id="diff-airhockey">
                            <option value="easy">Easy (Casual)</option>
                            <option value="normal">Normal (Smart Guard)</option>
                            <option value="hard" selected="selected">Hard (Predictive Strike)</option>
                        </select>
                    </div>
                    <div class="btn-group">
                        <button type="button" class="btn btn-primary play-bot-btn" data-game="airhockey">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                            Play Bot
                        </button>
                        <button type="button" class="btn btn-secondary play-online-btn" data-type="4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            Play Online
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Game 5: Archery Clash -->
        <div class="game-card" id="card-archery">
            <div class="game-thumb">
                <div class="game-tag" style="color: #34d399;">Precision &amp; Wind</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="game-thumb-svg" viewBox="0 0 340 190" fill="none">
                    <rect width="340" height="190" fill="#060b18"/>
                    <!-- Sky and background hills -->
                    <path d="M0 140 Q 90 90 200 135 T 340 140 L 340 190 L 0 190 Z" fill="#064e3b" opacity="0.6"/>
                    <path d="M0 160 Q 140 120 340 160 L 340 190 L 0 190 Z" fill="#022c22"/>
                    <!-- Target Stand -->
                    <line x1="260" y1="100" x2="250" y2="165" stroke="#475569" stroke-width="4"/>
                    <line x1="260" y1="100" x2="270" y2="165" stroke="#475569" stroke-width="4"/>
                    <!-- Target Rings -->
                    <circle cx="260" cy="100" r="38" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
                    <circle cx="260" cy="100" r="30" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
                    <circle cx="260" cy="100" r="22" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
                    <circle cx="260" cy="100" r="14" fill="#e11d48" stroke="#fb7185" stroke-width="1.5"/>
                    <circle cx="260" cy="100" r="7" fill="#f59e0b" stroke="#fbbf24" stroke-width="1.5"/>
                    <!-- Arrow into Bullseye -->
                    <line x1="160" y1="65" x2="260" y2="100" stroke="#f8fafc" stroke-width="3" stroke-linecap="round"/>
                    <path d="M260 100 L250 93 L253 100 L250 107 Z" fill="#38bdf8"/>
                    <path d="M160 65 L150 60 L154 66 L150 72 Z" fill="#fb7185"/>
                    <!-- Trajectory preview arc -->
                    <path d="M60 130 Q 140 50 260 100" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,5" fill="none" opacity="0.6"/>
                    <!-- Archer Silhouette -->
                    <circle cx="55" cy="115" r="7" fill="#1e293b"/>
                    <line x1="55" y1="122" x2="55" y2="148" stroke="#1e293b" stroke-width="5" stroke-linecap="round"/>
                    <line x1="55" y1="148" x2="48" y2="170" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
                    <line x1="55" y1="148" x2="62" y2="170" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
                    <!-- Bow Arc -->
                    <path d="M68 110 Q 82 125 68 140" stroke="#d97706" stroke-width="2.5" fill="none"/>
                </svg>
            </div>
            <div class="game-body">
                <h2 class="game-title">Archery Clash</h2>
                <p class="game-desc">Turn-based archery accuracy challenge. Slingshot drag to set angle &amp; power, adjust for crosswinds, and hit the bullseye across 5 rounds.</p>
                <div class="game-controls">
                    <div class="difficulty-select-wrapper">
                        <span class="difficulty-label">Bot Level:</span>
                        <select class="difficulty-select" id="diff-archery">
                            <option value="easy">Easy (Wide Spread)</option>
                            <option value="normal">Normal (Accurate)</option>
                            <option value="hard" selected="selected">Hard (Bullseye Master)</option>
                        </select>
                    </div>
                    <div class="btn-group">
                        <button type="button" class="btn btn-primary play-bot-btn" data-game="archery" style="background: linear-gradient(135deg, #059669, #10b981);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                            Play Bot
                        </button>
                        <button type="button" class="btn btn-secondary play-online-btn" data-type="5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            Play Online
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Game 6: 2048 Single Player Puzzle -->
        <div class="game-card" id="card-2048">
            <div class="game-thumb">
                <div class="game-tag" style="color: #facc15;">Single Player</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="game-thumb-svg" viewBox="0 0 340 190" fill="none">
                    <rect width="340" height="190" fill="#060b18"/>
                    <!-- 2048 4x4 Mini Board -->
                    <rect x="75" y="15" width="190" height="160" rx="12" fill="#0f172a" stroke="#334155" stroke-width="3"/>
                    <!-- Tiles -->
                    <rect x="85" y="25" width="38" height="32" rx="6" fill="#0f2b38" stroke="#0284c7"/>
                    <text x="104" y="46" font-family="Outfit, sans-serif" font-weight="bold" font-size="14" fill="#38bdf8" text-anchor="middle">2</text>

                    <rect x="130" y="25" width="38" height="32" rx="6" fill="#0e3a44" stroke="#06b6d4"/>
                    <text x="149" y="46" font-family="Outfit, sans-serif" font-weight="bold" font-size="14" fill="#22d3ee" text-anchor="middle">4</text>

                    <rect x="175" y="25" width="38" height="32" rx="6" fill="#064e3b" stroke="#10b981"/>
                    <text x="194" y="46" font-family="Outfit, sans-serif" font-weight="bold" font-size="14" fill="#34d399" text-anchor="middle">8</text>

                    <rect x="220" y="25" width="38" height="32" rx="6" fill="#365314" stroke="#84cc16"/>
                    <text x="239" y="46" font-family="Outfit, sans-serif" font-weight="bold" font-size="12" fill="#a3e635" text-anchor="middle">16</text>

                    <!-- Row 2 -->
                    <rect x="85" y="62" width="38" height="32" rx="6" fill="#713f12" stroke="#eab308"/>
                    <text x="104" y="83" font-family="Outfit, sans-serif" font-weight="bold" font-size="12" fill="#fde047" text-anchor="middle">32</text>

                    <rect x="130" y="62" width="38" height="32" rx="6" fill="#7c2d12" stroke="#f97316"/>
                    <text x="149" y="83" font-family="Outfit, sans-serif" font-weight="bold" font-size="12" fill="#fdba74" text-anchor="middle">64</text>

                    <rect x="175" y="62" width="38" height="32" rx="6" fill="#881337" stroke="#f43f5e"/>
                    <text x="194" y="83" font-family="Outfit, sans-serif" font-weight="bold" font-size="11" fill="#fda4af" text-anchor="middle">128</text>

                    <rect x="220" y="62" width="38" height="32" rx="6" fill="#581c87" stroke="#a855f7"/>
                    <text x="239" y="83" font-family="Outfit, sans-serif" font-weight="bold" font-size="11" fill="#d8b4fe" text-anchor="middle">256</text>

                    <!-- Row 3: High Tiles -->
                    <rect x="85" y="99" width="38" height="32" rx="6" fill="#3b0764" stroke="#c084fc"/>
                    <text x="104" y="120" font-family="Outfit, sans-serif" font-weight="bold" font-size="10" fill="#f5d0fe" text-anchor="middle">512</text>

                    <rect x="130" y="99" width="38" height="32" rx="6" fill="#1e1b4b" stroke="#818cf8"/>
                    <text x="149" y="120" font-family="Outfit, sans-serif" font-weight="bold" font-size="9" fill="#c7d2fe" text-anchor="middle">1024</text>

                    <!-- Glowing 2048 Tile -->
                    <rect x="175" y="99" width="83" height="69" rx="8" fill="#78350f" stroke="#fbbf24" stroke-width="2.5" filter="drop-shadow(0 0 12px rgba(251,191,36,0.7))"/>
                    <text x="216" y="140" font-family="Outfit, sans-serif" font-weight="900" font-size="20" fill="#fef08a" text-anchor="middle">2048</text>

                    <!-- Empty slots -->
                    <rect x="85" y="136" width="38" height="32" rx="6" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.06)"/>
                    <rect x="130" y="136" width="38" height="32" rx="6" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.06)"/>
                </svg>
            </div>
            <div class="game-body">
                <h2 class="game-title">2048 Puzzle</h2>
                <p class="game-desc">Classic sliding tile puzzle. Slide and merge matching tiles to reach 2048 and beyond. Features 1-move undo and local high-score leaderboards.</p>
                <div class="game-controls">
                    <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 8px;">
                        <span>High-Score Challenge: Compete on the LAN leaderboard</span>
                    </div>
                    <div class="btn-group" style="width: 100%;">
                        <a href="Games/Game2048.aspx" class="btn btn-primary" style="width: 100%; justify-content: center; background: linear-gradient(135deg, #d97706, #f59e0b);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            Play 2048
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Game 7: Brick Blast Single Player Arcade -->
        <div class="game-card" id="card-brickblast">
            <div class="game-thumb">
                <div class="game-tag" style="color: #38bdf8;">Single Player</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="game-thumb-svg" viewBox="0 0 340 190" fill="none">
                    <rect width="340" height="190" fill="#060b18"/>
                    <!-- Brick rows -->
                    <!-- Top Row (Amber 3 HP) -->
                    <rect x="25" y="22" width="40" height="14" rx="3" fill="#d97706" stroke="#fbbf24"/>
                    <rect x="72" y="22" width="40" height="14" rx="3" fill="#d97706" stroke="#fbbf24"/>
                    <rect x="119" y="22" width="40" height="14" rx="3" fill="#d97706" stroke="#fbbf24"/>
                    <rect x="166" y="22" width="40" height="14" rx="3" fill="#d97706" stroke="#fbbf24"/>
                    <rect x="213" y="22" width="40" height="14" rx="3" fill="#d97706" stroke="#fbbf24"/>
                    <rect x="260" y="22" width="40" height="14" rx="3" fill="#d97706" stroke="#fbbf24"/>

                    <!-- Mid Row (Emerald 2 HP) -->
                    <rect x="25" y="42" width="40" height="14" rx="3" fill="#059669" stroke="#34d399"/>
                    <rect x="72" y="42" width="40" height="14" rx="3" fill="#059669" stroke="#34d399"/>
                    <rect x="119" y="42" width="40" height="14" rx="3" fill="#059669" stroke="#34d399"/>
                    <rect x="213" y="42" width="40" height="14" rx="3" fill="#059669" stroke="#34d399"/>
                    <rect x="260" y="42" width="40" height="14" rx="3" fill="#059669" stroke="#34d399"/>

                    <!-- Bottom Row (Cyan 1 HP) -->
                    <rect x="25" y="62" width="40" height="14" rx="3" fill="#0284c7" stroke="#38bdf8"/>
                    <rect x="72" y="62" width="40" height="14" rx="3" fill="#0284c7" stroke="#38bdf8"/>
                    <rect x="119" y="62" width="40" height="14" rx="3" fill="#0284c7" stroke="#38bdf8"/>
                    <rect x="166" y="62" width="40" height="14" rx="3" fill="#0284c7" stroke="#38bdf8"/>
                    <rect x="260" y="62" width="40" height="14" rx="3" fill="#0284c7" stroke="#38bdf8"/>

                    <!-- Ball trail & Ball -->
                    <path d="M140 160 Q 210 110 185 52" stroke="rgba(56,189,248,0.4)" stroke-width="2" stroke-dasharray="3,3" fill="none"/>
                    <circle cx="185" cy="52" r="6" fill="#f8fafc" filter="drop-shadow(0 0 8px #38bdf8)"/>

                    <!-- Exploding Shard Particles -->
                    <rect x="175" y="40" width="3" height="3" fill="#38bdf8"/>
                    <rect x="195" y="45" width="4" height="4" fill="#34d399"/>
                    <rect x="180" y="36" width="3" height="3" fill="#fbbf24"/>

                    <!-- Power-Up Capsule -->
                    <rect x="119" y="100" width="16" height="8" rx="4" fill="#0f172a" stroke="#38bdf8"/>
                    <text x="127" y="107" font-family="Outfit, sans-serif" font-weight="bold" font-size="6" fill="#38bdf8" text-anchor="middle">W</text>

                    <!-- Paddle -->
                    <rect x="100" y="160" width="80" height="10" rx="5" fill="url(#paddle-thumb-grad)" stroke="#7dd3fc"/>
                    <defs>
                        <linearGradient id="paddle-thumb-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stop-color="#38bdf8"/>
                            <stop offset="100%" stop-color="#0284c7"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <div class="game-body">
                <h2 class="game-title">Brick Blast</h2>
                <p class="game-desc">Classic arcade paddle &amp; ball brick breaker. Deflect the ball, shatter tiered bricks, collect power-ups, and trigger combo multipliers across multiple levels.</p>
                <div class="game-controls">
                    <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 8px;">
                        <span>Arcade Challenge: Conquer levels &amp; set the high score</span>
                    </div>
                    <div class="btn-group" style="width: 100%;">
                        <a href="Games/BrickBlast.aspx" class="btn btn-primary" style="width: 100%; justify-content: center; background: linear-gradient(135deg, #0284c7, #06b6d4);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            Play Brick Blast
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Game 8: Knife Throw Single Player Precision -->
        <div class="game-card" id="card-knifethrow">
            <div class="game-thumb">
                <div class="game-tag" style="color: #38bdf8;">Single Player</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="game-thumb-svg" viewBox="0 0 340 190" fill="none">
                    <rect width="340" height="190" fill="#060b18"/>
                    
                    <!-- Aimline -->
                    <line x1="170" y1="130" x2="170" y2="155" stroke="rgba(56, 189, 248, 0.25)" stroke-dasharray="3,3"/>

                    <!-- Rotating Target Disc -->
                    <circle cx="170" cy="72" r="48" fill="#0f172a" stroke="#38bdf8" stroke-width="3"/>
                    <circle cx="170" cy="72" r="32" stroke="rgba(56,189,248,0.3)" stroke-width="1.5"/>
                    <circle cx="170" cy="72" r="16" stroke="rgba(56,189,248,0.4)" stroke-width="1.5"/>
                    <circle cx="170" cy="72" r="4" fill="#38bdf8"/>

                    <!-- Obstacle Wedge -->
                    <path d="M170 72 L216 54 A48 48 0 0 1 216 90 Z" fill="#f43f5e" stroke="#fb7185"/>

                    <!-- Bonus Star -->
                    <circle cx="170" cy="40" r="6" fill="#fbbf24" filter="drop-shadow(0 0 6px #facc15)"/>

                    <!-- Stuck Knives -->
                    <!-- Knife 1 (Top Left) -->
                    <g transform="translate(170, 72) rotate(-55) translate(0, 48)">
                        <polygon points="0,-12 -3,0 3,0" fill="#38bdf8"/>
                        <rect x="-2.5" y="0" width="5" height="18" rx="2" fill="#0284c7" stroke="#7dd3fc"/>
                    </g>
                    <!-- Knife 2 (Left) -->
                    <g transform="translate(170, 72) rotate(-115) translate(0, 48)">
                        <polygon points="0,-12 -3,0 3,0" fill="#38bdf8"/>
                        <rect x="-2.5" y="0" width="5" height="18" rx="2" fill="#0284c7" stroke="#7dd3fc"/>
                    </g>
                    <!-- Knife 3 (Top Right) -->
                    <g transform="translate(170, 72) rotate(60) translate(0, 48)">
                        <polygon points="0,-12 -3,0 3,0" fill="#38bdf8"/>
                        <rect x="-2.5" y="0" width="5" height="18" rx="2" fill="#0284c7" stroke="#7dd3fc"/>
                    </g>

                    <!-- Flying / Launching Knife -->
                    <g transform="translate(170, 155)">
                        <polygon points="0,-16 -4,-4 4,-4" fill="#38bdf8"/>
                        <rect x="-3" y="-4" width="6" height="18" rx="2" fill="#0284c7" stroke="#7dd3fc"/>
                        <circle cx="0" cy="14" r="2.5" fill="#f8fafc"/>
                    </g>
                </svg>
            </div>
            <div class="game-body">
                <h2 class="game-title">Knife Throw</h2>
                <p class="game-desc">Timing &amp; precision knife-throwing challenge. Stick knives into rotating target wood, collect bonus stars, avoid stuck blades and obstacle wedges, and conquer endless stages.</p>
                <div class="game-controls">
                    <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 8px;">
                        <span>Precision Challenge: Time your throws &amp; climb the leaderboard</span>
                    </div>
                    <div class="btn-group" style="width: 100%;">
                        <a href="Games/KnifeThrow.aspx" class="btn btn-primary" style="width: 100%; justify-content: center; background: linear-gradient(135deg, #0284c7, #38bdf8);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            Play Knife Throw
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Game 9: Chess Dual Mode (Vs Bot & LAN Multiplayer) -->
        <div class="game-card" id="card-chess">
            <div class="game-thumb">
                <div class="game-tag" style="color: #38bdf8;">Dual Mode</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="game-thumb-svg" viewBox="0 0 340 190" fill="none">
                    <rect width="340" height="190" fill="#060b18"/>
                    
                    <!-- Isometric Chess Board Grids -->
                    <g transform="translate(170, 95) scale(1, 0.58) rotate(45) translate(-75, -75)">
                        <!-- 4x4 Sample Board Grid -->
                        <rect x="0" y="0" width="37.5" height="37.5" fill="#1e293b"/>
                        <rect x="37.5" y="0" width="37.5" height="37.5" fill="#0f172a"/>
                        <rect x="75" y="0" width="37.5" height="37.5" fill="#1e293b"/>
                        <rect x="112.5" y="0" width="37.5" height="37.5" fill="#0f172a"/>

                        <rect x="0" y="37.5" width="37.5" height="37.5" fill="#0f172a"/>
                        <rect x="37.5" y="37.5" width="37.5" height="37.5" fill="#1e293b"/>
                        <rect x="75" y="37.5" width="37.5" height="37.5" fill="#0f172a"/>
                        <rect x="112.5" y="37.5" width="37.5" height="37.5" fill="#1e293b"/>

                        <rect x="0" y="75" width="37.5" height="37.5" fill="#1e293b"/>
                        <rect x="37.5" y="75" width="37.5" height="37.5" fill="#0f172a"/>
                        <rect x="75" y="75" width="37.5" height="37.5" fill="#1e293b"/>
                        <rect x="112.5" y="75" width="37.5" height="37.5" fill="#0f172a"/>

                        <rect x="0" y="112.5" width="37.5" height="37.5" fill="#0f172a"/>
                        <rect x="37.5" y="112.5" width="37.5" height="37.5" fill="#1e293b"/>
                        <rect x="75" y="112.5" width="37.5" height="37.5" fill="#0f172a"/>
                        <rect x="112.5" y="112.5" width="37.5" height="37.5" fill="#1e293b"/>

                        <!-- Board Border -->
                        <rect x="0" y="0" width="150" height="150" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
                    </g>

                    <!-- Glowing Chess Pieces (King & Knight) -->
                    <!-- White Knight -->
                    <g transform="translate(115, 60)">
                        <path d="M 22,10 C 22,10 17,11 15,14 C 13,17 14,20 14,20 C 14,20 10,21 9,25 C 8,29 11,30 11,30 C 11,30 10,32 10,34 C 10,36 12,36 12,36 L 33,36 C 33,36 33,32 30,28 C 27,24 28,19 28,19 C 28,19 31,18 31,14 C 31,10 27,9 27,9 C 27,9 25,8 22,10 z" fill="#f8fafc" stroke="#38bdf8" stroke-width="1.5" filter="drop-shadow(0 0 10px rgba(56,189,248,0.7))"/>
                    </g>
                    <!-- Black King -->
                    <g transform="translate(195, 45)">
                        <path d="M 22.5,11.5 L 22.5,6 M 20,8 L 25,8 M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,14.5 C 38.5,14.5 31,22 22.5,14 C 14,22 6.5,14.5 6.5,14.5 z M 9,26 L 9,36 L 36,36 L 36,26 z M 11.5,30 C 15,29 30,29 33.5,30 L 33.5,33 L 11.5,33 z" fill="#0f172a" stroke="#0284c7" stroke-width="1.8" filter="drop-shadow(0 0 10px rgba(2,132,199,0.7))"/>
                    </g>
                </svg>
            </div>
            <div class="game-body">
                <h2 class="game-title">Chess</h2>
                <p class="game-desc">Classic two-player chess with standard 8x8 rules. Features castling, en passant, promotion, Alpha-Beta AI bot, and real-time LAN multiplayer with move notation.</p>
                <div class="game-controls">
                    <div class="difficulty-select-wrapper">
                        <span class="difficulty-label">Bot Level:</span>
                        <select class="difficulty-select" id="diff-chess">
                            <option value="easy">Easy (Casual)</option>
                            <option value="medium" selected="selected">Medium (Positional PST)</option>
                            <option value="hard">Hard (Alpha-Beta Depth 4)</option>
                        </select>
                    </div>
                    <div class="btn-group">
                        <button type="button" class="btn btn-primary play-bot-btn" data-game="chess">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                            Play Bot
                        </button>
                        <button type="button" class="btn btn-secondary play-online-btn" data-type="9">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            Play Online
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Game 10: Speed Math Arena (Solo & LAN Multiplayer) -->
        <div class="game-card" id="card-speedmath">
            <div class="game-thumb">
                <div class="game-tag" style="color: #38bdf8;">Math &amp; Speed</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="game-thumb-svg" viewBox="0 0 340 190" fill="none">
                    <rect width="340" height="190" fill="#060b18"/>
                    
                    <!-- Background Math Grid -->
                    <circle cx="170" cy="95" r="70" stroke="rgba(56,189,248,0.15)" stroke-width="2"/>
                    <circle cx="170" cy="95" r="45" stroke="rgba(56,189,248,0.25)" stroke-width="2" stroke-dasharray="6,6"/>

                    <!-- Floating Math Symbols -->
                    <!-- + (Addition) -->
                    <g transform="translate(60, 50)">
                        <rect x="0" y="8" width="24" height="6" rx="3" fill="#38bdf8"/>
                        <rect x="9" y="-1" width="6" height="24" rx="3" fill="#38bdf8"/>
                    </g>
                    <!-- − (Subtraction) -->
                    <g transform="translate(255, 55)">
                        <rect x="0" y="8" width="24" height="6" rx="3" fill="#f43f5e"/>
                    </g>
                    <!-- × (Multiplication) -->
                    <g transform="translate(65, 135) rotate(45)">
                        <rect x="0" y="8" width="22" height="6" rx="3" fill="#fbbf24"/>
                        <rect x="8" y="0" width="6" height="22" rx="3" fill="#fbbf24"/>
                    </g>
                    <!-- ÷ (Division) -->
                    <g transform="translate(255, 125)">
                        <circle cx="12" cy="0" r="3.5" fill="#34d399"/>
                        <rect x="0" y="8" width="24" height="5" rx="2.5" fill="#34d399"/>
                        <circle cx="12" cy="21" r="3.5" fill="#34d399"/>
                    </g>

                    <!-- Center Equation Neon Display -->
                    <rect x="90" y="65" width="160" height="60" rx="14" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5" filter="drop-shadow(0 0 16px rgba(56,189,248,0.3))"/>
                    <text x="170" y="103" font-family="Outfit, sans-serif" font-weight="900" font-size="22" fill="#f8fafc" text-anchor="middle">48 × 16 = <tspan fill="#38bdf8">?</tspan></text>
                </svg>
            </div>
            <div class="game-body">
                <h2 class="game-title">Speed Math Arena</h2>
                <p class="game-desc">High-octane mental arithmetic race. Practice Addition, Subtraction, Multiplication &amp; Division across Easy, Medium, Hard with 60s Blitz, 10-Q Sprint, Survival Streak, and LAN duels.</p>
                <div class="game-controls">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                        <div class="difficulty-select-wrapper">
                            <span class="difficulty-label">Operation:</span>
                            <select class="difficulty-select" id="op-speedmath">
                                <option value="mix" selected="selected">🎲 Mixed All</option>
                                <option value="add">➕ Addition</option>
                                <option value="sub">➖ Subtraction</option>
                                <option value="mul">✖️ Multiply</option>
                                <option value="div">➗ Division</option>
                            </select>
                        </div>
                        <div class="difficulty-select-wrapper">
                            <span class="difficulty-label">Difficulty:</span>
                            <select class="difficulty-select" id="diff-speedmath">
                                <option value="easy">Easy</option>
                                <option value="medium" selected="selected">Medium</option>
                                <option value="hard">Hard (Master)</option>
                            </select>
                        </div>
                    </div>
                    <div class="btn-group">
                        <button type="button" class="btn btn-primary play-bot-btn" data-game="speedmath">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                            Play Solo
                        </button>
                        <button type="button" class="btn btn-secondary play-online-btn" data-type="10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            LAN Duel
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Game 11: Sling Puck Frenzy (Solo & LAN Multiplayer) -->
        <div class="game-card" id="card-slingpuck">
            <div class="game-thumb">
                <div class="game-tag" style="color: #fbbf24;">Tabletop &amp; Reflex</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="game-thumb-svg" viewBox="0 0 340 190" fill="none">
                    <rect width="340" height="190" fill="#060b18"/>
                    
                    <!-- Table Rim Border -->
                    <rect x="25" y="20" width="290" height="150" rx="12" fill="#0f172a" stroke="#334155" stroke-width="3"/>

                    <!-- Elastic Bungee Slings -->
                    <path d="M50 30 Q 38 95 50 160" stroke="#38bdf8" stroke-width="3" fill="none"/>
                    <path d="M290 30 Q 302 95 290 160" stroke="#f43f5e" stroke-width="3" fill="none"/>

                    <!-- Center Divider & Gate Slot -->
                    <rect x="166" y="20" width="8" height="50" fill="#475569"/>
                    <rect x="166" y="120" width="8" height="50" fill="#475569"/>
                    <circle cx="170" cy="70" r="4" fill="#fbbf24"/>
                    <circle cx="170" cy="120" r="4" fill="#fbbf24"/>

                    <!-- Cyan Pucks (Left) -->
                    <circle cx="95" cy="65" r="10" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
                    <circle cx="115" cy="135" r="10" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
                    <circle cx="70" cy="100" r="10" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>

                    <!-- Flying Slingshot Puck through Gate -->
                    <path d="M50 95 Q 110 95 160 95" stroke="rgba(56,189,248,0.4)" stroke-width="2" stroke-dasharray="3,3"/>
                    <circle cx="160" cy="95" r="10" fill="#ffffff" stroke="#38bdf8" stroke-width="2" filter="drop-shadow(0 0 10px #38bdf8)"/>

                    <!-- Rose Pucks (Right) -->
                    <circle cx="245" cy="65" r="10" fill="#be123c" stroke="#f43f5e" stroke-width="2"/>
                    <circle cx="225" cy="135" r="10" fill="#be123c" stroke="#f43f5e" stroke-width="2"/>
                    <circle cx="270" cy="100" r="10" fill="#be123c" stroke="#f43f5e" stroke-width="2"/>
                </svg>
            </div>
            <div class="game-body">
                <h2 class="game-title">Sling Puck Frenzy</h2>
                <p class="game-desc">Fast-sling tabletop action. Stretch the elastic bungee cord, aim through the narrow center divider gate, and clear all 10 pucks from your court to win!</p>
                <div class="game-controls">
                    <div class="difficulty-select-wrapper">
                        <span class="difficulty-label">Bot Level:</span>
                        <select class="difficulty-select" id="diff-slingpuck">
                            <option value="easy">Easy (Casual)</option>
                            <option value="medium" selected="selected">Medium (Agile)</option>
                            <option value="hard">Hard (Championship Pro)</option>
                        </select>
                    </div>
                    <div class="btn-group">
                        <button type="button" class="btn btn-primary play-bot-btn" data-game="slingpuck">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                            Play Bot
                        </button>
                        <button type="button" class="btn btn-secondary play-online-btn" data-type="11">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            LAN Duel
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Game 12: Dots & Boxes Championship (Solo & LAN Multiplayer) -->
        <div class="game-card" id="card-dotsandboxes">
            <div class="game-thumb">
                <div class="game-tag" style="color: #fbbf24;">Turn-Based Strategy</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="game-thumb-svg" viewBox="0 0 340 190" fill="none">
                    <rect width="340" height="190" fill="#060b18"/>
                    
                    <!-- Board Outer Box -->
                    <rect x="45" y="20" width="250" height="150" rx="8" fill="#0b1120" stroke="#1e293b" stroke-width="2"/>

                    <!-- Completed Box 1 (Cyan P1) -->
                    <rect x="110" y="55" width="60" height="40" rx="4" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" stroke-width="1.5"/>
                    <text x="140" y="80" fill="#38bdf8" font-size="14" font-weight="900" font-family="Outfit, sans-serif" text-anchor="middle">P1</text>

                    <!-- Completed Box 2 (Rose P2) -->
                    <rect x="170" y="95" width="60" height="40" rx="4" fill="rgba(244, 63, 94, 0.25)" stroke="#f43f5e" stroke-width="1.5"/>
                    <text x="200" y="120" fill="#f43f5e" font-size="14" font-weight="900" font-family="Outfit, sans-serif" text-anchor="middle">P2</text>

                    <!-- Drawn Laser Lines -->
                    <line x1="110" y1="55" x2="170" y2="55" stroke="#f8fafc" stroke-width="3.5" filter="drop-shadow(0 0 4px #38bdf8)"/>
                    <line x1="110" y1="95" x2="170" y2="95" stroke="#f8fafc" stroke-width="3.5" filter="drop-shadow(0 0 4px #38bdf8)"/>
                    <line x1="110" y1="55" x2="110" y2="95" stroke="#f8fafc" stroke-width="3.5" filter="drop-shadow(0 0 4px #38bdf8)"/>
                    <line x1="170" y1="55" x2="170" y2="95" stroke="#f8fafc" stroke-width="3.5" filter="drop-shadow(0 0 4px #38bdf8)"/>

                    <line x1="170" y1="95" x2="230" y2="95" stroke="#f8fafc" stroke-width="3.5" filter="drop-shadow(0 0 4px #f43f5e)"/>
                    <line x1="170" y1="135" x2="230" y2="135" stroke="#f8fafc" stroke-width="3.5" filter="drop-shadow(0 0 4px #f43f5e)"/>
                    <line x1="170" y1="95" x2="170" y2="135" stroke="#f8fafc" stroke-width="3.5" filter="drop-shadow(0 0 4px #f43f5e)"/>
                    <line x1="230" y1="95" x2="230" y2="135" stroke="#f8fafc" stroke-width="3.5" filter="drop-shadow(0 0 4px #f43f5e)"/>

                    <!-- Glowing Preview Line -->
                    <line x1="110" y1="95" x2="110" y2="135" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="4,4"/>

                    <!-- 4x3 Dots Matrix -->
                    <circle cx="110" cy="55" r="4.5" fill="#ffffff" stroke="#fbbf24" stroke-width="2"/>
                    <circle cx="170" cy="55" r="4.5" fill="#ffffff" stroke="#fbbf24" stroke-width="2"/>
                    <circle cx="230" cy="55" r="4.5" fill="#ffffff" stroke="#fbbf24" stroke-width="2"/>

                    <circle cx="110" cy="95" r="4.5" fill="#ffffff" stroke="#fbbf24" stroke-width="2"/>
                    <circle cx="170" cy="95" r="4.5" fill="#ffffff" stroke="#fbbf24" stroke-width="2"/>
                    <circle cx="230" cy="95" r="4.5" fill="#ffffff" stroke="#fbbf24" stroke-width="2"/>

                    <circle cx="110" cy="135" r="4.5" fill="#ffffff" stroke="#fbbf24" stroke-width="2"/>
                    <circle cx="170" cy="135" r="4.5" fill="#ffffff" stroke="#fbbf24" stroke-width="2"/>
                    <circle cx="230" cy="135" r="4.5" fill="#ffffff" stroke="#fbbf24" stroke-width="2"/>
                </svg>
            </div>
            <div class="game-body">
                <h2 class="game-title">Dots &amp; Boxes</h2>
                <p class="game-desc">Classic grid territory game. Connect adjacent dots with lines to complete 4-sided boxes, trigger combo chain turns, and capture the grid!</p>
                <div class="game-controls">
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        <div class="difficulty-select-wrapper" style="flex: 1;">
                            <span class="difficulty-label">Grid:</span>
                            <select class="difficulty-select" id="size-dots">
                                <option value="3">3x3 (Fast)</option>
                                <option value="4" selected="selected">4x4 (Standard)</option>
                                <option value="5">5x5 (Tactical)</option>
                            </select>
                        </div>
                        <div class="difficulty-select-wrapper" style="flex: 1;">
                            <span class="difficulty-label">Bot:</span>
                            <select class="difficulty-select" id="diff-dots">
                                <option value="easy">Easy</option>
                                <option value="medium" selected="selected">Medium</option>
                                <option value="hard">Hard (Master)</option>
                            </select>
                        </div>
                    </div>
                    <div class="btn-group">
                        <button type="button" class="btn btn-primary play-bot-btn" data-game="dots">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                            Play Bot
                        </button>
                        <button type="button" class="btn btn-secondary play-online-btn" data-type="12">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            LAN Duel
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Game 13: Codebreaker / Mastermind (Solo & LAN Multiplayer) -->
        <div class="game-card" id="card-codebreaker">
            <div class="game-thumb">
                <div class="game-tag" style="color: #c084fc;">Deductive Logic &amp; Cipher</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="game-thumb-svg" viewBox="0 0 340 190" fill="none">
                    <rect width="340" height="190" fill="#060b18"/>
                    
                    <!-- Vault Panel -->
                    <rect x="35" y="20" width="270" height="45" rx="8" fill="#0f172a" stroke="#334155" stroke-width="2"/>
                    <text x="50" y="47" fill="#94a3b8" font-size="11" font-weight="800" font-family="Outfit, sans-serif">VAULT</text>
                    <circle cx="120" cy="42" r="12" fill="#020617" stroke="#475569" stroke-width="1.5" stroke-dasharray="2,2"/>
                    <circle cx="160" cy="42" r="12" fill="#020617" stroke="#475569" stroke-width="1.5" stroke-dasharray="2,2"/>
                    <circle cx="200" cy="42" r="12" fill="#020617" stroke="#475569" stroke-width="1.5" stroke-dasharray="2,2"/>
                    <circle cx="240" cy="42" r="12" fill="#020617" stroke="#475569" stroke-width="1.5" stroke-dasharray="2,2"/>

                    <!-- Decryption Row 1 -->
                    <rect x="35" y="75" width="270" height="42" rx="6" fill="#0f172a" stroke="#1e293b" stroke-width="1.5"/>
                    <circle cx="55" cy="96" r="8" fill="#1e293b"/>
                    <text x="55" y="100" fill="#94a3b8" font-size="10" font-weight="800" text-anchor="middle">1</text>
                    <circle cx="100" cy="96" r="11" fill="#ef4444" filter="drop-shadow(0 0 4px #ef4444)"/>
                    <circle cx="135" cy="96" r="11" fill="#3b82f6" filter="drop-shadow(0 0 4px #3b82f6)"/>
                    <circle cx="170" cy="96" r="11" fill="#10b981" filter="drop-shadow(0 0 4px #10b981)"/>
                    <circle cx="205" cy="96" r="11" fill="#f59e0b" filter="drop-shadow(0 0 4px #f59e0b)"/>
                    <!-- Feedback Pegs -->
                    <circle cx="250" cy="91" r="4" fill="#ef4444"/>
                    <circle cx="265" cy="91" r="4" fill="#ef4444"/>
                    <circle cx="250" cy="103" r="4" fill="#f8fafc"/>
                    <circle cx="265" cy="103" r="4" fill="#1e293b"/>

                    <!-- Active Row 2 -->
                    <rect x="35" y="125" width="270" height="45" rx="6" fill="rgba(56,189,248,0.08)" stroke="#38bdf8" stroke-width="2" filter="drop-shadow(0 0 8px rgba(56,189,248,0.25))"/>
                    <circle cx="55" cy="147" r="8" fill="#0284c7"/>
                    <text x="55" y="151" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">2</text>
                    <circle cx="100" cy="147" r="11" fill="#ef4444" filter="drop-shadow(0 0 4px #ef4444)"/>
                    <circle cx="135" cy="147" r="11" fill="#a855f7" filter="drop-shadow(0 0 4px #a855f7)"/>
                    <circle cx="170" cy="147" r="11" fill="#10b981" filter="drop-shadow(0 0 4px #10b981)"/>
                    <circle cx="205" cy="147" r="11" fill="#f97316" filter="drop-shadow(0 0 4px #f97316)"/>
                    <!-- Feedback Pegs 4 exact -->
                    <circle cx="250" cy="142" r="4" fill="#ef4444" filter="drop-shadow(0 0 3px #ef4444)"/>
                    <circle cx="265" cy="142" r="4" fill="#ef4444" filter="drop-shadow(0 0 3px #ef4444)"/>
                    <circle cx="250" cy="154" r="4" fill="#ef4444" filter="drop-shadow(0 0 3px #ef4444)"/>
                    <circle cx="265" cy="154" r="4" fill="#ef4444" filter="drop-shadow(0 0 3px #ef4444)"/>
                </svg>
            </div>
            <div class="game-body">
                <h2 class="game-title">Codebreaker Cipher</h2>
                <p class="game-desc">Mastermind deductive logic. Crack the hidden color cipher in limited attempts using feedback clues (🔴 exact spot, ⚪ correct color)!</p>
                <div class="game-controls">
                    <div class="difficulty-select-wrapper">
                        <span class="difficulty-label">Cipher Level:</span>
                        <select class="difficulty-select" id="diff-codebreaker">
                            <option value="easy">Easy (4 Pegs, No Dupes)</option>
                            <option value="medium" selected="selected">Medium (4 Pegs, Standard)</option>
                            <option value="hard">Hard (5 Pegs, 8 Colors)</option>
                        </select>
                    </div>
                    <div class="btn-group">
                        <button type="button" class="btn btn-primary play-bot-btn" data-game="codebreaker">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                            Play Solo
                        </button>
                        <button type="button" class="btn btn-secondary play-online-btn" data-type="13">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            LAN Duel
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Game 14: Memory Matrix (Solo & LAN Multiplayer) -->
        <div class="game-card" id="card-memorymatrix">
            <div class="game-thumb">
                <div class="game-tag" style="color: #38bdf8;">Visual Working Memory &amp; Recall</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="game-thumb-svg" viewBox="0 0 340 190" fill="none">
                    <rect width="340" height="190" fill="#040814"/>
                    
                    <!-- Background Circuit Lines -->
                    <path d="M20 95 H70 M270 95 H320 M170 10 V40 M170 150 V180" stroke="#1e293b" stroke-width="2" stroke-dasharray="4,4"/>
                    
                    <!-- 4x4 Matrix Frame -->
                    <rect x="95" y="20" width="150" height="150" rx="12" fill="#0b1120" stroke="#334155" stroke-width="2" filter="drop-shadow(0 0 15px rgba(56,189,248,0.2))"/>
                    
                    <!-- Matrix Tiles (4x4) -->
                    <!-- Row 1 -->
                    <rect x="105" y="30" width="28" height="28" rx="6" fill="#1e293b"/>
                    <rect x="139" y="30" width="28" height="28" rx="6" fill="url(#mem-grad-active)" stroke="#7dd3fc" stroke-width="1.5" filter="drop-shadow(0 0 8px #38bdf8)"/>
                    <rect x="173" y="30" width="28" height="28" rx="6" fill="#1e293b"/>
                    <rect x="207" y="30" width="28" height="28" rx="6" fill="#1e293b"/>

                    <!-- Row 2 -->
                    <rect x="105" y="64" width="28" height="28" rx="6" fill="#1e293b"/>
                    <rect x="139" y="64" width="28" height="28" rx="6" fill="#1e293b"/>
                    <rect x="173" y="64" width="28" height="28" rx="6" fill="url(#mem-grad-active)" stroke="#7dd3fc" stroke-width="1.5" filter="drop-shadow(0 0 8px #38bdf8)"/>
                    <rect x="207" y="64" width="28" height="28" rx="6" fill="url(#mem-grad-active)" stroke="#7dd3fc" stroke-width="1.5" filter="drop-shadow(0 0 8px #38bdf8)"/>

                    <!-- Row 3 -->
                    <rect x="105" y="98" width="28" height="28" rx="6" fill="url(#mem-grad-active)" stroke="#7dd3fc" stroke-width="1.5" filter="drop-shadow(0 0 8px #38bdf8)"/>
                    <rect x="139" y="98" width="28" height="28" rx="6" fill="#1e293b"/>
                    <rect x="173" y="98" width="28" height="28" rx="6" fill="#1e293b"/>
                    <rect x="207" y="98" width="28" height="28" rx="6" fill="#1e293b"/>

                    <!-- Row 4 -->
                    <rect x="105" y="132" width="28" height="28" rx="6" fill="#1e293b"/>
                    <rect x="139" y="132" width="28" height="28" rx="6" fill="url(#mem-grad-active)" stroke="#7dd3fc" stroke-width="1.5" filter="drop-shadow(0 0 8px #38bdf8)"/>
                    <rect x="173" y="132" width="28" height="28" rx="6" fill="#1e293b"/>
                    <rect x="207" y="132" width="28" height="28" rx="6" fill="url(#mem-grad-active)" stroke="#7dd3fc" stroke-width="1.5" filter="drop-shadow(0 0 8px #38bdf8)"/>

                    <defs>
                        <linearGradient id="mem-grad-active" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#ffffff"/>
                            <stop offset="40%" stop-color="#38bdf8"/>
                            <stop offset="100%" stop-color="#0284c7"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <div class="game-body">
                <h2 class="game-title">Memory Matrix: Cyber Recall</h2>
                <p class="game-desc">Visual working memory &amp; spatial agility. Memorize the illuminated tile pattern, then recall and tap all target nodes before shields deplete!</p>
                <div class="game-controls">
                    <div class="difficulty-select-wrapper">
                        <span class="difficulty-label">Training Mode:</span>
                        <select class="difficulty-select" id="diff-memorymatrix">
                            <option value="easy">Easy (No Rotation)</option>
                            <option value="medium" selected="selected">Medium (90° Rotation)</option>
                            <option value="hard">Master (180° Dynamic)</option>
                        </select>
                    </div>
                    <div class="btn-group">
                        <button type="button" class="btn btn-primary play-bot-btn" data-game="memorymatrix">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                            Play Solo
                        </button>
                        <button type="button" class="btn btn-secondary play-online-btn" data-type="14">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            LAN Duel
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Game 15: Laser & Mirrors: Photon Flow (Solo & LAN Multiplayer) -->
        <div class="game-card" id="card-lasermirrors">
            <div class="game-thumb">
                <div class="game-tag" style="color: #34d399;">Spatial Logic &amp; Raytracing Optics</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="game-thumb-svg" viewBox="0 0 340 190" fill="none">
                    <rect width="340" height="190" fill="#040914"/>
                    
                    <!-- Optics Chamber Grid Frame -->
                    <rect x="50" y="15" width="240" height="160" rx="10" fill="#080e1e" stroke="#1e293b" stroke-width="2"/>
                    <path d="M50 55 H290 M50 95 H290 M50 135 H290 M110 15 V175 M170 15 V175 M230 15 V175" stroke="#0f172a" stroke-width="1.5"/>

                    <!-- Laser Emitter at (70, 35) emitting East -->
                    <circle cx="80" cy="35" r="14" fill="#0f172a" stroke="#38bdf8" stroke-width="2" filter="drop-shadow(0 0 8px #38bdf8)"/>
                    <path d="M74 35 H86 M82 31 L86 35 L82 39" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>

                    <!-- Laser Beam Path with Neon Bloom -->
                    <!-- Segment 1: Emitter (80,35) -> Mirror 1 (200, 35) -->
                    <path d="M80 35 H200" stroke="#38bdf8" stroke-width="4" filter="drop-shadow(0 0 8px #38bdf8)" opacity="0.6"/>
                    <path d="M80 35 H200" stroke="#ffffff" stroke-width="2"/>

                    <!-- Mirror 1 at (200, 35) '/' diagonal -> reflects South -->
                    <line x1="188" y1="47" x2="212" y2="23" stroke="#38bdf8" stroke-width="3.5" filter="drop-shadow(0 0 6px #38bdf8)"/>

                    <!-- Segment 2: Mirror 1 (200,35) -> Mirror 2 (200, 115) -->
                    <path d="M200 35 V115" stroke="#38bdf8" stroke-width="4" filter="drop-shadow(0 0 8px #38bdf8)" opacity="0.6"/>
                    <path d="M200 35 V115" stroke="#ffffff" stroke-width="2"/>

                    <!-- Mirror 2 at (200, 115) '\' diagonal -> reflects West -->
                    <line x1="188" y1="103" x2="212" y2="127" stroke="#38bdf8" stroke-width="3.5" filter="drop-shadow(0 0 6px #38bdf8)"/>

                    <!-- Segment 3: Mirror 2 (200,115) -> Crystal (140, 115) -->
                    <path d="M200 115 H140" stroke="#38bdf8" stroke-width="4" filter="drop-shadow(0 0 8px #38bdf8)" opacity="0.6"/>
                    <path d="M200 115 H140" stroke="#ffffff" stroke-width="2"/>

                    <!-- Crystal Target at (140, 115) Energized -->
                    <polygon points="140,100 152,115 140,130 128,115" fill="#34d399" filter="drop-shadow(0 0 12px #34d399) drop-shadow(0 0 20px #38bdf8)"/>
                    <polygon points="140,105 148,115 140,125 132,115" fill="#ffffff"/>

                    <!-- Obsidian Wall Blocker at (140, 75) -->
                    <rect x="125" y="60" width="30" height="30" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
                    <line x1="130" y1="65" x2="150" y2="85" stroke="#0f172a" stroke-width="2"/>
                </svg>
            </div>
            <div class="game-body">
                <h2 class="game-title">Laser &amp; Mirrors: Photon Flow</h2>
                <p class="game-desc">Spatial logic &amp; optics raycaster. Place and rotate 45° planar mirrors, beam splitters, and filters to guide laser photons into all target crystals!</p>
                <div class="game-controls">
                    <div class="difficulty-select-wrapper">
                        <span class="difficulty-label">Optics Tier:</span>
                        <select class="difficulty-select" id="diff-lasermirrors">
                            <option value="1">Tier 1: Apprentice (Stages 1-5)</option>
                            <option value="6" selected="selected">Tier 2: Prism Division (Stages 6-10)</option>
                            <option value="11">Tier 3: Chromatics &amp; Portals (Stages 11-15)</option>
                            <option value="16">Tier 4: Quantum Master (Stages 16-20)</option>
                        </select>
                    </div>
                    <div class="btn-group">
                        <button type="button" class="btn btn-primary play-bot-btn" data-game="lasermirrors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                            Play Solo
                        </button>
                        <button type="button" class="btn btn-secondary play-online-btn" data-type="15">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            LAN Duel
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Game 16: AlgoBot: Maze Runner & Pathfinding (Solo & LAN Multiplayer) -->
        <div class="game-card" id="card-algobot">
            <div class="game-thumb">
                <div class="game-tag" style="color: #38bdf8;">Algorithmic Thinking &amp; Automation</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="game-thumb-svg" viewBox="0 0 340 190" fill="none">
                    <rect width="340" height="190" fill="#040914"/>
                    
                    <!-- Maze Grid Surface -->
                    <rect x="40" y="15" width="260" height="160" rx="10" fill="#080e1e" stroke="#1e293b" stroke-width="2"/>
                    <path d="M40 55 H300 M40 95 H300 M40 135 H300 M92 15 V175 M144 15 V175 M196 15 V175 M248 15 V175" stroke="#0f172a" stroke-width="1.5"/>

                    <!-- Programmed Path Trail Line with Glowing Cyan -->
                    <path d="M66 115 H170 V35 H274" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6 4" filter="drop-shadow(0 0 8px #38bdf8)"/>

                    <!-- Bot Drone at (170, 75) facing North -->
                    <circle cx="170" cy="75" r="16" fill="#0284c7" stroke="#38bdf8" stroke-width="2" filter="drop-shadow(0 0 12px #38bdf8)"/>
                    <polygon points="170,64 163,80 170,76 177,80" fill="#ffffff"/>

                    <!-- Data Chips at (118, 115) and (170, 35) -->
                    <polygon points="118,105 128,115 118,125 108,115" fill="#38bdf8" filter="drop-shadow(0 0 10px #38bdf8)"/>
                    <polygon points="170,25 180,35 170,45 160,35" fill="#38bdf8" filter="drop-shadow(0 0 10px #38bdf8)"/>

                    <!-- Exit Terminal at (274, 35) -->
                    <rect x="256" y="17" width="36" height="36" rx="6" fill="rgba(52, 211, 153, 0.15)" stroke="#34d399" stroke-width="2" filter="drop-shadow(0 0 10px #34d399)"/>
                    <text x="274" y="41" font-size="16" text-anchor="middle" fill="#34d399">🏁</text>

                    <!-- Instruction Stack Badge overlay -->
                    <rect x="52" y="138" width="130" height="26" rx="6" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
                    <text x="60" y="155" font-family="monospace" font-size="11" font-weight="700" fill="#38bdf8">MAIN: [MOVE, F1]</text>
                </svg>
            </div>
            <div class="game-body">
                <h2 class="game-title">AlgoBot: Maze Runner &amp; Pathfinding</h2>
                <p class="game-desc">Visual algorithmic coding &amp; maze automation. Assemble modular instruction blocks, subroutines, and recursion stacks to navigate autonomous rovers through cyber labyrinths!</p>
                <div class="game-controls">
                    <div class="difficulty-select-wrapper">
                        <span class="difficulty-label">Algorithm Tier:</span>
                        <select class="difficulty-select" id="diff-algobot">
                            <option value="1" selected="selected">Tier 1: Fundamentals (Stages 1-20)</option>
                            <option value="21">Tier 2: DRY &amp; Function F1 (Stages 21-40)</option>
                            <option value="41">Tier 3: Dual Subroutines F1/F2 (Stages 41-60)</option>
                            <option value="61">Tier 4: Gate Networks &amp; Switches (Stages 61-80)</option>
                            <option value="81">Tier 5: Grandmaster Turing (Stages 81-100)</option>
                        </select>
                    </div>
                    <div class="btn-group">
                        <button type="button" class="btn btn-primary play-bot-btn" data-game="algobot">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                            Play Solo
                        </button>
                        <button type="button" class="btn btn-secondary play-online-btn" data-type="16">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            LAN Duel
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Wordle / Word Duel Arena Card (Game 17) -->
        <div class="game-card" data-game="17">
            <div class="game-media">
                <svg viewBox="0 0 340 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="wdBgGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stop-color="#020617"/>
                            <stop offset="50%" stop-color="#0f172a"/>
                            <stop offset="100%" stop-color="#064e3b"/>
                        </linearGradient>
                        <filter id="wdGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur"/>
                            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                        </filter>
                    </defs>

                    <!-- Background -->
                    <rect width="340" height="180" fill="url(#wdBgGrad)" rx="16"/>

                    <!-- Keyboard Grid Silhouette Overlay -->
                    <path d="M 40 135 L 300 135 M 50 148 L 290 148 M 70 161 L 270 161" stroke="#1e293b" stroke-width="2" stroke-dasharray="8,6" opacity="0.6"/>

                    <!-- 3D Letter Tiles (C - O - D - E - R) -->
                    <!-- Tile 1: C (Green Correct) -->
                    <rect x="35" y="42" width="48" height="48" rx="8" fill="#22c55e" stroke="#4ade80" stroke-width="2" filter="url(#wdGlow)"/>
                    <text x="59" y="75" font-family="'Inter', sans-serif" font-size="24" font-weight="900" text-anchor="middle" fill="#ffffff">C</text>

                    <!-- Tile 2: O (Green Correct) -->
                    <rect x="91" y="42" width="48" height="48" rx="8" fill="#22c55e" stroke="#4ade80" stroke-width="2" filter="url(#wdGlow)"/>
                    <text x="115" y="75" font-family="'Inter', sans-serif" font-size="24" font-weight="900" text-anchor="middle" fill="#ffffff">O</text>

                    <!-- Tile 3: D (Yellow Present) -->
                    <rect x="147" y="42" width="48" height="48" rx="8" fill="#eab308" stroke="#fde047" stroke-width="2" filter="url(#wdGlow)"/>
                    <text x="171" y="75" font-family="'Inter', sans-serif" font-size="24" font-weight="900" text-anchor="middle" fill="#ffffff">D</text>

                    <!-- Tile 4: E (Slate Absent) -->
                    <rect x="203" y="42" width="48" height="48" rx="8" fill="#334155" stroke="#475569" stroke-width="2"/>
                    <text x="227" y="75" font-family="'Inter', sans-serif" font-size="24" font-weight="900" text-anchor="middle" fill="#94a3b8">E</text>

                    <!-- Tile 5: R (Green Correct) -->
                    <rect x="259" y="42" width="48" height="48" rx="8" fill="#22c55e" stroke="#4ade80" stroke-width="2" filter="url(#wdGlow)"/>
                    <text x="283" y="75" font-family="'Inter', sans-serif" font-size="24" font-weight="900" text-anchor="middle" fill="#ffffff">R</text>

                    <!-- Bottom HUD Overlay Badge -->
                    <rect x="95" y="102" width="150" height="22" rx="6" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
                    <text x="170" y="117" font-family="monospace" font-size="10" font-weight="700" text-anchor="middle" fill="#34d399">🟩 🟩 🟨 ⬛ 🟩 (SOLVED)</text>
                </svg>
            </div>
            <div class="game-body">
                <h2 class="game-title">Wordle / Word Duel Arena</h2>
                <p class="game-desc">Deductive vocabulary &amp; logic puzzle. Unmask secret 5-letter English words in 6 attempts using color-coded hints, hard mode constraints, and real-time LAN speed duels!</p>
                <div class="game-controls">
                    <div class="difficulty-select-wrapper">
                        <span class="difficulty-label">Game Mode:</span>
                        <select class="difficulty-select" id="mode-wordduel">
                            <option value="standard" selected="selected">Standard 5-Letter Wordle</option>
                            <option value="hard">Hard Mode (Enforce Hints)</option>
                        </select>
                    </div>
                    <div class="btn-group">
                        <button type="button" class="btn btn-primary play-bot-btn" data-game="wordduel">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                            Play Solo
                        </button>
                        <button type="button" class="btn btn-secondary play-online-btn" data-type="17">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            LAN Duel
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Lights Out: Quantum Switch Card (Game 18) -->
        <div class="game-card" data-game="18">
            <div class="game-media">
                <svg viewBox="0 0 340 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="loBgGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stop-color="#020617"/>
                            <stop offset="50%" stop-color="#0b1329"/>
                            <stop offset="100%" stop-color="#03354a"/>
                        </linearGradient>
                        <filter id="loNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="5" result="blur"/>
                            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                        </filter>
                    </defs>

                    <!-- Background -->
                    <rect width="340" height="180" fill="url(#loBgGrad)" rx="16"/>

                    <!-- Energy Conduits / Traces -->
                    <path d="M 60 40 L 280 40 M 60 70 L 280 70 M 60 100 L 280 100 M 60 130 L 280 130 M 60 160 L 280 160" stroke="#1e293b" stroke-width="2" opacity="0.7"/>
                    <path d="M 90 20 L 90 170 M 135 20 L 135 170 M 170 20 L 170 170 M 205 20 L 205 170 M 250 20 L 250 170" stroke="#1e293b" stroke-width="2" opacity="0.7"/>

                    <!-- Glowing Quantum Cross Connection -->
                    <path d="M 170 45 L 170 145 M 115 95 L 225 95" stroke="#38bdf8" stroke-width="3" opacity="0.6" filter="url(#loNeonGlow)"/>

                    <!-- Center Active Node -->
                    <circle cx="170" cy="95" r="16" fill="#38bdf8" filter="url(#loNeonGlow)"/>
                    <circle cx="170" cy="95" r="8" fill="#ffffff"/>

                    <!-- Adjacent Inversion Nodes -->
                    <!-- Top (170, 50) Active -->
                    <circle cx="170" cy="50" r="14" fill="#38bdf8" filter="url(#loNeonGlow)"/>
                    <circle cx="170" cy="50" r="6" fill="#ffffff"/>

                    <!-- Bottom (170, 140) Active -->
                    <circle cx="170" cy="140" r="14" fill="#38bdf8" filter="url(#loNeonGlow)"/>
                    <circle cx="170" cy="140" r="6" fill="#ffffff"/>

                    <!-- Left (120, 95) Active -->
                    <circle cx="120" cy="95" r="14" fill="#38bdf8" filter="url(#loNeonGlow)"/>
                    <circle cx="120" cy="95" r="6" fill="#ffffff"/>

                    <!-- Right (220, 95) Active -->
                    <circle cx="220" cy="95" r="14" fill="#38bdf8" filter="url(#loNeonGlow)"/>
                    <circle cx="220" cy="95" r="6" fill="#ffffff"/>

                    <!-- Dormant Outer Nodes -->
                    <circle cx="75" cy="50" r="12" fill="#0f172a" stroke="#334155" stroke-width="2"/>
                    <circle cx="265" cy="50" r="12" fill="#0f172a" stroke="#334155" stroke-width="2"/>
                    <circle cx="75" cy="140" r="12" fill="#0f172a" stroke="#334155" stroke-width="2"/>
                    <circle cx="265" cy="140" r="12" fill="#0f172a" stroke="#334155" stroke-width="2"/>

                    <!-- HUD Pill Overlay -->
                    <rect x="95" y="150" width="150" height="20" rx="6" fill="#020617" stroke="#334155" stroke-width="1.5"/>
                    <text x="170" y="164" font-family="monospace" font-size="10" font-weight="700" text-anchor="middle" fill="#38bdf8">⚡ GF(2) PARITY MATRIX</text>
                </svg>
            </div>
            <div class="game-body">
                <h2 class="game-title">Lights Out: Quantum Switch</h2>
                <p class="game-desc">Grid inversion &amp; parity puzzle. Unlink interconnected quantum light nodes using linear algebra Galois Field logic, Torus topology, and diagonal superposition in solo &amp; LAN duels!</p>
                <div class="game-controls">
                    <div class="difficulty-select-wrapper">
                        <span class="difficulty-label">Grid Mode:</span>
                        <select class="difficulty-select" id="mode-lightsout">
                            <option value="classic" selected="selected">Classic 5x5 Matrix</option>
                            <option value="torus">Torus Topology (Wrap)</option>
                            <option value="diag">Diagonal Superposition</option>
                            <option value="grandmaster">Grandmaster 6x6</option>
                        </select>
                    </div>
                    <div class="btn-group">
                        <button type="button" class="btn btn-primary play-bot-btn" data-game="lightsout">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                            Play Solo
                        </button>
                        <button type="button" class="btn btn-secondary play-online-btn" data-type="18">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            LAN Duel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Upload Game Quick Action Banner -->
    <div style="margin: 36px 0 12px; display: flex; justify-content: space-between; align-items: center; background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: var(--radius-xl); padding: 18px 24px; flex-wrap: wrap; gap: 14px;">
        <div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #f8fafc; margin-bottom: 2px;">
                🚀 Expand Your Intranet Game Hub
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">
                Add new HTML5/JS games directly to the server via ZIP upload without recompiling or republishing.
            </p>
        </div>
        <button type="button" class="btn btn-primary" id="btn-open-upload-modal" style="background: linear-gradient(135deg, #9333ea, #c084fc); box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload Custom Game (.zip)
        </button>
    </div>

    <!-- Dynamic Custom Games Section -->
    <div id="custom-games-section" style="margin-top: 36px; display: none;">
        <div class="section-header" style="border-bottom: 1px solid var(--panel-border); padding-bottom: 12px; margin-bottom: 24px;">
            <h2 class="section-title" style="font-size: 1.5rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Custom Uploaded Games
            </h2>
            <span style="font-size: 0.85rem; color: var(--text-muted);">Hot-pluggable without server restart</span>
        </div>
        <div class="game-grid" id="custom-games-grid">
            <!-- Rendered dynamically -->
        </div>
    </div>

    <!-- Live Intranet Dashboard (Lobby Presence & Scoreboard) -->
    <div class="dashboard-grid">
        <!-- Live LAN Lobby -->
        <div class="glass-panel">
            <div class="section-header">
                <h3 class="section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    LAN Online Players
                </h3>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Auto-refreshed via SignalR</span>
            </div>
            <ul class="player-list" id="online-players-list">
                <li class="player-item" style="color: var(--text-muted); font-size: 0.9rem;">
                    Connecting to local intranet lobby...
                </li>
            </ul>
        </div>

        <!-- Live Intranet Leaderboard -->
        <div class="glass-panel">
            <div class="section-header">
                <h3 class="section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    Intranet Leaderboard
                </h3>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Session Standings</span>
            </div>
            <div style="overflow-x: auto;">
                <table class="leaderboard-table">
                    <thead>
                        <tr>
                            <th style="width: 44px;">Rank</th>
                            <th>Player</th>
                            <th>Wins</th>
                            <th>Losses</th>
                            <th>Points</th>
                        </tr>
                    </thead>
                    <tbody id="leaderboard-body">
                        <tr>
                            <td colspan="5" style="text-align: center; color: var(--text-muted);">Loading standings...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Matchmaking Waiting Modal -->
    <div id="matchmaking-modal" class="modal-backdrop">
        <div class="modal-box">
            <div class="modal-icon-wrapper">
                <div class="spinner" style="width: 36px; height: 36px; border-width: 4px;"></div>
            </div>
            <h2 class="modal-title" id="mm-title">Searching for Opponent...</h2>
            <p class="modal-text" id="mm-desc">Waiting for another player on this LAN to join matchmaking.</p>
            <button type="button" class="btn btn-outline" id="cancel-matchmaking-btn">Cancel Queue</button>
        </div>
    </div>

    <!-- Upload Game Modal -->
    <div id="upload-game-modal" class="modal-backdrop">
        <div class="modal-box" style="max-width: 540px;">
            <div class="modal-icon-wrapper" style="background: rgba(168, 85, 247, 0.15); border-color: rgba(168, 85, 247, 0.4);">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
            </div>
            <h2 class="modal-title">Upload Custom Game</h2>
            <p class="modal-text">Upload a zipped HTML5/JavaScript game package (<code style="color: #38bdf8;">.zip</code>) containing a <code style="color: #38bdf8;">manifest.json</code> and <code style="color: #38bdf8;">index.html</code>.</p>
            
            <div id="upload-dropzone" style="border: 2px dashed #a855f7; border-radius: 12px; padding: 28px 16px; margin: 16px 0; background: rgba(168, 85, 247, 0.05); cursor: pointer; text-align: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="1.8" style="margin-bottom: 8px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                <div style="font-weight: 700; color: #f8fafc; margin-bottom: 4px;">Drag &amp; Drop .zip package here</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">or click to browse your computer</div>
                <input type="file" id="game-file-input" accept=".zip" style="display: none;" />
            </div>

            <div id="upload-status" style="display: none; margin-bottom: 14px; font-size: 0.9rem; font-weight: 600; text-align: center;"></div>

            <div style="display: flex; gap: 8px; justify-content: space-between; margin-top: 10px; flex-wrap: wrap;">
                <a href="Handlers/CustomGameHandler.ashx?action=downloadTemplate" class="btn btn-outline btn-sm" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download Starter Template
                </a>
                <button type="button" class="btn btn-outline" id="btn-close-upload-modal">Cancel</button>
            </div>
        </div>
    </div>

    <script type="text/javascript">
        $(document).ready(function () {
            window.GameHubClient.init();

            // Load Custom Games dynamically
            loadCustomGames();

            $('.play-bot-btn').on('click', function () {
                var game = $(this).data('game');
                var diff = 'hard';

                if (game === 'ttt') {
                    diff = $('#diff-ttt').val();
                    window.location.href = 'Games/TicTacToe.aspx?diff=' + diff;
                } else if (game === 'c4') {
                    diff = $('#diff-c4').val();
                    window.location.href = 'Games/Connect4.aspx?diff=' + diff;
                } else if (game === 'rps') {
                    diff = $('#diff-rps').val();
                    window.location.href = 'Games/RPS.aspx?diff=' + diff;
                } else if (game === 'airhockey') {
                    diff = $('#diff-airhockey').val();
                    window.location.href = 'Games/AirHockey.aspx?diff=' + diff;
                } else if (game === 'archery') {
                    diff = $('#diff-archery').val();
                    window.location.href = 'Games/Archery.aspx?diff=' + diff;
                } else if (game === 'chess') {
                    diff = $('#diff-chess').val();
                    window.location.href = 'Games/Chess.aspx?diff=' + diff;
                } else if (game === 'speedmath') {
                    var op = $('#op-speedmath').val() || 'mix';
                    diff = $('#diff-speedmath').val() || 'medium';
                    window.location.href = 'Games/SpeedMath.aspx?op=' + op + '&diff=' + diff;
                } else if (game === 'slingpuck') {
                    diff = $('#diff-slingpuck').val() || 'medium';
                    window.location.href = 'Games/SlingPuck.aspx?diff=' + diff;
                } else if (game === 'dots') {
                    var size = $('#size-dots').val() || '4';
                    diff = $('#diff-dots').val() || 'medium';
                    window.location.href = 'Games/DotsAndBoxes.aspx?size=' + size + '&diff=' + diff;
                } else if (game === 'codebreaker') {
                    diff = $('#diff-codebreaker').val() || 'medium';
                    window.location.href = 'Games/Codebreaker.aspx?diff=' + diff;
                } else if (game === 'memorymatrix') {
                    diff = $('#diff-memorymatrix').val() || 'medium';
                    window.location.href = 'Games/MemoryMatrix.aspx?diff=' + diff;
                } else if (game === 'lasermirrors') {
                    var lvl = $('#diff-lasermirrors').val() || '1';
                    window.location.href = 'Games/LaserMirrors.aspx?lvl=' + lvl;
                } else if (game === 'algobot') {
                    var lvl = $('#diff-algobot').val() || '1';
                    window.location.href = 'Games/AlgoBot.aspx?lvl=' + lvl;
                } else if (game === 'wordduel') {
                    var mode = $('#mode-wordduel').val() || 'standard';
                    window.location.href = 'Games/WordDuel.aspx?mode=' + mode;
                } else if (game === 'lightsout') {
                    var mode = $('#mode-lightsout').val() || 'classic';
                    var sz = (mode === 'grandmaster') ? 6 : 5;
                    var m = (mode === 'diag') ? 'diag' : (mode === 'torus' ? 'torus' : 'cross');
                    window.location.href = 'Games/LightsOut.aspx?size=' + sz + '&mode=' + m;
                }
            });

            var activeQueueType = null;

            $('.play-online-btn').on('click', function () {
                var gameType = parseInt($(this).data('type'), 10);
                activeQueueType = gameType;

                var gameNames = { 1: "Tic-Tac-Toe", 2: "Connect 4", 3: "Rock-Paper-Scissors", 4: "Air Hockey", 5: "Archery Clash", 9: "Chess Championship", 10: "Speed Math Arena", 11: "Sling Puck Frenzy", 12: "Dots & Boxes", 13: "Codebreaker", 14: "Memory Matrix", 15: "Laser & Mirrors", 16: "AlgoBot", 17: "Wordle / Word Duel", 18: "Lights Out" };
                $('#mm-title').text('Searching for ' + (gameNames[gameType] || 'Game') + ' Match...');
                $('#matchmaking-modal').addClass('active');

                window.GameHubClient.joinQueue(gameType);
            });

            $('#cancel-matchmaking-btn').on('click', function () {
                if (activeQueueType) {
                    window.GameHubClient.leaveQueue(activeQueueType);
                    activeQueueType = null;
                }
                $('#matchmaking-modal').removeClass('active');
            });

            // Upload Modal Bindings
            $('#btn-open-upload-modal').on('click', function(e) {
                e.preventDefault();
                $('#upload-status').hide();
                $('#upload-game-modal').addClass('active');
            });

            $('#btn-close-upload-modal').on('click', function(e) {
                e.preventDefault();
                $('#upload-game-modal').removeClass('active');
            });

            var $dropzone = $('#upload-dropzone');
            var $fileInput = $('#game-file-input');

            $dropzone.on('click', function() {
                $fileInput.trigger('click');
            });

            $dropzone.on('dragover dragenter', function(e) {
                e.preventDefault();
                e.stopPropagation();
                $dropzone.css('border-color', '#38bdf8').css('background', 'rgba(56, 189, 248, 0.1)');
            });

            $dropzone.on('dragleave drop', function(e) {
                e.preventDefault();
                e.stopPropagation();
                $dropzone.css('border-color', '#a855f7').css('background', 'rgba(168, 85, 247, 0.05)');
            });

            $dropzone.on('drop', function(e) {
                var files = e.originalEvent.dataTransfer.files;
                if (files.length > 0) {
                    uploadZipFile(files[0]);
                }
            });

            $fileInput.on('change', function() {
                if (this.files.length > 0) {
                    uploadZipFile(this.files[0]);
                }
            });

            function uploadZipFile(file) {
                if (!file.name.toLowerCase().endsWith('.zip')) {
                    $('#upload-status').show().css('color', '#f43f5e').text('Error: Please select a valid .zip file.');
                    return;
                }

                $('#upload-status').show().css('color', '#38bdf8').html('Extracting & validating package...');

                var formData = new FormData();
                formData.append('file', file);
                formData.append('action', 'upload');

                $.ajax({
                    url: 'Handlers/CustomGameHandler.ashx',
                    type: 'POST',
                    data: formData,
                    contentType: false,
                    processData: false,
                    success: function(res) {
                        if (res.success) {
                            $('#upload-status').css('color', '#34d399').text('✓ ' + res.message);
                            if (window.App) window.App.toast(res.message, 'success');
                            setTimeout(function() {
                                $('#upload-game-modal').removeClass('active');
                                loadCustomGames();
                            }, 1200);
                        } else {
                            $('#upload-status').css('color', '#f43f5e').text('❌ ' + res.message);
                        }
                    },
                    error: function() {
                        $('#upload-status').css('color', '#f43f5e').text('❌ Server error while uploading.');
                    }
                });
            }

            function loadCustomGames() {
                $.get('Handlers/CustomGameHandler.ashx', { action: 'list' }, function(res) {
                    var $grid = $('#custom-games-grid');
                    var $section = $('#custom-games-section');
                    $grid.empty();

                    if (res && res.games && res.games.length > 0) {
                        $section.show();

                        res.games.forEach(function(g) {
                            var thumbUrl = 'CustomGames/' + g.Id + '/' + (g.Thumbnail || 'icon.svg');
                            var isMp = (g.IsMultiplayer || g.SupportsMultiplayer);
                            var tagHtml = isMp
                                ? '<div class="game-tag" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.3); background: rgba(56, 189, 248, 0.15);">⚡ LAN Multiplayer</div>'
                                : '<div class="game-tag" style="color: #c084fc;">Custom Plugin</div>';

                            var buttonsHtml = '';
                            if (isMp) {
                                buttonsHtml = '<div class="btn-group" style="width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">' +
                                    '<a href="Games/PlayCustom.aspx?game=' + encodeURIComponent(g.Id) + '" class="btn btn-outline btn-sm" style="justify-content: center;">' +
                                        'Play Solo' +
                                    '</a>' +
                                    '<button type="button" class="btn btn-primary btn-sm custom-mp-challenge-btn" data-id="' + g.Id + '" data-title="' + escapeHtml(g.Title) + '" style="background: linear-gradient(135deg, #9333ea, #c084fc); justify-content: center;">' +
                                        'Challenge LAN' +
                                    '</button>' +
                                '</div>';
                            } else {
                                buttonsHtml = '<div class="btn-group" style="width: 100%;">' +
                                    '<a href="Games/PlayCustom.aspx?game=' + encodeURIComponent(g.Id) + '" class="btn btn-primary" style="width: 100%; justify-content: center; background: linear-gradient(135deg, #9333ea, #c084fc);">' +
                                        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
                                        'Play ' + escapeHtml(g.Title) +
                                    '</a>' +
                                '</div>';
                            }

                            var cardHtml = '<div class="game-card" id="card-custom-' + g.Id + '">' +
                                '<div class="game-thumb" style="position: relative;">' +
                                    tagHtml +
                                    '<img src="' + thumbUrl + '" class="game-thumb-svg" style="object-fit: contain; padding: 16px;" onerror="this.src=\'CustomGames/sample-space-dodger/icon.svg\'" />' +
                                '</div>' +
                                '<div class="game-body">' +
                                    '<div style="display: flex; justify-content: space-between; align-items: flex-start;">' +
                                        '<h2 class="game-title">' + escapeHtml(g.Title) + '</h2>' +
                                        '<button type="button" class="btn btn-outline btn-sm delete-custom-game-btn" data-id="' + g.Id + '" data-title="' + escapeHtml(g.Title) + '" title="Uninstall Game" style="color: #f43f5e; border-color: rgba(244, 63, 94, 0.3); padding: 2px 8px; font-size: 0.75rem;">Delete</button>' +
                                    '</div>' +
                                    '<p class="game-desc">' + escapeHtml(g.Description || "Custom HTML5 game.") + '</p>' +
                                    '<div class="game-controls">' +
                                        '<div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 8px;">' +
                                            'By ' + escapeHtml(g.Author || "LAN Developer") + ' (v' + (g.Version || "1.0") + ')' +
                                        '</div>' +
                                        buttonsHtml +
                                    '</div>' +
                                '</div>' +
                            '</div>';

                            $grid.append(cardHtml);
                        });

                        // Bind custom multiplayer challenge buttons
                        $('.custom-mp-challenge-btn').off('click').on('click', function(e) {
                            e.preventDefault();
                            var customId = $(this).data('id');
                            var customTitle = $(this).data('title');
                            
                            // Check if there are other players online
                            var otherPlayers = $('.challenge-btn');
                            if (otherPlayers.length === 0) {
                                if (window.App) window.App.toast("No other players currently online in LAN lobby to challenge.", "warning");
                            } else {
                                if (window.App) window.App.toast("Click 'Challenge' next to any online player below to start " + customTitle + "!", "info");
                                $('html, body').animate({ scrollTop: $('#online-players-list').offset().top - 100 }, 400);
                            }
                        });

                        // Bind delete buttons
                        $('.delete-custom-game-btn').off('click').on('click', function(e) {
                            e.preventDefault();
                            var gameId = $(this).data('id');
                            var title = $(this).data('title');

                            if (confirm("Are you sure you want to delete and uninstall '" + title + "'?")) {
                                $.post('Handlers/CustomGameHandler.ashx', { action: 'delete', id: gameId }, function(delRes) {
                                    if (delRes.success) {
                                        if (window.App) window.App.toast("Game uninstalled successfully.", "info");
                                        loadCustomGames();
                                    } else {
                                        alert("Failed to delete game: " + delRes.message);
                                    }
                                });
                            }
                        });
                    } else {
                        $section.hide();
                    }
                });
            }

            function escapeHtml(text) {
                if (!text) return '';
                return $('<div>').text(text).html();
            }
        });
    </script>
</asp:Content>
