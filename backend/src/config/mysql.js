import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

class SignLanguageDB {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'newuser',
        password: process.env.MYSQL_PASSWORD || '123qwe,./',
        database: process.env.MYSQL_DATABASE || 'sign_language_learning',
        port: process.env.MYSQL_PORT || 3306,
        charset: 'utf8mb4'
      });

      console.log('📦 MySQL连接成功');
      return this.connection;
    } catch (error) {
      console.error('MySQL连接失败:', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('MySQL连接已关闭');
    }
  }

  async query(sql, params = []) {
    if (!this.connection) {
      await this.connect();
    }
    
    try {
      const [rows] = await this.connection.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('数据库查询错误:', error.message);
      throw error;
    }
  }
}

// 创建单例实例
const db = new SignLanguageDB();

export { db };

