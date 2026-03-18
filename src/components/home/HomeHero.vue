<template>
  <div id="hero-section" class="home-hero">
    <div class="hero-content-shift-up hero-content-up">
      <div class="hero-kicker-top fade-text gradient-text kicker-grid">
        <span class="kicker-left kicker-col-left">ÉTUDIANT INGÉNIEUR</span>
        <span class="hero-dot subtitle-dot align-dot kicker-col-dot">&bull;</span>
        <span class="kicker-right kicker-col-right">BIG DATA &amp; IA</span>
      </div>
      <h1 class="home-hero-title">
        <span class="home-hero-word">
          <span id="target-j" class="target-letter" aria-hidden="true">J</span><span class="fade-text">érémy</span>
        </span>
        <span class="home-hero-word">
          <span id="target-g" class="target-letter" aria-hidden="true">G</span><span class="fade-text home-hero-last-name">onnet</span>
        </span>
      </h1>
      <p
        class="hero-subtitle-bottom fade-text"
        style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 0.85rem; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase;"
      >
        <span>20 ans</span>
        <span class="hero-dot-secondary subtitle-dot">&bull;</span>
        <span>ECE Paris</span>
        <span class="hero-dot-secondary subtitle-dot">&bull;</span>
        <span>3ème année</span>
      </p>
    </div>

    <div class="hero-scroll-indicator fade-text hero-arrow-up">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 5v14" />
        <path d="m19 12-7 7-7-7" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.home-hero {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8rem 0 3rem;
  z-index: 2;
  position: relative;
}

.hero-content-shift-up {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transform: translateY(-5.5rem);
}

.hero-content-up {
  transform: translateY(-5.5rem);
}

.home-hero-title {
  font-size: clamp(3.5rem, 10vw, 7.5rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #ffffff;
  display: flex;
  gap: 3rem;
  margin: 1.5rem 0;
}

.home-hero-word {
  display: flex;
  align-items: center;
  position: relative;
}

.home-hero-last-name {
  position: relative;
}

.home-hero-last-name::after {
  content: '';
  position: absolute;
  left: calc(100% + 0.14em);
  bottom: 0.14em;
  width: 0.14em;
  height: 0.14em;
  border-radius: 999px;
  background: #ebb207;
  pointer-events: none;
  transform: translateX(-0.1em);
}

.target-letter {
  display: inline-block;
  opacity: 0;
  color: transparent;
  pointer-events: none;
  user-select: none;
  line-height: 1;
  transform-origin: center center;
  margin-right: 0.16em;
}

.home-hero-title .fade-text {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.fade-text {
  display: inline-block;
  will-change: transform, opacity;
}

.hero-kicker-top {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin: 0;
  transform: translateY(-16px);
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.kicker-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: 100%;
  max-width: 700px;
}

.kicker-col-left {
  justify-self: end;
  text-align: right;
}

.kicker-col-dot {
  justify-self: center;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  font-size: 1.7em;
  color: #ffffff;
  transform: translateY(-4px);
}

.kicker-col-right {
  justify-self: start;
  text-align: left;
}

.kicker-left {
  text-align: center;
}

.kicker-right {
  text-align: center;
}

.hero-dot.subtitle-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 1.7em;
  margin: 0 1.2rem;
}

.align-dot {
  transform: translateY(-1px);
}

.hero-subtitle-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  text-align: center;
  flex-wrap: wrap;
  font-size: 0.85rem;
  color: #a0a0a0;
  margin: 0;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.subtitle-dot {
  margin: 0 0.75rem;
}

.hero-dot-secondary {
  color: inherit;
}

.hero-scroll-indicator {
  margin-top: 3rem;
  color: #666;
  animation: bounce 2s infinite ease-in-out;
}

.hero-arrow-up {
  margin-top: 0;
  margin-bottom: 3.5rem;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(8px);
  }
}

@media (max-width: 768px) {
  .target-letter {
    opacity: 1;
    color: #ffffff;
  }
}

@media (max-width: 640px) {
  .home-hero-title {
    flex-direction: column;
    gap: 0;
    font-size: 4rem;
  }
}
</style>
