const mysql = require('mysql2/promise');
const fs = require('fs');

// 阿里云RDS数据库配置
const cloudConfig = {
  host: 'rm-2ze90ovu5a037y1uj.mysql.rds.aliyuncs.com',
  user: 'test1',
  password: 'asdfgh0625YYH',
  database: 'signlanguage_platform',
  multipleStatements: true
};

async function importDatabase() {
  try {
    // 读取导出的SQL文件
    const exportFile = process.argv[2];
    if (!exportFile) {
      console.error('请指定导出文件路径');
      process.exit(1);
    }
    
    const sqlContent = fs.readFileSync(exportFile, 'utf8');
    const connection = await mysql.createConnection(cloudConfig);
    
    console.log('开始导入数据到阿里云RDS...');
    
    // 执行SQL语句
    await connection.query(sqlContent);
    
    console.log('✅ 数据库导入完成！');
    
    // 验证导入结果
    const [tables] = await connection.query('SHOW TABLES');
    console.log('导入后的数据表:', tables.map(t => Object.values(t)[0]));
    
    // 检查用户表数据
    const [users] = await connection.query('SELECT id, username, email FROM users LIMIT 5');
    console.log('用户数据样本:', users);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 导入失败:', error);
    process.exit(1);
  }
}

importDatabase();