<template>
  <section class="showcase-section">
    <h2 class="section-title reveal">Latest Posts</h2>
    <div class="section-title-bar reveal"></div>
    <p class="section-subtitle reveal">Thoughts, tutorials, and technical writing placeholder</p>

    <div class="blog-grid reveal-stagger">
      <div v-for="i in 3" :key="i" class="glass-card blog-card">
        <div class="placeholder-image blog-cover"></div>
        <div class="blog-body">
          <div class="blog-meta">
            <span class="placeholder-tag">Category</span>
            <span class="blog-date">Mar {{ i }}, 2026</span>
          </div>
          <div class="placeholder-text" style="width: 85%; height: 1.3rem; margin-bottom: 0.5rem;"></div>
          <div class="placeholder-text" style="margin-bottom: 0.3rem;"></div>
          <div class="placeholder-text" style="width: 90%; margin-bottom: 0.3rem;"></div>
          <div class="placeholder-text" style="width: 60%; margin-bottom: 1rem;"></div>
          <span class="read-more">Read more →</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.blog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.blog-card {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.blog-cover {
  border-radius: 24px 24px 0 0;
  aspect-ratio: 16 / 9;
}

.blog-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.blog-meta {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
}

.blog-date {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.35);
}

.read-more {
  font-size: 0.85rem;
  color: #4a90e2;
  cursor: pointer;
  margin-top: auto;
  transition: color 0.3s ease;
}

.read-more:hover {
  color: #6dacf0;
}

@media (max-width: 1024px) {
  .blog-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .blog-grid {
    grid-template-columns: 1fr;
  }
}
</style>
