<script setup lang="ts">
import { useEntity } from "../useEntity"

interface Props {
  id?: string
  name?: string
  position?: [number, number, number]
  colliderSize: { hw: number; hd: number }
}

const { id, name = "Barrier", position = [0, 0, 0], colliderSize } = defineProps<Props>()

useEntity({
  id,
  name,
  kind: "prop",
  collider: "solid",
  colliderSize,
  isStatic: true,
  position,
})
</script>

<template>
  <!-- Invisible — collision only, no mesh -->
</template>
