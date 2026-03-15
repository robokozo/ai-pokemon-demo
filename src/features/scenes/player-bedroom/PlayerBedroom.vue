<script setup lang="ts">
import { computed } from "vue"
import { TresCanvas } from "@tresjs/core"
import { EffectComposerPmndrs, BloomPmndrs } from "@tresjs/post-processing"
import * as THREE from "three"
import { useSceneStore } from "../../useSceneStore"
import Bed from "../../furniture/Bed.vue"
import Bookshelf from "../../furniture/Bookshelf.vue"
import Rug from "../../furniture/Rug.vue"
import Wall from "../../furniture/Wall.vue"
import Radio from "../../props/radio/Radio.vue"
import TV from "../../props/tv/TV.vue"
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
function handlePointerDown(event: PointerEvent) {
  if (store.paused === true) return
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
    const player = store.getPlayer()
    const fromX = player !== null ? player.position.x : 0
    const fromZ = player !== null ? player.position.z : 0
    const resolved = store.resolveDestination(fromX, fromZ, worldPoint.x, worldPoint.z)
    store.setTapDestination({ x: resolved.x, y: 0, z: resolved.z })
  }
}

// ── NPC descriptions ──────────────────────────────────────────────────────────
const momDescription = `Your name is Mom. You are the player's warm, loving mother in a small RPG town.
You just cooked a home-cooked meal for your child before they leave on their adventure.
You are nurturing, slightly overprotective, proud of your child, and grounded in everyday home life.
You talk about things like cooking, the house, the town, your child's wellbeing, and your worry about them leaving.
You have NO knowledge of technology, AI, or the outside world beyond your small town.

CURRENT OBJECTIVE: You want your child to come downstairs. No matter what the player says, gently steer the conversation toward getting them to go downstairs — the meal is ready, it's getting cold, or you have something important to tell them down there. Be persistent but loving about it.`
</script>

<template>
  <div class="scene-container" @pointerdown="handlePointerDown">
    <TresCanvas :clear-color="'#1a1a2e'" :shadows="true" :tone-mapping="THREE.ACESFilmicToneMapping" :tone-mapping-exposure="1.2">
      <TresPerspectiveCamera :position="cameraPosition" :look-at="cameraLookAt" :fov="CAMERA_FOV" :near="CAMERA_NEAR" :far="CAMERA_FAR" />

      <EffectComposerPmndrs>
        <BloomPmndrs :intensity="1.8" :luminance-threshold="0.6" :luminance-smoothing="0.1" :mipmap-blur="true" />
      </EffectComposerPmndrs>

      <Player />
      <DestinationMarker v-if="store.tapDestination !== null" :position="[store.tapDestination.x, 0, store.tapDestination.z]" />

      <TresGroup>
        <TresAmbientLight :intensity="0.6" color="#fff8e8" />
        <TresDirectionalLight :position="[2, 6, 3]" :intensity="1.2" color="#fff8e8" :cast-shadow="true" />
        <TresPointLight :position="[-2, 3, 2]" color="#ffd4a0" :intensity="0.8" :distance="8" />

        <TresMesh v-for="(tile, i) in floorTiles" :key="`tile-${i}`" :position="[tile.x, 0, tile.z]" :receive-shadow="true">
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
