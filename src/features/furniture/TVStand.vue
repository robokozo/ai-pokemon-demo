<script setup lang="ts">
import { useEcsEntity } from "../ecs/useEcsEntity"
import { useStaticBody } from "../ecs/useStaticBody"

interface Props {
  name?: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  colliderSize?: { hw: number; hd: number }
  castShadow?: boolean
}

const { name, position = [0, 0, 0], rotation = [0, 0, 0], colliderSize = { hw: 0.6, hd: 0.225 }, castShadow = false } = defineProps<Props>()

const { eid } = useEcsEntity({ name, kind: "prop", position })
useStaticBody({ eid, hw: colliderSize.hw, hd: colliderSize.hd })
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
