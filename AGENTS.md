---
description: Technical architecture, engine design, conventions, and build workflows for AI agents working in this repository.
rules:
  - ALWAYS keep this document up-to-date whenever modifying, refactoring, or adding core engine systems, architecture, build tooling, or conventions.
---

# Engine & Architecture Guide (js13k)

This repository contains a lightweight, custom-built HTML5/TypeScript game engine designed for the **js13kGames** competition, where the final game distribution must be **13 KB or less when zipped**.

---

## 1. High-Level Architecture & Threading Model

The engine decouples game simulation from DOM and WebGL rendering using a dual-thread Web Worker architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Main Thread (Window)                     │
│  - DOM & Canvas lifecycle                                   │
│  - User Input capture (pointer, mouse, touch, keyboard)     │
│  - WebGL Renderer (draws instanced sprite buffer)           │
│  - Web Audio playback (synthesizer / sequencer)             │
└──────────────┬──────────────────────────────▲───────────────┘
               │ Transferable Input State     │ Transferable Render Buffer
               │                              │ (Float32Array)
┌──────────────▼──────────────────────────────┴───────────────┐
│                    Worker Thread (Logic)                    │
│  - Fixed/delta game loop ticks                              │
│  - Scene stack & Scene graph updates                        │
│  - Physics, collisions, tweens, & entity logic              │
│  - Audio commands (music loop ID, triggered SFX IDs)        │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

- **Entry Point** (`src/core/game.ts`): Detects environment (`WorkerGlobalScope` vs `window`) and bootstraps either `GameWorker` or `GameWindow`.
- **Game Window** (`src/core/game_window.ts`):
  - Listens to pointer and keyboard events, converting coordinates to normalized `[0, 1]` viewport space.
  - Receives frame buffers from the worker and issues WebGL draw calls.
  - Manages the Web Audio context and sound playback.
  - **Self-Bootstrapping Worker**: Reads the inline `<script id="j">` content from the DOM and creates a `Blob` URL (`URL.createObjectURL(new Blob([...]))`) to launch the worker without requiring external bundle files.
- **Game Worker** (`src/core/game_worker.ts`):
  - Maintains the active scene stack (`_pushScene`, `_popScene`) and entity scene graph.
  - Serializes sprite instance data (position, scale, rotation, texture coords, opacity) into a shared `Float32Array`.
- **Zero-Allocation Ping-Ponging**:
  - The render buffer `Float32Array` is transferred across threads via `postMessage([buffer.buffer])`.
  - Once drawn by WebGL on the main thread, the same buffer is transferred back to the worker for the next frame, eliminating per-frame GC allocations.

---

## 2. Rendering Subsystem

- **WebGL Instanced Renderer** (`src/core/renderer.ts`):
  - Uses instanced quad rendering to draw all visible sprites in a single batch.
  - Instance layout defined in `src/core/config.ts` (`FLOATS_PER_INSTANCE`, `MAX_SPRITE_COUNT`).
- **GLSL Shaders** (`src/core/glsl/`):
  - `sprite_shader.vs` / `sprite_shader.fs`: Processes sprite transforms, atlas UV slicing, tinting, and opacity.
  - `full_screen_quad.vs`, `post_blur.fs`, `post_noop.fs`: Full-screen quad post-processing pipeline.
- **Procedural Vector Texture Atlas** (`src/core/assets/drawables.gen.ts` & `src/core/asset_library.ts`):
  - To save bundle size, binary image assets are not used.
  - Textures are defined as procedural 2D canvas drawing instruction arrays in `drawables.gen.ts`.
  - Polygon coordinates are stored as compact ASCII strings: `[colorIndex, style, "coordString"]` using an ASCII offset of 40 on a 50x50 grid (`String.fromCharCode(40 + Math.round(coord * 50))`), saving space by eliminating float decimal points, zeros, and comma separators.
  - At startup (`AssetLibrary._preRenderTextures()`), these instructions are decoded, rasterized onto an offscreen canvas, and uploaded to a WebGL texture atlas.

---

## 3. Audio Subsystem

- **Procedural Synthesizer & Sequencer** (`src/core/sound.ts`):
  - Built entirely on the Web Audio API without audio files.
  - Synthesizes musical instruments using basic waveforms (sine, square, sawtooth, triangle), biquad filters, and exponential gain envelopes.
  - Instruments available: `_kick`, `_snare`, `_bass`, `_beep`, `_boop`, `_bang`, and detuned polyphonic `_chords`.
  - Supports synchronized multi-track musical loops (`playLoop`) and one-shot sound effects (`playSingle`).

---

## 4. Scene Graph & Entity System

- **Scene Management** (`src/core/scene.ts`):
  - Hierarchical scene stack. Scenes define async initializers (`(scene, game) => Promise<void> | void`) and frame updaters (`(scene, game, delta) => void`).
- **Sprite Node Tree** (`src/core/sprite.ts`):
  - Hierarchical transform tree (`_position`, `_scale`, `_angle`, `_opacity`, `_children`).
  - Supports per-sprite `_updater` callbacks and tweening helpers (`utils._tweenUpdater`).
- **Utilities** (`src/core/utils.ts`):
  - Vector math (`_vectorAdd`, `_vectorLerp`, `_vectorAngle`, `_simpleDistance`).
  - Easing, clamping, random number generation, and timer helpers.

---

## 5. Development & Asset Tooling

- **Visual Asset Editor Server** (`editor/server.js`):
  - Local Node.js HTTP server running on port `7362`.
  - Automatically launched during `npm run dev`.
  - Interacts with `src/core/assets/drawables.gen.ts` by reading and writing to the `/*GEN*/ ... /*/GEN*/` delimited block.
  - Serves an interactive vector asset editor UI from `editor/public`.

---

## 6. Build, Optimization & Packaging Pipeline

- **Bundler & Minifier Configuration** (`rollup.config.js`):
  - `@rollup/plugin-typescript`: Compiles TypeScript with strict type checking.
  - `rollup-plugin-glslify`: Inlines and compresses GLSL shader strings.
  - `inlineTemplate()`: Custom plugin that inlines minified CSS (`src/style.css`) and JavaScript into `scaffold.template` to produce a standalone `dist/index.html`.
  - `@rollup/plugin-terser`: Production minifier configured with:
    - 3 compression passes (`passes: 3`, `unsafe: true`, `booleans_as_integers: true`).
    - **Property Mangling**: Aggressively mangles all properties matching `/^_/`.
- **Build Commands** (`package.json`):
  - `npm run dev`: Starts Rollup watch mode, live reload, dev server on port 5173, and the asset editor on port 7362.
  - `npm run build`: Generates the production bundle in `dist/index.html`.
  - `npm run preview`: Previews the production build via local HTTP server.
  - `npm run release`: Performs full clean, build, zip (`bestzip`), and extreme Deflate recompression (`advzip` with 200 iterations), then prints the final `.zip` file size in KB.

---

## 7. Critical Coding Conventions & Guidelines

1. **Property Mangling (`_` prefix)**:
   - Always prefix internal class properties, methods, state keys, and object parameters intended for minification with an underscore (e.g., `_position`, `_updater`, `_levelState`).
   - Terser is explicitly configured to mangle `/^_/` properties across the codebase to maximize compression.
2. **Zero-GC in Hot Loops**:
   - Avoid creating temporary objects, arrays, or closures inside per-frame `_updater` callbacks or render functions.
   - Reuse existing vectors, buffers, and state structures wherever possible.
3. **Single-File Portability**:
   - All runtime code and assets must compile into a single self-contained `index.html` file without external network dependencies.
