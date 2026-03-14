<script setup lang="ts">
import { ref, onMounted } from 'vue'

const emit = defineEmits<{ start: [] }>()

// ── Browser detection ─────────────────────────────────────────────────────────
function isChrome(): boolean {
  const ua = navigator.userAgent
  // Exclude other Chromium-based browsers that don't support Chrome's built-in AI
  return /Chrome\//.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua)
}

const usingChrome = ref(true)

// ── AI availability state ─────────────────────────────────────────────────────
type SetupStatus =
  | 'checking'
  | 'available'
  | 'downloading'
  | 'downloadable'
  | 'unavailable'
  | 'error'

const setupStatus = ref<SetupStatus>('checking')
const downloadProgress = ref(0)
const statusMessage = ref('')
const canStartWithFallback = ref(false)

// ── Check AI availability using the newest Chrome API first, then legacy ──────
async function checkAvailability() {
  setupStatus.value = 'checking'
  statusMessage.value = 'Checking AI model availability…'

  console.log('[SetupScreen] checkAvailability() started')
  console.log('[SetupScreen] typeof LanguageModel:', typeof LanguageModel)
  console.log('[SetupScreen] window.ai:', (window as any).ai)

  // Try new LanguageModel static API (Chrome 138+)
  if (typeof LanguageModel !== 'undefined') {
    try {
      const availabilityOptions = {
        expectedInputs: [{ type: 'text' as const, languages: ['en'] }],
        expectedOutputs: [{ type: 'text' as const, languages: ['en'] }],
      }
      console.log('[SetupScreen] Calling LanguageModel.availability() with:', JSON.stringify(availabilityOptions))
      const availability = await LanguageModel.availability(availabilityOptions)
      console.log('[SetupScreen] LanguageModel.availability() result:', availability)
      applyNewApiStatus(availability)
      return
    } catch (err) {
      console.warn('[SetupScreen] LanguageModel.availability() threw:', err)
      // Fall through to legacy API
    }
  }

  // Try legacy window.ai API (Chrome 127+)
  if (window.ai?.languageModel) {
    try {
      console.log('[SetupScreen] Falling back to window.ai.languageModel.capabilities()')
      const caps = await window.ai.languageModel.capabilities()
      console.log('[SetupScreen] window.ai capabilities:', caps)
      applyLegacyApiStatus(caps.available)
      return
    } catch (err) {
      console.warn('[SetupScreen] window.ai.languageModel.capabilities() threw:', err)
      // Fall through to unavailable
    }
  }

  // Neither API found
  console.warn('[SetupScreen] No AI API found')
  setupStatus.value = 'unavailable'
  statusMessage.value =
    'Chrome AI (Gemini Nano) is not available. Enable the Prompt API flag or update Chrome.'
  canStartWithFallback.value = true
}

function applyNewApiStatus(availability: LanguageModelAvailability) {
  console.log('[SetupScreen] applyNewApiStatus():', availability)
  switch (availability) {
    case 'available':
      setupStatus.value = 'available'
      statusMessage.value = 'AI model is ready!'
      break
    case 'downloading':
      setupStatus.value = 'downloading'
      statusMessage.value = 'AI model is downloading…'
      break
    case 'downloadable':
      setupStatus.value = 'downloadable'
      statusMessage.value = 'AI model needs to be downloaded (~1.5 GB).'
      canStartWithFallback.value = true
      break
    case 'unavailable':
      setupStatus.value = 'unavailable'
      statusMessage.value = 'AI model is not supported on this device.'
      canStartWithFallback.value = true
      break
  }
}

function applyLegacyApiStatus(available: AILanguageModelCapabilities['available']) {
  switch (available) {
    case 'readily':
      setupStatus.value = 'available'
      statusMessage.value = 'AI model is ready!'
      break
    case 'after-download':
      setupStatus.value = 'downloadable'
      statusMessage.value = 'AI model needs to be downloaded.'
      canStartWithFallback.value = true
      break
    case 'no':
      setupStatus.value = 'unavailable'
      statusMessage.value = 'AI model is not supported on this device.'
      canStartWithFallback.value = true
      break
  }
}

