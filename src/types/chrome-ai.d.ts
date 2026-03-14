/**
 * Type definitions for Chrome's built-in AI Prompt API (Gemini Nano)
 * https://developer.chrome.com/docs/ai/prompt-api
 */

interface AILanguageModelCreateOptions {
  systemPrompt?: string
  temperature?: number
  topK?: number
  monitor?: (monitor: EventTarget) => void
}

interface AILanguageModelPromptOptions {
  signal?: AbortSignal
}

interface AILanguageModelSession {
  prompt(input: string, options?: AILanguageModelPromptOptions): Promise<string>
  promptStreaming(
    input: string,
    options?: AILanguageModelPromptOptions,
  ): ReadableStream<string>
  destroy(): void
  clone(): Promise<AILanguageModelSession>
}

interface AILanguageModelCapabilities {
  available: 'readily' | 'after-download' | 'no'
  defaultTemperature?: number
  defaultTopK?: number
  maxTopK?: number
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

/**
 * New Chrome built-in AI LanguageModel API (Chrome 138+)
 * https://developer.chrome.com/docs/ai/prompt-api
 */
type LanguageModelAvailability = 'available' | 'downloading' | 'downloadable' | 'unavailable'

interface LanguageModelAvailabilityOptions {
  languages?: string[]
}

declare class LanguageModel {
  static availability(options?: LanguageModelAvailabilityOptions): Promise<LanguageModelAvailability>
  static create(options?: AILanguageModelCreateOptions): Promise<AILanguageModelSession>
}
