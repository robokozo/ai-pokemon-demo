<script setup lang="ts">
import { shallowReactive, onMounted, onUnmounted } from "vue"
import { useLoop } from "@tresjs/core"
import { useSceneStore } from "../useSceneStore"
import { useControls } from "../useControls"
import { usePlayerMovement } from "../usePlayerMovement"

interface Props {
  initialPosition?: [number, number, number]
  controlsOverride?: ReturnType<typeof useControls>
}

const { initialPosition = [0, 0, 1], controlsOverride } = defineProps<Props>()

const store = useSceneStore()

const position = shallowReactive({ x: initialPosition[0], y: initialPosition[1], z: initialPosition[2] })

const entity = { id: "player", name: "Player", kind: "player" as const, collider: "solid" as const, position }

const controls = controlsOverride !== undefined ? controlsOverride : useControls()
const movement = usePlayerMovement({ controls, position })

function onKeyDown(e: KeyboardEvent) {
  controls.onKeyDown(e)
}
function onKeyUp(e: KeyboardEvent) {
  controls.onKeyUp(e)
}

onMounted(() => {
  store.register(entity)
  if (controlsOverride === undefined) {
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
  }
})
onUnmounted(() => {
  store.unregister({ id: "player" })
  if (controlsOverride === undefined) {
    window.removeEventListener("keydown", onKeyDown)
    window.removeEventListener("keyup", onKeyUp)
  }
})

const { onBeforeRender } = useLoop()
onBeforeRender(() => {
  movement.tick()
})
</script>

<template>
  <TresGroup :position="[position.x, 0, position.z]">
    <!-- Body -->
    <TresMesh :position="[0, 0.3, 0]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.4, 0.5, 0.3]" />
      <TresMeshLambertMaterial color="#4a90d9" />
    </TresMesh>

    <!-- Head -->
    <TresMesh :position="[0, 0.72, 0]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.32, 0.32, 0.32]" />
      <TresMeshLambertMaterial color="#f5cba0" />
    </TresMesh>

    <!-- Cap -->
    <TresMesh :position="[0, 0.92, -0.02]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.36, 0.14, 0.36]" />
      <TresMeshLambertMaterial color="#e53935" />
    </TresMesh>
  </TresGroup>
</template>
