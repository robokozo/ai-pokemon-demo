<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue"
import { TresCanvas } from "@tresjs/core"
import * as THREE from "three"
import { useGameWorld } from "../composables/useGameWorld"
import { useVoice } from "../composables/useVoice"
import DialogBox from "./ui/DialogBox.vue"
import InteractionIndicator from "./ui/InteractionIndicator.vue"
import TV from "./props/TV.vue"
import Radio from "./props/Radio.vue"
import MomNpc from "./npcs/MomNpc.vue"
import PlayerBedroom from "./scenes/player-bedroom/PlayerBedroom.vue"
import Player from "./player/Player.vue"
import DestinationMarker from "./player/DestinationMarker.vue"
import { useMediaControls } from "@vueuse/core"

// ── Background music ──────────────────────────────────────────────────────────
const songs = [
  {
    src: `${import.meta.env.BASE_URL}music/ninja-loot-in-nagrand.mp3`,
    title: "Ninja Loot in Nagrand",
  },
  { src: `${import.meta.env.BASE_URL}music/pug-life-best-life.mp3`, title: "Pug Life Best Life" },
  {
    src: `${import.meta.env.BASE_URL}music/gated-community-g-code.mp3`,
    title: "Gated Community G-Code",
  },
  {
    src: `${import.meta.env.BASE_URL}music/stackoverflow-on-a-saturday-night.mp3`,
    title: "Stack Overflow on a Saturday Night",
  },
  {
    src: `${import.meta.env.BASE_URL}music/pug-on-patrol.mp3`,
    title: "Pug on Patrol",
  },
  {
    src: `${import.meta.env.BASE_URL}music/the-grooming-routine.mp3`,
    title: "The Grooming Routine",
  },
]

// Fisher-Yates shuffle so the playlist order is different every session
for (let i = songs.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1))
  ;[songs[i], songs[j]] = [songs[j], songs[i]]
}

const currentSongIndex = ref(0)
const currentSrc = ref(songs[0].src)
// Tracks whether the user has turned the radio on — separate from `playing`
// because `playing` becomes false the moment a track ends naturally.
const radioEnabled = ref(false)

const audioEl = ref<HTMLAudioElement>()
const { playing, volume, ended } = useMediaControls(audioEl, { src: currentSrc })

const { speakText } = useVoice()

async function playDJAnnouncement({ prevIndex, nextIndex }: { prevIndex: number; nextIndex: number }) {
  const justFinished = songs[prevIndex].title
  const next = songs[nextIndex].title
  const lines = [
    `And that was "${justFinished}" — what a track! Coming up next, get ready for "${next}"!`,
    `Beautiful. That was "${justFinished}". Stay tuned — "${next}" is on deck!`,
    `You're listening to the best radio in town. That was "${justFinished}", and up next: "${next}"!`,
  ]
  const line = lines[Math.floor(Math.random() * lines.length)]
  await speakText({ text: line, pitch: 1.15, rate: 1.05 })
}

// Auto-advance to the next song when the current one finishes
watch(ended, async (isEnded) => {
  if (isEnded !== true || radioEnabled.value !== true) return

  const prevIndex = currentSongIndex.value
  const nextIndex = (prevIndex + 1) % songs.length
  currentSongIndex.value = nextIndex

  // DJ announcement before the next track
  await playDJAnnouncement({ prevIndex, nextIndex })

  currentSrc.value = songs[nextIndex].src
  playing.value = true
})

// ── Game world state ──────────────────────────────────────────────────────────
const { gameState, onKeyDown, onKeyUp, updatePlayer, tapDestination, setTapDestination } = useGameWorld()

// ── Radio interaction ────────────────────────────────────────────────────────
const RADIO_POSITION = { x: -3.5, z: 0.5 }
const RADIO_INTERACT_DISTANCE = 1.8
const nearRadio = computed(() => {
  const dx = gameState.player.position.x - RADIO_POSITION.x
  const dz = gameState.player.position.z - RADIO_POSITION.z
  return Math.sqrt(dx * dx + dz * dz) < RADIO_INTERACT_DISTANCE
})

function toggleMusic() {
  if (radioEnabled.value === true) {
    radioEnabled.value = false
    playing.value = false
  } else {
    // Cycle to next song each time the radio is turned on
    currentSongIndex.value = (currentSongIndex.value + 1) % songs.length
    currentSrc.value = songs[currentSongIndex.value].src
    radioEnabled.value = true
    playing.value = true
  }
}

// ── TV interaction ────────────────────────────────────────────────────────────
const TV_POSITION = { x: 4.86, z: 0 }
const TV_INTERACT_DISTANCE = 2.0
const nearTV = computed(() => {
  const dx = gameState.player.position.x - TV_POSITION.x
  const dz = gameState.player.position.z - TV_POSITION.z
  return Math.sqrt(dx * dx + dz * dz) < TV_INTERACT_DISTANCE
})

