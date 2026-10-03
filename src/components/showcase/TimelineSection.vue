<template>
  <section class="showcase-section">
    <h2 class="section-title reveal">Experience</h2>
    <div class="section-title-bar reveal"></div>
    <p class="section-subtitle reveal">Education and career journey placeholder</p>

    <div class="timeline reveal-stagger">
      <div v-for="i in 4" :key="i" class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-connector"></div>
        <div class="glass-card timeline-card">
          <div class="timeline-date">
            <span class="placeholder-tag">{{ 2027 - i }} — Present</span>
          </div>
          <div class="placeholder-text" style="width: 60%; height: 1.3rem; margin-bottom: 0.4rem;"></div>
          <div class="placeholder-text" style="width: 40%; height: 0.9rem; margin-bottom: 1rem; opacity: 0.5;"></div>
          <div class="placeholder-text" style="margin-bottom: 0.4rem;"></div>
          <div class="placeholder-text" style="width: 88%; margin-bottom: 0.4rem;"></div>
          <div class="placeholder-text" style="width: 65%;"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.timeline {
  position: relative;
  max-width: 750px;
  margin: 0 auto;
  padding-left: 3rem;
}

.timeline-item {
  position: relative;
  margin-bottom: 1.5rem;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -3rem;
  top: 2rem;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--foil-gold-hi) 0%, var(--foil-gold) 70%);
  border: 1px solid rgba(243, 226, 168, 0.45);
  transform: translateX(-50%);
  z-index: 2;
  box-shadow: 0 0 12px rgba(212, 175, 55, 0.35);
}

.timeline-connector {
  position: absolute;
  left: calc(-3rem - 1px);
  top: 2rem;
  width: 2px;
  height: calc(100% + 1.5rem);
  background: linear-gradient(180deg, rgba(212, 175, 55, 0.45), rgba(158, 196, 212, 0.05));
  transform: translateX(-50%);
}

.timeline-item:last-child .timeline-connector {
  display: none;
}

.timeline-card {
  padding: 1.5rem;
}

.timeline-date {
  margin-bottom: 0.8rem;
}

@media (max-width: 640px) {
  .timeline {
    padding-left: 2rem;
  }

  .timeline-dot {
    left: -2rem;
  }

  .timeline-connector {
    left: calc(-2rem - 1px);
  }
}
</style>
