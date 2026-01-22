import React, { useState } from 'react';
import { format } from 'date-fns';
import Calendar from './Calendar';
import EventModal from './EventModal';
import { CalendarEvent } from '../services/api';

const Dashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setSelectedEvent(null);
  };

  const handleSave = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '20px' }}>
        <h1>日历仪表板</h1>
        <p>点击日期创建新事件，点击事件进行编辑</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
        <div>
          <Calendar 
            key={refreshTrigger}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
          />
        </div>
        
        <div>
          <div className="card">
            <h3>快速操作</h3>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginBottom: '10px' }}
              onClick={() => {
                setSelectedDate(new Date());
                setSelectedEvent(null);
                setIsModalOpen(true);
              }}
            >
              创建今日事件
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%' }}
              onClick={() => window.location.href = '/checkin'}
            >
              今日签到
            </button>
          </div>
          
          <div className="card">
            <h3>今日事件</h3>
            <p style={{ color: '#6c757d', textAlign: 'center' }}>
              点击日历查看今日事件
            </p>
          </div>
        </div>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        selectedDate={selectedDate || undefined}
        event={selectedEvent}
        onSave={handleSave}
      />
    </div>
  );
};

export default Dashboard;