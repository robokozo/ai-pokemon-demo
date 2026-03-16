import { onMounted, onUnmounted } from "vue"
import { addEntity, removeEntity, addComponent } from "bitecs"
import type { EntityId } from "bitecs"
import { useEcsStore, type EntityMetadata } from "./useEcsStore"
import { usePhysicsStore } from "../physics/usePhysicsStore"
import type { EntityKind } from "./world"

const PLAYER_HALF_EXTENT = 0.3
// Sensor is slightly larger than the collider so the player can trigger it
// from just outside the solid collider.
const INTERACTION_SENSOR_PADDING = 1.5
// Half-height for all cuboid colliders in the Y axis (top-down game, thin slabs).
const COLLIDER_HALF_HEIGHT = 0.5

interface EcsEntityConfig {
  /** Ignored — bitECS assigns its own entity IDs. Kept for API compatibility. */
  id?: string
  name?: string
  kind: EntityKind
  collider: "solid" | "none"
  colliderSize?: { hw: number; hd: number }
  interactive?: true
  isStatic?: true
  position: [number, number, number]
  onInteract?: () => void
  actionLabel?: () => string
}

export function useEcsEntity({
  name: nameProp,
  kind,
  collider,
  colliderSize,
  interactive,
  isStatic,
  position,
  onInteract,
  actionLabel,
}: EcsEntityConfig): { eid: EntityId } {
  const ecsStore = useEcsStore()
  const physicsStore = usePhysicsStore()
  const w = ecsStore.world

  const eid = addEntity(w)

  // ── Position component ─────────────────────────────────────────────────────
  const { Position } = w.components
  addComponent(w, eid, Position)
  Position.x[eid] = position[0]
  Position.y[eid] = position[1]
  Position.z[eid] = position[2]

  // ── Tag components ─────────────────────────────────────────────────────────
  if (kind === "player") {
    addComponent(w, eid, w.components.PlayerTag)
  } else if (kind === "npc") {
    addComponent(w, eid, w.components.NpcTag)
  }

  if (isStatic === true) {
    addComponent(w, eid, w.components.StaticTag)
  }

  if (interactive === true) {
    addComponent(w, eid, w.components.InteractiveTag)
  }

  // ── Velocity (player only) ─────────────────────────────────────────────────
  if (kind === "player") {
    const { Velocity } = w.components
    addComponent(w, eid, Velocity)
    Velocity.x[eid] = 0
    Velocity.z[eid] = 0
  }

  // ── Box collider component ─────────────────────────────────────────────────
  if (collider === "solid" && colliderSize !== undefined) {
    const { BoxCollider } = w.components
    addComponent(w, eid, BoxCollider)
    BoxCollider.hw[eid] = colliderSize.hw
    BoxCollider.hd[eid] = colliderSize.hd
  }

  // ── Rapier rigid body + collider ───────────────────────────────────────────
  if (collider === "solid" && physicsStore.world !== null && physicsStore.rapier !== null) {
    const RAPIER = physicsStore.rapier
    const physWorld = physicsStore.world

    const hw = kind === "player" ? PLAYER_HALF_EXTENT : (colliderSize?.hw ?? 0.5)
    const hd = kind === "player" ? PLAYER_HALF_EXTENT : (colliderSize?.hd ?? 0.5)

    // Player uses kinematic body; everything else is fixed (static).
    const bodyDesc =
      kind === "player"
        ? RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(position[0], position[1], position[2])
        : RAPIER.RigidBodyDesc.fixed().setTranslation(position[0], position[1], position[2])

    const body = physWorld.createRigidBody(bodyDesc)
    physicsStore.addBody({ eid, body })

    const { RigidBodyRef } = w.components
    addComponent(w, eid, RigidBodyRef)
    RigidBodyRef.index[eid] = eid // we use eid as the key into the side-table

    // Cuboid collider (hw, half-height, hd).
    const colliderDesc = RAPIER.ColliderDesc.cuboid(hw, COLLIDER_HALF_HEIGHT, hd)
    const col = physWorld.createCollider(colliderDesc, body)
    physicsStore.addCollider({ eid, collider: col })

    const { ColliderRef } = w.components
    addComponent(w, eid, ColliderRef)
    ColliderRef.index[eid] = eid

    // Player gets a character controller so movement slides against solid walls/furniture.
    if (kind === "player") {
      const controller = physWorld.createCharacterController(0.01)
      physicsStore.setCharacterController({ controller })
    }

    // ── Sensor for interaction zone ────────────────────────────────────────
    if (interactive === true) {
      const sensorHw = hw + INTERACTION_SENSOR_PADDING
      const sensorHd = hd + INTERACTION_SENSOR_PADDING
      const sensorDesc = RAPIER.ColliderDesc.cuboid(sensorHw, COLLIDER_HALF_HEIGHT, sensorHd)
        .setSensor(true)
        .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
      const sensor = physWorld.createCollider(sensorDesc, body)
      physicsStore.addSensor({ eid, sensor })

      const { SensorRef } = w.components
      addComponent(w, eid, SensorRef)
      SensorRef.index[eid] = eid
    }
  }

  // ── Non-solid interactive entities still need a sensor ─────────────────────
  if (collider === "none" && interactive === true && physicsStore.world !== null && physicsStore.rapier !== null) {
    const RAPIER = physicsStore.rapier
    const physWorld = physicsStore.world

    // Create a fixed body just for the sensor.
    const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(position[0], position[1], position[2])
    const body = physWorld.createRigidBody(bodyDesc)
    physicsStore.addBody({ eid, body })

    const { RigidBodyRef } = w.components
    addComponent(w, eid, RigidBodyRef)
    RigidBodyRef.index[eid] = eid

    const sensorHw = (colliderSize?.hw ?? 0.5) + INTERACTION_SENSOR_PADDING
    const sensorHd = (colliderSize?.hd ?? 0.5) + INTERACTION_SENSOR_PADDING
    const sensorDesc = RAPIER.ColliderDesc.cuboid(sensorHw, COLLIDER_HALF_HEIGHT, sensorHd)
      .setSensor(true)
      .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
    const sensor = physWorld.createCollider(sensorDesc, body)
    physicsStore.addSensor({ eid, sensor })

    const { SensorRef } = w.components
    addComponent(w, eid, SensorRef)
    SensorRef.index[eid] = eid
  }

  // ── Metadata side-table ────────────────────────────────────────────────────
  const entityName = nameProp ?? `entity-${eid}`
  const meta: EntityMetadata = {
    name: entityName,
    kind,
    onInteract: onInteract ?? null,
    actionLabel: actionLabel ?? null,
  }
  ecsStore.setMetadata({ eid, data: meta })

  // ── Lifecycle: register on mount, cleanup on unmount ───────────────────────
  onMounted(() => {
    // Entity is already created above; mount hook reserved for future use.
  })

  onUnmounted(() => {
    physicsStore.removeSensor({ eid })
    physicsStore.removeCollider({ eid })
    physicsStore.removeBody({ eid })
    ecsStore.removeMetadata({ eid })
    removeEntity(w, eid)
  })

  return { eid }
}
