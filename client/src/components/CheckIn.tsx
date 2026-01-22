import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { checkinsAPI } from '../services/api';

interface CheckInStats {
  check_in_date: string;
  check_count: number;
  all_notes: string;
}

const CheckIn: React.FC = () => {
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [monthlyStats, setMonthlyStats] = useState<CheckInStats[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    checkTodayStatus();
    fetchMonthlyStats();
  }, [currentMonth]);

  const checkTodayStatus = async () => {
    try {
      const response = await checkinsAPI.hasCheckedInToday();
      setHasCheckedInToday(response.hasCheckedIn);
    } catch (error) {
      console.error('检查今日签到状态失败:', error);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      const response = await checkinsAPI.getMonthlyStats(year, month);
      setMonthlyStats(response.stats || []);
    } catch (error) {
      console.error('获取月度统计失败:', error);
    }
  };

  const handleCheckIn = async () => {
    if (hasCheckedInToday) {
      setMessage('今日已签到');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await checkinsAPI.checkInToday(notes);
      setHasCheckedInToday(true);
      setMessage('签到成功！');
      setNotes('');
      fetchMonthlyStats();
    } catch (error: any) {
      setMessage(error.response?.data?.error || '签到失败');
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const getCheckInStatusForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return monthlyStats.find(stat => stat.check_in_date === dateStr);
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '5px'
      }}>
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} style={{
            textAlign: 'center',
            fontWeight: 'bold',
            padding: '10px',
            backgroundColor: '#e9ecef'
          }}>
            {day}
          </div>
        ))}
        
        {days.map(day => {
          const checkInData = getCheckInStatusForDate(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={day.toString()}
              style={{
                minHeight: '60px',
                border: '1px solid #ddd',
                padding: '5px',
                backgroundColor: checkInData ? '#d4edda' : 'white',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{
                fontWeight: isToday ? 'bold' : 'normal',
                color: isToday ? '#007bff' : 'inherit',
                marginBottom: '2px'
              }}>
                {format(day, 'd')}
              </div>
              
              {checkInData && (
                <div style={{
                  fontSize: '10px',
                  color: '#155724',
                  textAlign: 'center'
                }}>
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const totalCheckIns = monthlyStats.length;
  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  }).length;
  const checkInRate = Math.round((totalCheckIns / monthDays) * 100);

  return (
    <div className="container">
      <div style={{ marginBottom: '20px' }}>
        <h1>签到系统</h1>
        <p>记录您的每日签到，跟踪您的出勤情况</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* 签到面板 */}
        <div className="card">
          <h3>今日签到</h3>
          
          <div style={{
            textAlign: 'center',
            padding: '30px',
            backgroundColor: hasCheckedInToday ? '#d4edda' : '#fff3cd',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '10px',
              color: hasCheckedInToday ? '#155724' : '#856404'
            }}>
              {hasCheckedInToday ? '✓' : '?'}
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: hasCheckedInToday ? '#155724' : '#856404'
            }}>
              {hasCheckedInToday ? '今日已签到' : '等待签到'}
            </div>
            <div style={{ color: '#6c757d', marginTop: '5px' }}>
              {format(new Date(), 'yyyy年MM月dd日', { locale: zhCN })}
            </div>
          </div>

          {!hasCheckedInToday && (
            <>
              <div className="form-group">
                <label htmlFor="notes">备注（可选）</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="记录今日的心情或计划..."
                  disabled={loading}
                />
              </div>

              {message && (
                <div className={message.includes('成功') ? 'success' : 'error'}>
                  {message}
                </div>
              )}

              <button
                className="btn btn-success"
                style={{ width: '100%' }}
                onClick={handleCheckIn}
                disabled={loading || hasCheckedInToday}
              >
                {loading ? '签到中...' : '立即签到'}
              </button>
            </>
          )}
        </div>

        {/* 月度统计 */}
        <div className="card">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: 0 }}>月度统计</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={prevMonth} className="btn btn-secondary" style={{ padding: '5px 10px' }}>
                上个月
              </button>
              <button onClick={nextMonth} className="btn btn-secondary" style={{ padding: '5px 10px' }}>
                下个月
              </button>
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            marginBottom: '20px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
              {totalCheckIns} / {monthDays}
            </div>
            <div style={{ color: '#6c757d' }}>签到天数</div>
            <div style={{ marginTop: '10px' }}>
              <div style={{
                height: '10px',
                backgroundColor: '#e9ecef',
                borderRadius: '5px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  backgroundColor: '#28a745',
                  width: `${checkInRate}%`
                }} />
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '5px' }}>
                出勤率: {checkInRate}%
              </div>
            </div>
          </div>

          <h4 style={{ marginBottom: '10px' }}>
            {format(currentMonth, 'yyyy年 M月', { locale: zhCN })}
          </h4>
          
          {renderCalendar()}
        </div>
      </div>

      {/* 签到历史 */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3>最近签到记录</h3>
        {monthlyStats.length > 0 ? (
          <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            {monthlyStats.map((stat) => (
              <div
                key={stat.check_in_date}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  borderBottom: '1px solid #eee'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold' }}>
                    {format(new Date(stat.check_in_date), 'MM月dd日', { locale: zhCN })}
                  </div>
                  {stat.all_notes && (
                    <div style={{ fontSize: '14px', color: '#6c757d' }}>
                      {stat.all_notes.split(',').slice(0, 1).join(', ')}
                    </div>
                  )}
                </div>
                <div style={{
                  color: '#28a745',
                  fontWeight: 'bold'
                }}>
                  已签到
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>
            暂无签到记录
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckIn;