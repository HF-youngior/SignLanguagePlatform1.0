<template>
  <div class="min-h-screen animated-gradient">
    <nav class="backdrop-blur-md bg-white/70 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <router-link
              to="/"
              class="flex items-center text-2xl font-bold text-blue-700 hover:text-blue-800 hover:scale-105 transition-all duration-300"
            >
              <img src="/logo-zhangzhongyu.svg" alt="掌中语 Logo" class="w-10 h-10 mr-3" />
              <span>掌中语-手语学习平台</span>
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/home" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">首页</router-link>
            <router-link to="/learn" class="nav-link text-blue-700 font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500 after:rounded-full">学习</router-link>
            <router-link to="/translate" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">翻译</router-link>
            <router-link to="/community" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">社区</router-link>
          </div>
        </div>
      </div>
    </nav>

    <main class="pt-10 pb-20">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <section class="challenge-banner fade-in">
          <div class="flex items-center gap-5">
            <div class="banner-icon">🏠</div>
            <div>
              <h1 class="text-4xl font-bold text-white mb-2">我的新家</h1>
              <p class="text-lg text-white/85">学习认识日常物品，打造属于你的温馨家园。</p>
            </div>
          </div>
          <div class="banner-hand-illustration" aria-hidden="true"></div>
        </section>

        <section class="status-bar fade-in">
          <div class="flex justify-between items-center">
            <div class="coin-display">
              <span class="coin-icon">💰</span>
              <span class="coin-count">{{ coins }}</span>
            </div>
            <div class="progress-display">
              <span class="progress-text">篇章进度：{{ completedRooms }}/{{ totalRooms }}</span>
            </div>
          </div>
        </section>

        <section class="map-section fade-in">
          <div class="map-section__header">
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-2xl font-semibold text-slate-900">我的新家地图</h2>
                <p class="text-slate-600 text-sm">探索家中的各个区域，学习相关手语表达。</p>
              </div>
              <router-link to="/learn/challenge" class="back-button">
                <span class="back-icon">←</span>
                <span>返回关卡总览</span>
              </router-link>
            </div>
          </div>

          <div class="home-map-container">
            <!-- 施工牌 -->
            <div v-if="showConstructionSign" class="construction-sign" @click="startDecoration">
              <div class="construction-icon">🚧</div>
              <div class="construction-text">点击施工牌，开始装修你的家！</div>
            </div>

            <!-- 房屋平面图布局 -->
            <div class="house-floorplan">
              <!-- 墙壁和结构 -->
              <div class="house-walls">
                <!-- 外墙 -->
                <div class="outer-wall"></div>
                <!-- 内墙 -->
                <div class="inner-walls">
                  <!-- 卧室与客厅分隔墙 -->
                  <div class="wall vertical-wall bedroom-living-wall"></div>
                  <!-- 卧室与浴室分隔墙 -->
                  <div class="wall horizontal-wall bedroom-bathroom-wall"></div>
                  <!-- 客厅与厨房分隔墙 -->
                  <div class="wall horizontal-wall living-kitchen-wall"></div>
                  <!-- 浴室与厨房分隔墙 -->
                  <div class="wall vertical-wall bathroom-kitchen-wall"></div>
                  <!-- 浴室内部分隔墙 -->
                  <div class="wall vertical-wall bathroom-inner-wall"></div>
                </div>
                <!-- 门 -->
                <div class="doors">
                  <div class="door bedroom-door"></div>
                  <div class="door living-room-door"></div>
                  <div class="door bathroom-door"></div>
                  <div class="door kitchen-door"></div>
                  <div class="door bathroom-inner-door"></div>
                </div>
              </div>
              
              <!-- 房间 -->
              <div class="rooms">
                <!-- 卧室 -->
                <div :class="['room', 'bedroom', bedroomLocked ? 'locked' : '']" @click="navigateToRoom('bedroom')">
                  <div class="room-content">
                    <div class="furniture bed">🛏️</div>
                    <div class="furniture nightstand-1">📱</div>
                    <div class="furniture nightstand-2">📱</div>
                    <div class="furniture wardrobe">🚪</div>
                    <span class="room-label">卧室</span>
                    <span v-if="bedroomLocked" class="room-lock">🔒</span>
                  </div>
                </div>
                <!-- 客厅 -->
                <div :class="['room', 'living-room', livingRoomLocked ? 'locked' : '']" @click="navigateToRoom('living-room')">
                  <div class="room-content">
                    <div class="furniture sofa">🛋️</div>
                    <div class="furniture tv">📺</div>
                    <div class="furniture coffee-table">☕</div>
                    <div class="furniture chair-1">🪑</div>
                    <div class="furniture chair-2">🪑</div>
                    <span class="room-label">客厅</span>
                    <span v-if="livingRoomLocked" class="room-lock">🔒</span>
                  </div>
                </div>
                <!-- 浴室 -->
                <div :class="['room', 'bathroom', bathroomLocked ? 'locked' : '']" @click="navigateToRoom('bathroom')">
                  <div class="room-content">
                    <div class="furniture bathtub">🛁</div>
                    <div class="furniture toilet">🚽</div>
                    <div class="furniture sink">🚿</div>
                    <div class="furniture bathroom-cabinet">📦</div>
                    <span class="room-label">浴室</span>
                    <span v-if="bathroomLocked" class="room-lock">🔒</span>
                  </div>
                </div>
                <!-- 厨房 -->
                <div :class="['room', 'kitchen', kitchenLocked ? 'locked' : '']" @click="navigateToRoom('kitchen')">
                  <div class="room-content">
                    <div class="furniture stove">🍳</div>
                    <div class="furniture kitchen-sink">🚿</div>
                    <div class="furniture kitchen-cabinet-1">📦</div>
                    <div class="furniture kitchen-cabinet-2">📦</div>
                    <div class="furniture kitchen-table">☕</div>
                    <span class="room-label">厨房</span>
                    <span v-if="kitchenLocked" class="room-lock">🔒</span>
                  </div>
                </div>
              </div>
              
              <!-- 装饰元素 -->
              <div class="home-decorations">
                <div class="decoration decoration-1"></div>
                <div class="decoration decoration-2"></div>
                <div class="decoration decoration-3"></div>
                <div class="decoration decoration-4"></div>
                <div class="decoration decoration-5"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- 提示横幅 -->
        <div v-if="showBanner" class="congratulation-banner fade-in">
          <div class="congratulation-content">
            <div class="congratulation-icon">🎉</div>
            <div class="congratulation-text">恭喜您！成功拍下这套'湖景毛坯大别野'！请通过手语学习，从零开始打造您的梦想家园吧！</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'HomeMap',
  data() {
    return {
      totalRooms: 4,
      completedRooms: 0,
      progressPercent: 0,
      coins: 0,
      showConstructionSign: true,
      showBanner: false,
      livingRoomLocked: true,
      bedroomLocked: true,
      kitchenLocked: true,
      bathroomLocked: true
    }
  },
  computed: {
    progressDashOffset() {
      const circumference = 2 * Math.PI * 52
      return circumference * (1 - this.progressPercent / 100)
    }
  },
  mounted() {
    this.loadProgress()
    this.loadCoins()
    this.loadDecorationState()
    this.loadRoomLocks()
  },
  methods: {
    loadProgress() {
      const storedCompleted = Number(localStorage.getItem('homeMapCompletedRooms') || 0)
      this.completedRooms = Math.min(storedCompleted, this.totalRooms)
      this.progressPercent = Math.round((this.completedRooms / this.totalRooms) * 100)
    },
    loadCoins() {
      const storedCoins = Number(localStorage.getItem('userCoins') || 0)
      this.coins = storedCoins
    },
    loadDecorationState() {
      const storedShowConstructionSign = localStorage.getItem('showConstructionSign')
      const storedLivingRoomLocked = localStorage.getItem('livingRoomLocked')
      
      if (storedShowConstructionSign !== null) {
        this.showConstructionSign = storedShowConstructionSign === 'true'
      }
      
      if (storedLivingRoomLocked !== null) {
        this.livingRoomLocked = storedLivingRoomLocked === 'true'
      }
    },
    loadRoomLocks() {
      // 检查各房间的解锁状态
      this.bedroomLocked = localStorage.getItem('bedroomUnlocked') !== 'true'
      // 这里可以添加其他房间的解锁逻辑
    },
    startDecoration() {
      // 隐藏施工牌
      this.showConstructionSign = false
      
      // 显示提示横幅
      this.showBanner = true
      
      // 3秒后隐藏提示横幅
      setTimeout(() => {
        this.showBanner = false
      }, 3000)
      
      // 解锁客厅房间
      setTimeout(() => {
        this.livingRoomLocked = false
        // 保存状态到localStorage
        localStorage.setItem('showConstructionSign', 'false')
        localStorage.setItem('livingRoomLocked', 'false')
      }, 3000)
    },
    navigateToRoom(room) {
      // 检查房间是否已解锁
      if (room === 'living-room' && this.livingRoomLocked) {
        this.$message({
          message: '该房间尚未解锁，完成前面的任务后即可解锁！',
          type: 'warning'
        })
        return
      } else if (room === 'bedroom' && this.bedroomLocked) {
        this.$message({
          message: '该房间尚未解锁，完成前面的任务后即可解锁！',
          type: 'warning'
        })
        return
      } else if (room === 'kitchen' && this.kitchenLocked) {
        this.$message({
          message: '该房间尚未解锁，完成前面的任务后即可解锁！',
          type: 'warning'
        })
        return
      } else if (room === 'bathroom' && this.bathroomLocked) {
        this.$message({
          message: '该房间尚未解锁，完成前面的任务后即可解锁！',
          type: 'warning'
        })
        return
      }
      
      // 导航到对应房间学习页面
      if (room === 'living-room') {
        this.$router.push('/learn/challenge/level-2/living-room')
      } else if (room === 'bedroom') {
        // 这里可以添加卧室页面的路由
        this.$message({
          message: '卧室页面正在开发中！',
          type: 'info'
        })
      } else if (room === 'kitchen') {
        // 这里可以添加厨房页面的路由
        this.$message({
          message: '厨房页面正在开发中！',
          type: 'info'
        })
      } else if (room === 'bathroom') {
        // 这里可以添加浴室页面的路由
        this.$message({
          message: '浴室页面正在开发中！',
          type: 'info'
        })
      }
    }
  }
}
</script>

