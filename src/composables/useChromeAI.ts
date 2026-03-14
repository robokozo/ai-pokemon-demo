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
  let session: LanguageModelSession | null = null

  const systemPrompt = `You are ${characterName}. ${characterDescription}
  
Keep your responses conversational, warm, and in character. Keep responses brief (1-3 sentences).
You are an NPC in an RPG adventure game. The player is talking to you.`

  async function initialize() {
    console.log('[useChromeAI] initialize() called for:', characterName)
    console.log('[useChromeAI] typeof LanguageModel:', typeof LanguageModel)

    if (typeof LanguageModel === 'undefined') {
      console.warn('[useChromeAI] LanguageModel is not defined — Chrome 138+ required')
      status.value = AI_UNAVAILABLE
      errorMessage.value =
        'Chrome AI (Gemini Nano) is not available. Please use Chrome 138+ with the Prompt API flag enabled.'
      return
    }

    try {
      status.value = AI_LOADING
      const availabilityOptions = {
        expectedInputs: [{ type: 'text' as const, languages: ['en'] }],
        expectedOutputs: [{ type: 'text' as const, languages: ['en'] }],
      }
      console.log('[useChromeAI] Calling LanguageModel.availability() with:', JSON.stringify(availabilityOptions))
      const availability = await LanguageModel.availability(availabilityOptions)
      console.log('[useChromeAI] LanguageModel.availability() result:', availability)

      if (availability === 'unavailable') {
        status.value = AI_UNAVAILABLE
        errorMessage.value = 'Chrome AI is not available on this device.'
        return
      }

      const createOptions = {
        systemPrompt,
        temperature: 0.8,
        topK: 40,
        expectedInputs: [{ type: 'text' as const, languages: ['en'] }],
        expectedOutputs: [{ type: 'text' as const, languages: ['en'] }],
      }
      console.log('[useChromeAI] Calling LanguageModel.create() with:', JSON.stringify({ ...createOptions, systemPrompt: '[truncated]' }))
      session = await LanguageModel.create(createOptions)
      console.log('[useChromeAI] LanguageModel.create() succeeded, session:', session)

      status.value = AI_READY
      console.log('[useChromeAI] Status set to READY')
    } catch (err) {
      console.error('[useChromeAI] Failed to initialize:', err)
      status.value = AI_ERROR
      errorMessage.value = err instanceof Error ? err.message : 'Unknown error initializing AI'
    }
  }

  async function sendMessage(userMessage: string): Promise<string> {
    console.log('[useChromeAI] sendMessage() called, session:', session ? 'exists' : 'null')
    if (!session) {
      console.warn('[useChromeAI] No session — using fallback response')
      return getFallbackResponse(characterName)
    }

    try {
      console.log('[useChromeAI] Calling session.prompt() with:', userMessage)
      const response = await session.prompt(userMessage)
      console.log('[useChromeAI] session.prompt() response:', response)
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
