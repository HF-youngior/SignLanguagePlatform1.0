import { query } from './src/config/mysql.js';

async function testApiPosts() {
  try {
    console.log('测试API返回的帖子数据...');
    console.log('========================================');
    
    // 模拟API查询帖子
    const posts = await query(
      `SELECT p.*, u.username, u.first_name, u.avatar,
              (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = false) as comments_count,
              (SELECT COUNT(*) FROM likes WHERE target_type = 'post' AND target_id = p.id) as likes_count
       FROM posts p
       JOIN users u ON p.author_id = u.id
       WHERE p.is_deleted = false
       ORDER BY p.created_at DESC
       LIMIT 5`
    );
    
    console.log(`返回了 ${posts.length} 个帖子\n`);
    
    posts.forEach((post, index) => {
      console.log(`帖子 ${index + 1}:`);
      console.log(`  ID: ${post.id}`);
      console.log(`  作者: ${post.username} (${post.first_name || ''})`);
      console.log(`  头像: ${post.avatar || '(空)'}`);
      console.log(`  内容: ${post.content.substring(0, 50)}...`);
      console.log('');
    });
    
    console.log('========================================');
    console.log('测试完成!');
    
  } catch (error) {
    console.error('测试API时出错:', error);
  }
}

// 运行测试
testApiPosts();
