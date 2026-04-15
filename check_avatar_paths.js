const mysql = require('mysql2');

// 数据库连接配置
const dbConfig = {
  host: 'rm-2ze90ovu5a037y1ujxo.mysql.rds.aliyuncs.com',
  user: 'test1',
  password: 'asdfgh0625YYH',
  database: 'signlanguage_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 创建连接池
const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

async function checkAvatarPaths() {
  try {
    console.log('检查数据库中的头像路径...');
    
    // 查询用户表中的头像路径
    const [users] = await promisePool.query(
      'SELECT id, username, avatar FROM users LIMIT 20'
    );
    
    console.log('\n用户头像路径:');
    console.log('----------------------------------------');
    users.forEach(user => {
      console.log(`用户 ${user.id} (${user.username}): ${user.avatar}`);
    });
    
    // 查询帖子表中的头像路径
    const [posts] = await promisePool.query(
      'SELECT p.id, u.username, u.avatar FROM posts p JOIN users u ON p.author_id = u.id LIMIT 10'
    );
    
    console.log('\n帖子作者头像路径:');
    console.log('----------------------------------------');
    posts.forEach(post => {
      console.log(`帖子 ${post.id} 作者 (${post.username}): ${post.avatar}`);
    });
    
    console.log('\n检查完成!');
    
  } catch (error) {
    console.error('检查头像路径时出错:', error);
  } finally {
    // 关闭连接池
    await promisePool.end();
  }
}

// 运行检查
checkAvatarPaths();
