<script setup lang="ts">
import { useGLTF } from "@tresjs/cientos"
import { useEcsEntity } from "../ecs/useEcsEntity"
import { useStaticBody } from "../ecs/useStaticBody"
import { useInteractionSensor } from "../ecs/useInteractionSensor"
import { useDialogStore } from "../dialog/useDialogStore"

interface Props {
  name?: string
  position?: [number, number, number]
  description?: string
}

const { name = "NPC", position = [-1.5, 0, -1.5], description = "" } = defineProps<Props>()

const dialog = useDialogStore()

const { eid } = useEcsEntity({
  name,
  kind: "npc",
  position,
  onInteract: () => dialog.openDialog({ eid, name: "Mom", kind: "npc", description }),
  actionLabel: () => `Talk to ${name}`,
})
const { body } = useStaticBody({ eid, hw: 0.4, hd: 0.4 })
useInteractionSensor({ eid, body, hw: 0.4, hd: 0.4 })

const { state: model } = useGLTF(`${import.meta.env.BASE_URL}models/anju.glb`)

const MODEL_SCALE = 0.028 as const
</script>

<template>
  <TresGroup :position="position">
    <primitive v-if="model !== null" :object="model.scene.clone()" :scale="[MODEL_SCALE, MODEL_SCALE, MODEL_SCALE]" />

    <!-- Fallback box while model loads -->
    <TresMesh v-else :position="[0, 0.3, 0]">
      <TresBoxGeometry :args="[0.4, 0.5, 0.3]" />
      <TresMeshLambertMaterial color="#e87ca0" />
    </TresMesh>

    <!-- Slot for InteractionIndicator -->
    <slot />
  </TresGroup>
</template>
