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
              <img src="@/assets/logo/logo-zhangzhongyu.svg" alt="掌中语 Logo" class="w-10 h-10 mr-3 rounded-full" />
              <span>掌中语-手语小镇</span>
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/learn" class="nav-link text-blue-700 font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-500 after:rounded-full">学堂</router-link>
            <router-link to="/translate" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">译站</router-link>
            <router-link to="/community" class="nav-link text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300">手语圈</router-link>
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
                  <p class="text-slate-600 text-sm">探索每个房间，学习相关手语</p>
                </div>
              <router-link to="/learn/challenge" class="back-button">
                <span class="back-icon">←</span>
                <span>返回关卡总览</span>
              </router-link>
            </div>
          </div>

          <div class="home-map-container" 
               ref="mapContainer"
               @mousedown="startDrag"
               @mousemove="onDrag"
               @mouseup="endDrag"
               @mouseleave="endDrag"
               @touchstart="startDrag"
               @touchmove="onDrag"
               @touchend="endDrag">
            <!-- 施工牌 -->
            <div v-if="showConstructionSign" class="construction-sign" @click="startDecoration">
              <div class="construction-icon">🚧</div>
              <div class="construction-text">点击施工牌，开始装修你的家！</div>
            </div>



            <!-- 房屋平面图布局 -->
            <div class="house-floorplan" ref="floorplan">
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
                <div :class="['room', 'bedroom', 
                      bedroomLocked ? 'locked' : '', 
                      currentRoom === 'bedroom' ? 'current-room' : '',
                      completedRooms.includes('bedroom') ? 'completed' : '']" 
                     @click="navigateToRoom('bedroom')"
                     @mouseenter="onRoomHover('bedroom')"
                     @mouseleave="onRoomLeave('bedroom')">
                  <div class="room-content">
                    <!-- 床 -->
            <div class="furniture bed">
              <div class="bed-frame">
                <div class="bed-mattress"></div>
              </div>
            </div>
            <!-- 床头柜 -->
            <div class="furniture nightstand-1"></div>
            <div class="furniture nightstand-2"></div>
            <!-- 衣柜 -->
            <div class="furniture wardrobe"></div>
            <!-- 地毯 -->
            <div class="furniture carpet"></div>
            <!-- 电视 -->
            <div class="furniture tv"></div>
            <span class="room-label">{{ bedroomHovered ? '卧室 - 学习卧室相关手语' : '卧室' }}</span>
            <div v-if="bedroomLocked" class="room-lock-overlay">
              <div class="lock-icon">🔒</div>
            </div>
            <div v-if="completedRooms.includes('bedroom')" class="completion-badge">✓</div>
          </div>
        </div>
        <!-- 客厅 -->
        <div :class="['room', 'living-room', 
                      livingRoomLocked ? 'locked' : '', 
                      currentRoom === 'living-room' ? 'current-room' : '',
                      completedRooms.includes('living-room') ? 'completed' : '']" 
                     @click="navigateToRoom('living-room')"
                     @mouseenter="onRoomHover('living-room')"
                     @mouseleave="onRoomLeave('living-room')">
          <div class="room-content">
            <!-- 沙发组合 -->
            <div class="furniture sofa-set">
              <div class="sofa-main"></div>
              <div class="sofa-arm"></div>
            </div>
            <!-- 茶几 -->
            <div class="furniture coffee-table"></div>
            <!-- 单椅 -->
            <div class="furniture chair-1"></div>
            <div class="furniture chair-2"></div>
            <!-- 电视 -->
            <div class="furniture tv"></div>
            <!-- 地毯 -->
            <div class="furniture carpet"></div>
            <span class="room-label">{{ livingRoomHovered ? '客厅 - 学习客厅相关手语' : '客厅' }}</span>
            <div v-if="livingRoomLocked" class="room-lock-overlay">
              <div class="lock-icon">🔒</div>
            </div>
            <div v-if="completedRooms.includes('living-room')" class="completion-badge">✓</div>
          </div>
        </div>
        <!-- 浴室 -->
        <div :class="['room', 'bathroom', 
                      bathroomLocked ? 'locked' : '', 
                      currentRoom === 'bathroom' ? 'current-room' : '',
                      completedRooms.includes('bathroom') ? 'completed' : '']" 
                     @click="navigateToRoom('bathroom')"
                     @mouseenter="onRoomHover('bathroom')"
                     @mouseleave="onRoomLeave('bathroom')">
          <div class="room-content">
            <!-- 浴缸 -->
            <div class="furniture bathtub"></div>
            <!-- 马桶 -->
            <div class="furniture toilet"></div>
            <!-- 洗手台 -->
            <div class="furniture sink"></div>
            <!-- 浴室柜 -->
            <div class="furniture bathroom-cabinet"></div>
            <span class="room-label">{{ bathroomHovered ? '浴室 - 学习浴室相关手语' : '浴室' }}</span>
            <div v-if="bathroomLocked" class="room-lock-overlay">
              <div class="lock-icon">🔒</div>
            </div>
            <div v-if="completedRooms.includes('bathroom')" class="completion-badge">✓</div>
          </div>
        </div>
        <!-- 厨房 -->
        <div :class="['room', 'kitchen', 
                      kitchenLocked ? 'locked' : '', 
                      currentRoom === 'kitchen' ? 'current-room' : '',
                      completedRooms.includes('kitchen') ? 'completed' : '']" 
                     @click="navigateToRoom('kitchen')"
                     @mouseenter="onRoomHover('kitchen')"
                     @mouseleave="onRoomLeave('kitchen')">
          <div class="room-content">
            <!-- L型橱柜 -->
            <div class="furniture kitchen-cabinet">
              <div class="cabinet-main">
                <div class="sink"></div>
                <div class="stove"></div>
              </div>
              <div class="cabinet-arm"></div>
            </div>
            <!-- 餐桌 -->
            <div class="furniture dining-table"></div>
            <!-- 餐椅 -->
            <div class="furniture dining-chair-1"></div>
            <div class="furniture dining-chair-2"></div>
            <span class="room-label">{{ kitchenHovered ? '厨房 - 学习厨房相关手语' : '厨房' }}</span>
            <div v-if="kitchenLocked" class="room-lock-overlay">
              <div class="lock-icon">🔒</div>
            </div>
            <div v-if="completedRooms.includes('kitchen')" class="completion-badge">✓</div>
          </div>
        </div>
              </div>
              
              <!-- 成就徽章 -->
              <div class="achievements">
                <div v-for="(achievement, index) in achievements" 
                     :key="index"
                     :class="['achievement', { 'unlocked': achievement.unlocked }]"
                     @mouseenter="onAchievementHover(index)"
                     @mouseleave="onAchievementLeave(index)">
                  <div class="achievement-icon">{{ achievement.icon }}</div>
                  <div class="achievement-label">{{ achievement.label }}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 提示横幅 -->
        <div v-if="showBanner" class="congratulation-banner fade-in" @click="closeBanner">
          <div class="congratulation-content">
            <div class="congratulation-icon">🎉</div>
            <div class="congratulation-text">恭喜您！成功拍下这套'湖景毛坯大别野'！请通过手语学习，从零开始打造您的梦想家园吧！</div>
            <div class="close-hint">点击关闭</div>
          </div>
        </div>
      </div>
    </main>

    <!-- 章节详情弹窗 -->
    <div v-if="showRoomModal" class="room-modal-overlay" @click="closeRoomModal">
      <div class="room-modal" @click.stop>
        <button class="modal-close" @click="closeRoomModal">×</button>
        <div class="modal-content">
          <div class="modal-icon">{{ currentRoomData.icon }}</div>
          <h3 class="modal-title">{{ currentRoomData.title }}</h3>
          <p class="modal-description">{{ currentRoomData.description }}</p>
          <div v-if="currentRoomData.score" class="modal-score">
            <span class="score-label">历史成绩：</span>
            <div class="score-stars">
              <span v-for="i in 3" :key="i" class="star" :class="{ 'filled': i <= currentRoomData.score }">{{ i <= currentRoomData.score ? '★' : '☆' }}</span>
            </div>
          </div>
          <button class="modal-button" @click="startRoomChallenge">{{ currentRoomData.buttonText }}</button>
        </div>
      </div>
    </div>

    <!-- 锁定提示气泡 -->
    <div v-if="showLockTooltip" class="lock-tooltip" :style="lockTooltipPosition">
      <div class="tooltip-content">请先完成上一章！</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 房间状态
