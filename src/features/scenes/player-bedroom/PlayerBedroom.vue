<script setup lang="ts">
import { ref, computed } from "vue"
import { TresCanvas } from "@tresjs/core"
import { EffectComposerPmndrs, BloomPmndrs } from "@tresjs/post-processing"
import * as THREE from "three"
import { useEventListener } from "@vueuse/core"
import { useSceneStore } from "../../useSceneStore"
import type { SceneEntity } from "../../useSceneStore"
import { useRadio } from "../../props/useRadio"
import Bed from "../../furniture/Bed.vue"
import Bookshelf from "../../furniture/Bookshelf.vue"
import Rug from "../../furniture/Rug.vue"
import Wall from "../../furniture/Wall.vue"
import Radio from "../../props/Radio.vue"
import TV from "../../props/TV.vue"
import MomNpc from "../../npcs/MomNpc.vue"
import Player from "../../player/Player.vue"
import DestinationMarker from "../../player/DestinationMarker.vue"
import InteractionIndicator from "../../ui/InteractionIndicator.vue"
import DialogBox from "../../ui/DialogBox.vue"

const ROOM_WIDTH = 10
const ROOM_HEIGHT = 8

interface Tile {
  x: number
  z: number
  color: string
}

const floorTiles: Array<Tile> = []
for (let x = 0; x < ROOM_WIDTH; x++) {
  for (let z = 0; z < ROOM_HEIGHT; z++) {
    const isLight = (x + z) % 2 === 0
    floorTiles.push({
      x: x - ROOM_WIDTH / 2 + 0.5,
      z: z - ROOM_HEIGHT / 2 + 0.5,
      color: isLight === true ? "#c8b89a" : "#b8a88a",
    })
  }
}

// ── Radio ─────────────────────────────────────────────────────────────────────
const { radioState, toggle: toggleRadio } = useRadio()

// ── TV ────────────────────────────────────────────────────────────────────────
const tvState = ref<"on" | "off">("off")

function toggleTV() {
  tvState.value = tvState.value === "on" ? "off" : "on"
}

// ── Game world state ──────────────────────────────────────────────────────────
const store = useSceneStore()

// ── Dialog ────────────────────────────────────────────────────────────────────
const isDialogOpen = ref(false)
const activeNPC = ref<SceneEntity | null>(null)

function openDialog(npc: SceneEntity) {
  activeNPC.value = npc
  isDialogOpen.value = true
  store.setPaused(true)
}

function closeDialog() {
  isDialogOpen.value = false
  store.setPaused(false)
}

// ── Interaction ───────────────────────────────────────────────────────────────
function interact() {
  if (isDialogOpen.value === true) return
  const entity = store.nearbyEntity
  if (entity === null) return
  if (entity.kind === "npc") {
    openDialog(entity)
  } else if (entity.id === "radio") {
    toggleRadio()
  } else if (entity.id === "tv") {
    toggleTV()
  }
}

useEventListener(window, "keydown", (e: KeyboardEvent) => {
  if (e.key === "Escape" && isDialogOpen.value === true) {
    closeDialog()
  }
})

// ── Camera ────────────────────────────────────────────────────────────────────
const CAMERA_FOV = 45
const CAMERA_NEAR = 0.1
const CAMERA_FAR = 100
const CAMERA_OFFSET = { x: 0, y: 8, z: 5 }

const cameraPosition = computed<[number, number, number]>(() => {
  const player = store.getPlayer()
  const px = player !== null ? player.position.x : 0
  const pz = player !== null ? player.position.z : 0
  return [px + CAMERA_OFFSET.x, CAMERA_OFFSET.y, pz + CAMERA_OFFSET.z]
})

const cameraLookAt = computed<[number, number, number]>(() => {
  const player = store.getPlayer()
  const px = player !== null ? player.position.x : 0
  const pz = player !== null ? player.position.z : 0
  return [px, 0, pz]
})

// ── Tap / click-to-move ───────────────────────────────────────────────────────
// Clamp a point to the interior of the room bounds (must match wall positions below)
function clampToRoomBounds(x: number, z: number) {
  const minX = -4.75
  const maxX = 4.75
  const minZ = -3.75
  const maxZ = 3.75
  return {
    x: Math.max(minX, Math.min(maxX, x)),
    z: Math.max(minZ, Math.min(maxZ, z)),
  }
}

