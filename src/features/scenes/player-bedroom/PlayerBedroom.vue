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
import MomNpc from "../../npcs/MomNpc.vue"
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

// ── NPC descriptions ──────────────────────────────────────────────────────────
const momDescription = `Your name is Mom. You are the player's warm, loving mother in a small RPG town.
You just cooked a home-cooked meal for your child before they leave on their adventure.
You are nurturing, slightly overprotective, proud of your child, and grounded in everyday home life.
You talk about things like cooking, the house, the town, your child's wellbeing, and your worry about them leaving.
You have NO knowledge of technology, AI, or the outside world beyond your small town.

CURRENT OBJECTIVE: You want your child to come downstairs. No matter what the player says, gently steer the conversation toward getting them to go downstairs — the meal is ready, it's getting cold, or you have something important to tell them down there. Be persistent but loving about it.`
</script>

<template>
  <div class="scene-container">
    <TresCanvas :clear-color="'#1a1a2e'">
      <TresPerspectiveCamera :position="cameraPosition" :look-at="cameraLookAt" :fov="CAMERA_FOV" :near="CAMERA_NEAR" :far="CAMERA_FAR" />

      <EffectComposerPmndrs>
        <BloomPmndrs :intensity="1.8" :luminance-threshold="0.6" :luminance-smoothing="0.1" :mipmap-blur="true" />
      </EffectComposerPmndrs>

      <Player />
      <DestinationMarker v-if="store.tapDestination !== null" :position="[store.tapDestination.x, 0, store.tapDestination.z]" />

      <TresGroup>
        <TresAmbientLight :intensity="1.5" />
        <TresDirectionalLight :position="[2, 6, 3]" :intensity="0.4" />

        <TresMesh v-for="(tile, i) in floorTiles" :key="`tile-${i}`" :position="[tile.x, 0, tile.z]">
          <TresBoxGeometry :args="[1, 0.05, 1]" />
          <TresMeshLambertMaterial :color="tile.color" />
        </TresMesh>

        <Wall id="wall-top" :position="[0, 0, -4.25]" :width="10" :depth="0.5" color="#8b7355" />
        <Wall id="wall-bottom" :position="[0, 0, 4.25]" :width="10" :depth="0.5" color="#8b7355" />
        <Wall id="wall-left" :position="[-5.25, 0, 0]" :width="0.5" :depth="9" color="#7a6548" />
        <Wall id="wall-right" :position="[5.25, 0, 0]" :width="0.5" :depth="9" color="#7a6548" />

        <Bed :position="[3.5, 0, -2.8]" />
        <Bookshelf :position="[-3.8, 0, -2.5]" />
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

        <MomNpc id="mom" name="Mom" is-static :description="momDescription">
          <InteractionIndicator :position="[0, 1.4, 0]" />
        </MomNpc>
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
