import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarEvent, eventsAPI } from '../services/api';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  event?: CalendarEvent | null;
  onSave: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedDate, 
  event, 
  onSave 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (event) {
        // 编辑模式
        setTitle(event.title);
        setDescription(event.description || '');
        setEventDate(event.event_date);
        setStartTime(event.start_time || '');
        setEndTime(event.end_time || '');
      } else if (selectedDate) {
        // 新建模式
        setTitle('');
        setDescription('');
        setEventDate(format(selectedDate, 'yyyy-MM-dd'));
        setStartTime('');
        setEndTime('');
      }
      setError('');
    }
  }, [isOpen, event, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const eventData = {
        title,
        description,
        event_date: eventDate,
        start_time: startTime || null,
        end_time: endTime || null
      };

      if (event?.id) {
        await eventsAPI.updateEvent(event.id, eventData);
      } else {
        await eventsAPI.createEvent(eventData);
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event?.id) return;

    if (!window.confirm('确定要删除这个事件吗？')) {
      return;
    }

    setLoading(true);
    try {
      await eventsAPI.deleteEvent(event.id);
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || '删除失败');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h3 style={{ marginBottom: '20px' }}>
          {event ? '编辑事件' : '新建事件'}
        </h3>
        
        {error && <div className="error" style={{ marginBottom: '15px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">标题 *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">描述</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="eventDate">日期 *</label>
            <input
              type="date"
              id="eventDate"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label htmlFor="startTime">开始时间</label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endTime">结束时间</label>
              <input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            justifyContent: event ? 'space-between' : 'flex-end',
            marginTop: '20px'
          }}>
            {event && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleDelete}
                disabled={loading}
                style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
              >
                删除
              </button>
            )}
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                取消
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;