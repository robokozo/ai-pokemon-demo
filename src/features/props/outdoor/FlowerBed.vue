<script setup lang="ts">
interface FlowerConfig {
  position: [number, number, number]
  size: [number, number, number]
  color: string
}

interface Props {
  position?: [number, number, number]
  flowers?: Array<FlowerConfig>
}

const EMISSIVE_INTENSITY = 0.3

const { position = [0, 0, 0], flowers = [] } = defineProps<Props>()
</script>

<template>
  <TresGroup :position="position">
    <!-- Dirt bed -->
    <TresMesh :position="[0, 0.08, 0]">
      <TresBoxGeometry :args="[1.2, 0.16, 0.8]" />
      <TresMeshLambertMaterial color="#4a3a2a" />
    </TresMesh>

    <!-- Flowers -->
    <TresMesh v-for="(flower, i) in flowers" :key="`flower-${i}`" :position="flower.position">
      <TresBoxGeometry :args="flower.size" />
      <TresMeshStandardMaterial :color="flower.color" :emissive="flower.color" :emissive-intensity="EMISSIVE_INTENSITY" />
    </TresMesh>
  </TresGroup>
</template>
