import React, { useState } from 'react';
import { Settings, User, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

const DevelopmentAuthHelper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('test123456');
  const [testName, setTestName] = useState('Test User');
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const { signUp, signIn } = useSupabaseAuth();

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const createTestAccount = async () => {
    setIsCreating(true);
    setMessage(null);
    
    try {
      // Try to create account without email confirmation (optional verification)
      const result = await signUp({
        email: testEmail,
        password: testPassword,
        fullName: testName,
        role: 'patient',
        requireEmailConfirmation: false,
      });
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Test account created! You can now sign in.' });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create test account' });
    } finally {
      setIsCreating(false);
    }
  };

  const signInTestAccount = async () => {
    setIsCreating(true);
    setMessage(null);
    
    try {
      const result = await signIn({
        email: testEmail,
        password: testPassword
      });
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Signed in successfully!' });
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to sign in' });
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Development Auth Helper"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Dev Auth Helper
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-xs text-yellow-700">
            <strong>Development Mode:</strong> This helper bypasses email verification for testing.
          </p>
        </div>

        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {message && (
          <div className={`border rounded-md p-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="w-3 h-3 mr-1 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
              )}
              <span className="text-xs">{message.text}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={createTestAccount}
            disabled={isCreating}
            className="flex items-center justify-center px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
          >
            <User className="w-3 h-3 mr-1" />
            Create
          </button>
          
          <button
            onClick={signInTestAccount}
            disabled={isCreating}
            className="flex items-center justify-center px-3 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
          >
            <Lock className="w-3 h-3 mr-1" />
            Sign In
          </button>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Quick test accounts without email verification
          </p>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentAuthHelper;
