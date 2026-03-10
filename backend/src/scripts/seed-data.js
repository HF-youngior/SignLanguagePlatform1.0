import { query } from '../config/mysql.js';
import bcrypt from 'bcryptjs';

// 生成测试数据
const seedData = async () => {
  try {
    console.log('🌱 开始生成测试数据...');

    // 1. 创建测试用户
    console.log('👤 创建测试用户...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('user123', salt);

    // 检查用户是否已存在
    const existingUsers = await query('SELECT id FROM users WHERE username = ?', ['testuser']);
    let testUserId;

    if (existingUsers.length === 0) {
      const userResult = await query(
        `INSERT INTO users (username, email, password, first_name, last_name, avatar, role, is_active, is_email_verified)
         VALUES (?, ?, ?, ?, ?, ?, 'user', true, true)`,
        ['testuser', 'test@example.com', hashedPassword, '测试', '用户', 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser']
      );
      testUserId = userResult.insertId;
      console.log('✅ 测试用户创建成功，ID:', testUserId);
    } else {
      testUserId = existingUsers[0].id;
      console.log('✅ 测试用户已存在，ID:', testUserId);
    }

    // 2. 创建更多测试用户
    const testUsers = [
      { username: 'zhangsan', email: 'zhangsan@example.com', firstName: '张', lastName: '三' },
      { username: 'lisi', email: 'lisi@example.com', firstName: '李', lastName: '四' },
      { username: 'wangwu', email: 'wangwu@example.com', firstName: '王', lastName: '五' },
      { username: 'xiaoming', email: 'xiaoming@example.com', firstName: '小', lastName: '明' },
      { username: 'xiaohong', email: 'xiaohong@example.com', firstName: '小', lastName: '红' }
    ];

    const userIds = [testUserId];
    for (const user of testUsers) {
      const existing = await query('SELECT id FROM users WHERE username = ?', [user.username]);
      if (existing.length === 0) {
        const result = await query(
          `INSERT INTO users (username, email, password, first_name, last_name, avatar, role, is_active, is_email_verified)
           VALUES (?, ?, ?, ?, ?, ?, 'user', true, true)`,
          [user.username, user.email, hashedPassword, user.firstName, user.lastName, `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`]
        );
        userIds.push(result.insertId);
        console.log(`✅ 用户 ${user.username} 创建成功`);
      } else {
        userIds.push(existing[0].id);
        console.log(`✅ 用户 ${user.username} 已存在`);
      }
    }

    // 3. 创建测试帖子
    console.log('📝 创建测试帖子...');
    const testPosts = [
      {
        title: '今天学会了"你好"的手语表达',
        content: '今天学会了"你好"的手语表达，感觉很有成就感！大家有什么学习技巧可以分享吗？#手语学习 #初学者',
        authorIndex: 0
      },
      {
        title: '分享一个学习心得',
        content: '分享一个学习心得：每天坚持练习15分钟，比一次性练习2小时效果更好。循序渐进很重要！#学习心得 #坚持',
        authorIndex: 1
      },
      {
        title: '本周的挑战',
        content: '本周的挑战：学会用手语表达"今天天气很好"。大家可以尝试一下，有问题随时提问！#挑战 #手语练习',
        authorIndex: 2
      },
      {
        title: '手语和口语的区别',
        content: '手语和口语最大的区别在于，手语是视觉语言，需要用到面部表情、身体姿态和手势。学习手语不仅是学习手势，还要学习 Deaf 文化。#聋人文化 #手语差异',
        authorIndex: 3
      },
      {
        title: '推荐一个学习资源',
        content: '推荐一个学习资源：YouTube上的"Sign Language 101"频道，讲解非常清晰，适合初学者！#学习资源 #推荐',
        authorIndex: 4
      },
      {
        title: '第一次和聋人朋友交流',
        content: '今天第一次用学到的手语和聋人朋友交流，虽然很简单，但对方很耐心地纠正我的手势，这种体验太棒了！#聋健交流 #实践',
        authorIndex: 0
      },
      {
        title: '手语学习的难点',
        content: '我觉得手语学习最大的难点是语法结构和口语完全不同，需要重新建立语言思维。大家有什么好的学习方法吗？#学习困难 #求助',
        authorIndex: 1
      },
      {
        title: '庆祝学习一个月',
        content: '庆祝自己坚持学习手语一个月！从完全不懂到现在能进行简单对话，感谢这个平台提供的AI翻译功能！#里程碑 #感谢',
        authorIndex: 2
      }
    ];

    for (const post of testPosts) {
      // 检查是否已存在相同内容的帖子
      const existing = await query('SELECT id FROM posts WHERE content = ?', [post.content]);
      if (existing.length === 0) {
        await query(
          `INSERT INTO posts (author_id, title, content, category, views, is_deleted, created_at)
           VALUES (?, ?, ?, '其他', ?, false, DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 7) DAY))`,
          [userIds[post.authorIndex], post.title, post.content, Math.floor(Math.random() * 100) + 10]
        );
        console.log(`✅ 帖子"${post.title}"创建成功`);
      } else {
        console.log(`✅ 帖子"${post.title}"已存在`);
      }
    }

    // 4. 创建测试评论
    console.log('💬 创建测试评论...');
    const posts = await query('SELECT id FROM posts LIMIT 5');
    const comments = [
      '太棒了！我也在学习这个',
      '感谢分享，对我很有帮助',
      '加油！坚持就是胜利',
      '请问有什么学习技巧吗？',
      '我也是初学者，一起进步！'
    ];

    for (let i = 0; i < posts.length; i++) {
      for (let j = 0; j < 3; j++) {
        const randomUserIndex = Math.floor(Math.random() * userIds.length);
        const randomComment = comments[Math.floor(Math.random() * comments.length)];

        // 检查是否已存在相同评论
        const existing = await query(
          'SELECT id FROM comments WHERE post_id = ? AND user_id = ? AND content = ?',
          [posts[i].id, userIds[randomUserIndex], randomComment]
        );

        if (existing.length === 0) {
          await query(
            `INSERT INTO comments (post_id, user_id, content, is_deleted, created_at)
             VALUES (?, ?, ?, false, DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 3) DAY))`,
            [posts[i].id, userIds[randomUserIndex], randomComment]
          );
        }
      }
      console.log(`✅ 帖子 ${posts[i].id} 的评论创建完成`);
    }

    console.log('✨ 测试数据生成完成！');
    console.log('');
    console.log('📋 测试账号信息：');
    console.log('   用户名: testuser');
    console.log('   密码: user123');
    console.log('');

  } catch (error) {
    console.error('❌ 生成测试数据失败:', error);
  } finally {
    process.exit(0);
  }
};

seedData();
