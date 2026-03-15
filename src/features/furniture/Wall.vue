<script setup lang="ts">
import { onMounted, onUnmounted } from "vue"
import { useSceneStore } from "../useSceneStore"

const WALL_HEIGHT = 0.75

interface Props {
  id: string
  initialPosition: [number, number, number]
  width: number
  depth: number
  color?: string
}

const { id, initialPosition, width, depth, color = "#8b7355" } = defineProps<Props>()

const store = useSceneStore()
const position = { x: initialPosition[0], y: initialPosition[1], z: initialPosition[2] }

const entity = {
  id,
  name: "Wall",
  kind: "prop" as const,
  collider: "solid" as const,
  colliderSize: { hw: width / 2, hd: depth / 2 },
  position,
}

onMounted(() => {
  store.register(entity)
})
onUnmounted(() => {
  store.unregister({ id })
})
</script>

<template>
  <TresMesh :position="[initialPosition[0], WALL_HEIGHT / 2, initialPosition[2]]" :cast-shadow="true" :receive-shadow="true">
    <TresBoxGeometry :args="[width, WALL_HEIGHT, depth]" />
    <TresMeshLambertMaterial :color="color" />
  </TresMesh>
</template>
