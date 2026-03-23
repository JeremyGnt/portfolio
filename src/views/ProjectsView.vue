<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import gsap from 'gsap'
import ProjectPreviewCard from '../components/projects/ProjectPreviewCard.vue'
import { useRevealAnimation } from '../composables/useRevealAnimation'
import { projectsData, type ProjectData } from '../data/projectsData'

const sortedProjects = computed(() =>
  [...projectsData].sort((leftProject, rightProject) => rightProject.year - leftProject.year),
)

const projectsByYear = computed(() => {
  const groupedProjects = new Map<number, ProjectData[]>()

  for (const project of sortedProjects.value) {
    const yearProjects = groupedProjects.get(project.year)

    if (yearProjects) {
      yearProjects.push(project)
      continue
    }

    groupedProjects.set(project.year, [project])
  }

  return Array.from(groupedProjects.entries()).map(([year, projects]) => ({
    year,
    projects,
  }))
})

const isInlinePreviewing = computed(() => isInlinePreviewMode.value && expandedProjectId.value !== null)
const activeProject = ref<ProjectData>(sortedProjects.value[0])
const hoveredProjectId = ref<string | null>(null)
const expandedProjectId = ref<string | null>(null)
const canUseCursorCard = ref(false)
const isInlinePreviewMode = ref(false)
const cursorCardRef = ref<HTMLElement | null>(null)
const cursorCardInnerRef = ref<HTMLElement | null>(null)

let hoverMediaQuery: MediaQueryList | null = null
let hoverMediaListener: ((event: MediaQueryListEvent) => void) | null = null
let setCardX: ((value: number) => void) | null = null
let setCardY: ((value: number) => void) | null = null
let cursorCardAnchorY = 0
let inlinePreviewRestoreScrollY: number | null = null
let shouldRestoreInlinePreviewScroll = false
let lastPointerX = 0
let lastPointerY = 0

const CURSOR_CARD_X_PERCENT = -50
const CURSOR_CARD_DEFAULT_Y_PERCENT = -50
const CURSOR_CARD_BADGE_OFFSET = 10
const CURSOR_CARD_VIEWPORT_MARGIN = 16

useRevealAnimation(100, '.projects-reveal')

function syncHoverCapability() {
  const shouldUseCursorCard = hoverMediaQuery?.matches ?? false

  canUseCursorCard.value = shouldUseCursorCard
  isInlinePreviewMode.value = !shouldUseCursorCard
  hoveredProjectId.value = null

  if (shouldUseCursorCard) {
    expandedProjectId.value = null
    inlinePreviewRestoreScrollY = null
    shouldRestoreInlinePreviewScroll = false
    return
  }

  hideCursorCard()
}

function moveCursorCard(clientX: number, clientY: number) {
  if (!canUseCursorCard.value || !setCardX || !setCardY) {
    return
  }

  lastPointerX = clientX
  lastPointerY = clientY

  if (cursorCardAnchorY <= 0) {
    setCardX(clientX)
    setCardY(clientY)
    return
  }

  const firstProjectId = sortedProjects.value[0]?.id
  const isFirstProjectHovered = hoveredProjectId.value === firstProjectId
  const minY = cursorCardAnchorY + CURSOR_CARD_VIEWPORT_MARGIN
  const clampedY = isFirstProjectHovered ? Math.max(clientY, minY) : clientY

  setCardX(clientX)
  setCardY(clampedY)
}

