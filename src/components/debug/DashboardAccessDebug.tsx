import React from 'react';
import { CheckCircle, XCircle, AlertCircle, User, Database, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

const DashboardAccessDebug: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { user: supabaseUser, profile, session } = useSupabaseAuth();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Shield className="w-5 h-5 mr-2 text-blue-500" />
        Dashboard Access Debug Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Authentication Status */}
        <div className={`border rounded-lg p-4 ${
          isAuthenticated 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center mb-2">
            {isAuthenticated ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
            )}
            <span className={`font-medium ${
              isAuthenticated ? 'text-green-700' : 'text-red-700'
            }`}>
              Authentication
            </span>
          </div>
          <div className="text-sm space-y-1">
            <div><span className="font-medium">Status:</span> {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
            <div><span className="font-medium">Loading:</span> {loading ? 'Yes' : 'No'}</div>
            <div><span className="font-medium">User Object:</span> {user ? 'Available' : 'Missing'}</div>
          </div>
        </div>

        {/* Supabase Session */}
        <div className={`border rounded-lg p-4 ${
          session 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center mb-2">
            <Database className="w-5 h-5 text-blue-500 mr-2" />
            <span className="font-medium text-gray-700">Supabase Session</span>
          </div>
          <div className="text-sm space-y-1">
            <div><span className="font-medium">Session:</span> {session ? 'Active' : 'None'}</div>
            <div><span className="font-medium">User ID:</span> {supabaseUser?.id ? 'Available' : 'Missing'}</div>
            <div><span className="font-medium">Email:</span> {supabaseUser?.email || 'Not available'}</div>
            <div><span className="font-medium">Email Confirmed:</span> {supabaseUser?.email_confirmed_at ? 'Yes' : 'No'}</div>
          </div>
        </div>

        {/* Profile Status */}
        <div className={`border rounded-lg p-4 ${
          profile 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center mb-2">
            <User className="w-5 h-5 text-purple-500 mr-2" />
            <span className="font-medium text-gray-700">User Profile</span>
          </div>
          <div className="text-sm space-y-1">
            <div><span className="font-medium">Profile:</span> {profile ? 'Loaded' : 'Missing'}</div>
            <div><span className="font-medium">Name:</span> {profile?.full_name || user?.name || 'Not available'}</div>
            <div><span className="font-medium">Role:</span> {profile?.role || user?.role || 'Not available'}</div>
            <div><span className="font-medium">Active:</span> {profile?.is_active ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>

      {/* Dashboard Access Status */}
      <div className={`mt-4 border rounded-lg p-4 ${
        isAuthenticated
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center mb-2">
          <Shield className="w-5 h-5 text-gray-500 mr-2" />
          <span className="font-medium text-gray-700">Dashboard Access Status</span>
        </div>
        <div className="text-sm">
          {isAuthenticated ? (
            <div className="text-green-700">
              ✅ <strong>Dashboard Access Granted</strong> - User can access all dashboard features
            </div>
          ) : (
            <div className="text-red-700">
              ❌ <strong>Dashboard Access Denied</strong> - {
                loading ? 'Authentication is loading...' : 
                !supabaseUser ? 'No Supabase user session' :
                !user ? 'User object not created' :
                'Unknown authentication issue'
              }
            </div>
          )}
        </div>
      </div>

      {/* Troubleshooting Tips */}
      {!isAuthenticated && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-5 h-5 text-blue-500 mr-2" />
            <span className="font-medium text-blue-700">Troubleshooting Tips</span>
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            {!session && <div>• No Supabase session - Try logging in again</div>}
            {session && !supabaseUser && <div>• Session exists but no user - Check authentication flow</div>}
            {supabaseUser && !profile && <div>• User exists but no profile - Profile creation may have failed</div>}
            {loading && <div>• Authentication is still loading - Please wait</div>}
          </div>
        </div>
      )}

      {/* Raw Data (for debugging) */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
          Show Raw Debug Data
        </summary>
        <div className="mt-2 bg-gray-50 border border-gray-200 rounded p-3">
          <pre className="text-xs text-gray-600 overflow-auto">
            {JSON.stringify({
              useAuth: {
                user: !!user,
                isAuthenticated,
                loading,
                userRole: user?.role,
                userName: user?.name,
              },
              useSupabaseAuth: {
                user: !!supabaseUser,
                userId: supabaseUser?.id,
                userEmail: supabaseUser?.email,
                emailConfirmed: !!supabaseUser?.email_confirmed_at,
                profile: !!profile,
                profileRole: profile?.role,
                profileName: profile?.full_name,
                session: !!session,
              }
            }, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  );
};

export default DashboardAccessDebug;
