const mysql = require('mysql2/promise');
const fs = require('fs');

// 阿里云RDS数据库配置 - 使用公网地址
const cloudConfig = {
  host: process.env.RDS_HOST || 'rm-2ze90ovu5a037y1ujxo.mysql.rds.aliyuncs.com', // 公网地址
  user: 'test1',
  password: 'asdfgh0625YYH',
  database: 'signlanguage_platform',
  multipleStatements: true,
  connectTimeout: 30000, // 30秒连接超时
  acquireTimeout: 30000  // 30秒获取连接超时
};

async function importDatabase() {
  try {
    // 读取导出的SQL文件
    const exportFile = process.argv[2];
    if (!exportFile) {
      console.error('请指定导出文件路径');
      console.log('使用方法: node import_cloud_db_public.js database_export_2026-03-15.sql');
      process.exit(1);
    }
    
    console.log('正在读取SQL文件...');
    const sqlContent = fs.readFileSync(exportFile, 'utf8');
    
    console.log('正在连接到阿里云RDS...');
    console.log(`RDS地址: ${cloudConfig.host}`);
    console.log(`用户名: ${cloudConfig.user}`);
    console.log(`数据库: ${cloudConfig.database}`);
    
    const connection = await mysql.createConnection(cloudConfig);
    console.log('✅ 连接成功！');
    
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
    
    // 检查帖子表数据
    const [posts] = await connection.query('SELECT COUNT(*) as total FROM posts');
    console.log(`帖子总数: ${posts[0].total}`);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 导入失败:', error.message);
    if (error.code === 'ETIMEDOUT') {
      console.error('连接超时！请检查：');
      console.error('1. 是否使用了正确的公网地址？');
      console.error('2. 白名单是否正确配置？');
      console.error('3. 网络连接是否正常？');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('连接被拒绝！请检查：');
      console.error('1. RDS实例是否正常运行？');
      console.error('2. 端口是否正确（默认3306）？');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('访问被拒绝！请检查：');
      console.error('1. 用户名和密码是否正确？');
      console.error('2. 用户是否有该数据库的访问权限？');
    }
    process.exit(1);
  }
}

importDatabase();