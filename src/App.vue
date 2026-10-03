<script setup>
import { onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'
import AppFooter from '@/components/AppFooter.vue'
import PageAurora from '@/components/PageAurora.vue'
import { recordVisitOnce } from '@/lib/recordVisit'

onMounted(() => {
  recordVisitOnce()
})
</script>

<template>
  <div id="app-shell">
    <PageAurora />
    <NavBar />
    <RouterView />
    <AppFooter />
  </div>
</template>
