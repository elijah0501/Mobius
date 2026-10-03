<script setup>
import NavBar from '@/components/NavBar.vue'
import AppFooter from '@/components/AppFooter.vue'
import PageAurora from '@/components/PageAurora.vue'
</script>

<template>
  <div id="app-shell">
    <PageAurora />
    <NavBar />
    <RouterView />
    <AppFooter />
  </div>
</template>
