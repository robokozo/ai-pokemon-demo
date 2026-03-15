<script setup lang="ts">
import { useEntity } from "../../useEntity"

interface Props {
  id?: string
  name?: string
  position?: [number, number, number]
  castShadow?: boolean
}

const { id, name = "Oak Tree", position = [0, 0, 0], castShadow = false } = defineProps<Props>()

useEntity({
  id,
  name,
  kind: "prop",
  collider: "solid",
  colliderSize: { hw: 0.4, hd: 0.4 },
  isStatic: true,
  position,
})
</script>

<template>
  <TresGroup :position="position">
    <!-- Trunk -->
    <TresMesh :position="[0, 0.6, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.3, 1.2, 0.3]" />
      <TresMeshLambertMaterial color="#6b4226" />
    </TresMesh>

    <!-- Canopy — lower layer (wide) -->
    <TresMesh :position="[0, 1.5, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[1.6, 0.8, 1.6]" />
      <TresMeshLambertMaterial color="#2d6e2d" />
    </TresMesh>

    <!-- Canopy — upper layer (narrower) -->
    <TresMesh :position="[0, 2.1, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[1.1, 0.7, 1.1]" />
      <TresMeshLambertMaterial color="#3a8a3a" />
    </TresMesh>

    <!-- Canopy — top tuft -->
    <TresMesh :position="[0, 2.6, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.6, 0.4, 0.6]" />
      <TresMeshLambertMaterial color="#4a9a4a" />
    </TresMesh>
  </TresGroup>
</template>
