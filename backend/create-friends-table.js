import { query } from './src/config/mysql.js';

async function createFriendsTable() {
  try {
    // 创建好友表
    await query(`
      CREATE TABLE IF NOT EXISTS friends (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        friend_id INT NOT NULL,
        status ENUM('pending', 'accepted') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_friendship (user_id, friend_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Friends table created successfully');
  } catch (error) {
    console.error('Error creating friends table:', error);
  } finally {
    process.exit();
  }
}

createFriendsTable();