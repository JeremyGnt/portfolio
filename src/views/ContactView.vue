<script setup lang="ts">
import { onMounted } from 'vue'
import gsap from 'gsap'
import { Mail, Linkedin, Github, Phone } from 'lucide-vue-next'

interface ContactItem {
  href: string
  icon: object
  label: string
  value: string
  target?: string
}

const contacts: ContactItem[] = [
  { href: 'mailto:jeremy.gonnet31@gmail.com', icon: Mail, label: 'Email', value: 'jeremy.gonnet31@gmail.com' },
  { href: 'https://linkedin.com/in/jeremygonnet', icon: Linkedin, label: 'LinkedIn', value: 'linkedin.com/in/jeremygonnet', target: '_blank' },
  { href: 'https://github.com/JeremyGnt', icon: Github, label: 'GitHub', value: 'github.com/JeremyGnt', target: '_blank' },
  { href: 'tel:+33782846856', icon: Phone, label: 'Téléphone', value: '+33 7 82 84 68 56' },
]

function triggerReveal() {
  const revealEls = document.querySelectorAll('.reveal')
  revealEls.forEach((el, i) => {
    gsap.set(el, { opacity: 0, y: 24 })
    gsap.to(el, { opacity: 1, y: 0, duration: 0.65, delay: i * 0.08, ease: 'power2.out' })
  })
}

onMounted(() => setTimeout(triggerReveal, 100))
</script>

<template>
  <div class="pages-wrapper">
    <section class="page active">
      <div class="page-inner contact-center">
        <div class="hero reveal">
          <p class="hero-kicker">Me contacter</p>
          <h1>Restons en <span class="gradient-text">contact</span></h1>
          <p class="hero-description">
            N'hésitez pas à me contacter pour toute opportunité ou collaboration.
          </p>
        </div>

        <div class="contact-grid reveal">
          <a
            v-for="contact in contacts"
            :key="contact.label"
            :href="contact.href"
            :target="contact.target"
            :rel="contact.target ? 'noopener noreferrer' : undefined"
            class="card glass contact-card"
          >
            <div class="contact-icon">
              <component :is="contact.icon" :size="28" />
            </div>
            <h3>{{ contact.label }}</h3>
            <p>{{ contact.value }}</p>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>
