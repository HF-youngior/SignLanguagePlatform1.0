// 模拟前端的 getAvatarUrl 函数
const DEFAULT_AVATAR = '/images/default-avatar.png';

function getAvatarUrl(avatar) {
  if (!avatar) {
    return DEFAULT_AVATAR;
  }
  
  // 如果是完整的URL，直接返回
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  
  // 如果是相对路径，添加后端服务器地址
  const backendUrl = 'http://localhost:8000';
  return `${backendUrl}${avatar}`;
}

// 测试数据库中的头像路径
const testAvatarPaths = [
  '/public/avatars/4.png',
  '/public/avatars/5.png',
  '/public/avatars/6.png',
  '/public/avatars/7.png',
  '/public/avatars/8.png'
];

console.log('测试头像URL生成:');
console.log('----------------------------------------');
testAvatarPaths.forEach(path => {
  const fullUrl = getAvatarUrl(path);
  console.log(`输入: ${path}`);
  console.log(`输出: ${fullUrl}`);
  console.log('');
});

// 测试默认头像
console.log('测试默认头像:');
console.log('----------------------------------------');
console.log(`输入: null`);
console.log(`输出: ${getAvatarUrl(null)}`);
console.log('');
console.log(`输入: undefined`);
console.log(`输出: ${getAvatarUrl(undefined)}`);
console.log('');
console.log(`输入: ''`);
console.log(`输出: ${getAvatarUrl('')}`);
