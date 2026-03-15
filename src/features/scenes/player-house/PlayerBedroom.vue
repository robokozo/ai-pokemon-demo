<script setup lang="ts">
import SceneShell from "../SceneShell.vue"
import type { SceneConfig } from "../useSceneSetup"
import Bed from "../../furniture/Bed.vue"
import Bookshelf from "../../furniture/Bookshelf.vue"
import Rug from "../../furniture/Rug.vue"
import Wall from "../../furniture/Wall.vue"
import TVStand from "../../furniture/TVStand.vue"
import Radio from "../../props/radio/Radio.vue"
import TV from "../../props/tv/TV.vue"
import FlowerVase from "../../props/FlowerVase.vue"
import Staircase from "../../transitions/Staircase.vue"
import InteractionIndicator from "../../ui/InteractionIndicator.vue"

const sceneConfig: SceneConfig = {
  roomWidth: 10,
  roomHeight: 8,
  floorColors: { light: "#c8b89a", dark: "#b8a88a" },
  camera: { fov: 45, near: 0.1, far: 100, offset: { x: 0, y: 8, z: 5 } },
  entryPoints: {
    default: [0, 0, 1],
    "from-first-floor": [0, 0, 2.8],
  },
}
</script>

<template>
  <SceneShell :config="sceneConfig">
    <Wall id="wall-top" :position="[0, 0, -4.25]" :width="10" :depth="0.5" color="#8b7355" />
    <!-- Bottom wall split — gap matches staircase width including outer rail edges (±0.86) -->
    <Wall id="wall-bottom-l" :position="[-2.93, 0, 4.25]" :width="4.14" :depth="0.5" color="#8b7355" />
    <Wall id="wall-bottom-r" :position="[2.93, 0, 4.25]" :width="4.14" :depth="0.5" color="#8b7355" />
    <Wall id="wall-left" :position="[-5.25, 0, 0]" :width="0.5" :depth="9" color="#7a6548" />
    <Wall id="wall-right" :position="[5.25, 0, 0]" :width="0.5" :depth="9" color="#7a6548" />

    <Bed :position="[3.5, 0, -2.8]" />
    <Bookshelf :position="[-4.8, 0, -2.5]" />
    <Rug :position="[0, 0, 0.5]" />

    <Radio :position="[-3.5, 0, 0.5]">
      <InteractionIndicator :position="[0, 1.35, 0]" />
    </Radio>

    <TV :position="[4.86, 0, 0]" :rotation="[0, -Math.PI / 2, 0]">
      <InteractionIndicator :position="[0, 1.87, 0]" />
    </TV>

    <!-- Side table with flower vase along the back wall -->
    <TVStand id="vase-stand" name="Side Table" :position="[1.5, 0, -3.8]">
      <FlowerVase :position="[0, 0.5, 0]" />
    </TVStand>

    <!-- Staircase — south wall, centred, steps descend into room -->
    <Staircase
      id="bedroom-stairs"
      name="Stairs"
      :position="[0, -0.66, 4.9]"
      :rotation="[0, 0, 0]"
      target-scene="first-floor"
      target-entrypoint="from-bedroom"
    >
      <InteractionIndicator :position="[0, 1.3, 0]" />
    </Staircase>
  </SceneShell>
</template>
