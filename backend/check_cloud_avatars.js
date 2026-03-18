import { query } from './src/config/mysql.js';

async function checkCloudAvatars() {
  try {
    console.log('检查云端数据库中的用户头像路径...');
    console.log('========================================');
    
    // 查询所有用户的头像路径
    const users = await query(
      'SELECT id, username, first_name, avatar FROM users ORDER BY id'
    );
    
    console.log(`总共找到 ${users.length} 个用户\n`);
    
    // 统计头像情况
    let emptyAvatarCount = 0;
    let defaultAvatarCount = 0;
    let customAvatarCount = 0;
    let httpAvatarCount = 0;
    
    users.forEach(user => {
      const avatar = user.avatar;
      const username = user.username;
      const firstName = user.first_name || '';
      
      console.log(`用户 ${user.id}: ${username} (${firstName})`);
      console.log(`  头像: ${avatar || '(空)'}`);
      
      if (!avatar) {
        emptyAvatarCount++;
      } else if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
        httpAvatarCount++;
      } else if (avatar.includes('default') || avatar.includes('动漫')) {
        defaultAvatarCount++;
      } else {
        customAvatarCount++;
      }
      console.log('');
    });
    
    console.log('========================================');
    console.log('头像统计:');
    console.log(`  空头像: ${emptyAvatarCount}`);
    console.log(`  HTTP/HTTPS URL: ${httpAvatarCount}`);
    console.log(`  默认头像: ${defaultAvatarCount}`);
    console.log(`  自定义头像: ${customAvatarCount}`);
    console.log('========================================');
    
    // 查询帖子中的头像信息
    console.log('\n检查帖子中的用户头像...');
    console.log('========================================');
    
    const posts = await query(
      `SELECT p.id, p.author_id, u.username, u.first_name, u.avatar 
       FROM posts p 
       JOIN users u ON p.author_id = u.id 
       WHERE p.is_deleted = false 
       ORDER BY p.id DESC LIMIT 10`
    );
    
    posts.forEach(post => {
      console.log(`帖子 ${post.id}: 作者 ${post.username} (${post.first_name || ''})`);
      console.log(`  头像: ${post.avatar || '(空)'}`);
      console.log('');
    });
    
    console.log('========================================');
    console.log('检查完成!');
    
  } catch (error) {
    console.error('检查云端头像时出错:', error);
  }
}

// 运行检查
checkCloudAvatars();
