import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const BookingCalendar = ({ 
  blackoutDates, 
  onDateSelect,
  selectedDate
}) => {
  return (
    <Calendar
      localizer={localizer}
      
      startAccessor="start"
      endAccessor="end"
      selectable
      onSelectSlot={(slotInfo) => onDateSelect(slotInfo.start)}
      defaultView="month"
      views={['month']}
      dayPropGetter={(date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Disable past dates
        if (date < today) {
          return {
            className: 'rbc-disabled-date',
            style: {
              backgroundColor: 'rgba(255, 107, 107, 0.2)',
            }
          };
        }
        
        // Style blackout dates
        const isBlackout = blackoutDates.some(blackoutDate => 
          moment(blackoutDate).isSame(date, 'day')
        );
        
        if (isBlackout) {
          return {
            className: 'rbc-blackout-date',
            style: {
              backgroundColor: 'rgba(255, 165, 0, 0.2)',
            }
          };
        }
        
        // Highlight selected date
        if (selectedDate && moment(date).isSame(selectedDate, 'day')) {
          return {
            style: {
              backgroundColor: 'rgba(0, 123, 255, 0.1)',
              border: '1px solid rgba(211, 211, 211, 0.5)'
            }
          };
        }
        
        return {};
      }}
      style={{ height: 400 }}
    />
  );
};

export default BookingCalendar;