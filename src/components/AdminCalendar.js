import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const AdminCalendar = ({ 
  events, 
  onSelectEvent, 
  onSelectSlot, 
  view, 
  onView,
  onNavigate 
}) => {
  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      onSelectEvent={onSelectEvent}
      onSelectSlot={onSelectSlot}
      selectable={true}
      defaultView={view}
      view={view}
      onView={onView}
      onNavigate={onNavigate}
      views={['month', 'week', 'day', 'agenda']}
      style={{ height: '100%' }}
      eventPropGetter={(event) => ({
        style: {
          backgroundColor: getServiceColor(event.service),
          borderRadius: '4px',
          opacity: 0.9,
          color: 'white',
          border: 'none',
          fontSize: '0.8em',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }
      })}
    />
  );
};

// Helper function for service colors
const getServiceColor = (serviceName) => {
  const colors = {
    'Exterior Detail': '#3b82f6',
    'Interior Detail': '#8b5cf6',
    'Full Detail': '#10b981',
    'Ceramic Coating': '#f59e0b'
  };
  return colors[serviceName] || '#4f46e5';
};

export default AdminCalendar;