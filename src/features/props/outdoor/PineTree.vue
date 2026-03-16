<script setup lang="ts">
import { useEcsEntity } from "../../ecs/useEcsEntity"

interface Props {
  id?: string
  name?: string
  position?: [number, number, number]
  castShadow?: boolean
}

const { id, name = "Pine Tree", position = [0, 0, 0], castShadow = false } = defineProps<Props>()

useEcsEntity({
  id,
  name,
  kind: "prop",
  collider: "solid",
  colliderSize: { hw: 0.35, hd: 0.35 },
  isStatic: true,
  position,
})
</script>

<template>
  <TresGroup :position="position">
    <!-- Trunk -->
    <TresMesh :position="[0, 0.5, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.22, 1.0, 0.22]" />
      <TresMeshLambertMaterial color="#5a3a1a" />
    </TresMesh>

    <!-- Foliage — bottom tier (widest) -->
    <TresMesh :position="[0, 1.2, 0]" :cast-shadow="castShadow">
      <TresConeGeometry :args="[0.9, 0.9, 6]" />
      <TresMeshLambertMaterial color="#1a5c2a" />
    </TresMesh>

    <!-- Foliage — middle tier -->
    <TresMesh :position="[0, 1.8, 0]" :cast-shadow="castShadow">
      <TresConeGeometry :args="[0.7, 0.8, 6]" />
      <TresMeshLambertMaterial color="#226633" />
    </TresMesh>

    <!-- Foliage — top tier (smallest) -->
    <TresMesh :position="[0, 2.3, 0]" :cast-shadow="castShadow">
      <TresConeGeometry :args="[0.5, 0.7, 6]" />
      <TresMeshLambertMaterial color="#2a7a3a" />
    </TresMesh>
  </TresGroup>
</template>
