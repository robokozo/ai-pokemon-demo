<script setup lang="ts">
import Bed from "../../furniture/Bed.vue"
import Bookshelf from "../../furniture/Bookshelf.vue"
import Rug from "../../furniture/Rug.vue"
import Wall from "../../furniture/Wall.vue"

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
</script>

<template>
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

    <!-- Interactive objects + NPCs passed in from GameScene -->
    <slot />
  </TresGroup>
</template>
