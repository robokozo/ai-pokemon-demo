import { shallowReactive, onMounted, onUnmounted } from "vue"
import type { ColliderType, EntityKind, EntityPosition, SceneEntity } from "./entities/entity"
import { useEntityStore } from "./entities/useEntityStore"

// Intentionally monotonic across the app lifecycle to guarantee unique IDs across scene transitions.
let entityCount = 0

interface EntityConfig {
  id?: string
  name?: string
  kind: EntityKind
  collider: ColliderType
  colliderSize?: { hw: number; hd: number }
  interactive?: true
  isStatic?: true
  position: [number, number, number]
  onInteract?: () => void
  actionLabel?: () => string
}

export function useEntity({
  id: idProp,
  name: nameProp,
  kind,
  collider,
  colliderSize,
  interactive,
  isStatic,
  position,
  onInteract,
  actionLabel,
}: EntityConfig): SceneEntity {
  const id = idProp ?? `entity-${++entityCount}`
  const name = nameProp ?? id ?? `Entity ${entityCount}`
  const entityStore = useEntityStore()

  const entityPosition: EntityPosition =
    isStatic === true ? { x: position[0], y: position[1], z: position[2] } : shallowReactive({ x: position[0], y: position[1], z: position[2] })

  const entity: SceneEntity = {
    id,
    name,
    kind,
    collider,
    colliderSize,
    interactive,
    isStatic,
    position: entityPosition,
    onInteract,
    actionLabel,
  }

  onMounted(() => {
    entityStore.register(entity)
  })

  onUnmounted(() => {
    entityStore.unregister({ id })
  })

  return entity
}
