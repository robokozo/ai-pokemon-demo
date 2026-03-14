<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { TresCanvas } from '@tresjs/core'
import * as THREE from 'three'
import { useGameWorld, ROOM_WIDTH, ROOM_HEIGHT } from '../composables/useGameWorld'
import DialogBox from './DialogBox.vue'

// ── Game world state ──────────────────────────────────────────────────────────
const { gameState, onKeyDown, onKeyUp, updatePlayer } = useGameWorld()

// ── Interaction ───────────────────────────────────────────────────────────────
const dialogOpen = ref(false)
const activeNPC = ref<(typeof gameState.npcs)[0] | null>(null)

function openDialog(npc: (typeof gameState.npcs)[0]) {
  activeNPC.value = npc
  dialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
}

function handleInteract(e: KeyboardEvent) {
  if ((e.key === 'e' || e.key === 'E' || e.key === ' ') && gameState.nearbyNPC && !dialogOpen.value) {
    openDialog(gameState.nearbyNPC)
  }
  if (e.key === 'Escape' && dialogOpen.value) {
    closeDialog()
  }
}

// ── Animation loop ────────────────────────────────────────────────────────────
let animationId: number | null = null

function gameLoop() {
  if (!dialogOpen.value) {
    updatePlayer()
  }
  animationId = requestAnimationFrame(gameLoop)
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keydown', handleInteract)
  window.addEventListener('keyup', onKeyUp)
  gameLoop()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keydown', handleInteract)
  window.removeEventListener('keyup', onKeyUp)
  if (animationId !== null) cancelAnimationFrame(animationId)
})

// ── Scene helpers ─────────────────────────────────────────────────────────────

// Floor tile colors (checkerboard)
const floorTiles = computed(() => {
  const tiles: { x: number; z: number; color: string }[] = []
  for (let x = 0; x < ROOM_WIDTH; x++) {
    for (let z = 0; z < ROOM_HEIGHT; z++) {
      const isLight = (x + z) % 2 === 0
      tiles.push({
        x: x - ROOM_WIDTH / 2 + 0.5,
        z: z - ROOM_HEIGHT / 2 + 0.5,
        color: isLight ? '#c8b89a' : '#b8a88a',
      })
    }
  }
  return tiles
})

// Wall segments: top, bottom, left, right
const walls = [
  // top wall
  { x: 0, z: -ROOM_HEIGHT / 2 - 0.25, sx: ROOM_WIDTH, sy: 0.75, sz: 0.5, color: '#8b7355' },
  // bottom wall
  { x: 0, z: ROOM_HEIGHT / 2 + 0.25, sx: ROOM_WIDTH, sy: 0.75, sz: 0.5, color: '#8b7355' },
  // left wall
  { x: -ROOM_WIDTH / 2 - 0.25, z: 0, sx: 0.5, sy: 0.75, sz: ROOM_HEIGHT + 1, color: '#7a6548' },
  // right wall
  { x: ROOM_WIDTH / 2 + 0.25, z: 0, sx: 0.5, sy: 0.75, sz: ROOM_HEIGHT + 1, color: '#7a6548' },
]

// Furniture: bed, table, bookshelf, rug
const furniture = [
  // Bed (top-right corner)
  { x: 3.5, z: -2.8, sx: 1.8, sy: 0.3, sz: 2.4, color: '#3a7bd5', label: 'bed-frame' },
  { x: 3.5, z: -2.8, sx: 1.6, sy: 0.4, sz: 2.2, yOff: 0.3, color: '#e8c4a0', label: 'mattress' },
  { x: 3.5, z: -3.8, sx: 1.6, sy: 0.45, sz: 0.4, yOff: 0.5, color: '#fff8f0', label: 'pillow' },
  // Table (left side)
  { x: -3.5, z: 1.5, sx: 1.2, sy: 0.1, sz: 0.8, yOff: 0.5, color: '#a07850' },
  { x: -3.5, z: 1.5, sx: 0.08, sy: 0.5, sz: 0.08, yOff: 0.0, color: '#7a5830', label: 'leg1' },
  // Bookshelf (top-left corner)
  { x: -3.8, z: -2.5, sx: 0.4, sy: 1.0, sz: 2.0, color: '#6b4c2a' },
  { x: -3.8, z: -2.5, sx: 0.05, sy: 0.9, sz: 1.8, yOff: 0.05, color: '#e8d0c0', label: 'books' },
  // Rug (center)
  { x: 0, z: 0.5, sx: 3.5, sy: 0.02, sz: 2.5, yOff: 0.01, color: '#c94a6e', label: 'rug' },
  // Small window / painting on top wall
  { x: 1.5, z: -3.6, sx: 1.2, sy: 0.8, sz: 0.1, yOff: 0.5, color: '#87ceeb', label: 'window' },
  { x: 1.5, z: -3.6, sx: 1.4, sy: 1.0, sz: 0.12, yOff: 0.5, color: '#5a4025', label: 'window-frame' },
]

