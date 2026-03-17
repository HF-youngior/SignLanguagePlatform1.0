import { query } from '../config/mysql.js';

const checkPosts = async () => {
  try {
    const posts = await query('SELECT * FROM posts');
    console.log('Posts:', posts);
    console.log('Posts count:', posts.length);
  } catch (error) {
    console.error('Error checking posts:', error);
  }
};

checkPosts();