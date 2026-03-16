<script setup lang="ts">
import { useEcsEntity } from "../ecs/useEcsEntity"
import { useStaticBody } from "../ecs/useStaticBody"

const WALL_HEIGHT = 2.5

interface Props {
  name?: string
  position: [number, number, number]
  width: number
  depth: number
  color?: string
  castShadow?: boolean
}

const { name, position, width, depth, color = "#8b7355", castShadow = false } = defineProps<Props>()

const { eid } = useEcsEntity({ name, kind: "prop", position })
useStaticBody({ eid, hw: width / 2, hd: depth / 2 })
</script>

<template>
  <TresMesh
    :position="[position[0], WALL_HEIGHT / 2, position[2]]"
    :cast-shadow="castShadow"
    :receive-shadow="castShadow"
    :user-data="{ occludable: true }"
  >
    <TresBoxGeometry :args="[width, WALL_HEIGHT, depth]" />
    <TresMeshLambertMaterial :color="color" />
  </TresMesh>
</template>
