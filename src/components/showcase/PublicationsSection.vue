<template>
  <section class="showcase-section">
    <h2 class="section-title reveal">Publications & Research</h2>
    <div class="section-title-bar reveal"></div>
    <p class="section-subtitle reveal">Academic papers and research contributions placeholder</p>

    <div class="publications-list reveal-stagger">
      <div v-for="i in 3" :key="i" class="glass-card pub-card">
        <div class="pub-year">
          <span class="placeholder-tag">{{ 2026 - i }}</span>
        </div>
        <div class="pub-content">
          <div class="placeholder-text" style="width: 85%; height: 1.3rem; margin-bottom: 0.5rem;"></div>
          <div class="pub-authors">
            <div class="placeholder-text" style="width: 60%; height: 0.85rem; margin-bottom: 0.5rem;"></div>
          </div>
          <div class="pub-venue">
            <div class="placeholder-text" style="width: 45%; height: 0.85rem; margin-bottom: 0.8rem;"></div>
          </div>
          <div class="placeholder-text" style="margin-bottom: 0.3rem;"></div>
          <div class="placeholder-text" style="width: 92%; margin-bottom: 0.3rem;"></div>
          <div class="placeholder-text" style="width: 70%; margin-bottom: 1rem;"></div>
          <div class="pub-links">
            <span class="placeholder-tag">PDF</span>
            <span class="placeholder-tag">DOI</span>
            <span class="placeholder-tag">BibTeX</span>
            <span class="placeholder-tag">Code</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.publications-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  max-width: 900px;
  margin: 0 auto;
}

.pub-card {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.pub-year {
  flex-shrink: 0;
  padding-top: 0.2rem;
}

.pub-content {
  flex: 1;
  min-width: 0;
}

.pub-authors,
.pub-venue {
  opacity: 0.6;
}

.pub-links {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .pub-card {
    flex-direction: column;
    gap: 0.8rem;
  }
}
</style>