// Camera: orthographic top-down with slight tilt (isometric feel)
const cameraPosition = new THREE.Vector3(0, 8, 5)
const cameraLookAt = new THREE.Vector3(0, 0, 0)

// NPC character description for AI
const momDescription = `Your name is Mom. You are the player's warm, loving mother in a small RPG town.
You just cooked a home-cooked meal for your child before they leave on their adventure.
You are nurturing, slightly overprotective, proud of your child, and grounded in everyday home life.
You talk about things like cooking, the house, the town, your child's wellbeing, and your worry about them leaving.
You have NO knowledge of technology, AI, or the outside world beyond your small town.

CURRENT OBJECTIVE: You want your child to come downstairs. No matter what the player says, gently steer the conversation toward getting them to go downstairs \u2014 the meal is ready, it's getting cold, or you have something important to tell them down there. Be persistent but loving about it.`
</script>

<template>
  <div class="game-container">
    <!-- Three.js scene via TresJS -->
    <TresCanvas :clear-color="'#1a1a2e'" :shadows="true" :tone-mapping="THREE.ACESFilmicToneMapping"
      :tone-mapping-exposure="1.2">
      <!-- Orthographic camera: top-down with slight angle -->
      <TresPerspectiveCamera :position="[cameraPosition.x, cameraPosition.y, cameraPosition.z]"
        :look-at="[cameraLookAt.x, cameraLookAt.y, cameraLookAt.z]" :fov="45" :near="0.1" :far="100" />

      <!-- Ambient light -->
      <TresAmbientLight :intensity="0.6" color="#fff8e8" />

      <!-- Main directional light (ceiling lamp) -->
      <TresDirectionalLight :position="[2, 6, 3]" :intensity="1.2" color="#fff8e8" :cast-shadow="true" />

      <!-- Warm accent light -->
      <TresPointLight :position="[-2, 3, 2]" color="#ffd4a0" :intensity="0.8" :distance="8" />

      <!-- ── Floor tiles ── -->
      <TresMesh v-for="(tile, i) in floorTiles" :key="`tile-${i}`" :position="[tile.x, 0, tile.z]"
        :receive-shadow="true">
        <TresBoxGeometry :args="[1, 0.05, 1]" />
        <TresMeshLambertMaterial :color="tile.color" />
      </TresMesh>

      <!-- ── Walls ── -->
      <TresMesh v-for="(wall, i) in walls" :key="`wall-${i}`" :position="[wall.x, wall.sy / 2, wall.z]"
        :cast-shadow="true" :receive-shadow="true">
        <TresBoxGeometry :args="[wall.sx, wall.sy, wall.sz]" />
        <TresMeshLambertMaterial :color="wall.color" />
      </TresMesh>

      <!-- ── Furniture ── -->
      <TresMesh v-for="(item, i) in furniture" :key="`furniture-${i}`"
        :position="[item.x, (item.yOff ?? 0) + (item.sy ?? 0.1) / 2, item.z]" :cast-shadow="true"
        :receive-shadow="true">
        <TresBoxGeometry :args="[item.sx, item.sy, item.sz]" />
        <TresMeshLambertMaterial :color="item.color" />
      </TresMesh>

      <!-- ── Player character ── -->
      <!-- Body -->
      <TresMesh :position="[gameState.player.position.x, 0.3, gameState.player.position.z]" :cast-shadow="true">
        <TresBoxGeometry :args="[0.4, 0.5, 0.3]" />
        <TresMeshLambertMaterial color="#4a90d9" />
      </TresMesh>
      <!-- Head -->
      <TresMesh :position="[gameState.player.position.x, 0.72, gameState.player.position.z]" :cast-shadow="true">
        <TresBoxGeometry :args="[0.32, 0.32, 0.32]" />
        <TresMeshLambertMaterial color="#f5cba0" />
      </TresMesh>
      <!-- Cap -->
      <TresMesh :position="[gameState.player.position.x, 0.92, gameState.player.position.z - 0.02]" :cast-shadow="true">
        <TresBoxGeometry :args="[0.36, 0.14, 0.36]" />
        <TresMeshLambertMaterial color="#e53935" />
      </TresMesh>

      <!-- ── Mom NPC ── -->
      <TresGroup v-for="npc in gameState.npcs" :key="npc.id">
        <!-- Body -->
        <TresMesh :position="[npc.position.x, 0.3, npc.position.z]" :cast-shadow="true">
          <TresBoxGeometry :args="[0.4, 0.5, 0.3]" />
          <TresMeshLambertMaterial color="#e87ca0" />
        </TresMesh>
        <!-- Head -->
        <TresMesh :position="[npc.position.x, 0.72, npc.position.z]" :cast-shadow="true">
          <TresBoxGeometry :args="[0.32, 0.32, 0.32]" />
          <TresMeshLambertMaterial color="#f5cba0" />
        </TresMesh>
        <!-- Hair -->
        <TresMesh :position="[npc.position.x, 0.9, npc.position.z]" :cast-shadow="true">
          <TresBoxGeometry :args="[0.36, 0.18, 0.34]" />
          <TresMeshLambertMaterial color="#6b3a2a" />
        </TresMesh>

        <!-- Interaction indicator (bouncing "!" when near) -->
        <TresMesh v-if="gameState.nearbyNPC?.id === npc.id && !dialogOpen"
          :position="[npc.position.x, 1.4, npc.position.z]">
          <TresBoxGeometry :args="[0.12, 0.32, 0.05]" />
          <TresMeshLambertMaterial color="#ffd700" :emissive="'#ffd700'" :emissive-intensity="0.5" />
        </TresMesh>
        <TresMesh v-if="gameState.nearbyNPC?.id === npc.id && !dialogOpen"
          :position="[npc.position.x, 1.08, npc.position.z]">
          <TresBoxGeometry :args="[0.12, 0.1, 0.05]" />
          <TresMeshLambertMaterial color="#ffd700" :emissive="'#ffd700'" :emissive-intensity="0.5" />
        </TresMesh>
      </TresGroup>
    </TresCanvas>

    <!-- ── HUD overlay ── -->
    <div class="hud">
      <div class="hud-controls">
        <div class="controls-title">Controls</div>
        <div class="control-row"><kbd>W A S D</kbd> <span>Move</span></div>
        <div class="control-row"><kbd>Arrow Keys</kbd> <span>Move</span></div>
        <div class="control-row"><kbd>E</kbd> or <kbd>Space</kbd> <span>Talk</span></div>
      </div>

      <div v-if="gameState.nearbyNPC && !dialogOpen" class="interaction-prompt">
        <span class="prompt-icon">💬</span>
        Press <kbd>E</kbd> to talk to <strong>{{ gameState.nearbyNPC.name }}</strong>
      </div>
    </div>

    <!-- ── NPC click targets ── -->
    <div class="npc-click-zone">
      <button v-for="npc in gameState.npcs" :key="npc.id" class="npc-tap-btn" :title="`Talk to ${npc.name}`"
        @click="openDialog(npc)">
        Talk to {{ npc.name }}
      </button>
    </div>

    <!-- ── Dialog Box ── -->
    <DialogBox v-if="activeNPC" :npc-name="activeNPC.name" :npc-description="momDescription" :visible="dialogOpen"
      @close="closeDialog" />
  </div>
