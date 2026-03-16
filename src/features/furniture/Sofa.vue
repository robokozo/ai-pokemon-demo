<script setup lang="ts">
import { useEcsEntity } from "../ecs/useEcsEntity"
import { useStaticBody } from "../ecs/useStaticBody"

interface Props {
  name?: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  castShadow?: boolean
}

const { name = "Sofa", position = [0, 0, 0], rotation = [0, 0, 0], castShadow = false } = defineProps<Props>()

const { eid } = useEcsEntity({ name, kind: "prop", position })
useStaticBody({ eid, hw: 1.1, hd: 0.5 })
</script>

<template>
  <TresGroup :position="position" :rotation="rotation">
    <!-- Base frame -->
    <TresMesh :position="[0, 0.15, 0]" :cast-shadow="castShadow" :receive-shadow="true">
      <TresBoxGeometry :args="[2.0, 0.3, 0.8]" />
      <TresMeshLambertMaterial color="#3a5a6a" />
    </TresMesh>

    <!-- Seat cushion left -->
    <TresMesh :position="[-0.5, 0.41, 0.05]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.88, 0.22, 0.65]" />
      <TresMeshLambertMaterial color="#5a8a9a" />
    </TresMesh>

    <!-- Seat cushion right -->
    <TresMesh :position="[0.5, 0.41, 0.05]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.88, 0.22, 0.65]" />
      <TresMeshLambertMaterial color="#5a8a9a" />
    </TresMesh>

    <!-- Backrest -->
    <TresMesh :position="[0, 0.67, -0.3]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[1.9, 0.55, 0.18]" />
      <TresMeshLambertMaterial color="#4a7a8a" />
    </TresMesh>

    <!-- Armrest left -->
    <TresMesh :position="[-1.0, 0.45, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.18, 0.45, 0.8]" />
      <TresMeshLambertMaterial color="#3a5a6a" />
    </TresMesh>

    <!-- Armrest right -->
    <TresMesh :position="[1.0, 0.45, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.18, 0.45, 0.8]" />
      <TresMeshLambertMaterial color="#3a5a6a" />
    </TresMesh>
  </TresGroup>
</template>
