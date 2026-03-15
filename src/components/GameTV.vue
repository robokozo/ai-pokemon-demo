<script setup lang="ts">
import { watch, onUnmounted } from "vue";
import { useTVNews } from "../composables/useTVNews";
import InteractionIndicator from "./InteractionIndicator.vue";

interface Props {
  position?: [number, number, number];
  rotation?: [number, number, number];
  isOn?: boolean;
  showIndicator?: boolean;
  dialogOpen?: boolean;
}

const {
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  isOn = false,
  showIndicator = false,
  dialogOpen = false,
} = defineProps<Props>();

const TV_INITIAL_DELAY_MS = 800;
const TV_RESUME_DELAY_MS = 4000;

const tvNews = useTVNews();
let resumeTimerId: ReturnType<typeof setTimeout> | null = null;

// Start/stop the news broadcast when the TV is switched on/off
watch(
  () => isOn,
  (nowOn) => {
    if (nowOn === true) {
      tvNews.start(TV_INITIAL_DELAY_MS);
    } else {
      if (resumeTimerId !== null) {
        clearTimeout(resumeTimerId);
        resumeTimerId = null;
      }
      tvNews.stop();
    }
  },
);

// Pause speech while a dialog is open; resume after it closes
watch(
  () => dialogOpen,
  (isOpen) => {
    if (isOpen === true) {
      if (resumeTimerId !== null) {
        clearTimeout(resumeTimerId);
        resumeTimerId = null;
      }
      tvNews.stop();
    } else {
      if (isOn === true) {
        resumeTimerId = setTimeout(() => {
          resumeTimerId = null;
          if (isOn === true) {
            tvNews.start();
          }
        }, TV_RESUME_DELAY_MS);
      }
    }
  },
);

onUnmounted(() => {
  if (resumeTimerId !== null) {
    clearTimeout(resumeTimerId);
    resumeTimerId = null;
  }
  tvNews.stop();
});
</script>

<template>
  <TresGroup :position="position" :rotation="rotation">
    <!-- Stand / cabinet -->
    <TresMesh :position="[0, 0.25, 0]" :cast-shadow="true" :receive-shadow="true">
      <TresBoxGeometry :args="[1.2, 0.5, 0.45]" />
      <TresMeshLambertMaterial color="#5a3e28" />
    </TresMesh>
    <!-- Housing -->
    <TresMesh :position="[0, 1.0, 0]" :cast-shadow="true">
      <TresBoxGeometry :args="[1.4, 0.9, 0.28]" />
      <TresMeshLambertMaterial color="#1a1a1a" />
    </TresMesh>
    <!-- Screen — glows when on -->
    <TresMesh :position="[0, 1.0, 0.145]">
      <TresBoxGeometry :args="[1.15, 0.65, 0.01]" />
      <TresMeshLambertMaterial
        :color="isOn === true ? '#a8d8ff' : '#111111'"
        :emissive="isOn === true ? '#4ab0ff' : '#000000'"
        :emissive-intensity="isOn === true ? 1.2 : 0"
      />
    </TresMesh>
    <!-- Power indicator light -->
    <TresMesh :position="[0.62, 0.57, 0.145]">
      <TresCylinderGeometry :args="[0.025, 0.025, 0.015, 8]" />
      <TresMeshLambertMaterial
        :color="isOn === true ? '#00ff88' : '#1a4a2a'"
        :emissive="isOn === true ? '#00ff88' : '#000000'"
        :emissive-intensity="isOn === true ? 0.8 : 0"
      />
    </TresMesh>
    <!-- Interaction indicator — positioned above top and in front of screen to avoid clipping -->
    <InteractionIndicator v-if="showIndicator === true" :position="[0, 1.87, 0.2]" />
  </TresGroup>
</template>
