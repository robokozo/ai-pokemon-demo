<script setup lang="ts">
import { useEcsEntity } from "../../ecs/useEcsEntity"

interface Props {
  id?: string
  name?: string
  position?: [number, number, number]
  width?: number
  rotation?: [number, number, number]
  colliderSize?: { hw: number; hd: number }
  castShadow?: boolean
}

const { id, name = "Fence", position = [0, 0, 0], width = 3, rotation = [0, 0, 0], colliderSize, castShadow = false } = defineProps<Props>()

const POST_COUNT = Math.max(2, Math.round(width / 1.5) + 1)
const FENCE_HEIGHT = 0.5
const POST_HEIGHT = 0.6

useEcsEntity({
  id,
  name,
  kind: "prop",
  collider: "solid",
  colliderSize: colliderSize ?? { hw: width / 2, hd: 0.1 },
  isStatic: true,
  position,
})
</script>

<template>
  <TresGroup :position="position" :rotation="rotation">
    <!-- Horizontal rails -->
    <TresMesh :position="[0, FENCE_HEIGHT * 0.4, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[width, 0.06, 0.06]" />
      <TresMeshLambertMaterial color="#c8b89a" />
    </TresMesh>
    <TresMesh :position="[0, FENCE_HEIGHT * 0.8, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[width, 0.06, 0.06]" />
      <TresMeshLambertMaterial color="#c8b89a" />
    </TresMesh>

    <!-- Posts -->
    <TresMesh
      v-for="i in POST_COUNT"
      :key="`post-${i}`"
      :position="[-width / 2 + ((i - 1) / (POST_COUNT - 1)) * width, POST_HEIGHT / 2, 0]"
      :cast-shadow="castShadow"
    >
      <TresBoxGeometry :args="[0.08, POST_HEIGHT, 0.08]" />
      <TresMeshLambertMaterial color="#b0a080" />
    </TresMesh>
  </TresGroup>
</template>
