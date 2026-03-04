<template>
  <section class="showcase-section">
    <h2 class="section-title reveal">Skills & Technologies</h2>
    <div class="section-title-bar reveal"></div>
    <p class="section-subtitle reveal">Technical stack and proficiency placeholder</p>

    <div class="skills-grid reveal-stagger">
      <div v-for="i in 8" :key="i" class="glass-card skill-card">
        <div class="skill-header">
          <div class="placeholder-icon"></div>
          <div class="placeholder-text" style="width: 100px; height: 1rem;"></div>
        </div>
        <div class="placeholder-bar">
          <div class="placeholder-bar-fill" :style="{ width: (40 + Math.random() * 55) + '%' }"></div>
        </div>
        <div class="skill-tags">
          <span class="placeholder-tag">Tag</span>
          <span class="placeholder-tag">Tag</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.skills-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.2rem;
}

.skill-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skill-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.skill-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

@media (max-width: 1024px) {
  .skills-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .skills-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .skills-grid {
    grid-template-columns: 1fr;
  }
}
</style>
