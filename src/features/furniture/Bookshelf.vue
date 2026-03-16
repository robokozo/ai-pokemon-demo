<script setup lang="ts">
import { useEcsEntity } from "../ecs/useEcsEntity"
import { useStaticBody } from "../ecs/useStaticBody"

interface Props {
  name?: string
  position?: [number, number, number]
  castShadow?: boolean
}

const { name, position = [0, 0, 0], castShadow = false } = defineProps<Props>()

const { eid } = useEcsEntity({ name, kind: "prop", position })
useStaticBody({ eid, hw: 0.2, hd: 1.0 })
</script>

<template>
  <TresGroup :position="position">
    <!-- Shelf unit -->
    <TresMesh :position="[0, 0.5, 0]" :cast-shadow="castShadow" :receive-shadow="castShadow">
      <TresBoxGeometry :args="[0.4, 1.0, 2.0]" />
      <TresMeshLambertMaterial color="#6b4c2a" />
    </TresMesh>

    <!-- Book spines -->
    <TresMesh :position="[0, 0.5, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.05, 0.9, 1.8]" />
      <TresMeshLambertMaterial color="#e8d0c0" />
    </TresMesh>
  </TresGroup>
</template>
