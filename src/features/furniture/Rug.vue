<script setup lang="ts">
interface Props {
  position?: [number, number, number]
}

const { position = [0, 0, 0] } = defineProps<Props>()
</script>

<template>
  <TresGroup :position="position">
    <TresMesh :position="[0, 0.02, 0]" :receive-shadow="true">
      <TresBoxGeometry :args="[3.5, 0.02, 2.5]" />
      <TresMeshLambertMaterial color="#c94a6e" />
    </TresMesh>
  </TresGroup>
</template>
