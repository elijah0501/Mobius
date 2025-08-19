<template>
  <footer class="footer">
    <div class="footer-container">

      <div class="footer-links">
        <div class="footer-section">
          <h4>产品服务</h4>
          <ul>
            <li><a href="/products">产品介绍</a></li>
            <li><a href="/solutions">解决方案</a></li>
            <li><a href="/pricing">价格方案</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>关于我们</h4>
          <ul>
            <li><a href="/about">公司简介</a></li>
            <li><a href="/team">团队成员</a></li>
            <li><a href="/careers">招聘信息</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>支持帮助</h4>
          <ul>
            <li><a href="/help">帮助中心</a></li>
            <li><a href="/contact">联系我们</a></li>
            <li><a href="/feedback">意见反馈</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>法律条款</h4>
          <ul>
            <li><a href="/privacy">隐私政策</a></li>
            <li><a href="/terms">服务条款</a></li>
            <li><a href="/disclaimer">免责声明</a></li>
          </ul>
        </div>
      </div>


      <div class="footer-copyright">
        <p>&copy; {{ currentYear }} 您的公司名称. 保留所有权利 |
          <a href="/sitemap">网站地图</a> |
          <a href="/icp">备案号: 京ICP备12345678号</a>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'


const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  background-color: #000;
  color: #fff;
  height: 100px;
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: auto;
}

.footer-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.footer-links {
  display: flex;
  gap: 40px;
  flex: 1;
}

.footer-section {
  display: flex;
  flex-direction: column;
}

.footer-section h4 {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
  white-space: nowrap;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 15px;
}

.footer-section li {
  margin: 0;
}

.footer-section a {
  color: #ccc;
  text-decoration: none;
  font-size: 12px;
  transition: color 0.3s ease;
  white-space: nowrap;
}

.footer-section a:hover {
  color: #fff;
}

.footer-copyright {
  flex-shrink: 0;
}

.footer-copyright p {
  color: #999;
  font-size: 12px;
  margin: 0;
  white-space: nowrap;
}

.footer-copyright a {
  color: #999;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-copyright a:hover {
  color: #fff;
}


@media (max-width: 768px) {
  .footer {
    height: auto;
    min-height: 100px;
    padding: 20px 0;
  }

  .footer-container {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }

  .footer-links {
    gap: 20px;
    flex-wrap: wrap;
  }

  .footer-section ul {
    flex-direction: column;
    gap: 5px;
  }

  .footer-copyright p {
    white-space: normal;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .footer-links {
    flex-direction: column;
    gap: 15px;
  }

  .footer-section h4 {
    font-size: 13px;
  }

  .footer-section a,
  .footer-copyright p,
  .footer-copyright a {
    font-size: 11px;
  }
}
</style>
