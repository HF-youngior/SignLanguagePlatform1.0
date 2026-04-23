<template>
  <transition name="splash-fade">
    <div v-if="visible" class="splash-shell" aria-label="掌中语开屏">
      <div class="splash-noise"></div>
      <div class="splash-orb splash-orb--a"></div>
      <div class="splash-orb splash-orb--b"></div>
      <div class="splash-orb splash-orb--c"></div>

      <div class="splash-center">
        <div class="logo-ring">
          <img class="logo-image" src="@/assets/logo/logo-zhangzhongyu.svg" alt="掌中语" />
        </div>
        <p class="splash-sub">让每一次表达，都被温柔看见</p>
        <h1 class="splash-title">掌中语</h1>
        <p class="splash-tag">场景化手语学习 · 生活翻译 · 手语社交共融</p>
      </div>

      <div class="splash-wave"></div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.splash-shell {
  position: fixed;
  inset: 0;
  z-index: 9999;
  overflow: hidden;
  background:
    radial-gradient(circle at 12% 20%, rgba(110, 133, 255, 0.38), transparent 34%),
    radial-gradient(circle at 86% 18%, rgba(154, 124, 255, 0.32), transparent 34%),
    radial-gradient(circle at 70% 84%, rgba(120, 197, 255, 0.18), transparent 34%),
    linear-gradient(140deg, #1f1a4a 0%, #2f2971 42%, #4c3eb0 100%);
}

.splash-noise {
  position: absolute;
  inset: 0;
  opacity: 0.12;
  background-image: radial-gradient(rgba(255, 255, 255, 0.65) 0.8px, transparent 0.8px);
  background-size: 3px 3px;
}

.splash-center {
  position: relative;
  z-index: 3;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 28px;
}

.logo-ring {
  width: 112px;
  height: 112px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.46);
  box-shadow: 0 24px 58px rgba(16, 13, 70, 0.45);
  backdrop-filter: blur(12px);
  animation: breathe 2.8s ease-in-out infinite;
}

.logo-image {
  width: 68px;
  height: 68px;
}

.splash-sub {
  margin-top: 18px;
  margin-bottom: 6px;
  font-size: 0.95rem;
  color: rgba(236, 238, 255, 0.92);
  letter-spacing: 0.08em;
}

.splash-title {
  margin: 0;
  font-size: clamp(2.5rem, 9vw, 4.7rem);
  line-height: 1;
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-shadow: 0 8px 30px rgba(8, 6, 33, 0.5);
}

.splash-tag {
  margin-top: 14px;
  font-size: 0.96rem;
  color: rgba(228, 230, 255, 0.92);
}

.splash-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(5px);
  animation: drift 9s ease-in-out infinite;
}

.splash-orb--a {
  width: 210px;
  height: 210px;
  left: -30px;
  top: 12%;
  background: rgba(109, 138, 255, 0.42);
}

.splash-orb--b {
  width: 250px;
  height: 250px;
  right: -58px;
  top: 28%;
  background: rgba(155, 121, 252, 0.38);
  animation-delay: 1.4s;
}

.splash-orb--c {
  width: 190px;
  height: 190px;
  right: 15%;
  bottom: -44px;
  background: rgba(246, 188, 147, 0.3);
  animation-delay: 0.8s;
}

.splash-wave {
  position: absolute;
  z-index: 2;
  left: -6%;
  right: -6%;
  bottom: -42px;
  height: 188px;
  border-radius: 48% 52% 0 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.44));
  animation: waveShift 4.5s ease-in-out infinite;
}

.splash-fade-enter-active,
.splash-fade-leave-active {
  transition: opacity 0.7s ease;
}

.splash-fade-enter-from,
.splash-fade-leave-to {
  opacity: 0;
}

@keyframes drift {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-18px) scale(1.04);
  }
}

@keyframes breathe {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.06);
  }
}

@keyframes waveShift {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-2%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .logo-ring,
  .splash-orb,
  .splash-wave {
    animation: none !important;
  }
}

@media (max-width: 640px) {
  .logo-ring {
    width: 94px;
    height: 94px;
  }

  .logo-image {
    width: 58px;
    height: 58px;
  }

  .splash-tag {
    max-width: 260px;
    line-height: 1.5;
  }
}
</style>
