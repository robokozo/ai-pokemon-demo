<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { TresCanvas } from "@tresjs/core";
import * as THREE from "three";
import { useGameWorld, ROOM_WIDTH, ROOM_HEIGHT } from "../composables/useGameWorld";
import { useVoice } from "../composables/useVoice";
import DialogBox from "./DialogBox.vue";
import InteractionIndicator from "./InteractionIndicator.vue";
import GameTV from "./GameTV.vue";
import { useMediaControls } from "@vueuse/core";

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
];

// Fisher-Yates shuffle so the playlist order is different every session
for (let i = songs.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [songs[i], songs[j]] = [songs[j], songs[i]];
}

const currentSongIndex = ref(0);
const currentSrc = ref(songs[0].src);
// Tracks whether the user has turned the radio on — separate from `playing`
// because `playing` becomes false the moment a track ends naturally.
const radioEnabled = ref(false);

const audioEl = ref<HTMLAudioElement>();
const { playing, volume, ended } = useMediaControls(audioEl, { src: currentSrc });

const { speakText } = useVoice();

async function playDJAnnouncement({
  prevIndex,
  nextIndex,
}: {
  prevIndex: number;
  nextIndex: number;
}) {
  const justFinished = songs[prevIndex].title;
  const next = songs[nextIndex].title;
  const lines = [
    `And that was "${justFinished}" — what a track! Coming up next, get ready for "${next}"!`,
    `Beautiful. That was "${justFinished}". Stay tuned — "${next}" is on deck!`,
    `You're listening to the best radio in town. That was "${justFinished}", and up next: "${next}"!`,
  ];
  const line = lines[Math.floor(Math.random() * lines.length)];
  await speakText({ text: line, pitch: 1.15, rate: 1.05 });
}

// Auto-advance to the next song when the current one finishes
watch(ended, async (isEnded) => {
  if (isEnded !== true || radioEnabled.value !== true) return;

  const prevIndex = currentSongIndex.value;
  const nextIndex = (prevIndex + 1) % songs.length;
  currentSongIndex.value = nextIndex;

  // DJ announcement before the next track
  await playDJAnnouncement({ prevIndex, nextIndex });

  currentSrc.value = songs[nextIndex].src;
  playing.value = true;
});

// ── Game world state ──────────────────────────────────────────────────────────
const { gameState, onKeyDown, onKeyUp, updatePlayer, tapDestination, setTapDestination } =
  useGameWorld();

// ── Radio interaction ────────────────────────────────────────────────────────
const RADIO_POSITION = { x: -3.5, z: 0.5 };
const RADIO_INTERACT_DISTANCE = 1.8;
const nearRadio = computed(() => {
  const dx = gameState.player.position.x - RADIO_POSITION.x;
  const dz = gameState.player.position.z - RADIO_POSITION.z;
  return Math.sqrt(dx * dx + dz * dz) < RADIO_INTERACT_DISTANCE;
});

function toggleMusic() {
  if (radioEnabled.value === true) {
    radioEnabled.value = false;
    playing.value = false;
  } else {
    // Cycle to next song each time the radio is turned on
    currentSongIndex.value = (currentSongIndex.value + 1) % songs.length;
    currentSrc.value = songs[currentSongIndex.value].src;
    radioEnabled.value = true;
    playing.value = true;
  }
}

// ── TV interaction ────────────────────────────────────────────────────────────
const TV_POSITION = { x: 4.86, z: 0 };
const TV_INTERACT_DISTANCE = 2.0;
const nearTV = computed(() => {
  const dx = gameState.player.position.x - TV_POSITION.x;
  const dz = gameState.player.position.z - TV_POSITION.z;
  return Math.sqrt(dx * dx + dz * dz) < TV_INTERACT_DISTANCE;
});

const tvRef = ref<InstanceType<typeof GameTV> | null>(null);
const tvOn = computed(() => tvRef.value?.isOn === true);

function toggleTV() {
  if (tvRef.value !== null) {
    tvRef.value.toggle();
  }
}

// ── Interaction ───────────────────────────────────────────────────────────────
const dialogOpen = ref(false);
const activeNPC = ref<(typeof gameState.npcs)[0] | null>(null);

