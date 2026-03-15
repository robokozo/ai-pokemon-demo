<script setup lang="ts">
import { useEntity } from "../../useEntity"

interface Props {
  id?: string
  name?: string
  position?: [number, number, number]
  castShadow?: boolean
}

const { id = "house", name = "House", position = [0, 0, 0], castShadow = false } = defineProps<Props>()

useEntity({
  id,
  name,
  kind: "prop",
  collider: "solid",
  colliderSize: { hw: 4.0, hd: 3.5 },
  isStatic: true,
  position,
})

const WALL_COLOR = "#d4c4a8"
const ROOF_COLOR = "#8b3a3a"
const TRIM_COLOR = "#5a3e28"
const WINDOW_COLOR = "#88bbdd"
const WINDOW_FRAME_COLOR = "#f0e8d8"
</script>

<template>
  <TresGroup :position="position" :user-data="{ occludable: true }">
    <!-- Main body -->
    <TresMesh :position="[0, 1.5, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[8.0, 3.0, 7.0]" />
      <TresMeshLambertMaterial :color="WALL_COLOR" />
    </TresMesh>

    <!-- Roof — main ridge -->
    <TresMesh :position="[0, 3.6, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[8.6, 0.6, 7.6]" />
      <TresMeshLambertMaterial :color="ROOF_COLOR" />
    </TresMesh>

    <!-- Roof — upper ridge -->
    <TresMesh :position="[0, 4.1, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[7.4, 0.5, 6.4]" />
      <TresMeshLambertMaterial :color="ROOF_COLOR" />
    </TresMesh>

    <!-- Roof — peak -->
    <TresMesh :position="[0, 4.5, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[6.0, 0.35, 5.0]" />
      <TresMeshLambertMaterial :color="ROOF_COLOR" />
    </TresMesh>

    <!-- Chimney -->
    <TresMesh :position="[2.5, 5.0, -1.0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.7, 1.4, 0.7]" />
      <TresMeshLambertMaterial color="#8b7355" />
    </TresMesh>

    <!-- Chimney cap -->
    <TresMesh :position="[2.5, 5.8, -1.0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.9, 0.12, 0.9]" />
      <TresMeshLambertMaterial color="#6a5a4a" />
    </TresMesh>

    <!-- Window — front left -->
    <TresMesh :position="[-2.2, 1.8, 3.52]">
      <TresBoxGeometry :args="[1.0, 0.8, 0.05]" />
      <TresMeshLambertMaterial :color="WINDOW_FRAME_COLOR" />
    </TresMesh>
    <TresMesh :position="[-2.2, 1.8, 3.54]">
      <TresBoxGeometry :args="[0.85, 0.65, 0.03]" />
      <TresMeshStandardMaterial :color="WINDOW_COLOR" :emissive="WINDOW_COLOR" :emissive-intensity="0.15" />
    </TresMesh>

    <!-- Window — front right -->
    <TresMesh :position="[2.2, 1.8, 3.52]">
      <TresBoxGeometry :args="[1.0, 0.8, 0.05]" />
      <TresMeshLambertMaterial :color="WINDOW_FRAME_COLOR" />
    </TresMesh>
    <TresMesh :position="[2.2, 1.8, 3.54]">
      <TresBoxGeometry :args="[0.85, 0.65, 0.03]" />
      <TresMeshStandardMaterial :color="WINDOW_COLOR" :emissive="WINDOW_COLOR" :emissive-intensity="0.15" />
    </TresMesh>

    <!-- Window — upper front (bedroom) -->
    <TresMesh :position="[0, 2.5, 3.52]">
      <TresBoxGeometry :args="[0.8, 0.6, 0.05]" />
      <TresMeshLambertMaterial :color="WINDOW_FRAME_COLOR" />
    </TresMesh>
    <TresMesh :position="[0, 2.5, 3.54]">
      <TresBoxGeometry :args="[0.65, 0.45, 0.03]" />
      <TresMeshStandardMaterial :color="WINDOW_COLOR" :emissive="WINDOW_COLOR" :emissive-intensity="0.15" />
    </TresMesh>

    <!-- Foundation strip -->
    <TresMesh :position="[0, 0.08, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[8.2, 0.16, 7.2]" />
      <TresMeshLambertMaterial color="#7a7a7a" />
    </TresMesh>

    <!-- Front step -->
    <TresMesh :position="[0, 0.08, 3.8]" :receive-shadow="true">
      <TresBoxGeometry :args="[1.8, 0.16, 0.6]" />
      <TresMeshLambertMaterial color="#9a9a9a" />
    </TresMesh>

    <slot />
  </TresGroup>
</template>
