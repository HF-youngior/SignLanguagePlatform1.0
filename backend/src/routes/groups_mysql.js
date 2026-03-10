import express from 'express';
import { query } from '../config/mysql.js';
import { protect } from '../middleware/auth_mysql.js';

const router = express.Router();

// 获取所有群组列表
router.get('/', async (req, res) => {
  try {
    const { category, type = 'public', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE g.is_active = true';
    const params = [];
    
    if (type) {
      whereClause += ' AND g.type = ?';
      params.push(type);
    }
    
    if (category) {
      whereClause += ' AND g.category = ?';
      params.push(category);
    }
    
    // 获取当前用户ID（如果已登录）
    const token = req.headers.authorization?.split(' ')[1];
    let currentUserId = null;
    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        currentUserId = decoded.id;
      } catch (e) {
        // token无效，忽略
      }
    }
    
    // 构建查询参数
    const queryParams = [...params];
    
    // 如果有查询参数，使用参数化查询
    let groups;
    if (queryParams.length > 0) {
      groups = await query(
        `SELECT g.*, u.first_name as creator_name, u.avatar as creator_avatar,
                (SELECT COUNT(*) FROM group_members WHERE group_id = g.id AND is_active = true) as actual_member_count
         FROM groups_table g
         JOIN users u ON g.creator_id = u.id
         ${whereClause}
         ORDER BY g.member_count DESC, g.created_at DESC
         LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
        queryParams
      );
    } else {
      groups = await query(
        `SELECT g.*, u.first_name as creator_name, u.avatar as creator_avatar,
                (SELECT COUNT(*) FROM group_members WHERE group_id = g.id AND is_active = true) as actual_member_count
         FROM groups_table g
         JOIN users u ON g.creator_id = u.id
         ${whereClause}
         ORDER BY g.member_count DESC, g.created_at DESC
         LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
      );
    }
    
    // 检查当前用户是否已加入每个群组
    const groupsWithMembership = await Promise.all(groups.map(async (group) => {
      let isMember = false;
      let userRole = null;
      
      if (currentUserId) {
        const membership = await query(
          'SELECT role FROM group_members WHERE group_id = ? AND user_id = ? AND is_active = true',
          [group.id, currentUserId]
        );
        if (membership.length > 0) {
          isMember = true;
          userRole = membership[0].role;
        }
      }
      
      return {
        ...group,
        isMember,
        userRole,
        member_count: group.actual_member_count || group.member_count
      };
    }));
    
    // 统计总数
    let countResult;
    if (params.length > 0) {
      countResult = await query(
        `SELECT COUNT(*) as total FROM groups_table g ${whereClause}`,
        params
      );
    } else {
      countResult = await query(
        `SELECT COUNT(*) as total FROM groups_table g ${whereClause}`
      );
    }
    
    res.json({
      success: true,
      data: {
        groups: groupsWithMembership,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取群组列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取群组列表失败'
    });
  }
});

// 获取单个群组详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const groups = await query(
      `SELECT g.*, u.first_name as creator_name, u.avatar as creator_avatar
       FROM groups_table g
       JOIN users u ON g.creator_id = u.id
       WHERE g.id = ? AND g.is_active = true`,
      [id]
    );
    
    if (groups.length === 0) {
      return res.status(404).json({
        success: false,
        message: '群组不存在'
      });
    }
    
    const group = groups[0];
    
    // 获取成员列表
    const members = await query(
      `SELECT gm.*, u.first_name, u.username, u.avatar
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = ? AND gm.is_active = true
       ORDER BY FIELD(gm.role, 'admin', 'moderator', 'member'), gm.joined_at ASC`,
      [id]
    );
    
    // 获取群组帖子
    const posts = await query(
      `SELECT p.*, u.first_name as username, u.avatar,
              (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = false) as comments_count,
              (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count
       FROM group_posts gp
       JOIN posts p ON gp.post_id = p.id
       JOIN users u ON p.author_id = u.id
       WHERE gp.group_id = ? AND p.is_deleted = false
       ORDER BY p.created_at DESC
       LIMIT 10`,
      [id]
    );
    
    res.json({
      success: true,
      data: {
        group: {
          ...group,
          member_count: members.length
        },
        members,
        posts: posts.map(post => ({
          ...post,
          username: post.first_name || post.username
        }))
      }
    });
  } catch (error) {
    console.error('获取群组详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取群组详情失败'
    });
  }
});

