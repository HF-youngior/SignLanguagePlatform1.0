import { query } from '../config/mysql.js';

const checkPostsHashtags = async () => {
  try {
    const posts = await query('SELECT id, title, hashtags FROM posts');
    console.log('Posts with hashtags:');
    posts.forEach(post => {
      console.log(`ID: ${post.id}, Title: ${post.title}, Hashtags: ${post.hashtags}`);
      console.log(`Hashtags type: ${typeof post.hashtags}`);
      if (post.hashtags) {
        try {
          const parsed = JSON.parse(post.hashtags);
          console.log(`Parsed hashtags: ${JSON.stringify(parsed)}`);
        } catch (e) {
          console.log(`Parse error: ${e.message}`);
        }
      }
      console.log('---');
    });
  } catch (error) {
    console.error('Error checking posts hashtags:', error);
  }
};

checkPostsHashtags();