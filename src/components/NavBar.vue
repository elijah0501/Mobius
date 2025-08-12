<template>
  <nav
    :class="['navbar', { 'navbar-scrolled': isScrolled }]"
  >
    <div class="nav-container">

      <div class="nav-logo">
        <RouterLink to="/"><img alt="Vue logo" class="logo" src="@/assets/logo.png" width="30" height="30" /></RouterLink>
      </div>

      <ul class="nav-menu">
        <li><RouterLink to="/">Home</RouterLink></li>
        <li><RouterLink to="/about">About</RouterLink></li>
      </ul>

      <div class="nav-toggle" @click="toggleMenu">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'GlassNavbar',
  setup() {
    const isScrolled = ref(false)

    const handleScroll = () => {
      isScrolled.value = window.scrollY > 50
    }

    const toggleMenu = () => {

      console.log('Toggle mobile menu')
    }

    onMounted(() => {
      window.addEventListener('scroll', handleScroll)
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })

    return {
      isScrolled,
      toggleMenu
    }
  }
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: 1rem 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(0px);
  background: transparent;
}

.navbar-scrolled {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  padding: 0.5rem 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo a {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
  transition: color 0.3s ease;
}

.navbar-scrolled .nav-logo a {
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.nav-menu li a {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  transition: all 0.3s ease;
  position: relative;
}

.navbar-scrolled .nav-menu li a {
  color: #fff;
}

.nav-menu li a:hover {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.navbar-scrolled .nav-menu li a:hover {
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
}


.nav-menu li a.router-link-active {
  background: rgba(74, 144, 226, 0.3);
  color: #4a90e2;
  backdrop-filter: blur(10px);
}

.navbar-scrolled .nav-menu li a.router-link-active {
  background: rgba(255, 255, 255, 0.4);
  color: #fff;
}


.nav-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 4px;
}

.nav-toggle span {
  width: 25px;
  height: 3px;
  background: #333;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.navbar-scrolled .nav-toggle span {
  background: #fff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }

  .nav-toggle {
    display: flex;
  }

  .nav-container {
    padding: 0 1rem;
  }
}


@supports (backdrop-filter: blur()) or (-webkit-backdrop-filter: blur()) {
  .navbar-scrolled {
    -webkit-backdrop-filter: blur(20px);
    backdrop-filter: blur(20px);
  }

  .nav-menu li a:hover {
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
  }
}

</style>
