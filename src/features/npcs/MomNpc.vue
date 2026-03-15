<script setup lang="ts">
import { useEntity } from "../useEntity"

interface Props {
  id?: string
  name?: string
  position?: [number, number, number]
  isStatic?: true
}

const { id, name, position = [-1.5, 0, -1.5], isStatic } = defineProps<Props>()

const { position: entityPosition } = useEntity({ id, name, kind: "npc", collider: "solid", interactive: true, isStatic, position })
</script>

<template>
  <TresGroup :position="[entityPosition.x, entityPosition.y, entityPosition.z]">
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
