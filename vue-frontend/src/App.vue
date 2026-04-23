<template>
  <div id="app">
    <SplashScreen :visible="showSplash" />
    <router-view v-slot="{ Component, route }">
      <component :is="Component" v-if="!showSplash" :key="route.fullPath" />
    </router-view>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import SplashScreen from '@/components/SplashScreen.vue'

const showSplash = ref(true)

onMounted(() => {
  try {
    const seenSplash = sessionStorage.getItem('zzysplash-seen')
    const delay = seenSplash ? 900 : 2800

    setTimeout(() => {
      showSplash.value = false
      try {
        sessionStorage.setItem('zzysplash-seen', '1')
      } catch (e) {
        console.warn('[app] failed to persist splash state:', e)
      }
    }, delay)
  } catch (error) {
    console.warn('[app] sessionStorage unavailable, skip splash:', error)
    showSplash.value = false
  }
})
</script>

<style>
#app {
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@media (max-width: 768px) {
  button,
  a,
  input,
  select,
  textarea {
    min-height: 44px;
    min-width: 44px;
  }

  body {
    font-size: 16px;
    -webkit-text-size-adjust: 100%;
  }

  html {
    -webkit-overflow-scrolling: touch;
  }
}
</style>
