<script setup lang="ts">
import { useEcsEntity } from "../ecs/useEcsEntity"
import { useSceneNavigation } from "../scenes/useSceneNavigation"
import type { SceneName } from "../scenes/useSceneNavigation"

interface Props {
  id?: string
  name?: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  castShadow?: boolean
  targetScene?: SceneName
  targetEntrypoint?: string
  actionLabel?: string
}

const {
  id = "doorway",
  name = "Door",
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  castShadow = false,
  targetScene = "first-floor",
  targetEntrypoint = "default",
  actionLabel = "Enter",
} = defineProps<Props>()

const sceneNav = useSceneNavigation()

useEcsEntity({
  id,
  name,
  kind: "prop",
  collider: "solid",
  colliderSize: { hw: 0.6, hd: 0.3 },
  interactive: true,
  isStatic: true,
  position,
  onInteract: () => sceneNav.setScene({ scene: targetScene, entrypoint: targetEntrypoint }),
  actionLabel: () => actionLabel,
})

const DOOR_WIDTH = 1.2
const DOOR_HEIGHT = 1.2
const FRAME_THICKNESS = 0.12
</script>

<template>
  <TresGroup :position="position" :rotation="rotation">
    <!-- Door frame — left post -->
    <TresMesh :position="[-(DOOR_WIDTH / 2 + FRAME_THICKNESS / 2), DOOR_HEIGHT / 2, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[FRAME_THICKNESS, DOOR_HEIGHT, 0.2]" />
      <TresMeshLambertMaterial color="#5a3e28" />
    </TresMesh>

    <!-- Door frame — right post -->
    <TresMesh :position="[DOOR_WIDTH / 2 + FRAME_THICKNESS / 2, DOOR_HEIGHT / 2, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[FRAME_THICKNESS, DOOR_HEIGHT, 0.2]" />
      <TresMeshLambertMaterial color="#5a3e28" />
    </TresMesh>

    <!-- Door frame — lintel -->
    <TresMesh :position="[0, DOOR_HEIGHT + FRAME_THICKNESS / 2, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[DOOR_WIDTH + FRAME_THICKNESS * 2, FRAME_THICKNESS, 0.2]" />
      <TresMeshLambertMaterial color="#5a3e28" />
    </TresMesh>

    <!-- Door panel (slightly recessed) -->
    <TresMesh :position="[0, DOOR_HEIGHT / 2, -0.04]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[DOOR_WIDTH, DOOR_HEIGHT, 0.08]" />
      <TresMeshLambertMaterial color="#8b6914" />
    </TresMesh>

    <!-- Door knob -->
    <TresMesh :position="[0.4, DOOR_HEIGHT * 0.45, 0.06]">
      <TresCylinderGeometry :args="[0.04, 0.04, 0.06, 8]" />
      <TresMeshLambertMaterial color="#c0a030" />
    </TresMesh>

    <!-- Slot for InteractionIndicator -->
    <slot />
  </TresGroup>
</template>
