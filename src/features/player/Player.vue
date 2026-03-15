<script setup lang="ts">
import { useLoop } from "@tresjs/core"
import { useEntity } from "../useEntity"
import { usePlayerMovement } from "../usePlayerMovement"
import type { KeyMap } from "../usePlayerMovement"

interface Props {
  id?: string
  name?: string
  initialPosition?: [number, number, number]
  keyMap?: KeyMap
  castShadow?: boolean
}

const { id, name, initialPosition = [0, 0, 1], keyMap, castShadow = false } = defineProps<Props>()

const { position } = useEntity({ id, name, kind: "player", collider: "solid", position: initialPosition })
const movement = usePlayerMovement({ position, keyMap })

const { onBeforeRender } = useLoop()
onBeforeRender(() => {
  movement.tick()
})
</script>

<template>
  <TresGroup :position="[position.x, 0, position.z]">
    <!-- Body -->
    <TresMesh :position="[0, 0.3, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.4, 0.5, 0.3]" />
      <TresMeshLambertMaterial color="#4a90d9" />
    </TresMesh>

    <!-- Head -->
    <TresMesh :position="[0, 0.72, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.32, 0.32, 0.32]" />
      <TresMeshLambertMaterial color="#f5cba0" />
    </TresMesh>

    <!-- Cap -->
    <TresMesh :position="[0, 0.92, -0.02]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.36, 0.14, 0.36]" />
      <TresMeshLambertMaterial color="#e53935" />
    </TresMesh>
  </TresGroup>
</template>
