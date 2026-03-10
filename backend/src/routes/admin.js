import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getAllPosts,
  deletePost,
  getAllComments,
  deleteComment,
  getSystemStats,
  getAdminLogs,
  getAllGroups,
  getGroupById,
  deleteGroup,
  getPostById,
  getGroupMessages,
  removeGroupMember,
  deleteGroupMessage,
  createUser
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth_mysql.js';

const router = express.Router();

// 所有路由都需要管理员权限
router.use(protect, adminOnly);

// 用户管理
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.post('/users', createUser);

// 帖子管理
router.get('/posts', getAllPosts);
router.get('/posts/:id', getPostById);
router.delete('/posts/:id', deletePost);

// 评论管理
router.get('/comments', getAllComments);
router.delete('/comments/:id', deleteComment);

// 系统统计
router.get('/stats', getSystemStats);

// 操作日志
router.get('/logs', getAdminLogs);

// 社群管理
router.get('/groups', getAllGroups);
router.get('/groups/:id', getGroupById);
router.get('/groups/:id/messages', getGroupMessages);
router.delete('/groups/:id', deleteGroup);
router.delete('/groups/:groupId/members/:userId', removeGroupMember);
router.delete('/group-messages/:id', deleteGroupMessage);

export default router;