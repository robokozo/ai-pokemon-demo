<script setup lang="ts">
interface Props {
  position?: [number, number, number];
}

const { position = [0, 0, 0] } = defineProps<Props>();
</script>

<template>
  <TresGroup :position="position">
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
