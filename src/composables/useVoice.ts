import { ref, computed } from 'vue'
import { useSpeechRecognition, useSpeechSynthesis } from '@vueuse/core'

export function useVoice() {
  const isListening = ref(false)
  const isSpeaking = ref(false)
  const transcript = ref('')
  const voiceError = ref<string>('')

  // --- Speech Recognition ---
  const {
    isSupported: recognitionSupported,
    isListening: recognitionListening,
    result: recognitionResult,
    start: startRecognition,
    stop: stopRecognition,
    error: recognitionError,
  } = useSpeechRecognition({
    lang: 'en-US',
    interimResults: false,
    continuous: false,
  })

  // Watch recognition state
  const recognitionActive = computed(() => recognitionListening.value)

  async function startListening(): Promise<string> {
    if (!recognitionSupported.value) {
      voiceError.value = 'Speech recognition is not supported in this browser.'
      return ''
    }

    return new Promise((resolve) => {
      recognitionResult.value = ''
      isListening.value = true

      startRecognition()

      // Poll for result or end of recognition
      const checkInterval = setInterval(() => {
        if (!recognitionListening.value) {
          clearInterval(checkInterval)
          isListening.value = false
          const result = recognitionResult.value.trim()
          transcript.value = result
          resolve(result)
        }
      }, 200)

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        stopRecognition()
        isListening.value = false
        const result = recognitionResult.value.trim()
        transcript.value = result
        resolve(result)
      }, 10000)
    })
  }

  function stopListening() {
    stopRecognition()
    isListening.value = false
  }

  // --- Speech Synthesis ---
  const utterance = ref<SpeechSynthesisUtterance | null>(null)

  const { isSupported: synthesisSupported } = useSpeechSynthesis(
    computed(() => utterance.value?.text ?? ''),
    {
      lang: 'en-US',
      pitch: 1.1,
      rate: 0.95,
      volume: 1,
    },
  )

  async function speakText(text: string, options?: { pitch?: number; rate?: number }): Promise<void> {
    if (!synthesisSupported.value) {
      voiceError.value = 'Speech synthesis is not supported in this browser.'
      return
    }

    // Create utterance with options
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.pitch = options?.pitch ?? 1.1
    u.rate = options?.rate ?? 0.95
    u.volume = 1

    // Pick a female voice if available
    const voices = window.speechSynthesis.getVoices()
    const femaleVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('woman') ||
          v.name.includes('Samantha') ||
          v.name.includes('Victoria') ||
          v.name.includes('Karen') ||
          v.name.includes('Moira') ||
          v.name.includes('Tessa')),
    )
    if (femaleVoice) {
      u.voice = femaleVoice
    }

    utterance.value = u
    isSpeaking.value = true

    return new Promise((resolve) => {
      u.onend = () => {
        isSpeaking.value = false
        resolve()
      }
      u.onerror = () => {
        isSpeaking.value = false
        resolve()
      }
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(u)
    })
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel()
    isSpeaking.value = false
  }

  return {
    // Recognition
    recognitionSupported,
    synthesisSupported,
    isListening,
    isSpeaking,
    transcript,
    voiceError,
    recognitionActive,
    recognitionError,
    startListening,
    stopListening,
    // Synthesis
    speakText,
    stopSpeaking,
  }
}