// 创建新群组
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, category, type = 'public', avatar } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '群组名称不能为空'
      });
    }
    
    // 创建群组
    const result = await query(
      `INSERT INTO groups_table (name, description, category, type, avatar, creator_id, member_count) 
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [name, description, category, type, avatar, userId]
    );
    
    const groupId = result.insertId;
    
    // 将创建者添加为管理员
    await query(
      `INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'admin')`,
      [groupId, userId]
    );
    
    res.status(201).json({
      success: true,
      message: '群组创建成功',
      data: { id: groupId }
    });
  } catch (error) {
    console.error('创建群组错误:', error);
    res.status(500).json({
      success: false,
      message: '创建群组失败'
    });
  }
});

// 加入群组
router.post('/:id/join', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // 检查群组是否存在
    const groups = await query(
      'SELECT * FROM groups_table WHERE id = ? AND is_active = true',
      [id]
    );
    
    if (groups.length === 0) {
      return res.status(404).json({
        success: false,
        message: '群组不存在'
      });
    }
    
    const group = groups[0];
    
    // 私密群组需要审核，这里简化处理
    if (group.type === 'private') {
      return res.status(403).json({
        success: false,
        message: '私密群组需要邀请才能加入'
      });
    }
    
    // 检查是否已经是成员
    const existingMember = await query(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (existingMember.length > 0) {
      if (existingMember[0].is_active) {
        return res.status(400).json({
          success: false,
          message: '您已经是该群组成员'
        });
      } else {
        // 重新激活
        await query(
          'UPDATE group_members SET is_active = true WHERE id = ?',
          [existingMember[0].id]
        );
      }
    } else {
      // 添加新成员
      await query(
        `INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'member')`,
        [id, userId]
      );
    }
    
    // 更新成员数量
    await query(
      'UPDATE groups_table SET member_count = member_count + 1 WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: '加入群组成功'
    });
  } catch (error) {
    console.error('加入群组错误:', error);
    res.status(500).json({
      success: false,
      message: '加入群组失败'
    });
  }
});

// 退出群组
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // 检查是否是成员
    const member = await query(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND is_active = true',
      [id, userId]
    );
    
    if (member.length === 0) {
      return res.status(400).json({
        success: false,
        message: '您不是该群组成员'
      });
    }
    
    // 如果是创建者，不能退出，只能解散
    const groups = await query(
      'SELECT creator_id FROM groups_table WHERE id = ?',
      [id]
    );
    
    if (groups.length > 0 && groups[0].creator_id === userId) {
      return res.status(400).json({
        success: false,
        message: '创建者不能退出群组，可以选择解散群组'
      });
    }
    
    // 标记为不活跃
    await query(
      'UPDATE group_members SET is_active = false WHERE group_id = ? AND user_id = ?',
      [id, userId]
    );
    
    // 更新成员数量
    await query(
      'UPDATE groups_table SET member_count = GREATEST(member_count - 1, 0) WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: '退出群组成功'
    });
  } catch (error) {
    console.error('退出群组错误:', error);
    res.status(500).json({
      success: false,
      message: '退出群组失败'
    });
  }
});

// 获取用户加入的群组
router.get('/user/my-groups', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const groups = await query(
      `SELECT g.*, gm.role, gm.joined_at,
              u.first_name as creator_name, u.avatar as creator_avatar
       FROM group_members gm
       JOIN groups_table g ON gm.group_id = g.id
       JOIN users u ON g.creator_id = u.id
       WHERE gm.user_id = ? AND gm.is_active = true AND g.is_active = true
       ORDER BY gm.joined_at DESC`,
      [userId]
    );
    
    res.json({
      success: true,
      data: {
        groups: groups.map(group => ({
          id: group.id,
          name: group.name,
          description: group.description,
          avatar: group.avatar,
          category: group.category,
          type: group.type,
          member_count: group.member_count,
          post_count: group.post_count,
          role: group.role,
          joined_at: group.joined_at,
          creator_name: group.creator_name,
          creator_avatar: group.creator_avatar
        }))
      }
    });
  } catch (error) {
    console.error('获取用户群组错误:', error);
    res.status(500).json({
      success: false,
      message: '获取群组列表失败'
    });
  }
});

// 获取热门群组
router.get('/hot/list', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const groups = await query(
      `SELECT g.*, u.first_name as creator_name, u.avatar as creator_avatar
       FROM groups_table g
       JOIN users u ON g.creator_id = u.id
       WHERE g.is_active = true AND g.type = 'public'
       ORDER BY g.member_count DESC, g.post_count DESC
       LIMIT ${parseInt(limit)}`
    );
    
    res.json({
      success: true,
      data: {
        groups
      }
    });
  } catch (error) {
    console.error('获取热门群组错误:', error);
    res.status(500).json({
      success: false,
      message: '获取热门群组失败'
    });
  }
});

// 获取群组分类
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await query(
      `SELECT DISTINCT category, COUNT(*) as group_count
       FROM groups_table
       WHERE is_active = true AND type = 'public'
       GROUP BY category
       ORDER BY group_count DESC`
    );
    
    res.json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('获取群组分类错误:', error);
    res.status(500).json({
      success: false,
      message: '获取分类失败'
    });
  }
});

// 更新群组信息（群主）
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, description, avatar, category, type } = req.body;
    
    // 检查群组是否存在
    const group = await query('SELECT * FROM groups_table WHERE id = ?', [id]);
    if (group.length === 0) {
      return res.status(404).json({
        success: false,
        message: '群组不存在'
      });
    }
    
    // 检查是否是群主
    if (group[0].creator_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '只有群主可以修改群组信息'
      });
    }
    
    // 构建更新字段
    const updateFields = [];
    const params = [];
    
    if (name) {
      updateFields.push('name = ?');
      params.push(name);
    }
    if (description) {
      updateFields.push('description = ?');
      params.push(description);
    }
    if (avatar) {
      updateFields.push('avatar = ?');
      params.push(avatar);
    }
    if (category) {
      updateFields.push('category = ?');
      params.push(category);
    }
    if (type) {
      updateFields.push('type = ?');
      params.push(type);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供要更新的字段'
      });
    }
    
    params.push(id);
    
    await query(
      `UPDATE groups_table SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );
    
    const updatedGroup = await query('SELECT * FROM groups_table WHERE id = ?', [id]);
    
    res.json({
      success: true,
      data: {
        group: updatedGroup[0]
      }
    });
  } catch (error) {
    console.error('更新群组信息错误:', error);
    res.status(500).json({
      success: false,
      message: '更新群组信息失败'
    });
  }
});

