<script setup lang="ts">
import SceneShell from "../SceneShell.vue"
import type { SceneConfig } from "../useSceneSetup"
import Wall from "../../furniture/Wall.vue"
import Table from "../../furniture/Table.vue"
import TVStand from "../../furniture/TVStand.vue"
import Rug from "../../furniture/Rug.vue"
import Sofa from "../../furniture/Sofa.vue"
import DiningTable from "../../furniture/DiningTable.vue"
import KitchenCounter from "../../furniture/KitchenCounter.vue"
import TV from "../../props/tv/TV.vue"
import FlowerVase from "../../props/FlowerVase.vue"
import Staircase from "../../transitions/Staircase.vue"
import Doorway from "../../transitions/Doorway.vue"
import MomNpc from "../../npcs/MomNpc.vue"
import InteractionIndicator from "../../ui/InteractionIndicator.vue"

const sceneConfig: SceneConfig = {
  roomWidth: 14,
  roomHeight: 12,
  floorColors: { light: "#c2aa88", dark: "#b29878" },
  camera: { fov: 45, near: 0.1, far: 120, offset: { x: 0, y: 10, z: 6 } },
  entryPoints: {
    default: [0, 0, 4.0],
    "from-bedroom": [0, 0, -5.5],
    "from-outside": [0, 0, 5.0],
  },
}

// ── NPC descriptions ──────────────────────────────────────────────────────────
const momDescription = `Your name is Mom. You are the player's warm, loving mother in a small RPG town.
You are in the kitchen of your home, having just finished preparing a home-cooked meal.
You are nurturing, slightly overprotective, proud of your child, and grounded in everyday home life.
You talk about cooking, the smell of food, the warmth of home, and your happiness that your child finally came downstairs.
You have NO knowledge of technology, AI, or the outside world beyond your small town.

CURRENT OBJECTIVE: Encourage the player to sit down at the dining table and eat. Be warm and celebratory that they came downstairs. Ask them how they slept, comment on the meal you made, and hint that you have something important to tell them before they go off on their journey.`
</script>

<template>
  <SceneShell :config="sceneConfig" clear-color="#1a1a1e" :ambient-intensity="1.4" :directional-intensity="0.5" :directional-position="[2, 8, 4]">
    <!-- Walls (north split for staircase gap; east + west full; south split for front door) -->
    <Wall :position="[-3.93, 0, -6.25]" :width="6.14" :depth="0.5" color="#7a6548" />
    <Wall :position="[3.93, 0, -6.25]" :width="6.14" :depth="0.5" color="#7a6548" />
    <Wall :position="[-7.25, 0, 0]" :width="0.5" :depth="13" color="#7a6548" />
    <Wall :position="[7.25, 0, 0]" :width="0.5" :depth="13" color="#7a6548" />
    <!-- South wall split — gap matches doorway frame width (~1.5 units) -->
    <Wall :position="[-3.875, 0, 6.25]" :width="6.25" :depth="0.5" color="#7a6548" />
    <Wall :position="[3.875, 0, 6.25]" :width="6.25" :depth="0.5" color="#7a6548" />

    <!-- ── Living room (west) ─────────────────────────────────────── -->
    <Sofa name="Sofa" :position="[-4.5, 0, -1.0]" />
    <Table name="Coffee Table" :position="[-4.5, 0, 1.0]" />
    <Rug :position="[-4.0, 0, 0.5]" />

    <!-- TV against west wall, rotated to face east into the room -->
    <TV :position="[-6.3, 0, -0.5]" :rotation="[0, Math.PI / 2, 0]">
      <InteractionIndicator :position="[0, 1.87, 0]" />
    </TV>

    <!-- Decorative plant on a small pedestal stand -->
    <TVStand name="Plant Stand" :position="[-5.5, 0, 3.0]">
      <FlowerVase :position="[0, 0.5, 0]" />
    </TVStand>

    <!-- ── Kitchen / dining (east) ───────────────────────────────── -->
    <!-- Counter along north wall -->
    <KitchenCounter name="Kitchen Counter" :position="[4.5, 0, -5.5]" />
    <!-- Counter along east wall (rotated 90°, collider swapped) -->
    <KitchenCounter name="Kitchen Counter" :position="[6.5, 0, -3.5]" :rotation="[0, Math.PI / 2, 0]" :collider-size="{ hw: 0.35, hd: 1.5 }" />

    <DiningTable name="Dining Table" :position="[4.0, 0, 1.5]" />

    <MomNpc name="Mom" :position="[3.0, 0, -2.5]" :description="momDescription">
      <InteractionIndicator :position="[0, 2.1, 0]" />
    </MomNpc>

    <!-- ── Front door — south wall centre, leading outside ────────── -->
    <Doorway name="Front Door" :position="[0, 0, 6.2]" target-scene="home-exterior" target-entrypoint="from-first-floor" action-label="Go outside">
      <InteractionIndicator :position="[0, 1.8, 0]" />
    </Doorway>

    <!-- ── Staircase — north wall centred, leading upstairs ───────── -->
    <Staircase name="Stairs" :position="[0, -0.22, -6.9]" target-scene="bedroom" target-entrypoint="from-first-floor" action-label="Go upstairs">
      <InteractionIndicator :position="[0, 1.3, 0]" />
    </Staircase>
  </SceneShell>
</template>