const totalRooms = ref(4);
const completedRooms = ref([]);
const currentRoom = ref('');
const showConstructionSign = ref(true);
const showBanner = ref(true);
const coins = ref(0);

// 房间锁定状态
const bedroomLocked = ref(true);
const livingRoomLocked = ref(true);
const bathroomLocked = ref(true);
const kitchenLocked = ref(true);

// 悬停状态
const bedroomHovered = ref(false);
const livingRoomHovered = ref(false);
const bathroomHovered = ref(false);
const kitchenHovered = ref(false);

// 拖拽相关
const mapContainer = ref(null);
const floorplan = ref(null);
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const currentX = ref(0);
const currentY = ref(0);

// 弹窗相关
const showRoomModal = ref(false);
const currentRoomData = ref({
  icon: '',
  title: '',
  description: '',
  buttonText: '',
  score: null
});

// 锁定提示
const showLockTooltip = ref(false);
const lockTooltipPosition = ref({ top: '0px', left: '0px' });

// 成就徽章
const achievements = ref([
  { icon: '🌟', label: '初学者', unlocked: false, position: { top: '20%', left: '10%' } },
  { icon: '🏆', label: '进阶者', unlocked: false, position: { top: '60%', left: '80%' } },
  { icon: '💎', label: '专家', unlocked: false, position: { top: '40%', left: '50%' } }
]);

