import getPool from '../config/mysql.js';

export default class CalendarEvent {
  static async create(eventData) {
    const { user_id, title, description, event_date, start_time, end_time } = eventData;
    
    try {
      const pool = await getPool();
      const [result] = await pool.execute(
        'INSERT INTO calendar_events (user_id, title, description, event_date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)',
        [user_id, title, description, event_date, start_time, end_time]
      );
      
      return { id: result.insertId, ...eventData };
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(userId, month = null, year = null) {
    let query = 'SELECT * FROM calendar_events WHERE user_id = ?';
    let params = [userId];
    
    if (month && year) {
      query += ' AND MONTH(event_date) = ? AND YEAR(event_date) = ?';
      params.push(month, year);
    }
    
    query += ' ORDER BY event_date, start_time';
    
    try {
      const pool = await getPool();
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const pool = await getPool();
      const [rows] = await pool.execute(
        'SELECT * FROM calendar_events WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, eventData) {
    const { title, description, event_date, start_time, end_time } = eventData;
    
    try {
      const pool = await getPool();
      const [result] = await pool.execute(
        'UPDATE calendar_events SET title = ?, description = ?, event_date = ?, start_time = ?, end_time = ? WHERE id = ?',
        [title, description, event_date, start_time, end_time, id]
      );
      
      return { id, ...eventData };
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const pool = await getPool();
      const [result] = await pool.execute(
        'DELETE FROM calendar_events WHERE id = ?',
        [id]
      );
      
      return { deleted: result.affectedRows };
    } catch (error) {
      throw error;
    }
  }
}