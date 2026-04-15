// 模拟前端的 getAvatarUrl 函数
const DEFAULT_AVATAR = '/images/default-avatar.png';

function getAvatarUrl(avatar) {
  console.log(`输入的头像路径: ${avatar}`);
  
  if (!avatar) {
    console.log('头像路径为空，返回默认头像');
    return DEFAULT_AVATAR;
  }
  
  // 如果是完整的URL，直接返回
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    console.log('头像路径是完整的URL，直接返回');
    return avatar;
  }
  
  // 如果是相对路径，添加后端服务器地址
  const backendUrl = 'http://localhost:8000';
  const fullUrl = `${backendUrl}${avatar}`;
  console.log(`生成的完整头像URL: ${fullUrl}`);
  return fullUrl;
}

// 测试数据库中的头像路径
const testAvatarPaths = [
  '/public/avatars/4.png',
  '/public/avatars/5.png',
  null,
  undefined,
  ''
];

console.log('测试头像URL生成:');
console.log('----------------------------------------');
testAvatarPaths.forEach((path, index) => {
  console.log(`测试 ${index + 1}:`);
  const fullUrl = getAvatarUrl(path);
  console.log(`输出: ${fullUrl}`);
  console.log('');
});