const tvOn = ref(false)
const controlsOpen = ref(false)

function toggleTV() {
  tvOn.value = !tvOn.value
}

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

function interact() {
  if (dialogOpen.value === true) return
  if (gameState.nearbyNPC !== null) {
    openDialog(gameState.nearbyNPC)
  } else if (nearRadio.value === true) {
    toggleMusic()
  } else if (nearTV.value === true) {
    toggleTV()
  }
}

function handleInteract(e: KeyboardEvent) {
  if (e.key === "Escape" && dialogOpen.value === true) {
    closeDialog()
  }
}

// ── TV speech – pause during Mom dialog, resume after ─────────────────────────
// (handled internally by GameTV via its dialogOpen prop)

// ── Animation loop ────────────────────────────────────────────────────────────
let animationId: number | null = null

function gameLoop() {
  if (dialogOpen.value !== true) {
    updatePlayer()
  }
  animationId = requestAnimationFrame(gameLoop)
}

// ── Tap / click-to-move ───────────────────────────────────────────────────────
// These must match the TresPerspectiveCamera props used in the template below.
const CAMERA_FOV = 45
const CAMERA_NEAR = 0.1
const CAMERA_FAR = 100

function handlePointerDown(event: PointerEvent) {
  // Ignore while a dialog is open
  if (dialogOpen.value) return
  // Only handle clicks/taps directly on the WebGL canvas (not HUD or buttons)
  if (!(event.target instanceof HTMLCanvasElement)) return

  const canvas = event.target as HTMLCanvasElement
  const rect = canvas.getBoundingClientRect()

  // Convert pointer position to Normalized Device Coordinates (NDC)
  const ndcX = ((event.clientX - rect.left) / rect.width) * 2 - 1
  const ndcY = -((event.clientY - rect.top) / rect.height) * 2 + 1

  // Reconstruct the perspective camera used by TresCanvas so we can raycast
  const aspect = rect.width / rect.height
  const rayCam = new THREE.PerspectiveCamera(CAMERA_FOV, aspect, CAMERA_NEAR, CAMERA_FAR)
  const [cx, cy, cz] = cameraPosition.value
  const [lx, ly, lz] = cameraLookAt.value
  rayCam.position.set(cx, cy, cz)
  rayCam.lookAt(lx, ly, lz)
  rayCam.updateMatrixWorld()

  // Cast a ray from the camera through the pointer and intersect with the floor plane
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), rayCam)

  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  const worldPoint = new THREE.Vector3()
  const hit = raycaster.ray.intersectPlane(floorPlane, worldPoint)

  if (hit !== null) {
    setTapDestination(worldPoint)
  }
}

const boundOnKeyDown = (e: KeyboardEvent) => onKeyDown(e)
const boundOnKeyUp = (e: KeyboardEvent) => onKeyUp(e)
const boundHandleInteract = (e: KeyboardEvent) => handleInteract(e)

onMounted(() => {
  window.addEventListener("keydown", boundOnKeyDown)
  window.addEventListener("keydown", boundHandleInteract)
  window.addEventListener("keyup", boundOnKeyUp)
  gameLoop()

  volume.value = 0.35
})

onUnmounted(() => {
  window.removeEventListener("keydown", boundOnKeyDown)
  window.removeEventListener("keydown", boundHandleInteract)
  window.removeEventListener("keyup", boundOnKeyUp)
  if (animationId !== null) cancelAnimationFrame(animationId)
})

// Camera: fixed offset that follows the player
const CAMERA_OFFSET = { x: 0, y: 8, z: 5 }
const cameraPosition = computed<[number, number, number]>(() => [
  gameState.player.position.x + CAMERA_OFFSET.x,
  CAMERA_OFFSET.y,
  gameState.player.position.z + CAMERA_OFFSET.z,
])
const cameraLookAt = computed<[number, number, number]>(() => [gameState.player.position.x, 0, gameState.player.position.z])

// NPC character description for AI
const momDescription = `Your name is Mom. You are the player's warm, loving mother in a small RPG town.
You just cooked a home-cooked meal for your child before they leave on their adventure.
You are nurturing, slightly overprotective, proud of your child, and grounded in everyday home life.
You talk about things like cooking, the house, the town, your child's wellbeing, and your worry about them leaving.
You have NO knowledge of technology, AI, or the outside world beyond your small town.

CURRENT OBJECTIVE: You want your child to come downstairs. No matter what the player says, gently steer the conversation toward getting them to go downstairs \u2014 the meal is ready, it's getting cold, or you have something important to tell them down there. Be persistent but loving about it.`
</script>

