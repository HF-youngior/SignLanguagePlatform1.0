import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'newuser',
  password: '123qwe,./',
  database: 'sign_language_learning'
};

// 创建数据库连接（不指定数据库，用于创建数据库）
const createConnection = async () => {
  return mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password
  });
};

// 创建数据库
const createDatabase = async (connection) => {
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ 数据库创建成功');
    await connection.query(`USE ${dbConfig.database}`);
  } catch (error) {
    console.error('❌ 创建数据库失败:', error);
    throw error;
  }
};

// 创建用户表
const createUsersTable = async (connection) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(50),
      last_name VARCHAR(50),
      avatar VARCHAR(255),
      bio TEXT,
      role ENUM('user', 'moderator', 'admin') DEFAULT 'user',
      is_active BOOLEAN DEFAULT TRUE,
      is_email_verified BOOLEAN DEFAULT FALSE,
      email_verification_token VARCHAR(255),
      email_verification_expires DATETIME,
      password_reset_token VARCHAR(255),
      password_reset_expires DATETIME,
      learning_progress JSON,
      preferences JSON,
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_username (username),
      INDEX idx_email (email),
      INDEX idx_role (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;
  await connection.execute(sql);
  console.log('✅ 用户表创建成功');
};

// 创建帖子表
const createPostsTable = async (connection) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      author_id INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      category ENUM('学习心得', '问题求助', '经验分享', '其他') DEFAULT '其他',
      hashtags JSON,
      images JSON,
      videos JSON,
      likes_count INT DEFAULT 0,
      views INT DEFAULT 0,
      is_deleted BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_author (author_id),
      INDEX idx_category (category),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;
  await connection.execute(sql);
  console.log('✅ 帖子表创建成功');
};

// 创建评论表
const createCommentsTable = async (connection) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      user_id INT NOT NULL,
      content TEXT NOT NULL,
      parent_id INT DEFAULT NULL,
      likes_count INT DEFAULT 0,
      is_deleted BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
      INDEX idx_post (post_id),
      INDEX idx_user (user_id),
      INDEX idx_parent (parent_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;
  await connection.execute(sql);
  console.log('✅ 评论表创建成功');
};

// 创建学习记录表
const createLearningRecordsTable = async (connection) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS learning_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      lesson_type VARCHAR(50) NOT NULL,
      lesson_id VARCHAR(100) NOT NULL,
      lesson_name VARCHAR(200),
      completed BOOLEAN DEFAULT FALSE,
      score INT,
      time_spent INT DEFAULT 0,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_lesson (user_id, lesson_type, lesson_id),
      INDEX idx_user (user_id),
      INDEX idx_lesson_type (lesson_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;
  await connection.execute(sql);
  console.log('✅ 学习记录表创建成功');
};

// 创建翻译记录表
const createTranslationRecordsTable = async (connection) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS translation_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      input_type ENUM('image', 'video', 'camera') NOT NULL,
      input_content TEXT,
      result TEXT,
      confidence DECIMAL(5,2),
      model_used VARCHAR(50),
      processing_time INT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user (user_id),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;
  await connection.execute(sql);
  console.log('✅ 翻译记录表创建成功');
};

// 创建点赞表
const createLikesTable = async (connection) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS likes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      target_type ENUM('post', 'comment') NOT NULL,
      target_id INT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_like (user_id, target_type, target_id),
      INDEX idx_target (target_type, target_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;
  await connection.execute(sql);
  console.log('✅ 点赞表创建成功');
};

// 创建管理员操作日志表
const createAdminLogsTable = async (connection) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS admin_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_id INT NOT NULL,
      action VARCHAR(100) NOT NULL,
      target_type VARCHAR(50),
      target_id INT,
      details JSON,
      ip_address VARCHAR(45),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_admin (admin_id),
      INDEX idx_action (action),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;
  await connection.execute(sql);
  console.log('✅ 管理员操作日志表创建成功');
};

// 创建群组表
const createGroupsTable = async (connection) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS groups_table (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      creator_id INT NOT NULL,
      type ENUM('public', 'private', 'closed') DEFAULT 'public',
      category VARCHAR(50),
      avatar VARCHAR(255),
      cover_image VARCHAR(255),
      rules TEXT,
      member_count INT DEFAULT 0,
      post_count INT DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_creator (creator_id),
      INDEX idx_type (type),
      INDEX idx_category (category),
      INDEX idx_is_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;
  await connection.execute(sql);
  console.log('✅ 群组表创建成功');
};

// 创建群组成员表
const createGroupMembersTable = async (connection) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS group_members (
      id INT AUTO_INCREMENT PRIMARY KEY,
      group_id INT NOT NULL,
      user_id INT NOT NULL,
      role ENUM('owner', 'admin', 'member') DEFAULT 'member',
      is_active BOOLEAN DEFAULT TRUE,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups_table(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_group_user (group_id, user_id),
      INDEX idx_group (group_id),
      INDEX idx_user (user_id),
      INDEX idx_role (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;
  await connection.execute(sql);
  console.log('✅ 群组成员表创建成功');
};

// 创建测试账号
const createTestUsers = async (connection) => {
  const salt = await bcrypt.genSalt(10);
  
  // 管理员账号
  const adminPassword = await bcrypt.hash('admin123', salt);
  await connection.execute(
    `INSERT INTO users (username, email, password, first_name, last_name, role, is_active, is_email_verified) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP`,
    ['admin', 'admin@signlanguage.com', adminPassword, '系统', '管理员', 'admin', true, true]
  );
  
  // 测试用户账号
  const userPassword = await bcrypt.hash('user123', salt);
  await connection.execute(
    `INSERT INTO users (username, email, password, first_name, last_name, role, is_active, is_email_verified) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP`,
    ['testuser', 'test@example.com', userPassword, '测试', '用户', 'user', true, true]
  );
  
  // 版主账号
  const moderatorPassword = await bcrypt.hash('moderator123', salt);
  await connection.execute(
    `INSERT INTO users (username, email, password, first_name, last_name, role, is_active, is_email_verified) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP`,
    ['moderator', 'moderator@example.com', moderatorPassword, '社区', '版主', 'moderator', true, true]
  );
  
  console.log('✅ 测试账号创建成功');
  console.log('   管理员: admin / admin123');
  console.log('   测试用户: testuser / user123');
  console.log('   版主: moderator / moderator123');
};

// 主函数
const initDatabase = async () => {
  let connection;
  try {
    console.log('🚀 开始初始化MySQL数据库...\n');
    
    // 创建连接
    connection = await createConnection();
    console.log('✅ 数据库连接成功\n');
    
    // 创建数据库
    await createDatabase(connection);
    
    // 创建表
    await createUsersTable(connection);
    await createPostsTable(connection);
    await createCommentsTable(connection);
    await createLearningRecordsTable(connection);
    await createTranslationRecordsTable(connection);
    await createLikesTable(connection);
    await createAdminLogsTable(connection);
    await createGroupsTable(connection);
    await createGroupMembersTable(connection);
    
    // 创建测试账号
    await createTestUsers(connection);
    
    console.log('\n✅ 数据库初始化完成！');
    console.log('\n测试账号信息：');
    console.log('  管理员: admin / admin123');
    console.log('  测试用户: testuser / user123');
    console.log('  版主: moderator / moderator123');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// 运行初始化
initDatabase();