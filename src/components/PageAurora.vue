<script setup>
import { ref } from 'vue'
import { usePageAurora } from '@/composables/usePageAurora'

const hostRef = ref(null)
const canvasRef = ref(null)
const useCss = ref(false)

usePageAurora(hostRef, canvasRef, useCss)
</script>

<template>
  <div ref="hostRef" class="page-aurora" aria-hidden="true">
    <canvas v-show="!useCss" ref="canvasRef" class="page-aurora__gl" />
    <span v-if="useCss" class="page-aurora__orbit page-aurora__orbit--tint">
      <span class="page-aurora__drift-y">
        <span class="page-aurora__drift-x2">
          <span class="page-aurora__drift-y2">
            <span class="page-aurora__morph">
              <span class="page-aurora__core">
                <span class="page-aurora__lobe page-aurora__lobe--blue" />
                <span class="page-aurora__lobe page-aurora__lobe--green" />
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  </div>
</template>
