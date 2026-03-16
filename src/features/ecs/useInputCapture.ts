import { reactive } from "vue"
import * as THREE from "three"
import { useEventListener } from "@vueuse/core"
import { query } from "bitecs"
import { useEcsStore } from "./useEcsStore"
import { usePhysicsStore } from "../physics/usePhysicsStore"
import { useGameState } from "../game/useGameState"
import { useSceneNavigation } from "../scenes/useSceneNavigation"

/**
 * Captures keyboard state and pointer (tap-to-move) input.
 * Returns the keys record for consumption by movementSystem.
 */
export function useInputCapture(): { keys: Record<string, boolean> } {
  const ecsStore = useEcsStore()
  const physicsStore = usePhysicsStore()
  const gameState = useGameState()
  const sceneNav = useSceneNavigation()

  const keys = reactive<Record<string, boolean>>({})

  useEventListener(window, "keydown", ({ key }: KeyboardEvent) => {
    keys[key] = true
  })

  useEventListener(window, "keyup", ({ key }: KeyboardEvent) => {
    keys[key] = false
  })

  useEventListener(window, "pointerdown", (event: PointerEvent) => {
    if (gameState.paused === true) return
    if (!(event.target instanceof HTMLCanvasElement)) return
    const cam = sceneNav.camera
    if (cam === null) return

    const pp = ecsStore.playerPosition

    const canvas = event.target as HTMLCanvasElement
    const rect = canvas.getBoundingClientRect()
    const ndcX = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const ndcY = -((event.clientY - rect.top) / rect.height) * 2 + 1

    const rayCam = new THREE.PerspectiveCamera(cam.fov, rect.width / rect.height, cam.near, cam.far)
    rayCam.position.set(pp.x + cam.offset.x, cam.offset.y, pp.z + cam.offset.z)
    rayCam.lookAt(pp.x, 0, pp.z)
    rayCam.updateMatrixWorld()

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), rayCam)

    const worldPoint = new THREE.Vector3()
    const hit = raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), worldPoint)

    if (hit !== null) {
      // Use Rapier ray cast to find furthest walkable point if available.
      const resolved = resolveDestinationWithRapier({ fromX: pp.x, fromZ: pp.z, toX: worldPoint.x, toZ: worldPoint.z })
      gameState.setTapDestination({ x: resolved.x, y: 0, z: resolved.z })
    }
  })

  function resolveDestinationWithRapier({ fromX, fromZ, toX, toZ }: { fromX: number; fromZ: number; toX: number; toZ: number }): {
    x: number
    z: number
  } {
    const rapier = physicsStore.rapier
    const physWorld = physicsStore.world
    if (rapier === null || physWorld === null) {
      return { x: toX, z: toZ }
    }

    const dx = toX - fromX
    const dz = toZ - fromZ
    const dist = Math.sqrt(dx * dx + dz * dz)
    if (dist === 0) return { x: fromX, z: fromZ }

    const dirX = dx / dist
    const dirZ = dz / dist

    // Exclude the player's own rigid body so the ray doesn't hit the player collider.
    const w = ecsStore.world
    const players = query(w, [w.components.PlayerTag])
    const playerBody = players.length > 0 ? physicsStore.getBody({ eid: players[0] }) : null

    // Exclude sensors so interaction zones don't block the destination ray.
    // QueryFilterFlags.EXCLUDE_SENSORS = 8
    const EXCLUDE_SENSORS = 8

    // Cast a ray from source toward destination to find first solid hit.
    const ray = new rapier.Ray({ x: fromX, y: 0.25, z: fromZ }, { x: dirX, y: 0, z: dirZ })
    const hit = physWorld.castRay(ray, dist, true, EXCLUDE_SENSORS, undefined, undefined, playerBody ?? undefined)

    if (hit !== null) {
      // Stop slightly before the hit point.
      const safeDist = Math.max(0, hit.timeOfImpact - 0.35)
      return {
        x: fromX + dirX * safeDist,
        z: fromZ + dirZ * safeDist,
      }
    }

    return { x: toX, z: toZ }
  }

  return { keys }
}
