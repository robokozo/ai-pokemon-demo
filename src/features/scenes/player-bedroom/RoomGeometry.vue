<script setup lang="ts">
import { ROOM_WIDTH, ROOM_HEIGHT } from "../../usePlayerMovement"

interface Tile {
  x: number
  z: number
  color: string
}

interface Wall {
  x: number
  z: number
  sx: number
  sy: number
  sz: number
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

const walls: Array<Wall> = [
  // top wall
  { x: 0, z: -ROOM_HEIGHT / 2 - 0.25, sx: ROOM_WIDTH, sy: 0.75, sz: 0.5, color: "#8b7355" },
  // bottom wall
  { x: 0, z: ROOM_HEIGHT / 2 + 0.25, sx: ROOM_WIDTH, sy: 0.75, sz: 0.5, color: "#8b7355" },
  // left wall
  { x: -ROOM_WIDTH / 2 - 0.25, z: 0, sx: 0.5, sy: 0.75, sz: ROOM_HEIGHT + 1, color: "#7a6548" },
  // right wall
  { x: ROOM_WIDTH / 2 + 0.25, z: 0, sx: 0.5, sy: 0.75, sz: ROOM_HEIGHT + 1, color: "#7a6548" },
]
</script>

<template>
  <TresGroup>
    <TresMesh v-for="(tile, i) in floorTiles" :key="`tile-${i}`" :position="[tile.x, 0, tile.z]" :receive-shadow="true">
      <TresBoxGeometry :args="[1, 0.05, 1]" />
      <TresMeshLambertMaterial :color="tile.color" />
    </TresMesh>

    <TresMesh v-for="(wall, i) in walls" :key="`wall-${i}`" :position="[wall.x, wall.sy / 2, wall.z]" :cast-shadow="true" :receive-shadow="true">
      <TresBoxGeometry :args="[wall.sx, wall.sy, wall.sz]" />
      <TresMeshLambertMaterial :color="wall.color" />
    </TresMesh>
  </TresGroup>
</template>
