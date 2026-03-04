<template>
  <section class="showcase-section">
    <h2 class="section-title reveal">Featured Projects</h2>
    <div class="section-title-bar reveal"></div>
    <p class="section-subtitle reveal">Selected work and open-source contributions placeholder</p>

    <div class="projects-grid reveal-stagger">
      <div v-for="i in 3" :key="i" class="glass-card project-card">
        <div class="placeholder-image"></div>
        <div class="project-body">
          <div class="placeholder-text" style="width: 70%; height: 1.4rem; margin-bottom: 0.6rem;"></div>
          <div class="placeholder-text" style="margin-bottom: 0.4rem;"></div>
          <div class="placeholder-text" style="width: 85%; margin-bottom: 1rem;"></div>
          <div class="project-tags">
            <span class="placeholder-tag">Tech</span>
            <span class="placeholder-tag">Framework</span>
            <span class="placeholder-tag">Tool</span>
          </div>
          <div class="project-links">
            <span class="placeholder-tag">⬡ Source</span>
            <span class="placeholder-tag">↗ Demo</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.projects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.project-card {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.project-card .placeholder-image {
  border-radius: 24px 24px 0 0;
  aspect-ratio: 16 / 10;
}

.project-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.project-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.project-links {
  display: flex;
  gap: 0.6rem;
  margin-top: auto;
}

@media (max-width: 1024px) {
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>