// 计算完成房间数
const completedRoomsCount = computed(() => {
  return completedRooms.value.length;
});

// 本地存储相关
const saveProgress = () => {
  localStorage.setItem('completedRooms', JSON.stringify(completedRooms.value));
  localStorage.setItem('coins', coins.value.toString());
  localStorage.setItem('showConstructionSign', showConstructionSign.value.toString());
  localStorage.setItem('showBanner', showBanner.value.toString());
  localStorage.setItem('achievements', JSON.stringify(achievements.value));
};

// 关闭提示横幅
const closeBanner = () => {
  showBanner.value = false;
  saveProgress();
};

const loadProgress = () => {
  // 从本地存储加载进度
  const storedCompletedRooms = localStorage.getItem('completedRooms');
  const storedCoins = localStorage.getItem('coins');
  const storedShowConstructionSign = localStorage.getItem('showConstructionSign');
  const storedShowBanner = localStorage.getItem('showBanner');
  const storedAchievements = localStorage.getItem('achievements');
  
  // 初始化已完成房间
  completedRooms.value = storedCompletedRooms ? JSON.parse(storedCompletedRooms) : [];
  
  // 初始化其他状态
  coins.value = storedCoins ? Number(storedCoins) : 0;
  showConstructionSign.value = storedShowConstructionSign !== 'false';
  showBanner.value = storedShowBanner !== 'false';
  achievements.value = storedAchievements ? JSON.parse(storedAchievements) : [
    { icon: '🌟', label: '初学者', unlocked: false, position: { top: '20%', left: '10%' } },
    { icon: '🏆', label: '进阶者', unlocked: false, position: { top: '60%', left: '80%' } },
    { icon: '💎', label: '专家', unlocked: false, position: { top: '40%', left: '50%' } }
  ];
  
  // 根据已完成房间解锁新房间
  updateRoomLockStatus();
  
  // 设置当前房间
  setCurrentRoom();
  
  // 触发路径点亮动画
  setTimeout(() => {
    triggerPathAnimation();
  }, 500);
};

// 更新房间锁定状态
const updateRoomLockStatus = () => {
  // 初始状态：所有房间锁定
  bedroomLocked.value = true;
  livingRoomLocked.value = true;
  bathroomLocked.value = true;
  kitchenLocked.value = true;
  
  // 解锁逻辑：按顺序解锁
  if (completedRooms.value.length >= 0) {
    livingRoomLocked.value = false; // 第一个解锁的房间
  }
  
  if (completedRooms.value.includes('living-room')) {
    bedroomLocked.value = false;
    kitchenLocked.value = false;
  }
  
  if (completedRooms.value.includes('bedroom') || completedRooms.value.includes('kitchen')) {
    bathroomLocked.value = false;
  }
};

