<script setup lang="ts">
import { onUnmounted } from "vue"
import { TresCanvas } from "@tresjs/core"
import { EffectComposerPmndrs, BloomPmndrs } from "@tresjs/post-processing"
import Player from "../player/Player.vue"
import DestinationMarker from "../player/DestinationMarker.vue"
import OcclusionRevealer from "../camera/OcclusionRevealer.vue"
import { useSceneSetup } from "./useSceneSetup"
import type { SceneConfig } from "./useSceneSetup"
import { usePhysicsStore } from "../physics/usePhysicsStore"

interface Props {
  config: SceneConfig
  clearColor?: string
  ambientIntensity?: number
  directionalIntensity?: number
  directionalPosition?: [number, number, number]
}

const { config, clearColor = "#1a1a2e", ambientIntensity = 1.5, directionalIntensity = 0.4, directionalPosition = [2, 6, 3] } = defineProps<Props>()

const physicsStore = usePhysicsStore()

// Create a fresh Rapier physics world for this scene.
physicsStore.createSceneWorld()

onUnmounted(() => {
  physicsStore.destroySceneWorld()
})

const { floorTiles, solidFloorColor, roomWidth, roomHeight, cameraPosition, cameraLookAt, spawnPosition, gameState } = useSceneSetup(config)
</script>

<template>
  <div class="scene-container">
    <TresCanvas :clear-color="clearColor">
      <TresPerspectiveCamera
        :position="cameraPosition"
        :look-at="cameraLookAt"
        :fov="config.camera.fov"
        :near="config.camera.near"
        :far="config.camera.far"
      />

      <EffectComposerPmndrs>
        <BloomPmndrs :intensity="1.8" :luminance-threshold="0.6" :luminance-smoothing="0.1" :mipmap-blur="true" />
      </EffectComposerPmndrs>

      <OcclusionRevealer />
      <Player :initial-position="spawnPosition" />
      <DestinationMarker v-if="gameState.tapDestination !== null" :position="[gameState.tapDestination.x, 0, gameState.tapDestination.z]" />

      <TresGroup>
        <TresAmbientLight :intensity="ambientIntensity" />
        <TresDirectionalLight :position="directionalPosition" :intensity="directionalIntensity" />

        <!-- Solid ground plane (outdoor) -->
        <TresMesh v-if="solidFloorColor !== null" :position="[0, -0.025, 0]">
          <TresBoxGeometry :args="[roomWidth, 0.05, roomHeight]" />
          <TresMeshLambertMaterial :color="solidFloorColor" />
        </TresMesh>

        <!-- Checkerboard tiles (indoor) -->
        <TresMesh v-for="(tile, i) in floorTiles" v-else :key="`tile-${i}`" :position="[tile.x, 0, tile.z]">
          <TresBoxGeometry :args="[1, 0.05, 1]" />
          <TresMeshLambertMaterial :color="tile.color" />
        </TresMesh>

        <slot />
      </TresGroup>
    </TresCanvas>
  </div>
</template>

<style scoped>
.scene-container {
  width: 100%;
  height: 100%;
}
</style>
