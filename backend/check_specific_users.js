import { query } from './src/config/mysql.js';

async function checkSpecificUsers() {
  try {
    console.log('检查特定用户的头像信息...');
    console.log('========================================');
    
    const usernames = ['蓝豆睿', '金珞辰', '路西法'];
    
    for (const username of usernames) {
      console.log(`查询用户: ${username}`);
      
      // 查询用户信息
      const users = await query(
        'SELECT id, username, first_name, avatar FROM users WHERE username = ? OR first_name = ?',
        [username, username]
      );
      
      if (users.length === 0) {
        console.log(`  未找到用户: ${username}`);
        console.log('');
        continue;
      }
      
      for (const user of users) {
        console.log(`  用户ID: ${user.id}`);
        console.log(`  用户名: ${user.username}`);
        console.log(`  昵称: ${user.first_name || '(无)'}`);
        console.log(`  头像: ${user.avatar || '(空)'}`);
        
        // 查询该用户的帖子
        const posts = await query(
          'SELECT id, title, content, created_at FROM posts WHERE author_id = ? AND is_deleted = false LIMIT 3',
          [user.id]
        );
        
        if (posts.length > 0) {
          console.log(`  该用户的帖子 (${posts.length}个):`);
          for (const post of posts) {
            console.log(`    - 帖子 ${post.id}: ${post.title} (${post.content.substring(0, 30)}...)`);
          }
        } else {
          console.log(`  该用户没有帖子`);
        }
        
        console.log('');
      }
    }
    
    console.log('========================================');
    console.log('检查完成!');
    
  } catch (error) {
    console.error('检查特定用户时出错:', error);
  }
}

// 运行检查
checkSpecificUsers();
