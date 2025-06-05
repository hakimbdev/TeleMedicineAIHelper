import { Video, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Appointment } from '../../../types';
import { formatDate } from '../../../lib/utils';

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}

const UpcomingAppointments = ({ appointments }: UpcomingAppointmentsProps) => {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-6">
        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No upcoming appointments</h3>
        <p className="text-gray-500 mb-4">You don't have any scheduled appointments yet.</p>
        <Link 
          to="/appointments" 
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Schedule Now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div 
          key={appointment.id} 
          className="flex flex-col md:flex-row md:items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-primary-100 rounded-full mb-3 md:mb-0 md:mr-4">
            <Video className="h-5 w-5 text-primary-600" />
          </div>
          
          <div className="flex-grow">
            <h3 className="font-medium text-gray-900">{appointment.doctorName}</h3>
            <div className="flex flex-wrap gap-x-4 mt-1 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(appointment.date)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{appointment.time} ({appointment.duration} min)</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 md:mt-0 md:ml-4 flex flex-shrink-0 flex-col sm:flex-row gap-2">
            <Link
              to={`/consultation/${appointment.id}`}
              className="text-center px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
            >
              Join
            </Link>
            <Link
              to={`/appointments/${appointment.id}`}
              className="text-center px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
            >
              Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UpcomingAppointments;