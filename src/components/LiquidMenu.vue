<script setup>
import { ref, onMounted, nextTick, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const items = [
  { text: 'À propos', path: '/', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>' },
  { text: 'Expériences', path: '/experience', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>' },
  { text: 'Projets', path: '/projects', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>' },
  { text: 'Contact', path: '/contact', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>' }
];

// Compute the active index from the current route
function getActiveIndexFromRoute() {
  const idx = items.findIndex(item => item.path === route.path);
  return Math.max(idx, 0);
}

const activeIndex = ref(getActiveIndexFromRoute());
const isMoving = ref(false);
const isGrowing = ref(false);
const moveDuration = ref(0.8);
const bubbleStyle = ref({ width: '0px', height: '0px', left: '0px', top: '0px' });
const itemRefs = ref([]);

const setItemRef = (el, index) => {
  if (el) {
    itemRefs.value[index] = el;
  }
};

const setBubble = () => {
  if (itemRefs.value[activeIndex.value]) {
    const el = itemRefs.value[activeIndex.value];
    const parent = el.closest('.liquid-menu');
    const parentRect = parent.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    bubbleStyle.value = {
      width: `${elRect.width}px`,
      height: `${elRect.height}px`,
      left: `${elRect.left - parentRect.left}px`,
      top: `${elRect.top - parentRect.top}px`
    };
  }
};

let moveTimeout = null;
let growTimeout = null;
const selectItem = (index) => {
  if (activeIndex.value !== index) {
    // Calcul de la distance à parcourir pour accélérer les trajets courts
    const distance = Math.abs(index - activeIndex.value);
    
    // Si adjacente (distance=1), durée = 0.4s
    // Si bout à bout (distance=3), durée = 0.8s
    const calculatedDuration = 0.2 + (distance * 0.2);
    moveDuration.value = calculatedDuration;
    
    activeIndex.value = index;
    isMoving.value = true;
    isGrowing.value = true;
    setBubble();

    clearTimeout(growTimeout);
    growTimeout = setTimeout(() => {
      isGrowing.value = false;
    }, (calculatedDuration * 1000) / 2);

    clearTimeout(moveTimeout);
    moveTimeout = setTimeout(() => {
      isMoving.value = false;
    }, calculatedDuration * 1000);
  }

  // Navigate to the route
  router.push(items[index].path);
};

// Watch route changes to sync bubble position (e.g. browser back/forward)
watch(() => route.path, () => {
  const newIndex = getActiveIndexFromRoute();
  if (newIndex !== activeIndex.value) {
    selectItem(newIndex);
  }
});

onMounted(() => {
  nextTick(() => {
    setBubble();
    window.addEventListener('resize', setBubble);
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', setBubble);
});
</script>

<template>
  <nav class="liquid-menu">
    <div class="menu-bg"></div>
    <div 
      class="active-bubble" 
      :class="{ moving: isMoving, growing: isGrowing }" 
      :style="{ 
        ...bubbleStyle, 
        '--move-duration': `${moveDuration}s`
      }"
    ></div>
    <ul class="menu-list">
      <li 
        v-for="(item, index) in items" 
        :key="index"
        :ref="(el) => setItemRef(el, index)"
        class="menu-item"
        :class="{ active: activeIndex === index }"
        @click="selectItem(index)"
      >
        <div class="item-content">
          <span class="item-icon" v-html="item.icon"></span>
          <span class="item-text">{{ item.text }}</span>
        </div>
      </li>
    </ul>

    <svg style="display:none;">
        <filter id="menuDisplacementFilter">
            <feTurbulence type="turbulence" 
                baseFrequency="0.015" 
                numOctaves="3" 
                result="turbulence" />
    
            <feDisplacementMap in="SourceGraphic"
                in2="turbulence"    
                            scale="45" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="menuBgDisplacementFilter">
            <feTurbulence type="turbulence" 
                baseFrequency="0.01" 
                numOctaves="2" 
                result="turbulence" />
            <feDisplacementMap in="SourceGraphic"
                in2="turbulence"    
                scale="25" xChannelSelector="R" yChannelSelector="G" />
        </filter>
    </svg>
  </nav>
</template>

<style scoped>
.liquid-menu {
  position: relative;
  display: inline-flex;
  max-width: 100%;
  overflow: visible;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.menu-bg {
  position: absolute;
  inset: 0;
  border-radius: 40px;
  
  /* On baisse l'opacité du noir à 0.1 pour bien voir l'arrière-plan */
  background-color: rgba(15, 15, 15, 0.1); 
  /* On utilise le même effet "liquid glass" que la bulle de sélection */
  backdrop-filter: brightness(1.2) blur(1px) url(#menuDisplacementFilter);
  
  /* Un peu de box-shadow pour l'effet de bordure en verre */
  box-shadow: 
    inset 1px 1px 1px 0px rgba(255, 255, 255, 0.4), 
    inset -1px -1px 2px 0px rgba(0, 0, 0, 0.1),
    inset 0 0 8px 1px rgba(255, 255, 255, 0.15),
    0 10px 40px rgba(0, 0, 0, 0.8);
  z-index: 0;
}

.menu-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 6px;
  position: relative;
  flex-wrap: nowrap;
}

.menu-item {
  position: relative;
  padding: 10px 24px;
  cursor: pointer;
  font-family: system-ui, sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #909090;
  user-select: none;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.menu-item.active,
.menu-item:hover {
  color: #ffffff;
  z-index: 3;
}

.menu-item.active .item-content,
.menu-item:hover .item-content {
  transform: scale(1.05); /* Slight pop effect like the dock */
}

.menu-item .item-content {
  position: relative;
  transition: all 0.2s ease-in-out; 
  display: flex;
  align-items: center;
  gap: 8px; /* Space between icon and text */
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.active-bubble {
  position: absolute;
  border-radius: 35px;
  /* Elatic bounce dynamic to duration */
  transition: 
    left var(--move-duration, 0.8s) cubic-bezier(0.34, 1.25, 0.64, 1),
    top var(--move-duration, 0.8s) cubic-bezier(0.34, 1.25, 0.64, 1),
    width var(--move-duration, 0.8s) cubic-bezier(0.34, 1.25, 0.64, 1),
    height var(--move-duration, 0.8s) cubic-bezier(0.34, 1.25, 0.64, 1),
    backdrop-filter 0.3s ease,
    background-color 0.3s ease,
    box-shadow 0.3s ease,
    transform 0.4s ease-out;
  pointer-events: none; /* Let clicks pass through to text */
  transform: scale(1);
  
  /* Resting state look: Pure white frosted glass effect */
  backdrop-filter: blur(20px) saturate(1.1);
  background-color: rgba(255, 255, 255, 0.18); /* Plus blanc et opaque */
  box-shadow: 
    inset 0 1px 2px rgba(255, 255, 255, 0.25), /* Reflet blanc plus marqué */
    inset 0 0 0 1px rgba(255, 255, 255, 0.1), /* Contour blanc fin */
    0 4px 15px rgba(0, 0, 0, 0.15); /* Ombre plus diffuse pour un look aérien */
  z-index: 2; /* Sit visibly over the text to refract it */
}

.active-bubble.moving {
  /* Liquid glass effect applied only during movement */
  backdrop-filter: brightness(1.2) blur(1px) url(#menuDisplacementFilter);
  background-color: rgba(255, 255, 255, 0.02);
  box-shadow: inset 1px 1px 1px 0px rgba(255, 255, 255, 0.4), 
              inset -1px -1px 2px 0px rgba(0, 0, 0, 0.1),
              inset 0 0 8px 1px rgba(255, 255, 255, 0.15);
  
  transition: 
    left var(--move-duration, 0.8s) cubic-bezier(0.34, 1.25, 0.64, 1),
    top var(--move-duration, 0.8s) cubic-bezier(0.34, 1.25, 0.64, 1),
    width var(--move-duration, 0.8s) cubic-bezier(0.34, 1.25, 0.64, 1),
    height var(--move-duration, 0.8s) cubic-bezier(0.34, 1.25, 0.64, 1),
    backdrop-filter 0.1s ease,
    background-color 0.1s ease,
    box-shadow 0.1s ease,
    transform 0.4s ease-out;
}

/* Enlarge the bubble when it starts travelling */
.active-bubble.growing {
  transform: scale(1.35);
  background-color: rgba(255, 255, 255, 0.02);
  box-shadow: inset 1px 1px 1px 0px rgba(255, 255, 255, 0.4), 
              inset -1px -1px 2px 0px rgba(0, 0, 0, 0.1),
              inset 0 0 8px 1px rgba(255, 255, 255, 0.15);
  
  /* Fast grow when the growing class is applied */
  transition: 
    left var(--move-duration, 0.8s) cubic-bezier(0.34, 1.25, 0.64, 1),
    top var(--move-duration, 0.8s) cubic-bezier(0.34, 1.25, 0.64, 1),
    width var(--move-duration, 0.8s) cubic-bezier(0.34, 1.25, 0.64, 1),
    height var(--move-duration, 0.8s) cubic-bezier(0.34, 1.25, 0.64, 1),
    backdrop-filter 0.1s ease,
    background-color 0.1s ease,
    box-shadow 0.1s ease,
    transform 0.15s ease-out;
}

@media (max-width: 900px) {
  .menu-item {
    padding: 9px 16px;
    font-size: 14px;
  }

  .item-content {
    gap: 6px;
  }
}

@media (max-width: 640px) {
  .menu-list {
    padding: 4px;
  }

  .menu-item {
    padding: 8px 10px;
    font-size: 12px;
  }

  .item-icon {
    display: none;
  }

  .item-text {
    white-space: nowrap;
  }
}

@media (max-width: 480px) {
  .menu-item {
    padding: 8px 8px;
    font-size: 11px;
  }
}
</style>