// 设置群管理员
router.post('/:id/set-admin', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { memberId } = req.body;
    
    // 检查群组是否存在
    const group = await query('SELECT * FROM groups_table WHERE id = ?', [id]);
    if (group.length === 0) {
      return res.status(404).json({
        success: false,
        message: '群组不存在'
      });
    }
    
    // 检查是否是群主
    if (group[0].creator_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '只有群主可以设置管理员'
      });
    }
    
    // 检查被设置的用户是否是群成员
    const member = await query(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND is_active = true',
      [id, memberId]
    );
    
    if (member.length === 0) {
      return res.status(404).json({
        success: false,
        message: '该用户不是群成员'
      });
    }
    
    // 检查当前管理员数量
    const adminCount = await query(
      'SELECT COUNT(*) as count FROM group_members WHERE group_id = ? AND role = ? AND is_active = true',
      [id, 'admin']
    );
    
    if (adminCount[0].count >= 3) {
      return res.status(400).json({
        success: false,
        message: '最多只能设置3个管理员'
      });
    }
    
    // 更新角色为管理员
    await query(
      'UPDATE group_members SET role = ? WHERE group_id = ? AND user_id = ?',
      ['admin', id, memberId]
    );
    
    res.json({
      success: true,
      message: '管理员设置成功'
    });
  } catch (error) {
    console.error('设置管理员错误:', error);
    res.status(500).json({
      success: false,
      message: '设置管理员失败'
    });
  }
});

