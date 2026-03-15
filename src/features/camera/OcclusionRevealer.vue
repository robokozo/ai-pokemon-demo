<script setup lang="ts">
import { useLoop, useTres } from "@tresjs/core"
import * as THREE from "three"
import { useEntityStore } from "../entities/useEntityStore"

const OCCLUDED_OPACITY = 0.25
const ENTITY_ROOT_CHILD_LIMIT = 20

const { scene, camera } = useTres()
const entityStore = useEntityStore()

const raycaster = new THREE.Raycaster()
const playerTarget = new THREE.Vector3()
const direction = new THREE.Vector3()

interface SavedMaterial {
  material: THREE.Material
  opacity: number
  isTransparent: boolean
}

// Groups currently made transparent, keyed by their entity root object
const occludedGroups = new Map<THREE.Object3D, Array<SavedMaterial>>()

function isPlayerDescendant(object: THREE.Object3D): boolean {
  let current: THREE.Object3D | null = object
  while (current !== null) {
    if (current.userData?.isPlayer === true) return true
    current = current.parent
  }
  return false
}

/**
 * Walk up from a hit mesh to find the entity root group.
 * Heuristic: the first ancestor Group whose parent has many children
 * (i.e. the SceneShell container) or is the Scene itself.
 */
function findEntityRoot(mesh: THREE.Object3D): THREE.Object3D {
  let current: THREE.Object3D | null = mesh
  while (current?.parent !== null) {
    const parent = current.parent
    if (parent === null || parent instanceof THREE.Scene) return current
    if (parent.children.length >= ENTITY_ROOT_CHILD_LIMIT) return current
    current = parent
  }
  return mesh
}

function setGroupOpacity(root: THREE.Object3D, opacity: number): Array<SavedMaterial> {
  const saved: Array<SavedMaterial> = []
  root.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material !== null) {
      const mat = child.material as THREE.Material
      saved.push({ material: mat, opacity: mat.opacity, isTransparent: mat.transparent })
      mat.transparent = true
      mat.opacity = opacity
    }
  })
  return saved
}

function restoreGroup(savedMaterials: Array<SavedMaterial>) {
  for (const { material, opacity, isTransparent } of savedMaterials) {
    material.opacity = opacity
    material.transparent = isTransparent
  }
}

const { onBeforeRender } = useLoop()

onBeforeRender(() => {
  const player = entityStore.getPlayer()
  const cam = camera.value
  const sceneObj = scene.value
  if (player === null || cam == null || sceneObj == null) return

  playerTarget.set(player.position.x, 0.5, player.position.z)
  direction.copy(playerTarget).sub(cam.position).normalize()
  const distanceToPlayer = cam.position.distanceTo(playerTarget)

  raycaster.set(cam.position, direction)
  raycaster.far = distanceToPlayer - 0.3

  const intersections = raycaster.intersectObjects(sceneObj.children, true)
  const currentlyOccluding = new Set<THREE.Object3D>()

  for (const hit of intersections) {
    if (isPlayerDescendant(hit.object) === true) continue

    // Skip ground-level geometry (floor, path stones)
    if (hit.point.y < 0.1) continue

    const root = findEntityRoot(hit.object)
    currentlyOccluding.add(root)

    if (occludedGroups.has(root) !== true) {
      const saved = setGroupOpacity(root, OCCLUDED_OPACITY)
      occludedGroups.set(root, saved)
    }
  }

  // Restore groups no longer occluding the player
  for (const [root, savedMaterials] of occludedGroups) {
    if (currentlyOccluding.has(root) !== true) {
      restoreGroup(savedMaterials)
      occludedGroups.delete(root)
    }
  }
})
</script>

<template>
  <!-- Renderless — handles camera-to-player occlusion -->
</template>
