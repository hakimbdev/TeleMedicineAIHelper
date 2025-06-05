import { Users, Activity, Video, MessageSquare } from 'lucide-react';

const AdminStats = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-primary-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
            <Users className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-2xl font-bold text-primary-700">1,248</p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-xs text-primary-600 bg-primary-100 rounded-full px-2 py-0.5 inline-flex items-center">
            <span className="mr-1">↑</span> 8% this month
          </div>
          <div className="text-xs text-gray-500">
            <span className="font-medium">842</span> patients
            <span className="mx-1">·</span>
            <span className="font-medium">406</span> doctors
          </div>
        </div>
      </div>
      
      <div className="bg-accent-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center mr-3">
            <Activity className="h-5 w-5 text-accent-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Platform Activity</h3>
            <p className="text-2xl font-bold text-accent-700">89%</p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-xs text-accent-600 bg-accent-100 rounded-full px-2 py-0.5 inline-flex items-center">
            Active users
          </div>
          <div className="text-xs text-gray-500">
            <span className="font-medium">2.4k</span> actions today
          </div>
        </div>
      </div>
      
      <div className="bg-secondary-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center mr-3">
            <Video className="h-5 w-5 text-secondary-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Consultations</h3>
            <p className="text-2xl font-bold text-secondary-700">3,672</p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-xs text-secondary-600 bg-secondary-100 rounded-full px-2 py-0.5 inline-flex items-center">
            This month
          </div>
          <div className="text-xs text-gray-500">
            <span className="font-medium">128</span> today
          </div>
        </div>
      </div>
      
      <div className="bg-success-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center mr-3">
            <MessageSquare className="h-5 w-5 text-success-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">AI Interactions</h3>
            <p className="text-2xl font-bold text-success-700">12.5k</p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-xs text-success-600 bg-success-100 rounded-full px-2 py-0.5 inline-flex items-center">
            <span className="mr-1">↑</span> 24% increase
          </div>
          <div className="text-xs text-gray-500">
            <span className="font-medium">96%</span> satisfaction
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;