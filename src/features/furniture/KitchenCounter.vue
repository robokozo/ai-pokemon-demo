<script setup lang="ts">
import { useEntity } from "../useEntity"

interface Props {
  id?: string
  name?: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  castShadow?: boolean
  colliderSize?: { hw: number; hd: number }
}

const {
  id = "kitchen-counter",
  name = "Kitchen Counter",
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  castShadow = false,
  colliderSize = { hw: 1.5, hd: 0.35 },
} = defineProps<Props>()

useEntity({ id, name, kind: "prop", collider: "solid", colliderSize, isStatic: true, position })
</script>

<template>
  <TresGroup :position="position" :rotation="rotation">
    <!-- Counter base cabinet -->
    <TresMesh :position="[0, 0.36, 0]" :cast-shadow="castShadow" :receive-shadow="true">
      <TresBoxGeometry :args="[3.0, 0.72, 0.6]" />
      <TresMeshLambertMaterial color="#c8b89a" />
    </TresMesh>

    <!-- Counter top (slight overhang) -->
    <TresMesh :position="[0, 0.75, 0.025]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[3.0, 0.06, 0.65]" />
      <TresMeshLambertMaterial color="#ddd0b8" />
    </TresMesh>

    <!-- Sink basin -->
    <TresMesh :position="[0.8, 0.79, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.5, 0.08, 0.36]" />
      <TresMeshLambertMaterial color="#b0a090" />
    </TresMesh>

    <!-- Faucet stem -->
    <TresMesh :position="[0.8, 0.97, -0.1]" :cast-shadow="castShadow">
      <TresCylinderGeometry :args="[0.03, 0.03, 0.22, 6]" />
      <TresMeshLambertMaterial color="#888888" />
    </TresMesh>

    <!-- Faucet neck (horizontal) -->
    <TresMesh :position="[0.8, 1.08, 0]" :rotation="[Math.PI / 2, 0, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.025, 0.025, 0.18]" />
      <TresMeshLambertMaterial color="#888888" />
    </TresMesh>

    <!-- Cabinet door left -->
    <TresMesh :position="[-0.95, 0.32, 0.31]">
      <TresBoxGeometry :args="[1.1, 0.5, 0.02]" />
      <TresMeshLambertMaterial color="#b8a888" />
    </TresMesh>

    <!-- Cabinet door right -->
    <TresMesh :position="[0.55, 0.32, 0.31]">
      <TresBoxGeometry :args="[1.1, 0.5, 0.02]" />
      <TresMeshLambertMaterial color="#b8a888" />
    </TresMesh>
  </TresGroup>
</template>
