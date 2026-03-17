import { pool, query } from '../src/config/mysql.js';

async function createFriendsTable() {
  try {
    console.log('Creating friends table...');
    
    // 创建friends表
    await query(`
      CREATE TABLE IF NOT EXISTS friends (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        friend_id INT NOT NULL,
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_friendship (user_id, friend_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('Friends table created successfully!');
    
    // 关闭连接池
    pool.end();
  } catch (error) {
    console.error('Error creating friends table:', error);
    pool.end();
  }
}

createFriendsTable();