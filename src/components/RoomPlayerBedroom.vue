<script setup lang="ts">
import GameRoomGeometry from "./GameRoomGeometry.vue";
import FurnitureBed from "./FurnitureBed.vue";
import FurnitureBookshelf from "./FurnitureBookshelf.vue";
import FurnitureTable from "./FurnitureTable.vue";
import FurnitureRug from "./FurnitureRug.vue";
import FurnitureWindow from "./FurnitureWindow.vue";
</script>

<template>
  <TresGroup>
    <!-- Lighting -->
    <TresAmbientLight :intensity="0.6" color="#fff8e8" />
    <TresDirectionalLight
      :position="[2, 6, 3]"
      :intensity="1.2"
      color="#fff8e8"
      :cast-shadow="true"
    />
    <TresPointLight :position="[-2, 3, 2]" color="#ffd4a0" :intensity="0.8" :distance="8" />

    <!-- Floor + walls -->
    <GameRoomGeometry />

    <!-- Furniture -->
    <FurnitureBed :position="[3.5, 0, -2.8]" />
    <FurnitureBookshelf :position="[-3.8, 0, -2.5]" />
    <FurnitureTable :position="[-3.5, 0, 1.5]" />
    <FurnitureRug :position="[0, 0, 0.5]" />
    <FurnitureWindow :position="[1.5, 0, -3.6]" />

    <!-- Interactive objects + NPCs passed in from GameScene -->
    <slot />
  </TresGroup>
</template>