// 设置当前房间
const setCurrentRoom = () => {
  if (completedRooms.value.length === 0) {
    currentRoom.value = 'living-room';
  } else if (completedRooms.value.length === 1) {
    currentRoom.value = completedRooms.value.includes('living-room') ? 'bedroom' : 'living-room';
  } else if (completedRooms.value.length === 2) {
    if (completedRooms.value.includes('living-room') && completedRooms.value.includes('bedroom')) {
      currentRoom.value = 'kitchen';
    } else if (completedRooms.value.includes('living-room') && completedRooms.value.includes('kitchen')) {
      currentRoom.value = 'bedroom';
    } else {
      currentRoom.value = 'bathroom';
    }
  } else if (completedRooms.value.length === 3) {
    const allRooms = ['living-room', 'bedroom', 'kitchen', 'bathroom'];
    const remainingRoom = allRooms.find(room => !completedRooms.value.includes(room));
    currentRoom.value = remainingRoom;
  }
};

// 自动对焦到当前房间
const focusOnCurrentRoom = () => {
  if (!floorplan.value || !currentRoom.value) return;
  
  const roomElement = floorplan.value.querySelector(`.${currentRoom.value}`);
  if (roomElement) {
    const roomRect = roomElement.getBoundingClientRect();
    const containerRect = mapContainer.value.getBoundingClientRect();
    
    const centerX = containerRect.width / 2 - roomRect.width / 2 - (roomRect.left - containerRect.left);
    const centerY = containerRect.height / 2 - roomRect.height / 2 - (roomRect.top - containerRect.top);
    
    currentX.value = centerX;
    currentY.value = centerY;
    updateMapPosition();
  }
};

// 触发路径点亮动画
const triggerPathAnimation = () => {
  const paths = document.querySelectorAll('.path');
  paths.forEach((path, index) => {
    setTimeout(() => {
      path.classList.add('path-lit');
    }, index * 300);
  });
};

// 开始装修
const startDecoration = () => {
  showConstructionSign.value = false;
  saveProgress();
};

// 导航到房间
const navigateToRoom = (room, event) => {
  // 检查房间是否锁定
  let isLocked = false;
  switch (room) {
    case 'bedroom':
      isLocked = bedroomLocked.value;
      break;
    case 'living-room':
      isLocked = livingRoomLocked.value;
      break;
    case 'bathroom':
      isLocked = bathroomLocked.value;
      break;
    case 'kitchen':
      isLocked = kitchenLocked.value;
      break;
  }
  
  if (isLocked) {
    // 显示锁定提示
    if (event) {
      const rect = event.target.getBoundingClientRect();
      lockTooltipPosition.value = {
        top: `${rect.top - 40}px`,
        left: `${rect.left + rect.width / 2 - 60}px`
      };
    }
    showLockTooltip.value = true;
    setTimeout(() => {
      showLockTooltip.value = false;
    }, 2000);
    
    // 锁定房间晃动效果
    const roomElement = document.querySelector(`.${room}`);
    if (roomElement) {
      roomElement.classList.add('shake');
      setTimeout(() => {
        roomElement.classList.remove('shake');
      }, 500);
    }
    return;
  }
  
  // 点击效果
  const roomElement = document.querySelector(`.${room}`);
  if (roomElement) {
    roomElement.classList.add('pulse');
    setTimeout(() => {
      roomElement.classList.remove('pulse');
    }, 300);
  }
  
  // 显示房间详情弹窗
  showRoomModal.value = true;
  
  // 设置弹窗数据
  const isCompleted = completedRooms.value.includes(room);
  switch (room) {
    case 'bedroom':
      currentRoomData.value = {
        icon: '🛏️',
        title: '卧室',
        description: '学习卧室相关的手语，包括床、衣柜、台灯等日常物品。',
        buttonText: isCompleted ? '复习本章' : '开始装修我的家',
        score: isCompleted ? 3 : null
      };
      break;
    case 'living-room':
      currentRoomData.value = {
        icon: '🏠',
        title: '客厅',
        description: '学习客厅相关的手语，包括沙发、电视、茶几等日常物品。',
        buttonText: isCompleted ? '复习本章' : '开始装修我的家',
        score: isCompleted ? 3 : null
      };
      break;
    case 'bathroom':
      currentRoomData.value = {
        icon: '🚿',
        title: '浴室',
        description: '学习浴室相关的手语，包括浴缸、马桶、洗手台等日常物品。',
        buttonText: isCompleted ? '复习本章' : '开始装修我的家',
        score: isCompleted ? 3 : null
      };
      break;
    case 'kitchen':
      currentRoomData.value = {
        icon: '🍳',
        title: '厨房',
        description: '学习厨房相关的手语，包括橱柜、灶台、餐桌等日常物品。',
        buttonText: isCompleted ? '复习本章' : '开始装修我的家',
        score: isCompleted ? 3 : null
      };
      break;
  }
};

