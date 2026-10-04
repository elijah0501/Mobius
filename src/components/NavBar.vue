<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import BrandGoldDust from '@/components/BrandGoldDust.vue'
import { useCollapsingNav } from '@/composables/useCollapsingNav'

const route = useRoute()
const headerRef = ref(null)
const linksRef = ref(null)
const { compact, narrow, remeasure } = useCollapsingNav(headerRef, linksRef)

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
]

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(`${path}/`)
}

watch(
  () => route.path,
  () => {
    requestAnimationFrame(() => remeasure.value())
  },
)
</script>

<template>
  <header ref="headerRef" class="site-nav liquid-glass" :class="{ 'site-nav--compact': compact }">
    <div class="site-nav__inner">
      <RouterLink to="/" class="site-nav__home" aria-label="Default">
        <span class="site-nav__logo" aria-hidden="true" />
        <span class="site-nav__brand">
          <BrandGoldDust />
          <span class="site-nav__word"><span class="site-nav__word-lead">D</span>efault</span>
        </span>
      </RouterLink>

      <nav ref="linksRef" class="site-nav__links" aria-label="Primary">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="site-nav__link"
          :class="{ 'site-nav__link--active': isActive(link.to) }"
          :aria-current="isActive(link.to) ? 'page' : undefined"
          :title="compact || narrow ? link.label : undefined"
        >
          <span class="site-nav__link-icon" aria-hidden="true">
            <svg
              v-if="link.to === '/'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 10.5 12 4l8 6.5" />
              <path d="M6.5 9.8V19.5h11V9.8" />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="8" r="2.4" />
              <path d="M6.6 19.2c.7-2.8 2.8-4.2 5.4-4.2s4.7 1.4 5.4 4.2" />
            </svg>
          </span>
          <span class="site-nav__link-text">{{ link.label }}</span>
        </RouterLink>
      </nav>
    </div>
  </header>
  <div class="site-nav-spacer" aria-hidden="true" />
</template>
