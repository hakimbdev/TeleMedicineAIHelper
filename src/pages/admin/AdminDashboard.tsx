import { useState, useEffect } from 'react';
import { Users, Calendar, Activity, TrendingUp, UserCheck, Clock, AlertCircle, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AdminStats {
  totalUsers: number;
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  activeConsultations: number;
  pendingApprovals: number;
  systemHealth: 'good' | 'warning' | 'critical';
  revenue: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'appointment_scheduled' | 'consultation_completed' | 'system_alert';
  message: string;
  timestamp: string;
  user?: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Mock admin stats
  const mockStats: AdminStats = {
    totalUsers: 1247,
    totalDoctors: 89,
    totalPatients: 1158,
    totalAppointments: 3456,
    activeConsultations: 12,
    pendingApprovals: 5,
    systemHealth: 'good',
    revenue: 125430,
  };

  // Mock recent activity
  const mockActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'user_registration',
      message: 'New patient registered',
      timestamp: '2023-05-25T10:30:00Z',
      user: 'John Smith',
    },
    {
      id: '2',
      type: 'appointment_scheduled',
      message: 'Appointment scheduled with Dr. Johnson',
      timestamp: '2023-05-25T10:15:00Z',
      user: 'Sarah Wilson',
    },
    {
      id: '3',
      type: 'consultation_completed',
      message: 'Video consultation completed',
      timestamp: '2023-05-25T09:45:00Z',
      user: 'Dr. Michael Chen',
    },
    {
      id: '4',
      type: 'system_alert',
      message: 'Server response time increased',
      timestamp: '2023-05-25T09:30:00Z',
    },
    {
      id: '5',
      type: 'user_registration',
      message: 'New doctor registered',
      timestamp: '2023-05-25T08:20:00Z',
      user: 'Dr. Emily Davis',
    },
  ];

  useEffect(() => {
    // Simulate API calls
    setStats(mockStats);
    setRecentActivity(mockActivity);
  }, [selectedTimeRange]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <UserCheck className="h-5 w-5 text-green-500" />;
      case 'appointment_scheduled':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'consultation_completed':
        return <Activity className="h-5 w-5 text-purple-500" />;
      case 'system_alert':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!stats) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor and manage the TeleMed AI platform</p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {[
            { value: '24h', label: 'Last 24 Hours' },
            { value: '7d', label: 'Last 7 Days' },
            { value: '30d', label: 'Last 30 Days' },
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedTimeRange(range.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTimeRange === range.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Doctors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Consultations</p>
              <p className="text-xl font-bold text-gray-900">{stats.activeConsultations}</p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-xl font-bold text-gray-900">{stats.pendingApprovals}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSystemHealthColor(stats.systemHealth)}`}>
                {stats.systemHealth.charAt(0).toUpperCase() + stats.systemHealth.slice(1)}
              </span>
            </div>
            <Settings className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    {activity.user && (
                      <p className="text-xs text-gray-500">by {activity.user}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatTimestamp(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Users className="h-6 w-6 text-primary-500 mb-2" />
                <p className="text-sm font-medium text-gray-900">Manage Users</p>
                <p className="text-xs text-gray-500">View and edit user accounts</p>
              </button>

              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Calendar className="h-6 w-6 text-green-500 mb-2" />
                <p className="text-sm font-medium text-gray-900">View Appointments</p>
                <p className="text-xs text-gray-500">Monitor all appointments</p>
              </button>

              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Settings className="h-6 w-6 text-blue-500 mb-2" />
                <p className="text-sm font-medium text-gray-900">System Settings</p>
                <p className="text-xs text-gray-500">Configure platform settings</p>
              </button>

              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <TrendingUp className="h-6 w-6 text-purple-500 mb-2" />
                <p className="text-sm font-medium text-gray-900">Analytics</p>
                <p className="text-xs text-gray-500">View detailed reports</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Alerts */}
      {stats.systemHealth !== 'good' && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800">System Alert</h3>
              <p className="text-yellow-700 mt-1">
                {stats.systemHealth === 'warning' 
                  ? 'Some system components are experiencing minor issues. Monitoring in progress.'
                  : 'Critical system issues detected. Immediate attention required.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
