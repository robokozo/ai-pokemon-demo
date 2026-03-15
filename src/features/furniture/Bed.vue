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
  id: "bed",
  name: "Bed",
  kind: "prop" as const,
  collider: "solid" as const,
  // Frame geometry: 1.8 × 2.4 → half-extents 0.9, 1.2
  colliderSize: { hw: 0.9, hd: 1.2 },
  position,
}

onMounted(() => {
  store.register(entity)
})
onUnmounted(() => {
  store.unregister({ id: "bed" })
})
</script>

<template>
  <TresGroup :position="initialPosition">
    <!-- Frame -->
    <TresMesh :position="[0, 0.15, 0]" :cast-shadow="true" :receive-shadow="true">
      <TresBoxGeometry :args="[1.8, 0.3, 2.4]" />
      <TresMeshLambertMaterial color="#3a7bd5" />
    </TresMesh>

    <!-- Mattress -->
    <TresMesh :position="[0, 0.5, 0]" :cast-shadow="true" :receive-shadow="true">
      <TresBoxGeometry :args="[1.6, 0.4, 2.2]" />
      <TresMeshLambertMaterial color="#e8c4a0" />
    </TresMesh>

    <!-- Pillow -->
    <TresMesh :position="[0, 0.725, -1.0]" :cast-shadow="true">
      <TresBoxGeometry :args="[1.6, 0.45, 0.4]" />
      <TresMeshLambertMaterial color="#fff8f0" />
    </TresMesh>
  </TresGroup>
</template>
