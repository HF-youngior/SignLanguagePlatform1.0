/**
 * LEGACY SCRIPT - DO NOT USE FOR PRODUCTION RECOVERY.
 * This script can mutate cloud data and create inconsistent states.
 * Use scripts/db_sync_full_from_old.ps1 for authoritative restore.
 */
const mysql = require('mysql2/promise');

// 新的数据库配置
const dbConfig = {
  host: 'rm-2zelg8vzn3xb07mvako.mysql.rds.aliyuncs.com',
  user: 'test1',
  password: 'asdfgh0625YYH',
  database: 'csl',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 修复数据库
async function fixDatabase() {
  let connection;
  try {
    // 建立数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log('成功连接到新数据库');
    
    // 检查并修改 users 表结构，添加 first_name 字段
    console.log('检查并修改 users 表结构...');
    try {
      await connection.execute('ALTER TABLE users ADD COLUMN first_name VARCHAR(50) DEFAULT NULL');
      console.log('users 表添加 first_name 字段成功');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('users 表已经有 first_name 字段');
      } else {
        throw error;
      }
    }
    
    // 创建 likes 表
    console.log('创建 likes 表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS likes (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        target_type ENUM('post','comment') NOT NULL,
        target_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_like (user_id, target_type, target_id),
        KEY idx_target (target_type, target_id),
        CONSTRAINT likes_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('likes 表创建成功');
    
    // 导入 likes 数据
    console.log('导入 likes 数据...');
    await connection.execute(`
      INSERT IGNORE INTO likes (id, user_id, target_type, target_id, created_at) VALUES
      (5, 2, 'post', 5, '2026-03-08 09:54:11'),
      (6, 2, 'post', 1, '2026-03-08 09:54:13'),
      (9, 2, 'post', 2, '2026-03-08 15:54:47'),
      (10, 2, 'post', 4, '2026-03-08 15:54:58'),
      (13, 3, 'post', 5, '2026-03-15 13:39:22')
    `);
    console.log('likes 数据导入成功');
    
    // 更新用户表中的 first_name 字段
    console.log('更新用户表中的 first_name 字段...');
    await connection.execute(`
      UPDATE users SET first_name = username WHERE first_name IS NULL
    `);
    console.log('用户表 first_name 字段更新成功');
    
    // 检查数据完整性
    console.log('检查数据完整性...');
    
    // 检查用户表
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`用户表中的记录数: ${users[0].count}`);
    
    // 检查帖子表
    const [posts] = await connection.execute('SELECT COUNT(*) as count FROM posts');
    console.log(`帖子表中的记录数: ${posts[0].count}`);
    
    // 检查评论表
    const [comments] = await connection.execute('SELECT COUNT(*) as count FROM comments');
    console.log(`评论表中的记录数: ${comments[0].count}`);
    
    // 检查点赞表
    const [likes] = await connection.execute('SELECT COUNT(*) as count FROM likes');
    console.log(`点赞表中的记录数: ${likes[0].count}`);
    
    // 测试帖子查询
    console.log('测试帖子查询...');
    try {
      const [testPosts] = await connection.execute(`
        SELECT p.*, u.username, u.first_name, u.avatar,
               (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = false) as comments_count,
               (SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = p.id) as likes_count
        FROM posts p
        JOIN users u ON p.author_id = u.id
        WHERE p.is_deleted = false
        ORDER BY p.created_at DESC
        LIMIT 10 OFFSET 0
      `);
      console.log(`帖子查询成功，返回 ${testPosts.length} 条记录`);
    } catch (error) {
      console.error('帖子查询测试失败:', error.message);
    }
    
    console.log('数据库修复完成！');
    
  } catch (error) {
    console.error('修复失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 执行修复
fixDatabase();
