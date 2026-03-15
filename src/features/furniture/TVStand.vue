<script setup lang="ts">
import { useEntity } from "../useEntity"

interface Props {
  id?: string
  name?: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  colliderSize?: { hw: number; hd: number }
  castShadow?: boolean
}

const { id, name, position = [0, 0, 0], rotation = [0, 0, 0], colliderSize = { hw: 0.6, hd: 0.225 }, castShadow = false } = defineProps<Props>()

useEntity({ id, name, kind: "prop", collider: "solid", colliderSize, isStatic: true, position })
</script>

<template>
  <TresGroup :position="position" :rotation="rotation">
    <!-- Cabinet body — top surface sits at y = 0.5 -->
    <TresMesh :position="[0, 0.25, 0]" :cast-shadow="castShadow" :receive-shadow="castShadow">
      <TresBoxGeometry :args="[1.2, 0.5, 0.45]" />
      <TresMeshLambertMaterial color="#5a3e28" />
    </TresMesh>
    <!-- Slot: items are positioned relative to this group's origin -->
    <slot />
  </TresGroup>
</template>
