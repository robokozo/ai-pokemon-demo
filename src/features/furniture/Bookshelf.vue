<script setup lang="ts">
import { useEcsEntity } from "../ecs/useEcsEntity"

interface Props {
  id?: string
  name?: string
  position?: [number, number, number]
  castShadow?: boolean
}

const { id, name, position = [0, 0, 0], castShadow = false } = defineProps<Props>()

useEcsEntity({ id, name, kind: "prop", collider: "solid", colliderSize: { hw: 0.2, hd: 1.0 }, isStatic: true, position })
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
