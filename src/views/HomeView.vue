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
    <!-- Fixed background image -->
    <div class="bg-image"></div>
    <div class="bg-overlay"></div>

    <div class="showcase-container" @mousemove="handleGlassMove">
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <PublicationsSection />
      <TimelineSection />
      <BlogSection />
    </div>

    <!-- Visitor map: overlaid on background, outside showcase -->
    <VisitorMapSection />
  </main>
</template>

<style scoped>
main {
  width: 100%;
  position: relative;
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
  opacity: 0.22;
  filter: blur(2px);
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
    rgba(10, 10, 26, 0.5) 0%,
    rgba(10, 10, 26, 0.2) 25%,
    rgba(10, 10, 26, 0.35) 60%,
    rgba(10, 10, 26, 0.5) 80%,
    rgba(0, 0, 0, 0.7) 100%
  );
  z-index: 0;
  pointer-events: none;
}
</style>
