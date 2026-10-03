<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { onValue, ref as dbRef } from 'firebase/database'
import { db, isFirebaseConfigured } from '@/firebase'
import { useVisitorHistoryPanel } from '@/composables/useVisitorHistoryPanel'
import { formatVisitDate } from '@/lib/visitTime'

const PREVIEW_SIZE = 4
const PAGE_SIZE = 30

const visitors = ref([])
const historyStatus = ref('loading')
const expanded = ref(false)
const page = ref(1)
const revealed = ref(false)
const sectionRef = ref(null)
const { open } = useVisitorHistoryPanel()
let stopListening = () => {}

const pageCount = computed(() => Math.max(1, Math.ceil(visitors.value.length / PAGE_SIZE)))

const visibleVisits = computed(() => {
  if (!expanded.value) return visitors.value.slice(0, PREVIEW_SIZE)
  const start = (page.value - 1) * PAGE_SIZE
  return visitors.value.slice(start, start + PAGE_SIZE)
})

const pages = computed(() => Array.from({ length: pageCount.value }, (_, index) => index + 1))

function formatMeta(visit) {
  return [formatVisitDate(visit.timestamp), visit.country].filter(Boolean).join(' · ')
}

function openHistory() {
  expanded.value = true
  page.value = 1
}

function closeHistory() {
  expanded.value = false
  page.value = 1
}

function goToPage(nextPage) {
  page.value = nextPage
}

function onSectionTransition(event) {
  if (!revealed.value || event.target !== sectionRef.value) return
  if (event.propertyName !== 'grid-template-rows') return
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  sectionRef.value.scrollIntoView({ behavior: motion ? 'auto' : 'smooth', block: 'start' })
}

watch(
  open,
  (value) => {
    requestAnimationFrame(() => {
      revealed.value = value
    })
  },
  { immediate: true },
)

function listenToVisitors() {
  if (!isFirebaseConfigured || !db) {
    historyStatus.value = 'error'
    return
  }

  stopListening = onValue(
    dbRef(db, 'visitors'),
    (snapshot) => {
      const data = snapshot.val() || {}
      visitors.value = Object.entries(data)
        .map(([id, value]) => ({ id, ...value }))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      if (page.value > pageCount.value) page.value = pageCount.value
      historyStatus.value = 'ready'
    },
    () => {
      historyStatus.value = 'error'
    },
  )
}

onMounted(() => {
  listenToVisitors()
})

onUnmounted(() => {
  stopListening()
})
</script>

<template>
  <section
    id="visitor-history"
    ref="sectionRef"
    class="showcase-section location-section"
    :class="{ 'is-open': revealed }"
    :inert="!revealed"
    :aria-hidden="!revealed"
    @transitionend="onSectionTransition"
  >
    <div class="location-section__clip">
      <div class="glass-card location-card">
      <header class="location-head">
        <div>
          <p class="location-kicker">Visitor history</p>
          <div class="location-rule" aria-hidden="true" />
        </div>
        <p v-if="historyStatus === 'ready'" class="location-count">{{ visitors.length }} visits</p>
      </header>

      <p v-if="historyStatus === 'loading'" class="location-status">Loading visitor history</p>
      <p v-else-if="historyStatus === 'error'" class="location-status">Visitor history unavailable</p>
      <p v-else-if="visitors.length === 0" class="location-status">No visits recorded</p>

      <template v-else>
        <ol class="visit-list">
          <li v-for="visit in visibleVisits" :key="visit.id" class="visit">
            <p class="visit-city">{{ visit.city || 'Unknown' }}</p>
            <p class="visit-meta">{{ formatMeta(visit) }}</p>
          </li>
        </ol>

        <button
          v-if="visitors.length > PREVIEW_SIZE"
          class="open-history"
          type="button"
          @click="expanded ? closeHistory() : openHistory()"
        >
          {{ expanded ? 'Close' : 'Open' }}
        </button>

        <nav v-if="expanded && pageCount > 1" class="pager" aria-label="Visitor history pages">
          <button
            v-for="number in pages"
            :key="number"
            type="button"
            class="pager-page"
            :class="{ 'is-current': number === page }"
            :aria-current="number === page ? 'page' : undefined"
            @click="goToPage(number)"
          >
            {{ number }}
          </button>
        </nav>
      </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.location-section {
  display: grid;
  grid-template-rows: 0fr;
  padding-top: 0;
  padding-bottom: 0;
  scroll-margin-top: calc(var(--site-nav-height, 4rem) + 1rem);
  transition:
    grid-template-rows 0.75s cubic-bezier(0.22, 1, 0.36, 1),
    padding 0.75s cubic-bezier(0.22, 1, 0.36, 1);
}

