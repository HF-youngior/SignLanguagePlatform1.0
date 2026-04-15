const fetch = require('node-fetch');

async function testApiResponse() {
  try {
    console.log('测试API响应...');
    
    const response = await fetch('http://localhost:8000/api/community/posts');
    const data = await response.json();
    
    if (data.success) {
      console.log('\nAPI响应成功!');
      console.log(`返回了 ${data.data.posts.length} 个帖子`);
      
      console.log('\n帖子数据:');
      console.log('----------------------------------------');
      data.data.posts.forEach((post, index) => {
        console.log(`帖子 ${index + 1}:`);
        console.log(`  ID: ${post.id}`);
        console.log(`  用户名: ${post.username}`);
        console.log(`  头像: ${post.avatar}`);
        console.log(`  内容: ${post.content.substring(0, 50)}...`);
        console.log('');
      });
    } else {
      console.error('API响应失败:', data.message);
    }
    
  } catch (error) {
    console.error('测试API响应时出错:', error);
  }
}

// 运行测试
testApiResponse();
