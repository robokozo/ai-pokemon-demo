<script setup lang="ts">
import SceneShell from "../SceneShell.vue"
import type { SceneConfig } from "../useSceneSetup"
import HouseExterior from "../../props/outdoor/HouseExterior.vue"
import OakTree from "../../props/outdoor/OakTree.vue"
import PineTree from "../../props/outdoor/PineTree.vue"
import Mailbox from "../../props/outdoor/Mailbox.vue"
import Fence from "../../props/outdoor/Fence.vue"
import StoneSlab from "../../props/outdoor/StoneSlab.vue"
import FlowerBed from "../../props/outdoor/FlowerBed.vue"
import Rock from "../../props/outdoor/Rock.vue"
import Barrier from "../../props/Barrier.vue"
import Doorway from "../../transitions/Doorway.vue"
import InteractionIndicator from "../../ui/InteractionIndicator.vue"

const leftFlowerBed = [
  { position: [-0.3, 0.25, 0] as [number, number, number], size: [0.15, 0.2, 0.15] as [number, number, number], color: "#e06060" },
  { position: [0.1, 0.22, 0.15] as [number, number, number], size: [0.12, 0.16, 0.12] as [number, number, number], color: "#e0e040" },
  { position: [0.35, 0.27, -0.1] as [number, number, number], size: [0.14, 0.22, 0.14] as [number, number, number], color: "#e060e0" },
]

const rightFlowerBed = [
  { position: [0.25, 0.24, 0.1] as [number, number, number], size: [0.13, 0.18, 0.13] as [number, number, number], color: "#6090e0" },
  { position: [-0.15, 0.26, -0.1] as [number, number, number], size: [0.15, 0.22, 0.15] as [number, number, number], color: "#e06060" },
  { position: [0.0, 0.2, 0.2] as [number, number, number], size: [0.11, 0.14, 0.11] as [number, number, number], color: "#e0e040" },
]

const sceneConfig: SceneConfig = {
  roomWidth: 30,
  roomHeight: 30,
  floorColors: { solid: "#5a8a3a" },
  camera: { fov: 45, near: 0.1, far: 200, offset: { x: 0, y: 14, z: 10 } },
  entryPoints: {
    default: [0, 0, 5],
    "from-first-floor": [0, 0, 5],
  },
}

const BOUNDS = 11.5
</script>

