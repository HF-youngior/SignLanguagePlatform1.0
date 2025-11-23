<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
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
