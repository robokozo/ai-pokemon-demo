<script setup lang="ts">
import { ref, watch } from "vue"
import { useTVNews } from "./useTVNews"
import { useEntity } from "../../useEntity"
import TVStand from "../../furniture/TVStand.vue"

interface Props {
  position?: [number, number, number]
  rotation?: [number, number, number]
  castShadow?: boolean
}

const { position = [0, 0, 0], rotation = [0, 0, 0], castShadow = false } = defineProps<Props>()

const tvState = ref<"on" | "off">("off")

function toggleTV() {
  tvState.value = tvState.value === "on" ? "off" : "on"
}

// Interactive entity — TVStand handles the solid collision
useEntity({
  id: "tv",
  name: "TV",
  kind: "prop",
  collider: "none",
  interactive: true,
  isStatic: true,
  position,
  onInteract: () => toggleTV(),
  actionLabel: () => (tvState.value === "on" ? "Turn off TV" : "Turn on TV"),
})

const TV_INITIAL_DELAY_MS = 800

const showInset = ref(false)
const showTicker = ref(false)

const tvNews = useTVNews()

tvNews.onStoryStart(() => {
  showInset.value = true
  showTicker.value = true
})

tvNews.onStoryEnd(() => {
  showInset.value = false
  showTicker.value = false
})

watch(
  () => tvState.value,
  (nowState) => {
    if (nowState === "on") {
      tvNews.start(TV_INITIAL_DELAY_MS)
    } else {
      tvNews.stop()
    }
  },
)
</script>