// ── Trigger model download ────────────────────────────────────────────────────
async function triggerDownload() {
  setupStatus.value = 'downloading'
  statusMessage.value = 'Starting AI model download…'
  downloadProgress.value = 0

  console.log('[SetupScreen] triggerDownload() started')

  try {
    if (typeof LanguageModel !== 'undefined') {
      const createOptions = {
        expectedInputs: [{ type: 'text' as const, languages: ['en'] }],
        expectedOutputs: [{ type: 'text' as const, languages: ['en'] }],
        monitor: (monitor: EventTarget) => {
          monitor.addEventListener('downloadprogress', (e: Event) => {
            const progressEvent = e as ProgressEvent
            if (progressEvent.total) {
              downloadProgress.value = Math.round((progressEvent.loaded / progressEvent.total) * 100)
            }
            statusMessage.value = `Downloading AI model… ${downloadProgress.value}%`
          })
        },
      }
      console.log('[SetupScreen] Calling LanguageModel.create() with:', JSON.stringify({ ...createOptions, monitor: '[Function]' }))
      await LanguageModel.create(createOptions)
    } else if (window.ai?.languageModel) {
      console.log('[SetupScreen] Falling back to window.ai.languageModel.create()')
      await window.ai.languageModel.create({})
    }

    console.log('[SetupScreen] triggerDownload() succeeded')
    setupStatus.value = 'available'
    statusMessage.value = 'AI model is ready!'
    downloadProgress.value = 100
  } catch (err) {
    console.error('[SetupScreen] triggerDownload() failed:', err)
    setupStatus.value = 'error'
    statusMessage.value = err instanceof Error ? err.message : 'Download failed.'
    canStartWithFallback.value = true
  }
}

onMounted(() => {
  usingChrome.value = isChrome()
  checkAvailability()
})
</script>

<template>
  <div class="setup-screen">
    <div class="setup-card">
      <!-- Title -->
      <h1 class="game-title">AI Adventure</h1>
      <p class="game-subtitle">An RPG powered by Chrome's on-device AI</p>

      <!-- Browser warning -->
      <div v-if="!usingChrome" class="alert alert-warning">
        <span class="alert-icon">⚠️</span>
        <div class="alert-body">
          <strong>Chrome Required</strong>
          <p>
            This game uses Chrome's built-in Gemini Nano AI. Please open it in
            <a href="https://www.google.com/chrome/" target="_blank" rel="noopener">Google Chrome</a>
            for the best experience. AI features will not be available in other browsers.
          </p>
        </div>
      </div>

      <!-- AI status panel -->
      <div class="status-panel">
        <div class="status-header">
          <span class="status-label">AI Model Status</span>
          <span class="status-badge" :class="{
            'badge-checking': setupStatus === 'checking',
            'badge-available': setupStatus === 'available',
            'badge-downloading': setupStatus === 'downloading',
            'badge-downloadable': setupStatus === 'downloadable',
            'badge-unavailable': setupStatus === 'unavailable' || setupStatus === 'error',
          }">
            {{
              setupStatus === 'checking'
                ? '⏳ Checking…'
                : setupStatus === 'available'
                  ? '✅ Ready'
                  : setupStatus === 'downloading'
                    ? '⬇️ Downloading'
                    : setupStatus === 'downloadable'
                      ? '📥 Not Downloaded'
                      : setupStatus === 'error'
                        ? '❌ Error'
                        : '🚫 Unavailable'
            }}
          </span>
        </div>

        <p class="status-message">{{ statusMessage }}</p>

        <!-- Download progress bar -->
        <div v-if="setupStatus === 'downloading'" class="progress-wrap">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: downloadProgress > 0 ? `${downloadProgress}%` : '40%' }"
              :class="{ indeterminate: downloadProgress === 0 }" />
          </div>
          <span v-if="downloadProgress > 0" class="progress-pct">{{ downloadProgress }}%</span>
        </div>

        <!-- Download trigger -->
        <button v-if="setupStatus === 'downloadable'" class="btn btn-primary" @click="triggerDownload">
          ⬇️ Download AI Model (~1.5 GB)
        </button>

        <!-- Retry -->
        <button v-if="setupStatus === 'error'" class="btn btn-secondary" @click="checkAvailability">
          🔄 Retry
        </button>

        <!-- Info for unavailable -->
        <div v-if="setupStatus === 'unavailable'" class="info-box">
          <p>
            To enable Chrome's built-in AI:
          </p>
          <ol>
            <li>Open <code>chrome://flags</code></li>
            <li>Search for and enable <code>#prompt-api-for-gemini-nano</code></li>
            <li>Also enable <code>#optimization-guide-on-device-model</code></li>
            <li>Relaunch Chrome and return here</li>
          </ol>
        </div>
      </div>

      <!-- Start buttons -->
      <div class="action-row">
        <button v-if="setupStatus === 'available'" class="btn btn-start" @click="emit('start')">
          ▶ Start Game
        </button>

        <button v-else-if="canStartWithFallback && setupStatus !== 'downloading'" class="btn btn-start btn-fallback"
          @click="emit('start')">
          ▶ Play with Scripted Responses
        </button>
      </div>

      <!-- Footer hint -->
      <p class="footer-hint">
        AI features require Chrome 127+ (legacy API) or Chrome 138+ (built-in LanguageModel API) with the Prompt API
        flag enabled.
      </p>
    </div>
  </div>
</template>

