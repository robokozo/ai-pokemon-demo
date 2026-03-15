// Scripted TV news scheduler using the Web Speech API.
// No AI / network calls — all content is static and local.

import { findVoice } from "../../voices"

const NEWS_LINES = [
  "Breaking news: Scientists confirm the air beyond the town limits has turned an unsettling shade of yellow. Residents are advised to stay indoors.",
  "In other news, local adventurers are warned that suspicious berry patches have tripled this month. Officials urge caution near bushes.",
  "Weather update: Expect a seventy percent chance of wild creature ambushes today, with gusts of unease throughout the afternoon and evening.",
  "The town council urges residents to stay indoors after sundown following a surge in unexplained rustling sounds from the tall grass to the north.",
  "A local mother is reminding her child ΓÇö again ΓÇö not to leave home without checking their supplies. She says the meal is getting cold.",
  "Sports update: The annual cross-town footrace has been postponed indefinitely due to what officials describe as too many things blocking the route.",
  "Financial report: Potions are up four percent, Antidotes down two. Analysts recommend stocking up before any long journeys outside town.",
  "In world news, explorers report that the cave system to the north has not gotten any less dark or confusing. Proceed with a torch and caution.",
  "Reminder from your local news station: Always carry a map. Always. Even if you think you know the way. Especially if you think you know the way.",
  "Tonight at eleven: We speak to a local mother about why she worries every single time her child steps out the front door.",
  "Weather continues to be unpredictable on the eastern routes. Meteorologists recommend bringing a jacket, an umbrella, and a backup plan.",
  "Residents near the northern forest are reporting unusual howling after dark. Experts say it is probably nothing. Probably.",
  "A community announcement: The local healer reminds everyone that healing is free, but forgetting to heal is very, very expensive.",
  "And finally a feel-good story: A young traveler was spotted helping an elderly gentleman cross the main route. They immediately walked into tall grass and were startled. They were fine.",
  "This is your two-minute warning: If you have not said goodbye to your mother yet, she is probably making a really nice meal for you right now.",
  "Authorities are advising all travelers to double-check their footwear before any cross-country trips. Blisters have reached an all-time high.",
  "In other news, the Healing Clinic on the north side of town reports a twenty-three percent increase in visitors who, quote, thought they were ready.",
]

export function useTVNews() {
  let currentIndex = 0
  let timerId: ReturnType<typeof setTimeout> | null = null
  let isActive = false
  let storyStartCallback: (() => void) | null = null
  let storyEndCallback: (() => void) | null = null

  function scheduleNext(delayMs: number) {
    timerId = setTimeout(() => {
      if (isActive === true) {
        speakNext()
      }
    }, delayMs)
  }

  function speakNext() {
    if (isActive !== true || !window.speechSynthesis) return

    const line = NEWS_LINES[currentIndex % NEWS_LINES.length]
    currentIndex++

    if (storyStartCallback !== null) {
      storyStartCallback()
    }

    const utterance = new SpeechSynthesisUtterance(line)
    utterance.rate = 0.92
    utterance.pitch = 1.0
    utterance.volume = 0.75

    const frenchVoice = findVoice("Google français")
    if (frenchVoice !== undefined) {
      utterance.voice = frenchVoice
    }

    utterance.onend = () => {
      if (isActive !== true) return
      if (storyEndCallback !== null) {
        storyEndCallback()
      }
      // Randomized gap: 3ΓÇô9 seconds between segments
      const gap = 3000 + Math.random() * 6000
      scheduleNext(gap)
    }

    utterance.onerror = () => {
      if (isActive !== true) return
      if (storyEndCallback !== null) {
        storyEndCallback()
      }
      scheduleNext(5000)
    }

    window.speechSynthesis.speak(utterance)
  }

  /** Register a callback that fires each time a new story begins speaking. */
  function onStoryStart(cb: () => void) {
    storyStartCallback = cb
  }

  /** Register a callback that fires each time a story finishes speaking. */
  function onStoryEnd(cb: () => void) {
    storyEndCallback = cb
  }

  /** Start the news broadcast after an optional initial delay (ms). */
  function start(initialDelayMs = 800) {
    stop()
    isActive = true
    scheduleNext(initialDelayMs)
  }

  /** Stop the broadcast immediately, cancel any ongoing speech, and clear timers. */
  function stop() {
    isActive = false
    if (timerId !== null) {
      clearTimeout(timerId)
      timerId = null
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }

  return { start, stop, onStoryStart, onStoryEnd }
}