function syncCursorCardAnchor() {
  if (!cursorCardRef.value) {
    return
  }

  const cardElement = cursorCardRef.value.querySelector<HTMLElement>('.project-preview-card')
  const badgeListElement = cursorCardRef.value.querySelector<HTMLElement>('.project-preview-card__badge-list--media')

  if (!cardElement || !badgeListElement) {
    gsap.set(cursorCardRef.value, {
      xPercent: CURSOR_CARD_X_PERCENT,
      yPercent: CURSOR_CARD_DEFAULT_Y_PERCENT,
    })
    return
  }

  const cardRect = cardElement.getBoundingClientRect()
  const badgeListRect = badgeListElement.getBoundingClientRect()
  const measuredCardHeight = cardElement.offsetHeight || cardRect.height

  if (measuredCardHeight <= 0 || cardRect.height <= 0) {
    return
  }

  const anchorRatio = Math.min(
    1,
    Math.max(
      0,
      (badgeListRect.bottom - cardRect.top + CURSOR_CARD_BADGE_OFFSET) / cardRect.height,
    ),
  )
  const anchorY = Math.min(measuredCardHeight - 24, Math.max(0, anchorRatio * measuredCardHeight))

  cursorCardAnchorY = anchorY

  gsap.set(cursorCardRef.value, {
    xPercent: CURSOR_CARD_X_PERCENT,
    yPercent: -(anchorY / measuredCardHeight) * 100,
  })
}

function showCursorCard(project: ProjectData, event: MouseEvent) {
  if (!canUseCursorCard.value || isInlinePreviewMode.value || !cursorCardRef.value) {
    return
  }

  activeProject.value = project
  hoveredProjectId.value = project.id

  moveCursorCard(event.clientX, event.clientY)

  gsap.killTweensOf(cursorCardRef.value)
  gsap.to(cursorCardRef.value, {
    scale: 1,
    autoAlpha: 1,
    duration: 0.5,
    ease: 'back.out(1.2)',
    overwrite: true,
  })
}

function hideCursorCard() {
  hoveredProjectId.value = null

  if (cursorCardRef.value) {
    gsap.killTweensOf(cursorCardRef.value)
    gsap.to(cursorCardRef.value, {
      scale: 0.5,
      autoAlpha: 0,
      duration: 0.35,
      ease: 'power2.in',
      overwrite: true,
    })
  }

  if (cursorCardInnerRef.value) {
    gsap.to(cursorCardInnerRef.value, {
      xPercent: 0,
      yPercent: 0,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: true,
    })
  }
}

function handleWindowMouseMove(event: MouseEvent) {
  moveCursorCard(event.clientX, event.clientY)
}

function handleWindowResize() {
  syncCursorCardAnchor()

  if (hoveredProjectId.value !== null) {
    moveCursorCard(lastPointerX, lastPointerY)
  }
}

function handleProjectFocus(project: ProjectData) {
  activeProject.value = project
}

function getProjectTitleParts(title: string) {
  const trimmedTitle = title.trim()
  const splitIndex = trimmedTitle.lastIndexOf(' ')

  if (splitIndex === -1) {
    return {
      lead: '',
      tail: trimmedTitle,
    }
  }

  return {
    lead: trimmedTitle.slice(0, splitIndex),
    tail: trimmedTitle.slice(splitIndex + 1),
  }
}

function getProjectPreviewId(projectId: string) {
  return `project-inline-preview-${projectId}`
}

function isInlinePreviewVisible(project: ProjectData) {
  return isInlinePreviewMode.value && expandedProjectId.value === project.id
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function revealInlinePreview(projectId: string) {
  const previewElement = document.getElementById(getProjectPreviewId(projectId))

  if (!previewElement) {
    return
  }

  previewElement.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'nearest',
    inline: 'nearest',
  })
}

function handleInlinePreviewEnter(element: Element, done: () => void) {
  const previewElement = element as HTMLElement
  const duration = prefersReducedMotion() ? 0 : 0.34

  gsap.killTweensOf(previewElement)
  previewElement.style.willChange = 'height, opacity, transform'

  gsap.fromTo(
    previewElement,
    { height: 0, autoAlpha: 0, y: -14 },
    {
      height: previewElement.scrollHeight,
      autoAlpha: 1,
      y: 0,
      duration,
      ease: 'power2.out',
      onComplete: () => {
        previewElement.style.height = 'auto'
        previewElement.style.willChange = ''
        done()
      },
    },
  )
}

