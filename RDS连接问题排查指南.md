# 阿里云RDS连接问题故障排查指南

## 问题分析

错误代码：`ETIMEDOUT`
错误含义：连接超时，无法连接到阿里云RDS数据库

## 最可能的原因

### 1. 使用了内网地址（最常见）

**问题**：您使用了内网地址 `rm-2ze90ovu5a037y1uj.mysql.rds.aliyuncs.com` 从本地连接

**解决方案**：
- 内网地址只能在阿里云ECS服务器上使用
- 从本地连接必须使用**公网地址**

### 2. 白名单未配置

**问题**：您的IP地址没有添加到RDS白名单中

**解决方案**：
1. 登录阿里云控制台
2. 进入RDS实例管理页面
3. 点击"数据安全性" -> "白名单设置"
4. 添加您的IP地址：`172.20.10.2`

### 3. 网络问题

**问题**：本地网络无法访问阿里云RDS

**解决方案**：
- 检查网络连接
- 尝试使用其他网络环境
- 检查防火墙设置

## 详细解决步骤

### 步骤1：获取公网地址

1. 登录阿里云控制台：https://rds.console.aliyun.com/
2. 找到您的RDS实例：`rm-2ze90ovu5a037y1uj`
3. 点击实例名称进入详情页
4. 找到"连接信息"部分
5. 查看"公网地址"或"外网地址"
6. 复制公网地址（格式类似：`rm-xxxxx.mysql.rds.aliyuncs.com`）

**注意**：如果公网地址未启用，需要先申请开通

### 步骤2：配置白名单

1. 在RDS实例详情页，点击"数据安全性"
2. 找到"白名单设置"
3. 点击"修改"
4. 在白名单中添加：
   - IP地址：`172.20.10.2`
   - 备注：本地开发环境
5. 点击"确定"保存

**可选**：如果IP经常变化，可以添加：
- `0.0.0.0/0`（允许所有IP，不推荐，仅用于测试）

### 步骤3：测试连接

运行测试脚本：
```bash
node test_db_connection.js
```

这将测试：
- 本地数据库连接
- 阿里云RDS内网地址连接（预期失败）
- 阿里云RDS公网地址连接（需要先填写）

### 步骤4：更新配置

获取公网地址后，更新以下文件：

**1. 更新导入脚本** (`import_cloud_db_public.js`)：
```javascript
const cloudConfig = {
  host: 'YOUR_PUBLIC_RDS_ADDRESS_HERE', // 替换为公网地址
  user: 'test1',
  password: 'asdfgh0625YYH',
  database: 'signlanguage_platform'
};
```

**2. 更新项目配置** (`backend/src/config/mysql.js`)：
```javascript
const dbConfig = {
  host: process.env.MYSQL_HOST || 'YOUR_PUBLIC_RDS_ADDRESS_HERE', // 替换为公网地址
  user: process.env.MYSQL_USER || 'test1',
  password: process.env.MYSQL_PASSWORD || 'asdfgh0625YYH',
  database: process.env.MYSQL_DATABASE || 'signlanguage_platform'
};
```

### 步骤5：重新导入数据

```bash
node import_cloud_db_public.js database_export_2026-03-15.sql
```

## 常见错误代码及解决方案

| 错误代码 | 错误含义 | 解决方案 |
|---------|---------|---------|
| ETIMEDOUT | 连接超时 | 检查网络、使用公网地址、配置白名单 |
| ECONNREFUSED | 连接被拒绝 | 检查端口、确认RDS实例状态 |
| ER_ACCESS_DENIED_ERROR | 访问被拒绝 | 检查用户名密码、确认权限 |
| ER_BAD_DB_ERROR | 数据库不存在 | 确认数据库名称是否正确 |

## 验证清单

完成以下检查，确保配置正确：

- [ ] 已获取阿里云RDS公网地址
- [ ] 已将本地IP（172.20.10.2）添加到白名单
- [ ] 已更新配置文件中的数据库地址
- [ ] 已测试数据库连接成功
- [ ] 已成功导入数据到RDS
- [ ] 已验证应用可以正常使用RDS

## 备选方案

如果仍然无法连接，可以考虑：

1. **使用阿里云ECS服务器**
   - 在阿里云上购买ECS服务器
   - 将应用部署在ECS上
   - 使用内网地址连接RDS（性能更好，费用更低）

2. **使用VPN**
   - 建立VPN连接到阿里云VPC
   - 通过VPN访问内网地址

3. **使用本地数据库**
   - 暂时继续使用本地数据库
   - 等应用部署到云服务器后再迁移

## 获取帮助

如果问题仍未解决：

1. 查看阿里云RDS文档：https://help.aliyun.com/product/57140.html
2. 联系阿里云技术支持
3. 检查RDS实例的运行状态和错误日志

## 快速命令参考

```bash
# 测试本地数据库连接
mysql -h localhost -u root -p

# 测试阿里云RDS连接（使用公网地址）
mysql -h YOUR_PUBLIC_RDS_ADDRESS -u test1 -p

# 导出本地数据库
node export_local_db.js

# 导入到阿里云RDS
node import_cloud_db_public.js database_export_2026-03-15.sql

# 测试所有连接
node test_db_connection.js
```