<script setup>
import { onMounted, onUnmounted, nextTick } from 'vue'
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
    <div class="showcase-container" @mousemove="handleGlassMove">
      <!-- Fixed background image with reduced visibility -->
      <div class="bg-image"></div>
      <div class="bg-overlay"></div>

      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <PublicationsSection />
      <TimelineSection />
      <BlogSection />
      <VisitorMapSection />
      <!-- Bottom fade to black -->
      <div class="bottom-fade"></div>
    </div>
  </main>
</template>

<style scoped>
main {
  width: 100%;
}

.bg-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.12;
  z-index: 0;
  pointer-events: none;
}

.bg-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(
    180deg,
    rgba(10, 10, 26, 0.6) 0%,
    rgba(10, 10, 26, 0.3) 30%,
    rgba(10, 10, 26, 0.5) 70%,
    rgba(0, 0, 0, 0.9) 100%
  );
  z-index: 0;
  pointer-events: none;
}
</style>