function openDialog(npc: (typeof gameState.npcs)[0]) {
  activeNPC.value = npc;
  dialogOpen.value = true;
}

function closeDialog() {
  dialogOpen.value = false;
}

function interact() {
  if (dialogOpen.value === true) return;
  if (gameState.nearbyNPC !== null) {
    openDialog(gameState.nearbyNPC);
  } else if (nearRadio.value === true) {
    toggleMusic();
  } else if (nearTV.value === true) {
    toggleTV();
  }
}

function handleInteract(e: KeyboardEvent) {
  if ((e.key === "e" || e.key === "E" || e.key === " ") && dialogOpen.value !== true) {
    interact();
  }
  if (e.key === "Escape" && dialogOpen.value === true) {
    closeDialog();
  }
}

// ── TV speech – pause during Mom dialog, resume after ─────────────────────────
// (handled internally by GameTV via its dialogOpen prop)

// ── Animation loop ────────────────────────────────────────────────────────────
let animationId: number | null = null;

function gameLoop() {
  if (dialogOpen.value !== true) {
    updatePlayer();
  }
  animationId = requestAnimationFrame(gameLoop);
}

// ── Tap / click-to-move ───────────────────────────────────────────────────────
// These must match the TresPerspectiveCamera props used in the template below.
const CAMERA_FOV = 45;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 100;
const DESTINATION_MARKER_HEIGHT = 0.04;

function handlePointerDown(event: PointerEvent) {
  // Ignore while a dialog is open
  if (dialogOpen.value) return;
  // Only handle clicks/taps directly on the WebGL canvas (not HUD or buttons)
  if (!(event.target instanceof HTMLCanvasElement)) return;

  const canvas = event.target as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();

  // Convert pointer position to Normalized Device Coordinates (NDC)
  const ndcX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const ndcY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // Reconstruct the perspective camera used by TresCanvas so we can raycast
  const aspect = rect.width / rect.height;
  const rayCam = new THREE.PerspectiveCamera(CAMERA_FOV, aspect, CAMERA_NEAR, CAMERA_FAR);
  const [cx, cy, cz] = cameraPosition.value;
  const [lx, ly, lz] = cameraLookAt.value;
  rayCam.position.set(cx, cy, cz);
  rayCam.lookAt(lx, ly, lz);
  rayCam.updateMatrixWorld();

  // Cast a ray from the camera through the pointer and intersect with the floor plane
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), rayCam);

  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const worldPoint = new THREE.Vector3();
  const hit = raycaster.ray.intersectPlane(floorPlane, worldPoint);

  if (hit !== null) {
    setTapDestination(worldPoint);
  }
}

const boundOnKeyDown = (e: KeyboardEvent) => onKeyDown(e);
const boundOnKeyUp = (e: KeyboardEvent) => onKeyUp(e);
const boundHandleInteract = (e: KeyboardEvent) => handleInteract(e);

onMounted(() => {
  window.addEventListener("keydown", boundOnKeyDown);
  window.addEventListener("keydown", boundHandleInteract);
  window.addEventListener("keyup", boundOnKeyUp);
  gameLoop();

  volume.value = 0.35;
});

onUnmounted(() => {
  window.removeEventListener("keydown", boundOnKeyDown);
  window.removeEventListener("keydown", boundHandleInteract);
  window.removeEventListener("keyup", boundOnKeyUp);
  if (animationId !== null) cancelAnimationFrame(animationId);
});

// ── Scene helpers ─────────────────────────────────────────────────────────────

// Floor tile colors (checkerboard)
const floorTiles = computed(() => {
  const tiles: Array<{ x: number; z: number; color: string }> = [];
  for (let x = 0; x < ROOM_WIDTH; x++) {
    for (let z = 0; z < ROOM_HEIGHT; z++) {
      const isLight = (x + z) % 2 === 0;
      tiles.push({
        x: x - ROOM_WIDTH / 2 + 0.5,
        z: z - ROOM_HEIGHT / 2 + 0.5,
        color: isLight ? "#c8b89a" : "#b8a88a",
      });
    }
  }
  return tiles;
});

