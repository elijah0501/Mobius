<script setup>
import { computed, ref } from 'vue'
import { projects } from '@/content/projects.js'

const previewCount = 5
const pageSize = 10
const expanded = ref(false)
const page = ref(1)

const pageCount = computed(() => Math.ceil(projects.length / pageSize))

const visibleProjects = computed(() => {
  if (!expanded.value) return projects.slice(0, previewCount)
  const start = (page.value - 1) * pageSize
  return projects.slice(start, start + pageSize)
})

function toggleList() {
  expanded.value = !expanded.value
  if (!expanded.value) page.value = 1
}

function goTo(nextPage) {
  page.value = Math.min(pageCount.value, Math.max(1, nextPage))
}
</script>

<template>
  <section class="showcase-section">
    <h2 class="section-title reveal">Projects</h2>
    <div class="section-title-bar reveal"></div>

    <div class="project-wrap reveal">
      <ol id="project-entries" class="project-list">
        <li v-for="project in visibleProjects" :key="project.title" class="project-entry">
          <div class="project-year">{{ project.year }}</div>
          <div class="project-content">
            <p class="project-title">{{ project.title }}</p>
            <p class="project-dates">{{ project.dates }}</p>
            <p v-if="project.focus" class="project-focus">{{ project.focus }}</p>
            <ul v-if="project.points.length" class="project-points">
              <li v-for="point in project.points" :key="point">{{ point }}</li>
            </ul>
          </div>
        </li>
      </ol>
      <div v-if="projects.length > previewCount" class="project-more">
        <button
          type="button"
          class="project-disclosure"
          :aria-expanded="expanded"
          :aria-label="expanded ? 'Collapse projects' : 'Expand projects'"
          aria-controls="project-entries"
          @click="toggleList"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 9.5 12 15.5 18 9.5" />
          </svg>
        </button>
        <nav v-if="expanded && pageCount > 1" class="project-pages" aria-label="Project pages">
          <button type="button" class="project-toggle" :disabled="page === 1" @click="goTo(page - 1)">Previous</button>
          <button
            v-for="number in pageCount"
            :key="number"
            type="button"
            class="project-toggle"
            :class="{ 'is-current': number === page }"
            :aria-current="number === page ? 'page' : undefined"
            @click="goTo(number)"
          >{{ number }}</button>
          <button type="button" class="project-toggle" :disabled="page === pageCount" @click="goTo(page + 1)">Next</button>
        </nav>
      </div>
    </div>
  </section>
</template>

<style scoped>
.project-wrap {
  width: 100%;
  max-width: 70rem;
  margin: 0 auto;
}

.project-list {
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

.project-entry {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  padding: 1.15rem 0;
  background: none;
}

.project-entry + .project-entry {
  border-top: 1px solid rgba(63, 58, 54, 0.72);
}

.project-year {
  flex: 0 0 3.6rem;
  padding-top: 0.15rem;
  font-size: 0.95rem;
  line-height: 1.45;
  color: var(--muted);
}

.project-content {
  flex: 1;
  min-width: 0;
}

.project-title,
.project-dates,
.project-focus {
  margin: 0;
}

.project-title {
  font-size: 1.05rem;
  line-height: 1.45;
  color: var(--ink);
}

.project-dates {
  margin-top: 0.35rem;
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--muted);
}

.project-focus {
  margin-top: 0.28rem;
  font-size: 0.92rem;
  line-height: 1.55;
  font-style: italic;
  color: var(--muted);
}

.project-points {
  margin: 0.45rem 0 0;
  padding: 0;
  list-style: none;
}

.project-points li {
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--muted);
}

.project-points li + li {
  margin-top: 0.2rem;
}

.project-more,
.project-pages {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
}

.project-more {
  justify-content: center;
  margin-top: 0.15rem;
}

.project-disclosure {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: none;
  color: var(--muted);
  cursor: pointer;
  appearance: none;
}

.project-disclosure svg {
  width: 1.15rem;
  height: 1.15rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.28s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.project-disclosure[aria-expanded='true'] svg {
  transform: rotate(180deg);
}

.project-disclosure:hover,
.project-disclosure:focus-visible {
  color: var(--foil-gold-hi);
}

.project-disclosure:hover svg,
.project-disclosure:focus-visible svg {
  transform: scale(1.12);
}

.project-disclosure[aria-expanded='true']:hover svg,
.project-disclosure[aria-expanded='true']:focus-visible svg {
  transform: rotate(180deg) scale(1.12);
}

.project-disclosure:focus-visible {
  outline: 1px solid var(--foil-gold-lo);
  outline-offset: 2px;
}

.project-toggle {
  display: inline-block;
  padding: 0.22rem 0.7rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(245, 240, 232, 0.04);
  font: inherit;
  color: var(--muted);
  white-space: nowrap;
  cursor: pointer;
  appearance: none;
}

.project-toggle:hover,
.project-toggle:focus-visible {
  color: var(--ink);
  border-color: var(--foil-gold-lo);
}

.project-toggle.is-current {
  color: var(--ink);
  border-color: var(--foil-gold-lo);
}

.project-toggle:disabled {
  cursor: default;
  opacity: 0.45;
}

@media (max-width: 640px) {
  .project-entry {
    flex-direction: column;
    gap: 0.3rem;
  }

  .project-year {
    flex-basis: auto;
    padding-top: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-disclosure svg {
    transition: none;
  }
}
</style>
