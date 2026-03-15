<script setup lang="ts">
import { useEntity } from "../useEntity"

interface Props {
  position?: [number, number, number]
  rotation?: [number, number, number]
}

const { position = [0, 0, 0], rotation = [0, 0, 0] } = defineProps<Props>()

useEntity({
  name: "TableWithSlots",
  kind: "prop",
  collider: "solid",
  colliderSize: { hw: 0.45, hd: 0.28 },
  isStatic: true,
  position,
})
</script>

<template>
  <TresGroup :position="position" :rotation="rotation">
    <!-- Table surface -->
    <TresMesh :position="[0, 0.55, 0]" :cast-shadow="true" :receive-shadow="true">
      <TresBoxGeometry :args="[0.9, 0.06, 0.55]" />
      <TresMeshLambertMaterial color="#a07850" />
    </TresMesh>
    <!-- Table legs -->
    <TresMesh :position="[-0.38, 0.28, -0.22]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.06, 0.56, 0.06]" />
      <TresMeshLambertMaterial color="#7a5830" />
    </TresMesh>
    <TresMesh :position="[0.38, 0.28, -0.22]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.06, 0.56, 0.06]" />
      <TresMeshLambertMaterial color="#7a5830" />
    </TresMesh>
    <TresMesh :position="[-0.38, 0.28, 0.22]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.06, 0.56, 0.06]" />
      <TresMeshLambertMaterial color="#7a5830" />
    </TresMesh>
    <TresMesh :position="[0.38, 0.28, 0.22]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.06, 0.56, 0.06]" />
      <TresMeshLambertMaterial color="#7a5830" />
    </TresMesh>
    <!-- Slot for content above the table -->
    <slot name="above" />
    <!-- Slot for content below the table -->
    <slot name="below" />
  </TresGroup>
</template>
