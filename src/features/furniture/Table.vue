<script setup lang="ts">
import { useEntity } from "../useEntity"

interface Props {
  position?: [number, number, number]
}

const { position = [0, 0, 0] } = defineProps<Props>()

useEntity({ id: "table", name: "Table", kind: "prop", collider: "solid", colliderSize: { hw: 0.6, hd: 0.4 }, isStatic: true, position })
</script>

<template>
  <TresGroup :position="position">
    <!-- Surface -->
    <TresMesh :position="[0, 0.55, 0]" :cast-shadow="true" :receive-shadow="true">
      <TresBoxGeometry :args="[1.2, 0.1, 0.8]" />
      <TresMeshLambertMaterial color="#a07850" />
    </TresMesh>

    <!-- Leg -->
    <TresMesh :position="[0, 0.25, 0]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.08, 0.5, 0.08]" />
      <TresMeshLambertMaterial color="#7a5830" />
    </TresMesh>
  </TresGroup>
</template>
