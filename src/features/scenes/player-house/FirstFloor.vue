<script setup lang="ts">
import { computed } from "vue"
import { TresCanvas } from "@tresjs/core"
import { EffectComposerPmndrs, BloomPmndrs } from "@tresjs/post-processing"
import { useSceneStore } from "../../useSceneStore"
import Wall from "../../furniture/Wall.vue"
import Table from "../../furniture/Table.vue"
import TVStand from "../../furniture/TVStand.vue"
import Rug from "../../furniture/Rug.vue"
import Sofa from "../../furniture/Sofa.vue"
import DiningTable from "../../furniture/DiningTable.vue"
import KitchenCounter from "../../furniture/KitchenCounter.vue"
import TV from "../../props/tv/TV.vue"
import FlowerVase from "../../props/FlowerVase.vue"
import Staircase from "../../transitions/Staircase.vue"
import MomNpc from "../../npcs/MomNpc.vue"
import Player from "../../player/Player.vue"
import DestinationMarker from "../../player/DestinationMarker.vue"
import InteractionIndicator from "../../ui/InteractionIndicator.vue"

const ROOM_WIDTH = 14
const ROOM_HEIGHT = 12

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
      color: isLight === true ? "#c2aa88" : "#b29878",
    })
  }
}

const store = useSceneStore()

// ── Entry points ───────────────────────────────────────────────────────────────
const ENTRY_POINTS: Record<string, [number, number, number]> = {
  default: [0, 0, 4.0],
  "from-bedroom": [0, 0, -5.5],
}

const spawnPosition = computed<[number, number, number]>(() => ENTRY_POINTS[store.activeEntrypoint] ?? ENTRY_POINTS["default"])

// ── Camera ────────────────────────────────────────────────────────────────────
const CAMERA_FOV = 45
const CAMERA_NEAR = 0.1
const CAMERA_FAR = 120
const CAMERA_OFFSET = { x: 0, y: 10, z: 6 }

store.setCamera({ fov: CAMERA_FOV, near: CAMERA_NEAR, far: CAMERA_FAR, offset: CAMERA_OFFSET })

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

// ── NPC descriptions ──────────────────────────────────────────────────────────
const momDescription = `Your name is Mom. You are the player's warm, loving mother in a small RPG town.
You are in the kitchen of your home, having just finished preparing a home-cooked meal.
You are nurturing, slightly overprotective, proud of your child, and grounded in everyday home life.
You talk about cooking, the smell of food, the warmth of home, and your happiness that your child finally came downstairs.
You have NO knowledge of technology, AI, or the outside world beyond your small town.

CURRENT OBJECTIVE: Encourage the player to sit down at the dining table and eat. Be warm and celebratory that they came downstairs. Ask them how they slept, comment on the meal you made, and hint that you have something important to tell them before they go off on their journey.`
</script>

<template>
  <div class="scene-container">
    <TresCanvas :clear-color="'#1a1a1e'">
      <TresPerspectiveCamera :position="cameraPosition" :look-at="cameraLookAt" :fov="CAMERA_FOV" :near="CAMERA_NEAR" :far="CAMERA_FAR" />

      <EffectComposerPmndrs>
        <BloomPmndrs :intensity="1.8" :luminance-threshold="0.6" :luminance-smoothing="0.1" :mipmap-blur="true" />
      </EffectComposerPmndrs>

      <Player :initial-position="spawnPosition" />
      <DestinationMarker v-if="store.tapDestination !== null" :position="[store.tapDestination.x, 0, store.tapDestination.z]" />

      <TresGroup>
        <TresAmbientLight :intensity="1.4" />
        <TresDirectionalLight :position="[2, 8, 4]" :intensity="0.5" />

        <!-- Floor tiles -->
        <TresMesh v-for="(tile, i) in floorTiles" :key="`tile-${i}`" :position="[tile.x, 0, tile.z]">
          <TresBoxGeometry :args="[1, 0.05, 1]" />
          <TresMeshLambertMaterial :color="tile.color" />
        </TresMesh>

        <!-- Walls (north split for staircase gap; east + west full; south split for front door) -->
        <Wall id="wall-north-l" :position="[-3.93, 0, -6.25]" :width="6.14" :depth="0.5" color="#7a6548" />
        <Wall id="wall-north-r" :position="[3.93, 0, -6.25]" :width="6.14" :depth="0.5" color="#7a6548" />
        <Wall id="wall-left" :position="[-7.25, 0, 0]" :width="0.5" :depth="13" color="#7a6548" />
        <Wall id="wall-right" :position="[7.25, 0, 0]" :width="0.5" :depth="13" color="#7a6548" />
        <!-- South wall split — gap in the centre implies the front door -->
        <Wall id="wall-south-w" :position="[-3.5, 0, 6.25]" :width="7" :depth="0.5" color="#7a6548" />
        <Wall id="wall-south-e" :position="[3.5, 0, 6.25]" :width="7" :depth="0.5" color="#7a6548" />

        <!-- ── Living room (west) ─────────────────────────────────────── -->
        <Sofa id="living-sofa" name="Sofa" :position="[-4.5, 0, -1.0]" />
        <Table id="coffee-table" name="Coffee Table" :position="[-4.5, 0, 1.0]" />
        <Rug :position="[-4.0, 0, 0.5]" />

        <!-- TV against west wall, rotated to face east into the room -->
        <TV id="living-tv" name="Living Room TV" :position="[-6.3, 0, -0.5]" :rotation="[0, Math.PI / 2, 0]">
          <InteractionIndicator :position="[0, 1.87, 0]" />
        </TV>

        <!-- Decorative plant on a small pedestal stand -->
        <TVStand id="plant-stand" name="Plant Stand" :position="[-5.5, 0, 3.0]">
          <FlowerVase :position="[0, 0.5, 0]" />
        </TVStand>

        <!-- ── Kitchen / dining (east) ───────────────────────────────── -->
        <!-- Counter along north wall -->
        <KitchenCounter id="counter-north" name="Kitchen Counter" :position="[4.5, 0, -5.5]" />
        <!-- Counter along east wall (rotated 90°, collider swapped) -->
        <KitchenCounter
          id="counter-east"
          name="Kitchen Counter"
          :position="[6.5, 0, -3.5]"
          :rotation="[0, Math.PI / 2, 0]"
          :collider-size="{ hw: 0.35, hd: 1.5 }"
        />

        <DiningTable id="dining-table" name="Dining Table" :position="[4.0, 0, 1.5]" />

        <MomNpc id="mom" name="Mom" :position="[3.0, 0, -2.5]" is-static :description="momDescription">
          <InteractionIndicator :position="[0, 1.4, 0]" />
        </MomNpc>

        <!-- ── Staircase — north wall centred, leading upstairs ───────── -->
        <Staircase
          id="first-floor-stairs"
          name="Stairs"
          :position="[0, -0.22, -6.9]"
          target-scene="bedroom"
          target-entrypoint="from-first-floor"
          action-label="Go upstairs"
        >
          <InteractionIndicator :position="[0, 1.3, 0]" />
        </Staircase>
      </TresGroup>
    </TresCanvas>
  </div>
</template>

<style scoped>
.scene-container {
  width: 100%;
  height: 100%;
}
</style>
