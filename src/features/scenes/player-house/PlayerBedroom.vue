<script setup lang="ts">
import { computed } from "vue"
import { TresCanvas } from "@tresjs/core"
import { EffectComposerPmndrs, BloomPmndrs } from "@tresjs/post-processing"
import { useSceneStore } from "../../useSceneStore"
import Bed from "../../furniture/Bed.vue"
import Bookshelf from "../../furniture/Bookshelf.vue"
import Rug from "../../furniture/Rug.vue"
import Wall from "../../furniture/Wall.vue"
import TVStand from "../../furniture/TVStand.vue"
import Radio from "../../props/radio/Radio.vue"
import TV from "../../props/tv/TV.vue"
import FlowerVase from "../../props/FlowerVase.vue"
import Staircase from "../../transitions/Staircase.vue"
import Player from "../../player/Player.vue"
import DestinationMarker from "../../player/DestinationMarker.vue"
import InteractionIndicator from "../../ui/InteractionIndicator.vue"

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

const store = useSceneStore()

// ── Entry points ───────────────────────────────────────────────────────────────
const ENTRY_POINTS: Record<string, [number, number, number]> = {
  default: [0, 0, 1],
  "from-first-floor": [0, 0, 2.8],
}

const spawnPosition = computed<[number, number, number]>(() => ENTRY_POINTS[store.activeEntrypoint] ?? ENTRY_POINTS["default"])

// ── Camera ────────────────────────────────────────────────────────────────────
const CAMERA_FOV = 45
const CAMERA_NEAR = 0.1
const CAMERA_FAR = 100
const CAMERA_OFFSET = { x: 0, y: 8, z: 5 }

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
</script>

<template>
  <div class="scene-container">
    <TresCanvas :clear-color="'#1a1a2e'">
      <TresPerspectiveCamera :position="cameraPosition" :look-at="cameraLookAt" :fov="CAMERA_FOV" :near="CAMERA_NEAR" :far="CAMERA_FAR" />

      <EffectComposerPmndrs>
        <BloomPmndrs :intensity="1.8" :luminance-threshold="0.6" :luminance-smoothing="0.1" :mipmap-blur="true" />
      </EffectComposerPmndrs>

      <Player :initial-position="spawnPosition" />
      <DestinationMarker v-if="store.tapDestination !== null" :position="[store.tapDestination.x, 0, store.tapDestination.z]" />

      <TresGroup>
        <TresAmbientLight :intensity="1.5" />
        <TresDirectionalLight :position="[2, 6, 3]" :intensity="0.4" />

        <TresMesh v-for="(tile, i) in floorTiles" :key="`tile-${i}`" :position="[tile.x, 0, tile.z]">
          <TresBoxGeometry :args="[1, 0.05, 1]" />
          <TresMeshLambertMaterial :color="tile.color" />
        </TresMesh>

        <Wall id="wall-top" :position="[0, 0, -4.25]" :width="10" :depth="0.5" color="#8b7355" />
        <!-- Bottom wall split to leave a gap for the staircase -->
        <!-- Bottom wall split to leave a gap for the staircase -->
        <!-- Bottom wall split — gap matches staircase width including outer rail edges (±0.86) -->
        <Wall id="wall-bottom-l" :position="[-2.93, 0, 4.25]" :width="4.14" :depth="0.5" color="#8b7355" />
        <Wall id="wall-bottom-r" :position="[2.93, 0, 4.25]" :width="4.14" :depth="0.5" color="#8b7355" />
        <Wall id="wall-left" :position="[-5.25, 0, 0]" :width="0.5" :depth="9" color="#7a6548" />
        <Wall id="wall-right" :position="[5.25, 0, 0]" :width="0.5" :depth="9" color="#7a6548" />

        <Bed :position="[3.5, 0, -2.8]" />
        <Bookshelf :position="[-4.8, 0, -2.5]" />
        <Rug :position="[0, 0, 0.5]" />

        <Radio :position="[-3.5, 0, 0.5]">
          <InteractionIndicator :position="[0, 1.35, 0]" />
        </Radio>

        <TV :position="[4.86, 0, 0]" :rotation="[0, -Math.PI / 2, 0]">
          <InteractionIndicator :position="[0, 1.87, 0]" />
        </TV>

        <!-- Side table with flower vase along the back wall -->
        <TVStand id="vase-stand" name="Side Table" :position="[1.5, 0, -3.8]">
          <FlowerVase :position="[0, 0.5, 0]" />
        </TVStand>

        <!-- Staircase — south wall, centred, steps descend into room -->
        <Staircase
          id="bedroom-stairs"
          name="Stairs"
          :position="[0, -0.66, 4.9]"
          :rotation="[0, 0, 0]"
          target-scene="first-floor"
          target-entrypoint="from-bedroom"
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
