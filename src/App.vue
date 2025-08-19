<template>
  <div>
    <NavBar />
    <RouterView />
    <AppFooter />
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import AppFooter from '@/components/AppFooter.vue'

export default {
  components: {
    NavBar,
    AppFooter
  }
}
</script>
