import { query } from '../config/mysql.js';

const createNotificationsTable = async () => {
  try {
    // 创建通知表
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL COMMENT '接收通知的用户ID',
        sender_id INT DEFAULT NULL COMMENT '发送通知的用户ID',
        type ENUM('like', 'comment', 'friend_request', 'friend_accept', 'system') NOT NULL COMMENT '通知类型',
        title VARCHAR(255) DEFAULT NULL COMMENT '通知标题',
        content TEXT DEFAULT NULL COMMENT '通知内容',
        target_type VARCHAR(50) DEFAULT NULL COMMENT '目标类型：post, comment, user等',
        target_id INT DEFAULT NULL COMMENT '目标ID',
        is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_is_read (is_read),
        INDEX idx_type (type),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表'
    `);
    
    console.log('✅ 通知表创建成功');
    
    // 检查表是否已存在数据
    const existingNotifications = await query('SELECT COUNT(*) as count FROM notifications');
    
    if (existingNotifications[0].count === 0) {
      console.log('ℹ️ 通知表为空，可以开始使用通知功能');
    } else {
      console.log(`ℹ️ 通知表已有 ${existingNotifications[0].count} 条数据`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 创建通知表失败:', error);
    process.exit(1);
  }
};

createNotificationsTable();
