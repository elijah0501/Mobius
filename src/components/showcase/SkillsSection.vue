<script setup>
import { skillGroups } from '@/content/skills.js'

function levelOf(count, index) {
  if (count <= 1) return 0
  return index / (count - 1)
}
</script>

<template>
  <section class="showcase-section">
    <h2 class="section-title reveal">Skills</h2>
    <div class="section-title-bar reveal"></div>
    <p class="skill-order reveal">Listed in descending order of proficiency.</p>

    <dl class="skill-list reveal">
      <div v-for="group in skillGroups" :key="group.label" class="skill-row">
        <dt class="skill-label">{{ group.label }}</dt>
        <dd class="skill-items">
          <span
            v-for="(item, index) in group.items"
            :key="item.name"
            class="skill-item"
            :style="{ '--level': levelOf(group.items.length, index) }"
          >
            {{ item.name }}
            <span v-if="item.note" class="skill-note">{{ item.note }}</span>
          </span>
        </dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.skill-list {
  width: 100%;
  max-width: 70rem;
  margin-inline: auto;
}

.skill-order {
  margin: 1.15rem 0 1.7rem;
  text-align: center;
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--muted);
}

.section-title-bar {
  margin-bottom: 0;
}

.skill-row {
  display: grid;
  grid-template-columns: 15.5rem minmax(0, 1fr);
  column-gap: 1.5rem;
  align-items: center;
  padding: 0.85rem 0;
  border-top: 1px solid rgba(63, 58, 54, 0.72);
}

.skill-row:last-child {
  border-bottom: 1px solid rgba(63, 58, 54, 0.72);
}

.skill-label {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--muted);
}

.skill-items {
  display: flex;
  flex-wrap: nowrap;
  align-items: baseline;
  justify-content: flex-start;
  gap: 10ch;
  min-width: 0;
  margin: 0;
}

.skill-item {
  flex-shrink: 0;
  color: color-mix(in srgb, var(--nav-silver) calc((1 - var(--level, 0)) * 100%), #9a948c);
  font-size: 1rem;
  line-height: 1.7;
  white-space: nowrap;
}

.skill-note {
  margin-left: 0.4rem;
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  color: var(--muted);
}

@media (max-width: 760px) {
  .skill-row {
    grid-template-columns: 1fr;
    justify-items: start;
    row-gap: 0.4rem;
    text-align: left;
  }

  .skill-items {
    width: 100%;
    overflow-x: auto;
  }
}
</style>
