<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { featuredProject, upcomingProjects } from './data/projects'

const video = ref(null)
const playerFrame = ref(null)
const muted = ref(true)
const playing = ref(false)
const blocked = ref(false)
const failed = ref(false)
const elapsed = ref(0)
const duration = ref(0)
const expanded = ref(false)
const userPaused = ref(false)
let previousFocus = null
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
async function toggleExpanded() {
  if (!expanded.value) previousFocus = document.activeElement
  expanded.value = !expanded.value
  document.body.classList.toggle('presentation-open', expanded.value)
  await nextTick()
  if (expanded.value) playerFrame.value?.focus()
  else previousFocus?.focus()
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
    <a class="brand" href="#" aria-label="fff.plus 首页"><span class="brand-mark">f.</span><span>fff<span class="brand-plus">.plus</span></span></a>
    <nav aria-label="主导航"><a href="#works">作品</a><a href="#details">项目介绍</a><span class="header-label">个人作品集 <span aria-hidden="true">↗</span></span></nav>
  </header>

  <main id="main">
    <section class="featured" aria-labelledby="project-title">
      <div class="project-story">
        <div class="eyebrow"><span class="small-dot"></span> SELECTED WORKS <span class="eyebrow-index">01 / 03</span></div>
        <p class="hero-intro">把想法，做成能运行的作品。</p>
        <h1 id="project-title">单词<span>登科</span><span class="title-period">。</span></h1>
        <p class="hero-subtitle">在直播间里，一起闯过单词关。</p>
        <p class="hero-description">一款水墨风格的英语答题直播玩法。将评论答题、即时计分、礼物反馈与排行榜，融入一场持续进行的单词挑战。</p>
        <div class="tags" aria-label="项目技术"><span>Unity</span><span>C#</span><span>抖音直播互动</span><span>1080 × 1920</span></div>
        <div class="hero-actions"><button class="primary-button" type="button" @click="toggleExpanded">放大观看 <span aria-hidden="true">↗</span></button><a class="text-link" href="#details">了解项目 <span aria-hidden="true">↓</span></a></div>
        <div class="project-numbers"><div><strong>8,804<span>条</span></strong><p>词库内容</p></div><div><strong>7<span>席</span></strong><p>实时排行榜</p></div><div><strong>9:16</strong><p>竖屏画面</p></div></div>
      </div>

      <div class="demo-stage" :class="{ 'is-expanded': expanded }" :role="expanded ? 'dialog' : undefined" :aria-modal="expanded || undefined" aria-label="单词登科运行演示">
        <div class="stage-header"><span class="stage-caption">THE PROJECT IN MOTION</span><span class="play-status" :class="{ active: playing }"><i aria-hidden="true"></i>{{ status }}</span></div>
        <div ref="playerFrame" class="player-frame" tabindex="-1">
          <button v-if="expanded" class="close-presentation" type="button" aria-label="退出放大观看" @click="toggleExpanded">关闭 <span aria-hidden="true">×</span></button>
          <video ref="video" :src="featuredProject.video" :poster="featuredProject.poster" autoplay muted loop playsinline webkit-playsinline preload="auto" aria-label="单词登科 Unity 实机运行录屏，包含模拟答题、礼物与排名" @play="playing = true" @pause="playing = false" @timeupdate="updateTime" @loadedmetadata="updateTime" @canplay="autoPlayback" @error="mediaFailed"></video>
          <div v-if="blocked && !failed" class="player-overlay"><button type="button" class="overlay-play" @click="startPlayback"><span aria-hidden="true">▶</span> 开始观看</button></div>
          <div v-if="failed" class="player-overlay error-overlay"><p>演示暂时无法加载</p><p>请检查网络后刷新页面。</p></div>
          <div class="video-progress" aria-hidden="true"><span :style="{ width: `${progress}%` }"></span></div>
        </div>
        <div class="player-toolbar"><span class="recording-label">Unity 实机录制 <span>·</span> 模拟互动</span><div class="player-buttons"><button type="button" :aria-label="playing ? '暂停演示' : '继续演示'" :aria-pressed="!playing" :disabled="failed" @click="togglePlayback"><svg v-if="playing" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg><svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z"/></svg></button><button type="button" :aria-label="muted ? '开启声音' : '关闭声音'" :aria-pressed="!muted" :disabled="failed" @click="toggleSound"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5 5 9H2v6h3l5 4Z"/><path v-if="muted" d="m16 9 6 6m0-6-6 6"/><path v-else d="M14 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg><span>{{ muted ? '开启声音' : '声音已开启' }}</span></button></div></div>
        <p class="stage-note">打开即播放，答题与互动循环展示。</p>
      </div>
    </section>

    <section id="details" class="project-details" aria-labelledby="details-title">
      <div class="section-heading"><p class="eyebrow">BEHIND THE PROJECT</p><h2 id="details-title">从一个答案，到整个直播间的互动。</h2><p>围绕答题、反馈与排行，完成一轮连贯的游戏体验。</p></div>
      <div class="detail-grid"><article><span class="detail-number">01</span><h3>评论就是答案</h3><p>以 A / B / C / D 评论参与答题。限时判题、正确计分，配合揭晓与解析形成完整答题流程。</p></article><article><span class="detail-number">02</span><h3>互动有即时反馈</h3><p>点赞、礼物与粉丝团互动驱动画面反馈，七席排行榜呈现参与者的分数与名次。</p></article><article><span class="detail-number">03</span><h3>听见单词，也读懂例句</h3><p>内置单词与例句音频，配合音标、词性与释义展示。高中、四级、六级和考研词库可切换。</p></article></div>
      <div class="technical-note"><span>实现</span><p>Unity 原生界面与 C# 状态机 · LiveOpenSDK 指令直推 · 本地音频与词库 · 直播履约 ACK</p></div>
    </section>

    <section id="works" class="more-projects" aria-labelledby="works-title">
      <div class="works-heading"><div><p class="eyebrow">MORE TO EXPLORE</p><h2 id="works-title">更多作品，即将展示。</h2></div><span class="works-count">02 — 03</span></div>
      <div class="upcoming-grid"><article v-for="project in upcomingProjects" :key="project.id" class="upcoming-card"><div class="upcoming-meta"><span>{{ project.number }} / PROJECT</span><span class="upcoming-badge">待补充</span></div><div class="placeholder-art" aria-hidden="true"><span class="placeholder-index">{{ project.number }}</span><span class="placeholder-line"></span><span class="placeholder-square"></span></div><div class="upcoming-content"><h3>{{ project.title }}</h3><p>{{ project.description }}</p><span class="upcoming-footnote">项目介绍 · 运行演示 · 技术实现</span></div></article></div>
    </section>
  </main>

  <footer class="site-footer"><a class="brand" href="#">fff<span class="brand-plus">.plus</span></a><p>让作品自己说话。</p><a href="#main">回到顶部 <span aria-hidden="true">↑</span></a></footer>
</template>
