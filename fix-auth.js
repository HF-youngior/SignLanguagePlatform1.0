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

// 修复认证问题
async function fixAuth() {
  let connection;
  try {
    // 建立数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log('成功连接到数据库');
    
    // 更新所有用户的 is_active 字段为 true
    console.log('更新用户的 is_active 字段...');
    const [result] = await connection.execute('UPDATE users SET is_active = true WHERE is_active IS NULL');
    console.log(`更新了 ${result.affectedRows} 个用户的 is_active 字段`);
    
    // 更新所有用户的 is_email_verified 字段为 true
    console.log('更新用户的 is_email_verified 字段...');
    const [result2] = await connection.execute('UPDATE users SET is_email_verified = true');
    console.log(`更新了 ${result2.affectedRows} 个用户的 is_email_verified 字段`);
    
    // 检查更新后的用户状态
    console.log('检查更新后的用户状态...');
    const [users] = await connection.execute('SELECT id, username, is_active, is_email_verified FROM users');
    users.forEach(user => {
      console.log(`ID: ${user.id}, 用户名: ${user.username}, 活跃状态: ${user.is_active}, 邮箱验证: ${user.is_email_verified}`);
    });
    
    console.log('认证问题修复完成！');
    
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
fixAuth();