# 🎮 Game Hub — Offline Intranet Multiplayer & Arcade Platform

> **100% Offline & LAN-Ready Gaming Platform with 9 Built-in Games, Real-Time SignalR Multiplayer, Smart AI Bots, and a Dynamic Hot-Pluggable Game Uploader.**

For complete architecture, directory breakdown, and file-by-file documentation, refer to **[PROJECT_DOCUMENTATION.md](file:///e:/Game/PROJECT_DOCUMENTATION.md)**.

---

## 🌟 Highlights

- **9 Full Built-in Games**:
  1. **Tic-Tac-Toe** (Minimax AI + LAN Multiplayer)
  2. **Connect 4** (Alpha-Beta AI + LAN Multiplayer)
  3. **Rock-Paper-Scissors Reflex** (Pattern AI + LAN Multiplayer)
  4. **Air Hockey 60 FPS** (Symmetric Physics + LAN Multiplayer)
  5. **Archery Clash 3D Scope** (Dynamic Wind & 3D Flight Physics + LAN Multiplayer)
  6. **2048 Puzzle** (Sliding Tile Grid + Undo Moves + Leaderboard)
  7. **Brick Blast** (60 FPS Paddle Breakout + 5 Power-Ups + Leaderboard)
  8. **Knife Throw** (Rotating Target + Angular Collision + Leaderboard)
  9. **Chess Championship** (Full FIDE Rules, Alpha-Beta AI, In-Game Difficulty Switcher, Board Flipping, LAN Multiplayer)
- **Hot-Pluggable Game Upload System**: Upload new HTML5/JS `.zip` games directly from the web browser without recompiling C# or restarting the server.
- **100% Offline / Intranet Self-Contained**: Zero external CDNs, zero cloud APIs, Web Audio API tone synthesis, inline SVG vector assets.

---

## 🚀 Quick Start

### In Visual Studio:
1. Open `E:\Game\GameHub.sln` in Visual Studio (2015, 2017, 2019, 2022).
2. Set configuration to `Debug` (or `Release`) and `Any CPU`.
3. Press **`Ctrl + F5`** (Start Without Debugging) or **`F5`**.

### In IIS (Intranet Deployment):
1. Point a new IIS Website to `E:\Game\GameHub`.
2. Set Application Pool to **.NET Framework v4.0** (Integrated Mode).
3. Connect any PC on your local LAN to `http://<SERVER-IP>/`.

---

## 📦 Testing Custom Game Uploads

A ready-to-test game package is pre-built at:
- **`E:\Game\SampleGames\NeonSnake.zip`**

Upload it via the **"Upload Custom Game (.zip)"** button on the homepage to see instant zero-recompile installation in action!
