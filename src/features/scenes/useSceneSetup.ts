import { computed } from "vue"
import { useSceneNavigation } from "./useSceneNavigation"
import type { SceneCamera } from "./useSceneNavigation"
import { useEcsStore } from "../ecs/useEcsStore"
import { useGameState } from "../game/useGameState"

export interface Tile {
  x: number
  z: number
  color: string
}

export interface SceneConfig {
  roomWidth: number
  roomHeight: number
  floorColors: { light: string; dark: string } | { solid: string }
  camera: SceneCamera
  entryPoints: Record<string, [number, number, number]>
}

export function useSceneSetup({ roomWidth, roomHeight, floorColors, camera, entryPoints }: SceneConfig) {
  const sceneNav = useSceneNavigation()
  const ecsStore = useEcsStore()
  const gameState = useGameState()

  // ── Floor tiles ──────────────────────────────────────────────────────────────
  const isSolidFloor = "solid" in floorColors
  const floorTiles: Array<Tile> = []
  if (isSolidFloor !== true) {
    const { light, dark } = floorColors as { light: string; dark: string }
    for (let x = 0; x < roomWidth; x++) {
      for (let z = 0; z < roomHeight; z++) {
        const isLight = (x + z) % 2 === 0
        floorTiles.push({
          x: x - roomWidth / 2 + 0.5,
          z: z - roomHeight / 2 + 0.5,
          color: isLight === true ? light : dark,
        })
      }
    }
  }

  // ── Camera ───────────────────────────────────────────────────────────────────
  sceneNav.setCamera(camera)

  const cameraPosition = computed<[number, number, number]>(() => {
    const pp = ecsStore.playerPosition
    return [pp.x + camera.offset.x, camera.offset.y, pp.z + camera.offset.z]
  })

  const cameraLookAt = computed<[number, number, number]>(() => {
    const pp = ecsStore.playerPosition
    return [pp.x, 0, pp.z]
  })

  // ── Spawn ────────────────────────────────────────────────────────────────────
  const spawnPosition = computed<[number, number, number]>(() => entryPoints[sceneNav.activeEntrypoint] ?? entryPoints["default"])

  const solidFloorColor = isSolidFloor === true ? (floorColors as { solid: string }).solid : null

  return {
    floorTiles,
    solidFloorColor,
    roomWidth,
    roomHeight,
    cameraPosition,
    cameraLookAt,
    spawnPosition,
    gameState,
  }
}