function handlePointerDown(event: PointerEvent) {
  if (isDialogOpen.value === true) return
  if (!(event.target instanceof HTMLCanvasElement)) return

  const canvas = event.target as HTMLCanvasElement
  const rect = canvas.getBoundingClientRect()

  const ndcX = ((event.clientX - rect.left) / rect.width) * 2 - 1
  const ndcY = -((event.clientY - rect.top) / rect.height) * 2 + 1

  const aspect = rect.width / rect.height
  const rayCam = new THREE.PerspectiveCamera(CAMERA_FOV, aspect, CAMERA_NEAR, CAMERA_FAR)
  const [cx, cy, cz] = cameraPosition.value
  const [lx, ly, lz] = cameraLookAt.value
  rayCam.position.set(cx, cy, cz)
  rayCam.lookAt(lx, ly, lz)
  rayCam.updateMatrixWorld()

  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), rayCam)

  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  const worldPoint = new THREE.Vector3()
  const hit = raycaster.ray.intersectPlane(floorPlane, worldPoint)

  if (hit !== null) {
    const bounded = clampToRoomBounds(worldPoint.x, worldPoint.z)
    const clamped = store.clampTapDestination(bounded)
    store.setTapDestination({ x: clamped.x, y: 0, z: clamped.z })
  }
}

// ── HUD ───────────────────────────────────────────────────────────────────────
const isControlsOpen = ref(false)

// ── NPC descriptions ──────────────────────────────────────────────────────────
const momDescription = `Your name is Mom. You are the player's warm, loving mother in a small RPG town.
You just cooked a home-cooked meal for your child before they leave on their adventure.
You are nurturing, slightly overprotective, proud of your child, and grounded in everyday home life.
You talk about things like cooking, the house, the town, your child's wellbeing, and your worry about them leaving.
You have NO knowledge of technology, AI, or the outside world beyond your small town.

CURRENT OBJECTIVE: You want your child to come downstairs. No matter what the player says, gently steer the conversation toward getting them to go downstairs — the meal is ready, it's getting cold, or you have something important to tell them down there. Be persistent but loving about it.`
</script>

