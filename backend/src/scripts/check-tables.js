import { query } from '../config/mysql.js';

const checkTables = async () => {
  try {
    // 检查comments表
    const commentsTable = await query(
      "SHOW TABLES LIKE 'comments'"
    );
    console.log('Comments table exists:', commentsTable.length > 0);

    // 检查likes表
    const likesTable = await query(
      "SHOW TABLES LIKE 'likes'"
    );
    console.log('Likes table exists:', likesTable.length > 0);

    // 检查notifications表
    const notificationsTable = await query(
      "SHOW TABLES LIKE 'notifications'"
    );
    console.log('Notifications table exists:', notificationsTable.length > 0);
  } catch (error) {
    console.error('Error checking tables:', error);
  }
};

checkTables();