<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import ExperienceSceneCard from '../components/experience/ExperienceSceneCard.vue'
import { useExperienceSceneAnimation } from '../composables/useExperienceSceneAnimation'
import { experiencesPageData } from '../data/experiencesData'

const mobileExperienceBreakpoint = '(max-width: 720px)'
const hero = experiencesPageData.hero
const cards = experiencesPageData.cards
const cardSlots = ['left', 'center', 'right'] as const
const mobileStackOffsets = ['-5rem', '-2.5rem', '0rem']
const mobileStackScales = ['1', '1', '1']
const mobilePeekBottoms = ['0.95rem', '0rem']
const mobilePeekScales = ['1', '1']

const { scrollTrackRef, cardsStageRef, mainTitleRef, scrollHintRef, scrollToCardsStage, setCardRef } =
  useExperienceSceneAnimation()

const isMobileExperienceViewport = ref(false)
const mobileActiveCardId = ref<string | null>(null)
const isMobileWalletFocused = computed(
  () => isMobileExperienceViewport.value && mobileActiveCardId.value !== null,
)

let mobileViewportQuery: MediaQueryList | null = null
let mobileViewportListener: ((event: MediaQueryListEvent) => void) | null = null

const syncMobileViewport = (matches: boolean) => {
  isMobileExperienceViewport.value = matches
  document.body.classList.toggle('route-experience-mobile-lock', matches)

  if (!matches) {
    mobileActiveCardId.value = null
  }
}

const getRemainingMobileCardIndices = () =>
  cards
    .map((card, index) => ({ id: card.id, index }))
    .filter(({ id }) => id !== mobileActiveCardId.value)
    .sort((left, right) => right.index - left.index)

const getMobilePeekIndex = (cardId: string) =>
  getRemainingMobileCardIndices().findIndex(({ id }) => id === cardId)

const getCardShellClass = (cardId: string) => {
  if (!isMobileExperienceViewport.value) {
    return null
  }

  if (!mobileActiveCardId.value) {
    return 'experience-card-shell--mobile-stack'
  }

  return mobileActiveCardId.value === cardId
    ? 'experience-card-shell--mobile-active'
    : 'experience-card-shell--mobile-peek'
}

const getCardShellStyle = (cardId: string, cardIndex: number) => {
  if (!isMobileExperienceViewport.value) {
    return { zIndex: `${cardIndex + 2}` }
  }

  const isActiveCard = mobileActiveCardId.value === cardId
  const peekIndex = getMobilePeekIndex(cardId)
  const resolvedPeekIndex = peekIndex === -1 ? 0 : peekIndex

  return {
    zIndex: isActiveCard ? '30' : `${18 - resolvedPeekIndex}`,
    '--mobile-stack-offset': mobileStackOffsets[cardIndex] ?? '0px',
    '--mobile-stack-scale': mobileStackScales[cardIndex] ?? '1',
    '--mobile-peek-bottom': mobilePeekBottoms[resolvedPeekIndex] ?? mobilePeekBottoms[0],
    '--mobile-peek-scale': mobilePeekScales[resolvedPeekIndex] ?? mobilePeekScales[0],
  }
}

const handleMobileCardInteraction = (cardId: string) => {
  if (!isMobileExperienceViewport.value) {
    return
  }

  if (!mobileActiveCardId.value) {
    mobileActiveCardId.value = cardId
    return
  }

  if (mobileActiveCardId.value !== cardId) {
    mobileActiveCardId.value = null
  }
}

const handleMobileCardKeydown = (event: KeyboardEvent, cardId: string) => {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return
  }

  event.preventDefault()
  handleMobileCardInteraction(cardId)
}

onMounted(() => {
  document.body.classList.add('route-experience')

  mobileViewportQuery = window.matchMedia(mobileExperienceBreakpoint)
  syncMobileViewport(mobileViewportQuery.matches)
  mobileViewportListener = (event) => syncMobileViewport(event.matches)
  mobileViewportQuery.addEventListener('change', mobileViewportListener)
})

onUnmounted(() => {
  document.body.classList.remove('route-experience')
  document.body.classList.remove('route-experience-mobile-lock')

  if (mobileViewportQuery && mobileViewportListener) {
    mobileViewportQuery.removeEventListener('change', mobileViewportListener)
    mobileViewportQuery = null
    mobileViewportListener = null
  }
})
</script>

