<script setup lang="ts">
import { shallowReactive, onMounted, onUnmounted } from "vue"
import { useSceneStore } from "../useSceneStore"

interface Props {
  initialPosition?: [number, number, number]
  rotation?: [number, number, number]
  state?: "on" | "off"
}

const { initialPosition = [0, 0, 0], rotation = [0, 0, 0], state = "off" } = defineProps<Props>()

const store = useSceneStore()
const position = shallowReactive({ x: initialPosition[0], y: initialPosition[1], z: initialPosition[2] })
const entity = { id: "radio", name: "Radio", kind: "prop" as const, position }

onMounted(() => {
  store.register(entity)
})
onUnmounted(() => {
  store.unregister({ id: "radio" })
})
</script>

<template>
  <TresGroup :position="[position.x, position.y, position.z]" :rotation="rotation">
    <!-- Table surface -->
    <TresMesh :position="[0, 0.55, 0]" :cast-shadow="true" :receive-shadow="true">
      <TresBoxGeometry :args="[0.9, 0.06, 0.55]" />
      <TresMeshLambertMaterial color="#a07850" />
    </TresMesh>

    <!-- Table legs -->
    <TresMesh :position="[-0.38, 0.28, -0.22]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.06, 0.56, 0.06]" />
      <TresMeshLambertMaterial color="#7a5830" />
    </TresMesh>
    <TresMesh :position="[0.38, 0.28, -0.22]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.06, 0.56, 0.06]" />
      <TresMeshLambertMaterial color="#7a5830" />
    </TresMesh>
    <TresMesh :position="[-0.38, 0.28, 0.22]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.06, 0.56, 0.06]" />
      <TresMeshLambertMaterial color="#7a5830" />
    </TresMesh>
    <TresMesh :position="[0.38, 0.28, 0.22]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.06, 0.56, 0.06]" />
      <TresMeshLambertMaterial color="#7a5830" />
    </TresMesh>

    <!-- Radio body -->
    <TresMesh :position="[0, 0.69, 0]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.55, 0.22, 0.28]" />
      <TresMeshLambertMaterial color="#c0392b" />
    </TresMesh>

    <!-- Speaker grill -->
    <TresMesh :position="[-0.12, 0.69, 0.145]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.26, 0.14, 0.01]" />
      <TresMeshLambertMaterial color="#7a1a10" />
    </TresMesh>

    <!-- Tuning dial -->
    <TresMesh :position="[0.18, 0.69, 0.145]" :cast-shadow="true">
      <TresCylinderGeometry :args="[0.04, 0.04, 0.02, 12]" />
      <TresMeshLambertMaterial color="#f0d080" />
    </TresMesh>

    <!-- Power light: green when on, dark when off -->
    <TresMesh :position="[0.06, 0.72, 0.145]">
      <TresCylinderGeometry :args="[0.025, 0.025, 0.015, 8]" />
      <TresMeshLambertMaterial
        :color="state === 'on' ? '#00ff88' : '#1a4a2a'"
        :emissive="state === 'on' ? '#00ff88' : '#000000'"
        :emissive-intensity="state === 'on' ? 0.8 : 0"
      />
    </TresMesh>

    <!-- Antenna -->
    <TresMesh :position="[0.22, 0.88, 0]" :rotation="[0, 0, 0.18]" :cast-shadow="true">
      <TresCylinderGeometry :args="[0.012, 0.012, 0.36, 6]" />
      <TresMeshLambertMaterial color="#888888" />
    </TresMesh>

    <!-- Slot for InteractionIndicator -->
    <slot />
  </TresGroup>
</template>
