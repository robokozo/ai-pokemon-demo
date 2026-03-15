import { reactive, ref } from "vue"
import * as THREE from "three"

export const TILE_SIZE = 1
export const ROOM_WIDTH = 10
export const ROOM_HEIGHT = 8

export interface Character {
  id: string
  name: string
  position: THREE.Vector3
  color: number
  isNPC: boolean
}

export interface GameState {
  player: Character
  npcs: Array<Character>
  nearbyNPC: Character | null
  interactionDistance: number
}

export function useGameWorld() {
  const gameState = reactive<GameState>({
    player: {
      id: "player",
      name: "Player",
      position: new THREE.Vector3(0, 0.25, 1),
      color: 0x4a90d9,
      isNPC: false,
    },
    npcs: [
      {
        id: "mom",
        name: "Mom",
        position: new THREE.Vector3(-1.5, 0.25, -1.5),
        color: 0xe87ca0,
        isNPC: true,
      },
    ],
    nearbyNPC: null,
    interactionDistance: 1.8,
  })

  const keys = reactive<Record<string, boolean>>({})
  const moveSpeed = 0.05

  // Tap-to-move destination (world coordinates)
  const tapDestination = ref<THREE.Vector3 | null>(null)
  let stuckFrameCount = 0
  let lastX = 0
  let lastZ = 0
  const STUCK_LIMIT = 30 // frames (~0.5 s at 60 fps)
  const ARRIVE_THRESHOLD = 0.12

  function onKeyDown(e: KeyboardEvent) {
    keys[e.key] = true
  }

  function onKeyUp(e: KeyboardEvent) {
    keys[e.key] = false
  }

  function setTapDestination(pos: THREE.Vector3) {
    tapDestination.value = pos.clone()
    stuckFrameCount = 0
  }

  function clearTapDestination() {
    tapDestination.value = null
    stuckFrameCount = 0
  }

  function updatePlayer() {
    const pos = gameState.player.position
    let dx = 0
    let dz = 0

    const hasKeyInput =
      keys["ArrowUp"] === true ||
      keys["w"] === true ||
      keys["W"] === true ||
      keys["ArrowDown"] === true ||
      keys["s"] === true ||
      keys["S"] === true ||
      keys["ArrowLeft"] === true ||
      keys["a"] === true ||
      keys["A"] === true ||
      keys["ArrowRight"] === true ||
      keys["d"] === true ||
      keys["D"] === true

    if (hasKeyInput === true) {
      // Keyboard input cancels any active tap destination
      clearTapDestination()

      if (keys["ArrowUp"] === true || keys["w"] === true || keys["W"] === true) dz -= moveSpeed
      if (keys["ArrowDown"] === true || keys["s"] === true || keys["S"] === true) dz += moveSpeed
      if (keys["ArrowLeft"] === true || keys["a"] === true || keys["A"] === true) dx -= moveSpeed
      if (keys["ArrowRight"] === true || keys["d"] === true || keys["D"] === true) dx += moveSpeed
    } else if (tapDestination.value) {
      const dest = tapDestination.value
      const ddx = dest.x - pos.x
      const ddz = dest.z - pos.z
      const dist = Math.sqrt(ddx * ddx + ddz * ddz)

      if (dist < ARRIVE_THRESHOLD) {
        // Reached destination
        clearTapDestination()
      } else {
        dx = (ddx / dist) * moveSpeed
        dz = (ddz / dist) * moveSpeed

        // Stuck detection: if the player hasn't moved last frame, count up
        if (Math.abs(pos.x - lastX) < 0.001 && Math.abs(pos.z - lastZ) < 0.001) {
          stuckFrameCount++
          if (stuckFrameCount >= STUCK_LIMIT) {
            clearTapDestination()
          }
        } else {
          stuckFrameCount = 0
        }
      }
    }

    // Record position before movement (used for stuck detection next frame)
    lastX = pos.x
    lastZ = pos.z

    const halfW = ROOM_WIDTH / 2 - 0.6
    const halfH = ROOM_HEIGHT / 2 - 0.6

    const newX = Math.max(-halfW, Math.min(halfW, pos.x + dx))
    const newZ = Math.max(-halfH, Math.min(halfH, pos.z + dz))

    // Simple NPC collision avoidance
    let isBlocked = false
    for (const npc of gameState.npcs) {
      const dist = Math.sqrt((newX - npc.position.x) ** 2 + (newZ - npc.position.z) ** 2)
      if (dist < 0.7) {
        isBlocked = true
        break
      }
    }

    if (isBlocked !== true) {
      pos.x = newX
      pos.z = newZ
    }

    // Check for nearby NPCs
    gameState.nearbyNPC = null
    for (const npc of gameState.npcs) {
      const dist = Math.sqrt((pos.x - npc.position.x) ** 2 + (pos.z - npc.position.z) ** 2)
      if (dist <= gameState.interactionDistance) {
        gameState.nearbyNPC = npc
        break
      }
    }
  }

  return {
    gameState,
    keys,
    onKeyDown,
    onKeyUp,
    updatePlayer,
    tapDestination,
    setTapDestination,
    clearTapDestination,
  }
}
