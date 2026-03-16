<script setup lang="ts">
import { shallowRef } from "vue"
import { useLoop } from "@tresjs/core"
import { useGLTF } from "@tresjs/cientos"
import type { Group } from "three"
import { useEcsEntity } from "../ecs/useEcsEntity"
import { useEcsPosition } from "../ecs/useEcsPosition"
import { useGameLoop } from "../ecs/useGameLoop"
import { useInputCapture } from "../ecs/useInputCapture"

interface Props {
  initialPosition?: [number, number, number]
}

const { initialPosition = [0, 0, 1] } = defineProps<Props>()

const { eid } = useEcsEntity({ kind: "player", collider: "solid", position: initialPosition })
const { getPosition } = useEcsPosition({ eid })
const { keys } = useInputCapture()
const { facing } = useGameLoop({ keys })

const { state: model } = useGLTF(`${import.meta.env.BASE_URL}models/nathan.glb`)

const MODEL_SCALE = 0.085 as const

const groupRef = shallowRef<Group | null>(null)

const { onBeforeRender } = useLoop()
onBeforeRender(() => {
  const group = groupRef.value
  if (group === null) return

  const pos = getPosition()
  group.position.set(pos.x, 0, pos.z)
  group.rotation.set(0, facing.value, 0)
})
</script>

<template>
  <TresGroup ref="groupRef" :user-data="{ isPlayer: true }">
    <primitive v-if="model !== null" :object="model.scene.clone()" :scale="[MODEL_SCALE, MODEL_SCALE, MODEL_SCALE]" />

    <!-- Fallback box while model loads -->
    <TresMesh v-else :position="[0, 0.3, 0]">
      <TresBoxGeometry :args="[0.4, 0.5, 0.3]" />
      <TresMeshLambertMaterial color="#4a90d9" />
    </TresMesh>
  </TresGroup>
</template>
