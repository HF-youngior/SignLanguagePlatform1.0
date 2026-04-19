/**
 * LEGACY SCRIPT - DO NOT USE FOR PRODUCTION RECOVERY.
 * This script may partially import SQL and leave inconsistent data.
 * Use scripts/db_sync_full_from_old.ps1 for authoritative restore.
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

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

// 导入SQL文件
async function importDatabase() {
  let connection;
  try {
    // 建立数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log('成功连接到新数据库');
    
    // 读取SQL文件
    const sqlFilePath = path.join(__dirname, 'database_export_2026-03-15.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('成功读取SQL文件');
    
    // 分割SQL语句
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`发现 ${statements.length} 条SQL语句`);
    
    // 执行SQL语句
    console.log('开始导入数据...');
    for (let i = 0; i < statements.length; i++) {
      try {
        await connection.execute(statements[i]);
        console.log(`执行语句 ${i + 1}/${statements.length} 成功`);
      } catch (error) {
        console.error(`执行语句 ${i + 1} 失败:`, error.message);
        // 继续执行下一条语句
      }
    }
    
    console.log('数据导入完成！');
    
  } catch (error) {
    console.error('导入失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 执行导入
importDatabase();
