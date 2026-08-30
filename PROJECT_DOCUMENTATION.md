# Game Hub — Complete Project Documentation

> **Environment:** Offline / Intranet (LAN) only. Zero internet dependency.  
> **Platform:** ASP.NET Web Forms · .NET Framework 4.5 · Visual Studio 2015+  
> **Real-Time:** SignalR 2.4.3 (WebSockets / Long-Polling fallback)  
> **Language:** C# (server), JavaScript / jQuery (client), Vanilla CSS  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack & Dependencies](#2-technology-stack--dependencies)
3. [Complete Directory & File Map](#3-complete-directory--file-map)
4. [Architecture Overview](#4-architecture-overview)
5. [Backend — C# Source Files](#5-backend--c-source-files)
6. [Game Pages — Games/ Folder](#6-game-pages--games-folder)
7. [Frontend — Scripts/ Folder](#7-frontend--scripts-folder)
8. [Styling — Content/ Folder](#8-styling--content-folder)
9. [Custom Game Plugin System](#9-custom-game-plugin-system)
10. [Game-by-Game Breakdown](#10-game-by-game-breakdown)
11. [Data Flow & Real-Time Communication](#11-data-flow--real-time-communication)
12. [Leaderboard & Scoring System](#12-leaderboard--scoring-system)
13. [Audio System](#13-audio-system)
14. [Offline / Intranet Deployment](#14-offline--intranet-deployment)
15. [How to Build & Publish](#15-how-to-build--publish)
16. [Adding a New Hardcoded Game (Developer Guide)](#16-adding-a-new-hardcoded-game-developer-guide)
17. [Custom Game Package Specification](#17-custom-game-package-specification)
18. [Known Behaviours & Design Decisions](#18-known-behaviours--design-decisions)

---

## 1. Project Overview

**Game Hub** is a self-hosted, fully offline intranet gaming platform. It provides:

- **18 built-in games** — 15 multiplayer (LAN vs LAN) + 3 single-player high-score games, all with Vs Bot / Solo training modes.
- **Real-time LAN matchmaking** — players on the same network can see each other, challenge each other directly, or join a matchmaking queue.
- **Custom game plugin system** — any developer can package an HTML5 game as a `.zip` file and upload it through the browser UI without redeploying the server.
- **Unified leaderboard** — win/loss/draw records tracked live for all multiplayer games. Per-game high-score boards for single-player games.
- **Zero external dependencies** — no CDN, no internet APIs, no cloud services. Every JS library, CSS file, and font is bundled locally.

---

## 2. Technology Stack & Dependencies

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| Web Framework | ASP.NET Web Forms | 4.5 | Runs on IIS / IIS Express |
| Real-Time Layer | SignalR | 2.4.3 | Auto-negotiates WebSockets → SSE → Long-Poll |
| OWIN Middleware | Microsoft.Owin + SystemWeb | 4.2.2 | Required host for SignalR |
| JSON Serialization | Newtonsoft.Json | 13.0.3 | Used by GameManager, CustomGameService |
| jQuery | jQuery | 3.7.1 | Bundled locally in Scripts/ |
| SignalR JS Client | jquery.signalR | 2.4.3 | Bundled locally in Scripts/ |
| CSS | Vanilla CSS | — | site.css + games.css + animations.css |
| Audio | Web Audio API | — | No audio files — all sounds synthesized in browser |
| ZIP Handling | System.IO.Compression | Built-in (.NET 4.5) | Used by CustomGameService |

All NuGet packages are declared in `packages.config` and their DLLs live in the `bin/` folder. There is **no NuGet restore needed** to run on a new machine — simply copy the project folder.

---

## 3. Complete Directory & File Map

```
e:/Game/
├── PROJECT_DOCUMENTATION.md          <- This file
└── GameHub/                           <- Visual Studio project root
    ├── GameHub.csproj                 <- Project file (references, compile items)
    ├── GameHub.csproj.user            <- Local VS user settings (IIS Express port, etc.)
    ├── packages.config                <- NuGet package declarations
    ├── Startup.cs                     <- OWIN entry point — maps SignalR
    ├── Global.asax                    <- ASP.NET lifecycle hooks (markup)
    ├── Global.asax.cs                 <- Application_Start -> GameManager.Initialize()
    ├── Web.config                     <- IIS/ASP.NET config, assembly bindings
    ├── Site.Master                    <- Shared HTML shell (header, nav, footer)
    ├── Site.Master.cs                 <- Code-behind for master page
    ├── Site.Master.designer.cs        <- Auto-generated designer file
    ├── Default.aspx                   <- Home page / Game Hub lobby
    ├── Default.aspx.cs                <- Code-behind for Default.aspx (minimal)
    ├── Default.aspx.designer.cs       <- Auto-generated
    |
    ├── Models/                        <- Pure C# data model classes
    |   ├── GameType.cs                <- Enums: GameType, PlayerStatus, SessionStatus
    |   ├── Player.cs                  <- Player object (connection ID, name, stats)
    |   ├── GameSession.cs             <- Full session state for every game type
    |   ├── MoveResult.cs              <- Move response + Invite + Leaderboard DTOs
    |   └── CustomGameManifest.cs      <- Plugin manifest schema + score record
    |
    ├── Services/                      <- Core business logic
    |   ├── GameManager.cs             <- Singleton: players, sessions, matchmaking,
    |   |                                 move processing, leaderboards
    |   ├── BotAiService.cs            <- Static class: all bot AI algorithms
    |   └── CustomGameService.cs       <- Singleton: custom game install/list/delete/scores
    |
    ├── Hubs/
    |   └── GameHub.cs                 <- SignalR Hub: all real-time server<->client methods
    |
    ├── Handlers/
    |   ├── CustomGameHandler.ashx     <- HTTP handler registration markup
    |   └── CustomGameHandler.ashx.cs  <- REST-like API: upload/list/delete/score/template
    |
    ├── Games/                         <- Individual game pages
    |   ├── TicTacToe.aspx/.cs         <- Tic-Tac-Toe game page
    |   ├── Connect4.aspx/.cs          <- Connect 4 game page
    |   ├── RPS.aspx/.cs               <- Rock-Paper-Scissors Reflex game page
    |   ├── AirHockey.aspx/.cs         <- Air Hockey game page
    |   ├── Archery.aspx/.cs           <- Archery Clash game page
    |   ├── Chess.aspx/.cs             <- Chess Championship game page
    |   ├── Game2048.aspx/.cs          <- 2048 sliding puzzle (single-player)
    |   ├── BrickBlast.aspx/.cs        <- Brick Breaker (single-player)
    |   ├── KnifeThrow.aspx/.cs        <- Knife Throw (single-player)
    |   └── PlayCustom.aspx/.cs        <- Universal runner for uploaded custom games
    |
    ├── Scripts/                       <- All JavaScript, bundled locally
    |   ├── jquery-3.7.1.min.js        <- jQuery core (self-hosted, no CDN)
    |   ├── jquery.signalR-2.4.3.min.js<- SignalR JS client (self-hosted)
    |   ├── audio.js                   <- GameAudio: Web Audio API synthesiser
    |   ├── app.js                     <- App: profile, toasts, confetti, modals
    |   ├── hub-client.js              <- GameHubClient: SignalR wrapper + lobby UI
    |   ├── tictactoe.js               <- Tic-Tac-Toe UI + bot + multiplayer client
    |   ├── connect4.js                <- Connect 4 UI + bot + multiplayer client
    |   ├── rps.js                     <- RPS UI + bot + multiplayer client
    |   ├── airhockey.js               <- Air Hockey UI + client-side physics + multiplayer
    |   ├── airhockeyPhysics.js        <- Air Hockey physics helpers (collision math)
    |   ├── archery.js                 <- Archery UI + Canvas renderer + multiplayer
    |   ├── archeryPhysics.js          <- Archery ballistics, wind, ring scoring
    |   ├── chess.js                   <- Chess UI + board rendering + multiplayer
    |   ├── chessRules.js              <- Full chess rule engine (legal moves, check, castle,
    |   |                                 en passant, promotion, checkmate, stalemate)
    |   ├── chessBot.js                <- Chess AI (minimax + alpha-beta pruning)
    |   ├── game2048.js                <- 2048 logic + UI + score submission
    |   ├── brickblast.js              <- Brick Blast logic + Canvas rendering
    |   └── knifethrow.js              <- Knife Throw logic + Canvas rendering
    |
    ├── Content/                       <- All CSS, no external fonts or resources
    |   ├── site.css                   <- Global design system: variables, layout, components
    |   ├── games.css                  <- Game-specific styles for all 9 built-in games
    |   └── animations.css             <- Keyframe animations (confetti, pulse, slide, etc.)
    |
    ├── CustomGames/                   <- Hot-drop folder for uploaded game plugins
    |   ├── neon-snake/                <- Example: pre-installed Neon Snake game
    |   |   ├── manifest.json          <- Game metadata
    |   |   ├── index.html             <- Game entry point
    |   |   └── icon.svg               <- Thumbnail shown on hub
    |   ├── sample-space-dodger/       <- Example: pre-installed Space Dodger game
    |   └── NeonSnake.zip              <- ZIP source (reference copy)
    |
    ├── App_Data/                      <- Runtime data files (created automatically)
    |   ├── custom_games.json          <- Registry of all installed custom games
    |   └── custom_scores.json         <- Leaderboard scores for each custom game
    |
    ├── Properties/
    |   └── AssemblyInfo.cs            <- Assembly metadata (version, culture, etc.)
    |
    └── bin/                           <- Compiled output + all NuGet DLLs
        ├── GameHub.dll                <- Project assembly
        ├── GameHub.pdb                <- Debug symbols
        ├── Microsoft.AspNet.SignalR.* <- SignalR server assemblies
        ├── Microsoft.Owin.*           <- OWIN host assemblies
        ├── Newtonsoft.Json.dll        <- JSON library
        └── (other dependencies)
```

---

## 4. Architecture Overview

```
Browser (Player)
    |
    |  HTTP (page requests, CSS, JS)
    |  WebSocket / SignalR (real-time game events)
    |  HTTP POST (custom game ZIP upload)
    v
IIS / IIS Express
    |
    +-- ASP.NET Web Forms (*.aspx pages)
    |       └── Site.Master  <- shared shell loaded on every page
    |
    +-- SignalR Hub  (GameHub.cs)
    |       └── Mapped at /signalr  via Startup.cs -> OWIN pipeline
    |
    +-- HTTP Handler  (CustomGameHandler.ashx)
    |       └── REST-like API for plugin management
    |
    └── Static Files (Scripts/, Content/, CustomGames/)
            └── Served directly by IIS

Server-Side Singletons (in-process, in-memory):
    GameManager.Instance        <- players, sessions, matchmaking queues, leaderboard
    CustomGameService.Instance  <- custom game registry (persisted to App_Data/*.json)
    BotAiService (static)       <- all bot algorithms (no state)
```

**Key design principle:** All multiplayer game state lives in `GameManager`'s in-memory dictionaries (`ConcurrentDictionary`). There is no database. Sessions survive only as long as the IIS worker process is alive. On server restart, sessions are lost but the custom game registry (JSON files in App_Data/) persists.

---

## 5. Backend — C# Source Files

### 5.1 Startup.cs

**Purpose:** OWIN application startup class.

- Decorated with `[assembly: OwinStartup(typeof(GameHub.Startup))]` so ASP.NET picks it up automatically.
- The single `Configuration(IAppBuilder app)` method calls `app.MapSignalR()`, which registers the SignalR hub endpoint at `/signalr`.
- This is the minimal plumbing that makes real-time communication possible.

---

### 5.2 Global.asax / Global.asax.cs

**Purpose:** ASP.NET application lifecycle event handlers.

- `Application_Start`: Calls `GameManager.Instance.Initialize()`. Since `GameManager` is a thread-safe lazy singleton, accessing `.Instance` for the first time creates it. The `Initialize()` method is currently a no-op placeholder, but ensures the singleton is warmed up on first request.
- Other lifecycle methods (`Session_Start`, `Application_Error`, etc.) are present as stubs for future expansion.

---

### 5.3 Web.config

**Purpose:** ASP.NET and IIS configuration.

Key settings:

| Setting | Value | Why |
|---------|-------|-----|
| `owin:AppStartup` | `GameHub.Startup` | Tells OWIN which class to use |
| `compilation debug` | `true` | Enables full debug info |
| `targetFramework` | `4.5` | .NET Framework version |
| `requestValidationMode` | `2.0` | Relaxed; required so SignalR and JSON posts are not blocked |
| `runAllManagedModulesForAllRequests` | `true` | Needed for SignalR to intercept `/signalr/hubs` URL |
| `defaultDocument` | `Default.aspx` | Root URL loads the lobby |
| `directoryBrowse` | `false` | Prevents directory listing |
| Assembly binding redirects | Newtonsoft.Json 13.0, Microsoft.Owin 4.2.2 | Resolves version conflicts |

---

### 5.4 Site.Master / Site.Master.cs

**Purpose:** Shared HTML master page — the outer shell rendered on **every** page.

Renders:
- `<head>`: Loads all 3 CSS files and all global JS files — all from local paths, zero CDN calls.
- **App Header**: Brand logo + "GAME HUB" title, online player counter badge, sound toggle button, profile pill (shows current player name, click to rename).
- **Main Content** (`<asp:ContentPlaceHolder ID="MainContent">`): Where each page injects its content.
- **Footer**: Simple branding footer.
- **`<asp:ContentPlaceHolder ID="HeadContent">`**: For game pages to inject their own page-specific `<script>` tags.

---

### 5.5 Models

#### GameType.cs

Defines three enumerations used everywhere:

```csharp
public enum GameType    { TicTacToe=1, Connect4=2, RPS=3, AirHockey=4, Archery=5, Game2048=6, BrickBlast=7, KnifeThrow=8, Chess=9 }
public enum PlayerStatus { Idle=0, InQueue=1, InGame=2 }
public enum SessionStatus { WaitingForPlayers=0, InProgress=1, Finished=2, Cancelled=3 }
```

The integer values are sent over the wire (JSON) to JavaScript clients, which use the same numeric mapping.

#### Player.cs

Represents a connected player.

| Property | Type | Purpose |
|----------|------|---------|
| `ConnectionId` | string | SignalR connection ID — primary key in `_players` dictionary |
| `PlayerId` | string | Same as ConnectionId (reserved for future persistent identity) |
| `DisplayName` | string | Shown in UI; max 16 chars. Defaults to `Guest_XXXX` if blank |
| `Status` | PlayerStatus | `Idle` -> `InQueue` -> `InGame` |
| `CurrentSessionId` | string | Tracks which session this player is in |
| `QueuedGameType` | GameType? | Set when player joins matchmaking queue |
| `Wins / Losses / Draws` | int | Session-lifetime stats |
| `ConnectedAt / LastActivity` | DateTime | Used to sort online player list |

#### GameSession.cs

The central state object for a single game match. One class carries state for **all** game types (fields unused for irrelevant game types are null/0).

**Common fields:**

| Field | Purpose |
|-------|---------|
| `SessionId` | GUID (32-char hex string) — unique per session |
| `GameType` | Which game is being played |
| `Player1 / Player2` | Player references |
| `CurrentTurnPlayerId` | Connection ID of the player whose turn it is |
| `Status` | `InProgress`, `Finished`, etc. |
| `WinnerPlayerId` | Set when game ends |
| `IsDraw` | Set when game is a draw |
| `Player1WantsRematch / Player2WantsRematch` | Rematch negotiation flags |

**Per-game state fields:**

| Game | Fields |
|------|--------|
| Tic-Tac-Toe | `TicTacToeBoard` (string[9]) |
| Connect 4 | `Connect4Board` (int[6,7]) |
| RPS | `Player1/2CurrentChoice`, `Player1/2Score`, `CurrentRound`, `RpsRoundHistory` |
| Air Hockey | `PuckX/Y/Vx/Vy`, `P1/P2PaddleX/Y`, `Player1/2Score`, `AirHockeyPausedUntil` |
| Archery | `Player1/2ArcheryShots`, `Player1/2Score`, `CurrentRound`, `CurrentWindX/Y` |
| Chess | `ChessFen`, `ChessMoveHistory`, `ChessCapturedWhite/Black`, `ChessDrawOfferedBy` |

**Constants:**
- `AIR_HOCKEY_WIN_SCORE = 7`
- `ARCHERY_TOTAL_ROUNDS = 5`
- `DEFAULT_CHESS_FEN` — standard starting position FEN

The constructor calls `InitBoard()` which sets the appropriate game-specific initial state for the `GameType`.

**`ResetAirHockeyPuck(scoredByPlayer)`:** Resets puck to center (400,240) with a random angle. Direction favors the team that just conceded.

**`GenerateRandomWind()`:** Returns a float in [-4.0, +4.0] for archery wind speed.

#### MoveResult.cs

Three classes in this file:

**`MoveResult`** — Returned by every move-processing method and sent to all clients in a session:

| Field | Purpose |
|-------|---------|
| `Success` | Whether the move was accepted |
| `Message` | Error message if `Success = false` |
| `IsGameOver` | Whether this move ended the game |
| `IsDraw` | Whether the game ended as a draw |
| `WinnerPlayerId` | Connection ID of winner |
| `NextTurnPlayerId` | Connection ID of who moves next |
| `WinningLine` | List of cell indices forming the winning line |
| `ExtraData` | Object for game-specific payload (e.g., full archery shot data) |

**`InviteRequest`** — Represents a direct game challenge:

| Field | Purpose |
|-------|---------|
| `InviteId` | Unique GUID |
| `FromPlayer / ToPlayer` | Player references |
| `GameType` | Which game was selected |
| `CreatedAt` | Timestamp |

**`LeaderboardEntry`** — A computed leaderboard row:

| Field | Notes |
|-------|-------|
| `Wins / Losses / Draws / TotalGames` | Raw counts |
| `WinRate` | `Wins / TotalGames * 100`, rounded to 1 decimal |
| `Points` | `(Wins x 3) + (Draws x 1)` — sorting key |

#### CustomGameManifest.cs

**`CustomGameManifest`** — metadata for an installed plugin game:

| Field | Purpose |
|-------|---------|
| `Id` | URL-safe slug (e.g., `neon-snake`). Sanitized before use |
| `Title` | Display name shown on hub |
| `Description` | Short description for game card |
| `Author` | Creator name |
| `Version` | Semantic version string |
| `Thumbnail` | Relative path to image within game folder (e.g., `icon.svg`) |
| `Entry` | Entry HTML file (e.g., `index.html`) |
| `Category` | Display tag (e.g., `Arcade`, `Puzzle`, `Action`) |
| `SupportsLeaderboard` | If `true`, score calls are wired to leaderboard |
| `InstalledAt` | UTC timestamp |
| `DirectoryPath` | Absolute server path to game folder (not sent to client) |
| `RelativeUrl` | Web-accessible path (e.g., `CustomGames/neon-snake/index.html`) |

**`CustomGameScoreRecord`** — a single leaderboard entry:
```csharp
{ PlayerName, Score (int), AchievedAt (DateTime) }
```

---

### 5.6 Services

#### GameManager.cs

**Pattern:** Thread-safe Singleton (`Lazy<GameManager>`)  
**Role:** The central brain of the server. All game state lives here.

**Internal data structures:**

| Field | Type | Contents |
|-------|------|----------|
| `_players` | `ConcurrentDictionary<string, Player>` | All connected players, keyed by ConnectionId |
| `_sessions` | `ConcurrentDictionary<string, GameSession>` | All active game sessions, keyed by SessionId |
| `_matchQueues` | `ConcurrentDictionary<GameType, ConcurrentQueue<string>>` | Per-game FIFO matchmaking queues |
| `_invites` | `ConcurrentDictionary<string, InviteRequest>` | Pending direct challenge invites |
| `_leaderboard` | `ConcurrentDictionary<string, LeaderboardEntry>` | Global win/loss/draw board keyed by DisplayName |
| `_leaderboard2048` | `List<Score2048Record>` | Top-50 2048 scores |
| `_leaderboardBrickBlast` | `List<ScoreBrickBlastRecord>` | Top-50 Brick Blast scores |
| `_leaderboardKnifeThrow` | `List<ScoreKnifeThrowRecord>` | Top-50 Knife Throw scores |

**Player & Presence Methods:**
- `RegisterPlayer(connectionId, displayName)` — AddOrUpdates the player; ensures a `LeaderboardEntry` exists for the display name.
- `GetPlayer(connectionId)` — Looks up by connection ID.
- `GetOnlinePlayers()` — Returns all players sorted by most-recent activity.
- `RemovePlayer(connectionId)` — Removes on disconnect.

**Matchmaking & Invites Methods:**
- `EnqueuePlayer(connectionId, gameType, out bool matched)` — Tries to dequeue an existing waiter; if found, creates a session and returns `matched = true`. If no match, enqueues the player. Uses `_matchmakingLock` to prevent race conditions.
- `DequeuePlayer(connectionId, gameType)` — Sets player status back to `Idle` when they cancel the queue.
- `CreateInvite / GetInvite / RemoveInvite` — CRUD for direct challenge invites.

**Session Management Methods:**
- `CreateSession(gameType, p1, p2)` — Creates a `GameSession`, stores it, updates both players' statuses to `InGame`.
- `GetSession(sessionId)` — Simple dictionary lookup.
- `GetOrCreateSession(...)` — **Key resilience method.** If a player navigates to a game page with a `?session=` parameter but the session no longer exists (e.g., server restarted), this recreates a skeleton session so the page doesn't crash. Then calls `UpdateSessionPlayerConnection`.
- `UpdateSessionPlayerConnection(session, connectionId, playerName)` — Attempts to match the incoming connection to either Player1 or Player2 by ConnectionId first, then by DisplayName, then by empty slot. Updates `CurrentTurnPlayerId` when necessary.
- `RemoveSession(sessionId)` — Removes session and sets both players back to Idle.

**Game Move Processing Methods:**
- `ProcessTicTacToeMove` — Validates turn, validates cell empty, applies symbol, checks win, checks draw (all cells filled), toggles turn.
- `ProcessConnect4Move` — Validates column, drops disc via gravity, checks win, checks draw (no valid columns).
- `ProcessRPSChoice` — Records choice. When both have chosen, resolves the round, updates scores, checks if either player has 3 wins (best of 5).
- `RequestRematch` — Sets `PlayerXWantsRematch = true`. If both want rematch, calls `session.InitBoard()`.
- `ForfeitSession` — Marks session Finished and awards win to the other player.
- `RecordGameResult` — Updates both `Player` objects and `_leaderboard`.
- `GetLeaderboard()` — Returns top 20 entries sorted by Points desc, then Wins desc.

**Air Hockey Physics (TickAirHockey):**
- Applies friction (0.993× per frame) to puck velocity
- Moves puck by velocity
- Calls `ResolvePaddleCollision` for each paddle
- Bounces off top/bottom walls with 0.96× coefficient of restitution
- Goal zones are between Y=150 and Y=330 on left/right walls
- Checks win condition (7 goals)

**`ResolvePaddleCollision`:**
- Computes distance between puck and paddle center
- If within combined radii (puck=18, paddle=32 → threshold=50 px), separates them and reflects puck velocity with a 1.05× speed boost
- Caps speed at 26 px/frame; enforces minimum 4 px/frame

**Single-player Leaderboard Methods:**
Each game has `GetXLeaderboard()` (returns top-10) and `SaveXScore()` (appends, sorts, trims to top-50 in memory).

---

#### BotAiService.cs

**Pattern:** `public static class` — no state, pure functions  
**Role:** All bot AI and game utility logic.

**Tic-Tac-Toe:**
- `GetTicTacToeMove(board, botSymbol, humanSymbol, difficulty)` — Returns cell index.
  - `easy`: 75% random, 25% minimax
  - `normal`: 40% random, 60% minimax
  - `hard`: 100% minimax (unbeatable)
  - Plays center (index 4) as opening move on empty board
- `MinimaxScore` — Classic minimax with depth penalty (favors faster wins)
- `CheckTicTacToeWinner` — Checks all 8 winning lines
- `GetTicTacToeWinningLine` — Returns the 3 winning cell indices

**Connect 4:**
- `GetConnect4Move(flatBoard, botPlayer, humanPlayer, difficulty)` — Returns column index
  - `easy`: mostly random
  - `normal`: 60% minimax
  - `hard`: full minimax with alpha-beta pruning
- `DropDisc(board, column, player)` — Finds lowest empty row, places disc, returns row
- `CheckConnect4Win` — Checks horizontal, vertical, two diagonals for 4-in-a-row
- `GetConnect4WinningCells` — Returns flat cell indices of the 4 winning discs
- `GetValidConnect4Columns` — Returns list of non-full column indices

**Rock-Paper-Scissors:**
- `GetRPSMove(history, difficulty)` — Returns `"rock"`, `"paper"`, or `"scissors"`
  - `easy`: random
  - `normal`: frequency analysis with some randomness
  - `hard`: pure frequency analysis (counters opponent's most-used choice)
- `DetermineRPSWinner(p1, p2)` — Returns `0` (draw), `1` (P1 wins), `2` (P2 wins)

**Archery:**
- `CalculateArcheryShot(aimX, aimY, power, windX, windY)` — Returns `ArcheryShotResult`:
  - `HitX/HitY` — Landing position after wind drift
  - `Distance` — Pixels from bullseye center
  - `Score` — Points based on ring hit (10=X-ring/bullseye, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0=miss)
  - `RingName / RingColor / IsBullseye / IsXRing` — Display metadata
  - `FlightTime` — Animation duration hint

---

#### CustomGameService.cs

**Pattern:** Thread-safe Singleton (`Lazy<CustomGameService>`)  
**Role:** Manages the lifecycle of custom game plugins.

**Storage:**
- `~/CustomGames/` — One subfolder per installed game (e.g., `CustomGames/neon-snake/`)
- `~/App_Data/custom_games.json` — JSON registry: `Dictionary<string, CustomGameManifest>`
- `~/App_Data/custom_scores.json` — JSON scores: `Dictionary<string, List<CustomGameScoreRecord>>`

**Constructor:**
1. Resolves absolute paths for `CustomGames/` and `App_Data/`
2. Creates directories if missing
3. Calls `LoadRegistry()` — reads `custom_games.json` into `_registry`
4. Calls `LoadScores()` — reads `custom_scores.json` into `_scores`
5. Calls `ScanAndSyncDirectories()` — walks `CustomGames/` and registers any game folder with `manifest.json` that isn't already in the registry

**`InstallGameFromZip(zipStream, out error, out manifest)`:**
1. Extracts ZIP to a temp folder (`%TEMP%\GameHub_Upload_GUID\`)
2. **Zip Slip protection:** Every entry path is fully resolved and checked to remain within the temp directory
3. Looks for `manifest.json` at zip root; if not found, checks one level down (supports ZIPs where content is in a subfolder)
4. Parses and validates manifest — requires `Title` at minimum
5. Sanitizes `Id` using `SanitizeId()` — lowercase, only `a-z 0-9 - _`
6. Validates that the `Entry` file exists
7. Moves content to `CustomGames/<id>/` (overwrites if exists)
8. Updates registry and saves `custom_games.json`
9. Cleans up temp folder in `finally` block

**`ScanAndSyncDirectories()`:** Called on startup. Recovers game registrations from physical folder structure.

**`SanitizeId(input)`:** Lowercases, replaces non-`[a-z0-9\-_]` with `-`, collapses hyphens, trims.

**`DeleteGame(gameId)`:** Removes from registry, saves JSON, deletes physical folder.

**`SaveScore / GetLeaderboard`:** Per-game score persistence. Scores are saved to JSON immediately; retrieval returns top-20 sorted by score desc.

---

### 5.7 Hubs — GameHub.cs

**Base class:** `Microsoft.AspNet.SignalR.Hub`  
**Role:** The single real-time communication endpoint. Every method is callable from the browser via `hub.server.methodName(...)`. Every `Clients.*` call pushes data to browsers.

**Connection Lifecycle:**
- `OnConnected()` — No-op (override for logging if needed).
- `OnDisconnected(stopCalled)` — Removes player, broadcasts updated player list and leaderboard.
- `Register(displayName)` — Registers player, adds to `"lobby"` group, broadcasts updated lists.

**Matchmaking & Direct Challenges:**
- `JoinMatchmaking(gameTypeVal)` — Calls `Manager.EnqueuePlayer`. If matched, adds both players to `session_<id>` group and broadcasts `matchFound`. If not matched, returns `queueJoined`.
- `LeaveMatchmaking(gameTypeVal)` — Dequeues player, sends `queueLeft` to caller.
- `SendInvite(targetConnectionId, gameTypeVal)` — Creates invite, sends `inviteReceived` to target and `inviteSent` to sender.
- `AcceptInvite(inviteId)` — Creates session, adds both to group, sends `matchFound` to both.
- `DeclineInvite(inviteId)` — Removes invite, sends `inviteDeclined` to original sender.

**In-Session Methods:**
- `JoinSession(sessionId, playerName, gameTypeVal, p1Name, p2Name)` — Uses `GetOrCreateSession` for resilience. Sends complete `sessionState` snapshot to caller (all board data, scores, who is P1/P2, whose turn) and broadcasts `opponentEnteredSession` to others.
- `MakeTicTacToeMove(sessionId, cellIndex)` — Delegates to `Manager.ProcessTicTacToeMove`, broadcasts `ticTacToeMoveMade`.
- `MakeConnect4Move(sessionId, column)` — Delegates, broadcasts `connect4MoveMade`.
- `MakeRPSChoice(sessionId, choice)` — Delegates. If both players have chosen, broadcasts `rpsRoundCompleted`; otherwise broadcasts `rpsChoiceLocked` to caller and `opponentReady` to opponent.
- `UpdateAirHockeyPaddle / AirHockeyPuckHit / AirHockeySyncPuck` — Relay paddle and puck events to opponent only (`OthersInGroup`). Air Hockey is client-authoritative.
- `AirHockeyGoalScored` — Relays to group; if win condition met, marks session Finished and broadcasts leaderboard update.
- `ShootArcheryArrow(sessionId, aimX, aimY, power)` — Delegates to `Manager.ProcessArcheryShot`, broadcasts `archeryShotTaken` with full shot result.

**Chess Methods:**
- `MakeChessMove(sessionId, fromSq, toSq, promotion, fen, san, isCheck, isCheckmate, isDraw, capturedPiece)` — Validates turn ownership, stores new FEN + SAN + captured piece, toggles `CurrentTurnPlayerId`, broadcasts `chessMoveMade`.
- `OfferChessDraw(sessionId)` — Stores who offered, sends `drawOfferReceived` to opponent.
- `RespondChessDraw(sessionId, accept)` — If accepted, ends game as draw; if declined, sends `drawOfferDeclined`.
- `ResignChess(sessionId)` — Ends game, awards win to opponent, broadcasts `chessGameOver`.

**Universal Methods:**
- `RequestRematch(sessionId)` — If both players agree, broadcasts `rematchStarted`; otherwise broadcasts `rematchRequested`.
- `LeaveGame(sessionId)` — Forfeits session, broadcasts `opponentLeft`, removes session.
- `SendGameReaction(sessionId, message)` — Relays emoji/text reaction to opponent.

**Bot AI Hub Methods:**
- `GetBotMoveTicTacToe / GetBotMoveConnect4 / GetBotMoveRPS` — Server-side AI called when playing vs bot (fallback; JS also has local AI).

---

### 5.8 Handlers — CustomGameHandler

**Type:** `IHttpHandler` (synchronous), `IsReusable = true`  
**URL:** `/Handlers/CustomGameHandler.ashx?action=<action>`

| `action` | Method | Behaviour |
|----------|--------|-----------|
| `upload` | POST multipart | Receives `.zip`, calls `CustomGameService.InstallGameFromZip()`, returns JSON |
| `list` | GET | Returns all installed custom games as JSON |
| `delete` | GET/POST `?id=` | Deletes game by ID |
| `submitscore` | POST `gameId, playerName, score` | Records score for a custom game |
| `getscores` | GET `?id=` | Returns top-20 scores for a game |
| `downloadtemplate` | GET | Generates and streams a working `.zip` template game |

**`HandleDownloadTemplate`:** Programmatically creates a ZIP in memory containing:
1. `manifest.json` — sample metadata
2. `icon.svg` — blue SVG thumbnail
3. `index.html` — fully working click-the-target game demonstrating `window.parent.GameHubBridge.submitScore(score)`

---

## 6. Game Pages — Games/ Folder

Each game consists of:
- `GameName.aspx` — HTML/ASPX markup, inherits `Site.Master`
- `GameName.aspx.cs` — Code-behind (sets `Page.Title`, minimal logic)
- `GameName.aspx.designer.cs` — Auto-generated by VS

Each page loads its specific JS file via the `HeadContent` placeholder.

### Game Page Summary

| Page | Script(s) loaded | Mode | Notes |
|------|-----------------|------|-------|
| `TicTacToe.aspx` | `tictactoe.js` | Vs Bot, Online | 3x3 grid |
| `Connect4.aspx` | `connect4.js` | Vs Bot, Online | 6x7 grid |
| `RPS.aspx` | `rps.js` | Vs Bot, Online | Best of 5 rounds |
| `AirHockey.aspx` | `airhockey.js`, `airhockeyPhysics.js` | Vs Bot, Online | Canvas real-time physics |
| `Archery.aspx` | `archery.js`, `archeryPhysics.js` | Vs Bot, Online | Turn-based, 5 rounds, wind |
| `Chess.aspx` | `chess.js`, `chessRules.js`, `chessBot.js` | Vs Bot, Online | Full ruleset, board flip |
| `Game2048.aspx` | `game2048.js` | Single-player | Tile sliding |
| `BrickBlast.aspx` | `brickblast.js` | Single-player | Canvas ball+paddle |
| `KnifeThrow.aspx` | `knifethrow.js` | Single-player | Canvas timing game |
| `PlayCustom.aspx` | None (iframe) | Single-player | Universal plugin runner |

### PlayCustom.aspx / PlayCustom.aspx.cs

**Code-behind logic:**
1. Reads `?game=<id>` from query string
2. Calls `CustomGameService.Instance.GetGame(id)` — if not found, redirects to `Default.aspx`
3. Sets `Page.Title` to `"<GameTitle> - Game Hub"`
4. Exposes `GameUrl` (resolved absolute URL to game's entry file) to ASPX markup

**ASPX markup:**
- Shows game title, description, author, version, category
- Renders a full-screen `<iframe>` pointed at `GameUrl`
- Injects `window.GameHubBridge` into the parent page:
  ```javascript
  window.GameHubBridge = {
      submitScore: function(score) { /* POST to CustomGameHandler */ },
      getPlayerName: function() { return App.getPlayerName(); }
  };
  ```

Custom games call `window.parent.GameHubBridge.submitScore(score)` to record scores.

---

## 7. Frontend — Scripts/ Folder

### audio.js — GameAudio

**Technology:** Web Audio API — **no audio files, all sounds synthesized**

| Method | Sound |
|--------|-------|
| `playClick()` | Short 800Hz square wave click |
| `playMove()` | Two-tone blip (C5->E5) |
| `playWin()` | Ascending arpeggio (C5->E5->G5->C6) |
| `playLoss()` | Descending tone |
| `playTick()` | Soft tick |
| `toggleMute()` | Toggles mute state, stored in `localStorage` |

Mute state persists via `localStorage.gamehub_muted`.

---

### app.js — App

**Responsibilities:**
- **Profile management:** Reads player name from `localStorage.gamehub_player_name`. Default: `Player_XXXX`. Clicking the header profile pill opens a `prompt()` to rename. Name is synced to SignalR hub via `GameHubClient.register()`.
- **Sound toggle button:** Wires the header sound button to `GameAudio.toggleMute()`.
- **Toast notifications (`App.toast(message, type)`):** Creates styled toasts appended to `#toast-container`. Types: `info`, `success`, `warning`, `error`. Auto-removed after 3.5 seconds.
- **Confetti (`App.spawnConfetti()`):** Spawns 55 CSS-animated colored pieces on game win.
- **Game Result Modal (`App.showGameModal(options)`):** Shows a modal with win/draw/loss icon, title, message, "Rematch" button, and "Game Hub" return link.

---

### hub-client.js — GameHubClient

**`init(onSetupHandlers, onReady)`:**
1. Gets the `$.connection.gameHub` proxy
2. Wires default broadcast receivers: `updateOnlinePlayers`, `updateLeaderboard`, `matchFound`, `inviteReceived`, etc.
3. Calls `onSetupHandlers(hub)` — game pages register their own `hub.client.*` handlers BEFORE the connection starts (required by SignalR)
4. Calls `$.connection.hub.start()`; on success registers player name and calls `onReady(connectionId)`
5. On failure shows "Running in offline bot mode" toast

**`onUpdateOnlinePlayers(players)`:** Renders `#online-players-list` sidebar. Shows avatar letter, name, status badge (`Lobby` / `Queued (Game)` / `In Game`). For Idle players, shows "Challenge" button.

**`openChallengeSelectModal(targetId, targetName)`:** Shows a modal with buttons for each multiplayer game type. Clicking calls `hub.server.sendInvite(targetId, gameType)`.

**`onUpdateLeaderboard(entries)`:** Renders `#leaderboard-body` table rows with rank badges (gold/silver/bronze for top 3), wins, losses, points, win rate.

**`onMatchFound(matchData)`:** Plays win sound, shows toast, after 600ms redirects to the correct game page URL with `?session=<id>&p1=<name>&p2=<name>`.

**`onInviteReceived(inviteData)`:** Shows a modal with challenger's name and game type. "Accept" calls `hub.server.acceptInvite(inviteId)`. "Decline" calls `hub.server.declineInvite(inviteId)`.

---

### chessRules.js

**Role:** Complete chess rule engine running entirely in the browser.

**Rules implemented:**
- Legal move generation for all 6 piece types
- Pawn forward one/two squares, diagonal capture, en passant
- Castling (kingside + queenside) with all legality conditions:
  - King and rook must not have moved (`castlingRights` in FEN)
  - Squares between must be empty
  - King must not be in check before, during, or after castling
- Check detection: move only legal if king is not in check after
- Checkmate: no legal moves + king in check
- Stalemate: no legal moves + king not in check
- Fifty-move rule and insufficient material draws
- FEN parsing and generation (for state sync between players)
- SAN move notation generation (e.g., `Nxf3+`)

---

### chessBot.js

**Algorithm:** Minimax with Alpha-Beta pruning

| Level | Depth | Notes |
|-------|-------|-------|
| Easy | 1 | Single-ply, mostly random with slight preference for captures |
| Normal | 2 | Two-ply minimax |
| Hard | 3-4 | Full alpha-beta, piece-square tables for positional evaluation |

**Evaluation:** Material values (Queen=9, Rook=5, Bishop/Knight=3, Pawn=1) + piece-square bonus tables for positional play.

---

### chess.js

**Responsibilities:**
- Renders 8×8 HTML board with piece Unicode characters
- Click-to-select then click-to-move: first click selects piece (shows legal move dots), second click on highlighted square submits move
- Automatically flips board 180° for Black player in multiplayer; manual "Flip Board" button available
- Pawn promotion dialog: shows Queen/Rook/Bishop/Knight choice before submitting
- Move history panel with SAN notation
- Captured pieces panel
- Draw offer / resign buttons
- In multiplayer: calls `hub.server.makeChessMove(...)` and listens for `hub.client.chessMoveMade`, `chessGameOver`, `drawOfferReceived`
- In bot mode: after human move, calls `chessBot.getBotMove()` with the current position and applies result with 400ms delay

---

### airhockey.js / airhockeyPhysics.js

**Physics model:** Client-authoritative with server relay:
- Each client runs its own physics simulation
- Player 1 (host) periodically broadcasts puck position to sync both clients
- Paddle positions are sent via `hub.server.updateAirHockeyPaddle()` and relayed to opponent
- Goal detection is client-side; `hub.server.airHockeyGoalScored()` records the official score
- Bot AI moves paddle toward predicted puck position

---

### archery.js / archeryPhysics.js

**Fully server-authoritative shot calculation:**
1. Player aims (drag-to-aim on canvas) and sets power (hold-to-charge)
2. `hub.server.shootArcheryArrow(sessionId, aimX, aimY, power)` called
3. `Manager.ProcessArcheryShot` runs `BotAiService.CalculateArcheryShot` with wind drift
4. `archeryShotTaken` broadcast to both clients who animate the arrow flight
5. Wind changes after each full round

---

## 8. Styling — Content/ Folder

### site.css

Global design system:

- **CSS Custom Properties:** `--bg-primary`, `--bg-secondary`, `--bg-card`, `--accent-cyan`, `--accent-purple`, `--text-primary`, `--text-muted`, and more — all colours defined once here.
- **Reset & base styles:** body background, font stack.
- **Layout:** `.app-container` (centred, max-width), `.app-header`, `.main-content`, `.app-footer`.
- **Cards:** `.card`, `.game-card` with glassmorphism backgrounds.
- **Buttons:** `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-sm` with hover/active transitions.
- **Modals:** `.modal-backdrop`, `.modal-box` with backdrop blur and slide-up animation.
- **Online player list:** `.player-item`, `.player-status-badge`, `.status-idle`, `.status-queue`, `.status-ingame`.
- **Leaderboard:** `.leaderboard-table`, `.rank-badge` (gold/silver/bronze).
- **Toasts:** `.toast`, `.toast-info/.success/.warning/.error`.
- **Profile pill:** `.profile-pill`, `.profile-avatar`.
- **Custom dark scrollbar.**

### games.css

Game-specific styles for all 9 built-in games:
- Tic-Tac-Toe: `.ttt-board`, `.ttt-cell`, `.cell-x`, `.cell-o`, winning line animation
- Connect 4: `.c4-board`, `.c4-cell`, `.disc-p1`, `.disc-p2`, drop animation
- RPS: `.rps-choice-btn`, choice reveal animation
- Air Hockey: Canvas wrapper, score display
- Archery: Target rings, wind indicator, power bar, arrow trail
- Chess: `.chess-board`, `.chess-square`, `.chess-piece`, legal-move dots, selected square highlight, promotion modal
- 2048: `.grid-2048`, `.tile`, per-tile colour mapping (2 through 2048+)
- Brick Blast, Knife Throw: Canvas styles
- Custom game runner: iframe wrapper, game info header

### animations.css

CSS `@keyframes` for:
- `confetti-fall` — confetti pieces fall with rotation
- `slide-up` — modal entrance
- `fade-in` — general fade
- `pulse` — pulsing glow for selected/active elements
- `spin` — loading spinner
- `bounce` — button press
- `disc-drop` — Connect 4 disc falling

---

## 9. Custom Game Plugin System

### End-to-End Flow

```
Developer creates game as HTML/CSS/JS
         |
         v
Package as ZIP with manifest.json + index.html + icon
         |
         v
Admin visits Default.aspx -> clicks "Upload Game"
         |
         v
Upload modal -> select .zip -> POST to CustomGameHandler.ashx?action=upload
         |
         v
CustomGameService.InstallGameFromZip():
  - Validates ZIP (Zip Slip protection)
  - Validates manifest.json
  - Moves files to ~/CustomGames/<id>/
  - Updates App_Data/custom_games.json
         |
         v
Default.aspx dynamically loads game cards via
fetch('/Handlers/CustomGameHandler.ashx?action=list')
         |
         v
Player clicks game card -> /Games/PlayCustom.aspx?game=<id>
         |
         v
PlayCustom.aspx.cs reads manifest, resolves GameUrl
         |
         v
<iframe src="~/CustomGames/<id>/index.html">
         |
         v
Game runs. Calls window.parent.GameHubBridge.submitScore(score)
         |
         v
Bridge POSTs to CustomGameHandler.ashx?action=submitscore
         |
         v
Score stored in App_Data/custom_scores.json
```

### Security

- **Zip Slip attack prevention:** Every ZIP entry path verified to remain within temp directory.
- **ID sanitization:** Game IDs are lowercased and stripped of all non-alphanumeric characters before use as folder names.
- **Iframe sandbox:** Custom games run in an iframe, sandboxed from parent page JS. Communication only via `window.parent.GameHubBridge`.
- **No server-side code execution:** Custom games are pure static HTML/CSS/JS.

### Pre-installed Example Games

| Game | ID | Location |
|------|----|---------|
| Neon Snake | `neon-snake` | `CustomGames/neon-snake/` |
| Sample Space Dodger | `sample-space-dodger` | `CustomGames/sample-space-dodger/` |

---

## 10. Game-by-Game Breakdown

### Tic-Tac-Toe
- **Board:** 3×3 (9 cells, indices 0–8)
- **Win condition:** 3 in a row (8 possible lines)
- **Bot:** Minimax — unbeatable on Hard
- **Multiplayer:** Fully server-authoritative

### Connect 4
- **Board:** 6 rows × 7 columns
- **Win condition:** 4 consecutive discs (H/V/diagonal)
- **Disc drop:** Gravity — fills lowest empty row in column
- **Bot:** Alpha-beta minimax on Hard

### Rock-Paper-Scissors Reflex
- **Format:** Best of 5 (first to 3 wins)
- **Simultaneous selection:** Both choose before results revealed
- **Bot:** Frequency-analysis AI on Hard
- **Multiplayer:** Server collects both choices then resolves round

### Air Hockey
- **Canvas:** 800×480 px
- **Physics:** Puck velocity + friction (0.993x per frame), circle-circle paddle collisions
- **Goal zones:** Y=150 to Y=330 on left/right walls
- **Win:** First to 7 goals
- **Multiplayer:** Peer-relay physics (client-authoritative)
- **Bot:** Tracks puck Y and moves paddle to intercept

### Archery Clash
- **Format:** 5 rounds, both players shoot each round; highest total score wins
- **Target:** Concentric rings — X-ring (10), Gold (10), Red (9), Blue (8,7), Black (6,5), White (4,3,2,1), Miss (0)
- **Wind:** Random X and Y component, changes each round, shown with indicator
- **Shot calculation:** Server-side — wind drift applied proportionally to power
- **Multiplayer:** Strict turn-based, server enforces whose turn it is

### 2048
- **Grid:** 4×4, tiles with powers of 2
- **Controls:** Arrow keys or WASD
- **Win tile:** 2048 (game continues)
- **Score:** Sum of all merged tile values
- **High-score:** Submitted on game end; shown in leaderboard panel

### Brick Blast
- **Type:** Breakout-style ball-and-paddle
- **Levels:** Brick rows; difficulty increases each level
- **Score:** Points per brick × level multiplier

### Knife Throw
- **Type:** Timing/precision — throw knives at rotating log without hitting existing knives
- **Controls:** Click/tap to throw
- **Score:** Successful throws per level; rotation speed increases

### Chess Championship
- **Board:** Standard 8×8
- **Rules:** Full FIDE ruleset:
  - All piece legal move generation
  - Check, checkmate, stalemate
  - Castling (K and Q side, all legality conditions)
  - En passant
  - Pawn promotion (player chooses piece)
  - Fifty-move rule, insufficient material draw
- **State sync:** FEN string persisted in `GameSession.ChessFen`
- **Move history:** SAN notation in `ChessMoveHistory`
- **Captured pieces:** Tracked per side
- **Draw offer / Resign:** With confirmation dialogs
- **Board flip:** Black player auto-flipped; manual button available
- **Bot:** Minimax + alpha-beta + piece-square tables; 3 difficulty levels

### Speed Math Arena
- **Type:** Rapid-fire arithmetic reaction duel & mental math training
- **Operations:** Addition, Subtraction, Multiplication, Division, and Mixed All-Operations
- **Difficulty:** Easy (1-digit / basic math), Medium (2-digit arithmetic), Hard (Algebraic mental sprints)
- **Mechanics:** 60-second synchronized timer, streak multipliers, instant input validation, live opponent score telemetry radar
- **Multiplayer:** Both players receive identical equation sequence via deterministic seed

### Sling Puck Frenzy
- **Type:** 2D physics wooden tabletop fast-track puck duel
- **Physics Engine:** Rigid-body circle collisions, elastic bungee cords with quadratic tension recoil, rounded slot bumpers
- **Goal:** Clear your home arena by slinging all 5 pucks through the narrow center divider slot into the opponent's zone
- **Multiplayer:** Bidirectional impulse broadcasting (`{ action: 'shoot' }`), live drag coordinate sync, and host physics reconciliation
- **Bot AI:** Aim prediction targeting open gate slots with dynamic charge power

### Dots & Boxes Championship
- **Type:** Classic graph-theoretic territory capture & combinatorics strategy
- **Grid Options:** 3×3 (9 boxes), 4×4 (16 boxes), 5×5 (25 boxes)
- **Mechanics:** Magnetic edge snapping, neon laser beam line drawing, box completion detections, chain combo bonuses (`🔥 EXTRA TURN!`)
- **Multiplayer:** Fully server-authoritative turn-based state machine with box ownership grids
- **Bot AI:** Minimax evaluation avoiding 3-sided sacrifice boxes and maximizing capture streaks

### Codebreaker: Cyber Cipher (Mastermind)
- **Type:** Deductive logic & codebreaking cipher puzzle
- **Palette:** 6 to 8 vibrant cyber gems (Ruby, Sapphire, Emerald, Solar Yellow, Amethyst, Pearl White, Tangerine, Pink)
- **Clues:** 🔴 Exact Key (correct color & correct slot), ⚪ Color Key (correct color in different slot), ⬛ Empty (no match)
- **Matching Algorithm:** Two-pass multi-instance frequency matching (prevents double-counting duplicate colors)
- **Modes:** Easy (4 slots, no duplicates, 10 tries), Medium (4 slots, standard, 9 tries), Hard (5 slots, 8 colors, 8 tries)
- **Multiplayer:** Simultaneous secret cipher sprint with live opponent row telemetry radar; automatic cipher reveal on match completion

### Memory Matrix: Cyber Recall
- **Type:** Visual working memory & spatial mental rotation
- **Grid Scaling:** Dynamic matrix scaling from 3×3 (3 nodes) up to 6×6 (12 nodes)
- **Transformations:** 90° and 180° spatial rotation transforms between memorization flash phase and dark recall phase
- **Mechanics:** 3 Neural Shields (Lives), speed bonus precision scoring, combo streak multipliers, missed node highlight reveals
- **Multiplayer:** Simultaneous sudden-death neural showdown with live shield and stage telemetry

### Laser & Mirrors: Photon Flow
- **Type:** Spatial logic & optical raytracing puzzle
- **Optics Engine:** Real-time continuous 2D raycasting with multi-pass neon bloom on HTML5 Canvas
- **Elements:**
  - Laser Emitters (North, South, East, West with wavelength hues)
  - Diagonal Planar Mirrors (`/` and `\`) with 90° reflection geometry
  - Beam Splitters (Prisms) splitting single beams into perpendicular dual rays
  - Obsidian Wall Absorbers
  - Wormhole Portal Gateways
- **Stages:** 20 progressive handcrafted optical chambers across 4 tiers (Apprentice, Prism Division, Chromatics, Quantum Master) with 3-Star efficiency ratings
- **Multiplayer:** Simultaneous LAN photon sprint duel with live crystal illumination telemetry radar

### AlgoBot: Maze Runner & Pathfinding
- **Type:** Algorithmic thinking & visual programming puzzle
- **Virtual Machine:** Modular instruction pipeline with call stack interpreter supporting `MAIN[]`, Subroutines `F1[]` and `F2[]`, and tail-recursion
- **Instruction Set:** `MOVE`, `TURN_L`, `TURN_R`, `JUMP`, `ACTIVATE`, `CALL_F1`, `CALL_F2`
- **Features:** Line-by-line step-through debugger (`▶`, `⏭️`, `↺`), dynamic speed scaling ($1\times, 2\times, 4\times$), interactive switches, laser gates, and hazard avoidance
- **Stages:** 100 progressive algorithmic chambers across 5 tiers (Fundamentals, DRY Loops & F1, Dual Subroutines & Recursion, Dynamic Gate Networks, Grandmaster Turing Challenges) with 3-Star instruction efficiency ratings and Tier-filtered Stage Selector (1–100)
- **Multiplayer:** Live algorithmic sprint duel with real-time instruction count and chip harvest telemetry

### Wordle / Word Duel Arena
- **Type:** Deductive vocabulary & logic puzzle (`GameType.WordDuel = 17`)
- **Core Mechanics:** 6 attempts to deduce a hidden 5-letter English word. Color-coded feedback on letter tiles:
  - 🟩 **Green (Correct)**: Letter is in the word and in the correct spot.
  - 🟨 **Yellow (Present)**: Letter is in the word but in the wrong spot.
  - ⬛ **Gray (Absent)**: Letter is not in the word.
- **Offline Vocabulary:** 100% offline bundled dictionary with ~1,200+ curated high-frequency secret words and ~10,000+ valid guess words.
- **Features:** 3D perspective tile flip animations, pop scaling, row shake on non-dictionary words, victory dance, and on-screen interactive QWERTY keyboard with real-time letter key color states.
- **Game Modes:**
  - **Solo Mode**: Infinite random words + streak tracker + guess distribution analytics histogram.
  - **Hard Mode**: Any revealed green/yellow hints must be strictly used in subsequent guesses.
  - **LAN Word Duel**: Simultaneous live sprint where both players receive the identical secret word seed, featuring a live opponent telemetry radar displaying anonymized colored guess blocks (`🟩🟨⬛`).

### Lights Out: Quantum Switch
- **Type:** Grid Inversion & Parity Mathematical Puzzle (`GameType.LightsOut = 18`)
- **Core Mechanics:** Turn OFF all glowing quantum light nodes. Clicking any node inverts its state and all adjacent neighbors over Galois Field $\mathbb{Z}_2$.
- **Linear Algebra Solver:** Built-in Galois Field $\text{GF}(2)$ Gaussian elimination matrix solver ($A \cdot x = b \pmod 2$) providing real-time mathematical hints and calculating exact Par moves.
- **Topological & Quantum Modes:**
  - **Classic Cross ($+$)**: Traditional N, S, E, W neighbor inversion.
  - **Superposition Diagonal ($X$)**: Inverts diagonal NW, NE, SW, SE neighbors.
  - **Torus Topology (Wrap-Around)**: Border energy conduits wrap continuously across opposing edges.
  - **Matrix Dimensions**: $3 \times 3$, $4 \times 4$, $5 \times 5$, and $6 \times 6$ grids.
- **Stages:** 50 progressive handcrafted parity chambers across 5 tiers (Apprentice Core, Parity Symmetry, Torus Topology, Superposition Diagonal, Grandmaster Turing Singularity) with 3-Star efficiency ratings and Tier-filtered Stage Selector (1–50).
- **Multiplayer:** Live quantum sprint duel with real-time opponent light count and mini-matrix telemetry radar.

---

## 11. Data Flow & Real-Time Communication

### Lobby Load

```
Browser loads Default.aspx
  -> Site.Master loads all CSS and JS
  -> GameHubClient.init() called
    -> $.connection.hub.start()
    -> hub.server.register(playerName)
      -> Server: RegisterPlayer(), Groups.Add("lobby")
      -> Clients.All.updateOnlinePlayers(...)
      -> Clients.All.updateLeaderboard(...)
    -> JS updates sidebar lists
  -> fetch('/Handlers/CustomGameHandler.ashx?action=list')
    -> Renders custom game cards dynamically
```

### Matchmaking Flow

```
Player A: hub.server.joinMatchmaking(9)  [Chess]
  -> no one waiting -> Clients.Caller.queueJoined -> A sees "Searching..."

Player B: hub.server.joinMatchmaking(9)
  -> found A -> CreateSession -> add both to "session_ABC"
  -> Clients.Client(A).matchFound + Clients.Client(B).matchFound
  -> Both redirect to Games/Chess.aspx?session=ABC&p1=A&p2=B
```

### In-Game Turn Flow (Chess)

```
Chess.aspx loads
  -> hub.server.joinSession(sessionId, "PlayerA", 9, "PlayerA", "PlayerB")
    -> Clients.Caller.sessionState({isP1:true, chessFen:"...", ...})
    -> Client initialises board from FEN

White player clicks e2 -> e4
  -> hub.server.makeChessMove(sessionId, "e2", "e4", null, newFen, "e4", ...)
    -> Server validates turn ownership
    -> session.ChessFen = newFen; session.ChessMoveHistory.Add("e4")
    -> session.CurrentTurnPlayerId = Black's connId
    -> Clients.Group("session_ABC").chessMoveMade({...nextTurnPlayerId:BlackConn})
    -> White client: updates board, disables input
    -> Black client: updates board, enables input
```

---

## 12. Leaderboard & Scoring System

### Multiplayer Global Leaderboard

- **Scope:** TicTacToe, Connect4, RPS, AirHockey, Archery, Chess
- **Storage:** In-memory `ConcurrentDictionary<string, LeaderboardEntry>` keyed by `DisplayName`
- **Update:** `RecordGameResult()` called after every game ends; broadcasts to ALL clients
- **Points:** `(Wins x 3) + (Draws x 1)`
- **Display:** Top 20 players

### Single-Player Leaderboards

| Game | Top-N displayed | Tracked fields |
|------|-----------------|---------------|
| 2048 | 10 | Score + Best tile |
| Brick Blast | 10 | Score + Level |
| Knife Throw | 10 | Score + Level |

### Custom Game Leaderboards

- **Storage:** `App_Data/custom_scores.json` — persists across restarts
- **Submission:** `window.parent.GameHubBridge.submitScore(score)`
- **Display:** Top 20 per game in `PlayCustom.aspx` sidebar

---

## 13. Audio System

All audio is synthesized using the Web Audio API — no `.mp3` or `.wav` files exist.

**How it works:**
1. `AudioContext` created on first user interaction (browser autoplay policy)
2. For each sound, an `OscillatorNode` + `GainNode` creates frequency + volume envelope
3. Oscillator runs for a precise duration then stops
4. Gain envelope shapes attack + decay

**Sound events:**
- `playClick()` — UI button interactions
- `playMove()` — Piece/disc/choice placement
- `playWin()` — Game victory (ascending arpeggio + confetti)
- `playLoss()` — Game defeat
- `playTick()` — Minor events, countdown

Mute state stored in `localStorage.gamehub_muted`, read on every page load.

---

## 14. Offline / Intranet Deployment

This project has **zero internet dependencies**:

| Normally needs internet | How this project handles it |
|------------------------|-----------------------------|
| CDN for jQuery | `Scripts/jquery-3.7.1.min.js` (local) |
| CDN for SignalR JS | `Scripts/jquery.signalR-2.4.3.min.js` (local) |
| Google Fonts | Not used — system font stack |
| External API | None used |
| Audio files | Synthesized via Web Audio API |
| NuGet restore | All DLLs pre-compiled in `bin/` |

**To deploy to an offline PC:**
1. Copy the entire `e:/Game/GameHub/` folder
2. Open in Visual Studio -> Build -> Publish (File System target)
3. Copy published output to IIS server
4. Configure IIS site pointing to published folder
5. Application Pool: `.NET v4.5`, **Integrated** pipeline

**Alternatively:** Run directly in Visual Studio using IIS Express — no publish step needed.

---

## 15. How to Build & Publish

### Development

1. Open `e:/Game/GameHub/GameHub.csproj` in Visual Studio 2015+
2. Press F5 (or Ctrl+F5 for no-debug)
3. IIS Express starts; browser opens at `http://localhost:<port>/`

> Note: A popup about "debugging a Release build" appears only when running Debug mode with a Release build configuration. Switch to **Debug** configuration in VS to suppress it.

### Production Publish

1. Right-click project -> Publish -> File System
2. Set target location (e.g., `C:\Deploy\GameHub`)
3. Click Publish
4. Copy entire published folder to target IIS server

### IIS Configuration

- Application Pool: `.NET v4.0` or `.NET v4.5`, **Integrated** pipeline
- Default Document: `Default.aspx`
- `CustomGames/` and `App_Data/` folders require **Write** permission for the IIS app pool identity (needed for uploads and score persistence)

---

## 16. Adding a New Hardcoded Game (Developer Guide)

1. **Add enum value** in `Models/GameType.cs`: `NewGame = 10`
2. **Add game state fields** in `Models/GameSession.cs` if server-side state needed
3. **Add move processing method** in `Services/GameManager.cs`
4. **Add hub method(s)** in `Hubs/GameHub.cs`
5. **Create game page** `Games/NewGame.aspx` + `.aspx.cs` — inherit `Site.Master`
6. **Create game script** `Scripts/newgame.js`
7. **Add CSS** in `Content/games.css`
8. **Add game card** in `Default.aspx` games grid
9. **Update `onMatchFound`** in `hub-client.js` (add to `pageMap`)
10. **Update challenge modal** in `hub-client.js` (add game button)

---

## 17. Custom Game Package Specification

### Required files

**`manifest.json`** at the ZIP root (or inside one top-level folder):
```json
{
  "id": "my-game",
  "title": "My Game",
  "description": "A short description.",
  "author": "Developer Name",
  "version": "1.0",
  "thumbnail": "icon.svg",
  "entry": "index.html",
  "category": "Arcade",
  "supportsLeaderboard": true
}
```

**`index.html`** — the game entry point (self-contained HTML/CSS/JS).

### Optional files

- `icon.svg` or `thumbnail.png` — shown as card thumbnail
- Any JS/CSS/asset files referenced by `index.html`

### Bridge API

```javascript
// Submit score to Game Hub leaderboard
if (window.parent && window.parent.GameHubBridge) {
    window.parent.GameHubBridge.submitScore(score); // score is an integer
}

// Get current player's display name
var name = window.parent.GameHubBridge.getPlayerName();
```

### Download Template

Navigate to:  
`http://<server>/Handlers/CustomGameHandler.ashx?action=downloadtemplate`

Downloads a working `.zip` template (click-the-target game) demonstrating the bridge API.

---

## 18. Known Behaviours & Design Decisions

| Topic | Behaviour / Decision |
|-------|---------------------|
| **Session persistence** | Sessions are in-memory only. Server restart loses active games. Custom game registry (JSON files) survives restarts. |
| **Player identity** | Based on SignalR `ConnectionId`. Page refresh = new connection ID. `GetOrCreateSession` re-binds by display name as fallback. |
| **Chess rule engine** | All chess rules run in JavaScript (`chessRules.js`) for instant feedback. Server only validates turn ownership and stores FEN. |
| **Air Hockey physics** | Client-authoritative for low latency. Player 1 acts as physics authority and periodically syncs puck position to opponent. |
| **No database** | Intentional — keeps deployment simple. All state is in-memory or flat JSON files. |
| **No external fonts** | System font stack used — guarantees offline operation. |
| **Zip Slip protection** | All ZIP entry paths validated against temp directory before extraction. |
| **Bot vs Multiplayer routing** | Each game page checks for `?session=` in the URL. If present: multiplayer via SignalR. If absent: local bot mode. |
| **SignalR fallback** | If WebSockets unavailable (old browser / proxy), SignalR falls back to SSE then Long-Polling. Works on all LAN environments. |
| **Chess board orientation** | White = Player 1 (session initiator). Black (Player 2) sees board flipped 180°. "Flip Board" button available to either player. |
| **RPS simultaneous reveal** | Server waits for both choices before broadcasting. Neither player can see opponent's choice before submitting. |
| **Leaderboard reset** | Global leaderboard resets when IIS worker process recycles. Single-player and custom game scores persist via JSON files. |
