# 日历应用 (Calendar App)

一个基于 Node.js + React + TypeScript 的全栈日历应用，具有用户管理、日历事件管理和签到功能。支持多种部署模式。

## 🚀 快速开始

### 部署模式选择

#### 模式1: 本地MySQL部署 (推荐开发)
```bash
# 启动应用 (使用本地MySQL)
start-app.bat
```

#### 模式2: 完整Docker部署 (推荐生产)
```powershell
# 启动完整Docker部署
start-docker-full.ps1

# 停止所有服务
stop-docker-full.ps1

# 检查部署状态
status-docker-full.ps1
```

## 功能特性

### 🔐 用户管理
- 用户注册和登录
- JWT 认证
- 安全的密码加密

### 📅 日历功能
- 月视图日历展示
- 创建、编辑、删除日历事件
- 事件时间管理
- 响应式设计

### ✅ 签到系统
- 每日签到功能
- 月度签到统计
- 签到率计算
- 签到历史记录

### 💾 数据存储
- MySQL 数据库 (本地或Docker)
- 数据持久化存储
- 自动数据库初始化

## 技术栈

### 后端
- **Node.js** - 运行时环境
- **Express.js** - Web 框架
- **MySQL** - 数据库
- **JWT** - 身份认证
- **bcryptjs** - 密码加密
- **CORS** - 跨域支持

### 前端
- **React 18** - 用户界面库
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **React Router** - 路由管理
- **date-fns** - 日期处理
- **Axios** - HTTP 客户端

### 部署
- **Docker** - 容器化部署
- **Docker Compose** - 服务编排
- **PowerShell** - 自动化脚本

## 📁 项目结构

```
calendar/
├── client/                 # 前端React应用
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── contexts/       # React上下文
│   │   ├── services/       # API服务
│   │   └── ...
│   ├── Dockerfile          # 前端Docker配置
│   └── package.json
├── server/                 # 后端Node.js应用
│   ├── config/             # 数据库配置
│   ├── middleware/         # 中间件
│   ├── models/             # 数据模型
│   ├── routes/             # API路由
│   ├── .env               # 服务器配置
│   ├── Dockerfile         # 后端Docker配置
│   └── package.json
├── mysql-init/             # 数据库初始化脚本
│   └── 01-init.sql
├── docker-compose.yml      # Docker服务编排
├── start-app.bat          # 本地MySQL启动脚本
├── start-docker-full.ps1  # 完整Docker部署脚本
├── stop-docker-full.ps1   # 停止服务脚本
├── status-docker-full.ps1 # 状态检查脚本
└── README.md
```

## 🔧 部署指南

### 本地MySQL部署

1. **确保MySQL服务运行**
   - 默认配置: localhost:3306
   - 用户名: root
   - 密码: Song13468046730

2. **启动应用**
   ```bash
   start-app.bat
   ```

3. **访问应用**
   - 前端: http://localhost:3000
   - 后端: http://localhost:5000

### Docker部署

1. **安装Docker Desktop**
   - 下载: https://www.docker.com/products/docker-desktop/

2. **启动完整部署**
   ```powershell
   start-docker-full.ps1
   ```

3. **管理服务**
   ```powershell
   # 停止服务
   stop-docker-full.ps1
   
   # 检查状态
   status-docker-full.ps1
   ```

## 📊 数据库配置

### 本地MySQL配置
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Song13468046730
DB_NAME=calendar_app
DB_PORT=3306
```

### Docker MySQL配置
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password123
DB_NAME=calendar_app
DB_PORT=3308
```

## 🎯 使用说明

1. **注册账号** - 首次使用需要注册新用户
2. **登录系统** - 使用注册的账号登录
3. **使用日历** - 创建和管理日历事件
4. **每日签到** - 完成每日签到任务
5. **查看统计** - 查看月度签到统计

## 🔄 部署模式切换

### 从本地切换到Docker
1. 停止当前服务
2. 修改服务器配置 (取消注释Docker配置)
3. 运行 `start-docker-full.ps1`

### 从Docker切换回本地
1. 停止Docker服务
2. 恢复服务器配置 (使用本地配置)
3. 运行 `start-app.bat`

## 📞 技术支持

如有问题，请检查：
1. 数据库连接是否正常
2. 端口是否被占用
3. 环境变量配置是否正确

## 📄 许可证

MIT License