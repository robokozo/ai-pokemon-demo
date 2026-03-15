import { ref, computed } from "vue"
import { useSpeechRecognition, useSpeechSynthesis } from "@vueuse/core"

export function useVoice() {
  const isListening = ref(false)
  const isSpeaking = ref(false)
  const transcript = ref("")
  const voiceError = ref<string>("")

  // --- Speech Recognition ---
  const {
    isSupported: recognitionSupported,
    isListening: recognitionListening,
    result: recognitionResult,
    start: startRecognition,
    stop: stopRecognition,
    error: recognitionError,
  } = useSpeechRecognition({
    lang: "en-US",
    interimResults: false,
    continuous: false,
  })

  // Watch recognition state
  const recognitionActive = computed(() => recognitionListening.value)

  async function startListening(): Promise<string> {
    if (recognitionSupported.value !== true) {
      voiceError.value = "Speech recognition is not supported in this browser."
      return ""
    }

    return new Promise((resolve) => {
      recognitionResult.value = ""
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
    computed(() => utterance.value?.text ?? ""),
    {
      lang: "en-US",
      pitch: 1.1,
      rate: 0.95,
      volume: 1,
    },
  )

  // Browsers load voices asynchronously; getVoices() returns [] on first call until
  // the 'voiceschanged' event fires. This helper waits for the list to be populated.
  function getAvailableVoices(): Promise<Array<SpeechSynthesisVoice>> {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) return Promise.resolve(voices)
    return new Promise((resolve) => {
      window.speechSynthesis.addEventListener("voiceschanged", () => resolve(window.speechSynthesis.getVoices()), { once: true })
    })
  }

  async function speakText({ text, pitch, rate }: { text: string; pitch?: number; rate?: number }): Promise<void> {
    if (synthesisSupported.value !== true) {
      voiceError.value = "Speech synthesis is not supported in this browser."
      return
    }

    // Create utterance with options
    const u = new SpeechSynthesisUtterance(text)
    u.lang = "en-US"
    u.pitch = pitch ?? 1.1
    u.rate = rate ?? 0.95
    u.volume = 1

    // Pick a female voice if available (await so voices are ready on first call too)
    const voices = await getAvailableVoices()
    const femaleVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.toLowerCase().includes("female") ||
          v.name.toLowerCase().includes("woman") ||
          v.name.includes("Samantha") ||
          v.name.includes("Victoria") ||
          v.name.includes("Karen") ||
          v.name.includes("Moira") ||
          v.name.includes("Tessa")),
    )
    if (femaleVoice !== undefined) {
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
