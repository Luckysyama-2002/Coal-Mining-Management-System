import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Calendar.css';

const Calendar = ({ shifts = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeWeekTab, setActiveWeekTab] = useState('thisWeek');

  // Mock data for monthly shifts and holidays
  const monthlyShifts = [];
  const monthlyHolidays = [ ];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date().getDate();
  const isCurrentMonth = new Date().getMonth() === month && new Date().getFullYear() === year;

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Week calculation helpers (Sunday as day 0)
  const getWeekStart = (date) => {
    const start = new Date(date);
    let day = start.getDay();
    if (day === 0) day = 7; // Treat Sunday as end of week
    start.setDate(start.getDate() - (day - 1));
    return start;
  };

  const getThisWeek = () => getWeekStart(new Date());
  const getPrevWeek = () => {
    const weekStart = getThisWeek();
    weekStart.setDate(weekStart.getDate() - 7);
    return weekStart;
  };
  const getNextWeek = () => {
    const weekStart = getThisWeek();
    weekStart.setDate(weekStart.getDate() + 7);
    return weekStart;
  };
  const getWeekRangeLabel = (weekStart) => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  // Get shifts for the week
  const getWeekShifts = (weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.shift_date);
      return shiftDate >= weekStart && shiftDate <= weekEnd;
    }).map(shift => ({
      day: new Date(shift.shift_date).getDate(),
      fullDate: new Date(shift.shift_date).toLocaleDateString(),
      type: shift.shift_type,
      status: shift.status
    }));
  };

  const shiftTimes = {
    A: '8AM - 4PM',
    B: '12AM - 8AM',
    C: '4PM - 12AM'
  };

  const weekStart = activeWeekTab === 'prevWeek' ? getPrevWeek() : activeWeekTab === 'thisWeek' ? getThisWeek() : getNextWeek();
  const currentWeekShifts = getWeekShifts(weekStart);

  const renderMonthlyDays = () => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();
    const cells = [];

    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = isCurrentMonth && d === new Date().getDate();
      const isShift = monthlyShifts.includes(d);
      const isHoliday = monthlyHolidays.includes(d);
      cells.push(
        <div key={d} className={`calendar-day ${isToday ? 'today' : ''} ${isShift ? 'shift-day' : ''} ${isHoliday ? 'holiday' : ''}`}>
          <span className="day-number">{d}</span>
          {isShift && <div className="dot blue"></div>}
          {isHoliday && <div className="dot red"></div>}
        </div>
      );
    }
    return cells;
  };

  const renderWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dayNum = date.getDate();
      const isToday = date.toDateString() === new Date().toDateString();
      const dayShifts = currentWeekShifts.filter(s => s.day === dayNum);
      days.push(
        <div key={i} className={`week-day ${isToday ? 'today' : ''}`}>
          <div className="week-day-header">
            {date.toLocaleDateString('en-US', { weekday: 'short' })} {dayNum}
          </div>
          {dayShifts.length > 0 ? (
            dayShifts.map((shift, idx) => (
              <span key={idx} className={`shift-badge shift-${shift.type.toLowerCase()}`}>
                {shift.type}
              </span>
            ))
          ) : (
            <span className="no-shift">Holiday</span>
          )}
        </div>
      );
    }
    return days;
  };

  return (
<div className="calendar-container">
      <div className="calendar-card">
        <div className="calendar-main">
          {/* Monthly View */}
          <div className="monthly-section">
            <div className="calendar-header">
              <h3>{monthNames[month]} {year}</h3>
              <div className="calendar-controls">
                <button onClick={handlePrevMonth}><FiChevronLeft /></button>
                <button onClick={handleNextMonth}><FiChevronRight /></button>
              </div>
            </div>
            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="weekday-label">{d}</div>
              ))}
              {renderMonthlyDays()}
            </div>
          </div>

          {/* Weekly Shifts Section - Right Side */}
          <div className="weekly-section">
            <h4>Weekly Shifts</h4>
            <div className="week-tabs">
              <button 
                className={`week-tab ${activeWeekTab === 'prevWeek' ? 'active' : ''}`}
                onClick={() => setActiveWeekTab('prevWeek')}
              >
                Previous Week
              </button>
              <button 
                className={`week-tab ${activeWeekTab === 'thisWeek' ? 'active' : ''}`}
                onClick={() => setActiveWeekTab('thisWeek')}
              >
                This Week
              </button>
              <button 
                className={`week-tab ${activeWeekTab === 'nextWeek' ? 'active' : ''}`}
                onClick={() => setActiveWeekTab('nextWeek')}
              >
                Next Week
              </button>
            </div>
            <div className="week-header">
              {getWeekRangeLabel(weekStart)}
              <span className="shift-summary">Shifts: {currentWeekShifts.length} days</span>
            </div>
            <div className="week-days-grid">
              {renderWeekDays()}
            </div>
            <div className="shift-times">
              <small>A: 8AM-4PM | B: 12AM-8AM | C: 4PM-12AM</small>
            </div>
          </div>
        </div>

        <div className="calendar-legend">
          <div className="legend-item"><span className="dot blue"></span> Monthly Shift</div>
          <div className="legend-item"><span className="dot red"></span> Holiday</div>
          <div className="legend-item"><span className="dot today-border"></span> Today</div>
          <div className="legend-item shift-type-legend">
            <span className="shift-badge shift-a">A</span>
            <span className="shift-badge shift-b">B</span>
            <span className="shift-badge shift-c">C</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;