<template>
  <div class="pages-wrapper">
    <section class="page active experience-page">
      <div class="page-inner experience-page__inner">
        <div
          class="experience-scene"
          :class="{
            'experience-scene--mobile-wallet': isMobileExperienceViewport,
            'experience-scene--mobile-focus': isMobileWalletFocused,
          }"
        >
          <button
            v-if="!isMobileExperienceViewport"
            ref="scrollHintRef"
            class="scroll-hint"
            type="button"
            aria-label="Descendre vers les cartes d'experience"
            @click="scrollToCardsStage"
          >
            <svg
              class="scroll-hint__arrow"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M12 5v14" />
              <path d="m19 12-7 7-7-7" />
            </svg>
          </button>

          <div ref="scrollTrackRef" class="scroll-track">
            <div class="sticky-wrap">
              <div ref="mainTitleRef" class="scene-hero">
                <h1>
                  {{ hero.title }}
                  <br />
                  <span class="scene-hero__highlight">{{ hero.highlight }}</span
                  ><span class="scene-hero__dot" aria-hidden="true">.</span>
                </h1>
              </div>

              <div class="cards-layer">
                <div ref="cardsStageRef" class="cards-stage">
                  <div
                    v-for="(card, cardIndex) in cards"
                    :key="card.id"
                    :ref="(el) => setCardRef(el, cardIndex)"
                    class="experience-card-shell"
                    :class="[
                      `experience-card-shell--${cardSlots[cardIndex] ?? 'center'}`,
                      getCardShellClass(card.id),
                    ]"
                    :style="getCardShellStyle(card.id, cardIndex)"
                    :role="isMobileExperienceViewport ? 'button' : undefined"
                    :tabindex="isMobileExperienceViewport ? 0 : undefined"
                    :aria-expanded="isMobileExperienceViewport ? mobileActiveCardId === card.id : undefined"
                    @click="handleMobileCardInteraction(card.id)"
                    @keydown="handleMobileCardKeydown($event, card.id)"
                  >
                    <ExperienceSceneCard
                      :card="card"
                      :mobile-interactive="isMobileExperienceViewport"
                      :mobile-active="mobileActiveCardId === card.id"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.experience-page {
  position: relative;
  padding-top: 0;
}

.experience-page__inner {
  padding-top: 0;
  padding-bottom: 3rem;
}

.experience-scene {
  position: relative;
  isolation: isolate;
}

.scroll-track {
  position: relative;
  height: 100vh;
}

.sticky-wrap {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: clip;
}

.scene-hero {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  text-align: center;
  pointer-events: none;
}

.scene-hero h1 {
  margin: 0;
  width: min(100%, 62rem);
  color: #ffffff;
  font-size: clamp(2.6rem, 7.6vw, 5.8rem);
  font-weight: 900;
  line-height: 0.9;
  letter-spacing: -0.06em;
  text-wrap: balance;
  text-shadow: 0 16px 40px rgba(0, 0, 0, 0.42);
}

.scene-hero__highlight {
  display: inline-block;
  padding-inline-end: 0.06em;
  color: transparent;
  background: linear-gradient(90deg, #ffffff 0%, rgba(255, 255, 255, 0.36) 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.scene-hero__dot {
  display: inline-block;
  color: #ebb207;
  transform: translateX(-0.1em);
}

.cards-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  padding: clamp(2.5rem, 5vh, 3.5rem) clamp(0.35rem, 1.8vw, 1.25rem) clamp(0.25rem, 0.8vh, 0.6rem);
  pointer-events: none;
}

.cards-stage {
  width: 100%;
  max-width: 1700px;
  height: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: 1fr;
  gap: clamp(0.5rem, 0.7vw, 0.85rem);
  align-items: end;
}

.experience-card-shell {
  grid-row: 1;
  width: 100%;
  max-width: none;
  height: min(80vh, 48rem);
  min-height: 31rem;
  pointer-events: auto;
  will-change: transform;
}

.experience-card-shell--left {
  grid-column: 1;
}

.experience-card-shell--center {
  grid-column: 2;
}

.experience-card-shell--right {
  grid-column: 3;
}

.scroll-hint {
  position: fixed;
  left: 50%;
  bottom: clamp(1.4rem, 4vw, 2.4rem);
  z-index: 20;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.72;
  transform: translateX(-50%);
  pointer-events: auto;
  color: #666666;
  animation: experience-bounce 2s infinite ease-in-out;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  touch-action: manipulation;
}

.scroll-hint__arrow {
  display: block;
}

.scroll-hint:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.55);
  outline-offset: 8px;
}

@keyframes experience-bounce {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }

  50% {
    transform: translateX(-50%) translateY(8px);
  }
}

@media (max-width: 1120px) {
  .cards-stage {
    gap: 1rem;
  }

  .experience-card-shell {
    height: min(74vh, 42rem);
    min-height: 27rem;
  }
}

