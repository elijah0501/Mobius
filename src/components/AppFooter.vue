<template>
  <footer class="footer">
    <div class="footer-content">

      <div class="copyright">
        <p>&copy; 2025 Möbius. All Rights Reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
// 这里可以添加组件的逻辑
</script>

<style scoped>
.footer {
  background-color: black;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.copyright {
  color: rgb(201, 201, 201);
  text-align: center;
}

.copyright p {
  margin: 0;
  font-size: 14px;
  letter-spacing: 0.5px;
}

/* 响应式设计 */
@media (max-width: 768px) {

  .copyright p {
    font-size: 12px;
  }
}
</style>
