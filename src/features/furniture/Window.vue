<script setup lang="ts">
interface Props {
  position?: [number, number, number]
}

const { position = [0, 0, 0] } = defineProps<Props>()
</script>

<template>
  <TresGroup :position="position">
    <!-- Glass pane -->
    <TresMesh :position="[0, 0.9, 0]">
      <TresBoxGeometry :args="[1.2, 0.8, 0.1]" />
      <TresMeshLambertMaterial color="#87ceeb" />
    </TresMesh>

    <!-- Frame -->
    <TresMesh :position="[0, 1.0, 0]">
      <TresBoxGeometry :args="[1.4, 1.0, 0.12]" />
      <TresMeshLambertMaterial color="#5a4025" />
    </TresMesh>
  </TresGroup>
</template>
