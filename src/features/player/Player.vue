<script setup lang="ts">
import { useLoop } from "@tresjs/core"
import { useGLTF } from "@tresjs/cientos"
import { useEntity } from "../useEntity"
import { usePlayerMovement } from "../usePlayerMovement"
import type { KeyMap } from "../usePlayerMovement"

interface Props {
  id?: string
  name?: string
  initialPosition?: [number, number, number]
  keyMap?: KeyMap
}

const { id, name, initialPosition = [0, 0, 1], keyMap } = defineProps<Props>()

const { position } = useEntity({ id, name, kind: "player", collider: "solid", position: initialPosition })
const movement = usePlayerMovement({ position, keyMap })

const { state: model } = useGLTF(`${import.meta.env.BASE_URL}models/nathan.glb`)

const MODEL_SCALE = 0.085 as const

const { onBeforeRender } = useLoop()
onBeforeRender(() => {
  movement.tick()
})
</script>

<template>
  <TresGroup :position="[position.x, 0, position.z]" :user-data="{ isPlayer: true }">
    <primitive v-if="model !== null" :object="model.scene.clone()" :scale="[MODEL_SCALE, MODEL_SCALE, MODEL_SCALE]" />

    <!-- Fallback box while model loads -->
    <TresMesh v-else :position="[0, 0.3, 0]">
      <TresBoxGeometry :args="[0.4, 0.5, 0.3]" />
      <TresMeshLambertMaterial color="#4a90d9" />
    </TresMesh>
  </TresGroup>
</template>
