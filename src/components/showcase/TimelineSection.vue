<script setup>
import { computed, ref } from 'vue'
import { experiences } from '@/content/experience.js'

const previewCount = 5
const pageSize = 10
const expanded = ref(false)
const page = ref(1)

const pageCount = computed(() => Math.ceil(experiences.length / pageSize))

const visibleExperiences = computed(() => {
  if (!expanded.value) return experiences.slice(0, previewCount)
  const start = (page.value - 1) * pageSize
  return experiences.slice(start, start + pageSize)
})

function startYear(dates) {
  const match = dates.match(/\d{4}/)
  return match ? match[0] : ''
}

function placeLine(item) {
  if (!item.location) return item.organization
  return `${item.organization}, ${item.location}`
}

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
    <h2 class="section-title reveal">Experience</h2>
    <div class="section-title-bar reveal"></div>

    <div class="experience-wrap reveal">
      <ol id="experience-entries" class="experience-list">
        <li v-for="item in visibleExperiences" :key="`${item.role}-${item.dates}`" class="experience-entry">
          <div class="experience-year">{{ startYear(item.dates) }}</div>
          <div class="experience-content">
            <p class="experience-title">{{ item.role }}</p>
            <p class="experience-dates">{{ item.dates }}</p>
            <p class="experience-place">{{ placeLine(item) }}</p>
            <ul v-if="item.points.length" class="experience-points">
              <li v-for="point in item.points" :key="point">{{ point }}</li>
            </ul>
          </div>
        </li>
      </ol>
      <div v-if="experiences.length > previewCount" class="experience-more">
        <button
          type="button"
          class="experience-disclosure"
          :aria-expanded="expanded"
          :aria-label="expanded ? 'Collapse experience' : 'Expand experience'"
          aria-controls="experience-entries"
          @click="toggleList"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 9.5 12 15.5 18 9.5" />
          </svg>
        </button>
        <nav v-if="expanded && pageCount > 1" class="experience-pages" aria-label="Experience pages">
          <button type="button" class="experience-toggle" :disabled="page === 1" @click="goTo(page - 1)">Previous</button>
          <button
            v-for="number in pageCount"
            :key="number"
            type="button"
            class="experience-toggle"
            :class="{ 'is-current': number === page }"
            :aria-current="number === page ? 'page' : undefined"
            @click="goTo(number)"
          >{{ number }}</button>
          <button type="button" class="experience-toggle" :disabled="page === pageCount" @click="goTo(page + 1)">Next</button>
        </nav>
      </div>
    </div>
  </section>
</template>

<style scoped>
.experience-wrap {
  width: 100%;
  max-width: 70rem;
  margin: 0 auto;
}

.experience-list {
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

.experience-entry {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  padding: 1.15rem 0;
  background: none;
}

.experience-entry + .experience-entry {
  border-top: 1px solid rgba(63, 58, 54, 0.72);
}

.experience-year {
  flex: 0 0 3.6rem;
  padding-top: 0.15rem;
  font-size: 0.95rem;
  line-height: 1.45;
  color: var(--muted);
}

.experience-content {
  flex: 1;
  min-width: 0;
}

.experience-title,
.experience-dates,
.experience-place {
  margin: 0;
}

.experience-title {
  font-size: 1rem;
  line-height: 1.45;
  color: var(--ink);
}

.experience-dates {
  margin-top: 0.35rem;
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--muted);
}

.experience-place {
  margin-top: 0.28rem;
  font-size: 0.92rem;
  line-height: 1.55;
  font-style: italic;
  color: var(--muted);
}

.experience-points {
  margin: 0.45rem 0 0;
  padding: 0;
  list-style: none;
}

.experience-points li {
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--muted);
}

.experience-points li + li {
  margin-top: 0.2rem;
}

.experience-more,
.experience-pages {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
}

.experience-more {
  justify-content: center;
  margin-top: 0.15rem;
}

.experience-disclosure {
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

.experience-disclosure svg {
  width: 1.15rem;
  height: 1.15rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.28s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.experience-disclosure[aria-expanded='true'] svg {
  transform: rotate(180deg);
}

.experience-disclosure:hover,
.experience-disclosure:focus-visible {
  color: var(--foil-gold-hi);
}

.experience-disclosure:hover svg,
.experience-disclosure:focus-visible svg {
  transform: scale(1.12);
}

.experience-disclosure[aria-expanded='true']:hover svg,
.experience-disclosure[aria-expanded='true']:focus-visible svg {
  transform: rotate(180deg) scale(1.12);
}

.experience-disclosure:focus-visible {
  outline: 1px solid var(--foil-gold-lo);
  outline-offset: 2px;
}

.experience-toggle {
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

.experience-toggle:hover,
.experience-toggle:focus-visible {
  color: var(--ink);
  border-color: var(--foil-gold-lo);
}

.experience-toggle.is-current {
  color: var(--ink);
  border-color: var(--foil-gold-lo);
}

.experience-toggle:disabled {
  cursor: default;
  opacity: 0.45;
}

@media (max-width: 640px) {
  .experience-entry {
    flex-direction: column;
    gap: 0.3rem;
  }

  .experience-year {
    flex-basis: auto;
    padding-top: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .experience-disclosure svg {
    transition: none;
  }
}
</style>
