<script setup lang="ts">
import { shallowReactive, onMounted, onUnmounted } from "vue"
import { useSceneStore } from "../useSceneStore"

interface Props {
  initialPosition?: [number, number, number]
}

const { initialPosition = [0, 0, 1] } = defineProps<Props>()

const store = useSceneStore()

const position = shallowReactive({ x: initialPosition[0], y: initialPosition[1], z: initialPosition[2] })

const entity = { id: "player", name: "Player", kind: "player" as const, position }

onMounted(() => {
  store.register(entity)
})
onUnmounted(() => {
  store.unregister({ id: "player" })
})
</script>

<template>
  <TresGroup :position="[position.x, 0, position.z]">
    <!-- Body -->
    <TresMesh :position="[0, 0.3, 0]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.4, 0.5, 0.3]" />
      <TresMeshLambertMaterial color="#4a90d9" />
    </TresMesh>

    <!-- Head -->
    <TresMesh :position="[0, 0.72, 0]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.32, 0.32, 0.32]" />
      <TresMeshLambertMaterial color="#f5cba0" />
    </TresMesh>

    <!-- Cap -->
    <TresMesh :position="[0, 0.92, -0.02]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.36, 0.14, 0.36]" />
      <TresMeshLambertMaterial color="#e53935" />
    </TresMesh>
  </TresGroup>
</template>
