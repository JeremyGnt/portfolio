<script setup lang="ts">
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

      </header>

      <p class="project-preview-card__description">
        {{ project.description }}
      </p>

      <div class="project-preview-card__grid">
        <section class="project-preview-card__panel">
          <p class="project-preview-card__panel-label">
            Stack
          </p>
          <div class="project-preview-card__badge-list">
            <span
              v-for="badge in project.badges"
              :key="badge"
              class="project-preview-card__badge"
            >
              {{ badge }}
            </span>
          </div>
        </section>
      </div>
    </div>
  </article>
</template>

<style scoped>
.project-preview-card {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 1.75rem;
  border-radius: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.052) 0%, rgba(255, 255, 255, 0.016) 38%, rgba(255, 255, 255, 0.012) 100%),
    #0f1115;
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
  height: 100%;
  gap: 1.25rem;
}

.project-preview-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.project-preview-card__copy {
  min-width: 0;
}

.project-preview-card__eyebrow,
.project-preview-card__panel-label {
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

.project-preview-card__description {
  max-width: 38ch;
  font-family: system-ui, sans-serif;
  color: rgba(255, 255, 255, 0.62);
  font-size: 0.96rem;
  line-height: 1.75;
}

.project-preview-card__grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: minmax(0, 1fr);
}

.project-preview-card__panel {
  padding: 1rem;
  border-radius: 1.4rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.012) 100%);
}

.project-preview-card__panel-label {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.42);
}

.project-preview-card__panel-copy {
  margin-top: 0.75rem;
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.95rem;
  line-height: 1.6;
}

.project-preview-card__badge-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.project-preview-card__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.76rem;
  font-weight: 500;
}

@media (max-width: 640px) {
  .project-preview-card {
    padding: 1.5rem;
  }

  .project-preview-card__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