// 移除群管理员
router.post('/:id/remove-admin', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { memberId } = req.body;
    
    // 检查群组是否存在
    const group = await query('SELECT * FROM groups_table WHERE id = ?', [id]);
    if (group.length === 0) {
      return res.status(404).json({
        success: false,
        message: '群组不存在'
      });
    }
    
    // 检查是否是群主
    if (group[0].creator_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '只有群主可以移除管理员'
      });
    }
    
    // 检查被移除的用户是否是管理员
    const admin = await query(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND role = ? AND is_active = true',
      [id, memberId, 'admin']
    );
    
    if (admin.length === 0) {
      return res.status(404).json({
        success: false,
        message: '该用户不是管理员'
      });
    }
    
    // 更新角色为普通成员
    await query(
      'UPDATE group_members SET role = ? WHERE group_id = ? AND user_id = ?',
      ['member', id, memberId]
    );
    
    res.json({
      success: true,
      message: '管理员移除成功'
    });
  } catch (error) {
    console.error('移除管理员错误:', error);
    res.status(500).json({
      success: false,
      message: '移除管理员失败'
    });
  }
});

// 踢出群成员
router.delete('/:id/members/:memberId', protect, async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user.id;
    
    // 检查群组是否存在
    const group = await query('SELECT * FROM groups_table WHERE id = ?', [id]);
    if (group.length === 0) {
      return res.status(404).json({
        success: false,
        message: '群组不存在'
      });
    }
    
    // 检查是否是群主或管理员
    const currentMember = await query(
      'SELECT role FROM group_members WHERE group_id = ? AND user_id = ? AND is_active = true',
      [id, userId]
    );
    
    if (currentMember.length === 0) {
      return res.status(403).json({
        success: false,
        message: '您不是群成员'
      });
    }
    
    const isAdmin = currentMember[0].role === 'admin' || group[0].creator_id === userId;
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: '只有群主或管理员可以踢出成员'
      });
    }
    
    // 不能踢出群主
    if (group[0].creator_id === parseInt(memberId)) {
      return res.status(400).json({
        success: false,
        message: '不能踢出群主'
      });
    }
    
    // 开始事务
    await query('START TRANSACTION');
    
    try {
      // 标记成员为非活跃
      await query(
        'UPDATE group_members SET is_active = ? WHERE group_id = ? AND user_id = ?',
        [false, id, memberId]
      );
      
      // 更新群组人数
      await query(
        'UPDATE groups_table SET member_count = member_count - 1 WHERE id = ?',
        [id]
      );
      
      await query('COMMIT');
      
      res.json({
        success: true,
        message: '成员踢出成功'
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('踢出成员错误:', error);
    res.status(500).json({
      success: false,
      message: '踢出成员失败'
    });
  }
});

// 转让群主
router.post('/:id/transfer-ownership', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { newOwnerId } = req.body;
    
    // 检查群组是否存在
    const group = await query('SELECT * FROM groups_table WHERE id = ?', [id]);
    if (group.length === 0) {
      return res.status(404).json({
        success: false,
        message: '群组不存在'
      });
    }
    
    // 检查是否是群主
    if (group[0].creator_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '只有群主可以转让群主'
      });
    }
    
    // 检查新群主是否是群成员
    const newOwner = await query(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND is_active = true',
      [id, newOwnerId]
    );
    
    if (newOwner.length === 0) {
      return res.status(404).json({
        success: false,
        message: '该用户不是群成员'
      });
    }
    
    // 开始事务
    await query('START TRANSACTION');
    
    try {
      // 更新群组的创建者
      await query(
        'UPDATE groups_table SET creator_id = ? WHERE id = ?',
        [newOwnerId, id]
      );
      
      // 将原群主角色改为普通成员
      await query(
        'UPDATE group_members SET role = ? WHERE group_id = ? AND user_id = ?',
        ['member', id, userId]
      );
      
      // 将新群主角色改为管理员
      await query(
        'UPDATE group_members SET role = ? WHERE group_id = ? AND user_id = ?',
        ['admin', id, newOwnerId]
      );
      
      await query('COMMIT');
      
      res.json({
        success: true,
        message: '群主转让成功'
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('转让群主错误:', error);
    res.status(500).json({
      success: false,
      message: '转让群主失败'
    });
  }
});

