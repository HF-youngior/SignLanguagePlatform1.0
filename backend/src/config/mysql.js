import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 阿里云RDS云端数据库配置
const dbConfig = {
  host: process.env.MYSQL_HOST || 'rm-2zelg8vzn3xb07mvako.mysql.rds.aliyuncs.com',
  user: process.env.MYSQL_USER || 'test1',
  password: process.env.MYSQL_PASSWORD || 'asdfgh0625YYH',
  database: process.env.MYSQL_DATABASE || 'csl',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试连接
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('📦 MySQL数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL数据库连接失败:', error.message);
    return false;
  }
};

// 执行查询的辅助函数
const query = async (sql, params) => {
  try {
    // 确保params是数组
    const safeParams = Array.isArray(params) ? params : [];
    
    // 确保所有参数都是有效的类型
    const processedParams = safeParams.map(param => {
      if (typeof param === 'number') {
        // 确保数字不是NaN
        return isNaN(param) ? 0 : param;
      }
      if (typeof param === 'string') {
        const trimmed = param.trim();
        if (trimmed !== '' && !isNaN(trimmed) && !isNaN(parseFloat(trimmed))) {
          return Number(trimmed);
        }
      }
      return param;
    });
    
    // 执行查询
    const [results] = await pool.query(sql, processedParams);
    return results;
  } catch (error) {
    console.error('SQL查询错误:', error);
    console.error('SQL语句:', sql);
    console.error('参数:', params);
    throw error;
  }
};

// 事务处理
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export { pool, query, transaction, testConnection };