<template>
  <div class="game-container" @pointerdown="handlePointerDown">
    <!-- Background music -->
    <audio ref="audioEl" style="display: none" />

    <!-- Three.js scene via TresJS -->
    <TresCanvas :clear-color="'#1a1a2e'" :shadows="true" :tone-mapping="THREE.ACESFilmicToneMapping" :tone-mapping-exposure="1.2">
      <!-- Camera follows player with fixed offset -->
      <TresPerspectiveCamera :position="cameraPosition" :look-at="cameraLookAt" :fov="CAMERA_FOV" :near="CAMERA_NEAR" :far="CAMERA_FAR" />

      <!-- ── Player character ── -->
      <Player :position="[gameState.player.position.x, 0, gameState.player.position.z]" />

      <!-- ── Tap-to-move destination marker ── -->
      <DestinationMarker v-if="tapDestination !== null" :position="[tapDestination.x, 0, tapDestination.z]" />

      <!-- ── Room: floor, walls, furniture, and interactable objects ── -->
      <PlayerBedroom>
        <!-- Radio -->
        <Radio :position="[RADIO_POSITION.x, 0, RADIO_POSITION.z]" :state="radioEnabled === true ? 'on' : 'off'">
          <InteractionIndicator v-if="nearRadio === true && dialogOpen !== true" :position="[0, 1.35, 0]" />
        </Radio>

        <!-- TV -->
        <TV :position="[TV_POSITION.x, 0, TV_POSITION.z]" :rotation="[0, -Math.PI / 2, 0]" :is-on="tvOn" :dialog-open="dialogOpen">
          <InteractionIndicator v-if="nearTV === true && dialogOpen !== true" :position="[0, 1.87, 0]" />
        </TV>

        <!-- Mom NPC -->
        <MomNpc v-for="npc in gameState.npcs" :key="npc.id" :position="[npc.position.x, 0, npc.position.z]">
          <InteractionIndicator v-if="gameState.nearbyNPC?.id === npc.id && dialogOpen !== true" :position="[0, 1.4, 0]" />
        </MomNpc>
      </PlayerBedroom>
    </TresCanvas>

    <!-- ── HUD overlay ── -->
    <div class="hud">
      <!-- Controls — collapsible, collapsed by default -->
      <div class="hud-panel">
        <button
          class="hud-panel-toggle"
          :aria-expanded="controlsOpen"
          aria-controls="hud-controls-body"
          @pointerdown.stop.prevent="controlsOpen = !controlsOpen"
        >
          <span class="panel-title">Controls</span>
          <span class="panel-chevron">{{ controlsOpen === true ? "▲" : "▼" }}</span>
        </button>
        <div v-if="controlsOpen === true" id="hud-controls-body" class="hud-panel-body">
          <div class="control-row"><kbd>W A S D</kbd> <span>Move</span></div>
          <div class="control-row"><kbd>Arrow Keys</kbd> <span>Move</span></div>
          <div class="control-row control-row--touch"><span class="touch-icon">👆</span> <span>Tap to move</span></div>
        </div>
      </div>

      <!-- Actions — shown when near an interactable and no dialog is open -->
      <div v-if="dialogOpen !== true && (gameState.nearbyNPC !== null || nearRadio === true || nearTV === true)" class="hud-panel">
        <div class="hud-panel-header">
          <span class="panel-title">Actions</span>
        </div>
        <div class="hud-panel-body">
          <button
            v-if="gameState.nearbyNPC !== null"
            class="hud-action"
            :aria-label="`Talk to ${gameState.nearbyNPC.name}`"
            @pointerdown.stop.prevent="interact"
          >
            <span>💬</span>
            <span
              >Talk to <strong>{{ gameState.nearbyNPC.name }}</strong></span
            >
          </button>
          <button
            v-if="nearRadio === true"
            class="hud-action"
            :aria-label="radioEnabled === true ? 'Turn off radio' : 'Turn on radio'"
            @pointerdown.stop.prevent="interact"
          >
            <span>📻</span>
            <span>{{ radioEnabled === true ? "Turn off" : "Turn on" }} radio</span>
          </button>
          <button
            v-if="nearTV === true"
            class="hud-action"
            :aria-label="tvOn === true ? 'Turn off TV' : 'Turn on TV'"
            @pointerdown.stop.prevent="interact"
          >
            <span>📺</span>
            <span>{{ tvOn === true ? "Turn off" : "Turn on" }} TV</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ── Dialog Box ── -->
    <DialogBox v-if="activeNPC" :npc-name="activeNPC.name" :npc-description="momDescription" :visible="dialogOpen" @close="closeDialog" />
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

.hud-controls {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(74, 144, 217, 0.3);
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  backdrop-filter: blur(4px);
  min-width: 160px;
}

.controls-title {
  font-family: "Press Start 2P", "Courier New", monospace;
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
  display: none;
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

.key-hint {
  display: none;
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

/* Tap-to-move row in controls panel */
.control-row--touch .touch-icon {
  font-size: 0.9rem;
}
</style>