.location-section.is-open {
  grid-template-rows: 1fr;
  padding-top: 3.5rem;
  padding-bottom: 3.5rem;
}

.location-section__clip {
  min-height: 0;
  overflow: hidden;
}

.location-card {
  width: 100%;
  padding: 1.6rem 1.5rem 1.3rem;
  opacity: 0;
  transform: translateY(14px);
  transition:
    opacity 0.4s ease,
    transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.location-section.is-open .location-card {
  opacity: 1;
  transform: none;
  transition:
    opacity 0.62s cubic-bezier(0.22, 1, 0.36, 1) 0.1s,
    transform 0.75s cubic-bezier(0.22, 1, 0.36, 1);
}

.location-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.4rem;
}

.location-kicker,
.location-count,
.location-status,
.visit-city,
.visit-meta {
  margin: 0;
}

.location-kicker {
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--accent);
}

.location-rule {
  width: 4.5rem;
  height: 1px;
  margin-top: 0.7rem;
  background: linear-gradient(90deg, var(--foil-gold-hi), transparent);
}

.location-count,
.location-status,
.visit-meta {
  color: var(--muted);
}

.location-count,
.location-status {
  font-size: 0.92rem;
}

.visit-list {
  display: grid;
  grid-template-columns: 1fr;
  margin: 0.6rem 0 0;
  padding: 0;
  list-style: none;
}

.visit {
  padding: 1.05rem 0.15rem 1rem;
  border-bottom: 1px solid rgba(63, 58, 54, 0.85);
}

.visit-city {
  font-size: 1.45rem;
  letter-spacing: 0.03em;
  color: var(--ink);
}

.visit-meta {
  margin-top: 0.32rem;
  font-size: 0.82rem;
  letter-spacing: 0.02em;
}

.open-history,
.pager-page {
  border: 0;
  background: none;
  color: var(--muted);
  cursor: pointer;
}

.open-history {
  display: block;
  width: 100%;
  margin-top: 0.35rem;
  padding: 1rem 0 0.2rem;
  font: inherit;
  font-size: 0.95rem;
  letter-spacing: 0.22em;
  text-align: center;
}

.open-history:hover,
.open-history:focus-visible,
.pager-page:hover,
.pager-page:focus-visible {
  color: var(--foil-gold-hi);
}

.open-history:focus-visible,
.pager-page:focus-visible {
  outline: 2px solid var(--accent-line);
  outline-offset: 3px;
}

.pager {
  display: flex;
  justify-content: center;
  gap: 0.35rem;
  margin-top: 1.1rem;
}

.pager-page {
  min-width: 2rem;
  padding: 0.35rem 0.45rem;
  font: inherit;
  font-size: 0.88rem;
}

.pager-page.is-current {
  color: var(--foil-gold-hi);
  box-shadow: inset 0 -1px 0 var(--foil-gold);
}

@media (min-width: 760px) {
  .visit-list {
    grid-template-columns: 1fr 1fr;
    column-gap: 2.4rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .location-section,
  .location-card,
  .location-section.is-open .location-card {
    transition: none;
  }
}

@media (max-width: 768px) {
  .location-section.is-open {
    padding-top: 2.6rem;
    padding-bottom: 2.6rem;
  }

  .location-card {
    padding: 1.25rem 1rem 1rem;
  }

  .location-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .visit-city {
    font-size: 1.25rem;
  }
}
</style>
