const mysql = require('mysql2/promise');
const fs = require('fs');

// 本地数据库配置
const localConfig = {
  host: 'localhost',
  user: 'root',
  password: 'asdfgh0625YYH',
  database: 'signlanguage_platform',
  multipleStatements: true
};

async function exportDatabase() {
  try {
    const connection = await mysql.createConnection(localConfig);
    
    // 获取所有表名
    const [tables] = await connection.query("SHOW TABLES");
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    console.log('找到以下表:', tableNames);
    
    // 导出每个表的数据
    const exportData = {};
    
    for (const tableName of tableNames) {
      console.log(`正在导出表: ${tableName}`);
      
      // 获取表结构
      const [structure] = await connection.query(`SHOW CREATE TABLE ${tableName}`);
      
      // 获取表数据
      const [rows] = await connection.query(`SELECT * FROM ${tableName}`);
      
      exportData[tableName] = {
        structure: structure[0]['Create Table'],
        data: rows
      };
    }
    
    // 保存到JSON文件
    const exportFile = `database_export_${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2));
    
    console.log(`✅ 数据库导出完成: ${exportFile}`);
    
    // 同时生成SQL导出文件
    const sqlExportFile = `database_export_${new Date().toISOString().split('T')[0]}.sql`;
    let sqlContent = '';
    
    for (const [tableName, tableData] of Object.entries(exportData)) {
      sqlContent += `-- 表结构: ${tableName}\n`;
      sqlContent += `${tableData.structure};\n\n`;
      
      if (tableData.data && tableData.data.length > 0) {
        sqlContent += `-- 表数据: ${tableName}\n`;
        const columns = Object.keys(tableData.data[0]);
        const columnsStr = columns.join(',');
        
        for (const row of tableData.data) {
          const values = columns.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            return value;
          }).join(',');
          
          sqlContent += `INSERT INTO ${tableName} (${columnsStr}) VALUES (${values});\n`;
        }
        sqlContent += '\n';
      }
    }
    
    fs.writeFileSync(sqlExportFile, sqlContent);
    console.log(`✅ SQL导出文件生成完成: ${sqlExportFile}`);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ 导出失败:', error);
    process.exit(1);
  }
}

exportDatabase();