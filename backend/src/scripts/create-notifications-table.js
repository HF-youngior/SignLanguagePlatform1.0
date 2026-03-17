import { query } from '../config/mysql.js';

const createNotificationsTable = async () => {
  try {
    // 创建通知表
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL COMMENT '接收通知的用户ID',
        sender_id INT NOT NULL COMMENT '发送通知的用户ID',
        type ENUM('like', 'comment', 'follow', 'system', 'group') NOT NULL COMMENT '通知类型',
        target_type ENUM('post', 'comment', 'user', 'group') DEFAULT NULL COMMENT '目标类型',
        target_id INT DEFAULT NULL COMMENT '目标ID',
        content VARCHAR(255) NOT NULL COMMENT '通知内容',
        is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_is_read (is_read),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表'
    `);
    console.log('✅ 通知表创建成功');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 创建通知表失败:', error);
    process.exit(1);
  }
};

createNotificationsTable();