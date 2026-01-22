import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { CalendarEvent, eventsAPI } from '../services/api';

interface CalendarProps {
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onDateClick, onEventClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [currentMonth]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      const response = await eventsAPI.getEvents(month, year);
      setEvents(response.events || []);
    } catch (error) {
      console.error('获取事件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(event => event.event_date === dateStr);
  };

  const renderHeader = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '5px'
      }}>
        <button onClick={prevMonth} className="btn btn-secondary">
          上个月
        </button>
        <h3 style={{ margin: 0 }}>
          {format(currentMonth, 'yyyy年 M月', { locale: zhCN })}
        </h3>
        <button onClick={nextMonth} className="btn btn-secondary">
          下个月
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = 'eee';
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div 
          key={i} 
          style={{
            padding: '10px',
            textAlign: 'center',
            fontWeight: 'bold',
            backgroundColor: '#e9ecef'
          }}
        >
          {format(addDays(startDate, i), dateFormat, { locale: zhCN })}
        </div>
      );
    }

    return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayEvents = getEventsForDate(cloneDay);
        
        days.push(
          <div
            key={day.toString()}
            style={{
              minHeight: '100px',
              border: '1px solid #ddd',
              padding: '5px',
              backgroundColor: !isSameMonth(day, monthStart) ? '#f8f9fa' : 'white',
              cursor: 'pointer',
              position: 'relative'
            }}
            onClick={() => onDateClick(cloneDay)}
          >
            <div style={{
              fontWeight: isSameDay(day, new Date()) ? 'bold' : 'normal',
              color: isSameDay(day, new Date()) ? '#007bff' : 'inherit',
              marginBottom: '5px'
            }}>
              {format(day, 'd')}
            </div>
            
            {dayEvents.slice(0, 2).map((event, index) => (
              <div
                key={event.id}
                style={{
                  fontSize: '12px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '2px 4px',
                  borderRadius: '3px',
                  marginBottom: '2px',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(event);
                }}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            
            {dayEvents.length > 2 && (
              <div style={{
                fontSize: '11px',
                color: '#6c757d',
                textAlign: 'center'
              }}>
                +{dayEvents.length - 2} 更多
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {days}
        </div>
      );
      days = [];
    }

    return <div>{rows}</div>;
  };

  return (
    <div className="card">
      {renderHeader()}
      {renderDays()}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>加载中...</div>
      ) : (
        renderCells()
      )}
    </div>
  );
};

export default Calendar;