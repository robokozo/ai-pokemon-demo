<script setup lang="ts">
import { ref, watch, nextTick } from "vue"
import { useChromeAI } from "./useChromeAI"
import { useVoice } from "../useVoice"

interface Props {
  npcName: string
  npcDescription: string
  visible: boolean
}

interface Message {
  role: "player" | "npc"
  text: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()

const messages = ref<Array<Message>>([])
const textInput = ref("")
const isThinking = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

const { status, sendMessage } = useChromeAI({
  characterName: props.npcName,
  characterDescription: props.npcDescription,
})
const { recognitionSupported, synthesisSupported, isListening, isSpeaking, startListening, stopListening, speakText, stopSpeaking } = useVoice()

// Greet the player when dialog opens
watch(
  () => props.visible,
  async (visible) => {
    if (visible && messages.value.length === 0) {
      await greetPlayer()
    }
  },
  { immediate: true },
)

async function greetPlayer() {
  isThinking.value = true
  const greeting = await sendMessage("*The player approaches and wants to talk to you.*")
  isThinking.value = false
  messages.value.push({ role: "npc", text: greeting })
  if (synthesisSupported.value === true) {
    await speakText({ text: greeting, pitch: 1.2, rate: 0.9 })
  }
  scrollToBottom()
}

async function sendText() {
  const text = textInput.value.trim()
  if (text.length === 0 || isThinking.value === true) return
  textInput.value = ""
  await handlePlayerInput(text)
}

async function handleVoiceInput() {
  if (isListening.value) {
    stopListening()
    return
  }
  const spoken = await startListening()
  if (spoken.length > 0) {
    await handlePlayerInput(spoken)
  }
}

async function handlePlayerInput(text: string) {
  messages.value.push({ role: "player", text })
  scrollToBottom()

  isThinking.value = true
  const response = await sendMessage(text)
  isThinking.value = false

  messages.value.push({ role: "npc", text: response })
  scrollToBottom()

  if (synthesisSupported.value === true) {
    await speakText({ text: response, pitch: 1.2, rate: 0.9 })
  }
}

function handleClose() {
  stopSpeaking()
  stopListening()
  emit("close")
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Enter" && e.shiftKey !== true) {
    e.preventDefault()
    sendText()
  }
  if (e.key === "Escape") {
    handleClose()
  }
}
</script>

<template>
  <Transition name="dialog">
    <div v-if="visible" class="dialog-overlay" @click.self="handleClose">
      <div class="dialog-box">
        <!-- Header -->
        <div class="dialog-header">
          <div class="npc-avatar">
            <span class="npc-avatar-emoji">👩</span>
          </div>
          <div class="dialog-title">
            <span class="npc-name">{{ npcName }}</span>
            <span
              class="ai-status"
              :class="{
                ready: status === 'ready',
                unavailable: status === 'unavailable',
                loading: status === 'loading',
                error: status === 'error',
              }"
            >
              {{ status === "ready" ? "🧠 AI" : status === "loading" ? "⏳ Loading AI…" : status === "unavailable" ? "💬 Scripted" : "⚠️ Fallback" }}
            </span>
          </div>
          <button class="close-btn" @click="handleClose" aria-label="Close dialog">✕</button>
        </div>

        <!-- Messages -->
        <div ref="messagesContainer" class="messages">
          <TransitionGroup name="message">
            <div v-for="(msg, i) in messages" :key="i" class="message" :class="msg.role">
              <span class="message-label">{{ msg.role === "npc" ? npcName : "You" }}</span>
              <p class="message-text">{{ msg.text }}</p>
            </div>
          </TransitionGroup>

          <div v-if="isThinking" class="message npc thinking">
            <span class="message-label">{{ npcName }}</span>
            <p class="message-text">
              <span class="dot-pulse"> <span /><span /><span /> </span>
            </p>
          </div>
        </div>

        <!-- Input area -->
        <div class="dialog-input">
          <input
            v-model="textInput"
            type="text"
            placeholder="Say something… or use 🎤"
            :disabled="isThinking"
            @keydown="onKeydown"
            class="text-input"
          />

          <!-- Voice button -->
          <button
            v-if="recognitionSupported"
            class="voice-btn"
            :class="{ listening: isListening, speaking: isSpeaking }"
            :disabled="isThinking"
            :title="isListening ? 'Stop listening' : 'Speak'"
            @click="handleVoiceInput"
          >
            {{ isListening ? "🔴" : isSpeaking ? "🔊" : "🎤" }}
          </button>

          <button class="send-btn" :disabled="isThinking || !textInput.trim()" @click="sendText">Send</button>
        </div>

        <!-- Controls hint -->
        <div class="dialog-hint">Press <kbd>Esc</kbd> or click outside to close</div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1rem;
  z-index: 100;
}

