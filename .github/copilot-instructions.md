# Coding Preferences

## Boolean Checks and Naming

- No truthy/falsy checks. All checks must be explicit: `if (value !== null)`, `if (isActive === true)`, `if (items.length > 0)`.
- Boolean variable names must be prefixed with `is` or `has` (e.g., `isLoading`, `hasError`).

## Interfaces vs Types

- Prefer `interface` for object shapes (data models, props, state).
- Use `type` only for unions, primitives, or utility types where `interface` cannot be used.

## Compiler-Only TypeScript (No Runtime Transforms)

- Prohibited: enums, namespaces, decorators, constructor parameter properties.
- TypeScript must be treated as type-strippable syntax only — compatible with `--experimental-strip-types`.

## Null vs Undefined

- Prefer `null` over `undefined` for optional or missing values.

## Async Patterns

- Prefer `async`/`await` for all async code. Avoid `.then`/`.catch` chaining.

## Error Handling

- Only catch errors when there is a way to gracefully resolve the problem. Let unhandled errors propagate.
- User-facing messages must be friendly and non-technical.
- Developer-facing errors should include context and a `code` or `type` property where possible.

## File Naming and Organization

- Vue SFCs: PascalCase (`UserCard.vue`).
- General files: camelCase (`useFetch.ts`).
- Organize by feature folders for scalability.

## Preferred Libraries

- Validation: zod
- Utilities: es-toolkit
- Build/tooling: Vite ecosystem (rolldown, oxfmt, oxlint)
- Dates: date-fns
- Testing: Vitest
- State: Pinia
- Styling: Tailwind CSS

## VueUse

- Prefer VueUse (`@vueuse/core`) utilities over manual equivalents — they self-clean on unmount.
- Use `useTimeoutFn` instead of `setTimeout` / `clearTimeout` + `onUnmounted`.
- Use `useIntervalFn` instead of `setInterval` / `clearInterval` + `onUnmounted`.

## Imports

- Prefer absolute imports. Group: external → internal → styles.
- All imports must be explicit at the top of the file — no auto-imports.
- No default exports. Always use named exports.

## Comparisons

- Always use `===`. `==` only when checking `null`/`undefined` without needing to distinguish them.
- Use optional chaining and nullish coalescing only when TypeScript guidance warrants it; avoid overuse.

## Destructuring and Module Pattern

- Prefer destructuring for function parameters and variables.
- Prefer the revealing module pattern over classes for stateful code.

## Function Style

- Use the `function` keyword for declarations (hoisting, readability).
- Use arrow functions only for inline callbacks.
- Functions should take a single object parameter:
  ```ts
  // Preferred
  function createUser({ name, age }: { name: string; age: number }) {}
  // Not preferred
  function createUser(name: string, age: number) {}
  ```

## Function References in Callbacks

- Never pass bare function references into callbacks. Use inline arrow functions:
  ```ts
  // Preferred
  array.map((x) => doStuff(x))
  // Not preferred
  array.map(doStuff)
  ```

## Vue API

- Composition API only.
- Use type-only generics for `defineProps` and `defineModel`:
  ```ts
  defineProps<{ id: string }>()
  ```
- SFC section order: `<script>` → `<template>` → `<style>`.
- Avoid boolean props. Prefer a string union `state` prop instead — it's more expressive and extensible:
  ```ts
  // Preferred
  defineProps<{ state: "idle" | "active" | "disabled" }>()
  // Not preferred
  defineProps<{ isActive: boolean; isDisabled: boolean }>()
  ```
  This lets future states (e.g. `'malfunctioning'`, `'paused'`) be added without new props, and can often replace multiple booleans with a single value.
- Prefer props/emits for all component communication. Avoid `defineExpose` + template refs to call component methods — if the parent needs to trigger behaviour, lift the state up to the parent and pass it down as a prop; the child reacts via `watch`. Reserve template refs for cases that genuinely require imperative access (e.g. DOM focus, canvas APIs).

## Type Safety

- `any` is strictly prohibited.
- `as` casting is discouraged — prefer type guards and inference.
- `as const` is encouraged for literal types and immutability.
- `satisfies` is encouraged to validate object shapes without changing inferred type.

## Array Types

- Always use `Array<T>`, never `T[]`.

## Magic Numbers/Strings

- Define as named constants.

## Immutability

- Prefer immutability in shared/global state. Local mutation is acceptable.

## Regular Expressions

- Always include a comment with example matching strings above the regex.

## Comments

- Code should be self-documenting. Comments explain _why_, not _what_.
- Brief _what_ comments are acceptable for complex or logic-heavy code.

## Commits

- Must follow Conventional Commits: `<type>(<scope>): <subject>`.
- Standard types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

## Dependency Injection

- Prefer DI via factory functions and object parameters over classes.

## Environment Variables

- Never hardcode secrets. Use environment variable management tooling.
