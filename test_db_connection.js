const mysql = require('mysql2/promise');

// 测试连接配置
const testConfigs = [
  {
    name: '本地数据库',
    config: {
      host: 'localhost',
      user: 'root',
      password: 'asdfgh0625YYH',
      database: 'signlanguage_platform'
    }
  },
  {
    name: '阿里云RDS（内网地址）',
    config: {
      host: 'rm-2ze90ovu5a037y1uj.mysql.rds.aliyuncs.com',
      user: 'test1',
      password: 'asdfgh0625YYH',
      database: 'signlanguage_platform',
      connectTimeout: 10000
    }
  },
  {
    name: '阿里云RDS（公网地址）',
    config: {
      host: 'rm-2ze90ovu5a037y1ujxo.mysql.rds.aliyuncs.com', // 公网地址
      user: 'test1',
      password: 'asdfgh0625YYH',
      database: 'signlanguage_platform',
      connectTimeout: 10000
    }
  }
];

async function testConnection(name, config) {
  try {
    console.log(`\n🔍 测试连接: ${name}`);
    console.log(`   地址: ${config.host}`);
    console.log(`   用户: ${config.user}`);
    
    const startTime = Date.now();
    const connection = await mysql.createConnection(config);
    const endTime = Date.now();
    
    console.log(`✅ 连接成功！耗时: ${endTime - startTime}ms`);
    
    // 测试查询
    const [result] = await connection.query('SELECT VERSION() as version, NOW() as current_time');
    console.log(`   MySQL版本: ${result[0].version}`);
    console.log(`   服务器时间: ${result[0].current_time}`);
    
    // 检查表
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`   数据表数量: ${tables.length}`);
    
    await connection.end();
    return true;
    
  } catch (error) {
    console.log(`❌ 连接失败: ${error.message}`);
    console.log(`   错误代码: ${error.code}`);
    
    if (error.code === 'ETIMEDOUT') {
      console.log(`   💡 提示: 连接超时，可能是网络问题或使用了错误的地址`);
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`   💡 提示: 连接被拒绝，可能是端口或服务问题`);
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log(`   💡 提示: 访问被拒绝，检查用户名密码`);
    }
    
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('数据库连接测试工具');
  console.log('='.repeat(60));
  
  for (const test of testConfigs) {
    await testConnection(test.name, test.config);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('测试完成！');
  console.log('='.repeat(60));
  
  console.log('\n📋 下一步操作建议：');
  console.log('1. 如果本地数据库连接成功，说明本地配置正常');
  console.log('2. 如果阿里云RDS连接失败，请检查：');
  console.log('   - 是否使用了正确的公网地址');
  console.log('   - 白名单是否正确配置');
  console.log('   - 网络连接是否正常');
  console.log('3. 获取公网地址后，更新配置文件中的host地址');
}

main();