// 关闭房间弹窗
const closeRoomModal = () => {
  showRoomModal.value = false;
};

// 开始房间挑战
const startRoomChallenge = () => {
  showRoomModal.value = false;
  router.push(`/learn/challenge/level-2/${currentRoom.value}`);
};

// 模拟完成房间学习（实际应用中会从后端获取）
const completeRoom = (room) => {
  if (!completedRooms.value.includes(room)) {
    completedRooms.value.push(room);
    coins.value += 100; // 完成房间奖励100金币
    saveProgress();
    updateRoomLockStatus();
    setCurrentRoom();
    
    // 触发完成动画
    triggerCompletionAnimation(room);
    
    // 检查成就解锁
    checkAchievements();
  }
};

// 触发完成动画
const triggerCompletionAnimation = (room) => {
  // 房间发光旋转效果
  const roomElement = document.querySelector(`.${room}`);
  if (roomElement) {
    roomElement.classList.add('complete-animation');
    setTimeout(() => {
      roomElement.classList.remove('complete-animation');
    }, 1000);
  }
  
  // 路径点亮效果
  setTimeout(() => {
    triggerPathAnimation();
  }, 500);
  
  // 下一个房间解锁效果
  setTimeout(() => {
    updateRoomLockStatus();
  }, 800);
};

// 检查成就解锁
const checkAchievements = () => {
  if (completedRooms.value.length === 1) {
    achievements.value[0].unlocked = true;
  } else if (completedRooms.value.length === 3) {
    achievements.value[1].unlocked = true;
  } else if (completedRooms.value.length === 4) {
    achievements.value[2].unlocked = true;
  }
  saveProgress();
};

// 房间悬停处理
const onRoomHover = (room) => {
  switch (room) {
    case 'bedroom':
      bedroomHovered.value = true;
      break;
    case 'living-room':
      livingRoomHovered.value = true;
      break;
    case 'bathroom':
      bathroomHovered.value = true;
      break;
    case 'kitchen':
      kitchenHovered.value = true;
      break;
  }
  
  // 悬停放大效果
  const roomElement = document.querySelector(`.${room}`);
  if (roomElement) {
    roomElement.classList.add('hover-scale');
  }
};

// 房间离开悬停处理
const onRoomLeave = (room) => {
  switch (room) {
    case 'bedroom':
      bedroomHovered.value = false;
      break;
    case 'living-room':
      livingRoomHovered.value = false;
      break;
    case 'bathroom':
      bathroomHovered.value = false;
      break;
    case 'kitchen':
      kitchenHovered.value = false;
      break;
  }
  
  // 移除悬停效果
  const roomElement = document.querySelector(`.${room}`);
  if (roomElement) {
    roomElement.classList.remove('hover-scale');
  }
};

// 成就徽章悬停处理
const onAchievementHover = (index) => {
  const achievement = document.querySelectorAll('.achievement')[index];
  if (achievement) {
    achievement.classList.add('achievement-hover');
  }
};

// 成就徽章离开悬停处理
const onAchievementLeave = (index) => {
  const achievement = document.querySelectorAll('.achievement')[index];
  if (achievement) {
    achievement.classList.remove('achievement-hover');
  }
};

// 拖拽开始
const startDrag = (event) => {
  isDragging.value = true;
  
  if (event.type === 'mousedown') {
    startX.value = event.clientX - currentX.value;
    startY.value = event.clientY - currentY.value;
  } else if (event.type === 'touchstart') {
    startX.value = event.touches[0].clientX - currentX.value;
    startY.value = event.touches[0].clientY - currentY.value;
  }
};

