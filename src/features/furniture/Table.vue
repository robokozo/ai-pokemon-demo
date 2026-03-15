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
  id: "table",
  name: "Table",
  kind: "prop" as const,
  collider: "solid" as const,
  // Surface geometry: 1.2 × 0.8 → half-extents 0.6, 0.4
  colliderSize: { hw: 0.6, hd: 0.4 },
  position,
}

onMounted(() => {
  store.register(entity)
})
onUnmounted(() => {
  store.unregister({ id: "table" })
})
</script>

<template>
  <TresGroup :position="initialPosition">
    <!-- Surface -->
    <TresMesh :position="[0, 0.55, 0]" :cast-shadow="true" :receive-shadow="true">
      <TresBoxGeometry :args="[1.2, 0.1, 0.8]" />
      <TresMeshLambertMaterial color="#a07850" />
    </TresMesh>

    <!-- Leg -->
    <TresMesh :position="[0, 0.25, 0]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.08, 0.5, 0.08]" />
      <TresMeshLambertMaterial color="#7a5830" />
    </TresMesh>
  </TresGroup>
</template>
