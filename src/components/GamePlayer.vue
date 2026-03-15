<script setup lang="ts">
interface Props {
  position: [number, number, number];
}

const { position } = defineProps<Props>();
</script>

<template>
  <TresGroup :position="[position[0], 0, position[2]]">
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
