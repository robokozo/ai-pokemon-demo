<script setup lang="ts">
interface Props {
  position: [number, number, number];
}

// The marker hovers just above the floor surface
const MARKER_HEIGHT = 0.04;

const { position } = defineProps<Props>();
</script>

<template>
  <TresMesh :position="[position[0], MARKER_HEIGHT, position[2]]">
    <TresCylinderGeometry :args="[0.22, 0.22, 0.04, 16]" />
    <TresMeshLambertMaterial
      color="#ffd700"
      :emissive="'#ffd700'"
      :emissive-intensity="0.6"
      :transparent="true"
      :opacity="0.75"
    />
  </TresMesh>
</template>
