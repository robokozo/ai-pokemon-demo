<script setup lang="ts">
import { useEntity } from "../useEntity"

const WALL_HEIGHT = 0.75

interface Props {
  id?: string
  name?: string
  position: [number, number, number]
  width: number
  depth: number
  color?: string
}

const { id, name, position, width, depth, color = "#8b7355" } = defineProps<Props>()

useEntity({ id, name, kind: "prop", collider: "solid", colliderSize: { hw: width / 2, hd: depth / 2 }, isStatic: true, position })
</script>

<template>
  <TresMesh :position="[position[0], WALL_HEIGHT / 2, position[2]]" :cast-shadow="true" :receive-shadow="true">
    <TresBoxGeometry :args="[width, WALL_HEIGHT, depth]" />
    <TresMeshLambertMaterial :color="color" />
  </TresMesh>
</template>