function handleInlinePreviewLeave(element: Element, done: () => void) {
  const previewElement = element as HTMLElement
  const duration = prefersReducedMotion() ? 0 : 0.26
  const shouldRestoreScroll = shouldRestoreInlinePreviewScroll && inlinePreviewRestoreScrollY !== null
  const scrollState = {
    y: window.scrollY || document.documentElement.scrollTop,
  }

  gsap.killTweensOf(previewElement)
  previewElement.style.willChange = 'height, opacity, transform'

  if (shouldRestoreScroll) {
    if (duration === 0) {
      window.scrollTo({ top: inlinePreviewRestoreScrollY, left: 0, behavior: 'auto' })
    } else {
      gsap.to(scrollState, {
        y: inlinePreviewRestoreScrollY,
        duration,
        ease: 'power2.inOut',
        overwrite: true,
        onUpdate: () => {
          window.scrollTo({ top: scrollState.y, left: 0, behavior: 'auto' })
        },
      })
    }
  }

  gsap.fromTo(
    previewElement,
    { height: previewElement.offsetHeight, autoAlpha: 1, y: 0 },
    {
      height: 0,
      autoAlpha: 0,
      y: -12,
      duration,
      ease: 'power2.inOut',
      onComplete: () => {
        previewElement.style.willChange = ''
        hoveredProjectId.value = null
        inlinePreviewRestoreScrollY = null
        shouldRestoreInlinePreviewScroll = false
        done()
      },
    },
  )
}

function handleProjectClick(project: ProjectData, event?: MouseEvent) {
  activeProject.value = project

  if (isInlinePreviewMode.value) {
    hoveredProjectId.value = null

    const previousExpandedProjectId = expandedProjectId.value
    const isClosingCurrentPreview = previousExpandedProjectId === project.id

    shouldRestoreInlinePreviewScroll = isClosingCurrentPreview

    if (!isClosingCurrentPreview) {
      inlinePreviewRestoreScrollY = window.scrollY || document.documentElement.scrollTop
    }

    expandedProjectId.value = isClosingCurrentPreview ? null : project.id

    ;(event?.currentTarget as HTMLButtonElement | null)?.blur()

    if (!isClosingCurrentPreview && expandedProjectId.value === project.id) {
      void nextTick(() => {
        revealInlinePreview(project.id)
      })
    }

    return
  }

  if (project.externalUrl) {
    window.open(project.externalUrl, '_blank', 'noopener,noreferrer')
  }
}

function isProjectActive(project: ProjectData) {
  return hoveredProjectId.value === project.id || expandedProjectId.value === project.id
}

watch(
  activeProject,
  async () => {
    await nextTick()
    syncCursorCardAnchor()

    if (hoveredProjectId.value !== null) {
      moveCursorCard(lastPointerX, lastPointerY)
    }

    if (!canUseCursorCard.value || !cursorCardInnerRef.value) {
      return
    }

    gsap.fromTo(
      cursorCardInnerRef.value,
      { y: 18, opacity: 0.86 },
      {
        y: 0,
        opacity: 1,
        duration: 0.28,
        ease: 'power2.out',
        overwrite: true,
      },
    )
  },
  { flush: 'post' },
)

onMounted(async () => {
  document.body.classList.add('route-projects')

  hoverMediaQuery = window.matchMedia('(min-width: 1025px) and (any-hover: hover) and (any-pointer: fine)')
  syncHoverCapability()
  lastPointerX = window.innerWidth * 0.5
  lastPointerY = window.innerHeight * 0.5

  hoverMediaListener = () => {
    syncHoverCapability()
  }

  if ('addEventListener' in hoverMediaQuery) {
    hoverMediaQuery.addEventListener('change', hoverMediaListener)
  } else {
    hoverMediaQuery.addListener(hoverMediaListener)
  }

  await nextTick()

  if (cursorCardRef.value) {
    gsap.set(cursorCardRef.value, {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.5,
      xPercent: CURSOR_CARD_X_PERCENT,
      yPercent: CURSOR_CARD_DEFAULT_Y_PERCENT,
      autoAlpha: 0,
      scale: 0.5,
      transformOrigin: '50% 50%',
      willChange: 'transform, opacity',
    })

    syncCursorCardAnchor()
    setCardX = gsap.quickSetter(cursorCardRef.value, 'x', 'px')
    setCardY = gsap.quickSetter(cursorCardRef.value, 'y', 'px')
  }

  window.addEventListener('mousemove', handleWindowMouseMove, { passive: true })
  window.addEventListener('resize', handleWindowResize, { passive: true })
  window.addEventListener('blur', hideCursorCard)
})