@media (max-width: 720px) {
  .experience-page__inner {
    padding-bottom: calc(7rem + env(safe-area-inset-bottom));
  }

  .experience-scene {
    min-height: 100dvh;
  }

  .scroll-track,
  .sticky-wrap {
    height: 100dvh;
    min-height: 100dvh;
  }

  .sticky-wrap {
    overflow: visible;
  }

  .scene-hero {
    padding:
      calc(5.75rem + env(safe-area-inset-top))
      1rem
      calc(10rem + env(safe-area-inset-bottom));
    transition:
      opacity 0.42s ease,
      transform 0.72s cubic-bezier(0.22, 1, 0.36, 1),
      filter 0.42s ease;
  }

  .experience-scene--mobile-focus .scene-hero {
    opacity: 0.16;
    filter: blur(10px);
    transform: scale(1.025);
  }

  .scene-hero h1 {
    width: min(100%, 32rem);
    font-size: clamp(2.4rem, 12vw, 4.2rem);
  }

  .cards-stage {
    position: relative;
    display: block;
    width: min(100%, 28rem);
    max-width: 28rem;
    height: 100%;
    min-height: 0;
    isolation: isolate;
    --wallet-main-top: clamp(6.9rem, 13vh, 8.45rem);
    --wallet-active-top: calc(var(--wallet-main-top) - clamp(4.4rem, 9vh, 5.8rem));
    --wallet-peek-height: clamp(3.5rem, 10vw, 4rem);
    --wallet-focus-gap: clamp(1rem, 3.5vw, 1.4rem);
    --wallet-card-height:
      min(31.5rem, calc(100% - var(--wallet-main-top) - var(--wallet-peek-height) - var(--wallet-focus-gap)));
  }

  .cards-layer {
    padding:
      calc(5.85rem + env(safe-area-inset-top))
      0.35rem
      calc(6.05rem + env(safe-area-inset-bottom));
    display: flex;
    align-items: stretch;
    justify-content: center;
  }

  .experience-card-shell,
  .experience-card-shell--left,
  .experience-card-shell--center,
  .experience-card-shell--right {
    position: absolute;
    left: 50%;
    top: var(--wallet-main-top);
    grid-column: auto;
    justify-self: auto;
    width: min(100%, 28rem);
    height: var(--wallet-card-height);
    min-height: 0;
    max-height: none;
    transform-origin: 50% 12%;
    will-change: transform, top, bottom;
    transition:
      transform 0.72s cubic-bezier(0.22, 1, 0.36, 1),
      top 0.72s cubic-bezier(0.22, 1, 0.36, 1),
      bottom 0.72s cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 0.42s ease,
      filter 0.42s ease;
    cursor: pointer;
    touch-action: manipulation;
  }

  .experience-card-shell--mobile-stack {
    top: calc(var(--wallet-main-top) + var(--mobile-stack-offset, 0px));
    bottom: auto;
    transform: translate3d(-50%, 0, 0) scale(var(--mobile-stack-scale, 1));
    filter: saturate(0.96);
  }

  .experience-card-shell--mobile-active {
    top: var(--wallet-active-top);
    bottom: auto;
    transform: translate3d(-50%, 0, 0) scale(1);
    filter: none;
  }

  .experience-card-shell--mobile-peek {
    top: auto;
    bottom: calc(var(--mobile-peek-bottom, 0rem) - (var(--wallet-card-height) - var(--wallet-peek-height)));
    transform: translate3d(-50%, 0, 0) scale(var(--mobile-peek-scale, 0.98));
    filter: saturate(0.88) brightness(0.92);
  }

  .experience-card-shell:focus-visible {
    outline: none;
  }

  .experience-card-shell:focus-visible :deep(.experience-card) {
    box-shadow:
      0 0 0 2px rgba(255, 255, 255, 0.24),
      0 24px 56px rgba(0, 0, 0, 0.54);
  }

  .experience-card-shell--mobile-active :deep(.experience-card) {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      inset 0 -1px 0 rgba(255, 255, 255, 0.02),
      0 28px 80px rgba(0, 0, 0, 0.58);
  }

  .experience-card-shell--mobile-peek :deep(.experience-card) {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      inset 0 -1px 0 rgba(255, 255, 255, 0.015),
      0 18px 48px rgba(0, 0, 0, 0.46);
  }
}

@media (max-width: 640px) {
  .experience-page__inner {
    padding-right: 1rem;
    padding-left: 1rem;
  }

  .cards-layer {
    padding-right: 0.15rem;
    padding-left: 0.15rem;
  }

  .cards-stage {
    --wallet-main-top: clamp(6.3rem, 12vh, 7.45rem);
    --wallet-active-top: calc(var(--wallet-main-top) - clamp(3.8rem, 8vh, 4.9rem));
    --wallet-peek-height: clamp(3.3rem, 12vw, 3.8rem);
    --wallet-focus-gap: clamp(0.85rem, 3vw, 1.2rem);
    --wallet-card-height:
      min(30rem, calc(100% - var(--wallet-main-top) - var(--wallet-peek-height) - var(--wallet-focus-gap)));
  }

  .experience-card-shell,
  .experience-card-shell--left,
  .experience-card-shell--center,
  .experience-card-shell--right {
    width: min(100%, 26.5rem);
  }
}
</style>
