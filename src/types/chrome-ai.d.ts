/**
 * Type definitions for Chrome's built-in AI Prompt API (Gemini Nano)
 * Based on: https://developer.chrome.com/docs/ai/prompt-api
 * Last updated: Chrome 138+
 */

// ── Shared modality type ──────────────────────────────────────────────────────

/** A modality descriptor used in expectedInputs / expectedOutputs. */
interface LanguageModelModality {
  /** For expectedOutputs, only 'text' is supported. */
  type: 'text' | 'image' | 'audio'
  /** BCP-47 language codes. Supported: 'en', 'ja', 'es'. */
  languages?: string[]
}

// ── LanguageModel.availability() ─────────────────────────────────────────────

/** Return value of LanguageModel.availability(). */
type LanguageModelAvailability = 'available' | 'downloading' | 'downloadable' | 'unavailable'

/**
 * Options for LanguageModel.availability().
 * Pass the same options you intend to use in create() so Chrome can tell
 * whether that specific configuration is supported.
 */
interface LanguageModelAvailabilityOptions {
  expectedInputs?: LanguageModelModality[]
  expectedOutputs?: LanguageModelModality[]
}

// ── LanguageModel.create() ────────────────────────────────────────────────────

/** A single message in the initialPrompts array. */
interface LanguageModelPromptMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  /** Set to true on the last assistant message to use it as a response prefix. */
  prefix?: boolean
}

/** Options for LanguageModel.create(). */
interface LanguageModelCreateOptions {
  /** System-level instruction for the model. */
  systemPrompt?: string
  /** Seed conversation to give the model context. */
  initialPrompts?: LanguageModelPromptMessage[]
  /** Sampling temperature (Chrome Extensions only). */
  temperature?: number
  /** Top-K value (Chrome Extensions only). */
  topK?: number
  /** AbortSignal to cancel session creation. */
  signal?: AbortSignal
  /**
   * Callback to track model download progress.
   * Listen for the 'downloadprogress' event (a ProgressEvent) on the monitor.
   */
  monitor?: (monitor: EventTarget) => void
  /** Declare the modalities and languages you will send as inputs. */
  expectedInputs?: LanguageModelModality[]
  /** Declare the modalities and languages you expect as output. Only 'text' is supported. */
  expectedOutputs?: LanguageModelModality[]
}

// ── Session prompt options ────────────────────────────────────────────────────

interface LanguageModelPromptOptions {
  signal?: AbortSignal
  responseConstraint?: object
  omitResponseConstraintInput?: boolean
}

// ── Session object ────────────────────────────────────────────────────────────

interface LanguageModelSession {
  /** Number of tokens used so far in this session. */
  readonly contextUsage: number
  /** Maximum token capacity of this session. */
  readonly contextWindow: number

  prompt(input: string, options?: LanguageModelPromptOptions): Promise<string>
  promptStreaming(input: string, options?: LanguageModelPromptOptions): ReadableStream<string>

  /** Pre-populate context without waiting for a response. */
  append(messages: LanguageModelPromptMessage[]): Promise<void>

  /** Estimate how many tokens a prompt (including responseConstraint) will consume. */
  measureContextUsage(input: string, options?: LanguageModelPromptOptions): Promise<number>

  /** Fork this session, preserving context and initial prompts. */
  clone(options?: { signal?: AbortSignal }): Promise<LanguageModelSession>

  /** Free resources. The session cannot be used after this. */
  destroy(): void
}

// ── LanguageModel static class ────────────────────────────────────────────────

declare class LanguageModel {
  /**
   * Check whether the model is ready for the given configuration.
   * Always pass the same options you plan to use in create().
   */
  static availability(options?: LanguageModelAvailabilityOptions): Promise<LanguageModelAvailability>

  /** Create a new session. Triggers a model download if needed. */
  static create(options?: LanguageModelCreateOptions): Promise<LanguageModelSession>

  /** Returns default and max model parameters (Chrome Extensions only). */
  static params(): Promise<{
    defaultTopK: number
    maxTopK: number
    defaultTemperature: number
    maxTemperature: number
  }>
}

// ── Legacy window.ai API (Chrome 127–137) ────────────────────────────────────

interface AILanguageModelCreateOptions {
  systemPrompt?: string
  temperature?: number
  topK?: number
  monitor?: (monitor: EventTarget) => void
}

interface AILanguageModelCapabilities {
  available: 'readily' | 'after-download' | 'no'
  defaultTemperature?: number
  defaultTopK?: number
  maxTopK?: number
}

interface AILanguageModelSession {
  prompt(input: string, options?: { signal?: AbortSignal }): Promise<string>
  promptStreaming(input: string, options?: { signal?: AbortSignal }): ReadableStream<string>
  destroy(): void
  clone(): Promise<AILanguageModelSession>
}

interface AILanguageModelFactory {
  create(options?: AILanguageModelCreateOptions): Promise<AILanguageModelSession>
  capabilities(): Promise<AILanguageModelCapabilities>
}

interface AI {
  languageModel: AILanguageModelFactory
}

interface Window {
  ai?: AI
}
