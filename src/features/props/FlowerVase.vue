<script setup lang="ts">
interface Props {
  position?: [number, number, number]
}

const { position = [0, 0, 0] } = defineProps<Props>()
</script>

<template>
  <TresGroup :position="position">
    <!-- Pot base -->
    <TresMesh :position="[0, 0.07, 0]">
      <TresCylinderGeometry :args="[0.07, 0.05, 0.14, 8]" />
      <TresMeshLambertMaterial color="#c0622f" />
    </TresMesh>
    <!-- Pot rim -->
    <TresMesh :position="[0, 0.155, 0]">
      <TresCylinderGeometry :args="[0.085, 0.07, 0.03, 8]" />
      <TresMeshLambertMaterial color="#a84e22" />
    </TresMesh>

    <!-- Stem -->
    <TresMesh :position="[0, 0.42, 0]">
      <TresBoxGeometry :args="[0.025, 0.44, 0.025]" />
      <TresMeshLambertMaterial color="#3a7a2a" />
    </TresMesh>
    <!-- Leaf left -->
    <TresMesh :position="[-0.07, 0.34, 0]" :rotation="[0, 0, 0.4]">
      <TresBoxGeometry :args="[0.1, 0.035, 0.03]" />
      <TresMeshLambertMaterial color="#2d8a2d" />
    </TresMesh>
    <!-- Leaf right -->
    <TresMesh :position="[0.07, 0.44, 0]" :rotation="[0, 0, -0.4]">
      <TresBoxGeometry :args="[0.1, 0.035, 0.03]" />
      <TresMeshLambertMaterial color="#2d8a2d" />
    </TresMesh>

    <!-- Flower cluster — three blooms with a tiny emissive glow -->
    <TresMesh :position="[-0.04, 0.68, 0]">
      <TresBoxGeometry :args="[0.1, 0.1, 0.1]" />
      <TresMeshLambertMaterial color="#e860a0" :emissive="'#e860a0'" :emissive-intensity="0.3" />
    </TresMesh>
    <TresMesh :position="[0.06, 0.72, 0.02]">
      <TresBoxGeometry :args="[0.09, 0.09, 0.09]" />
      <TresMeshLambertMaterial color="#e83030" :emissive="'#e83030'" :emissive-intensity="0.3" />
    </TresMesh>
    <TresMesh :position="[0.01, 0.75, -0.04]">
      <TresBoxGeometry :args="[0.09, 0.09, 0.09]" />
      <TresMeshLambertMaterial color="#f8c030" :emissive="'#f8c030'" :emissive-intensity="0.4" />
    </TresMesh>
  </TresGroup>
</template>
