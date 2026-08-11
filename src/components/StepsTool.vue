<script setup>

import { computed, ref } from 'vue'
import { modifySteps } from '../api/huami'

const MIN_RANDOM_STEPS = 25000
const MAX_RANDOM_STEPS = 50000

function createRandomSteps() {
  return Math.floor(Math.random() * (MAX_RANDOM_STEPS - MIN_RANDOM_STEPS + 1)) + MIN_RANDOM_STEPS
}

const account = ref('')
const password = ref('')
const steps = ref(createRandomSteps())
const showPassword = ref(false)
const loading = ref(false)
const statusType = ref('idle')
const statusMessage = ref('')
const currentStage = ref('')

const buttonText = computed(() => (loading.value ? '处理中…' : '修改步数'))

function randomizeSteps() {
  steps.value = createRandomSteps()
  if (!loading.value) {
    statusType.value = 'idle'
    statusMessage.value = ''
  }
}

function resetResult() {
  if (!loading.value && statusType.value !== 'idle') {
    statusType.value = 'idle'
    statusMessage.value = ''
  }
}

async function submit() {
  if (loading.value) return

  const normalizedAccount = account.value.trim()
  const parsedSteps = Number.parseInt(steps.value, 10)

  if (!normalizedAccount) {
    statusType.value = 'error'
    statusMessage.value = '请输入 Zepp Life 账号。'
    return
  }

  if (!password.value) {
    statusType.value = 'error'
    statusMessage.value = '请输入 Zepp Life 密码。'
    return
  }

  if (!Number.isInteger(parsedSteps) || parsedSteps <= 0) {
    statusType.value = 'error'
    statusMessage.value = '请输入有效的目标步数。'
    return
  }

  loading.value = true
  statusType.value = 'loading'
  currentStage.value = 'login'
  statusMessage.value = '正在登录 Zepp Life…'

  try {
    const result = await modifySteps(
      normalizedAccount,
      password.value,
      parsedSteps,
      (stage, message) => {
        currentStage.value = stage
        statusMessage.value = message
      },
    )

    statusType.value = 'success'
    currentStage.value = 'done'
    statusMessage.value = `修改成功，今日目标步数已提交为 ${Number(result.steps).toLocaleString()} 步。`
  } catch (error) {
    statusType.value = 'error'
    currentStage.value = 'error'
    statusMessage.value = error?.message || '请求失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <main class="page-shell">
    <div class="ambient ambient-one"></div>
    <div class="ambient ambient-two"></div>

    <section class="app-card">
      <div class="brand-row">
        <div class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M5 12.25 9.1 16 19 6.8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div>
          <p class="eyebrow">ZEPP LIFE</p>
          <h1>Steps Tool</h1>
        </div>
      </div>

      <p class="intro">
        输入 Zepp Life 账号、密码和目标步数。
      </p>

      <div class="notice">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
          <path d="M12 10.2v5.1M12 7.2v.15" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <span>请使用可通过账号密码登录的 Zepp Life 账号；一键登录方式不适用。</span>
      </div>

      <form class="form" @submit.prevent="submit">
        <label class="field">
          <span class="field-label">账号</span>
          <div class="input-wrap">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.8" />
              <path d="M5.5 19c.7-3.2 3.1-5 6.5-5s5.8 1.8 6.5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
            <input
              v-model="account"
              type="text"
              autocomplete="username"
              placeholder="Zepp Life 登录账号"
              :disabled="loading"
              @input="resetResult"
            />
          </div>
        </label>

        <label class="field">
          <span class="field-label">密码</span>
          <div class="input-wrap">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="5.5" y="10" width="13" height="9" rx="2" stroke="currentColor" stroke-width="1.8" />
              <path d="M8.5 10V7.8a3.5 3.5 0 0 1 7 0V10" stroke="currentColor" stroke-width="1.8" />
            </svg>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Zepp Life 登录密码"
              :disabled="loading"
              @input="resetResult"
            />
            <button
              class="icon-button"
              type="button"
              :aria-label="showPassword ? '隐藏密码' : '显示密码'"
              :title="showPassword ? '隐藏密码' : '显示密码'"
              @click="showPassword = !showPassword"
            >
              <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3.5 12s3.2-5 8.5-5 8.5 5 8.5 5-3.2 5-8.5 5-8.5-5-8.5-5Z" stroke="currentColor" stroke-width="1.7" />
                <circle cx="12" cy="12" r="2.4" stroke="currentColor" stroke-width="1.7" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m4 4 16 16M10.7 7.1c.4-.1.8-.1 1.3-.1 5.3 0 8.5 5 8.5 5a14 14 0 0 1-2.4 2.8M7.3 8.5C4.8 10 3.5 12 3.5 12s3.2 5 8.5 5c1 0 1.9-.2 2.7-.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </label>

        <label class="field">
          <span class="field-label">目标步数</span>
          <div class="steps-row">
            <div class="input-wrap steps-input">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M8.2 5.2c1.6.6 2.3 2.1 1.7 3.7L8 13.7c-.5 1.3-2 2-3.3 1.5-1.3-.5-2-2-1.5-3.3l1.9-4.8c.6-1.6 2.1-2.4 3.1-1.9ZM15.8 11c1.6-.6 3.1.2 3.7 1.8l1.3 3.5c.5 1.3-.2 2.8-1.5 3.3-1.3.5-2.8-.2-3.3-1.5l-1.3-3.5c-.6-1.6.1-3.1 1.1-3.6Z" stroke="currentColor" stroke-width="1.65" stroke-linejoin="round" />
              </svg>
              <input
                v-model.number="steps"
                type="number"
                inputmode="numeric"
                min="1"
                step="1"
                placeholder="目标步数"
                :disabled="loading"
                @input="resetResult"
              />
            </div>
            <button class="random-button" type="button" :disabled="loading" @click="randomizeSteps">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M16 4h4v4M20 4l-5.5 5.5M4 7h2.2c1.6 0 2.4.8 3.4 2.3l4.8 7.1c1 1.5 1.8 2.3 3.4 2.3H20M16 16h4v4M20 20l-5.5-5.5M4 18.7h2.2c1.6 0 2.4-.8 3.4-2.3l.7-1" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              随机
            </button>
          </div>
          <span class="field-hint">随机范围：25,000–50,000 步</span>
        </label>

        <button class="submit-button" type="submit" :disabled="loading">
          <span v-if="loading" class="spinner" aria-hidden="true"></span>
          <svg v-else viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12.5 9.3 17 19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {{ buttonText }}
        </button>
      </form>

      <Transition name="status">
        <div v-if="statusMessage" class="status-box" :class="`status-${statusType}`">
          <div class="status-icon" aria-hidden="true">
            <span v-if="statusType === 'loading'" class="spinner small"></span>
            <svg v-else-if="statusType === 'success'" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
              <path d="m8 12.2 2.6 2.6 5.5-5.7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
              <path d="m9 9 6 6M15 9l-6 6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />
            </svg>
          </div>
          <div>
            <strong>{{ statusType === 'success' ? '提交完成' : statusType === 'error' ? '请求失败' : '正在处理' }}</strong>
            <p>{{ statusMessage }}</p>
          </div>
        </div>
      </Transition>

      <div class="privacy-note">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3 5.5 5.5v5.4c0 4 2.5 7.5 6.5 9.1 4-1.6 6.5-5.1 6.5-9.1V5.5L12 3Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
          <path d="m9.4 11.8 1.7 1.7 3.6-3.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>账号和密码仅用于本次请求，不会写入浏览器本地存储</span>
      </div>
    </section>

    <footer class="site-footer">
      <p class="footer-text">Zepp Life Steps · Cloudflare Pages Functions</p>

      <a
        class="repo-link"
        href="https://github.com/DannyWongIsAvailable/Xiaomi-Steps-web.git"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open Xiaomi Steps web GitHub repository"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.23c-3.34.73-4.04-1.41-4.04-1.41-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.48.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.53.12-3.18 0 0 1-.32 3.3 1.23A11.4 11.4 0 0 1 12 5.84c1.02 0 2.04.14 3 .42 2.29-1.55 3.29-1.23 3.29-1.23.65 1.65.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.62-2.81 5.64-5.49 5.94.43.37.82 1.1.82 2.22v3.29c0 .32.22.69.83.58A12 12 0 0 0 12 .5Z"/>
        </svg>
        <span>View source on GitHub</span>
      </a>
    </footer>
  </main>
</template>


<style scoped>
.site-footer {
  margin-top: 28px;
  padding-top: 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
  text-align: center;
}

.footer-text {
  margin: 0 0 10px;
  color: #94a3b8;
  font-size: 12px;
  letter-spacing: .02em;
}

.repo-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 12px;
  text-decoration: none;
  transition: color .2s ease;
}

.repo-link svg {
  width: 14px;
  height: 14px;
}

.repo-link:hover {
  color: #2563eb;
}
</style>