<style scoped>
.setup-screen {
  position: fixed;
  inset: 0;
  background: #0d0d1a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 200;
}

.setup-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #4a90d9;
  border-radius: 16px;
  padding: 2rem 2.5rem;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 0 40px rgba(74, 144, 217, 0.3);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.game-title {
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 1.6rem;
  color: #e0e8ff;
  text-align: center;
  margin: 0;
  text-shadow: 0 0 20px rgba(74, 144, 217, 0.6);
}

.game-subtitle {
  text-align: center;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.45);
  margin: -0.5rem 0 0;
}

/* Alert */
.alert {
  border-radius: 10px;
  padding: 0.85rem 1rem;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.alert-warning {
  background: rgba(255, 168, 0, 0.12);
  border: 1px solid rgba(255, 168, 0, 0.4);
}

.alert-icon {
  font-size: 1.3rem;
  flex-shrink: 0;
  line-height: 1;
}

.alert-body {
  flex: 1;
}

.alert-body strong {
  display: block;
  font-size: 0.85rem;
  color: #ffa800;
  margin-bottom: 0.3rem;
}

.alert-body p {
  margin: 0;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
}

.alert-body a {
  color: #ffd054;
  text-decoration: underline;
}

/* Status panel */
.status-panel {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(74, 144, 217, 0.25);
  border-radius: 10px;
  padding: 1rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.status-label {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.55rem;
  color: #4a90d9;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.status-badge {
  font-size: 0.72rem;
  border-radius: 20px;
  padding: 3px 10px;
  font-weight: 600;
  white-space: nowrap;
}

.badge-checking {
  background: rgba(255, 152, 0, 0.15);
  color: #ff9800;
  border: 1px solid rgba(255, 152, 0, 0.4);
}

.badge-available {
  background: rgba(76, 175, 80, 0.15);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.4);
}

.badge-downloading {
  background: rgba(33, 150, 243, 0.15);
  color: #2196f3;
  border: 1px solid rgba(33, 150, 243, 0.4);
  animation: badge-pulse 1.4s ease-in-out infinite;
}

.badge-downloadable {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.4);
}

.badge-unavailable {
  background: rgba(244, 67, 54, 0.15);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.4);
}

@keyframes badge-pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.6;
  }
}

.status-message {
  margin: 0;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.5;
}

/* Progress bar */
.progress-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a90d9, #7ab8f5);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-fill.indeterminate {
  width: 40% !important;
  animation: slide-indeterminate 1.5s ease-in-out infinite;
}

@keyframes slide-indeterminate {
  0% {
    transform: translateX(-150%);
  }

  100% {
    transform: translateX(350%);
  }
}

.progress-pct {
  font-size: 0.7rem;
  color: #4a90d9;
  min-width: 36px;
  text-align: right;
}

/* Info box */
.info-box {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
}

.info-box p {
  margin: 0 0 0.4rem;
}

.info-box ol {
  margin: 0;
  padding-left: 1.2rem;
}

.info-box li {
  margin-bottom: 0.2rem;
}

.info-box code {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  padding: 1px 5px;
  font-family: monospace;
  font-size: 0.82em;
  color: #e0e8ff;
}

.info-box strong {
  color: #e0e8ff;
}

/* Buttons */
.btn {
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-start;
}

.btn-primary {
  background: rgba(74, 144, 217, 0.2);
  border: 1px solid rgba(74, 144, 217, 0.5);
  color: #90c4ff;
}

.btn-primary:hover {
  background: rgba(74, 144, 217, 0.35);
  color: #c0e0ff;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.6);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.85);
}

/* Action row */
.action-row {
  display: flex;
  justify-content: center;
}

.btn-start {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.85rem;
  padding: 0.9rem 2.5rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #4a90d9, #2d6db5);
  border: 2px solid rgba(74, 144, 217, 0.7);
  color: #fff;
  box-shadow: 0 0 20px rgba(74, 144, 217, 0.4);
  transition: all 0.2s;
  cursor: pointer;
  letter-spacing: 0.05em;
}

.btn-start:hover {
  background: linear-gradient(135deg, #5aa0e9, #3d7dc5);
  box-shadow: 0 0 30px rgba(74, 144, 217, 0.6);
  transform: translateY(-1px);
}

.btn-fallback {
  background: linear-gradient(135deg, #666, #444);
  border-color: rgba(150, 150, 150, 0.5);
  box-shadow: 0 0 12px rgba(100, 100, 100, 0.3);
  font-size: 0.7rem;
}

.btn-fallback:hover {
  background: linear-gradient(135deg, #777, #555);
  box-shadow: 0 0 18px rgba(100, 100, 100, 0.4);
}

/* Footer */
.footer-hint {
  text-align: center;
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.2);
  margin: -0.5rem 0 0;
  line-height: 1.5;
}
</style>
