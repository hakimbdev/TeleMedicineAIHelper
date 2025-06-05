import { useState } from 'react';
import { Calendar, Clock, Video, User, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Appointment } from '../../types';

const AppointmentsPage = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'upcoming' | 'past'>('upcoming');

  // Mock appointments data
  const appointments: Appointment[] = [
    {
      id: '1',
      patientId: '1',
      patientName: 'John Doe',
      doctorId: '2',
      doctorName: 'Dr. Jane Smith',
      date: '2023-05-25',
      time: '10:00 AM',
      duration: 30,
      status: 'scheduled',
      type: 'video',
      notes: 'Follow-up appointment',
    },
    {
      id: '2',
      patientId: '1',
      patientName: 'Sarah Johnson',
      doctorId: '2',
      doctorName: 'Dr. Michael Chen',
      date: '2023-05-28',
      time: '2:30 PM',
      duration: 45,
      status: 'scheduled',
      type: 'video',
      notes: 'Initial consultation',
    },
  ];

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-600 mt-1">Manage your healthcare appointments</p>
      </div>

      <div className="bg-white rounded-xl shadow-card p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setView('upcoming')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'upcoming'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setView('past')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'past'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Past
            </button>
          </div>

          <button
            onClick={() => {/* Handle new appointment */}}
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors flex items-center"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Book Appointment
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          
          <h2 className="text-lg font-medium text-gray-900">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </h2>
          
          <button
            onClick={handleNextDay}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Video className="h-5 w-5 text-primary-600" />
              </div>
              
              <div className="ml-4 flex-grow">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="font-medium text-gray-900">
                    {user?.role === 'patient' ? appointment.doctorName : appointment.patientName}
                  </span>
                </div>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{appointment.time} ({appointment.duration} min)</span>
                </div>
              </div>
              
              <div className="ml-4 flex items-center space-x-2">
                <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors">
                  Join
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
                  Details
                </button>
              </div>
            </div>
          ))}

          {appointments.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No appointments</h3>
              <p className="text-gray-500">
                {view === 'upcoming'
                  ? "You don't have any upcoming appointments."
                  : "You don't have any past appointments."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;