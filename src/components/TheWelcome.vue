<template>
  <div
    class="welcome-banner" @mouseenter="showText = true" @mouseleave="showText = false">

    <!-- Background image -->
    <div class="banner-image"></div>

  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'WelcomeBanner',
  setup() {
    const showText = ref(false)

    return {
      showText
    }
  }
}
</script>

<style scoped>
.welcome-banner {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}

.banner-image {
  width: 100%;
  height: 100%;
  background-image: url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: transform 0.3s ease;
}

.welcome-banner:hover .banner-image {
  transform: scale(1.05);
}

</style>
