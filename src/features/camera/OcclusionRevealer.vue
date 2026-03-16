<script setup lang="ts">
import { useLoop } from "@tresjs/core"
import * as THREE from "three"
import { useEcsStore } from "../ecs/useEcsStore"
import { useSceneNavigation } from "../scenes/useSceneNavigation"

const OCCLUDED_OPACITY = 0.25

const ecsStore = useEcsStore()
const sceneNav = useSceneNavigation()

const raycaster = new THREE.Raycaster()
const camPosition = new THREE.Vector3()
const playerTarget = new THREE.Vector3()
const direction = new THREE.Vector3()

interface SavedMaterial {
  material: THREE.Material
  opacity: number
  isTransparent: boolean
}

const occludedGroups = new Map<THREE.Object3D, Array<SavedMaterial>>()

/**
 * Walk up from a hit mesh looking for an ancestor tagged with userData.occludable.
 * Returns that ancestor, or null if none found.
 */
function findOccludableAncestor(object: THREE.Object3D): THREE.Object3D | null {
  let current: THREE.Object3D | null = object
  while (current !== null) {
    if (current.userData?.occludable === true) return current
    current = current.parent
  }
  return null
}

function setGroupOpacity(root: THREE.Object3D, opacity: number): Array<SavedMaterial> {
  const saved: Array<SavedMaterial> = []
  root.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material !== null) {
      const mat = child.material as THREE.Material
      saved.push({ material: mat, opacity: mat.opacity, isTransparent: mat.transparent })
      mat.transparent = true
      mat.opacity = opacity
      mat.needsUpdate = true
    }
  })
  return saved
}

function restoreGroup(savedMaterials: Array<SavedMaterial>) {
  for (const { material, opacity, isTransparent } of savedMaterials) {
    material.opacity = opacity
    material.transparent = isTransparent
    material.needsUpdate = true
  }
}

const { onBeforeRender } = useLoop()

onBeforeRender(({ scene }) => {
  const pp = ecsStore.playerPosition
  const cam = sceneNav.camera
  const sceneObj = scene.value
  if (cam === null || sceneObj == null) return

  camPosition.set(pp.x + cam.offset.x, cam.offset.y, pp.z + cam.offset.z)
  playerTarget.set(pp.x, 0.5, pp.z)
  direction.copy(playerTarget).sub(camPosition).normalize()
  const distanceToPlayer = camPosition.distanceTo(playerTarget)

  raycaster.set(camPosition, direction)
  raycaster.far = distanceToPlayer - 0.3

  const intersections = raycaster.intersectObjects(sceneObj.children, true)
  const currentlyOccluding = new Set<THREE.Object3D>()

  for (const hit of intersections) {
    const root = findOccludableAncestor(hit.object)
    if (root === null) continue

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
