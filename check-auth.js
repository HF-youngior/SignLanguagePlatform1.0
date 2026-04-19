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

// 检查认证问题
async function checkAuth() {
  let connection;
  try {
    // 建立数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log('成功连接到数据库');
    
    // 检查用户表结构
    console.log('检查用户表结构...');
    const [columns] = await connection.execute('DESCRIBE users');
    console.log('用户表字段:');
    columns.forEach(column => {
      console.log(`${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(NULL)' : ''}`);
    });
    
    // 检查用户数据
    console.log('\n检查用户数据...');
    const [users] = await connection.execute('SELECT id, username, email, password, role FROM users');
    users.forEach(user => {
      console.log(`ID: ${user.id}, 用户名: ${user.username}, 邮箱: ${user.email}, 角色: ${user.role}, 密码长度: ${user.password ? user.password.length : 0}`);
    });
    
    // 检查认证相关的API路由
    console.log('\n检查认证相关的API路由...');
    // 这里我们可以检查一下登录API的实现，看看是否有问题
    
    console.log('认证检查完成！');
    
  } catch (error) {
    console.error('检查失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 执行检查
checkAuth();