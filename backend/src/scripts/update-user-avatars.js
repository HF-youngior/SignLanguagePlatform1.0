import { query } from '../config/mysql.js';

const updateUserAvatars = async () => {
  try {
    // 获取现有用户
    const users = await query('SELECT id FROM users');
    console.log(`找到 ${users.length} 个用户`);
    
    // 为每个用户分配头像
    for (let i = 0; i < users.length; i++) {
      const userId = users[i].id;
      // 头像编号：1-40循环
      const avatarNumber = (i % 40) + 1;
      const avatarPath = `/public/avatars/${avatarNumber}.jpg`;
      
      // 更新用户头像
      await query(
        'UPDATE users SET avatar = ? WHERE id = ?',
        [avatarPath, userId]
      );
      
      console.log(`用户 ${userId} 的头像已更新为: ${avatarPath}`);
    }
    
    console.log('✅ 所有用户头像更新完成');
    process.exit(0);
  } catch (error) {
    console.error('❌ 更新用户头像失败:', error);
    process.exit(1);
  }
};

updateUserAvatars();