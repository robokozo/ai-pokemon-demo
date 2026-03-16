import { defineStore } from "pinia"
import { ref, shallowRef } from "vue"
import type RAPIER from "@dimforge/rapier3d-compat"

export const usePhysicsStore = defineStore("physics", () => {
  const isReady = ref(false)
  const rapier = shallowRef<typeof RAPIER | null>(null)
  const world = shallowRef<RAPIER.World | null>(null)

  // Side-tables mapping bitECS entity ids to Rapier handles.
  // Rapier bodies/colliders are accessed via handles stored here.
  const bodies = new Map<number, RAPIER.RigidBody>()
  const colliders = new Map<number, RAPIER.Collider>()
  const sensors = new Map<number, RAPIER.Collider>()

  // Reverse lookup: collider handle → bitECS entity id.
  const colliderToEid = new Map<number, number>()

  function createSceneWorld() {
    if (rapier.value === null) {
      throw new Error("Rapier not initialized — call initPhysics() first")
    }
    // Zero gravity for top-down game.
    const gravity = { x: 0, y: 0, z: 0 }
    world.value = new rapier.value.World(gravity)
  }

  function destroySceneWorld() {
    bodies.clear()
    colliders.clear()
    sensors.clear()
    colliderToEid.clear()
    if (world.value !== null) {
      world.value.free()
      world.value = null
    }
  }

  function addBody({ eid, body }: { eid: number; body: RAPIER.RigidBody }) {
    bodies.set(eid, body)
  }

  function addCollider({ eid, collider }: { eid: number; collider: RAPIER.Collider }) {
    colliders.set(eid, collider)
    colliderToEid.set(collider.handle, eid)
  }

  function addSensor({ eid, sensor }: { eid: number; sensor: RAPIER.Collider }) {
    sensors.set(eid, sensor)
    colliderToEid.set(sensor.handle, eid)
  }

  function removeBody({ eid }: { eid: number }) {
    const body = bodies.get(eid)
    if (body !== undefined && world.value !== null) {
      world.value.removeRigidBody(body)
    }
    bodies.delete(eid)
  }

  function removeCollider({ eid }: { eid: number }) {
    const col = colliders.get(eid)
    if (col !== undefined && world.value !== null) {
      colliderToEid.delete(col.handle)
      world.value.removeCollider(col, false)
    }
    colliders.delete(eid)
  }

  function removeSensor({ eid }: { eid: number }) {
    const sen = sensors.get(eid)
    if (sen !== undefined && world.value !== null) {
      colliderToEid.delete(sen.handle)
      world.value.removeCollider(sen, false)
    }
    sensors.delete(eid)
  }

  function getBody({ eid }: { eid: number }): RAPIER.RigidBody | null {
    return bodies.get(eid) ?? null
  }

  function getCollider({ eid }: { eid: number }): RAPIER.Collider | null {
    return colliders.get(eid) ?? null
  }

  function getSensor({ eid }: { eid: number }): RAPIER.Collider | null {
    return sensors.get(eid) ?? null
  }

  function getEidFromCollider({ handle }: { handle: number }): number | null {
    return colliderToEid.get(handle) ?? null
  }

  return {
    isReady,
    rapier,
    world,
    bodies,
    colliders,
    sensors,
    colliderToEid,
    createSceneWorld,
    destroySceneWorld,
    addBody,
    addCollider,
    addSensor,
    removeBody,
    removeCollider,
    removeSensor,
    getBody,
    getCollider,
    getSensor,
    getEidFromCollider,
  }
})
