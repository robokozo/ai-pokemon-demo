<script setup lang="ts">
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
    <TresMesh v-for="(tile, i) in floorTiles" :key="`tile-${i}`" :position="[tile.x, 0, tile.z]" :receive-shadow="true">
      <TresBoxGeometry :args="[1, 0.05, 1]" />
      <TresMeshLambertMaterial :color="tile.color" />
    </TresMesh>
  </TresGroup>
</template>
