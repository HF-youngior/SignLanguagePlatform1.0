/**
 * LEGACY SCRIPT - DO NOT USE FOR PRODUCTION RECOVERY.
 * This script performs partial/manual data rewrites and is unsafe for sync.
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

// 更新数据库结构并导入旧数据
async function updateDatabase() {
  let connection;
  try {
    // 建立数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log('成功连接到新数据库');
    
    // 先删除评论表（因为它引用了帖子表）
    console.log('删除评论表...');
    await connection.execute('DROP TABLE IF EXISTS comments');
    console.log('评论表删除成功');
    
    // 删除旧的帖子表
    console.log('删除旧的帖子表...');
    await connection.execute('DROP TABLE IF EXISTS posts');
    console.log('旧帖子表删除成功');
    
    // 创建新的帖子表（与旧数据库结构一致）
    console.log('创建新的帖子表...');
    await connection.execute(`
      CREATE TABLE posts (
        id INT NOT NULL AUTO_INCREMENT,
        author_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        category ENUM('学习心得','问题求助','经验分享','其他') DEFAULT '其他',
        privacy ENUM('public','friends','private') DEFAULT 'public',
        hashtags JSON DEFAULT NULL,
        images JSON DEFAULT NULL,
        videos JSON DEFAULT NULL,
        likes_count INT DEFAULT 0,
        views INT DEFAULT 0,
        is_deleted TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_author (author_id),
        KEY idx_category (category),
        KEY idx_created_at (created_at),
        CONSTRAINT posts_ibfk_1 FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('新帖子表创建成功');
    
    // 创建评论表（与旧数据库结构一致）
    console.log('创建评论表...');
    await connection.execute(`
      CREATE TABLE comments (
        id INT NOT NULL AUTO_INCREMENT,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        parent_id INT DEFAULT NULL,
        likes_count INT DEFAULT 0,
        is_deleted TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_post (post_id),
        KEY idx_user (user_id),
        KEY idx_parent (parent_id),
        CONSTRAINT comments_ibfk_1 FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
        CONSTRAINT comments_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT comments_ibfk_3 FOREIGN KEY (parent_id) REFERENCES comments (id) ON DELETE CASCADE
      ) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('评论表创建成功');
    
    // 插入用户数据（确保帖子的作者存在）
    console.log('插入用户数据...');
    await connection.execute(`
      INSERT IGNORE INTO users (id, username, email, password, role) VALUES
      (1, 'admin', 'admin@example.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'admin'),
      (2, 'user2', 'user2@example.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'user'),
      (3, 'user3', 'user3@example.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'user'),
      (10, 'user10', 'user10@example.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'user'),
      (11, 'user11', 'user11@example.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'user'),
      (12, 'user12', 'user12@example.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'user'),
      (13, 'user13', 'user13@example.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'user'),
      (14, 'user14', 'user14@example.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'user')
    `);
    console.log('用户数据插入成功');
    
    // 插入旧数据库中的帖子数据
    console.log('导入帖子数据...');
    await connection.execute(`
      INSERT INTO posts (id, author_id, title, content, category, privacy, hashtags, images, videos, likes_count, views, is_deleted, created_at, updated_at) VALUES
      (1, 2, '今天学会了"你好"的手语表达', '今天学会了"你好"的手语表达，感觉很有成就感！大家有什么学习技巧可以分享吗？#手语学习 #初学者', '其他', 'public', NULL, NULL, NULL, 1, 32, 0, '2026-03-06 22:02:24', '2026-03-08 11:09:36'),
      (2, 10, '分享一个学习心得', '分享一个学习心得：每天坚持练习15分钟，比一次性练习2小时效果更好。循序渐进很重要！#学习心得 #坚持', '其他', 'public', NULL, NULL, NULL, 1, 41, 0, '2026-03-04 22:02:24', '2026-03-08 15:54:48'),
      (3, 11, '本周的挑战', '本周的挑战：学会用手语表达"今天天气很好"。大家可以尝试一下，有问题随时提问！#挑战 #手语练习', '其他', 'public', NULL, NULL, NULL, 0, 51, 0, '2026-03-06 22:02:24', '2026-03-07 22:02:24'),
      (4, 12, '手语和口语的区别', '手语和口语最大的区别在于，手语是视觉语言，需要用到面部表情、身体姿态和手势。学习手语不仅是学习手势，还要学习 Deaf 文化。#聋人文化 #手语差异', '其他', 'public', NULL, NULL, NULL, 1, 22, 0, '2026-03-04 22:02:24', '2026-03-08 15:55:01'),
      (5, 13, '推荐一个学习资源', '推荐一个学习资源：YouTube上的"Sign Language 101"频道，讲解非常清晰，适合初学者！#学习资源 #推荐', '其他', 'public', NULL, NULL, NULL, 2, 96, 0, '2026-03-07 22:02:24', '2026-03-15 13:39:22'),
      (6, 2, '第一次和聋人朋友交流', '今天第一次用学到的手语和聋人朋友交流，虽然很简单，但对方很耐心地纠正我的手势，这种体验太棒了！#聋健交流 #实践', '其他', 'public', NULL, NULL, NULL, 1, 76, 0, '2026-03-04 22:02:24', '2026-03-15 14:03:54'),
      (7, 10, '手语学习的难点', '我觉得手语学习最大的难点是语法结构和口语完全不同，需要重新建立语言思维。大家有什么好的学习方法吗？#学习困难 #求助', '其他', 'public', NULL, NULL, NULL, 0, 47, 0, '2026-03-04 22:02:24', '2026-03-07 22:02:24')
    `);
    console.log('帖子数据导入成功');
    
    // 插入旧数据库中的评论数据（只导入引用了已存在帖子的评论）
    console.log('导入评论数据...');
    await connection.execute(`
      INSERT INTO comments (id, post_id, user_id, content, parent_id, likes_count, is_deleted, created_at, updated_at) VALUES
      (1, 1, 10, '我也是初学者，一起进步！', NULL, 0, 0, '2026-03-07 22:02:24', '2026-03-07 22:02:24'),
      (2, 1, 13, '请问有什么学习技巧吗？', NULL, 0, 0, '2026-03-06 22:02:24', '2026-03-07 22:02:24'),
      (3, 1, 2, '我也是初学者，一起进步！', NULL, 0, 0, '2026-03-06 22:02:24', '2026-03-07 22:02:24'),
      (4, 2, 13, '太棒了！我也在学习这个', NULL, 0, 0, '2026-03-06 22:02:24', '2026-03-07 22:02:24'),
      (5, 2, 14, '请问有什么学习技巧吗？', NULL, 0, 0, '2026-03-06 22:02:24', '2026-03-07 22:02:24'),
      (6, 2, 14, '我也是初学者，一起进步！', NULL, 0, 0, '2026-03-05 22:02:24', '2026-03-07 22:02:24'),
      (7, 3, 12, '加油！坚持就是胜利', NULL, 0, 0, '2026-03-06 22:02:24', '2026-03-07 22:02:24'),
      (8, 3, 10, '感谢分享，对我很有帮助', NULL, 0, 0, '2026-03-07 22:02:24', '2026-03-07 22:02:24'),
      (9, 3, 14, '请问有什么学习技巧吗？', NULL, 0, 0, '2026-03-05 22:02:24', '2026-03-07 22:02:24'),
      (10, 4, 12, '感谢分享，对我很有帮助', NULL, 0, 0, '2026-03-06 22:02:24', '2026-03-07 22:02:24'),
      (11, 4, 10, '感谢分享，对我很有帮助', NULL, 0, 0, '2026-03-06 22:02:24', '2026-03-07 22:02:24'),
      (12, 4, 2, '我也是初学者，一起进步！', NULL, 0, 0, '2026-03-07 22:02:24', '2026-03-07 22:02:24'),
      (13, 5, 11, '加油！坚持就是胜利', NULL, 0, 0, '2026-03-05 22:02:24', '2026-03-07 22:02:24'),
      (14, 5, 12, '加油！坚持就是胜利', NULL, 0, 0, '2026-03-05 22:02:24', '2026-03-07 22:02:24'),
      (15, 5, 11, '我也是初学者，一起进步！', NULL, 0, 0, '2026-03-07 22:02:24', '2026-03-07 22:02:24'),
      (19, 1, 2, '一起加油', NULL, 0, 0, '2026-03-08 09:54:26', '2026-03-08 09:54:26'),
      (20, 1, 2, '多学多练', 2, 0, 0, '2026-03-08 10:19:42', '2026-03-08 10:19:42'),
      (22, 6, 3, '我们一起加油鸭', NULL, 0, 0, '2026-03-15 13:40:00', '2026-03-15 13:40:00'),
      (23, 6, 3, '我们一起加油鸭', NULL, 0, 0, '2026-03-15 13:40:08', '2026-03-15 13:40:08'),
      (24, 6, 3, '我们一起加油鸭', NULL, 0, 0, '2026-03-15 13:40:09', '2026-03-15 13:40:09')
    `);
    console.log('评论数据导入成功');
    
    // 检查数据是否完整
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
    
    // 检查翻译历史表
    const [translationHistory] = await connection.execute('SELECT COUNT(*) as count FROM translation_history');
    console.log(`翻译历史表中的记录数: ${translationHistory[0].count}`);
    
    console.log('数据库更新和数据导入完成！');
    
  } catch (error) {
    console.error('更新失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 执行更新
updateDatabase();
