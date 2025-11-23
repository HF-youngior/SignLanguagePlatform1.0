import { db } from './src/config/mysql.js';

async function initDatabase() {
  try {
    console.log('开始初始化数据库...');
    
    // 连接数据库
    await db.connect();
    
    // 创建手语字母表
    await db.query(`
      CREATE TABLE IF NOT EXISTS finger_alphabets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        letter VARCHAR(1) NOT NULL UNIQUE,
        image_path VARCHAR(255),
        explanation_image_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建学习进度表
    await db.query(`
      CREATE TABLE IF NOT EXISTS learning_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        letter_id INT NOT NULL,
        user_id INT,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (letter_id) REFERENCES finger_alphabets(id),
        UNIQUE KEY unique_progress (letter_id, user_id)
      )
    `);
    
    // 插入A-J的手语字母数据
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    
    for (const letter of letters) {
      await db.query(`
        INSERT IGNORE INTO finger_alphabets (letter, image_path, explanation_image_path) 
        VALUES (?, ?, ?)
      `, [
        letter,
        `images/finger_alphabet/${letter}.svg`,
        `images/finger_alphabet_explanation/${letter}.svg`
      ]);
    }
    
    console.log('数据库初始化完成！');
    console.log('已创建手语字母表和学习进度表');
    console.log('已插入A-J的手语字母数据');
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
  } finally {
    await db.disconnect();
  }
}

// 运行初始化
initDatabase();


