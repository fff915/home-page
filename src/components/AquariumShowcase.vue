<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({ project: { type: Object, required: true } })
const card = ref(null)
const previewVideo = ref(null)
const detailVideo = ref(null)
const dialog = ref(null)
const detailScroll = ref(null)
const selected = ref(0)
const paused = ref(false)
const visible = ref(false)
const detailOpen = ref(false)
const blocked = ref(false)
const failed = ref(false)
const slide = computed(() => props.project.slides[selected.value])
let observer
let timer
let lastChange = 0
let trigger = null

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
  try { await current.play(); blocked.value = false }
  catch { blocked.value = true }
}
function choose(index) {
  selected.value = index
  lastChange = Date.now()
}
function togglePause() {
  paused.value = !paused.value
  lastChange = Date.now()
}
async function showDetails(event) {
  trigger = event.currentTarget
  detailOpen.value = true
  document.body.classList.add('presentation-open')
  await nextTick()
  dialog.value.showModal()
  centerDetail()
  syncPlayback()
}
function closeDetails() {
  detailOpen.value = false
  document.body.classList.remove('presentation-open')
  lastChange = Date.now()
  trigger?.focus({ preventScroll: true })
  syncPlayback()
}
function centerDetail() {
  const scroll = detailScroll.value
  if (scroll) scroll.scrollLeft = (scroll.scrollWidth - scroll.clientWidth) / 2
}
function trapFocus(event) {
  if (event.key !== 'Tab') return
  const controls = [...dialog.value.querySelectorAll('button:not(:disabled)')]
  const first = controls[0]
  const last = controls.at(-1)
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
}
function visibilityChanged() { lastChange = Date.now(); syncPlayback() }
watch(selected, async () => {
  failed.value = false
  blocked.value = false
  await nextTick()
  centerDetail()
  syncPlayback()
})
watch([paused, visible], syncPlayback)
onMounted(() => {
  lastChange = Date.now()
  observer = new IntersectionObserver(([entry]) => {
    visible.value = entry.isIntersecting
    lastChange = Date.now()
  }, { threshold: .2 })
  observer.observe(card.value)
  timer = setInterval(() => {
    if (visible.value && !paused.value && !detailOpen.value && !document.hidden && Date.now() - lastChange >= 6500) {
      choose((selected.value + 1) % props.project.slides.length)
    }
  }, 500)
  document.addEventListener('visibilitychange', visibilityChanged)
})
onBeforeUnmount(() => {
  clearInterval(timer)
  observer?.disconnect()
  document.removeEventListener('visibilitychange', visibilityChanged)
  if (detailOpen.value) document.body.classList.remove('presentation-open')
})
</script>

<template>
  <section :id="project.id" ref="card" class="work-card aquarium-card" aria-labelledby="aquarium-title">
    <div class="work-heading"><div class="work-meta"><span class="project-index">03</span><span>独立游戏 · Unity</span></div><h2 id="aquarium-title">{{ project.title }}</h2><p class="work-description">{{ project.description }}</p></div>
    <div class="aquarium-showcase">
      <div class="aquarium-media" :class="slide.type" :aria-label="slide.label">
        <video v-if="slide.type === 'video'" :key="slide.src" ref="previewVideo" :src="slide.src" autoplay muted playsinline loop preload="metadata" :aria-label="slide.alt" @canplay="syncPlayback" @error="failed = true"></video>
        <img v-else :src="slide.src" :alt="slide.alt" :class="slide.fit" loading="lazy" decoding="async" @error="failed = true">
        <span class="aquarium-media-label">{{ slide.label }}</span>
        <div v-if="failed" class="player-overlay"><p>画面暂时无法加载，请刷新重试。</p></div>
        <div v-else-if="blocked && slide.type === 'video' && !detailOpen" class="player-overlay"><button class="overlay-play" type="button" @click="syncPlayback">播放互动</button></div>
      </div>
      <div class="aquarium-tabs" role="group" aria-label="选择游戏画面"><button v-for="(item, index) in project.slides" :key="item.src" type="button" :aria-pressed="selected === index" @click="choose(index)">{{ item.label }}</button></div>
      <div class="aquarium-toolbar"><span>游戏画面 · {{ paused ? '已暂停' : '自动轮播' }}</span><div><button type="button" :aria-label="paused ? '继续游戏画面轮播' : '暂停游戏画面轮播'" :aria-pressed="paused" @click="togglePause">{{ paused ? '继续' : '暂停' }}</button><button type="button" aria-label="放大桌面养鱼画面" @click="showDetails">放大画面 <span aria-hidden="true">⤢</span></button></div></div>
    </div>
  </section>
  <dialog ref="dialog" class="website-dialog aquarium-dialog" aria-labelledby="aquarium-detail-title" @close="closeDetails" @click="event => { if (event.target === dialog) dialog.close() }" @keydown="trapFocus">
    <div class="website-dialog-header"><div><h2 id="aquarium-detail-title">桌面养鱼 · {{ slide.label }}</h2><p v-if="slide.type === 'image'">左右滑动查看</p><p v-else>游戏内互动录制</p></div><div class="website-dialog-actions"><button type="button" aria-label="关闭桌面养鱼预览" autofocus @click="dialog.close()">关闭 ×</button></div></div>
    <div ref="detailScroll" class="aquarium-detail-scroll">
      <video v-if="detailOpen && slide.type === 'video'" :key="slide.src" ref="detailVideo" :src="slide.src" autoplay muted loop playsinline controls :aria-label="slide.alt" @canplay="syncPlayback" @error="failed = true"></video>
      <img v-else-if="detailOpen" :src="slide.src" :alt="slide.alt" :class="slide.fit" @load="centerDetail">
    </div>
    <div class="aquarium-tabs" role="group" aria-label="切换放大画面"><button v-for="(item, index) in project.slides" :key="item.src" type="button" :aria-pressed="selected === index" @click="choose(index)">{{ item.label }}</button></div>
  </dialog>
</template>
