<script setup>
import { onMounted, onUnmounted, nextTick } from 'vue'
import AboutSection from '@/components/showcase/AboutSection.vue'
import ProjectsSection from '@/components/showcase/ProjectsSection.vue'
import VisitorLocation from '@/components/showcase/VisitorLocation.vue'
import { handleGlassMove } from '@/composables/useGlassEffect'

let observer = null

onMounted(async () => {
  await nextTick()

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  )

  document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => {
    observer.observe(el)
  })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<template>
  <main>
    <div class="showcase-container" @mousemove="handleGlassMove">
      <AboutSection split />
      <ProjectsSection />
      <VisitorLocation />
    </div>
  </main>
</template>

<style scoped>
main {
  width: 100%;
}
</style>
