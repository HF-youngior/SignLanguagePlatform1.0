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
    
    // 禁用外键约束
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('已禁用外键约束');
    
    console.log('开始导入数据到阿里云RDS...');
    
    try {
      // 执行SQL语句
      await connection.query(sqlContent);
      console.log('✅ 数据库导入完成！');
    } catch (sqlError) {
      console.error('❌ SQL执行失败:', sqlError.message);
      
      // 尝试分步骤导入
      console.log('尝试分步骤导入...');
      
      // 按表顺序导入
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
        console.log(`导入表: ${table}`);
        
        // 提取该表的创建和插入语句
        const tableRegex = new RegExp(`-- 表结构: ${table}[\s\S]*?(?=-- 表结构: |$)`, 'g');
        const tableSql = tableRegex.exec(sqlContent);
        
        if (tableSql) {
          try {
            await connection.query(tableSql[0]);
            console.log(`✅ 表 ${table} 导入成功`);
          } catch (tableError) {
            console.error(`❌ 表 ${table} 导入失败:`, tableError.message);
          }
        }
      }
    }
    
    // 重新启用外键约束
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('已重新启用外键约束');
    
    // 验证导入结果
    const [tables] = await connection.query('SHOW TABLES');
    console.log('导入后的数据表:', tables.map(t => Object.values(t)[0]));
    
    // 检查用户表数据
    try {
      const [users] = await connection.query('SELECT id, username, email FROM users LIMIT 5');
      console.log('用户数据样本:', users);
    } catch (error) {
      console.error('无法查询用户表:', error.message);
    }
    
    // 检查帖子表数据
    try {
      const [posts] = await connection.query('SELECT COUNT(*) as total FROM posts');
      console.log(`帖子总数: ${posts[0].total}`);
    } catch (error) {
      console.error('无法查询帖子表:', error.message);
    }
    
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