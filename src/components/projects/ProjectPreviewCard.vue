<script setup lang="ts">
import { ArrowUpRight, Github } from 'lucide-vue-next'
import type { ProjectData } from '../../data/projectsData'

defineProps<{
  project: ProjectData
}>()
</script>

<template>
  <article
    class="project-preview-card group"
  >
    <div
      class="project-preview-card__year-ghost"
      aria-hidden="true"
    >
      {{ project.year }}
    </div>

    <div class="project-preview-card__content">
      <header class="project-preview-card__header">
        <div class="project-preview-card__copy">
          <p class="project-preview-card__eyebrow">
            {{ project.category }}
          </p>
          <h2 class="project-preview-card__title">
            {{ project.title }}
          </h2>
        </div>
        <span
          v-if="project.externalUrl"
          class="project-preview-card__link-indicator"
          aria-hidden="true"
        >
          <Github :size="20" />
          <ArrowUpRight :size="20" />
        </span>
      </header>

      <p class="project-preview-card__description">
        {{ project.description }}
      </p>

      <div class="project-preview-card__badge-list project-preview-card__badge-list--media">
        <span
          v-for="badge in project.badges"
          :key="badge"
          class="project-preview-card__badge"
        >
          {{ badge }}
        </span>
      </div>

      <div class="project-preview-card__media">
        <img
          v-if="project.imageSrc"
          :src="project.imageSrc"
          :alt="project.imageAlt ?? project.title"
          class="project-preview-card__image"
          loading="lazy"
        >
        <div v-else class="project-preview-card__media-fallback">
          <span>Visuel projet</span>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.project-preview-card {
  --project-card-padding: 1.75rem;
  --project-card-media-inset: 0.55rem;
  --project-card-surface-top: #1b1d21;
  --project-card-surface:
    linear-gradient(180deg, rgba(255, 255, 255, 0.052) 0%, rgba(255, 255, 255, 0.016) 38%, rgba(255, 255, 255, 0.012) 100%),
    #0f1115;
  position: relative;
  width: 100%;
  height: auto;
  overflow: hidden;
  padding: var(--project-card-padding);
  border-radius: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--project-card-surface);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(255, 255, 255, 0.02),
    0 24px 48px rgba(0, 0, 0, 0.56);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.project-preview-card__year-ghost {
  position: absolute;
  top: 0;
  right: -0.1rem;
  pointer-events: none;
  font-family: 'InterLocal', system-ui, sans-serif;
  font-size: clamp(5rem, 12vw, 8.5rem);
  font-weight: 900;
  line-height: 1;
  color: rgba(255, 255, 255, 0.04);
}

.project-preview-card__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: auto;
  gap: 1.25rem;
}

.project-preview-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-direction: row;
  width: 100%;
}

.project-preview-card__header .project-preview-card__copy {
  padding-right: 1rem;
}

.project-preview-card__header:has(.project-preview-card__link-indicator) {
  align-items: flex-start;
  gap: 1rem;
}

.project-preview-card__copy {
  min-width: 0;
}

.project-preview-card__eyebrow {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.project-preview-card__eyebrow {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.45);
}

.project-preview-card__title {
  margin: 0.85rem 0 0;
  max-width: 11ch;
  color: #ffffff;
  font-size: clamp(1.95rem, 3vw, 2.55rem);
  font-weight: 600;
  line-height: 0.92;
  letter-spacing: -0.06em;
}

.project-preview-card__link-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  flex: 0 0 auto;
  align-self: flex-start;
  color: #ebb207;
}

.project-preview-card__description {
  width: 100%;
  max-width: none;
  font-family: system-ui, sans-serif;
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.96rem;
  line-height: 1.75;
}

.project-preview-card__media {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  min-height: 11rem;
  margin-inline: calc(var(--project-card-media-inset) - var(--project-card-padding));
  margin-bottom: calc(var(--project-card-media-inset) - var(--project-card-padding));
  border-radius: 1.35rem;
  background: transparent;
}

.project-preview-card__media::before,
.project-preview-card__media::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.project-preview-card__media::before {
  z-index: 1;
  background: none;
}

.project-preview-card__media::after {
  z-index: 1;
  background:
    linear-gradient(180deg, rgba(15, 17, 21, 0) 0%, rgba(15, 17, 21, 0) 64%, rgba(15, 17, 21, 0.16) 100%);
}

.project-preview-card__image {
  position: relative;
  z-index: 0;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.04) 20%, rgba(0, 0, 0, 0.18) 32%, rgba(0, 0, 0, 0.48) 44%, rgba(0, 0, 0, 0.82) 56%, #000 68%, #000 100%);
  mask-image: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.04) 20%, rgba(0, 0, 0, 0.18) 32%, rgba(0, 0, 0, 0.48) 44%, rgba(0, 0, 0, 0.82) 56%, #000 68%, #000 100%);
}

.project-preview-card__media-fallback {
  position: relative;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.34);
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.04) 20%, rgba(0, 0, 0, 0.18) 32%, rgba(0, 0, 0, 0.48) 44%, rgba(0, 0, 0, 0.82) 56%, #000 68%, #000 100%);
  mask-image: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.04) 20%, rgba(0, 0, 0, 0.18) 32%, rgba(0, 0, 0, 0.48) 44%, rgba(0, 0, 0, 0.82) 56%, #000 68%, #000 100%);
}

.project-preview-card__badge-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.project-preview-card__badge-list--media {
  position: absolute;
  top: 50%;
  left: var(--project-card-media-inset);
  z-index: 2;
  width: calc(100% - (var(--project-card-media-inset) * 2));
  padding: 0 1rem;
  transform: translateY(-28%);
}

.project-preview-card__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  border: 0;
  background: rgba(15, 15, 15, 0.1);
  border-color: rgba(255, 255, 255, 0.08);
  backdrop-filter: brightness(1.2) blur(1px) url(#menuDisplacementFilter);
  -webkit-backdrop-filter: brightness(1.2) blur(1px);
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.76rem;
  font-weight: 500;
  box-shadow:
    inset 1px 1px 1px 0 rgba(255, 255, 255, 0.4),
    inset -1px -1px 2px 0 rgba(0, 0, 0, 0.1),
    inset 0 0 8px 1px rgba(255, 255, 255, 0.15),
    0 10px 40px rgba(0, 0, 0, 0.8);
}

@media (max-width: 640px) {
  .project-preview-card {
    --project-card-padding: 1.5rem;
    --project-card-media-inset: 0.5rem;
  }
}
</style>
