<script setup lang="ts">
import { useEcsEntity } from "../ecs/useEcsEntity"

interface Props {
  id?: string
  name?: string
  position?: [number, number, number]
  castShadow?: boolean
}

const { id = "dining-table", name = "Dining Table", position = [0, 0, 0], castShadow = false } = defineProps<Props>()

useEcsEntity({ id, name, kind: "prop", collider: "solid", colliderSize: { hw: 1.3, hd: 0.85 }, isStatic: true, position })
</script>

<template>
  <TresGroup :position="position">
    <!-- Table top -->
    <TresMesh :position="[0, 0.65, 0]" :cast-shadow="castShadow" :receive-shadow="true">
      <TresBoxGeometry :args="[1.8, 0.08, 1.2]" />
      <TresMeshLambertMaterial color="#8c6a3a" />
    </TresMesh>

    <!-- Table legs -->
    <TresMesh :position="[-0.8, 0.32, -0.5]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.07, 0.65, 0.07]" />
      <TresMeshLambertMaterial color="#6a4a22" />
    </TresMesh>
    <TresMesh :position="[0.8, 0.32, -0.5]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.07, 0.65, 0.07]" />
      <TresMeshLambertMaterial color="#6a4a22" />
    </TresMesh>
    <TresMesh :position="[-0.8, 0.32, 0.5]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.07, 0.65, 0.07]" />
      <TresMeshLambertMaterial color="#6a4a22" />
    </TresMesh>
    <TresMesh :position="[0.8, 0.32, 0.5]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.07, 0.65, 0.07]" />
      <TresMeshLambertMaterial color="#6a4a22" />
    </TresMesh>

    <!-- Chair North — seat -->
    <TresMesh :position="[0, 0.44, -1.05]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.4, 0.05, 0.4]" />
      <TresMeshLambertMaterial color="#9a7a4a" />
    </TresMesh>
    <!-- Chair North — backrest -->
    <TresMesh :position="[0, 0.65, -1.23]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.4, 0.4, 0.05]" />
      <TresMeshLambertMaterial color="#7a5a2a" />
    </TresMesh>
    <!-- Chair North — legs -->
    <TresMesh :position="[-0.17, 0.22, -0.87]"><TresBoxGeometry :args="[0.04, 0.44, 0.04]" /><TresMeshLambertMaterial color="#6a4a22" /></TresMesh>
    <TresMesh :position="[0.17, 0.22, -0.87]"><TresBoxGeometry :args="[0.04, 0.44, 0.04]" /><TresMeshLambertMaterial color="#6a4a22" /></TresMesh>
    <TresMesh :position="[-0.17, 0.22, -1.23]"><TresBoxGeometry :args="[0.04, 0.44, 0.04]" /><TresMeshLambertMaterial color="#6a4a22" /></TresMesh>
    <TresMesh :position="[0.17, 0.22, -1.23]"><TresBoxGeometry :args="[0.04, 0.44, 0.04]" /><TresMeshLambertMaterial color="#6a4a22" /></TresMesh>

    <!-- Chair South — seat -->
    <TresMesh :position="[0, 0.44, 1.05]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.4, 0.05, 0.4]" />
      <TresMeshLambertMaterial color="#9a7a4a" />
    </TresMesh>
    <!-- Chair South — backrest -->
    <TresMesh :position="[0, 0.65, 1.23]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.4, 0.4, 0.05]" />
      <TresMeshLambertMaterial color="#7a5a2a" />
    </TresMesh>
    <!-- Chair South — legs -->
    <TresMesh :position="[-0.17, 0.22, 0.87]"><TresBoxGeometry :args="[0.04, 0.44, 0.04]" /><TresMeshLambertMaterial color="#6a4a22" /></TresMesh>
    <TresMesh :position="[0.17, 0.22, 0.87]"><TresBoxGeometry :args="[0.04, 0.44, 0.04]" /><TresMeshLambertMaterial color="#6a4a22" /></TresMesh>
    <TresMesh :position="[-0.17, 0.22, 1.23]"><TresBoxGeometry :args="[0.04, 0.44, 0.04]" /><TresMeshLambertMaterial color="#6a4a22" /></TresMesh>
    <TresMesh :position="[0.17, 0.22, 1.23]"><TresBoxGeometry :args="[0.04, 0.44, 0.04]" /><TresMeshLambertMaterial color="#6a4a22" /></TresMesh>

    <!-- Chair West — seat -->
    <TresMesh :position="[-1.15, 0.44, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.4, 0.05, 0.4]" />
      <TresMeshLambertMaterial color="#9a7a4a" />
    </TresMesh>
    <!-- Chair West — backrest -->
    <TresMesh :position="[-1.33, 0.65, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.05, 0.4, 0.4]" />
      <TresMeshLambertMaterial color="#7a5a2a" />
    </TresMesh>
    <!-- Chair West — legs -->
    <TresMesh :position="[-0.97, 0.22, -0.17]"><TresBoxGeometry :args="[0.04, 0.44, 0.04]" /><TresMeshLambertMaterial color="#6a4a22" /></TresMesh>
    <TresMesh :position="[-0.97, 0.22, 0.17]"><TresBoxGeometry :args="[0.04, 0.44, 0.04]" /><TresMeshLambertMaterial color="#6a4a22" /></TresMesh>
    <TresMesh :position="[-1.33, 0.22, -0.17]"><TresBoxGeometry :args="[0.04, 0.44, 0.04]" /><TresMeshLambertMaterial color="#6a4a22" /></TresMesh>
    <TresMesh :position="[-1.33, 0.22, 0.17]"><TresBoxGeometry :args="[0.04, 0.44, 0.04]" /><TresMeshLambertMaterial color="#6a4a22" /></TresMesh>

    <!-- Chair East — seat -->
    <TresMesh :position="[1.15, 0.44, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.4, 0.05, 0.4]" />
      <TresMeshLambertMaterial color="#9a7a4a" />
    </TresMesh>
    <!-- Chair East — backrest -->
    <TresMesh :position="[1.33, 0.65, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.05, 0.4, 0.4]" />
      <TresMeshLambertMaterial color="#7a5a2a" />
    </TresMesh>
    <!-- Chair East — legs -->
    <TresMesh :position="[0.97, 0.22, -0.17]"><TresBoxGeometry :args="[0.04, 0.44, 0.04]" /><TresMeshLambertMaterial color="#6a4a22" /></TresMesh>
    <TresMesh :position="[0.97, 0.22, 0.17]"><TresBoxGeometry :args="[0.04, 0.44, 0.04]" /><TresMeshLambertMaterial color="#6a4a22" /></TresMesh>
    <TresMesh :position="[1.33, 0.22, -0.17]"><TresBoxGeometry :args="[0.04, 0.44, 0.04]" /><TresMeshLambertMaterial color="#6a4a22" /></TresMesh>
    <TresMesh :position="[1.33, 0.22, 0.17]"><TresBoxGeometry :args="[0.04, 0.44, 0.04]" /><TresMeshLambertMaterial color="#6a4a22" /></TresMesh>
  </TresGroup>
</template>
