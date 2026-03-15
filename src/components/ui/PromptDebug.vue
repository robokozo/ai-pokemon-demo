<script setup lang="ts">
import { ref } from "vue"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

const systemPrompt = ref(`You are a character in a small-town RPG. Stay in character at all times.`)
const userInput = ref("")
const messages = ref<Array<Message>>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const temperature = ref(0.8)
const topK = ref(40)

let session: LanguageModelSession | null = null

const isAIAvailable = typeof LanguageModel !== "undefined"

async function createSession() {
  if (session !== null) {
    session.destroy()
    session = null
  }
  error.value = null

  const initialPrompts: Array<LanguageModelPromptMessage> = [{ role: "system", content: systemPrompt.value }]

  session = await LanguageModel.create({
    initialPrompts,
    temperature: temperature.value,
    topK: topK.value,
    expectedInputs: [{ type: "text" as const, languages: ["en"] }],
    expectedOutputs: [{ type: "text" as const, languages: ["en"] }],
  })
}

async function send() {
  const text = userInput.value.trim()
  if (text.length === 0) {
    return
  }

  messages.value.push({ role: "user", content: text })
  userInput.value = ""
  isLoading.value = true
  error.value = null

  try {
    if (session === null) {
      await createSession()
    }
    if (session === null) {
      throw new Error("Session unavailable")
    }
    const response = await session.prompt(text)
    messages.value.push({ role: "assistant", content: response })
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Unknown error"
  } finally {
    isLoading.value = false
  }
}

function reset() {
  if (session !== null) {
    session.destroy()
    session = null
  }
  messages.value = []
  error.value = null
}

function handleKeydown({ event }: { event: KeyboardEvent }) {
  if (event.key === "Enter" && event.shiftKey !== true) {
    event.preventDefault()
    send()
  }
}
</script>

<template>
  <div class="prompt-debug">
    <div v-if="isAIAvailable !== true" class="unavailable-banner">
      Chrome AI (LanguageModel) is not available in this browser. Requires Chrome 138+ with the Prompt API flag enabled.
    </div>

    <div class="config-panel">
      <div class="config-row">
        <div class="field">
          <label>System prompt</label>
          <textarea v-model="systemPrompt" rows="4" @change="() => reset()" />
          <span class="field-hint">Changing this resets the session.</span>
        </div>
      </div>
      <div class="config-row sliders">
        <div class="field">
          <label>Temperature: {{ temperature.toFixed(2) }}</label>
          <input type="range" v-model.number="temperature" min="0" max="2" step="0.05" @change="() => reset()" />
        </div>
        <div class="field">
          <label>Top-K: {{ topK }}</label>
          <input type="range" v-model.number="topK" min="1" max="100" step="1" @change="() => reset()" />
        </div>
      </div>
    </div>

    <div class="messages" aria-live="polite">
      <div v-if="messages.length === 0" class="empty-state">No messages yet. Type below to start.</div>
      <div v-for="(msg, i) in messages" :key="i" :class="['message', `message--${msg.role}`]">
        <span class="message-role">{{ msg.role }}</span>
        <span class="message-content">{{ msg.content }}</span>
      </div>
      <div v-if="isLoading === true" class="message message--assistant loading">
        <span class="message-role">assistant</span>
        <span class="message-content">…</span>
      </div>
      <div v-if="error !== null" class="error-row">{{ error }}</div>
    </div>

    <div class="input-row">
      <textarea
        v-model="userInput"
        rows="2"
        placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
        :disabled="isLoading === true || isAIAvailable !== true"
        @keydown="(e) => handleKeydown({ event: e })"
      />
      <div class="input-actions">
        <button @click="() => send()" :disabled="isLoading === true || isAIAvailable !== true || userInput.trim().length === 0">
          {{ isLoading === true ? "Sending…" : "▶ Send" }}
        </button>
        <button class="btn-reset" @click="() => reset()" :disabled="messages.length === 0">↺ Reset</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prompt-debug {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.unavailable-banner {
  background: #3a1a1a;
  border: 1px solid #ff6b6b;
  color: #ff6b6b;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
}

.config-panel {
  background: #0f0f1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.config-row.sliders {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

label {
  font-size: 0.8rem;
  color: #aaa;
}

.field-hint {
  font-size: 0.72rem;
  color: #666;
}

textarea,
select {
  background: #1a1a2e;
  color: #e8e8e8;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 6px 8px;
  font-family: monospace;
  font-size: 0.9rem;
  resize: vertical;
}

input[type="range"] {
  accent-color: #ffd700;
  width: 100%;
}

.messages {
  background: #0f0f1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 12px;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.empty-state {
  color: #555;
  font-size: 0.85rem;
  margin: auto;
  text-align: center;
}

.message {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.message-role {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #666;
}

.message--user .message-role {
  color: #ffd700;
}
.message--assistant .message-role {
  color: #4ab0ff;
}

.message-content {
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: pre-wrap;
  color: #e8e8e8;
}

.loading .message-content {
  color: #555;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.error-row {
  color: #ff6b6b;
  font-size: 0.85rem;
  border-top: 1px solid #3a1a1a;
  padding-top: 8px;
}

.input-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-row textarea {
  width: 100%;
  box-sizing: border-box;
}

.input-actions {
  display: flex;
  gap: 8px;
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
  font-family: monospace;
}

button:disabled {
  opacity: 0.4;
  cursor: default;
}

.btn-reset {
  background: #333;
  color: #aaa;
}

.btn-reset:not(:disabled):hover {
  background: #444;
  color: #e8e8e8;
}
</style>
