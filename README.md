# 🏚️ GRANNY'S HOUSE — 2D Survival Horror Game

> An atmospheric retro top-down survival horror escape game built from the ground up with **Vanilla JavaScript (ES6+)**, **HTML5 Canvas**, and **Procedural Web Audio API**—with zero external game libraries or heavy audio assets.

---

## 🎮 Overview

You awaken trapped inside Granny's decrepit house. She wanders the corridors listening for the slightest noise—every footstep, dropped item, or creaking floorboard alerts her. You have **5 days** to explore 8 distinct rooms, solve puzzles, collect 4 hidden keys, avoid Granny's clutches, and unlock the front door to escape.

---

## 📂 Project Architecture & Separation of Concerns

The project is structured according to clean code principles, separating markup, styling, configuration, rendering, AI, and game state into modular components suitable for production portfolios:

```
ghost-game/
├── index.html              # Clean semantic HTML5 structure, HUD, and overlays
├── style.css               # Root stylesheet redirect / fallback import
├── css/
│   └── style.css           # Modular CSS3 styling, animations, and retro CRT filters
├── js/
│   ├── constants.js        # Grid dimensions, base map, door configurations, room data
│   ├── audio.js            # Procedural Web Audio API sound synthesis engine
│   ├── state.js            # Centralized game state, player & enemy models, collision logic
│   ├── items.js            # Interactive world objects, key puzzles, and inventory logic
│   ├── renderer.js         # Canvas 2D engine: procedural textures, sprites, torch lighting
│   ├── ai.js               # Granny Finite State Machine (FSM): patrol, alert, chase, search
│   ├── ui.js               # HUD updates, dialog popups, toasts, camera positioning
│   ├── input.js            # 8-directional movement controller & keyboard event listeners
│   └── game.js             # Main 60 FPS game loop, day cycle, and lifecycle manager
└── README.md               # Project documentation and engineering overview
```

---

## 🛠️ Technical Highlights & Engineering Design

### 1. Custom Canvas 2D Graphics Engine
- **Procedural Floor & Wall Textures**: Canvas algorithms generate wooden planks, green/red carpets, kitchen tiles, and concrete floors procedurally without relying on static sprite sheets.
- **Dynamic Flashlight & Darkness Shaders**: Uses radial gradients (`createRadialGradient`) to create a flashlight tunnel vision effect that tracks the player's position in real time.
- **Sanity-Driven Psychological Distortion**: As the player's sanity drops, the canvas renders an encroaching vignette darkness filter and jittering CRT noise overlay.

### 2. Finite State Machine (FSM) Enemy AI
Granny's AI operates via an intelligent state machine:
- **Patrol**: Wanders autonomously across accessible rooms using collision-aware movement.
- **Alert**: Senses player footstep vibrations when within hearing radius (`hearingRange + movement noise`) or line of sight, navigating toward the disturbance.
- **Chase**: Sprints directly toward the player with visual terror auras and sound triggers.
- **Search**: Scours the last known coordinates if line of sight is broken.
- **Dynamic Difficulty**: Granny's base speed and awareness dynamically increase with each passing day.

### 3. Procedural Web Audio API Sound System
- Eliminates external `.mp3` or `.wav` dependencies, removing load latency and asset failure risks.
- **Low-frequency Oscillators (`OscillatorNode`)**: Generate eerie atmospheric background horror drones.
- **Dynamic Bandpass & Lowpass Filters (`BiquadFilterNode`)**: Synthesize white-noise footsteps, floorboard groans, static radio interference, and jumpscare growls in real-time.

### 4. Grid Collision & Axis-Independent Physics
- World layout is partitioned into a discrete 22x16 tile grid.
- Character movement evaluates X and Y vectors independently, allowing smooth wall-sliding without getting stuck on obstacles or locked doors.

---

## ⌨️ Controls & Mechanics

| Key | Action | Description |
| :--- | :--- | :--- |
| **W, A, S, D** / **Arrow Keys** | **Move** | Move character in 8 directions (normalized diagonal speed) |
| **E** | **Interact / Pickup** | Read notes, search furniture, pick up keys and items |
| **Q** | **Hide / Unhide** | Conceal yourself under beds, inside wardrobes, or behind sofas |
| **ESC** | **Skip / Dismiss** | Dismiss narrative dialogue popups |

---

## 🔑 Key Objectives & Rooms

1. **Your Bedroom**: Starting location; find notes warning of Granny's habits.
2. **Study / Den**: Search the vintage radio to uncover the **Silver Key**.
3. **Kitchen**: Search the pantry shelf to find the **Bronze Key**.
4. **Granny's Bedroom**: Brave Granny's personal quarters and search the trunk for the **Gold Key**.
5. **Living Room**: Inspect the mysterious portrait to retrieve the **Master Key**.
6. **Hallway (Front Door)**: Collect all 4 keys to unlock the chains and escape!

---

## 🚀 Running Locally

No build tools, bundlers, or package installations are required:

### Option 1: Direct Browser
Double-click `index.html` to open it in any modern browser (Chrome, Firefox, Safari, Edge).

### Option 2: Live Server (VS Code)
Right-click `index.html` and select **Open with Live Server**.

### Option 3: Python Local Server
```bash
python3 -m http.server 8000
```
Open `http://localhost:8000` in your browser.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
