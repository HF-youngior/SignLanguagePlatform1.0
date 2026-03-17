import { query } from '../config/mysql.js';

const seedPosts = async () => {
  try {
    // 检查是否已有帖子
    const existingPosts = await query('SELECT COUNT(*) as count FROM posts');
    if (existingPosts[0].count > 0) {
      console.log(`已有 ${existingPosts[0].count} 个帖子，跳过种子数据插入`);
      return;
    }

    // 示例帖子数据
    const samplePosts = [
      {
        author_id: 2, // testuser
        title: '初学者如何快速入门手语？',
        content: '大家好，我是一名手语初学者，想问问有什么好的学习方法和资源推荐吗？特别是对于零基础的人来说，应该从哪里开始学习呢？',
        category: '学习心得',
        hashtags: JSON.stringify(['初学者', '学习方法', '手语入门'])
      },
      {
        author_id: 3, // moderator
        title: '分享我的手语学习经验',
        content: '我学习手语已经有一年了，想分享一些我的学习心得。首先要建立信心，不要害怕犯错；其次要多练习，每天坚持学习一点；最后要多和聋人朋友交流，这样才能真正掌握手语的精髓。',
        category: '经验分享',
        hashtags: JSON.stringify(['学习经验', '心得分享', '手语学习'])
      },
      {
        author_id: 1, // admin
        title: '平台功能更新公告',
        content: '亲爱的用户们，我们的手语学习平台最近进行了一次重大更新，新增了视频翻译功能和社区互动功能。希望这些新功能能够帮助大家更好地学习和使用手语。',
        category: '其他',
        hashtags: JSON.stringify(['平台更新', '新功能', '公告'])
      },
      {
        author_id: 2, // testuser
        title: '手语和口语的区别',
        content: '我发现手语和口语有很多不同之处，比如手语更加视觉化，而口语更加听觉化。而且手语有自己的语法结构，和口语并不完全对应。大家有什么看法吗？',
        category: '问题求助',
        hashtags: JSON.stringify(['手语语法', '口语对比', '学习疑问'])
      },
      {
        author_id: 3, // moderator
        title: '参加手语社区活动的收获',
        content: '上周参加了一个手语社区活动，认识了很多志同道合的朋友，也学到了很多实用的手语表达。感觉手语不仅是一种交流工具，更是一种文化的载体。',
        category: '经验分享',
        hashtags: JSON.stringify(['社区活动', '收获', '手语文化'])
      }
    ];

    // 插入帖子
    for (const post of samplePosts) {
      await query(
        `INSERT INTO posts (author_id, title, content, category, hashtags, likes_count, views) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [post.author_id, post.title, post.content, post.category, post.hashtags, 0, 0]
      );
    }

    console.log(`成功插入 ${samplePosts.length} 个示例帖子`);
  } catch (error) {
    console.error('插入帖子失败:', error);
  }
};

seedPosts();