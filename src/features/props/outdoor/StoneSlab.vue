<script setup lang="ts">
interface Props {
  position?: [number, number, number]
  size?: [number, number, number]
  color?: string
}

const { position = [0, 0, 0], size = [1.2, 0.06, 0.8], color = "#b0a890" } = defineProps<Props>()
</script>

<template>
  <TresMesh :position="position" :receive-shadow="true">
    <TresBoxGeometry :args="size" />
    <TresMeshLambertMaterial :color="color" />
  </TresMesh>
</template>
