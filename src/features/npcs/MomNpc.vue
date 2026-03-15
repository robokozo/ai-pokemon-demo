<script setup lang="ts">
import { shallowReactive, onMounted, onUnmounted } from "vue"
import { useSceneStore } from "../useSceneStore"

interface Props {
  initialPosition?: [number, number, number]
}

const { initialPosition = [-1.5, 0, -1.5] } = defineProps<Props>()

const store = useSceneStore()

const position = shallowReactive({ x: initialPosition[0], y: initialPosition[1], z: initialPosition[2] })

const entity = { id: "mom", name: "Mom", kind: "npc" as const, position }

onMounted(() => {
  store.register(entity)
})
onUnmounted(() => {
  store.unregister({ id: "mom" })
})
</script>

<template>
  <TresGroup :position="[position.x, 0, position.z]">
    <!-- Body -->
    <TresMesh :position="[0, 0.3, 0]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.4, 0.5, 0.3]" />
      <TresMeshLambertMaterial color="#e87ca0" />
    </TresMesh>

    <!-- Head -->
    <TresMesh :position="[0, 0.72, 0]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.32, 0.32, 0.32]" />
      <TresMeshLambertMaterial color="#f5cba0" />
    </TresMesh>

    <!-- Hair -->
    <TresMesh :position="[0, 0.9, 0]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.36, 0.18, 0.34]" />
      <TresMeshLambertMaterial color="#6b3a2a" />
    </TresMesh>

    <!-- Slot for InteractionIndicator -->
    <slot />
  </TresGroup>
</template>
