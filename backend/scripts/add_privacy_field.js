import mysql from 'mysql2/promise';

// 阿里云RDS云端数据库配置
const dbConfig = {
  host: 'rm-2ze90ovu5a037y1ujxo.mysql.rds.aliyuncs.com',
  user: 'test1',
  password: 'asdfgh0625YYH',
  database: 'signlanguage_platform'
};

const addPrivacyField = async () => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // 检查privacy字段是否已存在
    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'posts' AND COLUMN_NAME = 'privacy'`,
      [dbConfig.database]
    );

    if (columns.length === 0) {
      // 添加privacy字段
      await connection.execute(
        `ALTER TABLE posts ADD COLUMN privacy ENUM('public', 'friends', 'private') DEFAULT 'public' AFTER category`
      );
      console.log('✅ privacy字段添加成功');
    } else {
      console.log('✅ privacy字段已存在');
    }

    // 检查parent_id字段是否存在于comments表
    const [commentColumns] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'comments' AND COLUMN_NAME = 'parent_id'`,
      [dbConfig.database]
    );

    if (commentColumns.length === 0) {
      // 添加parent_id字段到comments表
      await connection.execute(
        `ALTER TABLE comments ADD COLUMN parent_id INT NULL AFTER content`
      );
      console.log('✅ comments.parent_id字段添加成功');
    } else {
      console.log('✅ comments.parent_id字段已存在');
    }

    // 检查likes_count字段是否存在于comments表
    const [likesColumns] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'comments' AND COLUMN_NAME = 'likes_count'`,
      [dbConfig.database]
    );

    if (likesColumns.length === 0) {
      // 添加likes_count字段到comments表
      await connection.execute(
        `ALTER TABLE comments ADD COLUMN likes_count INT DEFAULT 0 AFTER parent_id`
      );
      console.log('✅ comments.likes_count字段添加成功');
    } else {
      console.log('✅ comments.likes_count字段已存在');
    }

    console.log('\n🎉 所有数据库字段更新完成！');
  } catch (error) {
    console.error('❌ 更新数据库失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

addPrivacyField();
