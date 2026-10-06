<script setup>
import { computed, ref } from 'vue'
import { publications } from '@/content/publications.js'

const previewCount = 5
const pageSize = 10
const expanded = ref(false)
const page = ref(1)

const pageCount = computed(() => Math.ceil(publications.length / pageSize))

const visiblePapers = computed(() => {
  if (!expanded.value) return publications.slice(0, previewCount)
  const start = (page.value - 1) * pageSize
  return publications.slice(start, start + pageSize)
})

function authorLead(index, authors) {
  if (index === 0) return ''
  if (authors[index] === 'et al.') return ', '
  if (authors.length === 2) return ' and '
  if (index === authors.length - 1) return ', and '
  return ', '
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
    <h2 class="section-title reveal">Publications & Research</h2>
    <div class="section-title-bar reveal"></div>

    <div class="publications-wrap reveal">
    <ol id="publication-entries" class="publications-list">
      <li v-for="paper in visiblePapers" :key="paper.title" class="pub-entry">
        <div class="pub-year">{{ paper.year }}</div>
        <div class="pub-content">
          <p class="pub-title">{{ paper.title }}</p>
          <p class="pub-authors">
            <template v-for="(author, index) in paper.authors" :key="`${paper.title}-${author}`">
              <span>{{ authorLead(index, paper.authors) }}</span>
              <span :class="{ 'pub-author--self': author === 'H. Zhang', 'pub-author--etal': author === 'et al.' }">{{ author }}</span>
            </template>
          </p>
          <p v-if="paper.venue" class="pub-venue">
            <span v-if="paper.proceedings">in </span>
            <span class="pub-venue__name">{{ paper.venue }}</span>
          </p>
          <div v-if="paper.notes?.length" class="pub-tags">
            <span v-for="note in paper.notes" :key="note" class="pub-tag">{{ note }}</span>
          </div>
        </div>
      </li>
    </ol>
    <div v-if="publications.length > previewCount" class="pub-more">
      <button
        type="button"
        class="pub-disclosure"
        :aria-expanded="expanded"
        :aria-label="expanded ? 'Collapse publications' : 'Expand publications'"
        aria-controls="publication-entries"
        @click="toggleList"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 9.5 12 15.5 18 9.5" />
        </svg>
      </button>
      <nav v-if="expanded && pageCount > 1" class="pub-pages" aria-label="Publication pages">
        <button type="button" class="pub-toggle" :disabled="page === 1" @click="goTo(page - 1)">Previous</button>
        <button
          v-for="number in pageCount"
          :key="number"
          type="button"
          class="pub-toggle"
          :class="{ 'is-current': number === page }"
          :aria-current="number === page ? 'page' : undefined"
          @click="goTo(number)"
        >{{ number }}</button>
        <button type="button" class="pub-toggle" :disabled="page === pageCount" @click="goTo(page + 1)">Next</button>
      </nav>
    </div>
    </div>
  </section>
</template>

<style scoped>
.publications-wrap {
  width: 100%;
  max-width: 70rem;
  margin: 0 auto;
}

.publications-list {
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pub-entry {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  padding: 1.15rem 0;
  background: none;
}

.pub-entry + .pub-entry {
  border-top: 1px solid rgba(63, 58, 54, 0.72);
}

.pub-year {
  flex: 0 0 3.6rem;
  padding-top: 0.15rem;
  font-size: 0.95rem;
  line-height: 1.45;
  color: var(--muted);
}

.pub-content {
  flex: 1;
  min-width: 0;
}

.pub-title,
.pub-authors,
.pub-venue {
  margin: 0;
}

.pub-title {
  font-size: 1rem;
  line-height: 1.45;
  color: var(--ink);
}

.pub-authors {
  margin-top: 0.35rem;
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--muted);
}

.pub-author--self {
  font-weight: 500;
  color: var(--ink);
}

.pub-author--etal {
  font-style: italic;
}

.pub-venue {
  margin-top: 0.28rem;
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--muted);
}

.pub-venue__name {
  font-style: italic;
}

.pub-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.75rem;
}

.pub-tag {
  display: inline-block;
  padding: 0.22rem 0.7rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(245, 240, 232, 0.04);
  font: inherit;
  color: var(--muted);
  white-space: nowrap;
  text-decoration: none;
}

.pub-tag:hover,
.pub-tag:focus-visible {
  color: var(--ink);
  border-color: var(--foil-gold-lo);
}

.pub-more,
.pub-pages {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
}

.pub-more {
  justify-content: center;
  margin-top: 0.15rem;
}

.pub-disclosure {
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

.pub-disclosure svg {
  width: 1.15rem;
  height: 1.15rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.28s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.pub-disclosure[aria-expanded='true'] svg {
  transform: rotate(180deg);
}

.pub-disclosure:hover,
.pub-disclosure:focus-visible {
  color: var(--foil-gold-hi);
}

.pub-disclosure:hover svg,
.pub-disclosure:focus-visible svg {
  transform: scale(1.12);
}

.pub-disclosure[aria-expanded='true']:hover svg,
.pub-disclosure[aria-expanded='true']:focus-visible svg {
  transform: rotate(180deg) scale(1.12);
}

.pub-disclosure:focus-visible {
  outline: 1px solid var(--foil-gold-lo);
  outline-offset: 2px;
}

.pub-toggle {
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

.pub-toggle:hover,
.pub-toggle:focus-visible {
  color: var(--ink);
  border-color: var(--foil-gold-lo);
}

.pub-toggle.is-current {
  color: var(--ink);
  border-color: var(--foil-gold-lo);
}

.pub-toggle:disabled {
  cursor: default;
  opacity: 0.45;
}

.pub-toggle:disabled:hover,
.pub-toggle:disabled:focus-visible {
  color: var(--muted);
  border-color: var(--line);
}

@media (max-width: 640px) {
  .pub-entry {
    flex-direction: column;
    gap: 0.3rem;
  }

  .pub-year {
    flex-basis: auto;
    padding-top: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pub-disclosure svg {
    transition: none;
  }
}
</style>
