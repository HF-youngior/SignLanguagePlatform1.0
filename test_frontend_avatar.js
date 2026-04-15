// 模拟前端的 getAvatarUrl 函数
const DEFAULT_AVATAR = '/images/default-avatar.png';

function getAvatarUrl(avatar) {
  console.log('getAvatarUrl called with:', avatar);
  
  if (!avatar) {
    console.log('Avatar is empty, returning default');
    return DEFAULT_AVATAR
  }
  
  // 如果是完整的URL，直接返回
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    console.log('Avatar is full URL, returning directly');
    return avatar
  }
  
  // 如果是相对路径，添加后端服务器地址
  const backendUrl = 'http://localhost:8000';
  const fullUrl = `${backendUrl}${avatar}`;
  console.log('Generated avatar URL:', fullUrl);
  return fullUrl
}

// 模拟从API返回的帖子数据
const mockPosts = [
  {
    id: 1,
    author_id: 10,
    title: '新手学习手语的感受',
    content: '刚学习手语，感觉很有趣，但是手指有点不听使唤，需要多加练习。#初学者 #学习方法 #手语入门',
    category: '其他',
    privacy: 'public',
    hashtags: [],
    images: [],
    videos: [],
    likes_count: 3,
    views: 47,
    is_deleted: 0,
    created_at: '2026-03-05T06:02:24.000Z',
    updated_at: '2026-03-07T06:02:24.000Z',
    username: '张',
    first_name: '张',
    avatar: '/public/avatars/4.png',
    comments_count: 2,
    commentList: [
      {
        id: 2,
        post_id: 1,
        user_id: 11,
        content: '加油，坚持练习一定会有进步的！',
        parent_id: null,
        likes_count: 0,
        is_deleted: 0,
        created_at: '2026-03-06T06:02:24.000Z',
        updated_at: '2026-03-06T06:02:24.000Z',
        user_username: 'lisi',
        user_first_name: '李',
        user_avatar: '/public/avatars/5.png',
        username: '李',
        avatar: '/public/avatars/5.png',
        time: '2026-03-06T06:02:24.000Z',
        replies: []
      }
    ],
    isLiked: false
  },
  {
    id: 7,
    author_id: 10,
    title: '手语学习的难点',
    content: '我觉得手语学习最大的难点是语法结构和口语完全不同，需要重新建立语言思维。大家有什么好的学习方法吗？#学习困难 #求助',
    category: '其他',
    privacy: 'public',
    hashtags: [],
    images: [],
    videos: [],
    likes_count: 0,
    views: 47,
    is_deleted: 0,
    created_at: '2026-03-04T06:02:24.000Z',
    updated_at: '2026-03-07T06:02:24.000Z',
    username: '张',
    first_name: '张',
    avatar: '/public/avatars/4.png',
    comments_count: 0,
    commentList: [],
    isLiked: false
  }
];

console.log('模拟前端处理帖子数据:');
console.log('----------------------------------------');

// 模拟前端处理帖子数据
mockPosts.forEach((post, index) => {
  console.log(`帖子 ${index + 1}:`);
  console.log(`  用户名: ${post.username}`);
  console.log(`  头像路径: ${post.avatar}`);
  
  // 生成头像URL
  const avatarUrl = getAvatarUrl(post.avatar);
  console.log(`  生成的头像URL: ${avatarUrl}`);
  
  // 测试评论中的头像
  if (post.commentList && post.commentList.length > 0) {
    post.commentList.forEach((comment, commentIndex) => {
      console.log(`  评论 ${commentIndex + 1}:`);
      console.log(`    用户名: ${comment.username}`);
      console.log(`    头像路径: ${comment.avatar}`);
      
      // 生成评论者的头像URL
      const commentAvatarUrl = getAvatarUrl(comment.avatar);
      console.log(`    生成的头像URL: ${commentAvatarUrl}`);
    });
  }
  
  console.log('');
});
