<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

defineProps({ project: { type: Object, required: true } })
const card = ref(null)
const previewVideo = ref(null)
const detailVideo = ref(null)
const dialog = ref(null)
const paused = ref(false)
const visible = ref(false)
const detailOpen = ref(false)
const blocked = ref(false)
const failed = ref(false)
let observer
let trigger = null
let handoffTime = 0

async function syncPlayback() {
  await nextTick()
  const current = detailOpen.value ? detailVideo.value : previewVideo.value
  const other = detailOpen.value ? previewVideo.value : detailVideo.value
  other?.pause()
  if (!current) return
  if (paused.value || document.hidden || (!visible.value && !detailOpen.value)) {
    current.pause()
    return
  }
  current.muted = true
  try { await current.play(); blocked.value = false }
  catch (error) { if (error.name !== 'AbortError') blocked.value = true }
}
function resume() { paused.value = false; syncPlayback() }
async function showDetails(event) {
  trigger = event.currentTarget
  handoffTime = previewVideo.value?.currentTime || 0
  previewVideo.value?.pause()
  detailOpen.value = true
  document.body.classList.add('presentation-open')
  await nextTick()
  dialog.value.showModal()
  syncPlayback()
}
function detailReady() {
  if (detailVideo.value) detailVideo.value.currentTime = handoffTime
  syncPlayback()
}
function closeDetails() {
  handoffTime = detailVideo.value?.currentTime || handoffTime
  detailVideo.value?.pause()
  detailOpen.value = false
  document.body.classList.remove('presentation-open')
  if (previewVideo.value?.readyState >= 1) previewVideo.value.currentTime = handoffTime
  trigger?.focus({ preventScroll: true })
  syncPlayback()
}
function trapFocus(event) {
  if (event.key !== 'Tab') return
  const controls = [...dialog.value.querySelectorAll('button:not(:disabled)')]
  const first = controls[0]
  const last = controls.at(-1)
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
}
watch([paused, visible], syncPlayback)
onMounted(() => {
  observer = new IntersectionObserver(([entry]) => { visible.value = entry.isIntersecting }, { threshold: .05 })
  observer.observe(card.value)
  document.addEventListener('visibilitychange', syncPlayback)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  document.removeEventListener('visibilitychange', syncPlayback)
  if (detailOpen.value) document.body.classList.remove('presentation-open')
})
</script>

<template>
  <section :id="project.id" ref="card" class="work-card aquarium-card" aria-labelledby="aquarium-title">
    <div class="work-heading"><div class="work-meta"><span class="project-index">03</span><span>独立游戏 · Unity</span></div><h2 id="aquarium-title">{{ project.title }}</h2><p class="work-description">{{ project.description }}</p></div>
    <div class="aquarium-showcase">
      <div class="aquarium-media">
        <video ref="previewVideo" :src="project.video" :poster="project.poster" autoplay muted playsinline loop preload="metadata" :aria-label="project.alt" @canplay="syncPlayback" @error="failed = true"></video>
        <div v-if="failed" class="player-overlay" role="alert"><p>鱼缸暂时无法加载，请刷新重试。</p></div>
        <div v-else-if="blocked && !detailOpen" class="player-overlay"><button class="overlay-play" type="button" @click="resume">播放鱼缸</button></div>
      </div>
      <div class="aquarium-toolbar"><span>鱼缸实录 · {{ paused ? '已暂停' : '循环播放' }}</span><div><button type="button" :aria-label="paused ? '继续鱼缸播放' : '暂停鱼缸播放'" :aria-pressed="paused" :disabled="failed" @click="paused = !paused">{{ paused ? '继续' : '暂停' }}</button><button type="button" aria-label="放大鱼缸画面" @click="showDetails">放大画面 <span aria-hidden="true">⤢</span></button></div></div>
    </div>
  </section>
  <dialog ref="dialog" class="website-dialog aquarium-dialog" aria-labelledby="aquarium-detail-title" @close="closeDetails" @click="event => { if (event.target === dialog) dialog.close() }" @keydown="trapFocus">
    <div class="website-dialog-header"><div><h2 id="aquarium-detail-title">{{ project.title }}</h2><p>鱼缸实录 · 循环播放</p></div><div class="website-dialog-actions"><button type="button" :aria-label="paused ? '继续放大鱼缸播放' : '暂停放大鱼缸播放'" :aria-pressed="paused" :disabled="failed" @click="paused = !paused">{{ paused ? '继续' : '暂停' }}</button><button type="button" aria-label="关闭鱼缸预览" autofocus @click="dialog.close()">关闭 ×</button></div></div>
    <div class="aquarium-detail-media">
      <video v-if="detailOpen" ref="detailVideo" :src="project.video" :poster="project.poster" autoplay muted loop playsinline :aria-label="project.alt" @loadedmetadata="detailReady" @canplay="syncPlayback" @error="failed = true"></video>
      <div v-if="failed" class="player-overlay" role="alert"><p>鱼缸暂时无法加载，请刷新重试。</p></div>
      <div v-else-if="blocked" class="player-overlay"><button class="overlay-play" type="button" @click="resume">播放鱼缸</button></div>
    </div>
  </dialog>
</template>
