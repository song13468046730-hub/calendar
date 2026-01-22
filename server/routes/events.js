import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import CalendarEvent from '../models/CalendarEvent.js';

const router = express.Router();

// Get all events for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    const events = await CalendarEvent.findByUserId(req.user.id, month, year);
    res.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new event
router.post('/', authenticateToken, [
  body('title').notEmpty().withMessage('Title is required'),
  body('event_date').isDate().withMessage('Valid event date required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = {
      user_id: req.user.id,
      title: req.body.title,
      description: req.body.description || '',
      event_date: req.body.event_date,
      start_time: req.body.start_time || null,
      end_time: req.body.end_time || null
    };

    const event = await CalendarEvent.create(eventData);
    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update event
router.put('/:id', authenticateToken, [
  body('title').notEmpty().withMessage('Title is required'),
  body('event_date').isDate().withMessage('Valid event date required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventId = req.params.id;
    const existingEvent = await CalendarEvent.findById(eventId);
    
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existingEvent.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const eventData = {
      title: req.body.title,
      description: req.body.description || '',
      event_date: req.body.event_date,
      start_time: req.body.start_time || null,
      end_time: req.body.end_time || null
    };

    const updatedEvent = await CalendarEvent.update(eventId, eventData);
    res.json({ message: 'Event updated successfully', event: updatedEvent });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete event
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const eventId = req.params.id;
    const existingEvent = await CalendarEvent.findById(eventId);
    
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existingEvent.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await CalendarEvent.delete(eventId);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;