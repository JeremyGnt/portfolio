<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import ExperienceSceneCard from '../components/experience/ExperienceSceneCard.vue'
import { useExperienceSceneAnimation } from '../composables/useExperienceSceneAnimation'
import { experiencesPageData } from '../data/experiencesData'

const hero = experiencesPageData.hero
const cards = experiencesPageData.cards
const cardSlots = ['left', 'center', 'right'] as const

const { scrollTrackRef, mainTitleRef, scrollHintRef, setCardRef } = useExperienceSceneAnimation()

onMounted(() => {
  document.body.classList.add('route-experience')
})

onUnmounted(() => {
  document.body.classList.remove('route-experience')
})
</script>

<template>
  <div class="pages-wrapper">
    <section class="page active experience-page">
      <div class="page-inner experience-page__inner">
        <div class="experience-scene">
          <div ref="scrollHintRef" class="scroll-hint">
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
          </div>

          <div ref="scrollTrackRef" class="scroll-track">
            <div class="sticky-wrap">
              <div ref="mainTitleRef" class="scene-hero">
                <h1>
                  {{ hero.title }}
                  <br />
                  <span>{{ hero.highlight }}</span>
                </h1>
              </div>

              <div class="cards-layer">
                <div class="cards-stage">
                  <div
                    v-for="(card, cardIndex) in cards"
                    :key="card.id"
                    :ref="(el) => setCardRef(el, cardIndex)"
                    class="experience-card-shell"
                    :class="`experience-card-shell--${cardSlots[cardIndex] ?? 'center'}`"
                    :style="{ zIndex: cardIndex + 2 }"
                  >
                    <ExperienceSceneCard :card="card" />
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

.scene-hero h1 span {
  color: transparent;
  background: linear-gradient(90deg, #ffffff 0%, rgba(255, 255, 255, 0.36) 100%);
  -webkit-background-clip: text;
  background-clip: text;
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
  pointer-events: none;
  color: #666666;
  animation: experience-bounce 2s infinite ease-in-out;
}

.scroll-hint__arrow {
  display: block;
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
  .scene-hero h1 {
    width: min(100%, 32rem);
    font-size: clamp(2.4rem, 12vw, 4.2rem);
  }

  .cards-stage {
    grid-template-columns: minmax(0, 1fr);
  }

  .experience-card-shell,
  .experience-card-shell--left,
  .experience-card-shell--center,
  .experience-card-shell--right {
    grid-column: 1;
    justify-self: center;
    width: min(100%, 28rem);
  }
}

@media (max-width: 640px) {
  .experience-page__inner {
    padding-right: 1rem;
    padding-left: 1rem;
  }

  .cards-layer {
    padding-top: clamp(3.5rem, 7vh, 4.5rem);
    padding-right: 0.15rem;
    padding-left: 0.15rem;
  }

  .experience-card-shell {
    height: min(72vh, 38rem);
    min-height: 26rem;
  }
}
</style>