<style scoped>
.animated-gradient {
  background: linear-gradient(-45deg, #e6f3ff, #f0f8ff, #e6f3ff, #f0f9ff, #e6f7ff);
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
  min-height: 100vh;
}
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
.fade-in {
  animation: fadeIn 0.8s ease-in;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.challenge-banner {
  position: relative;
  padding: 36px 40px;
  background: linear-gradient(135deg, #6366f1 0%, #7c3aed 40%, #c026d3 100%);
  border-radius: 28px;
  color: #fff;
  overflow: hidden;
  box-shadow: 0 32px 70px rgba(79, 70, 229, 0.2);
}
.banner-icon {
  width: 72px;
  height: 72px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.25);
}
.banner-hand-illustration {
  position: absolute;
  right: -20px;
  bottom: -30px;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0));
  opacity: 0.5;
  filter: blur(0.8px);
}

.status-bar {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 20px 30px;
  box-shadow: 0 12px 30px rgba(99, 102, 241, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(129, 140, 248, 0.18);
}

.coin-display {
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffc107;
}

.coin-icon {
  font-size: 1.5rem;
  margin-right: 10px;
}

.progress-display {
  font-size: 1.2rem;
  color: #4a6fa5;
  font-weight: bold;
}

.map-section {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 24px;
  box-shadow: 0 24px 60px rgba(99, 102, 241, 0.14);
  border: 1px solid rgba(129, 140, 248, 0.18);
  overflow: hidden;
  position: relative;
}
.map-section__header {
  padding: 28px 32px 12px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.08);
}