onUnmounted(() => {
  document.body.classList.remove('route-projects')

  if (hoverMediaQuery && hoverMediaListener) {
    if ('removeEventListener' in hoverMediaQuery) {
      hoverMediaQuery.removeEventListener('change', hoverMediaListener)
    } else {
      hoverMediaQuery.removeListener(hoverMediaListener)
    }
  }

  window.removeEventListener('mousemove', handleWindowMouseMove)
  window.removeEventListener('resize', handleWindowResize)
  window.removeEventListener('blur', hideCursorCard)
  setCardX = null
  setCardY = null
})
</script>

<template>
  <div class="pages-wrapper">
    <section class="page active">
      <div class="page-inner projects-page">
        <div class="projects-reveal reveal">
          <div class="projects-hover-shell relative">
            <div :class="['projects-list', { 'is-hovering': hoveredProjectId !== null, 'is-inline-previewing': isInlinePreviewing }]">
              <section
                v-for="yearGroup in projectsByYear"
                :key="yearGroup.year"
                class="project-year-group"
              >
                <header class="project-year-group__header">
                  <span class="project-year-group__label">Année</span>
                  <h2 class="project-year-group__year">{{ yearGroup.year }}</h2>
                </header>

                <div class="project-year-group__rows">
                  <div
                    v-for="project in yearGroup.projects"
                    :key="project.id"
                    class="project-row-stack"
                  >
                    <button
                      type="button"
                      :class="[
                        'project-row',
                        {
                          'is-active': isProjectActive(project),
                          'is-inline-expanded': isInlinePreviewVisible(project),
                        },
                      ]"
                      :aria-expanded="isInlinePreviewMode ? isInlinePreviewVisible(project) : undefined"
                      :aria-controls="isInlinePreviewMode ? getProjectPreviewId(project.id) : undefined"
                      @mouseenter="showCursorCard(project, $event)"
                      @mouseleave="hideCursorCard"
                      @focus="handleProjectFocus(project)"
                      @click="handleProjectClick(project, $event)"
                    >
                      <span class="project-row__edge project-row__edge--left" aria-hidden="true">►</span>

                      <div class="project-row__content">
                        <div class="min-w-0">
                          <h3 class="project-row__title">
                            <span v-if="getProjectTitleParts(project.title).lead" class="project-row__title-lead">
                              {{ getProjectTitleParts(project.title).lead }}
                            </span>
                            <span class="project-row__title-tail">
                              <span>{{ getProjectTitleParts(project.title).tail }}</span>
                              <span class="project-row__dot" aria-hidden="true"></span>
                            </span>
                          </h3>
                        </div>

                        <div class="project-row__meta">
                          <div class="project-row__tags">
                            <span
                              v-for="tag in project.listTags"
                              :key="tag"
                              class="font-display text-[0.68rem] uppercase tracking-[0.24em] text-white/48"
                            >
                              {{ tag }}
                            </span>
                          </div>

                          <span v-if="isInlinePreviewMode" class="project-row__action" aria-hidden="true">
                            <span>{{ isInlinePreviewVisible(project) ? 'Masquer' : 'Apercu' }}</span>
                            <ChevronDown :size="16" />
                          </span>
                        </div>
                      </div>

                      <span class="project-row__edge project-row__edge--right" aria-hidden="true">◄</span>
                    </button>

                    <Transition
                      @enter="handleInlinePreviewEnter"
                      @leave="handleInlinePreviewLeave"
                    >
                      <div
                        v-if="isInlinePreviewVisible(project)"
                        :id="getProjectPreviewId(project.id)"
                        class="project-inline-preview"
                        role="region"
                        :aria-label="`Apercu du projet ${project.title}`"
                      >
                        <div class="project-inline-preview__inner">
                          <ProjectPreviewCard :project="project" mode="inline" />
                        </div>
                      </div>
                    </Transition>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <Teleport to="body">
    <div
      v-show="canUseCursorCard"
      ref="cursorCardRef"
      class="project-cursor-card"
      aria-hidden="true"
    >
      <div ref="cursorCardInnerRef" class="project-cursor-card__inner">
        <ProjectPreviewCard :project="activeProject" />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.projects-page {
  position: relative;
  isolation: isolate;
}

