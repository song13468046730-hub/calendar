# 日历应用 - Docker容器化部署指南

## 🚀 快速开始

### 方式1：使用启动脚本（推荐）
```bash
# Windows
.\.docker-start.bat

# 或者使用管理脚本
.\.docker-manage.bat
```

### 方式2：手动启动
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f
```

## 📊 服务架构

```
用户浏览器
    ↓
前端 (nginx:3000) ←→ 后端API (Node.js:5000) ←→ MySQL数据库 (3306)
```

### 服务详情
- **前端**: nginx服务器，端口3000
- **后端**: Node.js Express API，端口5000  
- **数据库**: MySQL 8.0，端口3306
- **网络**: 自定义网络 `calendar-network`

## 🔧 环境配置

### 数据库配置
```env
DB_HOST=mysql          # Docker容器名称
DB_USER=root           # 管理员用户
DB_PASSWORD=password123 # 管理员密码
DB_NAME=calendar_app   # 数据库名称
```

### 应用配置
```env
PORT=5000              # 后端服务端口
JWT_SECRET=your_jwt_secret_key_here_change_in_production
VITE_API_URL=http://localhost:5000/api
```

## 📁 项目结构

```
calendar/
├── docker-compose.yml          # Docker编排文件
├── docker-start.bat            # Docker启动脚本
├── docker-manage.bat           # Docker管理脚本
├── .env.docker                 # Docker环境配置
├── mysql-init/                 # MySQL初始化脚本
│   └── 01-init.sql            # 数据库初始化
├── server/                     # 后端服务
│   ├── Dockerfile             # 后端Docker镜像
│   └── package.json
├── client/                     # 前端服务
│   ├── Dockerfile             # 前端Docker镜像
│   ├── nginx.conf             # nginx配置
│   └── package.json
└── README.md
```

## 🛠️ 管理命令

### 基本操作
```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看状态
docker-compose ps
```

### 日志查看
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### 数据库管理
```bash
# 进入MySQL控制台
docker exec -it calendar-mysql mysql -u root -ppassword123 calendar_app

# 备份数据库
docker exec calendar-mysql mysqldump -u root -ppassword123 calendar_app > backup.sql

# 恢复数据库
docker exec -i calendar-mysql mysql -u root -ppassword123 calendar_app < backup.sql
```

## 🔍 故障排除

### 常见问题

1. **端口冲突**
   ```bash
   # 检查端口占用
   netstat -ano | findstr :3000
   netstat -ano | findstr :5000
   netstat -ano | findstr :3306
   
   # 停止占用进程
   taskkill /PID <进程ID> /F
   ```

2. **Docker服务未启动**
   - 确保Docker Desktop正在运行
   - 重启Docker Desktop

3. **数据库连接失败**
   ```bash
   # 检查MySQL容器状态
   docker logs calendar-mysql
   
   # 检查网络连接
   docker network ls
   docker inspect calendar-network
   ```

4. **构建失败**
   ```bash
   # 清理缓存重新构建
   docker-compose down
   docker system prune -f
   docker-compose build --no-cache
   docker-compose up -d
   ```

### 数据持久化
- MySQL数据存储在Docker卷 `mysql_data` 中
- 即使容器重启，数据也不会丢失
- 备份数据：使用 `docker-manage.bat` 中的备份功能

## 🔄 开发模式

### 使用本地开发环境
```bash
# 停止Docker服务
docker-compose down

# 使用本地MySQL和开发服务器
.\.start-mysql.bat
```

### 切换回Docker部署
```bash
# 停止本地服务
# 重新启动Docker
docker-compose up -d
```

## 📈 生产部署建议

### 安全配置
1. 修改默认密码
2. 设置强JWT密钥
3. 配置HTTPS
4. 设置防火墙规则

### 性能优化
1. 调整MySQL配置
2. 配置nginx缓存
3. 启用Gzip压缩
4. 设置资源缓存头

### 监控和日志
1. 配置日志轮转
2. 设置健康检查
3. 监控资源使用
4. 设置告警机制

## 🌐 访问应用

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:5000
- **MySQL管理**: 使用MySQL Workbench或phpMyAdmin

## 📞 支持

如果遇到问题，请检查：
1. Docker服务是否正常运行
2. 端口是否被占用
3. 日志文件中的错误信息
4. 网络连接是否正常