<script setup lang="ts">
import type { Component } from 'vue'
import {
  Atom,
  Award,
  Briefcase,
  ClipboardList,
  Database,
  HeartHandshake,
} from 'lucide-vue-next'
import type {
  CertificationIcon,
  ExperienceCard,
  ExperienceSectionIcon,
} from '../../data/experiencesData'

withDefaults(
  defineProps<{
    card: ExperienceCard
    mobileInteractive?: boolean
    mobileActive?: boolean
  }>(),
  {
    mobileInteractive: false,
    mobileActive: false,
  },
)

const sectionIconMap: Record<ExperienceSectionIcon, Component> = {
  briefcase: Briefcase,
  award: Award,
  'heart-handshake': HeartHandshake,
}

const certificationIconMap: Record<CertificationIcon, Component> = {
  database: Database,
  atom: Atom,
  'clipboard-list': ClipboardList,
}

const resolveSectionIcon = (icon: ExperienceSectionIcon) => sectionIconMap[icon]
const resolveCertificationIcon = (icon: CertificationIcon) => certificationIconMap[icon]
</script>

<template>
  <article
    class="experience-card card glass"
    :class="{
      'experience-card--mobile-interactive': mobileInteractive,
      'experience-card--mobile-active': mobileActive,
    }"
  >
    <div class="experience-card__number">{{ card.number }}</div>

    <div class="experience-card__inner">
      <header class="experience-card__header">
        <h2 class="section-title experience-card__title">
          <span class="section-icon experience-card__icon">
            <component :is="resolveSectionIcon(card.icon)" :size="20" />
          </span>
          {{ card.title }}
        </h2>
      </header>

      <div class="experience-card__body">
        <section v-if="card.type === 'experience'" class="experience-card__panel experience-card__panel--stack">
          <div class="experience-card__job-header">
            <div class="experience-card__job-copy">
              <h3 class="experience-card__meta-title">{{ card.role }}</h3>
              <p class="timeline-role">{{ card.company }}</p>
            </div>

            <div v-if="card.company === 'Carrefour'" class="experience-card__company-logo-box">
              <img
                src="/brands/carrefour-logo.webp"
                alt="Logo Carrefour"
                class="experience-card__company-logo"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          <p class="timeline-date experience-card__date-line">
            <span>{{ card.date }}</span>
            <span class="experience-card__date-separator">&bull;</span>
            <span class="experience-card__duration">{{ card.duration }}</span>
          </p>

          <ul class="bullet-list experience-card__bullet-list">
            <li v-for="point in card.points" :key="point">{{ point }}</li>
          </ul>
        </section>

        <div v-else-if="card.type === 'certifications'" class="experience-card__stack">
          <section
            v-for="item in card.items"
            :key="item.id"
            class="experience-card__panel experience-card__cert-item"
          >
            <div class="experience-card__cert-icon-box">
              <component :is="resolveCertificationIcon(item.icon)" :size="18" />
            </div>

            <div class="experience-card__cert-copy">
              <h3 class="experience-card__meta-title">{{ item.title }}</h3>
              <p class="timeline-role experience-card__cert-subtitle">{{ item.subtitle }}</p>
            </div>

            <span class="timeline-date experience-card__cert-date">{{ item.date }}</span>
          </section>
        </div>

        <div v-else class="experience-card__stack">
          <section v-for="item in card.items" :key="item.id" class="experience-card__panel experience-card__panel--stack">
            <h3 class="experience-card__meta-title">{{ item.title }}</h3>
            <p class="timeline-role">{{ item.role }}</p>
            <p class="experience-card__description">{{ item.description }}</p>
          </section>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.experience-card {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  touch-action: pan-y;
}

.experience-card:hover {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.052) 0%, rgba(255, 255, 255, 0.016) 38%, rgba(255, 255, 255, 0.012) 100%),
    #0f1115;
  border-color: rgba(255, 255, 255, 0.06);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(255, 255, 255, 0.02),
    0 24px 48px rgba(0, 0, 0, 0.56);
}

.experience-card__number {
  position: absolute;
  top: -0.55rem;
  right: 0.35rem;
  font-size: clamp(6.8rem, 10vw, 10rem);
  line-height: 1;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.035);
  pointer-events: none;
  user-select: none;
}

.experience-card__inner {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.experience-card__header {
  margin-bottom: 1.2rem;
}

.experience-card__title {
  margin-bottom: 0;
}

.experience-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.experience-card__body {
  flex: 1;
  min-height: 0;
  overflow-y: visible;
  padding-right: 0;
}

.experience-card__body::-webkit-scrollbar {
  width: 4px;
}

.experience-card__body::-webkit-scrollbar-track {
  background: transparent;
}

.experience-card__body::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}

.experience-card__stack {
  display: grid;
  gap: 1rem;
}

.experience-card__panel {
  display: grid;
  gap: 0.8rem;
  padding: 1.05rem;
  border-radius: 1.35rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.012) 100%);
}

.experience-card__panel--stack {
  align-content: start;
}

.experience-card__job-header,
.experience-card__cert-item {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
}

.experience-card__job-header {
  justify-content: space-between;
}

.experience-card__job-copy {
  flex: 1;
  min-width: 0;
}

.experience-card__meta-title {
  margin: 0;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #ffffff;
}


.experience-card__date-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.experience-card__date-separator,
.experience-card__duration {
  color: var(--text-muted);
}

.experience-card__bullet-list {
  gap: 0.75rem;
}

.experience-card__bullet-list :deep(li) {
  font-family: system-ui, sans-serif;
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.5;
}

.experience-card__bullet-list :deep(li)::before {
  content: '•';
  color: rgba(255, 255, 255, 0.3);
  font-weight: 700;
}

.experience-card__description {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.65;
}

.experience-card__cert-icon-box {
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.82);
  background: transparent;
  border: 0;
  border-radius: 0;
}

.experience-card__company-logo-box {
  width: clamp(3.4rem, 6vw, 4.2rem);
  min-width: clamp(3.4rem, 6vw, 4.2rem);
  padding: 0.32rem 0.38rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.8rem;
  background: transparent;
  border: 0;
  box-shadow: none;
}

.experience-card__company-logo {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
}

.experience-card__cert-copy {
  flex: 1;
  min-width: 0;
}

.experience-card__cert-subtitle {
  font-family: system-ui, sans-serif;
}

.experience-card__cert-date {
  color: #ebb207;
}

@media (max-width: 1120px) {
  .experience-card__number {
    font-size: clamp(6rem, 16vw, 9rem);
  }
}

@media (max-width: 720px) {
  .experience-card--mobile-interactive {
    overflow: hidden;
  }

  .experience-card--mobile-interactive .experience-card__inner {
    min-height: 0;
  }

  .experience-card__meta-title {
    font-size: 0.8rem;
  }

  .experience-card__company-logo-box {
    width: 3.4rem;
    min-width: 3.4rem;
    padding: 0.28rem 0.34rem;
  }

  .experience-card__description,
  .experience-card__bullet-list :deep(li) {
    font-size: 0.9rem;
  }

  .experience-card--mobile-interactive .experience-card__body {
    overflow-y: hidden;
    padding-right: 0;
    scrollbar-width: none;
    overscroll-behavior: auto;
  }

  .experience-card--mobile-active .experience-card__body {
    overflow-y: hidden;
    padding-right: 0;
    scrollbar-width: none;
    overscroll-behavior: none;
    -webkit-overflow-scrolling: auto;
  }

  .experience-card__body {
    overflow-y: visible;
    padding-right: 0;
    scrollbar-width: none;
    overscroll-behavior: auto;
  }
}
</style>
