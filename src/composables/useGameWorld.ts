import { reactive } from 'vue'
import * as THREE from 'three'

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
  npcs: Character[]
  nearbyNPC: Character | null
  interactionDistance: number
}

export function useGameWorld() {
  const gameState = reactive<GameState>({
    player: {
      id: 'player',
      name: 'Player',
      position: new THREE.Vector3(0, 0.25, 1),
      color: 0x4a90d9,
      isNPC: false,
    },
    npcs: [
      {
        id: 'mom',
        name: 'Mom',
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

  function onKeyDown(e: KeyboardEvent) {
    keys[e.key] = true
  }

  function onKeyUp(e: KeyboardEvent) {
    keys[e.key] = false
  }

  function updatePlayer() {
    const pos = gameState.player.position
    let dx = 0
    let dz = 0

    if (keys['ArrowUp'] || keys['w'] || keys['W']) dz -= moveSpeed
    if (keys['ArrowDown'] || keys['s'] || keys['S']) dz += moveSpeed
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx -= moveSpeed
    if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += moveSpeed

    const halfW = ROOM_WIDTH / 2 - 0.6
    const halfH = ROOM_HEIGHT / 2 - 0.6

    const newX = Math.max(-halfW, Math.min(halfW, pos.x + dx))
    const newZ = Math.max(-halfH, Math.min(halfH, pos.z + dz))

    // Simple NPC collision avoidance
    let blocked = false
    for (const npc of gameState.npcs) {
      const dist = Math.sqrt((newX - npc.position.x) ** 2 + (newZ - npc.position.z) ** 2)
      if (dist < 0.7) {
        blocked = true
        break
      }
    }

    if (!blocked) {
      pos.x = newX
      pos.z = newZ
    }

    // Check for nearby NPCs
    gameState.nearbyNPC = null
    for (const npc of gameState.npcs) {
      const dist = Math.sqrt(
        (pos.x - npc.position.x) ** 2 + (pos.z - npc.position.z) ** 2,
      )
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
  }
}
