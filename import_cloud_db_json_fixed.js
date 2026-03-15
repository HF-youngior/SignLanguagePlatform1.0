const mysql = require('mysql2/promise');
const fs = require('fs');

// 阿里云RDS数据库配置 - 使用公网地址
const cloudConfig = {
  host: process.env.RDS_HOST || 'rm-2ze90ovu5a037y1ujxo.mysql.rds.aliyuncs.com', // 公网地址
  user: 'test1',
  password: 'asdfgh0625YYH',
  database: 'signlanguage_platform',
  multipleStatements: true,
  connectTimeout: 30000 // 30秒连接超时
};

// 转换日期时间格式
function formatDateTime(value) {
  if (value === null || value === undefined) {
    return null;
  }
  
  if (value instanceof Date) {
    return value.toISOString().slice(0, 19).replace('T', ' ');
  }
  
  if (typeof value === 'string') {
    // 处理ISO格式字符串
    if (value.includes('T')) {
      return value.slice(0, 19).replace('T', ' ');
    }
    // 处理其他日期格式
    if (!isNaN(Date.parse(value))) {
      const date = new Date(value);
      return date.toISOString().slice(0, 19).replace('T', ' ');
    }
  }
  
  return value;
}

async function importDatabase() {
  try {
    // 读取导出的JSON文件
    const exportFile = process.argv[2];
    if (!exportFile) {
      console.error('请指定导出文件路径');
      console.log('使用方法: node import_cloud_db_json_fixed.js database_export_2026-03-15.json');
      process.exit(1);
    }
    
    console.log('正在读取JSON文件...');
    const exportData = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
    
    console.log('正在连接到阿里云RDS...');
    console.log(`RDS地址: ${cloudConfig.host}`);
    console.log(`用户名: ${cloudConfig.user}`);
    console.log(`数据库: ${cloudConfig.database}`);
    
    const connection = await mysql.createConnection(cloudConfig);
    console.log('✅ 连接成功！');
    
    // 禁用外键约束
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('已禁用外键约束');
    
    // 按顺序导入表
    const tables = [
      'users',
      'posts',
      'comments',
      'learning_records',
      'translation_records',
      'likes',
      'admin_logs',
      'groups_table',
      'group_members',
      'group_posts',
      'group_messages',
      'group_invitations',
      'notifications'
    ];
    
    for (const table of tables) {
      if (exportData[table]) {
        console.log(`\n导入表: ${table}`);
        
        try {
          // 删除已存在的表
          await connection.query(`DROP TABLE IF EXISTS ${table}`);
          console.log(`  已删除旧表`);
          
          // 创建新表
          await connection.query(exportData[table].structure);
          console.log(`  表结构创建成功`);
          
          // 插入数据
          const data = exportData[table].data;
          if (data && data.length > 0) {
            console.log(`  准备插入 ${data.length} 条记录`);
            
            let inserted = 0;
            for (const row of data) {
              const columns = Object.keys(row);
              const placeholders = columns.map(() => '?').join(',');
              const values = columns.map(col => {
                const value = row[col];
                
                // 处理日期时间
                if (col.includes('created_at') || col.includes('updated_at') || 
                    col.includes('last_login') || col.includes('joined_at') ||
                    col.includes('completed_at') || col.includes('expires')) {
                  return formatDateTime(value);
                }
                
                // 处理JSON类型
                if (typeof value === 'object' && value !== null) {
                  return JSON.stringify(value);
                }
                
                return value;
              });
              
              try {
                const sql = `INSERT INTO ${table} (${columns.join(',')}) VALUES (${placeholders})`;
                await connection.query(sql, values);
                inserted++;
              } catch (insertError) {
                console.log(`  ⚠️  记录插入失败: ${insertError.message}`);
                console.log(`    表: ${table}`);
                console.log(`    列: ${columns.join(', ')}`);
                console.log(`    值: ${values.map(v => JSON.stringify(v)).join(', ')}`);
                continue;
              }
            }
            
            console.log(`  ✅ 成功插入 ${inserted} 条记录`);
          } else {
            console.log(`  无数据需要插入`);
          }
          
        } catch (error) {
          console.log(`  ❌ 导入失败: ${error.message}`);
          console.log(`  错误堆栈: ${error.stack}`);
          continue;
        }
      } else {
        console.log(`\n表 ${table} 不存在于导出数据中`);
      }
    }
    
    // 重新启用外键约束
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\n已重新启用外键约束');
    
    // 验证导入结果
    const [tablesResult] = await connection.query('SHOW TABLES');
    console.log('\n导入后的数据表:');
    tablesResult.forEach((table, index) => {
      console.log(`  ${index + 1}. ${Object.values(table)[0]}`);
    });
    
    // 检查用户表数据
    try {
      const [users] = await connection.query('SELECT id, username, email FROM users LIMIT 5');
      console.log('\n用户数据样本:');
      users.forEach(user => {
        console.log(`  ${user.id}: ${user.username} <${user.email}>`);
      });
    } catch (error) {
      console.log('\n无法查询用户表:', error.message);
    }
    
    // 检查帖子表数据
    try {
      const [posts] = await connection.query('SELECT COUNT(*) as total FROM posts');
      console.log(`\n帖子总数: ${posts[0].total}`);
    } catch (error) {
      console.log('\n无法查询帖子表:', error.message);
    }
    
    // 检查评论表数据
    try {
      const [comments] = await connection.query('SELECT COUNT(*) as total FROM comments');
      console.log(`评论总数: ${comments[0].total}`);
    } catch (error) {
      console.log('无法查询评论表:', error.message);
    }
    
    // 检查用户表总数
    try {
      const [usersCount] = await connection.query('SELECT COUNT(*) as total FROM users');
      console.log(`用户总数: ${usersCount[0].total}`);
    } catch (error) {
      console.log('无法查询用户表:', error.message);
    }
    
    await connection.end();
    console.log('\n✅ 数据库导入完成！');
    
  } catch (error) {
    console.error('❌ 导入失败:', error.message);
    console.error('错误堆栈:', error.stack);
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