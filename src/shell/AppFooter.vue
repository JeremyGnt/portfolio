<script setup lang="ts">
import { computed } from 'vue'

const year = computed(() => new Date().getFullYear())
</script>

<template>
  <footer class="footer">
    <p>© {{ year }} Jérémy Gonnet</p>
  </footer>
</template>
