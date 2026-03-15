<script setup lang="ts">
interface Props {
  position?: [number, number, number]
  size?: [number, number, number]
  color?: string
}

const { position = [0, 0, 0], size = [0.5, 0.24, 0.4], color = "#8a8a7a" } = defineProps<Props>()
</script>

<template>
  <TresMesh :position="position">
    <TresBoxGeometry :args="size" />
    <TresMeshLambertMaterial :color="color" />
  </TresMesh>
</template>
