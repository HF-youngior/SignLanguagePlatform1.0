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