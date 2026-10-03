<script setup>
import { computed } from 'vue'

const props = defineProps({
  count: {
    type: Number,
    default: 18,
  },
})

const grains = computed(() => {
  const list = []
  for (let i = 0; i < props.count; i += 1) {
    const seed = (i * 53 + 17) % 997
    const angle = -Math.PI * 0.9 + ((seed % 100) / 100) * Math.PI * 0.8
    const dist = 5 + (seed % 30) * 0.42
    list.push({
      id: i,
      dx: `${(Math.cos(angle) * dist).toFixed(2)}px`,
      dy: `${(Math.sin(angle) * dist - 1.5).toFixed(2)}px`,
      size: (0.9 + (seed % 4) * 0.3).toFixed(2),
      delay: `${-((seed % 100) / 9).toFixed(2)}s`,
      duration: `${(4.2 + (seed % 26) / 10).toFixed(1)}s`,
      originX: `${8 + ((seed * 7) % 84)}%`,
      originY: `${34 + ((seed * 3) % 40)}%`,
    })
  }
  return list
})
</script>

<template>
  <span class="brand-dust" aria-hidden="true">
    <span
      v-for="grain in grains"
      :key="grain.id"
      class="brand-dust__grain"
      :style="{
        left: grain.originX,
        top: grain.originY,
        width: `${grain.size}px`,
        height: `${grain.size}px`,
        animationDelay: grain.delay,
        animationDuration: grain.duration,
        '--dust-dx': grain.dx,
        '--dust-dy': grain.dy,
      }"
    />
  </span>
</template>
