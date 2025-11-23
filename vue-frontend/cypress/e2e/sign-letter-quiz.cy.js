// 手语字母测验端到端测试

describe('手语字母测验功能测试', () => {
  beforeEach(() => {
    // 拦截API请求，模拟后端响应
    cy.intercept('GET', '**/api/quiz/sign-letters/quiz', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          id: 1,
          letter: 'A',
          image_path: '/images/finger_alphabet/A.svg',
          explanation_path: '/images/finger_alphabet_explanation/A.svg',
          options: ['A', 'B', 'C'],
          correct_answer: 'A'
        },
        message: '获取测验题目成功'
      }
    }).as('getQuizQuestion');

    // 访问测验页面
    cy.visit('/learn/sign-letter-quiz');
    
    // 等待页面加载和API响应
    cy.wait('@getQuizQuestion');
  });

  it('应成功加载第一题，显示问题和选项', () => {
    // 验证页面标题
    cy.contains('下面的手语是_____？').should('be.visible');
    
    // 验证图片已加载
    cy.get('img[alt="手语图片"]').should('be.visible');
    
    // 验证三个选项按钮
    cy.get('button').should('have.length', 3);
    cy.contains('button', 'A').should('be.visible');
    cy.contains('button', 'B').should('be.visible');
    cy.contains('button', 'C').should('be.visible');
  });

  it('选择正确答案应显示正确的视觉反馈', () => {
    // 点击正确答案
    cy.contains('button', 'A').click();
    
    // 验证视觉反馈
    cy.contains('正确！').should('be.visible');
    cy.contains('button', 'A').should('have.class', 'bg-green-500');
    
    // 验证下一题按钮出现
    cy.contains('button', '下一题').should('be.visible');
  });

  it('选择错误答案应显示错误的视觉反馈和教程按钮', () => {
    // 点击错误答案
    cy.contains('button', 'B').click();
    
    // 验证视觉反馈
    cy.contains('答错了').should('be.visible');
    cy.contains('正确答案是: A').should('be.visible');
    cy.contains('button', 'B').should('have.class', 'bg-red-500');
    
    // 验证查看教程按钮出现
    cy.contains('button', '查看教程').should('be.visible');
  });

  it('点击查看教程应显示教程图片', () => {
    // 拦截查看教程的请求
    cy.intercept('GET', '**/images/finger_alphabet_explanation/**', {
      statusCode: 200
    }).as('getExplanationImage');
    
    // 点击错误答案
    cy.contains('button', 'B').click();
    
    // 点击查看教程按钮
    cy.contains('button', '查看教程').click();
    
    // 验证教程图片显示
    cy.get('img[alt="手语教程图片"]').should('be.visible');
    
    // 验证退出学习按钮出现
    cy.contains('button', '退出学习').should('be.visible');
  });

  it('点击下一题应加载新题目', () => {
    // 拦截下一题的API请求
    cy.intercept('GET', '**/api/quiz/sign-letters/quiz', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          id: 2,
          letter: 'B',
          image_path: '/images/finger_alphabet/B.svg',
          explanation_path: '/images/finger_alphabet_explanation/B.svg',
          options: ['B', 'D', 'E'],
          correct_answer: 'B'
        },
        message: '获取测验题目成功'
      }
    }).as('getNextQuizQuestion');
    
    // 选择答案
    cy.contains('button', 'A').click();
    
    // 点击下一题按钮
    cy.contains('button', '下一题').click();
    
    // 等待API响应
    cy.wait('@getNextQuizQuestion');
    
    // 验证新题目加载
    cy.contains('button', 'B').should('be.visible');
    cy.contains('button', 'D').should('be.visible');
    cy.contains('button', 'E').should('be.visible');
  });

  it('测试网络中断场景', () => {
    // 拦截API请求并模拟失败
    cy.intercept('GET', '**/api/quiz/sign-letters/quiz', {
      statusCode: 500,
      body: {
        success: false,
        message: '服务器错误',
        error: 'Internal Server Error'
      }
    }).as('failedQuizRequest');
    
    // 选择答案
    cy.contains('button', 'A').click();
    
    // 点击下一题按钮
    cy.contains('button', '下一题').click();
    
    // 等待失败的API响应
    cy.wait('@failedQuizRequest');
    
    // 验证错误提示显示
    cy.contains('加载失败').should('be.visible');
    
    // 验证重新加载按钮显示
    cy.contains('button', '重新加载').should('be.visible');
  });

  it('测试最后一题场景', () => {
    // 模拟最后一题的标志
    cy.intercept('GET', '**/api/quiz/sign-letters/quiz', {
      statusCode: 404,
      body: {
        success: false,
        message: '没有找到测验数据',
        error: 'No quiz data available'
      }
    }).as('lastQuestionRequest');
    
    // 选择答案
    cy.contains('button', 'A').click();
    
    // 点击下一题按钮
    cy.contains('button', '下一题').click();
    
    // 等待API响应
    cy.wait('@lastQuestionRequest');
    
    // 验证完成消息
    cy.contains('没有找到测验数据').should('be.visible');
  });
});
