<script setup lang="ts">
import { shallowRef } from "vue"
import { useRafFn } from "@vueuse/core"
import { useGLTF } from "@tresjs/cientos"
import type { Group } from "three"
import { useEcsEntity } from "../ecs/useEcsEntity"
import { useEcsPosition } from "../ecs/useEcsPosition"
import { useGameLoop } from "../ecs/useGameLoop"
import { useInputCapture } from "../ecs/useInputCapture"
import { useKinematicBody } from "../ecs/useKinematicBody"
import { useEcsStore } from "../ecs/useEcsStore"

interface Props {
  initialPosition?: [number, number, number]
}

const { initialPosition = [0, 0, 1] } = defineProps<Props>()

const PLAYER_HALF_EXTENT = 0.3 as const

const ecsStore = useEcsStore()
const { eid } = useEcsEntity({ kind: "player", position: initialPosition })
useKinematicBody({ eid, hw: PLAYER_HALF_EXTENT, hd: PLAYER_HALF_EXTENT })
// Sync reactive position immediately so the camera starts at the correct position.
ecsStore.updatePlayerPosition({ x: initialPosition[0], y: initialPosition[1], z: initialPosition[2] })
const { getPosition } = useEcsPosition({ eid })
const { keys } = useInputCapture()
const { facing } = useGameLoop({ keys })

const { state: model } = useGLTF(`${import.meta.env.BASE_URL}models/nathan.glb`)

const MODEL_SCALE = 0.085 as const

const groupRef = shallowRef<Group | null>(null)

useRafFn(() => {
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