// 拖拽中
const onDrag = (event) => {
  if (!isDragging.value) return;
  
  event.preventDefault();
  
  if (event.type === 'mousemove') {
    currentX.value = event.clientX - startX.value;
    currentY.value = event.clientY - startY.value;
  } else if (event.type === 'touchmove') {
    currentX.value = event.touches[0].clientX - startX.value;
    currentY.value = event.touches[0].clientY - startY.value;
  }
  
  updateMapPosition();
};

// 拖拽结束
const endDrag = () => {
  isDragging.value = false;
};

// 更新地图位置
const updateMapPosition = () => {
  if (floorplan.value) {
    floorplan.value.style.transform = `translate(${currentX.value}px, ${currentY.value}px)`;
  }
};

// 生命周期钩子
onMounted(() => {
  loadProgress();
  // 延迟执行，确保DOM元素已完全加载
  setTimeout(() => {
    // 居中显示平面图
    centerFloorplan();
  }, 200);
  // 模拟数据：假设用户已经完成了客厅的学习
  // completeRoom('living-room');
});

// 居中显示平面图
const centerFloorplan = () => {
  if (!floorplan.value || !mapContainer.value) return;
  
  const floorplanRect = floorplan.value.getBoundingClientRect();
  const containerRect = mapContainer.value.getBoundingClientRect();
  
  // 计算居中位置
  const centerX = (containerRect.width - floorplanRect.width) / 2;
  const centerY = (containerRect.height - floorplanRect.height) / 2;
  
  currentX.value = centerX;
  currentY.value = centerY;
  updateMapPosition();
};
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
  background: #f5f5f0;
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

