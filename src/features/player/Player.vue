<script setup lang="ts">
import { onMounted, onUnmounted } from "vue"
import { useLoop } from "@tresjs/core"
import { useEntity } from "../useEntity"
import { useControls } from "../useControls"
import { usePlayerMovement } from "../usePlayerMovement"

interface Props {
  id?: string
  name?: string
  initialPosition?: [number, number, number]
  controlsOverride?: ReturnType<typeof useControls>
}

const { id, name, initialPosition = [0, 0, 1], controlsOverride } = defineProps<Props>()

const { position } = useEntity({ id, name, kind: "player", collider: "solid", position: initialPosition })

const controls = controlsOverride !== undefined ? controlsOverride : useControls()
const movement = usePlayerMovement({ controls, position })

function onKeyDown(e: KeyboardEvent) {
  controls.onKeyDown(e)
}
function onKeyUp(e: KeyboardEvent) {
  controls.onKeyUp(e)
}

onMounted(() => {
  if (controlsOverride === undefined) {
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
  }
})
onUnmounted(() => {
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
