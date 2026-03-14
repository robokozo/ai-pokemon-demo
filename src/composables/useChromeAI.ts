import { ref, onUnmounted } from 'vue'

export interface AISession {
  prompt: (input: string) => Promise<string>
  destroy: () => void
}

const AI_UNAVAILABLE = 'unavailable'
const AI_LOADING = 'loading'
const AI_READY = 'ready'
const AI_ERROR = 'error'

export type AIStatus =
  | typeof AI_UNAVAILABLE
  | typeof AI_LOADING
  | typeof AI_READY
  | typeof AI_ERROR

export function useChromeAI(characterName: string, characterDescription: string) {
  const status = ref<AIStatus>(AI_LOADING)
  const errorMessage = ref<string>('')
  let session: AILanguageModelSession | null = null

  const systemPrompt = `You are ${characterName}. ${characterDescription}
  
Keep your responses conversational, warm, and in character. Keep responses brief (1-3 sentences).
You are an NPC in an RPG adventure game. The player is talking to you.`

  async function initialize() {
    if (!window.ai?.languageModel) {
      status.value = AI_UNAVAILABLE
      errorMessage.value =
        'Chrome AI (Gemini Nano) is not available. Please use Chrome 127+ with the Prompt API flag enabled.'
      return
    }

    try {
      status.value = AI_LOADING
      const capabilities = await window.ai.languageModel.capabilities()

      if (capabilities.available === 'no') {
        status.value = AI_UNAVAILABLE
        errorMessage.value = 'Chrome AI is not available on this device.'
        return
      }

      session = await window.ai.languageModel.create({
        systemPrompt,
        temperature: 0.8,
        topK: capabilities.defaultTopK ?? 40,
      })

      status.value = AI_READY
    } catch (err) {
      status.value = AI_ERROR
      errorMessage.value = err instanceof Error ? err.message : 'Unknown error initializing AI'
      console.error('[useChromeAI] Failed to initialize:', err)
    }
  }

  async function sendMessage(userMessage: string): Promise<string> {
    if (!session) {
      // Fallback responses when AI is unavailable
      return getFallbackResponse(characterName)
    }

    try {
      const response = await session.prompt(userMessage)
      return response
    } catch (err) {
      console.error('[useChromeAI] Prompt failed:', err)
      return getFallbackResponse(characterName)
    }
  }

  function getFallbackResponse(name: string): string {
    const responses: Record<string, string[]> = {
      Mom: [
        "Oh sweetie, I'm so proud of you! Make sure you rest up before heading out.",
        'Remember to write home often, dear!',
        "Don't forget to change your clothes before you go on your adventure!",
        'Your father and I are so proud of you. Be safe out there!',
        "I made you a nice meal! You can't go on an adventure on an empty stomach.",
      ],
    }
    const pool = responses[name] ?? [
      'Hello there!',
      'Nice weather we are having.',
      'Have you visited the town inn lately?',
    ]
    return pool[Math.floor(Math.random() * pool.length)]
  }

  onUnmounted(() => {
    session?.destroy()
    session = null
  })

  initialize()

  return {
    status,
    errorMessage,
    sendMessage,
    initialize,
  }
}
