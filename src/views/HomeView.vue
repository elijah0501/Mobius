<script setup>
import { onMounted, onUnmounted, nextTick } from 'vue'
import TheWelcome from '../components/TheWelcome.vue'
import AboutSection from '@/components/showcase/AboutSection.vue'
import SkillsSection from '@/components/showcase/SkillsSection.vue'
import ProjectsSection from '@/components/showcase/ProjectsSection.vue'
import PublicationsSection from '@/components/showcase/PublicationsSection.vue'
import TimelineSection from '@/components/showcase/TimelineSection.vue'
import BlogSection from '@/components/showcase/BlogSection.vue'
import VisitorMapSection from '@/components/showcase/VisitorMapSection.vue'
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
    <TheWelcome />
    <div class="showcase-container" @mousemove="handleGlassMove">
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <PublicationsSection />
      <TimelineSection />
      <BlogSection />
      <VisitorMapSection />
    </div>
  </main>
</template>

<style scoped>
main {
  width: 100%;
}
</style>
