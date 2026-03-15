<script setup lang="ts">
import { onMounted, onUnmounted } from "vue"
import { useSceneStore } from "../useSceneStore"

interface Props {
  initialPosition?: [number, number, number]
}

const { initialPosition = [0, 0, 0] } = defineProps<Props>()

const store = useSceneStore()
const position = { x: initialPosition[0], y: initialPosition[1], z: initialPosition[2] }

const entity = {
  id: "bookshelf",
  name: "Bookshelf",
  kind: "prop" as const,
  collider: "solid" as const,
  // Shelf geometry: 0.4 wide × 2.0 deep → half-extents 0.2, 1.0
  colliderSize: { hw: 0.2, hd: 1.0 },
  position,
}

onMounted(() => {
  store.register(entity)
})
onUnmounted(() => {
  store.unregister({ id: "bookshelf" })
})
</script>

<template>
  <TresGroup :position="initialPosition">
    <!-- Shelf unit -->
    <TresMesh :position="[0, 0.5, 0]" :cast-shadow="true" :receive-shadow="true">
      <TresBoxGeometry :args="[0.4, 1.0, 2.0]" />
      <TresMeshLambertMaterial color="#6b4c2a" />
    </TresMesh>

    <!-- Book spines -->
    <TresMesh :position="[0, 0.5, 0]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.05, 0.9, 1.8]" />
      <TresMeshLambertMaterial color="#e8d0c0" />
    </TresMesh>
  </TresGroup>
</template>