// Wall segments: top, bottom, left, right
const walls = [
  // top wall
  { x: 0, z: -ROOM_HEIGHT / 2 - 0.25, sx: ROOM_WIDTH, sy: 0.75, sz: 0.5, color: "#8b7355" },
  // bottom wall
  { x: 0, z: ROOM_HEIGHT / 2 + 0.25, sx: ROOM_WIDTH, sy: 0.75, sz: 0.5, color: "#8b7355" },
  // left wall
  { x: -ROOM_WIDTH / 2 - 0.25, z: 0, sx: 0.5, sy: 0.75, sz: ROOM_HEIGHT + 1, color: "#7a6548" },
  // right wall
  { x: ROOM_WIDTH / 2 + 0.25, z: 0, sx: 0.5, sy: 0.75, sz: ROOM_HEIGHT + 1, color: "#7a6548" },
];

// Furniture: bed, table, bookshelf, rug
const furniture = [
  // Bed (top-right corner)
  { x: 3.5, z: -2.8, sx: 1.8, sy: 0.3, sz: 2.4, color: "#3a7bd5", label: "bed-frame" },
  { x: 3.5, z: -2.8, sx: 1.6, sy: 0.4, sz: 2.2, yOff: 0.3, color: "#e8c4a0", label: "mattress" },
  { x: 3.5, z: -3.8, sx: 1.6, sy: 0.45, sz: 0.4, yOff: 0.5, color: "#fff8f0", label: "pillow" },
  // Table (left side)
  { x: -3.5, z: 1.5, sx: 1.2, sy: 0.1, sz: 0.8, yOff: 0.5, color: "#a07850" },
  { x: -3.5, z: 1.5, sx: 0.08, sy: 0.5, sz: 0.08, yOff: 0.0, color: "#7a5830", label: "leg1" },
  // Bookshelf (top-left corner)
  { x: -3.8, z: -2.5, sx: 0.4, sy: 1.0, sz: 2.0, color: "#6b4c2a" },
  { x: -3.8, z: -2.5, sx: 0.05, sy: 0.9, sz: 1.8, yOff: 0.05, color: "#e8d0c0", label: "books" },
  // Rug (center)
  { x: 0, z: 0.5, sx: 3.5, sy: 0.02, sz: 2.5, yOff: 0.01, color: "#c94a6e", label: "rug" },
  // Small window / painting on top wall
  { x: 1.5, z: -3.6, sx: 1.2, sy: 0.8, sz: 0.1, yOff: 0.5, color: "#87ceeb", label: "window" },
  {
    x: 1.5,
    z: -3.6,
    sx: 1.4,
    sy: 1.0,
    sz: 0.12,
    yOff: 0.5,
    color: "#5a4025",
    label: "window-frame",
  },
];

// Camera: fixed offset that follows the player
const CAMERA_OFFSET = { x: 0, y: 8, z: 5 };
const cameraPosition = computed<[number, number, number]>(() => [
  gameState.player.position.x + CAMERA_OFFSET.x,
  CAMERA_OFFSET.y,
  gameState.player.position.z + CAMERA_OFFSET.z,
]);
const cameraLookAt = computed<[number, number, number]>(() => [
  gameState.player.position.x,
  0,
  gameState.player.position.z,
]);

// NPC character description for AI
const momDescription = `Your name is Mom. You are the player's warm, loving mother in a small RPG town.
You just cooked a home-cooked meal for your child before they leave on their adventure.
You are nurturing, slightly overprotective, proud of your child, and grounded in everyday home life.
You talk about things like cooking, the house, the town, your child's wellbeing, and your worry about them leaving.
You have NO knowledge of technology, AI, or the outside world beyond your small town.

CURRENT OBJECTIVE: You want your child to come downstairs. No matter what the player says, gently steer the conversation toward getting them to go downstairs \u2014 the meal is ready, it's getting cold, or you have something important to tell them down there. Be persistent but loving about it.`;
</script>

