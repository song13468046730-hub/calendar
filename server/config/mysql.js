import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 明确加载 server/.env 文件
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// 调试信息
console.log('🔧 环境变量配置:');
console.log('   DB_HOST:', process.env.DB_HOST || 'localhost (默认)');
console.log('   DB_USER:', process.env.DB_USER || 'root (默认)');
console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? '***已设置***' : '空 (默认)');
console.log('   DB_NAME:', process.env.DB_NAME || 'calendar_app (默认)');

// 先创建一个不指定数据库的连接池用于初始化
const initConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const initPool = mysql.createPool(initConfig);

// 创建带数据库的连接池（在初始化完成后使用）
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'calendar_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool; // 将在初始化后设置

// 初始化数据库和表
async function initializeDatabase() {
  let connection;
  try {
    // 使用不指定数据库的连接池
    connection = await initPool.getConnection();
    
    console.log('🔧 创建数据库和表...');
    
    // 创建数据库（如果不存在）
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log('✅ 数据库创建完成');
    
    // 切换到新创建的数据库（使用query而不是execute）
    await connection.query(`USE ${dbConfig.database}`);
    
    // 创建用户表
    await connection.execute(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('✅ 用户表创建完成');
    
    // 创建日历事件表
    await connection.execute(`CREATE TABLE IF NOT EXISTS calendar_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      event_date DATE NOT NULL,
      start_time TIME,
      end_time TIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);
    console.log('✅ 日历事件表创建完成');
    
    // 创建签到表
    await connection.execute(`CREATE TABLE IF NOT EXISTS check_ins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      check_in_date DATE NOT NULL,
      check_in_time TIME,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_date (user_id, check_in_date)
    )`);
    console.log('✅ 签到表创建完成');
    
    // 现在创建带数据库的连接池
    pool = mysql.createPool(dbConfig);
    
    console.log('🎉 MySQL数据库初始化完成！');
  } catch (error) {
    console.error('❌ 数据库初始化错误:', error.message);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// 获取数据库连接池的函数
async function getPool() {
  // 如果pool已经初始化，直接返回
  if (pool) {
    return pool;
  }
  
  // 否则等待初始化完成
  return new Promise((resolve, reject) => {
    const checkPool = () => {
      if (pool) {
        resolve(pool);
      } else {
        setTimeout(checkPool, 100);
      }
    };
    checkPool();
  });
}

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await initPool.getConnection();
    console.log('✅ MySQL database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
  }
}

// 启动数据库初始化
async function startDatabase() {
  await testConnection();
  await initializeDatabase();
}

startDatabase().catch(error => {
  console.error('❌ 数据库启动失败:', error);
});

export default getPool;