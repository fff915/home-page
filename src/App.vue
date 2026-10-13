<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { aquariumProject, featuredProject, websiteProject } from './data/projects'
import AquariumShowcase from './components/AquariumShowcase.vue'

const video = ref(null)
const playerFrame = ref(null)
const websiteDialog = ref(null)
const muted = ref(true)
const playing = ref(false)
const blocked = ref(false)
const failed = ref(false)
const elapsed = ref(0)
const duration = ref(0)
const expanded = ref(false)
const userPaused = ref(false)
let previousFocus = null
let websitePreviousFocus = null
const progress = computed(() => duration.value ? elapsed.value / duration.value * 100 : 0)
const status = computed(() => failed.value ? '演示暂时无法加载' : blocked.value ? '点击开始演示' : playing.value ? '正在自动演示' : '演示已暂停')

async function startPlayback() {
  if (!video.value || failed.value) return
  try {
    await video.value.play()
    blocked.value = false
  } catch {
    blocked.value = true
    playing.value = false
  }
}
async function togglePlayback() {
  if (video.value?.paused) {
    userPaused.value = false
    await startPlayback()
  } else {
    userPaused.value = true
    video.value?.pause()
  }
}
async function toggleSound() {
  if (!video.value) return
  muted.value = !muted.value
  video.value.muted = muted.value
  if (video.value.paused) await startPlayback()
}
function updateTime() {
  elapsed.value = video.value?.currentTime || 0
  duration.value = Number.isFinite(video.value?.duration) ? video.value.duration : 0
}
async function toggleExpanded(event) {
  if (!expanded.value) previousFocus = event?.currentTarget || document.activeElement
  expanded.value = !expanded.value
  document.body.classList.toggle('presentation-open', expanded.value)
  await nextTick()
  if (expanded.value) playerFrame.value?.focus()
  else if (previousFocus?.isConnected) previousFocus.focus()
  else document.querySelector('.expand-button')?.focus()
}
function handleEscape(event) {
  if (event.key === 'Escape' && expanded.value) toggleExpanded()
  if (event.key === 'Tab' && expanded.value) {
    const controls = [...document.querySelectorAll('.is-expanded button:not(:disabled)')]
    const current = controls.indexOf(document.activeElement)
    if (event.shiftKey && current <= 0) {
      event.preventDefault()
      controls.at(-1)?.focus()
    } else if (!event.shiftKey && (current === controls.length - 1 || current === -1)) {
      event.preventDefault()
      controls[0]?.focus()
    }
  }
}
function autoPlayback() {
  if (!userPaused.value && !document.hidden) startPlayback()
}
function visibilityChanged() {
  if (document.hidden) video.value?.pause()
  else autoPlayback()
}
function mediaFailed() {
  failed.value = true
  playing.value = false
}
function openWebsitePreview(event) {
  websitePreviousFocus = event?.currentTarget || document.activeElement
  websiteDialog.value?.showModal()
  document.body.classList.add('presentation-open')
}
function websitePreviewClosed() {
  if (!expanded.value) document.body.classList.remove('presentation-open')
  websitePreviousFocus?.focus({ preventScroll: true })
}
function closeWebsiteBackdrop(event) {
  if (event.target === websiteDialog.value) websiteDialog.value.close()
}
function handleWebsiteKeys(event) {
  if (event.key !== 'Tab') return
  const controls = [...websiteDialog.value.querySelectorAll('a[href], button:not(:disabled)')]
  const first = controls[0]
  const last = controls.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
onMounted(() => {
  if (video.value) video.value.muted = true
  startPlayback()
  document.addEventListener('keydown', handleEscape)
  document.addEventListener('visibilitychange', visibilityChanged)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape)
  document.removeEventListener('visibilitychange', visibilityChanged)
  document.body.classList.remove('presentation-open')
})
</script>

