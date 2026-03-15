<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { useLoop } from "@tresjs/core"
import { useTimeoutFn } from "@vueuse/core"
import { useTVNews } from "../../composables/useTVNews"

interface Props {
  position?: [number, number, number]
  rotation?: [number, number, number]
  isOn?: boolean
  dialogOpen?: boolean
}

const { position = [0, 0, 0], rotation = [0, 0, 0], isOn = false, dialogOpen = false } = defineProps<Props>()

const TV_INITIAL_DELAY_MS = 800

// Animated screen brightness — very subtle pulse between 0.85 and 1.1
const screenPulse = ref(0)
// Inset story box + ticker: appear when a new story starts, hide after it ends
const showInset = ref(false)
const showTicker = ref(false)

const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => {
  if (isOn === true) {
    screenPulse.value = (Math.sin(elapsed * 1.26) + 1) / 2
  }
})

// Emissive intensity: 0.9 → 1.0
const screenBrightness = computed(() => 0.9 + screenPulse.value * 0.1)
// Emissive color: dim blue-grey → mid bright blue
const screenEmissive = computed(() => {
  const t = screenPulse.value
  const r = Math.round(0x1a + t * (0x4a - 0x1a))
  const g = Math.round(0x4a + t * (0xa0 - 0x4a))
  const b = Math.round(0x6a + t * (0xe0 - 0x6a))
  return `rgb(${r},${g},${b})`
})
const TV_RESUME_DELAY_MS = 4000

const tvNews = useTVNews()
const { start: startResumeTimer, stop: stopResumeTimer } = useTimeoutFn(
  () => {
    if (isOn === true) {
      tvNews.start()
    }
  },
  TV_RESUME_DELAY_MS,
  { immediate: false },
)

tvNews.onStoryStart(() => {
  showInset.value = true
  showTicker.value = true
})

tvNews.onStoryEnd(() => {
  showInset.value = false
  showTicker.value = false
})

// Start/stop the news broadcast when the TV is switched on/off
watch(
  () => isOn,
  (nowOn) => {
    if (nowOn === true) {
      tvNews.start(TV_INITIAL_DELAY_MS)
    } else {
      stopResumeTimer()
      tvNews.stop()
    }
  },
)

