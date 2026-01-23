import getPool from '../config/mysql.js';

export default class CheckIn {
  static async create(checkInData) {
    const { user_id, check_in_date, notes } = checkInData;
    
    try {
      const pool = await getPool();
      const [result] = await pool.execute(
        'INSERT INTO check_ins (user_id, check_in_date, notes) VALUES (?, ?, ?)',
        [user_id, check_in_date, notes]
      );
      
      return { id: result.insertId, ...checkInData };
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(userId, month = null, year = null) {
    let query = 'SELECT * FROM check_ins WHERE user_id = ?';
    let params = [userId];
    
    if (month && year) {
      query += ' AND MONTH(check_in_date) = ? AND YEAR(check_in_date) = ?';
      params.push(month, year);
    }
    
    query += ' ORDER BY check_in_date DESC, check_in_time DESC';
    
    try {
      const pool = await getPool();
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async hasCheckedInToday(userId) {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const pool = await getPool();
      const [rows] = await pool.execute(
        'SELECT * FROM check_ins WHERE user_id = ? AND check_in_date = ?',
        [userId, today]
      );
      
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getMonthlyStats(userId, month, year) {
    try {
      const pool = await getPool();
      const [rows] = await pool.execute(
        `SELECT 
          check_in_date,
          COUNT(*) as check_count,
          GROUP_CONCAT(notes) as all_notes
         FROM check_ins 
         WHERE user_id = ? 
         AND MONTH(check_in_date) = ? 
         AND YEAR(check_in_date) = ?
         GROUP BY check_in_date
         ORDER BY check_in_date`,
        [userId, month, year]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }
}