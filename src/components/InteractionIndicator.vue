<script setup lang="ts">
import * as THREE from "three";
import { ref } from "vue";
import { useLoop } from "@tresjs/core";

interface Props {
  position: [number, number, number];
  bounce?: boolean;
  bounceHeight?: number;
  bounceSpeed?: number;
}

const { position, bounce = true, bounceHeight = 0.12, bounceSpeed = 2.5 } = defineProps<Props>();

// Trapezoid shaft: wider at top (0.18), narrower at bottom (0.08), height 0.32, depth 0.05
const SHAFT_TOP_HALF = 0.09;
const SHAFT_BOT_HALF = 0.04;
const SHAFT_HEIGHT = 0.32;
const SHAFT_DEPTH = 0.05;

const shaftShape = new THREE.Shape();
shaftShape.moveTo(-SHAFT_TOP_HALF, SHAFT_HEIGHT / 2);
shaftShape.lineTo(SHAFT_TOP_HALF, SHAFT_HEIGHT / 2);
shaftShape.lineTo(SHAFT_BOT_HALF, -SHAFT_HEIGHT / 2);
shaftShape.lineTo(-SHAFT_BOT_HALF, -SHAFT_HEIGHT / 2);
shaftShape.closePath();

const shaftGeometry = new THREE.ExtrudeGeometry(shaftShape, {
  depth: SHAFT_DEPTH,
  bevelEnabled: false,
});
// Center the extruded depth on z=0
shaftGeometry.translate(0, 0, -SHAFT_DEPTH / 2);

// Bounce offset applied on top of the position prop
const bounceOffset = ref(0);

const { onRender } = useLoop();

onRender(({ elapsed }) => {
  if (bounce !== true) {
    bounceOffset.value = 0;
    return;
  }
  // Smooth sine wave: ranges 0 → bounceHeight
  bounceOffset.value = ((Math.sin(elapsed * bounceSpeed) + 1) / 2) * bounceHeight;
});
</script>

<template>
  <TresGroup :position="[position[0], position[1] + bounceOffset, position[2]]">
    <!-- Shaft of the "!" — trapezoid wider at top -->
    <TresMesh :position="[0, 0, 0]">
      <primitive :object="shaftGeometry" />
      <TresMeshLambertMaterial color="#ffd700" :emissive="'#ffd700'" :emissive-intensity="0.5" />
    </TresMesh>
    <!-- Dot of the "!" -->
    <TresMesh :position="[0, -0.32, 0]">
      <TresBoxGeometry :args="[0.12, 0.1, 0.05]" />
      <TresMeshLambertMaterial color="#ffd700" :emissive="'#ffd700'" :emissive-intensity="0.5" />
    </TresMesh>
  </TresGroup>
</template>
