<script setup lang="ts">
import { useEcsEntity } from "../ecs/useEcsEntity"
import { useStaticBody } from "../ecs/useStaticBody"

interface Props {
  name?: string
  position?: [number, number, number]
  colliderSize: { hw: number; hd: number }
}

const { name = "Barrier", position = [0, 0, 0], colliderSize } = defineProps<Props>()

const { eid } = useEcsEntity({ name, kind: "prop", position })
useStaticBody({ eid, hw: colliderSize.hw, hd: colliderSize.hd })
</script>

<template>
  <!-- Invisible — collision only, no mesh -->
</template>
