<template>
  <footer class="footer">
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
  background-color: #000000;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
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
