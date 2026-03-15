export type EntityKind = "player" | "npc" | "prop"
export type ColliderType = "solid" | "none"

export interface EntityPosition {
  x: number
  y: number
  z: number
}

export interface SceneEntity {
  id: string
  name: string
  kind: EntityKind
  collider: ColliderType
  /** AABB half-extents (X, Z) for box collision. Falls back to circle when absent. */
  colliderSize?: { hw: number; hd: number }
  /** Only entities with interactive: true set nearbyEntity and show HUD actions. */
  interactive?: true
  /** Marks entities that never move. register() calls markRaw() on them to skip Vue's deep proxy. */
  isStatic?: true
  position: EntityPosition
  /** Called when the player interacts with this entity. */
  onInteract?: () => void
  /** Reactive label shown in the HUD action button. */
  actionLabel?: () => string
}
