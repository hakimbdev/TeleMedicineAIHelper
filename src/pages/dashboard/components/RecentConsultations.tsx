import { Video, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data
const recentConsultations = [
  {
    id: '1',
    doctorName: 'Dr. Jane Smith',
    doctorSpecialty: 'Cardiology',
    date: '2023-05-20',
    time: '10:00 AM',
    duration: 30,
    status: 'completed',
  },
  {
    id: '2',
    doctorName: 'Dr. Robert Chen',
    doctorSpecialty: 'General Medicine',
    date: '2023-05-15',
    time: '2:30 PM',
    duration: 45,
    status: 'completed',
  },
];

const RecentConsultations = () => {
  if (recentConsultations.length === 0) {
    return (
      <div className="text-center py-6">
        <Video className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900">No recent consultations</h3>
        <p className="text-gray-500">Your past consultations will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentConsultations.map((consultation) => (
        <Link
          key={consultation.id}
          to={`/consultation/${consultation.id}`}
          className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center mb-2">
            <Video className="h-5 w-5 text-primary-500 mr-2" />
            <h3 className="font-medium text-gray-900">{consultation.doctorName}</h3>
            <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
              {consultation.doctorSpecialty}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{new Date(consultation.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{consultation.time} ({consultation.duration} min)</span>
            </div>
          </div>
          
          <div className="mt-2 flex justify-between items-center">
            <span className="text-xs bg-success-100 text-success-800 px-2 py-0.5 rounded-full">
              Completed
            </span>
            <span className="text-sm text-primary-600">View details</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RecentConsultations;