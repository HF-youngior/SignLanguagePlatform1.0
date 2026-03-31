<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    // 检查localStorage和sessionStorage中的数据
    console.log('=== 检查localStorage和sessionStorage ===');
    
    // 检查localStorage
    console.log('\n1. localStorage数据:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      console.log(`  ${key}: ${value}`);
    }
    
    // 检查sessionStorage
    console.log('\n2. sessionStorage数据:');
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key);
      console.log(`  ${key}: ${value}`);
    }
    
    // 检查cookies
    console.log('\n3. Cookies数据:');
    document.cookie.split(';').forEach(cookie => {
      console.log(`  ${cookie.trim()}`);
    });
  }
}
</script>

<style>
#app {
  font-family: 'Noto Sans SC', 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 移动端优化 */
@media (max-width: 768px) {
  /* 确保触摸目标足够大 */
  button, a, input, select, textarea {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* 优化字体大小 */
  body {
    font-size: 16px;
    -webkit-text-size-adjust: 100%;
  }
  
  /* 防止横向滚动 */
  * {
    max-width: 100%;
  }
  
  /* 优化滚动 */
  html {
    -webkit-overflow-scrolling: touch;
  }
}
</style>