<template>
  <a class="skip-link" href="#main">跳到作品展示</a>
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="#main"><span class="brand-mark" aria-hidden="true">作</span><h1>个人作品集</h1></a>
      <nav aria-label="作品导航"><a href="#word-dengke"><span>01</span> 单词登科</a><a href="#tc888"><span>02</span> 赛事看板</a><a href="#project-03"><span>03</span> 桌面养鱼</a></nav>
    </div>
  </header>

  <main id="main">
    <div id="works" class="works-grid">
    <section id="word-dengke" class="work-card featured" aria-labelledby="project-title">
      <div class="work-heading">
        <div class="work-meta"><span class="project-index">01</span><span>Unity · C#</span></div>
        <h2 id="project-title">单词登科</h2>
        <p class="work-description">直播答题、实时计分与互动排行。</p>
      </div>
      <div class="demo-stage" :class="{ 'is-expanded': expanded }" :role="expanded ? 'dialog' : undefined" :aria-modal="expanded || undefined" aria-label="单词登科运行演示">
        <div class="stage-header"><span>实机录制 · 模拟互动</span><span class="play-status" :class="{ active: playing }"><i aria-hidden="true"></i>{{ status }}</span></div>
        <div ref="playerFrame" class="player-frame" tabindex="-1">
          <button v-if="expanded" class="close-presentation" type="button" aria-label="退出放大观看" @click="toggleExpanded">关闭 <span aria-hidden="true">×</span></button>
          <video ref="video" :src="featuredProject.video" :poster="featuredProject.poster" autoplay muted loop playsinline webkit-playsinline preload="auto" aria-label="单词登科 Unity 实机运行录屏，包含模拟答题、礼物与排名" @play="playing = true" @pause="playing = false" @timeupdate="updateTime" @loadedmetadata="updateTime" @canplay="autoPlayback" @error="mediaFailed"></video>
          <div v-if="blocked && !failed" class="player-overlay"><button type="button" class="overlay-play" @click="startPlayback"><span aria-hidden="true">▶</span> 开始观看</button></div>
          <div v-if="failed" class="player-overlay error-overlay"><p>演示暂时无法加载</p><p>请检查网络后刷新页面。</p></div>
          <div class="video-progress" aria-hidden="true"><span :style="{ width: `${progress}%` }"></span></div>
        </div>
        <div class="player-toolbar"><div class="player-buttons"><button type="button" :aria-label="playing ? '暂停演示' : '继续演示'" :aria-pressed="!playing" :disabled="failed" @click="togglePlayback"><svg v-if="playing" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg><svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z"/></svg></button><button type="button" :aria-label="muted ? '开启声音' : '关闭声音'" :aria-pressed="!muted" :disabled="failed" @click="toggleSound"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5 5 9H2v6h3l5 4Z"/><path v-if="muted" d="m16 9 6 6m0-6-6 6"/><path v-else d="M14 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg><span>{{ muted ? '开启声音' : '关闭声音' }}</span></button></div><button v-if="!expanded" class="expand-button" type="button" @click="toggleExpanded">放大观看 <span aria-hidden="true">⤢</span></button></div>
      </div>
    </section>

      <section :id="websiteProject.id" class="work-card website-project" aria-labelledby="website-title">
        <div class="work-heading">
          <div class="work-meta"><span class="project-index">02</span><span>个人开发 · Web</span></div>
          <h2 id="website-title">{{ websiteProject.title }}</h2>
          <p class="work-description">{{ websiteProject.description }}</p>
        </div>
        <div class="website-visual">
          <button type="button" class="website-screenshot" aria-label="放大赛事看板首页截图" @click="openWebsitePreview">
            <picture><img :src="websiteProject.mobileImage" width="390" height="844" loading="lazy" decoding="async" alt="赛事看板手机首页：足球与篮球导航、日期筛选及赛事列表"></picture>
            <span class="screenshot-zoom">查看大图 <span aria-hidden="true">⤢</span></span>
          </button>
          <p class="screenshot-caption">首页截图 · {{ websiteProject.capturedAt }}</p>
        </div>
        <div class="website-actions"><a class="primary-button" :href="websiteProject.url" target="_blank" rel="noopener noreferrer" aria-label="打开赛事看板（新标签页）">打开作品 <span aria-hidden="true">↗</span></a><button class="secondary-button" type="button" @click="openWebsitePreview">放大首页 <span aria-hidden="true">⤢</span></button></div>
      </section>

      <AquariumShowcase :project="aquariumProject" />
    </div>
  </main>

  <dialog ref="websiteDialog" class="website-dialog" aria-labelledby="website-preview-title" @close="websitePreviewClosed" @click="closeWebsiteBackdrop" @keydown="handleWebsiteKeys">
    <div class="website-dialog-header"><div><h2 id="website-preview-title">赛事看板</h2><p>首页截图 · {{ websiteProject.capturedAt }}</p></div><div class="website-dialog-actions"><a :href="websiteProject.url" target="_blank" rel="noopener noreferrer" aria-label="打开赛事看板（新标签页）">打开作品 ↗</a><button type="button" aria-label="关闭首页预览" autofocus @click="websiteDialog.close()">关闭 ×</button></div></div>
    <div class="website-dialog-image"><picture><source media="(max-width: 760px)" :srcset="websiteProject.mobileImage" width="390" height="844"><img :src="websiteProject.desktopImage" width="820" height="940" loading="lazy" decoding="async" alt="赛事看板首页截图，展示赛事导航、日期筛选和比赛信息"></picture></div>
  </dialog>

  <footer class="site-footer"><p>让作品自己说话。</p><a href="#main">回到顶部 <span aria-hidden="true">↑</span></a></footer>
</template>