.home-map-container {
  position: relative;
  height: 600px;
  overflow: hidden;
  padding: 40px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  border-radius: 0 0 24px 24px;
}

.construction-sign {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #ff4757;
  color: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  max-width: 300px;
  width: 90%;
  z-index: 10;
}

.construction-sign:hover {
  transform: translate(-50%, -50%) scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.construction-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.construction-text {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.4;
}

/* 房屋平面图样式 */
  .house-floorplan {
    position: relative;
    width: 100%;
    height: 80%;
    max-width: 700px;
    max-height: 500px;
    margin: 0 auto;
    transform: translateY(5%);
  }

  /* 墙壁 */
  .house-walls {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .outer-wall {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 4px solid #333;
    border-radius: 8px;
    background: rgba(240, 249, 255, 0.5);
  }

  .inner-walls {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .wall {
    background: #333;
    position: absolute;
  }

  .horizontal-wall {
    height: 4px;
    background: #333;
  }

  .vertical-wall {
    width: 4px;
    background: #333;
  }

  /* 墙壁位置 */
  .bedroom-living-wall {
    left: 35%;
    top: 0;
    height: 100%;
  }

  .living-kitchen-wall {
    top: 50%;
    left: 35%;
    width: 65%;
  }

  .bedroom-bathroom-wall {
    top: 50%;
    left: 0;
    width: 35%;
  }

  .bathroom-kitchen-wall {
    left: 35%;
    top: 50%;
    height: 50%;
  }

  .bathroom-inner-wall {
    left: 18%;
    top: 50%;
    height: 50%;
  }

  /* 门 */
  .doors {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
  }

  .door {
    position: absolute;
    width: 20px;
    height: 4px;
    background: #8B4513;
    border-radius: 2px;
  }

  .bedroom-door {
    top: 50%;
    left: 35%;
    transform: translateX(-50%);
  }

  .living-room-door {
    top: 50%;
    left: 35%;
    transform: translateX(-50%);
  }

  .bathroom-door {
    top: 50%;
    left: 18%;
    transform: translateX(-50%);
  }

  .kitchen-door {
    top: 50%;
    left: 35%;
    transform: translateX(-50%);
  }

  .bathroom-inner-door {
    top: 75%;
    left: 18%;
    transform: translateX(-50%);
  }

  /* 房间 */
  .rooms {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 3;
  }

  .room {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    cursor: pointer;
    border-radius: 4px;
    overflow: hidden;
  }

  .room:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .room.locked {
    opacity: 0.6;
    filter: grayscale(100%);
  }

  .room-content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 20px;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.85);
    border: 2px solid rgba(129, 140, 248, 0.2);
    transition: all 0.3s ease;
  }

  .room:hover .room-content {
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba(129, 140, 248, 0.5);
  }

  .room-label {
    font-size: 1rem;
    font-weight: bold;
    color: #333;
    margin-top: 5px;
  }

  .room-lock {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 18px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  /* 家具样式 */
  .furniture {
    position: absolute;
    font-size: 1.5rem;
    transition: transform 0.3s ease;
  }

  .room:hover .furniture {
    transform: scale(1.1);
  }

  /* 卧室家具 */
  .bedroom .bed {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .bedroom .nightstand-1 {
    top: 70%;
    left: 20%;
  }

  .bedroom .nightstand-2 {
    top: 70%;
    right: 20%;
  }

  .bedroom .wardrobe {
    top: 20%;
    right: 20%;
  }

  /* 客厅家具 */
  .living-room .sofa {
    top: 20%;
    left: 20%;
  }

  .living-room .tv {
    top: 20%;
    right: 20%;
  }

  .living-room .coffee-table {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .living-room .chair-1 {
    bottom: 20%;
    left: 30%;
  }

  .living-room .chair-2 {
    bottom: 20%;
    right: 30%;
  }

  /* 浴室家具 */
  .bathroom .bathtub {
    top: 70%;
    left: 30%;
  }

  .bathroom .toilet {
    bottom: 20%;
    left: 30%;
  }

  .bathroom .sink {
    top: 30%;
    right: 30%;
  }

  .bathroom .bathroom-cabinet {
    top: 60%;
    right: 30%;
  }

  /* 厨房家具 */
  .kitchen .stove {
    top: 30%;
    left: 20%;
  }

  .kitchen .kitchen-sink {
    top: 30%;
    right: 20%;
  }

  .kitchen .kitchen-cabinet-1 {
    bottom: 20%;
    left: 20%;
  }

  .kitchen .kitchen-cabinet-2 {
    bottom: 20%;
    right: 20%;
  }

  .kitchen .kitchen-table {
    top: 70%;
    left: 50%;
    transform: translateX(-50%);
  }

  /* 房间位置 - 房屋平面图布局 */
  .room.bedroom {
    top: 0;
    left: 0;
    width: 35%;
    height: 50%;
  }

  .room.living-room {
    top: 0;
    left: 35%;
    width: 65%;
    height: 50%;
  }

  .room.bathroom {
    top: 50%;
    left: 0;
    width: 35%;
    height: 50%;
  }

  .room.kitchen {
    top: 50%;
    left: 35%;
    width: 65%;
    height: 50%;
  }

/* 返回按钮样式 */
.back-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 12px;
  color: #6366f1;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  text-decoration: none;
}

.back-button:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.back-icon {
  font-size: 1.1rem;
  font-weight: bold;
}

/* 装饰元素 - 更典雅高级的样式 */
.home-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 4;
}

.decoration {
  position: absolute;
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.3), rgba(99, 102, 241, 0.1));
  backdrop-filter: blur(8px);
}

