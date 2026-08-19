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
                }
            });

            var activeQueueType = null;

            $('.play-online-btn').on('click', function () {
                var gameType = parseInt($(this).data('type'), 10);
                activeQueueType = gameType;

                var gameNames = { 1: "Tic-Tac-Toe", 2: "Connect 4", 3: "Rock-Paper-Scissors", 4: "Air Hockey", 5: "Archery Clash", 9: "Chess Championship" };
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
                            var cardHtml = '<div class="game-card" id="card-custom-' + g.Id + '">' +
                                '<div class="game-thumb" style="position: relative;">' +
                                    '<div class="game-tag" style="color: #c084fc;">Custom Plugin</div>' +
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
                                        '<div class="btn-group" style="width: 100%;">' +
                                            '<a href="Games/PlayCustom.aspx?game=' + encodeURIComponent(g.Id) + '" class="btn btn-primary" style="width: 100%; justify-content: center; background: linear-gradient(135deg, #9333ea, #c084fc);">' +
                                                '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
                                                'Play ' + escapeHtml(g.Title) +
                                            '</a>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>';

                            $grid.append(cardHtml);
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