<template>
  <SceneShell :config="sceneConfig" clear-color="#87ceeb" :ambient-intensity="1.8" :directional-intensity="0.7" :directional-position="[5, 12, 6]">
    <!-- ── Invisible boundary walls ─────────────────────────────── -->
    <Barrier :position="[0, 0, -BOUNDS]" :collider-size="{ hw: BOUNDS, hd: 0.5 }" />
    <Barrier :position="[0, 0, BOUNDS]" :collider-size="{ hw: BOUNDS, hd: 0.5 }" />
    <Barrier :position="[-BOUNDS, 0, 0]" :collider-size="{ hw: 0.5, hd: BOUNDS }" />
    <Barrier :position="[BOUNDS, 0, 0]" :collider-size="{ hw: 0.5, hd: BOUNDS }" />

    <!-- ── House ──────────────────────────────────────────────────── -->
    <HouseExterior name="Player's House" :position="[0, 0, 0]" />

    <!-- Front door — transitions back inside -->
    <Doorway name="Front Door" :position="[0, 0, 3.55]" target-scene="first-floor" target-entrypoint="from-outside" action-label="Go inside">
      <InteractionIndicator :position="[0, 1.8, 0]" />
    </Doorway>

    <!-- ── Mailbox ────────────────────────────────────────────────── -->
    <Mailbox name="Mailbox" :position="[2.5, 0, 7.0]" />

    <!-- ── Path from door (decorative stone slabs) ────────────────── -->
    <StoneSlab :position="[0, 0.03, 5.0]" :size="[1.4, 0.06, 1.0]" />
    <StoneSlab :position="[0, 0.03, 6.2]" :size="[1.2, 0.06, 0.8]" color="#a8a080" />
    <StoneSlab :position="[0.2, 0.03, 7.2]" :size="[1.0, 0.06, 0.7]" />

    <!-- ── Garden fence (front yard) ──────────────────────────────── -->
    <Fence name="Fence" :position="[-5.5, 0, 8.5]" :width="5" />
    <Fence name="Fence" :position="[5.5, 0, 8.5]" :width="5" />
    <Fence name="Fence" :position="[-8, 0, 4.5]" :width="8" :rotation="[0, Math.PI / 2, 0]" :collider-size="{ hw: 0.1, hd: 4 }" />
    <Fence name="Fence" :position="[8, 0, 4.5]" :width="8" :rotation="[0, Math.PI / 2, 0]" :collider-size="{ hw: 0.1, hd: 4 }" />

    <!-- ── Interior yard trees ─────────────────────────────────────── -->
    <OakTree :position="[-6, 0, -4]" />
    <OakTree :position="[7, 0, -3]" />
    <PineTree :position="[-10, 0, 6]" />
    <OakTree :position="[11, 0, 2]" />

    <!-- ── Forest border — north (3 rows deep) ──────────────────── -->
    <!-- Row 1 -->
    <PineTree :position="[-14, 0, -12]" />
    <OakTree :position="[-12, 0, -12.5]" />
    <PineTree :position="[-10, 0, -12]" />
    <OakTree :position="[-8, 0, -12.5]" />
    <PineTree :position="[-6, 0, -12]" />
    <OakTree :position="[-4, 0, -12.5]" />
    <PineTree :position="[-2, 0, -12]" />
    <OakTree :position="[0, 0, -12.5]" />
    <PineTree :position="[2, 0, -12]" />
    <OakTree :position="[4, 0, -12.5]" />
    <PineTree :position="[6, 0, -12]" />
    <OakTree :position="[8, 0, -12.5]" />
    <PineTree :position="[10, 0, -12]" />
    <OakTree :position="[12, 0, -12.5]" />
    <PineTree :position="[14, 0, -12]" />
    <!-- Row 2 -->
    <OakTree :position="[-13, 0, -13.5]" />
    <PineTree :position="[-11, 0, -14]" />
    <OakTree :position="[-9, 0, -13.5]" />
    <PineTree :position="[-7, 0, -14]" />
    <OakTree :position="[-5, 0, -13.5]" />
    <PineTree :position="[-3, 0, -14]" />
    <OakTree :position="[-1, 0, -13.5]" />
    <PineTree :position="[1, 0, -14]" />
    <OakTree :position="[3, 0, -13.5]" />
    <PineTree :position="[5, 0, -14]" />
    <OakTree :position="[7, 0, -13.5]" />
    <PineTree :position="[9, 0, -14]" />
    <OakTree :position="[11, 0, -13.5]" />
    <PineTree :position="[13, 0, -14]" />
    <!-- Row 3 (outermost) -->
    <PineTree :position="[-14, 0, -15]" />
    <PineTree :position="[-11.5, 0, -15.5]" />
    <PineTree :position="[-9, 0, -15]" />
    <PineTree :position="[-6.5, 0, -15.5]" />
    <PineTree :position="[-4, 0, -15]" />
    <PineTree :position="[-1.5, 0, -15.5]" />
    <PineTree :position="[1, 0, -15]" />
    <PineTree :position="[3.5, 0, -15.5]" />
    <PineTree :position="[6, 0, -15]" />
    <PineTree :position="[8.5, 0, -15.5]" />
    <PineTree :position="[11, 0, -15]" />
    <PineTree :position="[13.5, 0, -15.5]" />

    <!-- ── Forest border — south (3 rows deep) ──────────────────── -->
    <!-- Row 1 -->
    <OakTree :position="[-14, 0, 12]" />
    <PineTree :position="[-12, 0, 12.5]" />
    <OakTree :position="[-10, 0, 12]" />
    <PineTree :position="[-8, 0, 12.5]" />
    <OakTree :position="[-6, 0, 12]" />
    <PineTree :position="[-4, 0, 12.5]" />
    <OakTree :position="[-2, 0, 12]" />
    <PineTree :position="[0, 0, 12.5]" />
    <OakTree :position="[2, 0, 12]" />
    <PineTree :position="[4, 0, 12.5]" />
    <OakTree :position="[6, 0, 12]" />
    <PineTree :position="[8, 0, 12.5]" />
    <OakTree :position="[10, 0, 12]" />
    <PineTree :position="[12, 0, 12.5]" />
    <OakTree :position="[14, 0, 12]" />
    <!-- Row 2 -->
    <PineTree :position="[-13, 0, 13.5]" />
    <OakTree :position="[-11, 0, 14]" />
    <PineTree :position="[-9, 0, 13.5]" />
    <OakTree :position="[-7, 0, 14]" />
    <PineTree :position="[-5, 0, 13.5]" />
    <OakTree :position="[-3, 0, 14]" />
    <PineTree :position="[-1, 0, 13.5]" />
    <OakTree :position="[1, 0, 14]" />
    <PineTree :position="[3, 0, 13.5]" />
    <OakTree :position="[5, 0, 14]" />
    <PineTree :position="[7, 0, 13.5]" />
    <OakTree :position="[9, 0, 14]" />
    <PineTree :position="[11, 0, 13.5]" />
    <OakTree :position="[13, 0, 14]" />
    <!-- Row 3 -->
    <PineTree :position="[-14, 0, 15]" />
    <PineTree :position="[-11.5, 0, 15.5]" />
    <PineTree :position="[-9, 0, 15]" />
    <PineTree :position="[-6.5, 0, 15.5]" />
    <PineTree :position="[-4, 0, 15]" />
    <PineTree :position="[-1.5, 0, 15.5]" />
    <PineTree :position="[1, 0, 15]" />
    <PineTree :position="[3.5, 0, 15.5]" />
    <PineTree :position="[6, 0, 15]" />
    <PineTree :position="[8.5, 0, 15.5]" />
    <PineTree :position="[11, 0, 15]" />
    <PineTree :position="[13.5, 0, 15.5]" />

    <!-- ── Forest border — west (3 rows deep) ───────────────────── -->
    <!-- Row 1 -->
    <PineTree :position="[-12, 0, -10]" />
    <OakTree :position="[-12.5, 0, -8]" />
    <PineTree :position="[-12, 0, -6]" />
    <OakTree :position="[-12.5, 0, -4]" />
    <PineTree :position="[-12, 0, -2]" />
    <OakTree :position="[-12.5, 0, 0]" />
    <PineTree :position="[-12, 0, 2]" />
    <OakTree :position="[-12.5, 0, 4]" />
    <PineTree :position="[-12, 0, 6]" />
    <OakTree :position="[-12.5, 0, 8]" />
    <PineTree :position="[-12, 0, 10]" />
    <!-- Row 2 -->
    <OakTree :position="[-13.5, 0, -11]" />
    <PineTree :position="[-14, 0, -9]" />
    <OakTree :position="[-13.5, 0, -7]" />
    <PineTree :position="[-14, 0, -5]" />
    <OakTree :position="[-13.5, 0, -3]" />
    <PineTree :position="[-14, 0, -1]" />
    <OakTree :position="[-13.5, 0, 1]" />
    <PineTree :position="[-14, 0, 3]" />
    <OakTree :position="[-13.5, 0, 5]" />
    <PineTree :position="[-14, 0, 7]" />
    <OakTree :position="[-13.5, 0, 9]" />
    <PineTree :position="[-14, 0, 11]" />
    <!-- Row 3 -->
    <PineTree :position="[-15, 0, -10.5]" />
    <PineTree :position="[-15.5, 0, -8]" />
    <PineTree :position="[-15, 0, -5.5]" />
    <PineTree :position="[-15.5, 0, -3]" />
    <PineTree :position="[-15, 0, -0.5]" />
    <PineTree :position="[-15.5, 0, 2]" />
    <PineTree :position="[-15, 0, 4.5]" />
    <PineTree :position="[-15.5, 0, 7]" />
    <PineTree :position="[-15, 0, 9.5]" />

    <!-- ── Forest border — east (3 rows deep) ────────────────────── -->
    <!-- Row 1 -->
    <OakTree :position="[12, 0, -10]" />
    <PineTree :position="[12.5, 0, -8]" />
    <OakTree :position="[12, 0, -6]" />
    <PineTree :position="[12.5, 0, -4]" />
    <OakTree :position="[12, 0, -2]" />
    <PineTree :position="[12.5, 0, 0]" />
    <OakTree :position="[12, 0, 2]" />
    <PineTree :position="[12.5, 0, 4]" />
    <OakTree :position="[12, 0, 6]" />
    <PineTree :position="[12.5, 0, 8]" />
    <OakTree :position="[12, 0, 10]" />
    <!-- Row 2 -->
    <PineTree :position="[13.5, 0, -11]" />
    <OakTree :position="[14, 0, -9]" />
    <PineTree :position="[13.5, 0, -7]" />
    <OakTree :position="[14, 0, -5]" />
    <PineTree :position="[13.5, 0, -3]" />
    <OakTree :position="[14, 0, -1]" />
    <PineTree :position="[13.5, 0, 1]" />
    <OakTree :position="[14, 0, 3]" />
    <PineTree :position="[13.5, 0, 5]" />
    <OakTree :position="[14, 0, 7]" />
    <PineTree :position="[13.5, 0, 9]" />
    <OakTree :position="[14, 0, 11]" />
    <!-- Row 3 -->
    <PineTree :position="[15, 0, -10.5]" />
    <PineTree :position="[15.5, 0, -8]" />
    <PineTree :position="[15, 0, -5.5]" />
    <PineTree :position="[15.5, 0, -3]" />
    <PineTree :position="[15, 0, -0.5]" />
    <PineTree :position="[15.5, 0, 2]" />
    <PineTree :position="[15, 0, 4.5]" />
    <PineTree :position="[15.5, 0, 7]" />
    <PineTree :position="[15, 0, 9.5]" />

    <!-- ── Decorative flower patches ──────────────────────────────── -->
    <FlowerBed :position="[-1.5, 0, 5.5]" :flowers="leftFlowerBed" />
    <FlowerBed :position="[1.5, 0, 5.5]" :flowers="rightFlowerBed" />

    <!-- ── Rocks (decorative, no collision) ────────────────────────── -->
    <Rock :position="[5, 0.12, 5]" />
    <Rock :position="[-9, 0.1, -2]" :size="[0.6, 0.2, 0.5]" color="#7a7a6a" />
    <Rock :position="[6, 0.15, 10]" :size="[0.4, 0.3, 0.35]" color="#9a9a8a" />
  </SceneShell>
</template>