<template>
  <div class="game-container" @pointerdown="handlePointerDown">
    <!-- Background music -->
    <audio ref="audioEl" style="display: none" />

    <!-- Three.js scene via TresJS -->
    <TresCanvas
      :clear-color="'#1a1a2e'"
      :shadows="true"
      :tone-mapping="THREE.ACESFilmicToneMapping"
      :tone-mapping-exposure="1.2"
    >
      <!-- Camera follows player with fixed offset -->
      <TresPerspectiveCamera
        :position="cameraPosition"
        :look-at="cameraLookAt"
        :fov="CAMERA_FOV"
        :near="CAMERA_NEAR"
        :far="CAMERA_FAR"
      />

      <!-- Ambient light -->
      <TresAmbientLight :intensity="0.6" color="#fff8e8" />

      <!-- Main directional light (ceiling lamp) -->
      <TresDirectionalLight
        :position="[2, 6, 3]"
        :intensity="1.2"
        color="#fff8e8"
        :cast-shadow="true"
      />

      <!-- Warm accent light -->
      <TresPointLight :position="[-2, 3, 2]" color="#ffd4a0" :intensity="0.8" :distance="8" />

      <!-- ── Floor tiles ── -->
      <TresMesh
        v-for="(tile, i) in floorTiles"
        :key="`tile-${i}`"
        :position="[tile.x, 0, tile.z]"
        :receive-shadow="true"
      >
        <TresBoxGeometry :args="[1, 0.05, 1]" />
        <TresMeshLambertMaterial :color="tile.color" />
      </TresMesh>

      <!-- ── Walls ── -->
      <TresMesh
        v-for="(wall, i) in walls"
        :key="`wall-${i}`"
        :position="[wall.x, wall.sy / 2, wall.z]"
        :cast-shadow="true"
        :receive-shadow="true"
      >
        <TresBoxGeometry :args="[wall.sx, wall.sy, wall.sz]" />
        <TresMeshLambertMaterial :color="wall.color" />
      </TresMesh>

      <!-- ── Furniture ── -->
      <TresMesh
        v-for="(item, i) in furniture"
        :key="`furniture-${i}`"
        :position="[item.x, (item.yOff ?? 0) + (item.sy ?? 0.1) / 2, item.z]"
        :cast-shadow="true"
        :receive-shadow="true"
      >
        <TresBoxGeometry :args="[item.sx, item.sy, item.sz]" />
        <TresMeshLambertMaterial :color="item.color" />
      </TresMesh>

      <!-- ── Player character ── -->
      <!-- Body -->
      <TresMesh
        :position="[gameState.player.position.x, 0.3, gameState.player.position.z]"
        :cast-shadow="true"
      >
        <TresBoxGeometry :args="[0.4, 0.5, 0.3]" />
        <TresMeshLambertMaterial color="#4a90d9" />
      </TresMesh>
      <!-- Head -->
      <TresMesh
        :position="[gameState.player.position.x, 0.72, gameState.player.position.z]"
        :cast-shadow="true"
      >
        <TresBoxGeometry :args="[0.32, 0.32, 0.32]" />
        <TresMeshLambertMaterial color="#f5cba0" />
      </TresMesh>
      <!-- Cap -->
      <TresMesh
        :position="[gameState.player.position.x, 0.92, gameState.player.position.z - 0.02]"
        :cast-shadow="true"
      >
        <TresBoxGeometry :args="[0.36, 0.14, 0.36]" />
        <TresMeshLambertMaterial color="#e53935" />
      </TresMesh>

      <!-- ── Tap-to-move destination marker ── -->
      <TresMesh
        v-if="tapDestination"
        :position="[tapDestination.x, DESTINATION_MARKER_HEIGHT, tapDestination.z]"
      >
        <TresCylinderGeometry :args="[0.22, 0.22, 0.04, 16]" />
        <TresMeshLambertMaterial
          color="#ffd700"
          :emissive="'#ffd700'"
          :emissive-intensity="0.6"
          :transparent="true"
          :opacity="0.75"
        />
      </TresMesh>

      <!-- ── Radio table ── -->
      <!-- Table surface -->
      <TresMesh
        :position="[RADIO_POSITION.x, 0.55, RADIO_POSITION.z]"
        :cast-shadow="true"
        :receive-shadow="true"
      >
        <TresBoxGeometry :args="[0.9, 0.06, 0.55]" />
        <TresMeshLambertMaterial color="#a07850" />
      </TresMesh>
      <!-- Table legs -->
      <TresMesh
        :position="[RADIO_POSITION.x - 0.38, 0.28, RADIO_POSITION.z - 0.22]"
        :cast-shadow="true"
      >
        <TresBoxGeometry :args="[0.06, 0.56, 0.06]" />
        <TresMeshLambertMaterial color="#7a5830" />
      </TresMesh>
      <TresMesh
        :position="[RADIO_POSITION.x + 0.38, 0.28, RADIO_POSITION.z - 0.22]"
        :cast-shadow="true"
      >
        <TresBoxGeometry :args="[0.06, 0.56, 0.06]" />
        <TresMeshLambertMaterial color="#7a5830" />
      </TresMesh>
      <TresMesh
        :position="[RADIO_POSITION.x - 0.38, 0.28, RADIO_POSITION.z + 0.22]"
        :cast-shadow="true"
      >
        <TresBoxGeometry :args="[0.06, 0.56, 0.06]" />
        <TresMeshLambertMaterial color="#7a5830" />
      </TresMesh>
      <TresMesh
        :position="[RADIO_POSITION.x + 0.38, 0.28, RADIO_POSITION.z + 0.22]"
        :cast-shadow="true"
      >
        <TresBoxGeometry :args="[0.06, 0.56, 0.06]" />
        <TresMeshLambertMaterial color="#7a5830" />
      </TresMesh>
      <!-- Radio body -->
      <TresMesh :position="[RADIO_POSITION.x, 0.69, RADIO_POSITION.z]" :cast-shadow="true">
        <TresBoxGeometry :args="[0.55, 0.22, 0.28]" />
        <TresMeshLambertMaterial color="#c0392b" />
      </TresMesh>
      <!-- Speaker grill -->
      <TresMesh
        :position="[RADIO_POSITION.x - 0.12, 0.69, RADIO_POSITION.z + 0.145]"
        :cast-shadow="true"
      >
        <TresBoxGeometry :args="[0.26, 0.14, 0.01]" />
        <TresMeshLambertMaterial color="#7a1a10" />
      </TresMesh>
      <!-- Tuning dial -->
      <TresMesh
        :position="[RADIO_POSITION.x + 0.18, 0.69, RADIO_POSITION.z + 0.145]"
        :cast-shadow="true"
      >
        <TresCylinderGeometry :args="[0.04, 0.04, 0.02, 12]" />
        <TresMeshLambertMaterial color="#f0d080" />
      </TresMesh>
      <!-- Power light: green when on, dark when off -->
      <TresMesh :position="[RADIO_POSITION.x + 0.06, 0.72, RADIO_POSITION.z + 0.145]">
        <TresCylinderGeometry :args="[0.025, 0.025, 0.015, 8]" />
        <TresMeshLambertMaterial
          :color="radioEnabled ? '#00ff88' : '#1a4a2a'"
          :emissive="radioEnabled ? '#00ff88' : '#000000'"
          :emissive-intensity="radioEnabled ? 0.8 : 0"
        />
      </TresMesh>
      <!-- Antenna -->
      <TresMesh
        :position="[RADIO_POSITION.x + 0.22, 0.88, RADIO_POSITION.z]"
        :rotation="[0, 0, 0.18]"
        :cast-shadow="true"
      >
        <TresCylinderGeometry :args="[0.012, 0.012, 0.36, 6]" />
        <TresMeshLambertMaterial color="#888888" />
      </TresMesh>
      <!-- Interaction indicator above radio -->
      <InteractionIndicator
        v-if="nearRadio === true && dialogOpen !== true"
        :position="[RADIO_POSITION.x, 1.35, RADIO_POSITION.z]"
      />

      <!-- ── TV ── -->
      <GameTV
        ref="tvRef"
        :position="[TV_POSITION.x, 0, TV_POSITION.z]"
        :rotation="[0, -Math.PI / 2, 0]"
        :dialog-open="dialogOpen"
        :show-indicator="nearTV === true && dialogOpen !== true"
      />

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

        <!-- Interaction indicator ("!" when near) -->
        <InteractionIndicator
          v-if="gameState.nearbyNPC?.id === npc.id && dialogOpen !== true"
          :position="[npc.position.x, 1.4, npc.position.z]"
        />
      </TresGroup>
    </TresCanvas>

    <!-- ── HUD overlay ── -->
    <div class="hud">
      <div class="hud-controls">
        <div class="controls-title">Controls</div>
        <div class="control-row"><kbd>W A S D</kbd> <span>Move</span></div>
        <div class="control-row"><kbd>Arrow Keys</kbd> <span>Move</span></div>
        <div class="control-row"><kbd>E</kbd> or <kbd>Space</kbd> <span>Talk</span></div>
        <div class="control-row control-row--touch">
          <span class="touch-icon">👆</span> <span>Tap to move</span>
        </div>
      </div>

      <button
        v-if="gameState.nearbyNPC && !dialogOpen"
        class="interaction-prompt"
        :aria-label="`Talk to ${gameState.nearbyNPC.name}`"
        @pointerdown.stop.prevent="interact"
      >
        <span class="prompt-icon">💬</span>
        <span
          >Talk to <strong>{{ gameState.nearbyNPC.name }}</strong></span
        >
        <kbd class="key-hint">E</kbd>
      </button>
      <button
        v-else-if="nearRadio && !dialogOpen"
        class="interaction-prompt"
        :aria-label="radioEnabled ? 'Turn off radio' : 'Turn on radio'"
        @pointerdown.stop.prevent="interact"
      >
        <span class="prompt-icon">📻</span>
        <span>{{ radioEnabled ? "Turn off" : "Turn on" }} radio</span>
        <kbd class="key-hint">E</kbd>
      </button>
      <button
        v-else-if="nearTV && !dialogOpen"
        class="interaction-prompt"
        :aria-label="tvOn ? 'Turn off TV' : 'Turn on TV'"
        @pointerdown.stop.prevent="interact"
      >
        <span class="prompt-icon">📺</span>
        <span>{{ tvOn ? "Turn off" : "Turn on" }} TV</span>
        <kbd class="key-hint">E</kbd>
      </button>
    </div>

    <!-- ── NPC click targets ── -->
    <div class="npc-click-zone">
      <button
        v-if="gameState.nearbyNPC && !dialogOpen"
        class="npc-tap-btn"
        :aria-label="`Talk to ${gameState.nearbyNPC.name}`"
        @click.stop.prevent="interact"
      >
        💬 Talk to {{ gameState.nearbyNPC.name }}
      </button>
      <button
        v-if="nearRadio && !dialogOpen"
        class="npc-tap-btn radio-tap-btn"
        :aria-label="radioEnabled ? 'Turn off radio' : 'Turn on radio'"
        @pointerdown.stop.prevent="interact"
      >
        📻 {{ radioEnabled ? "Turn off radio" : "Turn on radio" }}
      </button>
      <button
        v-if="nearTV && !dialogOpen"
        class="npc-tap-btn tv-tap-btn"
        :aria-label="tvOn ? 'Turn off TV' : 'Turn on TV'"
        @pointerdown.stop.prevent="interact"
      >
        📺 {{ tvOn ? "Turn off TV" : "Turn on TV" }}
      </button>
    </div>

    <!-- ── Dialog Box ── -->
    <DialogBox
      v-if="activeNPC"
      :npc-name="activeNPC.name"
      :npc-description="momDescription"
      :visible="dialogOpen"
      @close="closeDialog"
    />
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
  pointer-events: auto;
  cursor: pointer;
  touch-action: manipulation;
  user-select: none;
  -webkit-touch-callout: none;
  min-height: 44px;
  font-family: inherit;
}

.interaction-prompt strong {
  color: #ffe88a;
}

.key-hint {
  margin-left: auto;
  opacity: 0.7;
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
  touch-action: manipulation;
  user-select: none;
  -webkit-touch-callout: none;
  min-height: 44px;
  font-family: inherit;
}

.npc-tap-btn:hover {
  background: rgba(232, 124, 160, 0.35);
  color: #ffb0cc;
}

.radio-tap-btn {
  background: rgba(255, 215, 0, 0.15);
  border-color: rgba(255, 215, 0, 0.5);
  color: #ffd700;
}

.radio-tap-btn:hover {
  background: rgba(255, 215, 0, 0.3);
  color: #ffe88a;
}

.tv-tap-btn {
  background: rgba(74, 176, 255, 0.15);
  border-color: rgba(74, 176, 255, 0.5);
  color: #4ab0ff;
}

.tv-tap-btn:hover {
  background: rgba(74, 176, 255, 0.3);
  color: #a8d8ff;
}

/* Tap-to-move row in controls panel */
.control-row--touch .touch-icon {
  font-size: 0.9rem;
}
</style>
