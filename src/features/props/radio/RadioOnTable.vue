<script setup lang="ts">
import RadioBody from "./RadioBody.vue"
import Table from "../../furniture/Table.vue"

interface Props {
  position?: [number, number, number]
  rotation?: [number, number, number]
  state?: "on" | "off"
}

const { position = [0, 0, 0], rotation = [0, 0, 0], state = "off" } = defineProps<Props>()
</script>

<template>
  <Table :position="position" :rotation="rotation">
    <template #above>
      <RadioBody :position="[0, 0.14, 0]" :state="state" />
    </template>
  </Table>
</template>