<template>
  <!-- TVStand owns the cabinet visuals and solid collision.
       All slot content is positioned relative to the stand group's origin. -->
  <TVStand id="tv-stand" name="TV Stand" :position="position" :rotation="rotation" :collider-size="{ hw: 0.35, hd: 0.75 }" :cast-shadow="castShadow">
    <!-- Housing — centre sits 1.0 above stand base (stand top = y 0.5) -->
    <TresMesh :position="[0, 1.0, 0]" :cast-shadow="castShadow">
      <TresBoxGeometry :args="[1.4, 0.9, 0.28]" />
      <TresMeshLambertMaterial color="#1a1a1a" />
    </TresMesh>
    <!-- Screen — emissive when on -->
    <TresMesh :position="[0, 1.0, 0.145]">
      <TresBoxGeometry :args="[1.15, 0.65, 0.01]" />
      <TresMeshStandardMaterial
        :color="tvState === 'on' ? '#a8d8ff' : '#111111'"
        :emissive="tvState === 'on' ? '#a8d8ff' : '#000000'"
        :emissive-intensity="tvState === 'on' ? 2.2 : 0"
      />
    </TresMesh>
    <!-- Power indicator light -->
    <TresMesh :position="[0.62, 0.57, 0.145]">
      <TresCylinderGeometry :args="[0.025, 0.025, 0.015, 8]" />
      <TresMeshLambertMaterial
        :color="tvState === 'on' ? '#00ff88' : '#1a4a2a'"
        :emissive="tvState === 'on' ? '#00ff88' : '#000000'"
        :emissive-intensity="tvState === 'on' ? 0.8 : 0"
      />
    </TresMesh>

    <!-- ── Broadcast overlay (visible only when on) ── -->
    <TresGroup v-if="tvState === 'on'">
      <!-- Anchor figure — right half of screen -->
      <TresMesh :position="[0.22, 1.245, 0.156]">
        <TresBoxGeometry :args="[0.145, 0.055, 0.008]" />
        <TresMeshLambertMaterial color="#3b1f0e" :emissive="'#2a1208'" :emissive-intensity="0.25" />
      </TresMesh>
      <TresMesh :position="[0.148, 1.17, 0.154]">
        <TresBoxGeometry :args="[0.022, 0.13, 0.006]" />
        <TresMeshLambertMaterial color="#3b1f0e" :emissive="'#2a1208'" :emissive-intensity="0.25" />
      </TresMesh>
      <TresMesh :position="[0.292, 1.17, 0.154]">
        <TresBoxGeometry :args="[0.022, 0.13, 0.006]" />
        <TresMeshLambertMaterial color="#3b1f0e" :emissive="'#2a1208'" :emissive-intensity="0.25" />
      </TresMesh>
      <TresMesh :position="[0.133, 1.065, 0.154]">
        <TresBoxGeometry :args="[0.038, 0.13, 0.006]" />
        <TresMeshLambertMaterial color="#3b1f0e" :emissive="'#2a1208'" :emissive-intensity="0.25" />
      </TresMesh>
      <TresMesh :position="[0.307, 1.065, 0.154]">
        <TresBoxGeometry :args="[0.038, 0.13, 0.006]" />
        <TresMeshLambertMaterial color="#3b1f0e" :emissive="'#2a1208'" :emissive-intensity="0.25" />
      </TresMesh>
      <TresMesh :position="[0.22, 1.17, 0.156]">
        <TresBoxGeometry :args="[0.13, 0.13, 0.005]" />
        <TresMeshLambertMaterial color="#c8906a" :emissive="'#a06040'" :emissive-intensity="0.25" />
      </TresMesh>
      <TresMesh :position="[0.22, 1.075, 0.156]">
        <TresBoxGeometry :args="[0.05, 0.06, 0.005]" />
        <TresMeshLambertMaterial color="#c8906a" :emissive="'#a06040'" :emissive-intensity="0.25" />
      </TresMesh>
      <TresMesh :position="[0.22, 0.95, 0.156]">
        <TresBoxGeometry :args="[0.3, 0.22, 0.005]" />
        <TresMeshLambertMaterial color="#1e3252" :emissive="'#0e1e38'" :emissive-intensity="0.3" />
      </TresMesh>
      <TresMesh :position="[0.22, 0.99, 0.157]">
        <TresBoxGeometry :args="[0.09, 0.11, 0.004]" />
        <TresMeshLambertMaterial color="#e8d8c8" :emissive="'#c8b8a8'" :emissive-intensity="0.2" />
      </TresMesh>
      <TresMesh :position="[0.22, 0.82, 0.156]">
        <TresBoxGeometry :args="[0.38, 0.055, 0.005]" />
        <TresMeshLambertMaterial color="#0d1f30" :emissive="'#0d1f30'" :emissive-intensity="0.4" />
      </TresMesh>

      <!-- News story inset -->
      <TresGroup v-if="showInset === true">
        <TresMesh :position="[-0.27, 1.19, 0.156]">
          <TresBoxGeometry :args="[0.38, 0.21, 0.005]" />
          <TresMeshLambertMaterial color="#0a1520" :emissive="'#0a1520'" :emissive-intensity="0.5" />
        </TresMesh>
        <TresMesh :position="[-0.27, 1.302, 0.157]">
          <TresBoxGeometry :args="[0.38, 0.014, 0.005]" />
          <TresMeshLambertMaterial color="#ff4422" :emissive="'#ff4422'" :emissive-intensity="0.8" />
        </TresMesh>
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
      <TresMesh :position="[-0.05, 0.726, 0.156]">
        <TresBoxGeometry :args="[1.05, 0.09, 0.005]" />
        <TresMeshLambertMaterial color="#0a1a2e" :emissive="'#0a1a2e'" :emissive-intensity="0.6" />
      </TresMesh>
      <TresMesh :position="[-0.48, 0.726, 0.157]">
        <TresBoxGeometry :args="[0.1, 0.09, 0.004]" />
        <TresMeshLambertMaterial color="#ff4422" :emissive="'#ff4422'" :emissive-intensity="0.9" />
      </TresMesh>
      <TresMesh v-if="showTicker === true" :position="[-0.01, 0.74, 0.157]">
        <TresBoxGeometry :args="[0.72, 0.025, 0.004]" />
        <TresMeshLambertMaterial color="#c8e0f0" :emissive="'#c8e0f0'" :emissive-intensity="0.5" />
      </TresMesh>
      <TresMesh v-if="showTicker === true" :position="[-0.08, 0.712, 0.157]">
        <TresBoxGeometry :args="[0.58, 0.02, 0.004]" />
        <TresMeshLambertMaterial color="#7aaac8" :emissive="'#7aaac8'" :emissive-intensity="0.4" />
      </TresMesh>
    </TresGroup>

    <!-- Slot — parent places InteractionIndicator here -->
    <slot />
  </TVStand>
</template>
