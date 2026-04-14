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

// 检查数据库连接和表结构
async function checkDatabase() {
  let connection;
  try {
    // 建立数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log('成功连接到新数据库');
    
    // 检查数据库中的表
    const [tables] = await connection.execute(
      "SHOW TABLES"
    );
    
    console.log('数据库中的表:');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${Object.values(table)[0]}`);
    });
    
    // 检查用户表中的数据
    try {
      const [users] = await connection.execute(
        "SELECT COUNT(*) as count FROM users"
      );
      console.log(`\n用户表中的记录数: ${users[0].count}`);
    } catch (error) {
      console.log('用户表不存在或查询失败:', error.message);
    }
    
  } catch (error) {
    console.error('连接失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n数据库连接已关闭');
    }
  }
}

// 执行检查
checkDatabase();