</template>

<style scoped>
.game-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #1a1a2e;
}

/* HUD */
.hud {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
  z-index: 10;
}

.hud-controls {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(74, 144, 217, 0.3);
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  backdrop-filter: blur(4px);
  min-width: 160px;
}

.controls-title {
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 0.55rem;
  color: #4a90d9;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.3rem;
}

.control-row span {
  color: rgba(255, 255, 255, 0.8);
}

kbd {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 3px;
  padding: 1px 5px;
  font-family: monospace;
  font-size: 0.65rem;
  color: #e0e8ff;
  white-space: nowrap;
}

.interaction-prompt {
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid #ffd700;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  color: #ffd700;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  backdrop-filter: blur(4px);
  animation: promptPulse 1.5s ease-in-out infinite;
}

.interaction-prompt strong {
  color: #ffe88a;
}

.prompt-icon {
  font-size: 1rem;
}

@keyframes promptPulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

/* NPC click zone - hidden visually but accessible for mobile/click */
.npc-click-zone {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 10;
}

.npc-tap-btn {
  background: rgba(232, 124, 160, 0.2);
  border: 1px solid rgba(232, 124, 160, 0.5);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  color: #e87ca0;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.npc-tap-btn:hover {
  background: rgba(232, 124, 160, 0.35);
  color: #ffb0cc;
}
</style>
