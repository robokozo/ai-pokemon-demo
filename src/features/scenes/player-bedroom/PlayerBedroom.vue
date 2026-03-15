<script setup lang="ts">
import RoomGeometry from "./RoomGeometry.vue"
import Bed from "../../furniture/Bed.vue"
import Bookshelf from "../../furniture/Bookshelf.vue"
import Table from "../../furniture/Table.vue"
import Rug from "../../furniture/Rug.vue"
import Window from "../../furniture/Window.vue"
</script>

<template>
  <TresGroup>
    <!-- Lighting -->
    <TresAmbientLight :intensity="0.6" color="#fff8e8" />
    <TresDirectionalLight :position="[2, 6, 3]" :intensity="1.2" color="#fff8e8" :cast-shadow="true" />
    <TresPointLight :position="[-2, 3, 2]" color="#ffd4a0" :intensity="0.8" :distance="8" />

    <!-- Floor + walls -->
    <RoomGeometry />

    <!-- Furniture -->
    <Bed :position="[3.5, 0, -2.8]" />
    <Bookshelf :position="[-3.8, 0, -2.5]" />
    <Table :position="[-3.5, 0, 1.5]" />
    <Rug :position="[0, 0, 0.5]" />
    <Window :position="[1.5, 0, -3.6]" />

    <!-- Interactive objects + NPCs passed in from GameScene -->
    <slot />
  </TresGroup>
</template>
