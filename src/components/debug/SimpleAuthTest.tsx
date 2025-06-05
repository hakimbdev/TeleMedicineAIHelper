import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, User, Database } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { troubleshootAuth, forceDashboardNavigation, clearAuthAndRedirect } from '../../utils/authHelper';

const SimpleAuthTest: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { user: supabaseUser, session } = useSupabaseAuth();

  const getStatusIcon = (status: boolean | null) => {
    if (status === true) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === false) return <XCircle className="w-5 h-5 text-red-500" />;
    return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusColor = (status: boolean | null) => {
    if (status === true) return 'bg-green-50 border-green-200 text-green-800';
    if (status === false) return 'bg-red-50 border-red-200 text-red-800';
    return 'bg-yellow-50 border-yellow-200 text-yellow-800';
  };

  return (
    <div className="bg-white border-2 border-blue-200 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        🔍 Authentication Status Check
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Supabase Authentication */}
        <div className={`border rounded-lg p-4 ${getStatusColor(!!supabaseUser)}`}>
          <div className="flex items-center mb-2">
            {getStatusIcon(!!supabaseUser)}
            <span className="ml-2 font-semibold">Supabase Authentication</span>
          </div>
          <div className="text-sm space-y-1">
            <div><strong>User:</strong> {supabaseUser ? '✅ Logged In' : '❌ Not Logged In'}</div>
            <div><strong>Session:</strong> {session ? '✅ Active' : '❌ None'}</div>
            <div><strong>User ID:</strong> {supabaseUser?.id || 'None'}</div>
            <div><strong>Email:</strong> {supabaseUser?.email || 'None'}</div>
          </div>
        </div>

        {/* App Authentication */}
        <div className={`border rounded-lg p-4 ${getStatusColor(isAuthenticated)}`}>
          <div className="flex items-center mb-2">
            {getStatusIcon(isAuthenticated)}
            <span className="ml-2 font-semibold">App Authentication</span>
          </div>
          <div className="text-sm space-y-1">
            <div><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
            <div><strong>Loading:</strong> {loading ? '⏳ Yes' : '✅ No'}</div>
            <div><strong>User Object:</strong> {user ? '✅ Available' : '❌ Missing'}</div>
            <div><strong>User Role:</strong> {user?.role || 'None'}</div>
          </div>
        </div>
      </div>

      {/* Dashboard Access Status */}
      <div className={`border-2 rounded-lg p-4 ${
        isAuthenticated 
          ? 'bg-green-50 border-green-300 text-green-800' 
          : 'bg-red-50 border-red-300 text-red-800'
      }`}>
        <div className="flex items-center mb-2">
          {isAuthenticated ? (
            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600 mr-2" />
          )}
          <span className="text-lg font-bold">
            Dashboard Access: {isAuthenticated ? 'GRANTED ✅' : 'DENIED ❌'}
          </span>
        </div>
        
        {isAuthenticated ? (
          <div className="text-sm">
            🎉 <strong>Success!</strong> You have full access to the dashboard and all features.
          </div>
        ) : (
          <div className="text-sm">
            <strong>Issue:</strong> {
              loading ? 'Authentication is still loading...' :
              !supabaseUser ? 'No Supabase user session found' :
              !user ? 'User object not created from Supabase data' :
              'Unknown authentication issue'
            }
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          🔄 Refresh Page
        </button>
        
        <button
          onClick={clearAuthAndRedirect}
          className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
        >
          🚪 Clear & Logout
        </button>

        <button
          onClick={() => troubleshootAuth()}
          className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
        >
          🐛 Full Troubleshoot
        </button>

        {isAuthenticated && (
          <button
            onClick={forceDashboardNavigation}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
          >
            🎯 Force Dashboard
          </button>
        )}
      </div>

      {/* Troubleshooting Tips */}
      {!isAuthenticated && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-semibold text-blue-800 mb-2">🔧 Troubleshooting Tips:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Try refreshing the page</li>
            <li>• Check browser console for error messages</li>
            <li>• Try logging out and logging back in</li>
            <li>• Clear browser cache and cookies</li>
            <li>• Try using a demo account</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SimpleAuthTest;
