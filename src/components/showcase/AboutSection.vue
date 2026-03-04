<template>
  <section class="showcase-section reveal">
    <h2 class="section-title">About Me</h2>
    <div class="section-title-bar"></div>
    <p class="section-subtitle">A brief introduction placeholder</p>

    <div class="glass-card about-card">
      <div class="about-content">
        <div class="about-left">
          <div class="placeholder-avatar"></div>
          <div class="about-social">
            <span class="placeholder-tag">GitHub</span>
            <span class="placeholder-tag">LinkedIn</span>
            <span class="placeholder-tag">Scholar</span>
            <span class="placeholder-tag">Email</span>
          </div>
        </div>
        <div class="about-info">
          <div class="placeholder-text name" style="width: 220px; height: 2rem; margin-bottom: 0.6rem;"></div>
          <div class="placeholder-text tagline" style="width: 300px; height: 1.1rem; margin-bottom: 1.5rem;"></div>
          <div class="placeholder-text" style="margin-bottom: 0.6rem;"></div>
          <div class="placeholder-text" style="margin-bottom: 0.6rem;"></div>
          <div class="placeholder-text" style="width: 90%; margin-bottom: 0.6rem;"></div>
          <div class="placeholder-text" style="width: 75%; margin-bottom: 1.5rem;"></div>
          <div class="about-meta">
            <div class="meta-item">
              <span class="meta-label">Location</span>
              <div class="placeholder-text" style="width: 120px; height: 0.9rem;"></div>
            </div>
            <div class="meta-item">
              <span class="meta-label">Institution</span>
              <div class="placeholder-text" style="width: 160px; height: 0.9rem;"></div>
            </div>
            <div class="meta-item">
              <span class="meta-label">Interests</span>
              <div class="placeholder-text" style="width: 200px; height: 0.9rem;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-card {
  max-width: 900px;
  margin: 0 auto;
}

.about-content {
  display: flex;
  align-items: flex-start;
  gap: 3rem;
}

.about-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  flex-shrink: 0;
}

.about-social {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
  max-width: 160px;
}

.about-info {
  flex: 1;
  min-width: 0;
}

.about-meta {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.meta-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.35);
  width: 80px;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .about-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .about-meta {
    align-items: center;
  }

  .meta-item {
    flex-direction: column;
    gap: 0.3rem;
  }

  .meta-label {
    width: auto;
  }
}
</style>
