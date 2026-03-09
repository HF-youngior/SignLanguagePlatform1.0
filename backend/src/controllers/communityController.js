import Post from '../models/Post.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    获取帖子列表
// @route   GET /api/community/posts
// @access  Private
export const getPosts = asyncHandler(async (req, res) => {
  const { category, hashtag, page = 1, limit = 20 } = req.query;

  const query = {};
  if (category) query.category = category;
  if (hashtag) query.hashtags = hashtag;

  const posts = await Post.find(query)
    .populate('author', 'name username avatar')
    .populate('likes', 'name username')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await Post.countDocuments(query);

  res.status(200).json({
    success: true,
    count: posts.length,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    data: posts
  });
});

// @desc    创建帖子
// @route   POST /api/community/posts
// @access  Private
export const createPost = asyncHandler(async (req, res) => {
  const { title, content, category, hashtags, images, videos } = req.body;

  const post = await Post.create({
    author: req.user.id,
    title,
    content,
    category: category || '其他',
    hashtags: hashtags || [],
    images: images || [],
    videos: videos || []
  });

  await post.populate('author', 'name username avatar');

  res.status(201).json({
    success: true,
    data: post
  });
});

// @desc    获取单个帖子
// @route   GET /api/community/posts/:id
// @access  Private
export const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'name username avatar')
    .populate('likes', 'name username')
    .populate('comments.user', 'name username avatar')
    .populate('comments.likes', 'name username')
    .populate('comments.replies.user', 'name username avatar');

  if (!post) {
    return res.status(404).json({
      success: false,
      error: '帖子不存在'
    });
  }

  // 增加浏览量
  post.views += 1;
  await post.save();

  res.status(200).json({
    success: true,
    data: post
  });
});

// @desc    更新帖子
// @route   PUT /api/community/posts/:id
// @access  Private
export const updatePost = asyncHandler(async (req, res) => {
  let post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      error: '帖子不存在'
    });
  }

  // 确保只有作者可以更新
  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: '无权修改此帖子'
    });
  }

  post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('author', 'name username avatar');

  res.status(200).json({
    success: true,
    data: post
  });
});

// @desc    删除帖子
// @route   DELETE /api/community/posts/:id
// @access  Private
export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      error: '帖子不存在'
    });
  }

  // 确保只有作者或管理员可以删除
  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: '无权删除此帖子'
    });
  }

  await post.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    点赞帖子
// @route   POST /api/community/posts/:id/like
// @access  Private
export const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      error: '帖子不存在'
    });
  }

  const userId = req.user.id.toString();
  const likeIndex = post.likes.indexOf(userId);

  if (likeIndex > -1) {
    // 取消点赞
    post.likes.splice(likeIndex, 1);
  } else {
    // 点赞
    post.likes.push(userId);
  }

  await post.save();

  res.status(200).json({
    success: true,
    data: post
  });
});

// @desc    评论帖子
// @route   POST /api/community/posts/:id/comments
// @access  Private
export const commentOnPost = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      error: '帖子不存在'
    });
  }

  post.comments.push({
    user: req.user.id,
    content
  });

  await post.save();
  await post.populate('comments.user', 'name username avatar');

  res.status(200).json({
    success: true,
    data: post.comments[post.comments.length - 1]
  });
});

// @desc    获取帖子评论
// @route   GET /api/community/posts/:id/comments
// @access  Private
export const getComments = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('comments.user', 'name username avatar')
    .populate('comments.likes', 'name username')
    .populate('comments.replies.user', 'name username avatar');

  if (!post) {
    return res.status(404).json({
      success: false,
      error: '帖子不存在'
    });
  }

  res.status(200).json({
    success: true,
    data: post.comments
  });
});

// @desc    删除评论
// @route   DELETE /api/community/comments/:id
// @access  Private
export const deleteComment = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ 'comments._id': req.params.id });

  if (!post) {
    return res.status(404).json({
      success: false,
      error: '评论不存在'
    });
  }

  const comment = post.comments.id(req.params.id);

  // 确保只有评论者或管理员可以删除
  if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: '无权删除此评论'
    });
  }

  comment.remove();
  await post.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    获取用户帖子
// @route   GET /api/community/users/:userId/posts
// @access  Private
export const getUserPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ author: req.params.userId })
    .populate('author', 'name username avatar')
    .sort('-createdAt')
    .lean();

  res.status(200).json({
    success: true,
    count: posts.length,
    data: posts
  });
});

// @desc    搜索帖子
// @route   GET /api/community/search
// @access  Private
export const searchPosts = asyncHandler(async (req, res) => {
  const { q } = req.query;

  const posts = await Post.find({
    $or: [
      { title: { $regex: q, $options: 'i' } },
      { content: { $regex: q, $options: 'i' } },
      { hashtags: { $in: [new RegExp(q, 'i')] } }
    ]
  })
    .populate('author', 'name username avatar')
    .sort('-createdAt')
    .limit(50)
    .lean();

  res.status(200).json({
    success: true,
    count: posts.length,
    data: posts
  });
});






















