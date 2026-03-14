<script setup lang="ts">
import { ref, onMounted } from 'vue'

const voices = ref<SpeechSynthesisVoice[]>([])
const selectedVoiceIndex = ref(0)
const testText = ref('And that was Ninja Loot in Nagrand — what a track! Coming up next, get ready for Pug Life Best Life!')
const pitch = ref(1.1)
const rate = ref(1.0)
const volume = ref(1.0)
const speaking = ref(false)

function loadVoices() {
  const v = speechSynthesis.getVoices()
  if (v.length) {
    voices.value = v
  }
}

onMounted(() => {
  loadVoices()
  if (!voices.value.length) {
    speechSynthesis.addEventListener('voiceschanged', loadVoices, { once: true })
  }
})

function speak() {
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(testText.value)
  u.voice = voices.value[selectedVoiceIndex.value] ?? null
  u.pitch = pitch.value
  u.rate = rate.value
  u.volume = volume.value
  speaking.value = true
  u.onend = () => (speaking.value = false)
  u.onerror = () => (speaking.value = false)
  speechSynthesis.speak(u)
}

function stop() {
  speechSynthesis.cancel()
  speaking.value = false
}
</script>

<template>
  <div class="debug-wrap">
    <h1>Voice Debug</h1>

    <div class="field">
      <label>Voice ({{ voices.length }} available)</label>
      <select v-model="selectedVoiceIndex">
        <option v-for="(v, i) in voices" :key="v.name" :value="i">
          {{ v.name }} ({{ v.lang }}){{ v.localService ? ' ✓ local' : '' }}
        </option>
      </select>
    </div>

    <div class="field">
      <label>Test text</label>
      <textarea v-model="testText" rows="3" />
    </div>

    <div class="sliders">
      <div class="field">
        <label>Pitch: {{ pitch.toFixed(2) }}</label>
        <input type="range" v-model.number="pitch" min="0.1" max="2" step="0.05" />
      </div>
      <div class="field">
        <label>Rate: {{ rate.toFixed(2) }}</label>
        <input type="range" v-model.number="rate" min="0.1" max="3" step="0.05" />
      </div>
      <div class="field">
        <label>Volume: {{ volume.toFixed(2) }}</label>
        <input type="range" v-model.number="volume" min="0" max="1" step="0.05" />
      </div>
    </div>

    <div class="actions">
      <button @click="speak" :disabled="speaking || !voices.length">
        {{ speaking ? 'Speaking…' : '▶ Speak' }}
      </button>
      <button @click="stop" :disabled="!speaking">■ Stop</button>
    </div>

    <div v-if="voices.length" class="voice-info">
      <strong>Selected:</strong> {{ voices[selectedVoiceIndex]?.name }}
      &mdash; {{ voices[selectedVoiceIndex]?.lang }}
      &mdash; {{ voices[selectedVoiceIndex]?.localService ? 'local' : 'remote' }}
    </div>
  </div>
</template>

<style scoped>
.debug-wrap {
  max-width: 640px;
  margin: 40px auto;
  padding: 24px;
  font-family: monospace;
  color: #e8e8e8;
  background: #1a1a2e;
  border-radius: 12px;
}

h1 {
  margin-top: 0;
  font-size: 1.4rem;
  color: #ffd700;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}

label {
  font-size: 0.8rem;
  color: #aaa;
}

select,
textarea {
  background: #0f0f1a;
  color: #e8e8e8;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 6px 8px;
  font-family: monospace;
  font-size: 0.9rem;
}

textarea {
  resize: vertical;
}

.sliders {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

input[type='range'] {
  width: 100%;
  accent-color: #ffd700;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

button {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  background: #ffd700;
  color: #1a1a2e;
  font-weight: bold;
  cursor: pointer;
  font-size: 0.9rem;
}

button:disabled {
  opacity: 0.4;
  cursor: default;
}

button:last-child {
  background: #ff6b6b;
  color: #fff;
}

.voice-info {
  margin-top: 16px;
  font-size: 0.8rem;
  color: #aaa;
  border-top: 1px solid #333;
  padding-top: 12px;
}
</style>