<template>
  <div class="game-container" @pointerdown="handlePointerDown">
    <!-- Three.js scene via TresJS -->
    <TresCanvas :clear-color="'#1a1a2e'" :shadows="true" :tone-mapping="THREE.ACESFilmicToneMapping" :tone-mapping-exposure="1.2">
      <!-- Camera follows player with fixed offset -->
      <TresPerspectiveCamera :position="cameraPosition" :look-at="cameraLookAt" :fov="CAMERA_FOV" :near="CAMERA_NEAR" :far="CAMERA_FAR" />

      <!-- ── Post-processing ── -->
      <EffectComposerPmndrs>
        <BloomPmndrs :intensity="1.8" :luminance-threshold="0.6" :luminance-smoothing="0.1" :mipmap-blur="true" />
      </EffectComposerPmndrs>

      <!-- ── Player character ── -->
      <Player />

      <!-- ── Tap-to-move destination marker ── -->
      <DestinationMarker v-if="store.tapDestination !== null" :position="[store.tapDestination.x, 0, store.tapDestination.z]" />

      <!-- ── Room ── -->
      <TresGroup>
        <!-- Lighting -->
        <TresAmbientLight :intensity="0.6" color="#fff8e8" />
        <TresDirectionalLight :position="[2, 6, 3]" :intensity="1.2" color="#fff8e8" :cast-shadow="true" />
        <TresPointLight :position="[-2, 3, 2]" color="#ffd4a0" :intensity="0.8" :distance="8" />

        <!-- Floor -->
        <TresMesh v-for="(tile, i) in floorTiles" :key="`tile-${i}`" :position="[tile.x, 0, tile.z]" :receive-shadow="true">
          <TresBoxGeometry :args="[1, 0.05, 1]" />
          <TresMeshLambertMaterial :color="tile.color" />
        </TresMesh>

        <!-- Walls -->
        <Wall id="wall-top" :position="[0, 0, -4.25]" :width="10" :depth="0.5" color="#8b7355" />
        <Wall id="wall-bottom" :position="[0, 0, 4.25]" :width="10" :depth="0.5" color="#8b7355" />
        <Wall id="wall-left" :position="[-5.25, 0, 0]" :width="0.5" :depth="9" color="#7a6548" />
        <Wall id="wall-right" :position="[5.25, 0, 0]" :width="0.5" :depth="9" color="#7a6548" />

        <!-- Furniture -->
        <Bed :position="[3.5, 0, -2.8]" />
        <Bookshelf :position="[-3.8, 0, -2.5]" />
        <Rug :position="[0, 0, 0.5]" />

        <!-- Radio -->
        <Radio :position="[-3.5, 0, 0.5]" :state="radioState">
          <InteractionIndicator v-if="store.nearbyEntity?.id === 'radio' && isDialogOpen !== true" :position="[0, 1.35, 0]" />
        </Radio>

        <!-- TV -->
        <TV :position="[4.86, 0, 0]" :rotation="[0, -Math.PI / 2, 0]" :state="tvState">
          <InteractionIndicator v-if="store.nearbyEntity?.id === 'tv' && isDialogOpen !== true" :position="[0, 1.87, 0]" />
        </TV>

        <!-- Mom NPC -->
        <MomNpc id="mom" name="Mom" is-static>
          <InteractionIndicator v-if="store.nearbyEntity?.id === 'mom' && isDialogOpen !== true" :position="[0, 1.4, 0]" />
        </MomNpc>
      </TresGroup>
    </TresCanvas>

    <!-- ── HUD overlay ── -->
    <div class="hud">
      <!-- Controls — collapsible, collapsed by default -->
      <div class="hud-panel">
        <button
          class="hud-panel-toggle"
          :aria-expanded="isControlsOpen"
          aria-controls="hud-controls-body"
          @pointerdown.stop.prevent="isControlsOpen = !isControlsOpen"
        >
          <span class="panel-title">Controls</span>
          <span class="panel-chevron">{{ isControlsOpen === true ? "▲" : "▼" }}</span>
        </button>
        <div v-if="isControlsOpen === true" id="hud-controls-body" class="hud-panel-body">
          <div class="control-row"><kbd>W A S D</kbd> <span>Move</span></div>
          <div class="control-row"><kbd>Arrow Keys</kbd> <span>Move</span></div>
          <div class="control-row control-row--touch"><span class="touch-icon">👆</span> <span>Tap to move</span></div>
        </div>
      </div>

      <!-- Actions — shown when near an interactable and no dialog is open -->
      <div v-if="isDialogOpen !== true && store.nearbyEntity !== null" class="hud-panel">
        <div class="hud-panel-header">
          <span class="panel-title">Actions</span>
        </div>
        <div class="hud-panel-body">
          <button
            v-if="store.nearbyEntity.kind === 'npc'"
            class="hud-action"
            :aria-label="`Talk to ${store.nearbyEntity.name}`"
            @pointerdown.stop.prevent="interact"
          >
            <span>💬</span>
            <span
              >Talk to <strong>{{ store.nearbyEntity.name }}</strong></span
            >
          </button>
          <button
            v-if="store.nearbyEntity.id === 'radio'"
            class="hud-action"
            :aria-label="radioState === 'on' ? 'Turn off radio' : 'Turn on radio'"
            @pointerdown.stop.prevent="interact"
          >
            <span>📻</span>
            <span>{{ radioState === "on" ? "Turn off" : "Turn on" }} radio</span>
          </button>
          <button
            v-if="store.nearbyEntity.id === 'tv'"
            class="hud-action"
            :aria-label="tvState === 'on' ? 'Turn off TV' : 'Turn on TV'"
            @pointerdown.stop.prevent="interact"
          >
            <span>📺</span>
            <span>{{ tvState === "on" ? "Turn off" : "Turn on" }} TV</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ── Dialog Box ── -->
    <DialogBox v-if="activeNPC !== null" :npc-name="activeNPC.name" :npc-description="momDescription" :visible="isDialogOpen" @close="closeDialog" />
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
  gap: 0.5rem;
  pointer-events: none;
  z-index: 10;
}

.hud-panel {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(74, 144, 217, 0.3);
  border-radius: 8px;
  backdrop-filter: blur(4px);
  min-width: 160px;
  overflow: hidden;
}

.hud-panel-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.45rem 0.8rem;
  background: none;
  border: none;
  cursor: pointer;
  pointer-events: auto;
  touch-action: manipulation;
  user-select: none;
  font-family: inherit;
}

.hud-panel-header {
  display: flex;
  align-items: center;
  padding: 0.45rem 0.8rem 0.2rem;
}

.panel-title {
  font-family: "Press Start 2P", "Courier New", monospace;
  font-size: 0.55rem;
  color: #4a90d9;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.panel-chevron {
  font-size: 0.5rem;
  color: rgba(74, 144, 217, 0.7);
}

.hud-panel-body {
  padding: 0 0.8rem 0.6rem;
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

.hud-action {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  width: 100%;
  margin-top: 0.3rem;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.4);
  border-radius: 6px;
  padding: 0.4rem 0.5rem;
  font-size: 0.7rem;
  color: #ffd700;
  cursor: pointer;
  pointer-events: auto;
  touch-action: manipulation;
  user-select: none;
  -webkit-touch-callout: none;
  min-height: 36px;
  font-family: inherit;
  animation: promptPulse 1.5s ease-in-out infinite;
}

.hud-action strong {
  color: #ffe88a;
}

.hud-action:hover {
  background: rgba(255, 215, 0, 0.22);
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

/* Tap-to-move row in controls panel */
.control-row--touch .touch-icon {
  font-size: 0.9rem;
}
</style>
