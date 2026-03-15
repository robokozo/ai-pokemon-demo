<script setup lang="ts">
import { ref } from "vue"
import { useEventListener } from "@vueuse/core"
import { useSceneStore } from "../features/useSceneStore"
import PlayerBedroom from "../features/scenes/player-house/PlayerBedroom.vue"
import FirstFloor from "../features/scenes/player-house/FirstFloor.vue"
import DialogBox from "../features/ui/DialogBox.vue"

const store = useSceneStore()

const isControlsOpen = ref(false)

useEventListener(window, "keydown", (e: KeyboardEvent) => {
  if (e.key === "Escape" && store.dialogEntity !== null) {
    store.closeDialog()
  }
})
</script>

<template>
  <div class="game-container">
    <PlayerBedroom v-if="store.currentScene === 'bedroom'" />
    <FirstFloor v-else-if="store.currentScene === 'first-floor'" />

    <!-- ── HUD overlay ── -->
    <div class="hud">
      <!-- Controls — collapsible, collapsed by default -->
      <div class="hud-panel">
        <button
          class="hud-panel-toggle"
          :aria-expanded="isControlsOpen"
          aria-controls="hud-controls-body"
          @pointerdown.stop.prevent="isControlsOpen = !isControlsOpen"
        >
          <span class="panel-title">Controls</span>
          <span class="panel-chevron">{{ isControlsOpen === true ? "▲" : "▼" }}</span>
        </button>
        <div v-if="isControlsOpen === true" id="hud-controls-body" class="hud-panel-body">
          <div class="control-row"><kbd>W A S D</kbd> <span>Move</span></div>
          <div class="control-row"><kbd>Arrow Keys</kbd> <span>Move</span></div>
          <div class="control-row control-row--touch"><span class="touch-icon">👆</span> <span>Tap to move</span></div>
        </div>
      </div>

      <!-- Actions — shown when near an interactable and no dialog is open -->
      <div v-if="store.dialogEntity === null && store.nearbyEntity !== null" class="hud-panel">
        <div class="hud-panel-header">
          <span class="panel-title">Actions</span>
        </div>
        <div class="hud-panel-body">
          <button class="hud-action" :aria-label="store.nearbyEntity.actionLabel?.()" @pointerdown.stop.prevent="store.nearbyEntity?.onInteract?.()">
            <span>{{ store.nearbyEntity.kind === "npc" ? "💬" : "⚡" }}</span>
            <span>{{ store.nearbyEntity.actionLabel?.() }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ── Dialog Box ── -->
    <DialogBox
      v-if="store.dialogEntity?.kind === 'npc'"
      :npc-name="store.dialogEntity.name"
      :npc-description="store.dialogDescription ?? ''"
      :visible="true"
      @close="store.closeDialog()"
    />
  </div>
</template>

<style scoped>
.game-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #1a1a2e;
}

/* HUD */
.hud {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
  z-index: 10;
}

.hud-panel {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(74, 144, 217, 0.3);
  border-radius: 8px;
  backdrop-filter: blur(4px);
  min-width: 160px;
  overflow: hidden;
}

.hud-panel-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.45rem 0.8rem;
  background: none;
  border: none;
  cursor: pointer;
  pointer-events: auto;
  touch-action: manipulation;
  user-select: none;
  font-family: inherit;
}

.hud-panel-header {
  display: flex;
  align-items: center;
  padding: 0.45rem 0.8rem 0.2rem;
}

.panel-title {
  font-family: "Press Start 2P", "Courier New", monospace;
  font-size: 0.55rem;
  color: #4a90d9;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.panel-chevron {
  font-size: 0.5rem;
  color: rgba(74, 144, 217, 0.7);
}

.hud-panel-body {
  padding: 0 0.8rem 0.6rem;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.3rem;
}

.control-row span {
  color: rgba(255, 255, 255, 0.8);
}

kbd {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 3px;
  padding: 1px 5px;
  font-family: monospace;
  font-size: 0.65rem;
  color: #e0e8ff;
  white-space: nowrap;
}

.hud-action {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  width: 100%;
  margin-top: 0.3rem;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.4);
  border-radius: 6px;
  padding: 0.4rem 0.5rem;
  font-size: 0.7rem;
  color: #ffd700;
  cursor: pointer;
  pointer-events: auto;
  touch-action: manipulation;
  user-select: none;
  -webkit-touch-callout: none;
  min-height: 36px;
  font-family: inherit;
  animation: promptPulse 1.5s ease-in-out infinite;
}

.hud-action:hover {
  background: rgba(255, 215, 0, 0.22);
}

@keyframes promptPulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

/* Tap-to-move row in controls panel */
.control-row--touch .touch-icon {
  font-size: 0.9rem;
}
</style>
