import express from 'express';
import { query } from '../config/mysql.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// 发送群组邀请
router.post('/invite', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId, inviteeId } = req.body;
    
    if (!groupId || !inviteeId) {
      return res.status(400).json({
        success: false,
        message: '群组ID和被邀请人ID不能为空'
      });
    }
    
    // 检查群组是否存在
    const groups = await query(
      'SELECT * FROM groups_table WHERE id = ? AND is_active = true',
      [groupId]
    );
    
    if (groups.length === 0) {
      return res.status(404).json({
        success: false,
        message: '群组不存在'
      });
    }
    
    // 检查邀请人是否是群组成员
    const inviterMembership = await query(
      'SELECT role FROM group_members WHERE group_id = ? AND user_id = ? AND is_active = true',
      [groupId, userId]
    );
    
    if (inviterMembership.length === 0) {
      return res.status(403).json({
        success: false,
        message: '您不是该群组成员，无法发送邀请'
      });
    }
    
    // 检查被邀请人是否存在
    const invitee = await query(
      'SELECT id, username, first_name FROM users WHERE id = ?',
      [inviteeId]
    );
    
    if (invitee.length === 0) {
      return res.status(404).json({
        success: false,
        message: '被邀请用户不存在'
      });
    }
    
    // 检查被邀请人是否已经是群组成员
    const existingMember = await query(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, inviteeId]
    );
    
    if (existingMember.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该用户已经是群组成员'
      });
    }
    
    // 检查是否已经发送过邀请
    const existingInvitation = await query(
      'SELECT * FROM group_invitations WHERE group_id = ? AND invitee_id = ? AND status = ?',
      [groupId, inviteeId, 'pending']
    );
    
    if (existingInvitation.length > 0) {
      return res.status(400).json({
        success: false,
        message: '已经向该用户发送过邀请'
      });
    }
    
    // 创建邀请
    const result = await query(
      `INSERT INTO group_invitations (group_id, inviter_id, invitee_id, status, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [groupId, userId, inviteeId, 'pending']
    );
    
    // 创建通知
    await query(
      `INSERT INTO notifications (user_id, sender_id, type, target_type, target_id, content) 
       VALUES (?, ?, 'group_invitation', 'group', ?, ?)`,
      [inviteeId, userId, groupId, `您收到了加入「${groups[0].name}」群组的邀请`]
    );
    
    res.json({
      success: true,
      message: '邀请发送成功'
    });
  } catch (error) {
    console.error('发送群组邀请错误:', error);
    res.status(500).json({
      success: false,
      message: '发送邀请失败'
    });
  }
});

// 接受群组邀请
router.post('/invitations/:id/accept', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // 检查邀请是否存在
    const invitation = await query(
      'SELECT * FROM group_invitations WHERE id = ? AND invitee_id = ? AND status = ?',
      [id, userId, 'pending']
    );
    
    if (invitation.length === 0) {
      return res.status(404).json({
        success: false,
        message: '邀请不存在或已处理'
      });
    }
    
    const { group_id, inviter_id } = invitation[0];
    
    // 开始事务
    await query('START TRANSACTION');
    
    try {
      // 更新邀请状态
      await query(
        'UPDATE group_invitations SET status = ?, updated_at = NOW() WHERE id = ?',
        ['accepted', id]
      );
      
      // 添加到群组
      await query(
        'INSERT INTO group_members (group_id, user_id, role, joined_at) VALUES (?, ?, ?, NOW())',
        [group_id, userId, 'member']
      );
      
      // 更新群组人数
      await query(
        'UPDATE groups_table SET member_count = member_count + 1 WHERE id = ?',
        [group_id]
      );
      
      // 创建通知
      const group = await query('SELECT name FROM groups_table WHERE id = ?', [group_id]);
      if (group.length > 0) {
        await query(
          `INSERT INTO notifications (user_id, sender_id, type, target_type, target_id, content) 
           VALUES (?, ?, 'group_join', 'group', ?, ?)`,
          [inviter_id, userId, group_id, `用户 ${userId} 接受了加入「${group[0].name}」群组的邀请`]
        );
      }
      
      await query('COMMIT');
      
      res.json({
        success: true,
        message: '邀请接受成功'
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('接受群组邀请错误:', error);
    res.status(500).json({
      success: false,
      message: '接受邀请失败'
    });
  }
});

// 拒绝群组邀请
router.post('/invitations/:id/reject', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // 检查邀请是否存在
    const invitation = await query(
      'SELECT * FROM group_invitations WHERE id = ? AND invitee_id = ? AND status = ?',
      [id, userId, 'pending']
    );
    
    if (invitation.length === 0) {
      return res.status(404).json({
        success: false,
        message: '邀请不存在或已处理'
      });
    }
    
    // 更新邀请状态
    await query(
      'UPDATE group_invitations SET status = ?, updated_at = NOW() WHERE id = ?',
      ['rejected', id]
    );
    
    res.json({
      success: true,
      message: '邀请已拒绝'
    });
  } catch (error) {
    console.error('拒绝群组邀请错误:', error);
    res.status(500).json({
      success: false,
      message: '拒绝邀请失败'
    });
  }
});

// 获取用户的邀请列表
router.get('/invitations', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const invitations = await query(
      `SELECT gi.*, g.name as group_name, g.avatar as group_avatar, 
              u.username as inviter_username, u.first_name as inviter_name, u.avatar as inviter_avatar
       FROM group_invitations gi
       JOIN groups_table g ON gi.group_id = g.id
       JOIN users u ON gi.inviter_id = u.id
       WHERE gi.invitee_id = ? AND gi.status = ?
       ORDER BY gi.created_at DESC`,
      [userId, 'pending']
    );
    
    res.json({
      success: true,
      data: {
        invitations: invitations.map(inv => ({
          id: inv.id,
          group_id: inv.group_id,
          group_name: inv.group_name,
          group_avatar: inv.group_avatar,
          inviter_id: inv.inviter_id,
          inviter_name: inv.inviter_name || inv.inviter_username,
          inviter_avatar: inv.inviter_avatar,
          created_at: inv.created_at
        }))
      }
    });
  } catch (error) {
    console.error('获取邀请列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取邀请列表失败'
    });
  }
});

export default router;
