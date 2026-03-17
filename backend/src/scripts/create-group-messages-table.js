import { query } from '../config/mysql.js';

const createGroupMessagesTable = async () => {
  try {
    // 创建群组消息表
    await query(`
      CREATE TABLE IF NOT EXISTS group_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL COMMENT '群组ID',
        user_id INT NOT NULL COMMENT '用户ID',
        content TEXT COMMENT '消息内容',
        images JSON COMMENT '图片',
        videos JSON COMMENT '视频',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES groups_table(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_group_id (group_id),
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='群组消息表'
    `);
    console.log('✅ 群组消息表创建成功');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 创建群组消息表失败:', error);
    process.exit(1);
  }
};

createGroupMessagesTable();