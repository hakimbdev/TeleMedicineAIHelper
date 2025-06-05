import { Users, CalendarCheck, Clock, Video } from 'lucide-react';

const DoctorStats = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-primary-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
            <Users className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Patients</h3>
            <p className="text-2xl font-bold text-primary-700">42</p>
          </div>
        </div>
        <div className="text-xs text-primary-600 bg-primary-100 rounded-full px-2 py-0.5 inline-flex items-center">
          <span className="mr-1">↑</span> 12% this month
        </div>
      </div>
      
      <div className="bg-secondary-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center mr-3">
            <CalendarCheck className="h-5 w-5 text-secondary-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Appointments</h3>
            <p className="text-2xl font-bold text-secondary-700">16</p>
          </div>
        </div>
        <div className="text-xs text-secondary-600 bg-secondary-100 rounded-full px-2 py-0.5 inline-flex items-center">
          This week
        </div>
      </div>
      
      <div className="bg-accent-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center mr-3">
            <Video className="h-5 w-5 text-accent-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Consultations</h3>
            <p className="text-2xl font-bold text-accent-700">128</p>
          </div>
        </div>
        <div className="text-xs text-accent-600 bg-accent-100 rounded-full px-2 py-0.5 inline-flex items-center">
          Total completed
        </div>
      </div>
      
      <div className="bg-success-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center mr-3">
            <Clock className="h-5 w-5 text-success-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Hours</h3>
            <p className="text-2xl font-bold text-success-700">24.5</p>
          </div>
        </div>
        <div className="text-xs text-success-600 bg-success-100 rounded-full px-2 py-0.5 inline-flex items-center">
          This month
        </div>
      </div>
    </div>
  );
};

export default DoctorStats;