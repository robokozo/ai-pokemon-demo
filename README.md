# AI Adventure Demo — Vue 3 + TypeScript + Vite

🚀 **Live demo:** [https://robokozo.github.io/ai-pokemon-demo/](https://robokozo.github.io/ai-pokemon-demo/)

A 3D Pokémon-inspired RPG demo built with [TresJS](https://tresjs.org/) (Three.js + Vue 3) and Chrome's on-device AI (Gemini Nano).

## Controls

### Keyboard (Desktop)

| Key                                 | Action                            |
| ----------------------------------- | --------------------------------- |
| `W` / `A` / `S` / `D` or Arrow Keys | Move the player                   |
| `E` or `Space`                      | Talk to nearby NPC / toggle radio |
| `Escape`                            | Close dialog                      |

### Tap / Click-to-Move (Desktop & Mobile)

- **Tap or click anywhere on the game world** to make the player walk to that spot.
- A golden marker appears at the destination and disappears when the player arrives.
- **Keyboard input cancels** the current tap destination and resumes keyboard control.
- The player will stop automatically if blocked for an extended period (e.g., colliding with an NPC).

### Mobile Interactions

- Use the **"💬 Talk to Mom"** button (bottom-right) to open the dialog when the player is close.
- Use the **"📻 Turn on/off radio"** button (bottom-right, appears when near the radio) to toggle music.

## Tech Stack

- **Vue 3** with `<script setup>` SFCs
- **Three.js / TresJS** for 3D rendering
- **Chrome Gemini Nano** (on-device AI) for NPC conversations
- **Web Speech API** for voice input/output
- **Vite** for development and bundling

## Development

```bash
npm install
npm run dev      # Start dev server
npm run build    # Type-check + production build
npm run preview  # Preview built output
```

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).
