import { ref, watch, onMounted } from "vue"
import { useMediaControls } from "@vueuse/core"
import { useVoice } from "../useVoice"

interface Song {
  src: string
  title: string
}

export function useRadio() {
  const songs: Array<Song> = [
    {
      src: `${import.meta.env.BASE_URL}music/ninja-loot-in-nagrand.mp3`,
      title: "Ninja Loot in Nagrand",
    },
    { src: `${import.meta.env.BASE_URL}music/pug-life-best-life.mp3`, title: "Pug Life Best Life" },
    {
      src: `${import.meta.env.BASE_URL}music/gated-community-g-code.mp3`,
      title: "Gated Community G-Code",
    },
    {
      src: `${import.meta.env.BASE_URL}music/stackoverflow-on-a-saturday-night.mp3`,
      title: "Stack Overflow on a Saturday Night",
    },
    {
      src: `${import.meta.env.BASE_URL}music/pug-on-patrol.mp3`,
      title: "Pug on Patrol",
    },
    {
      src: `${import.meta.env.BASE_URL}music/the-grooming-routine.mp3`,
      title: "The Grooming Routine",
    },
  ]

  // Fisher-Yates shuffle so the playlist order is different every session
  for (let i = songs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[songs[i], songs[j]] = [songs[j], songs[i]]
  }

  const radioState = ref<"on" | "off">("off")
  const currentSongIndex = ref(0)
  const currentSrc = ref(songs[0].src)

  // Create audio element programmatically — no template <audio> tag needed
  const audioEl = new Audio()
  const { playing, volume, ended, currentTime, duration } = useMediaControls(audioEl, { src: currentSrc })

  const { speakText } = useVoice()

  async function playDJAnnouncement({ prevIndex, nextIndex }: { prevIndex: number; nextIndex: number }) {
    const justFinished = songs[prevIndex].title
    const next = songs[nextIndex].title
    const lines: Array<string> = [
      `And that was "${justFinished}" — what a track! Coming up next, get ready for "${next}"!`,
      `Beautiful. That was "${justFinished}". Stay tuned — "${next}" is on deck!`,
      `You're listening to the best radio in town. That was "${justFinished}", and up next: "${next}"!`,
    ]
    const line = lines[Math.floor(Math.random() * lines.length)]
    await speakText({ text: line, pitch: 1.15, rate: 1.05 })
  }

  // Auto-advance to the next song when the current one finishes
  watch(ended, async (isEnded) => {
    if (isEnded !== true || radioState.value !== "on") return

    const prevIndex = currentSongIndex.value
    const nextIndex = (prevIndex + 1) % songs.length
    currentSongIndex.value = nextIndex

    await playDJAnnouncement({ prevIndex, nextIndex })

    currentSrc.value = songs[nextIndex].src
    playing.value = true
  })

  function toggle() {
    if (radioState.value === "on") {
      radioState.value = "off"
      playing.value = false
    } else {
      // Cycle to next song each time the radio is turned on
      currentSongIndex.value = (currentSongIndex.value + 1) % songs.length
      currentSrc.value = songs[currentSongIndex.value].src
      radioState.value = "on"
      playing.value = true
      // Seek to a random point in the first 80% of the track once metadata loads
      const onMeta = () => {
        if (duration.value > 0) {
          currentTime.value = Math.random() * duration.value * 0.8
        }
        audioEl.removeEventListener("loadedmetadata", onMeta)
      }
      audioEl.addEventListener("loadedmetadata", onMeta)
    }
  }

  onMounted(() => {
    volume.value = 0.35
  })

  return { radioState, toggle }
}
