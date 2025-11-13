import fetch from 'node-fetch';

const API_URL = 'http://localhost:8000';

async function testRandomLetterQuiz() {
  try {
    console.log('测试 GET /api/quiz/random-letter API...');
    
    const response = await fetch(`${API_URL}/api/quiz/random-letter`);
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('API响应成功!');
    console.log('返回数据:');
    console.log(JSON.stringify(data, null, 2));
    
    // 验证返回的数据结构
    validateQuizData(data);
    
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

function validateQuizData(data) {
  console.log('\n数据验证:');
  
  // 检查questionImage字段
  if (!data.questionImage) {
    console.error('- 缺少questionImage字段');
  } else {
    console.log('- questionImage: ✓');
  }
  
  // 检查correctAnswer字段
  if (!data.correctAnswer) {
    console.error('- 缺少correctAnswer字段');
  } else {
    console.log('- correctAnswer: ✓');
  }
  
  // 检查options字段
  if (!Array.isArray(data.options) || data.options.length !== 3) {
    console.error('- options字段无效或不包含3个选项');
  } else {
    console.log('- options包含3个选项: ✓');
    // 验证正确答案在选项中
    if (!data.options.includes(data.correctAnswer)) {
      console.error('- 正确答案不在选项列表中!');
    } else {
      console.log('- 正确答案在选项中: ✓');
    }
  }
  
  // 检查explanationImage字段
  if (!data.explanationImage) {
    console.error('- 缺少explanationImage字段');
  } else {
    console.log('- explanationImage: ✓');
  }
}

console.log('开始测试随机字母测验API...');
testRandomLetterQuiz();