.projects-hover-shell {
  position: relative;
}

.projects-list {
  position: relative;
  margin-top: 1.95rem;
}

.project-year-group {
  position: relative;
  display: grid;
  grid-template-columns: minmax(4.5rem, 6.2rem) minmax(0, 1fr);
  gap: 1.25rem;
}

.project-year-group__header {
  position: sticky;
  top: 7.5rem;
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1.35rem 0;
}

.project-year-group__label,
.project-year-group__year {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-weight: 600;
  text-transform: uppercase;
}

.project-year-group__label {
  font-size: 0.68rem;
  letter-spacing: 0.24em;
  color: rgba(255, 255, 255, 0.36);
}

.project-year-group__year {
  margin: 0;
  font-size: clamp(0.82rem, 1.28vw, 1rem);
  letter-spacing: 0.15em;
  color: #ebb207;
}

.project-year-group__rows {
  min-width: 0;
}

.project-row-stack {
  position: relative;
}

.projects-list::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.04) 14%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0.04) 86%,
    rgba(255, 255, 255, 0) 100%
  );
}

.projects-list.is-hovering .project-row {
  opacity: 0.3;
}

.projects-list.is-hovering .project-row.is-active,
.projects-list.is-hovering .project-row:focus-visible {
  opacity: 1;
}

.projects-list.is-inline-previewing .project-row {
  opacity: 0.26;
}

.projects-list.is-inline-previewing .project-row.is-active {
  opacity: 1;
}

.project-row {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  padding: 1.35rem 1.85rem;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  position: relative;
  z-index: 10;
  transition:
    opacity 0.4s ease,
    transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.project-row::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.035) 14%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.035) 86%,
    rgba(255, 255, 255, 0) 100%
  );
}

.project-row:focus-visible {
  outline: none;
}

.project-row__content {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  transform: translate3d(0, 0, 0);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.project-row__meta {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 1rem;
  min-width: 0;
}

.project-row__edge {
  position: absolute;
  top: 50%;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1;
  color: #ffffff;
  opacity: 0;
  transition:
    opacity 0.28s ease,
    transform 0.38s cubic-bezier(0.4, 0, 0.2, 1);
}

.project-row__edge--left {
  left: 0;
  transform: translate3d(-10px, -50%, 0);
}

.project-row__edge--right {
  right: 0;
  transform: translate3d(10px, -50%, 0);
}

.project-row__tags span {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.project-row__title {
  display: block;
  margin: 0.65rem 0 0;
  font-size: clamp(1.9rem, 4.9vw, 4.4rem);
  font-weight: 600;
  line-height: 0.94;
  letter-spacing: -0.08em;
  color: #ffffff;
  transition:
    color 0.4s ease,
    text-shadow 0.4s ease,
    -webkit-text-stroke-color 0.4s ease;
}

.project-row__title-lead {
  margin-right: 0.18em;
}

.project-row__title-tail {
  display: inline-flex;
  align-items: baseline;
  gap: 0.08em;
  white-space: nowrap;
}

.project-row__dot {
  display: inline-block;
  width: 0.18em;
  height: 0.18em;
  flex: 0 0 auto;
  border-radius: 999px;
  background: #ebb207;
  transform: translateY(0.01em);
}

.project-row__tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.85rem;
  max-width: 16rem;
  padding-bottom: 0.45rem;
}

.project-row__action {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-left: auto;
  padding: 0.38rem 0.78rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.64);
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 0.64rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  transition:
    background-color 0.25s ease,
    color 0.25s ease;
}

