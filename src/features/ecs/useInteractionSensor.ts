import { onUnmounted } from "vue"
import { addComponent } from "bitecs"
import type { EntityId } from "bitecs"
import type RAPIER from "@dimforge/rapier3d-compat"
import { useEcsStore } from "./useEcsStore"
import { usePhysicsStore } from "../physics/usePhysicsStore"

// Sensor extends slightly beyond the solid collider so the player can trigger it from just outside.
const INTERACTION_SENSOR_PADDING = 1.5
// Half-height for all cuboid colliders in the Y axis (top-down game, thin slabs).
const COLLIDER_HALF_HEIGHT = 0.5

interface InteractionSensorConfig {
  eid: EntityId
  hw: number
  hd: number
  /**
   * Rapier body to attach the sensor to. When provided the sensor shares the entity's
   * existing body (solid-collider entities). When omitted a dedicated fixed body is
   * created for the sensor zone (sensor-only entities such as TV).
   */
  body?: RAPIER.RigidBody
}

/**
 * Attaches an interaction sensor zone to an existing entity.
 * Also adds InteractiveTag so the interaction system can detect player proximity.
 */
export function useInteractionSensor({ eid, hw, hd, body: existingBody }: InteractionSensorConfig): void {
  const ecsStore = useEcsStore()
  const physicsStore = usePhysicsStore()

  if (physicsStore.world === null || physicsStore.rapier === null) {
    throw new Error(`[useInteractionSensor] Physics world not initialized for entity ${eid}.`)
  }

  const RAPIER = physicsStore.rapier
  const physWorld = physicsStore.world
  const w = ecsStore.world

  const { InteractiveTag, SensorRef, RigidBodyRef, Position } = w.components

  addComponent(w, eid, InteractiveTag)

  let body = existingBody
  if (body === undefined) {
    // Sensor-only entity — create a fixed body solely to host the sensor collider.
    const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(Position.x[eid], Position.y[eid], Position.z[eid])
    body = physWorld.createRigidBody(bodyDesc)
    physicsStore.addBody({ eid, body })
    addComponent(w, eid, RigidBodyRef)
    RigidBodyRef.index[eid] = eid
  }

  const sensorDesc = RAPIER.ColliderDesc.cuboid(hw + INTERACTION_SENSOR_PADDING, COLLIDER_HALF_HEIGHT, hd + INTERACTION_SENSOR_PADDING)
    .setSensor(true)
    .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
    .setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.ALL)
  const sensor = physWorld.createCollider(sensorDesc, body)
  physicsStore.addSensor({ eid, sensor })

  addComponent(w, eid, SensorRef)
  SensorRef.index[eid] = eid

  onUnmounted(() => {
    physicsStore.removeSensor({ eid })
    if (existingBody === undefined) {
      physicsStore.removeBody({ eid })
    }
  })
}