// Pause speech while a dialog is open; resume after it closes
watch(
  () => dialogOpen,
  (isOpen) => {
    if (isOpen === true) {
      stopResumeTimer()
      tvNews.stop()
    } else {
      if (isOn === true) {
        startResumeTimer()
      }
    }
  },
)
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
        :emissive="isOn === true ? screenEmissive : '#000000'"
        :emissive-intensity="isOn === true ? screenBrightness : 0"
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

    <!-- ── Broadcast overlay (visible only when on) ── -->
    <!-- All elements sit at z=0.156, just in front of the screen face (z=0.15).
         Screen spans x: -0.575→0.575, y: 0.675→1.325. -->
    <TresGroup v-if="isOn === true">
      <!-- Anchor figure — right half of screen -->
      <!-- Hair — top cap (dark brown) -->
      <TresMesh :position="[0.22, 1.245, 0.156]">
        <TresBoxGeometry :args="[0.145, 0.055, 0.008]" />
        <TresMeshLambertMaterial color="#3b1f0e" :emissive="'#2a1208'" :emissive-intensity="0.25" />
      </TresMesh>
      <!-- Hair — left side panel (frames the face) -->
      <TresMesh :position="[0.148, 1.17, 0.154]">
        <TresBoxGeometry :args="[0.022, 0.13, 0.006]" />
        <TresMeshLambertMaterial color="#3b1f0e" :emissive="'#2a1208'" :emissive-intensity="0.25" />
      </TresMesh>
      <!-- Hair — right side panel -->
      <TresMesh :position="[0.292, 1.17, 0.154]">
        <TresBoxGeometry :args="[0.022, 0.13, 0.006]" />
        <TresMeshLambertMaterial color="#3b1f0e" :emissive="'#2a1208'" :emissive-intensity="0.25" />
      </TresMesh>
      <!-- Hair — shoulder-length flow, left -->
      <TresMesh :position="[0.133, 1.065, 0.154]">
        <TresBoxGeometry :args="[0.038, 0.13, 0.006]" />
        <TresMeshLambertMaterial color="#3b1f0e" :emissive="'#2a1208'" :emissive-intensity="0.25" />
      </TresMesh>
      <!-- Hair — shoulder-length flow, right -->
      <TresMesh :position="[0.307, 1.065, 0.154]">
        <TresBoxGeometry :args="[0.038, 0.13, 0.006]" />
        <TresMeshLambertMaterial color="#3b1f0e" :emissive="'#2a1208'" :emissive-intensity="0.25" />
      </TresMesh>
      <!-- Head (skin tone) -->
      <TresMesh :position="[0.22, 1.17, 0.156]">
        <TresBoxGeometry :args="[0.13, 0.13, 0.005]" />
        <TresMeshLambertMaterial color="#c8906a" :emissive="'#a06040'" :emissive-intensity="0.25" />
      </TresMesh>
      <!-- Neck (skin tone) -->
      <TresMesh :position="[0.22, 1.075, 0.156]">
        <TresBoxGeometry :args="[0.05, 0.06, 0.005]" />
        <TresMeshLambertMaterial color="#c8906a" :emissive="'#a06040'" :emissive-intensity="0.25" />
      </TresMesh>
      <!-- Shoulders / torso (navy suit) -->
      <TresMesh :position="[0.22, 0.95, 0.156]">
        <TresBoxGeometry :args="[0.3, 0.22, 0.005]" />
        <TresMeshLambertMaterial color="#1e3252" :emissive="'#0e1e38'" :emissive-intensity="0.3" />
      </TresMesh>
      <!-- Blouse — V-neckline hint -->
      <TresMesh :position="[0.22, 0.99, 0.157]">
        <TresBoxGeometry :args="[0.09, 0.11, 0.004]" />
        <TresMeshLambertMaterial color="#e8d8c8" :emissive="'#c8b8a8'" :emissive-intensity="0.2" />
      </TresMesh>
      <!-- Anchor desk strip -->
      <TresMesh :position="[0.22, 0.82, 0.156]">
        <TresBoxGeometry :args="[0.38, 0.055, 0.005]" />
        <TresMeshLambertMaterial color="#0d1f30" :emissive="'#0d1f30'" :emissive-intensity="0.4" />
      </TresMesh>

      <!-- News story inset — top-left corner (visible at story start) -->
      <TresGroup v-if="showInset === true">
        <!-- Inset background -->
        <TresMesh :position="[-0.27, 1.19, 0.156]">
          <TresBoxGeometry :args="[0.38, 0.21, 0.005]" />
          <TresMeshLambertMaterial color="#0a1520" :emissive="'#0a1520'" :emissive-intensity="0.5" />
        </TresMesh>
        <!-- Inset accent border (top) -->
        <TresMesh :position="[-0.27, 1.302, 0.157]">
          <TresBoxGeometry :args="[0.38, 0.014, 0.005]" />
          <TresMeshLambertMaterial color="#ff4422" :emissive="'#ff4422'" :emissive-intensity="0.8" />
        </TresMesh>
        <!-- Inset content lines (simulated image/map) -->
        <TresMesh :position="[-0.27, 1.2, 0.157]">
          <TresBoxGeometry :args="[0.3, 0.025, 0.004]" />
          <TresMeshLambertMaterial color="#2a4a6a" :emissive="'#2a4a6a'" :emissive-intensity="0.4" />
        </TresMesh>
        <TresMesh :position="[-0.27, 1.16, 0.157]">
          <TresBoxGeometry :args="[0.22, 0.025, 0.004]" />
          <TresMeshLambertMaterial color="#2a4a6a" :emissive="'#2a4a6a'" :emissive-intensity="0.4" />
        </TresMesh>
      </TresGroup>

      <!-- Lower-third band -->
      <!-- Background strip -->
      <TresMesh :position="[-0.05, 0.726, 0.156]">
        <TresBoxGeometry :args="[1.05, 0.09, 0.005]" />
        <TresMeshLambertMaterial color="#0a1a2e" :emissive="'#0a1a2e'" :emissive-intensity="0.6" />
      </TresMesh>
      <!-- Accent colour block on the left -->
      <TresMesh :position="[-0.48, 0.726, 0.157]">
        <TresBoxGeometry :args="[0.1, 0.09, 0.004]" />
        <TresMeshLambertMaterial color="#ff4422" :emissive="'#ff4422'" :emissive-intensity="0.9" />
      </TresMesh>
      <!-- Text lines (simulated ticker, shown at story start) -->
      <TresMesh v-if="showTicker === true" :position="[-0.01, 0.74, 0.157]">
        <TresBoxGeometry :args="[0.72, 0.025, 0.004]" />
        <TresMeshLambertMaterial color="#c8e0f0" :emissive="'#c8e0f0'" :emissive-intensity="0.5" />
      </TresMesh>
      <TresMesh v-if="showTicker === true" :position="[-0.08, 0.712, 0.157]">
        <TresBoxGeometry :args="[0.58, 0.02, 0.004]" />
        <TresMeshLambertMaterial color="#7aaac8" :emissive="'#7aaac8'" :emissive-intensity="0.4" />
      </TresMesh>
    </TresGroup>

    <!-- Slot — parent places the InteractionIndicator here when appropriate -->
    <slot />
  </TresGroup>
</template>
