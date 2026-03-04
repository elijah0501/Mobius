<template>
  <footer class="footer">
    <!-- Gradient fade from transparent → black -->
    <div class="footer-gradient"></div>
    <div class="footer-content">
      <div class="copyright">
        <p>&copy; 2026 Möbius. All Rights Reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
// footer logic
</script>

<style scoped>
.footer {
  position: relative;
  background-color: transparent;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.footer-gradient {
  width: 100%;
  height: 180px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(0, 0, 0, 0.3) 20%,
    rgba(0, 0, 0, 0.6) 50%,
    rgba(0, 0, 0, 0.9) 80%,
    #000000 100%
  );
  pointer-events: none;
}

.footer-content {
  background-color: #000000;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0 2.5rem;
}

.copyright {
  text-align: center;
}

.copyright p {
  margin: 0;
  font-size: 13px;
  letter-spacing: 0.5px;
  color: rgba(160, 160, 160, 0.5);
}

@media (max-width: 768px) {
  .footer-gradient {
    height: 120px;
  }

  .copyright p {
    font-size: 12px;
  }
}
</style>