// 解散群组
router.delete('/:id', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // 检查群组是否存在
    const group = await query(
      'SELECT * FROM groups_table WHERE id = ?',
      [id]
    );
    
    if (group.length === 0) {
      return res.status(404).json({
        success: false,
        message: '群组不存在'
      });
    }
    
    // 检查是否是创建者
    if (group[0].creator_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '只有群主可以解散群组'
      });
    }
    
    // 标记群组为不活跃
    await query(
      'UPDATE groups_table SET is_active = false WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: '群组解散成功'
    });
  } catch (error) {
    console.error('解散群组错误:', error);
    res.status(500).json({
      success: false,
      message: '解散群组失败'
    });
  }
});

// ==================== 群聊消息相关 ====================

// 获取群聊消息
router.get('/:id/messages', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    // 检查是否是群成员
    const member = await query(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND is_active = true',
      [id, req.user.id]
    );
    
    if (member.length === 0) {
      return res.status(403).json({
        success: false,
        message: '您不是该群组成员'
      });
    }
    
    // 获取群聊消息
    const messages = await query(
      `SELECT gm.*, u.first_name as username, u.avatar
       FROM group_messages gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = ?
       ORDER BY gm.created_at DESC
       LIMIT ? OFFSET ?`,
      [id, parseInt(limit), parseInt(offset)]
    );
    
    // 反转消息顺序，使最新的消息在最后
    const reversedMessages = messages.reverse();
    
    res.json({
      success: true,
      data: {
        messages: reversedMessages.map(msg => ({
          id: msg.id,
          userId: msg.user_id,
          username: msg.first_name || msg.username,
          time: msg.created_at.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          content: msg.content,
          avatar: msg.avatar,
          images: msg.images ? JSON.parse(msg.images) : [],
          videos: msg.videos ? JSON.parse(msg.videos) : []
        }))
      }
    });
  } catch (error) {
    console.error('获取群聊消息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取群聊消息失败'
    });
  }
});

// 发送群聊消息
router.post('/:id/messages', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, images = [], videos = [] } = req.body;
    
    if (!content && images.length === 0 && videos.length === 0) {
      return res.status(400).json({
        success: false,
        message: '消息内容不能为空'
      });
    }
    
    // 检查是否是群成员
    const member = await query(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ? AND is_active = true',
      [id, req.user.id]
    );
    
    if (member.length === 0) {
      return res.status(403).json({
        success: false,
        message: '您不是该群组成员'
      });
    }
    
    // 发送消息
    const result = await query(
      'INSERT INTO group_messages (group_id, user_id, content, images, videos) VALUES (?, ?, ?, ?, ?)',
      [id, req.user.id, content, JSON.stringify(images), JSON.stringify(videos)]
    );
    
    // 获取用户信息
    const user = await query('SELECT first_name, avatar FROM users WHERE id = ?', [req.user.id]);
    
    res.json({
      success: true,
      data: {
        message: {
          id: result.insertId,
          userId: req.user.id,
          username: user[0].first_name,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          content: content,
          avatar: user[0].avatar,
          images: images,
          videos: videos
        }
      }
    });
  } catch (error) {
    console.error('发送群聊消息错误:', error);
    res.status(500).json({
      success: false,
      message: '发送群聊消息失败'
    });
  }
});

export default router;