.project-row__action :deep(svg) {
  transition: transform 0.28s ease;
}

.project-row.is-active {
  transform: translateX(20px);
  z-index: 60;
}

.project-row.is-active .project-row__content,
.project-row:focus-visible .project-row__content {
  transform: translate3d(0, 0, 0);
}

.project-row.is-active .project-row__edge,
.project-row:focus-visible .project-row__edge {
  opacity: 1;
}

.project-row.is-active .project-row__edge--left,
.project-row:focus-visible .project-row__edge--left {
  transform: translate3d(0, -50%, 0);
}

.project-row.is-active .project-row__edge--right,
.project-row:focus-visible .project-row__edge--right {
  transform: translate3d(0, -50%, 0);
}

.project-row.is-active .project-row__title,
.project-row:focus-visible .project-row__title {
  color: transparent;
  -webkit-text-stroke: 1px #ffffff;
}

.project-row.is-active .project-row__tags span,
.project-row:focus-visible .project-row__tags span {
  color: #ebb207;
}

.project-row.is-inline-expanded {
  transform: none;
}

.project-row.is-inline-expanded .project-row__action {
  background: rgba(235, 178, 7, 0.12);
  color: #ebb207;
}

.project-row.is-inline-expanded .project-row__action :deep(svg) {
  transform: rotate(180deg);
}

.project-row.is-inline-expanded .project-row__edge {
  display: none;
}

.project-inline-preview {
  overflow: hidden;
  padding: 0 1.25rem 1.35rem;
}

.project-inline-preview__inner {
  padding-top: 0.1rem;
}

.project-cursor-card {
  position: fixed;
  top: 0;
  left: 0;
  width: 420px;
  max-width: min(420px, calc(100vw - 2rem));
  height: auto;
  pointer-events: none;
  z-index: 1300;
  opacity: 0;
  transform: scale(0.5);
  transform-origin: center center;
}

.project-cursor-card__inner {
  width: 100%;
  height: auto;
}

@media (max-width: 1024px) {
  .page {
    padding-top: 0;
  }

  .projects-page {
    padding-top: 0;
  }

  .projects-hover-shell {
    padding-top: 5.25rem;
  }

  .projects-list {
    margin-top: 0;
  }

  .project-year-group {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .project-year-group__header {
    position: static;
    padding-bottom: 0.4rem;
  }

  .project-year-group:first-child .project-year-group__header {
    padding-top: 0;
  }

  .project-row {
    grid-template-columns: 1fr;
    gap: 0.8rem;
    padding: 1.1rem 1.25rem 1.2rem;
    border-radius: 1.35rem;
  }

  .project-row__content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.95rem;
  }

  .project-row__meta {
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 0.85rem;
    flex-wrap: wrap;
  }

  .project-row__tags {
    justify-content: flex-start;
    max-width: none;
    padding-bottom: 0;
  }

  .project-row.is-active {
    transform: none;
  }

  .projects-list.is-inline-previewing .project-row {
    opacity: 0.34;
  }

  .projects-list.is-inline-previewing .project-row.is-active {
    opacity: 1;
  }

  .project-row__edge {
    display: none;
  }
}

@media (max-width: 640px) {
  .project-row__title {
    font-size: clamp(1.7rem, 9vw, 2.9rem);
  }

  .project-inline-preview {
    padding: 0 1rem 1.15rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-row,
  .project-row__content,
  .project-row__edge,
  .project-row__title,
  .project-row__action,
  .project-row__action :deep(svg) {
    transition: none;
  }
}
</style>
