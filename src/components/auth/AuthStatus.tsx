import React from 'react';
import { CheckCircle, XCircle, Loader, User, Shield, Database } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

const AuthStatus: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { user: supabaseUser, profile, session } = useSupabaseAuth();

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Loader className="w-5 h-5 text-blue-500 animate-spin" />
          <span className="text-blue-700">Checking authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Authentication Status */}
      <div className={`border rounded-lg p-4 ${
        isAuthenticated 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <span className={`font-medium ${
            isAuthenticated ? 'text-green-700' : 'text-red-700'
          }`}>
            {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </span>
        </div>
      </div>

      {/* User Information */}
      {isAuthenticated && user && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <User className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">User Information</span>
          </div>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Name:</span> {user.name}</div>
            <div><span className="font-medium">Email:</span> {user.email}</div>
            <div><span className="font-medium">Role:</span> {user.role}</div>
            {user.specialization && (
              <div><span className="font-medium">Specialization:</span> {user.specialization}</div>
            )}
          </div>
        </div>
      )}

      {/* Supabase Session Status */}
      <div className={`border rounded-lg p-4 ${
        session 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center space-x-2 mb-2">
          <Database className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700">Supabase Session</span>
        </div>
        <div className="text-sm space-y-1">
          <div><span className="font-medium">Session:</span> {session ? 'Active' : 'None'}</div>
          <div><span className="font-medium">User ID:</span> {supabaseUser?.id || 'None'}</div>
          <div><span className="font-medium">Email Confirmed:</span> {supabaseUser?.email_confirmed_at ? 'Yes' : 'No'}</div>
          <div><span className="font-medium">Profile:</span> {profile ? 'Loaded' : 'Missing'}</div>
        </div>
      </div>

      {/* Dashboard Access Status */}
      <div className={`border rounded-lg p-4 ${
        isAuthenticated && profile
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700">Dashboard Access</span>
        </div>
        <div className="mt-2 text-sm">
          {isAuthenticated && profile ? (
            <span className="text-green-700">✅ Full access granted</span>
          ) : (
            <span className="text-red-700">❌ Access denied - {!isAuthenticated ? 'Not authenticated' : 'Profile missing'}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthStatus;
