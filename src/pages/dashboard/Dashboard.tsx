import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Video, MessageSquare, ArrowRight, FileText, Stethoscope } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Appointment, Notification } from '../../types';
import { formatDate } from '../../lib/utils';
import UpcomingAppointments from './components/UpcomingAppointments';
import RecentConsultations from './components/RecentConsultations';
import HealthMetrics from './components/HealthMetrics';
import AiAssistant from './components/AiAssistant';
import NotificationsList from './components/NotificationsList';
import DoctorStats from './components/DoctorStats';
import PatientsList from './components/PatientsList';
import AppointmentCalendar from './components/AppointmentCalendar';
import AdminStats from './components/AdminStats';

// Mock data
const mockAppointments: Appointment[] = [
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
    notes: 'Follow-up appointment for heart condition',
  },
  {
    id: '2',
    patientId: '1',
    patientName: 'John Doe',
    doctorId: '2',
    doctorName: 'Dr. Jane Smith',
    date: '2023-05-28',
    time: '2:30 PM',
    duration: 45,
    status: 'scheduled',
    type: 'video',
    notes: 'Discuss lab results',
  },
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    title: 'Appointment Reminder',
    message: 'Your appointment with Dr. Jane Smith is tomorrow at 10:00 AM.',
    type: 'appointment',
    read: false,
    date: '2023-05-24T08:00:00Z',
    link: '/appointments/1',
  },
  {
    id: '2',
    userId: '1',
    title: 'New Message',
    message: 'Dr. Jane Smith sent you a message regarding your prescription.',
    type: 'message',
    read: true,
    date: '2023-05-23T14:30:00Z',
    link: '/messages/1',
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    // Simulate API calls to fetch data
    setUpcomingAppointments(mockAppointments);
    setNotifications(mockNotifications);
  }, []);

  return (
    <div className="pb-10 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your healthcare dashboard
        </p>
      </div>

      {user?.role === 'patient' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow-card col-span-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/appointments"
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mb-2">
                  <Calendar className="h-5 w-5 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Book Appointment</span>
              </Link>
              
              <Link
                to="/consultation/new"
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center mb-2">
                  <Video className="h-5 w-5 text-accent-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Start Consultation</span>
              </Link>
              
              <Link
                to="/chatbot"
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center mb-2">
                  <MessageSquare className="h-5 w-5 text-secondary-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">AI Assistant</span>
              </Link>
              
              <Link
                to="/medical-records"
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center mb-2">
                  <FileText className="h-5 w-5 text-success-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">View Records</span>
              </Link>
            </div>
          </div>
          
          {/* Upcoming Appointments */}
          <div className="bg-white p-6 rounded-xl shadow-card lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
              <Link to="/appointments" className="text-sm text-primary-600 flex items-center hover:text-primary-700">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <UpcomingAppointments appointments={upcomingAppointments} />
          </div>
          
          {/* Notifications */}
          <div className="bg-white p-6 rounded-xl shadow-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <Link to="/notifications" className="text-sm text-primary-600 flex items-center hover:text-primary-700">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <NotificationsList notifications={notifications} />
          </div>
          
          {/* Recent Consultations */}
          <div className="bg-white p-6 rounded-xl shadow-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Consultations</h2>
              <Link to="/consultations" className="text-sm text-primary-600 flex items-center hover:text-primary-700">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <RecentConsultations />
          </div>
          
          {/* Health Metrics */}
          <div className="bg-white p-6 rounded-xl shadow-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Health Metrics</h2>
              <Link to="/health-metrics" className="text-sm text-primary-600 flex items-center hover:text-primary-700">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <HealthMetrics />
          </div>
          
          {/* AI Assistant */}
          <div className="bg-white p-6 rounded-xl shadow-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">AI Health Assistant</h2>
              <Link to="/chatbot" className="text-sm text-primary-600 flex items-center hover:text-primary-700">
                Open chat <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <AiAssistant />
          </div>
        </div>
      )}

      {user?.role === 'doctor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Doctor Stats */}
          <div className="bg-white p-6 rounded-xl shadow-card col-span-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
            <DoctorStats />
          </div>
          
          {/* Today's Schedule */}
          <div className="bg-white p-6 rounded-xl shadow-card lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="mr-1 h-4 w-4" />
                <span>{formatDate(new Date())}</span>
              </div>
            </div>
            <AppointmentCalendar />
          </div>
          
          {/* Notifications */}
          <div className="bg-white p-6 rounded-xl shadow-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <Link to="/notifications" className="text-sm text-primary-600 flex items-center hover:text-primary-700">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <NotificationsList notifications={notifications} />
          </div>
          
          {/* Recent Patients */}
          <div className="bg-white p-6 rounded-xl shadow-card lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Patients</h2>
              <Link to="/patients" className="text-sm text-primary-600 flex items-center hover:text-primary-700">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <PatientsList />
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4">
              <Link
                to="/consultation/new"
                className="flex items-center p-4 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                  <Video className="h-5 w-5 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-primary-700">Start Consultation</span>
              </Link>
              
              <Link
                to="/prescriptions/new"
                className="flex items-center p-4 rounded-lg bg-secondary-50 hover:bg-secondary-100 transition-colors"
              >
                <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center mr-4">
                  <Stethoscope className="h-5 w-5 text-secondary-600" />
                </div>
                <span className="text-sm font-medium text-secondary-700">Write Prescription</span>
              </Link>
              
              <Link
                to="/medical-records/upload"
                className="flex items-center p-4 rounded-lg bg-success-50 hover:bg-success-100 transition-colors"
              >
                <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center mr-4">
                  <FileText className="h-5 w-5 text-success-600" />
                </div>
                <span className="text-sm font-medium text-success-700">Upload Records</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Admin Stats */}
          <div className="bg-white p-6 rounded-xl shadow-card col-span-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h2>
            <AdminStats />
          </div>
          
          {/* Other admin dashboard components */}
          <div className="bg-white p-6 rounded-xl shadow-card lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Registrations</h2>
              <Link to="/admin/users" className="text-sm text-primary-600 flex items-center hover:text-primary-700">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            {/* Recent Users component would go here */}
            <div className="text-gray-500">Recent user registrations will appear here</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">System Notifications</h2>
              <Link to="/admin/notifications" className="text-sm text-primary-600 flex items-center hover:text-primary-700">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <NotificationsList notifications={notifications} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;