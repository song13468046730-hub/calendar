import getPool from '../config/mysql.js';
import bcrypt from 'bcryptjs';

export default class User {
  static async create(userData) {
    const { username, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
      const pool = await getPool();
      const [result] = await pool.execute(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
      );
      
      return { id: result.insertId, username, email };
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const pool = await getPool();
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const pool = await getPool();
      const [rows] = await pool.execute(
        'SELECT id, username, email, created_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}