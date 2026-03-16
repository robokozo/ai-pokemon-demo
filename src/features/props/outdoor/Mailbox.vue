<script setup lang="ts">
import { useEcsEntity } from "../../ecs/useEcsEntity"
import { useStaticBody } from "../../ecs/useStaticBody"

interface Props {
  name?: string
  position?: [number, number, number]
  castShadow?: boolean
}

const { name = "Mailbox", position = [0, 0, 0], castShadow = false } = defineProps<Props>()

const { eid } = useEcsEntity({ name, kind: "prop", position })
useStaticBody({ eid, hw: 0.2, hd: 0.2 })
</script>

<template>
  <TresGroup :position="position">
    <!-- Post -->
    <TresMesh :position="[0, 0.4, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.1, 0.8, 0.1]" />
      <TresMeshLambertMaterial color="#8b7355" />
    </TresMesh>

    <!-- Box body -->
    <TresMesh :position="[0, 0.85, 0.02]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.32, 0.24, 0.22]" />
      <TresMeshLambertMaterial color="#4a6fa5" />
    </TresMesh>

    <!-- Lid (slightly raised) -->
    <TresMesh :position="[0, 0.98, -0.02]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.34, 0.03, 0.26]" />
      <TresMeshLambertMaterial color="#3a5a8a" />
    </TresMesh>

    <!-- Flag (red, on the side) -->
    <TresMesh :position="[0.2, 0.92, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[0.04, 0.15, 0.04]" />
      <TresMeshLambertMaterial color="#cc3333" />
    </TresMesh>

    <slot />
  </TresGroup>
</template>
