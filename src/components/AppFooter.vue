<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useVisitorHistoryPanel } from '@/composables/useVisitorHistoryPanel'

const route = useRoute()
const router = useRouter()
const { open, toggle } = useVisitorHistoryPanel()

function onSwitch() {
  if (route.name !== 'home') {
    open.value = true
    router.push({ name: 'home' })
    return
  }
  toggle()
}
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <p class="site-footer__brand">Möbius</p>
      <p class="site-footer__byline">© 2026 · created by Elija<button
          type="button"
          class="site-footer__switch"
          :class="{ 'is-open': open }"
          :aria-expanded="open"
          aria-controls="visitor-history"
          aria-label="Visitor history"
          @click="onSwitch"
        >h</button></p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer__byline {
  white-space: nowrap;
}

.site-footer__switch {
  display: inline;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  vertical-align: baseline;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
}

.site-footer__switch.is-open,
.site-footer__switch:hover,
.site-footer__switch:focus-visible {
  color: var(--foil-gold-hi);
}

.site-footer__switch:focus-visible {
  outline: 1px solid var(--accent-line);
  outline-offset: 2px;
}
</style>
