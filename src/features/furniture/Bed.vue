<script setup lang="ts">
import { useEntity } from "../useEntity"

interface Props {
  id?: string
  name?: string
  position?: [number, number, number]
  castShadow?: boolean
}

const { id, name, position = [0, 0, 0], castShadow = false } = defineProps<Props>()

useEntity({ id, name, kind: "prop", collider: "solid", colliderSize: { hw: 0.9, hd: 1.2 }, isStatic: true, position })
</script>

<template>
  <TresGroup :position="position">
    <!-- Frame -->
    <TresMesh :position="[0, 0.15, 0]" :cast-shadow="castShadow" :receive-shadow="castShadow">
      <TresBoxGeometry :args="[1.8, 0.3, 2.4]" />
      <TresMeshLambertMaterial color="#3a7bd5" />
    </TresMesh>

    <!-- Mattress -->
    <TresMesh :position="[0, 0.5, 0]" :cast-shadow="castShadow" :receive-shadow="castShadow">
      <TresBoxGeometry :args="[1.6, 0.4, 2.2]" />
      <TresMeshLambertMaterial color="#e8c4a0" />
    </TresMesh>

    <!-- Pillow -->
    <TresMesh :position="[0, 0.725, -1.0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[1.6, 0.45, 0.4]" />
      <TresMeshLambertMaterial color="#fff8f0" />
    </TresMesh>
  </TresGroup>
</template>
