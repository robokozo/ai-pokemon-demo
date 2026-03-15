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
    <Barrier id="bound-north" :position="[0, 0, -BOUNDS]" :collider-size="{ hw: BOUNDS, hd: 0.5 }" />
    <Barrier id="bound-south" :position="[0, 0, BOUNDS]" :collider-size="{ hw: BOUNDS, hd: 0.5 }" />
    <Barrier id="bound-west" :position="[-BOUNDS, 0, 0]" :collider-size="{ hw: 0.5, hd: BOUNDS }" />
    <Barrier id="bound-east" :position="[BOUNDS, 0, 0]" :collider-size="{ hw: 0.5, hd: BOUNDS }" />

    <!-- ── House ──────────────────────────────────────────────────── -->
    <HouseExterior id="player-house" name="Player's House" :position="[0, 0, 0]" />

    <!-- Front door — transitions back inside -->
    <Doorway
      id="front-door"
      name="Front Door"
      :position="[0, 0, 3.55]"
      target-scene="first-floor"
      target-entrypoint="from-outside"
      action-label="Go inside"
    >
      <InteractionIndicator :position="[0, 1.8, 0]" />
    </Doorway>

    <!-- ── Mailbox ────────────────────────────────────────────────── -->
    <Mailbox id="mailbox" name="Mailbox" :position="[2.5, 0, 7.0]" />

    <!-- ── Path from door (decorative stone slabs) ────────────────── -->
    <StoneSlab :position="[0, 0.03, 5.0]" :size="[1.4, 0.06, 1.0]" />
    <StoneSlab :position="[0, 0.03, 6.2]" :size="[1.2, 0.06, 0.8]" color="#a8a080" />
    <StoneSlab :position="[0.2, 0.03, 7.2]" :size="[1.0, 0.06, 0.7]" />

    <!-- ── Garden fence (front yard) ──────────────────────────────── -->
    <Fence id="fence-front-l" name="Fence" :position="[-5.5, 0, 8.5]" :width="5" />
    <Fence id="fence-front-r" name="Fence" :position="[5.5, 0, 8.5]" :width="5" />
    <Fence id="fence-left" name="Fence" :position="[-8, 0, 4.5]" :width="8" :rotation="[0, Math.PI / 2, 0]" :collider-size="{ hw: 0.1, hd: 4 }" />
    <Fence id="fence-right" name="Fence" :position="[8, 0, 4.5]" :width="8" :rotation="[0, Math.PI / 2, 0]" :collider-size="{ hw: 0.1, hd: 4 }" />

    <!-- ── Interior yard trees ─────────────────────────────────────── -->
    <OakTree id="oak-yard-1" :position="[-6, 0, -4]" />
    <OakTree id="oak-yard-2" :position="[7, 0, -3]" />
    <PineTree id="pine-yard-1" :position="[-10, 0, 6]" />
    <OakTree id="oak-yard-3" :position="[11, 0, 2]" />

    <!-- ── Forest border — north (3 rows deep) ──────────────────── -->
    <!-- Row 1 -->
    <PineTree id="bn1a" :position="[-14, 0, -12]" />
    <OakTree id="bn1b" :position="[-12, 0, -12.5]" />
    <PineTree id="bn1c" :position="[-10, 0, -12]" />
    <OakTree id="bn1d" :position="[-8, 0, -12.5]" />
    <PineTree id="bn1e" :position="[-6, 0, -12]" />
    <OakTree id="bn1f" :position="[-4, 0, -12.5]" />
    <PineTree id="bn1g" :position="[-2, 0, -12]" />
    <OakTree id="bn1h" :position="[0, 0, -12.5]" />
    <PineTree id="bn1i" :position="[2, 0, -12]" />
    <OakTree id="bn1j" :position="[4, 0, -12.5]" />
    <PineTree id="bn1k" :position="[6, 0, -12]" />
    <OakTree id="bn1l" :position="[8, 0, -12.5]" />
    <PineTree id="bn1m" :position="[10, 0, -12]" />
    <OakTree id="bn1n" :position="[12, 0, -12.5]" />
    <PineTree id="bn1o" :position="[14, 0, -12]" />
    <!-- Row 2 -->
    <OakTree id="bn2a" :position="[-13, 0, -13.5]" />
    <PineTree id="bn2b" :position="[-11, 0, -14]" />
    <OakTree id="bn2c" :position="[-9, 0, -13.5]" />
    <PineTree id="bn2d" :position="[-7, 0, -14]" />
    <OakTree id="bn2e" :position="[-5, 0, -13.5]" />
    <PineTree id="bn2f" :position="[-3, 0, -14]" />
    <OakTree id="bn2g" :position="[-1, 0, -13.5]" />
    <PineTree id="bn2h" :position="[1, 0, -14]" />
    <OakTree id="bn2i" :position="[3, 0, -13.5]" />
    <PineTree id="bn2j" :position="[5, 0, -14]" />
    <OakTree id="bn2k" :position="[7, 0, -13.5]" />
    <PineTree id="bn2l" :position="[9, 0, -14]" />
    <OakTree id="bn2m" :position="[11, 0, -13.5]" />
    <PineTree id="bn2n" :position="[13, 0, -14]" />
    <!-- Row 3 (outermost) -->
    <PineTree id="bn3a" :position="[-14, 0, -15]" />
    <PineTree id="bn3b" :position="[-11.5, 0, -15.5]" />
    <PineTree id="bn3c" :position="[-9, 0, -15]" />
    <PineTree id="bn3d" :position="[-6.5, 0, -15.5]" />
    <PineTree id="bn3e" :position="[-4, 0, -15]" />
    <PineTree id="bn3f" :position="[-1.5, 0, -15.5]" />
    <PineTree id="bn3g" :position="[1, 0, -15]" />
    <PineTree id="bn3h" :position="[3.5, 0, -15.5]" />
    <PineTree id="bn3i" :position="[6, 0, -15]" />
    <PineTree id="bn3j" :position="[8.5, 0, -15.5]" />
    <PineTree id="bn3k" :position="[11, 0, -15]" />
    <PineTree id="bn3l" :position="[13.5, 0, -15.5]" />

    <!-- ── Forest border — south (3 rows deep) ──────────────────── -->
    <!-- Row 1 -->
    <OakTree id="bs1a" :position="[-14, 0, 12]" />
    <PineTree id="bs1b" :position="[-12, 0, 12.5]" />
    <OakTree id="bs1c" :position="[-10, 0, 12]" />
    <PineTree id="bs1d" :position="[-8, 0, 12.5]" />
    <OakTree id="bs1e" :position="[-6, 0, 12]" />
    <PineTree id="bs1f" :position="[-4, 0, 12.5]" />
    <OakTree id="bs1g" :position="[-2, 0, 12]" />
    <PineTree id="bs1h" :position="[0, 0, 12.5]" />
    <OakTree id="bs1i" :position="[2, 0, 12]" />
    <PineTree id="bs1j" :position="[4, 0, 12.5]" />
    <OakTree id="bs1k" :position="[6, 0, 12]" />
    <PineTree id="bs1l" :position="[8, 0, 12.5]" />
    <OakTree id="bs1m" :position="[10, 0, 12]" />
    <PineTree id="bs1n" :position="[12, 0, 12.5]" />
    <OakTree id="bs1o" :position="[14, 0, 12]" />
    <!-- Row 2 -->
    <PineTree id="bs2a" :position="[-13, 0, 13.5]" />
    <OakTree id="bs2b" :position="[-11, 0, 14]" />
    <PineTree id="bs2c" :position="[-9, 0, 13.5]" />
    <OakTree id="bs2d" :position="[-7, 0, 14]" />
    <PineTree id="bs2e" :position="[-5, 0, 13.5]" />
    <OakTree id="bs2f" :position="[-3, 0, 14]" />
    <PineTree id="bs2g" :position="[-1, 0, 13.5]" />
    <OakTree id="bs2h" :position="[1, 0, 14]" />
    <PineTree id="bs2i" :position="[3, 0, 13.5]" />
    <OakTree id="bs2j" :position="[5, 0, 14]" />
    <PineTree id="bs2k" :position="[7, 0, 13.5]" />
    <OakTree id="bs2l" :position="[9, 0, 14]" />
    <PineTree id="bs2m" :position="[11, 0, 13.5]" />
    <OakTree id="bs2n" :position="[13, 0, 14]" />
    <!-- Row 3 -->
    <PineTree id="bs3a" :position="[-14, 0, 15]" />
    <PineTree id="bs3b" :position="[-11.5, 0, 15.5]" />
    <PineTree id="bs3c" :position="[-9, 0, 15]" />
    <PineTree id="bs3d" :position="[-6.5, 0, 15.5]" />
    <PineTree id="bs3e" :position="[-4, 0, 15]" />
    <PineTree id="bs3f" :position="[-1.5, 0, 15.5]" />
    <PineTree id="bs3g" :position="[1, 0, 15]" />
    <PineTree id="bs3h" :position="[3.5, 0, 15.5]" />
    <PineTree id="bs3i" :position="[6, 0, 15]" />
    <PineTree id="bs3j" :position="[8.5, 0, 15.5]" />
    <PineTree id="bs3k" :position="[11, 0, 15]" />
    <PineTree id="bs3l" :position="[13.5, 0, 15.5]" />

    <!-- ── Forest border — west (3 rows deep) ───────────────────── -->
    <!-- Row 1 -->
    <PineTree id="bw1a" :position="[-12, 0, -10]" />
    <OakTree id="bw1b" :position="[-12.5, 0, -8]" />
    <PineTree id="bw1c" :position="[-12, 0, -6]" />
    <OakTree id="bw1d" :position="[-12.5, 0, -4]" />
    <PineTree id="bw1e" :position="[-12, 0, -2]" />
    <OakTree id="bw1f" :position="[-12.5, 0, 0]" />
    <PineTree id="bw1g" :position="[-12, 0, 2]" />
    <OakTree id="bw1h" :position="[-12.5, 0, 4]" />
    <PineTree id="bw1i" :position="[-12, 0, 6]" />
    <OakTree id="bw1j" :position="[-12.5, 0, 8]" />
    <PineTree id="bw1k" :position="[-12, 0, 10]" />
    <!-- Row 2 -->
    <OakTree id="bw2a" :position="[-13.5, 0, -11]" />
    <PineTree id="bw2b" :position="[-14, 0, -9]" />
    <OakTree id="bw2c" :position="[-13.5, 0, -7]" />
    <PineTree id="bw2d" :position="[-14, 0, -5]" />
    <OakTree id="bw2e" :position="[-13.5, 0, -3]" />
    <PineTree id="bw2f" :position="[-14, 0, -1]" />
    <OakTree id="bw2g" :position="[-13.5, 0, 1]" />
    <PineTree id="bw2h" :position="[-14, 0, 3]" />
    <OakTree id="bw2i" :position="[-13.5, 0, 5]" />
    <PineTree id="bw2j" :position="[-14, 0, 7]" />
    <OakTree id="bw2k" :position="[-13.5, 0, 9]" />
    <PineTree id="bw2l" :position="[-14, 0, 11]" />
    <!-- Row 3 -->
    <PineTree id="bw3a" :position="[-15, 0, -10.5]" />
    <PineTree id="bw3b" :position="[-15.5, 0, -8]" />
    <PineTree id="bw3c" :position="[-15, 0, -5.5]" />
    <PineTree id="bw3d" :position="[-15.5, 0, -3]" />
    <PineTree id="bw3e" :position="[-15, 0, -0.5]" />
    <PineTree id="bw3f" :position="[-15.5, 0, 2]" />
    <PineTree id="bw3g" :position="[-15, 0, 4.5]" />
    <PineTree id="bw3h" :position="[-15.5, 0, 7]" />
    <PineTree id="bw3i" :position="[-15, 0, 9.5]" />

    <!-- ── Forest border — east (3 rows deep) ────────────────────── -->
    <!-- Row 1 -->
    <OakTree id="be1a" :position="[12, 0, -10]" />
    <PineTree id="be1b" :position="[12.5, 0, -8]" />
    <OakTree id="be1c" :position="[12, 0, -6]" />
    <PineTree id="be1d" :position="[12.5, 0, -4]" />
    <OakTree id="be1e" :position="[12, 0, -2]" />
    <PineTree id="be1f" :position="[12.5, 0, 0]" />
    <OakTree id="be1g" :position="[12, 0, 2]" />
    <PineTree id="be1h" :position="[12.5, 0, 4]" />
    <OakTree id="be1i" :position="[12, 0, 6]" />
    <PineTree id="be1j" :position="[12.5, 0, 8]" />
    <OakTree id="be1k" :position="[12, 0, 10]" />
    <!-- Row 2 -->
    <PineTree id="be2a" :position="[13.5, 0, -11]" />
    <OakTree id="be2b" :position="[14, 0, -9]" />
    <PineTree id="be2c" :position="[13.5, 0, -7]" />
    <OakTree id="be2d" :position="[14, 0, -5]" />
    <PineTree id="be2e" :position="[13.5, 0, -3]" />
    <OakTree id="be2f" :position="[14, 0, -1]" />
    <PineTree id="be2g" :position="[13.5, 0, 1]" />
    <OakTree id="be2h" :position="[14, 0, 3]" />
    <PineTree id="be2i" :position="[13.5, 0, 5]" />
    <OakTree id="be2j" :position="[14, 0, 7]" />
    <PineTree id="be2k" :position="[13.5, 0, 9]" />
    <OakTree id="be2l" :position="[14, 0, 11]" />
    <!-- Row 3 -->
    <PineTree id="be3a" :position="[15, 0, -10.5]" />
    <PineTree id="be3b" :position="[15.5, 0, -8]" />
    <PineTree id="be3c" :position="[15, 0, -5.5]" />
    <PineTree id="be3d" :position="[15.5, 0, -3]" />
    <PineTree id="be3e" :position="[15, 0, -0.5]" />
    <PineTree id="be3f" :position="[15.5, 0, 2]" />
    <PineTree id="be3g" :position="[15, 0, 4.5]" />
    <PineTree id="be3h" :position="[15.5, 0, 7]" />
    <PineTree id="be3i" :position="[15, 0, 9.5]" />

    <!-- ── Decorative flower patches ──────────────────────────────── -->
    <FlowerBed :position="[-1.5, 0, 5.5]" :flowers="leftFlowerBed" />
    <FlowerBed :position="[1.5, 0, 5.5]" :flowers="rightFlowerBed" />

    <!-- ── Rocks (decorative, no collision) ────────────────────────── -->
    <Rock :position="[5, 0.12, 5]" />
    <Rock :position="[-9, 0.1, -2]" :size="[0.6, 0.2, 0.5]" color="#7a7a6a" />
    <Rock :position="[6, 0.15, 10]" :size="[0.4, 0.3, 0.35]" color="#9a9a8a" />
  </SceneShell>
</template>
