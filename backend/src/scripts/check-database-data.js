import { query } from '../config/mysql.js';

const checkDatabaseData = async () => {
  try {
    console.log('=== 检查数据库数据 ===');
    
    // 检查用户表
    console.log('\n1. 用户表数据:');
    const users = await query('SELECT id, username, first_name, avatar FROM users');
    console.log(`找到 ${users.length} 个用户:`);
    users.forEach(user => {
      console.log(`  ID: ${user.id}, 用户名: ${user.username}, 昵称: ${user.first_name}, 头像: ${user.avatar}`);
    });
    
    // 检查帖子表
    console.log('\n2. 帖子表数据:');
    const posts = await query('SELECT id, author_id, title, content, created_at FROM posts');
    console.log(`找到 ${posts.length} 个帖子:`);
    posts.forEach(post => {
      console.log(`  ID: ${post.id}, 作者ID: ${post.author_id}, 标题: ${post.title}`);
    });
    
    // 检查评论表
    console.log('\n3. 评论表数据:');
    const comments = await query('SELECT id, post_id, user_id, content FROM comments');
    console.log(`找到 ${comments.length} 个评论:`);
    comments.forEach(comment => {
      console.log(`  ID: ${comment.id}, 帖子ID: ${comment.post_id}, 用户ID: ${comment.user_id}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('检查数据库数据失败:', error);
    process.exit(1);
  }
};

checkDatabaseData();