.dialog-box {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #4a90d9;
  border-radius: 12px;
  width: 100%;
  max-width: 580px;
  display: flex;
  flex-direction: column;
  gap: 0;
  box-shadow: 0 0 30px rgba(74, 144, 217, 0.4);
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(74, 144, 217, 0.15);
  border-bottom: 1px solid rgba(74, 144, 217, 0.3);
}

.npc-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e87ca0, #c05478);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.dialog-title {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.npc-name {
  font-family: "Press Start 2P", "Courier New", monospace;
  font-size: 0.85rem;
  color: #e0e0ff;
  font-weight: bold;
}

.ai-status {
  font-size: 0.65rem;
  color: #888;
}

.ai-status.ready {
  color: #4caf50;
}

.ai-status.loading {
  color: #ff9800;
}

.ai-status.unavailable,
.ai-status.error {
  color: #ff6b6b;
}

.close-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #aaa;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 80, 80, 0.2);
  color: #fff;
  border-color: rgba(255, 80, 80, 0.4);
}

.messages {
  padding: 1rem;
  min-height: 160px;
  max-height: 280px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  scrollbar-width: thin;
  scrollbar-color: #4a90d9 #1a1a2e;
}

.message {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 85%;
  animation: slideIn 0.2s ease;
}

.message.npc {
  align-self: flex-start;
}

.message.player {
  align-self: flex-end;
  align-items: flex-end;
}

.message-label {
  font-size: 0.65rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.message-text {
  margin: 0;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  font-size: 0.875rem;
  line-height: 1.5;
}

.message.npc .message-text {
  background: rgba(232, 124, 160, 0.2);
  border: 1px solid rgba(232, 124, 160, 0.3);
  color: #f0d0e0;
  border-radius: 10px 10px 10px 2px;
}

.message.player .message-text {
  background: rgba(74, 144, 217, 0.2);
  border: 1px solid rgba(74, 144, 217, 0.3);
  color: #d0e8f8;
  border-radius: 10px 10px 2px 10px;
}

.thinking .message-text {
  padding: 0.6rem 0.75rem;
}

.dot-pulse {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.dot-pulse span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e87ca0;
  animation: pulse 1.4s ease-in-out infinite;
}

.dot-pulse span:nth-child(2) {
  animation-delay: 0.2s;
}

.dot-pulse span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%,
  60%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  30% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.dialog-input {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid rgba(74, 144, 217, 0.2);
  background: rgba(0, 0, 0, 0.2);
}

.text-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(74, 144, 217, 0.4);
  border-radius: 8px;
  color: #e0e8ff;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.text-input:focus {
  border-color: #4a90d9;
  background: rgba(255, 255, 255, 0.1);
}

.text-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.text-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.voice-btn {
  padding: 0.5rem 0.6rem;
  border-radius: 8px;
  border: 1px solid rgba(232, 124, 160, 0.4);
  background: rgba(232, 124, 160, 0.15);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 40px;
}

.voice-btn:hover:not(:disabled) {
  background: rgba(232, 124, 160, 0.3);
}

.voice-btn.listening {
  background: rgba(255, 80, 80, 0.3);
  border-color: rgba(255, 80, 80, 0.6);
  animation: pulse-border 1s ease-in-out infinite;
}

.voice-btn.speaking {
  background: rgba(74, 217, 150, 0.3);
  border-color: rgba(74, 217, 150, 0.6);
}

.voice-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes pulse-border {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(255, 80, 80, 0.4);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(255, 80, 80, 0);
  }
}

.send-btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(74, 144, 217, 0.5);
  background: rgba(74, 144, 217, 0.2);
  color: #90c4ff;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.send-btn:hover:not(:disabled) {
  background: rgba(74, 144, 217, 0.35);
  color: #c0e0ff;
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dialog-hint {
  text-align: center;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.25);
  padding: 0.4rem 1rem 0.6rem;
}

kbd {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  padding: 1px 4px;
  font-family: monospace;
  font-size: 0.6rem;
}

/* Transitions */
.dialog-enter-active,
.dialog-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.message-enter-active {
  transition: all 0.2s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
