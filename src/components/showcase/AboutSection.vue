<template>
  <section class="showcase-section reveal">
    <h2 class="section-title">About Me</h2>
    <div class="section-title-bar"></div>
    <p class="section-subtitle">A brief introduction placeholder</p>

    <div class="about-layout">
      <div class="about-portrait" role="img" aria-label="Portrait placeholder"></div>
      <div class="about-card">
        <div class="about-content">
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
          <div class="about-social">
            <span class="placeholder-tag">GitHub</span>
            <span class="placeholder-tag">LinkedIn</span>
            <span class="placeholder-tag">Scholar</span>
            <span class="placeholder-tag">Email</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-layout {
  display: grid;
  grid-template-columns: minmax(13.2rem, 1fr) minmax(0, 53.5rem);
  align-items: center;
  width: 100%;
}

.about-portrait {
  width: 13.2rem;
  height: 13.2rem;
  justify-self: center;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 40%, rgba(245, 240, 232, 0.16), transparent 42%),
    linear-gradient(155deg, rgba(90, 143, 168, 0.42), rgba(23, 20, 17, 0.15) 58%, rgba(212, 175, 55, 0.28));
  border: 1px solid rgba(212, 175, 55, 0.38);
  box-shadow:
    inset 0 0 0 0.45rem rgba(0, 0, 0, 0.28),
    0 12px 28px rgba(0, 0, 0, 0.28);
}

.about-card {
  width: 100%;
  max-width: 53.5rem;
  min-width: 0;
  margin: 0;
  justify-self: end;
}

.about-content {
  display: flex;
  align-items: flex-start;
}

.about-info {
  flex: 1;
  min-width: 0;
}

.about-social {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.8rem;
  padding-top: 1.2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
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
  color: var(--muted);
  width: 80px;
  flex-shrink: 0;
}

@media (max-width: 760px) {
  .about-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 1.6rem;
  }

  .about-card {
    width: 100%;
    flex-basis: auto;
  }

  .about-portrait {
    width: 10.45rem;
    height: 10.45rem;
  }
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

  .about-social {
    justify-content: center;
  }
}
</style>
