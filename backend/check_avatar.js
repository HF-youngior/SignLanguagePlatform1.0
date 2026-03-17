import { query } from './src/config/mysql.js';

async function checkAvatarPaths() {
  try {
    console.log('检查数据库中的头像路径...');
    
    // 查询用户表中的头像路径
    const users = await query(
      'SELECT id, username, avatar FROM users LIMIT 20'
    );
    
    console.log('\n用户头像路径:');
    console.log('----------------------------------------');
    users.forEach(user => {
      console.log(`用户 ${user.id} (${user.username}): ${user.avatar}`);
    });
    
    // 查询帖子表中的头像路径
    const posts = await query(
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
  }
}

// 运行检查
checkAvatarPaths();
