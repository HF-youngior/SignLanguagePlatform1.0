import { query } from '../config/mysql.js';

const createGroupsTables = async () => {
  try {
    // 创建群组表
    await query(`
      CREATE TABLE IF NOT EXISTS groups_table (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL COMMENT '群组名称',
        description TEXT COMMENT '群组描述',
        avatar VARCHAR(500) COMMENT '群组头像',
        type ENUM('public', 'private') DEFAULT 'public' COMMENT '群组类型：公开/私密',
        category VARCHAR(50) COMMENT '群组分类',
        creator_id INT NOT NULL COMMENT '创建者ID',
        member_count INT DEFAULT 0 COMMENT '成员数量',
        post_count INT DEFAULT 0 COMMENT '帖子数量',
        is_active BOOLEAN DEFAULT TRUE COMMENT '是否激活',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_creator_id (creator_id),
        INDEX idx_type (type),
        INDEX idx_category (category),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='群组表'
    `);
    console.log('✅ 群组表创建成功');

    // 创建群组成员表
    await query(`
      CREATE TABLE IF NOT EXISTS group_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL COMMENT '群组ID',
        user_id INT NOT NULL COMMENT '用户ID',
        role ENUM('admin', 'moderator', 'member') DEFAULT 'member' COMMENT '角色：管理员/版主/成员',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE COMMENT '是否活跃',
        FOREIGN KEY (group_id) REFERENCES groups_table(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_member (group_id, user_id),
        INDEX idx_group_id (group_id),
        INDEX idx_user_id (user_id),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='群组成员表'
    `);
    console.log('✅ 群组成员表创建成功');

    // 创建群组帖子表（与社区帖子关联）
    await query(`
      CREATE TABLE IF NOT EXISTS group_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL COMMENT '群组ID',
        post_id INT NOT NULL COMMENT '帖子ID',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES groups_table(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        UNIQUE KEY unique_group_post (group_id, post_id),
        INDEX idx_group_id (group_id),
        INDEX idx_post_id (post_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='群组帖子关联表'
    `);
    console.log('✅ 群组帖子关联表创建成功');

    // 插入一些示例群组数据
    const existingGroups = await query('SELECT COUNT(*) as count FROM groups_table');
    if (existingGroups[0].count === 0) {
      console.log('ℹ️ 插入示例群组数据...');
      
      // 获取第一个用户作为创建者
      const users = await query('SELECT id FROM users LIMIT 1');
      const creatorId = users.length > 0 ? users[0].id : 1;
      
      const sampleGroups = [
        {
          name: '初学者互助组',
          description: '帮助新手快速入门手语学习，分享基础知识和学习经验',
          category: '学习交流',
          type: 'public'
        },
        {
          name: '聋健交流组',
          description: '聋人朋友与听力正常朋友交流的平台，促进相互理解',
          category: '聋健交流',
          type: 'public'
        },
        {
          name: '手语文化分享组',
          description: '分享聋人文化、艺术、生活经验，传承手语文化',
          category: '文化分享',
          type: 'public'
        },
        {
          name: '中级进阶组',
          description: '中级学习者进阶交流，讨论更复杂的手语表达',
          category: '学习交流',
          type: 'public'
        },
        {
          name: '手语差异讨论组',
          description: '讨论教学手语与聋人实际使用手语的差异',
          category: '学术讨论',
          type: 'public'
        },
        {
          name: '聋人生活现状组',
          description: '了解聋人的日常生活、工作、学习现状',
          category: '生活交流',
          type: 'public'
        }
      ];
      
      for (const group of sampleGroups) {
        const result = await query(
          `INSERT INTO groups_table (name, description, category, type, creator_id, member_count) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [group.name, group.description, group.category, group.type, creatorId, Math.floor(Math.random() * 100) + 50]
        );
        
        // 将创建者添加为管理员
        await query(
          `INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'admin')`,
          [result.insertId, creatorId]
        );
      }
      console.log(`✅ 已插入 ${sampleGroups.length} 个示例群组`);
    } else {
      console.log(`ℹ️ 已有 ${existingGroups[0].count} 个群组`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 创建群组表失败:', error);
    process.exit(1);
  }
};

createGroupsTables();
