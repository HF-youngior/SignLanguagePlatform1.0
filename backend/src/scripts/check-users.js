import { query } from '../config/mysql.js';

const checkUsers = async () => {
  try {
    const users = await query('SELECT id, username, first_name, avatar FROM users');
    console.log('Users:', users);
    console.log('Users count:', users.length);
  } catch (error) {
    console.error('Error checking users:', error);
  }
};

checkUsers();