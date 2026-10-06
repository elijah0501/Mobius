<script setup>
import { education } from '@/content/education.js'

defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <component
    :is="embedded ? 'div' : 'section'"
    :class="embedded ? 'education-panel' : 'showcase-section'"
    aria-label="Education"
  >
    <ol class="education-list reveal">
      <li v-for="item in education" :key="item.degree" class="education-entry">
        <p class="education-title">{{ item.degree }}</p>
        <p class="education-place">{{ item.institution }}</p>
      </li>
    </ol>
  </component>
</template>

<style scoped>
.education-panel .education-list {
  max-width: none;
}

.education-panel .education-entry:first-child {
  padding-top: 0;
}

.education-panel .education-entry {
  padding: 0.85rem 0;
}

.education-list {
  width: 100%;
  max-width: 70rem;
  margin: 0 auto;
  padding: 0;
  list-style: none;
}

.education-entry {
  padding: 1.15rem 0;
  background: none;
}

.education-entry + .education-entry {
  border-top: 1px solid rgba(63, 58, 54, 0.72);
}

.education-title,
.education-place {
  margin: 0;
}

.education-title {
  font-size: 1rem;
  line-height: 1.45;
  color: var(--ink);
}

.education-place {
  margin-top: 0.28rem;
  font-size: 0.92rem;
  line-height: 1.55;
  font-style: italic;
  color: var(--muted);
}

</style>