/* 房屋立体图样式 */
  .house-floorplan {
    position: relative;
    width: 100%;
    height: 80%;
    max-width: 800px;
    max-height: 600px;
    margin: 0 auto;
    transform: translateY(5%) perspective(1000px) rotateX(20deg) rotateY(10deg);
    transform-style: preserve-3d;
  }

  /* 墙壁 */
  .house-walls {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    transform-style: preserve-3d;
  }

  .outer-wall {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 2px solid #495057;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .inner-walls {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
  }

  .wall {
    background: #495057;
    position: absolute;
  }

  .horizontal-wall {
    height: 2px;
    background: #495057;
    transform: translateZ(2px);
  }

  .vertical-wall {
    width: 2px;
    background: #495057;
    transform: translateZ(2px);
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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
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

  /* 房间容器 */
  .rooms {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 3;
    transform-style: preserve-3d;
  }

  /* 房间样式 */
  .room {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    cursor: pointer;
    border-radius: 4px;
    overflow: hidden;
    transform-style: preserve-3d;
  }

  .room:hover {
    transform: translateZ(10px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  .room.locked {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .room.locked:hover {
    transform: none;
    box-shadow: none;
  }

  .room-content {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 20px;
    transform-style: preserve-3d;
  }

  .room-label {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 1rem;
    font-weight: 600;
    color: #495057;
    background: rgba(255, 255, 255, 0.9);
    padding: 5px 10px;
    border-radius: 4px;
    z-index: 10;
    font-family: 'Arial', sans-serif;
  }

  /* 锁定遮罩 */
  .room-lock-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
  }

  .lock-icon {
    font-size: 2rem;
    color: #ffffff;
  }

  /* 房间位置 */
  .bedroom {
    top: 0;
    left: 0;
    width: 35%;
    height: 50%;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
  }

  .living-room {
    top: 0;
    left: 35%;
    width: 65%;
    height: 50%;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
  }

  .bathroom {
    top: 50%;
    left: 0;
    width: 35%;
    height: 50%;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
  }

  .kitchen {
    top: 50%;
    left: 35%;
    width: 65%;
    height: 50%;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
  }

  /* 家具样式 */
  .furniture {
    position: absolute;
    transition: all 0.3s ease;
    transform-style: preserve-3d;
  }

  .room:hover .furniture {
    transform: translateZ(10px);
    filter: brightness(0.95);
  }

  /* 卧室家具 */
  .bedroom .bed {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    height: 40%;
  }

  .bed-frame {
    width: 100%;
    height: 100%;
    background-color: #d4a373;
    border-radius: 4px;
    position: relative;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .bed-mattress {
    position: absolute;
    top: 10%;
    left: 10%;
    right: 10%;
    bottom: 10%;
    background-color: #f8f9fa;
    border-radius: 2px;
  }

  .bedroom .nightstand-1, .bedroom .nightstand-2 {
    top: 65%;
    width: 15%;
    height: 25%;
    background-color: #d4a373;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .bedroom .nightstand-1 {
    left: 20%;
  }

  .bedroom .nightstand-2 {
    right: 20%;
  }

  .bedroom .wardrobe {
    top: 25%;
    right: 10%;
    width: 20%;
    height: 50%;
    background-color: #d4a373;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .bedroom .carpet {
    top: 75%;
    left: 25%;
    width: 50%;
    height: 20%;
    background-color: #e9ecef;
    border-radius: 4px;
  }

  .bedroom .tv {
    top: 30%;
    left: 10%;
    width: 15%;
    height: 10%;
    background-color: #343a40;
    border-radius: 2px;
  }

  /* 客厅家具 */
  .living-room .sofa-set {
    top: 30%;
    left: 15%;
    position: relative;
    width: 40%;
    height: 25%;
  }

  .sofa-main {
    width: 100%;
    height: 100%;
    background-color: #dee2e6;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .sofa-arm {
    position: absolute;
    top: 0;
    right: -10%;
    width: 15%;
    height: 100%;
    background-color: #dee2e6;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .living-room .coffee-table {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 25%;
    height: 15%;
    background-color: #d4a373;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .living-room .chair-1, .living-room .chair-2 {
    width: 15%;
    height: 15%;
    background-color: #dee2e6;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .living-room .chair-1 {
    top: 60%;
    left: 25%;
  }

  .living-room .chair-2 {
    top: 60%;
    right: 25%;
  }

  .living-room .tv {
    top: 30%;
    right: 10%;
    width: 15%;
    height: 10%;
    background-color: #343a40;
    border-radius: 2px;
  }

  .living-room .carpet {
    top: 45%;
    left: 30%;
    width: 40%;
    height: 25%;
    background-color: #e9ecef;
    border-radius: 4px;
  }

  /* 浴室家具 */
  .bathroom .bathtub {
    top: 55%;
    left: 15%;
    width: 70%;
    height: 35%;
    background-color: #e9ecef;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .bathroom .toilet {
    top: 65%;
    right: 15%;
    width: 25%;
    height: 20%;
    background-color: #e9ecef;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .bathroom .sink {
    top: 25%;
    right: 15%;
    width: 30%;
    height: 20%;
    background-color: #e9ecef;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .bathroom .bathroom-cabinet {
    top: 25%;
    left: 15%;
    width: 40%;
    height: 20%;
    background-color: #e9ecef;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  /* 厨房家具 */
  .kitchen .kitchen-cabinet {
    top: 20%;
    left: 10%;
    position: relative;
    width: 50%;
    height: 35%;
  }

  .cabinet-main {
    width: 100%;
    height: 100%;
    background-color: #e9ecef;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .cabinet-arm {
    position: absolute;
    top: 100%;
    left: 0;
    width: 35%;
    height: 70%;
    background-color: #e9ecef;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .kitchen-cabinet .sink {
    position: absolute;
    top: 20%;
    right: 20%;
    width: 15%;
    height: 50%;
    background-color: #ced4da;
    border-radius: 2px;
  }

  .kitchen-cabinet .stove {
    position: absolute;
    top: 20%;
    left: 20%;
    width: 18%;
    height: 50%;
    background-color: #ced4da;
    border-radius: 2px;
  }

  .kitchen .dining-table {
    top: 55%;
    right: 15%;
    width: 35%;
    height: 25%;
    background-color: #d4a373;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .kitchen .dining-chair-1, .kitchen .dining-chair-2 {
    width: 12%;
    height: 12%;
    background-color: #dee2e6;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .kitchen .dining-chair-1 {
    top: 60%;
    right: 10%;
  }

  .kitchen .dining-chair-2 {
    top: 65%;
    right: 40%;
  }

  /* 房间位置 - 立体布局 */
  .room.bedroom {
    top: 0;
    left: 0;
    width: 35%;
    height: 50%;
    background: linear-gradient(135deg, rgba(255, 221, 225, 0.7) 0%, rgba(255, 240, 245, 0.7) 100%);
  }

  .room.living-room {
    top: 0;
    left: 35%;
    width: 65%;
    height: 50%;
    background: linear-gradient(135deg, rgba(221, 230, 255, 0.7) 0%, rgba(240, 245, 255, 0.7) 100%);
  }

  .room.bathroom {
    top: 50%;
    left: 0;
    width: 35%;
    height: 50%;
    background: linear-gradient(135deg, rgba(221, 255, 248, 0.7) 0%, rgba(240, 255, 250, 0.7) 100%);
  }

  .room.kitchen {
    top: 50%;
    left: 35%;
    width: 65%;
    height: 50%;
    background: linear-gradient(135deg, rgba(255, 245, 221, 0.7) 0%, rgba(255, 250, 240, 0.7) 100%);
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

/* 地图容器和拖拽相关样式 */
.home-map-container {
  position: relative;
  width: 100%;
  height: 80vh;
  min-height: 600px;
  overflow: hidden;
  border-radius: 12px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-map-container:active {
  cursor: grabbing;
}

.house-floorplan {
  position: relative;
  width: 90%;
  max-width: 1000px;
  height: 80%;
  max-height: 800px;
  background: #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.1s ease-out;
  margin: auto;
}



/* 房间状态样式 */
.room.current-room {
  animation: breathe 2s ease-in-out infinite;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

.room.completed {
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
}

/* 悬停效果 */
.room:hover {
  transform: scale(1.02);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* 点击动画 */
.pulse {
  animation: pulse 0.3s ease-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

.shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

/* 完成动画 */
.complete-animation {
  animation: completeAnimation 1s ease-out;
}

@keyframes completeAnimation {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1) rotate(5deg);
    opacity: 0.8;
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.8);
  }
  100% {
    transform: scale(1);
    opacity: 1;
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
  }
}

/* 弹窗样式 */
.room-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.room-modal {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: modalSlideIn 0.3s ease-out;
  position: relative;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.3s ease;
}

.modal-close:hover {
  color: #374151;
  transform: scale(1.1);
}

.modal-content {
  text-align: center;
}

.modal-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #111827;
}

.modal-description {
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.modal-score {
  margin-bottom: 1.5rem;
}

.score-label {
  font-weight: 600;
  color: #374151;
  margin-right: 0.5rem;
}

.score-stars {
  display: inline-flex;
  gap: 0.25rem;
}

.star {
  font-size: 1.25rem;
  color: #d1d5db;
  transition: all 0.3s ease;
}

.star.filled {
  color: #fbbf24;
  animation: starPop 0.5s ease-out;
}

@keyframes starPop {
  0% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.modal-button {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.modal-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}

/* 锁定提示气泡 */
.lock-tooltip {
  position: fixed;
  z-index: 1001;
  animation: tooltipAppear 0.3s ease-out;
}

@keyframes tooltipAppear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tooltip-content {
  background: #111827;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
}

.tooltip-content::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #111827;
}

/* 成就徽章样式 */
.achievements {
  position: absolute;
  top: 50px;
  left: 50px;
  width: 900px;
  height: 700px;
  z-index: 4;
  pointer-events: none;
}

.achievement {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
  transform: scale(0);
}

.achievement.unlocked {
  opacity: 1;
  transform: scale(1);
  animation: achievementAppear 0.5s ease-out forwards;
}

@keyframes achievementAppear {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-30deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) rotate(15deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.achievement-icon {
  font-size: 2rem;
  animation: pulse 2s infinite;
}

.achievement-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.achievement:hover .achievement-label {
  opacity: 1;
}

.achievement-hover {
  transform: scale(1.1) rotate(5deg);
}

/* 完成徽章 */
.completion-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #10b981;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 装饰元素 */
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

/* 祝贺横幅 */
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
  cursor: pointer;
  transition: all 0.3s ease;
}

.congratulation-banner:hover {
  transform: translate(-50%, -50%) scale(1.02);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
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

.close-hint {
  font-size: 1rem;
  color: #666;
  margin-top: 15px;
  font-style: italic;
  animation: fadeIn 1s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  
  .room-modal {
    width: 95%;
    padding: 1.5rem;
  }
  
  .modal-icon {
    font-size: 3rem;
  }
  
  .modal-title {
    font-size: 1.5rem;
  }
  
  .modal-description {
    font-size: 1rem;
  }
}
</style>