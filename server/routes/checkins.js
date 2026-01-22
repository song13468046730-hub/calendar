import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import CheckIn from '../models/CheckIn.js';

const router = express.Router();

// Get all check-ins for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    const checkIns = await CheckIn.findByUserId(req.user.id, month, year);
    res.json({ checkIns });
  } catch (error) {
    console.error('Get check-ins error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new check-in
router.post('/', authenticateToken, [
  body('check_in_date').isDate().withMessage('Valid check-in date required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const checkInData = {
      user_id: req.user.id,
      check_in_date: req.body.check_in_date,
      notes: req.body.notes || ''
    };

    const checkIn = await CheckIn.create(checkInData);
    res.status(201).json({ message: 'Check-in recorded successfully', checkIn });
  } catch (error) {
    console.error('Create check-in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if user has checked in today
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const hasCheckedIn = await CheckIn.hasCheckedInToday(req.user.id);
    res.json({ hasCheckedIn });
  } catch (error) {
    console.error('Check today error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Quick check-in for today
router.post('/today', authenticateToken, async (req, res) => {
  try {
    const hasCheckedIn = await CheckIn.hasCheckedInToday(req.user.id);
    
    if (hasCheckedIn) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    const today = new Date().toISOString().split('T')[0];
    const checkInData = {
      user_id: req.user.id,
      check_in_date: today,
      notes: req.body.notes || ''
    };

    const checkIn = await CheckIn.create(checkInData);
    res.status(201).json({ message: 'Check-in recorded successfully', checkIn });
  } catch (error) {
    console.error('Quick check-in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get monthly check-in statistics
router.get('/stats/:year/:month', authenticateToken, async (req, res) => {
  try {
    const { year, month } = req.params;
    const stats = await CheckIn.getMonthlyStats(req.user.id, parseInt(month), parseInt(year));
    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;