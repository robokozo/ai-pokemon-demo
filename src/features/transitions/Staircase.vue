<script setup lang="ts">
import { useEntity } from "../useEntity"
import { useSceneStore } from "../useSceneStore"
import type { SceneName } from "../useSceneStore"

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
  id = "staircase",
  name = "Stairs",
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  castShadow = false,
  targetScene = "first-floor",
  targetEntrypoint = "default",
  actionLabel = "Go downstairs",
} = defineProps<Props>()

const store = useSceneStore()

useEntity({
  id,
  name,
  kind: "prop",
  collider: "solid",
  colliderSize: { hw: 0.8, hd: 1.0 },
  interactive: true,
  isStatic: true,
  position,
  onInteract: () => store.setScene({ scene: targetScene, entrypoint: targetEntrypoint }),
  actionLabel: () => actionLabel,
})
</script>

<template>
  <TresGroup :position="position" :rotation="rotation">
    <!-- Step 1 — front/lowest -->
    <TresMesh :position="[0, 0.11, 0.6]" :cast-shadow="castShadow" :receive-shadow="true">
      <TresBoxGeometry :args="[1.6, 0.22, 0.6]" />
      <TresMeshLambertMaterial color="#a07850" />
    </TresMesh>

    <!-- Step 2 — middle -->
    <TresMesh :position="[0, 0.22, 0.0]" :cast-shadow="castShadow" :receive-shadow="true">
      <TresBoxGeometry :args="[1.6, 0.44, 0.6]" />
      <TresMeshLambertMaterial color="#a07850" />
    </TresMesh>

    <!-- Step 3 — back/highest -->
    <TresMesh :position="[0, 0.33, -0.6]" :cast-shadow="castShadow" :receive-shadow="true">
      <TresBoxGeometry :args="[1.6, 0.66, 0.6]" />
      <TresMeshLambertMaterial color="#a07850" />
    </TresMesh>

    <!-- Left rail -->
    <TresMesh :position="[-0.83, 0.36, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.06, 0.72, 2.0]" />
      <TresMeshLambertMaterial color="#5a3e28" />
    </TresMesh>

    <!-- Right rail -->
    <TresMesh :position="[0.83, 0.36, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.06, 0.72, 2.0]" />
      <TresMeshLambertMaterial color="#5a3e28" />
    </TresMesh>

    <!-- Slot for InteractionIndicator -->
    <slot />
  </TresGroup>
</template>
