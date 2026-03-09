// 简单的API测试脚本
const testAPI = async () => {
  const baseURL = 'http://localhost:8000/api';
  
  try {
    console.log('测试手语字母API...');
    
    // 测试获取所有字母
    const response1 = await fetch(`${baseURL}/sign-letters/letters`);
    const data1 = await response1.json();
    console.log('获取所有字母:', data1);
    
    // 测试生成题目
    const response2 = await fetch(`${baseURL}/sign-letters/question?currentId=1`);
    const data2 = await response2.json();
    console.log('生成题目:', data2);
    
    // 测试提交答案
    const response3 = await fetch(`${baseURL}/sign-letters/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        letterId: 1,
        selectedAnswer: 'A',
        userId: null
      })
    });
    const data3 = await response3.json();
    console.log('提交答案:', data3);
    
  } catch (error) {
    console.error('API测试失败:', error);
  }
};

// 在浏览器控制台中运行
if (typeof window !== 'undefined') {
  testAPI();
} else {
  console.log('请在浏览器控制台中运行此脚本');
}

















































