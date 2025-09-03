import express from 'express';
import { body } from 'express-validator';
import { 
  getPosts, 
  createPost, 
  getPostById, 
  updatePost, 
  deletePost,
  likePost,
  commentOnPost,
  getComments,
  deleteComment,
  getUserPosts,
  searchPosts
} from '../controllers/communityController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// 所有路由都需要身份验证
router.use(protect);

// 获取帖子列表
router.get('/posts', getPosts);

// 搜索帖子
router.get('/search', searchPosts);

// 创建帖子
router.post('/posts', [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('标题长度必须在1-200个字符之间'),
  body('content')
    .isLength({ min: 1, max: 5000 })
    .withMessage('内容长度必须在1-5000个字符之间'),
  body('category')
    .isIn(['学习心得', '问题求助', '经验分享', '其他'])
    .withMessage('请选择有效的分类')
], createPost);

// 获取特定帖子
router.get('/posts/:id', getPostById);

// 更新帖子
router.put('/posts/:id', [
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('标题长度必须在1-200个字符之间'),
  body('content')
    .optional()
    .isLength({ min: 1, max: 5000 })
    .withMessage('内容长度必须在1-5000个字符之间')
], updatePost);

// 删除帖子
router.delete('/posts/:id', deletePost);

// 点赞帖子
router.post('/posts/:id/like', likePost);

// 评论帖子
router.post('/posts/:id/comments', [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('评论长度必须在1-1000个字符之间')
], commentOnPost);

// 获取帖子评论
router.get('/posts/:id/comments', getComments);

// 删除评论
router.delete('/comments/:id', deleteComment);

// 获取用户帖子
router.get('/users/:userId/posts', getUserPosts);

export default router;
