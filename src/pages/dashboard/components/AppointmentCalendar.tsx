import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';

// Mock appointment data for today
const todayAppointments = [
  {
    id: '1',
    patientName: 'John Doe',
    time: '9:00 AM',
    duration: 30,
    type: 'video',
    status: 'upcoming',
  },
  {
    id: '2',
    patientName: 'Sarah Johnson',
    time: '10:30 AM',
    duration: 45,
    type: 'video',
    status: 'upcoming',
  },
  {
    id: '3',
    patientName: 'Michael Brown',
    time: '1:00 PM',
    duration: 30,
    type: 'video',
    status: 'upcoming',
  },
  {
    id: '4',
    patientName: 'Emily Wilson',
    time: '3:30 PM',
    duration: 60,
    type: 'video',
    status: 'upcoming',
  },
];

const AppointmentCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevDay = () => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setCurrentDate(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevDay}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        
        <h3 className="text-lg font-medium text-gray-900">
          {formatDate(currentDate)}
          {isToday(currentDate) && (
            <span className="ml-2 text-xs bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full">
              Today
            </span>
          )}
        </h3>
        
        <button
          onClick={handleNextDay}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      
      {isToday(currentDate) && todayAppointments.length > 0 ? (
        <div className="space-y-3">
          {todayAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-16 text-center">
                <div className="text-sm font-medium text-gray-900">{appointment.time}</div>
                <div className="text-xs text-gray-500">{appointment.duration} min</div>
              </div>
              
              <div className="ml-4 flex-grow">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm font-medium text-gray-900">{appointment.patientName}</span>
                </div>
                <div className="text-xs text-gray-500 flex items-center mt-0.5">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{appointment.type} consultation</span>
                </div>
              </div>
              
              <div className="ml-4">
                <button className="px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors">
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No appointments</h3>
          <p className="text-gray-500">
            {isToday(currentDate)
              ? "You don't have any appointments scheduled for today."
              : "No appointments scheduled for this day."}
          </p>
        </div>
      )}
    </div>
  );
};

// Calendar icon component
const Calendar = (props: any) => (
  <svg
    {...props}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default AppointmentCalendar;