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
const mobileInitialStackOffsets = ['-5rem', '-2.15rem', '0.55rem']
const mobileStackScales = ['1', '1', '1']
const mobilePeekScales = ['1', '1']
const firstMobileCardId = cards[0]?.id ?? null
const secondMobileCardId = cards[1]?.id ?? null
const thirdMobileCardId = cards[2]?.id ?? null

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
  const isFirstCardFocused = mobileActiveCardId.value === firstMobileCardId
  const isSecondCardFocused = mobileActiveCardId.value === secondMobileCardId
  const isThirdCardFocused = mobileActiveCardId.value === thirdMobileCardId
  const resolvedActiveOffset =
    isActiveCard && (isSecondCardFocused || isThirdCardFocused)
      ? mobileStackOffsets[0]
      : (mobileStackOffsets[cardIndex] ?? '0px')

  let resolvedPeekOffset = mobileStackOffsets[cardIndex] ?? '0px'

  if (!isActiveCard && isSecondCardFocused) {
    if (cardId === firstMobileCardId) {
      resolvedPeekOffset = mobileStackOffsets[1] ?? resolvedPeekOffset
    } else if (cardId === thirdMobileCardId) {
      resolvedPeekOffset = mobileStackOffsets[2] ?? resolvedPeekOffset
    }
  }

  if (!isActiveCard && isThirdCardFocused) {
    if (cardId === firstMobileCardId) {
      resolvedPeekOffset = mobileStackOffsets[1] ?? resolvedPeekOffset
    } else if (cardId === secondMobileCardId) {
      resolvedPeekOffset = mobileStackOffsets[2] ?? resolvedPeekOffset
    }
  }

  const resolvedPeekExtraShift = isFirstCardFocused
    ? 'clamp(4.18rem, 7.85vh, 4.84rem)'
    : isSecondCardFocused || isThirdCardFocused
      ? 'clamp(4.5rem, 8vh, 5.15rem)'
      : '0px'

  return {
    zIndex: isActiveCard ? '30' : `${10 + cardIndex}`,
    '--mobile-stack-offset': mobileStackOffsets[cardIndex] ?? '0px',
    '--mobile-stack-initial-offset': mobileInitialStackOffsets[cardIndex] ?? (mobileStackOffsets[cardIndex] ?? '0px'),
    '--mobile-active-offset': resolvedActiveOffset,
    '--mobile-peek-offset': resolvedPeekOffset,
    '--mobile-stack-scale': mobileStackScales[cardIndex] ?? '1',
    '--mobile-peek-scale': mobilePeekScales[Math.min(cardIndex, mobilePeekScales.length - 1)] ?? mobilePeekScales[0],
    '--mobile-peek-extra-shift': !isActiveCard ? resolvedPeekExtraShift : '0px',
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
    --wallet-main-top: clamp(4.9rem, 9vh, 6.1rem);
    --wallet-stack-top: calc(var(--wallet-main-top) + clamp(0.45rem, 1.2vh, 0.7rem));
    --wallet-active-shift: clamp(0.9rem, 2.6vh, 1.3rem);
    --wallet-peek-height: clamp(3rem, 8vw, 3.45rem);
    --wallet-focus-gap: clamp(0.45rem, 1.8vh, 0.8rem);
    --wallet-dock-base-bottom: clamp(4.15rem, 9vw, 4.55rem);
    --wallet-dock-top: calc(100% - var(--wallet-peek-height) - var(--wallet-dock-base-bottom));
    --wallet-card-height:
      min(31.5rem, calc(100% - var(--wallet-main-top) - var(--wallet-peek-height) - var(--wallet-focus-gap)));
  }

  .cards-layer {
    padding:
      calc(4.15rem + env(safe-area-inset-top))
      0.35rem
      calc(4.75rem + env(safe-area-inset-bottom));
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
    top: var(--wallet-stack-top);
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
    top: calc(var(--wallet-stack-top) + var(--mobile-stack-initial-offset, var(--mobile-stack-offset, 0px)));
    bottom: auto;
    transform: translate3d(-50%, 0, 0) scale(var(--mobile-stack-scale, 1));
    filter: saturate(0.96);
  }

  .experience-card-shell--mobile-active {
    top: calc(var(--wallet-stack-top) + var(--mobile-active-offset, var(--mobile-stack-offset, 0px)) + var(--wallet-active-shift));
    bottom: auto;
    transform: translate3d(-50%, 0, 0) scale(1);
    filter: none;
  }

  .experience-card-shell--mobile-peek {
    top: calc(var(--wallet-dock-top) + var(--mobile-peek-offset, var(--mobile-stack-offset, 0px)) + var(--mobile-peek-extra-shift, 0px));
    bottom: auto;
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
    --wallet-main-top: clamp(4.35rem, 8vh, 5.35rem);
    --wallet-stack-top: calc(var(--wallet-main-top) + clamp(0.4rem, 1vh, 0.6rem));
    --wallet-active-shift: clamp(0.75rem, 2.3vh, 1.1rem);
    --wallet-peek-height: clamp(2.95rem, 9vw, 3.4rem);
    --wallet-focus-gap: clamp(0.4rem, 1.6vh, 0.65rem);
    --wallet-dock-base-bottom: clamp(3.95rem, 9vw, 4.3rem);
    --wallet-dock-top: calc(100% - var(--wallet-peek-height) - var(--wallet-dock-base-bottom));
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