.decoration-1 {
  top: 10%;
  left: 12%;
  width: 30px;
  height: 30px;
  animation-delay: 0s;
}

.decoration-2 {
  top: 20%;
  right: 15%;
  width: 25px;
  height: 25px;
  animation-delay: 2s;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.3), rgba(124, 58, 237, 0.1));
}

.decoration-3 {
  bottom: 10%;
  left: 18%;
  width: 35px;
  height: 35px;
  animation-delay: 4s;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.3), rgba(168, 85, 247, 0.1));
}

.decoration-4 {
  bottom: 10%;
  right: 12%;
  width: 28px;
  height: 28px;
  animation-delay: 1s;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.3), rgba(236, 72, 153, 0.1));
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20px) scale(1.05);
    opacity: 0.9;
  }
}

.congratulation-banner {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  max-width: 80%;
  text-align: center;
  animation: bannerAppear 0.5s ease-out;
}

@keyframes bannerAppear {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.congratulation-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.congratulation-icon {
  font-size: 4rem;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

.congratulation-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
  font-family: 'Comic Sans MS', 'Chalkboard SE', 'Arial', sans-serif;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .house-floorplan {
    transform: translateY(5%);
  }

  .room-content {
    padding: 10px;
  }

  .room-symbol {
    font-size: 1.8rem;
    margin-bottom: 5px;
  }

  .room-label {
    font-size: 0.8rem;
  }

  .room-lock {
    font-size: 14px;
    width: 20px;
    height: 20px;
  }

  .door {
    width: 15px;
    height: 3px;
  }

  .map-section__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .back-button {
    padding: 8px 12px;
    font-size: 0.8rem;
  }

  .decoration {
    transform: scale(0.8);
  }
}

@media (max-width: 480px) {
  .house-floorplan {
    max-width: 300px;
    max-height: 200px;
  }

  .room-content {
    padding: 5px;
  }

  .room-symbol {
    font-size: 1.5rem;
  }

  .room-label {
    font-size: 0.7rem;
  }

  .back-button {
    padding: 6px 10px;
    font-size: 0.75rem;
  }

  .decoration {
    transform: scale(0.6);
  }
}

@media (max-width: 768px) {
  .challenge-banner {
    padding: 28px;
  }
  .banner-icon {
    width: 60px;
    height: 60px;
    font-size: 28px;
  }
  
  .status-bar {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .home-map-container {
    padding: 20px;
    height: 500px;
  }
  
  .central-area {
    width: 80%;
    height: 60%;
  }
  
  .room-icon {
    width: 90px;
    height: 90px;
  }

  .room-icon__symbol {
    font-size: 2.2rem;
  }

  .room-icon__label {
    font-size: 0.75rem;
  }

  .room-icon.living-room {
    top: 30px;
    left: 40px;
    transform: rotate(-3deg);
  }

  .room-icon.kitchen {
    top: 40px;
    right: 50px;
    transform: rotate(2deg);
  }

  .room-icon.bedroom {
    bottom: 30px;
    left: 50px;
    transform: rotate(3deg);
  }

  .room-icon.bathroom {
    bottom: 40px;
    right: 40px;
    transform: rotate(-2deg);
  }

  .decoration {
    transform: scale(0.7);
  }
  
  .construction-sign {
    padding: 20px;
  }
  
  .construction-icon {
    font-size: 2rem;
  }
  
  .construction-text {
    font-size: 1rem;
  }
  
  .congratulation-banner {
    padding: 30px;
    max-width: 90%;
  }
  
  .congratulation-icon {
    font-size: 3rem;
  }
  
  .congratulation-text {
    font-size: 1.2rem;
  }
}
</style>