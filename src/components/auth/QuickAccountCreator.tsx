import React, { useState } from 'react';
import { UserPlus, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { useNavigate } from 'react-router-dom';

interface QuickAccountCreatorProps {
  email: string;
  password: string;
  onSuccess?: () => void;
}

const QuickAccountCreator: React.FC<QuickAccountCreatorProps> = ({
  email,
  password,
  onSuccess,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { signUp, signIn } = useSupabaseAuth();
  const navigate = useNavigate();

  const createAndSignIn = async () => {
    setIsCreating(true);
    setMessage(null);

    try {
      // First, try to create the account
      console.log('Creating account for:', email);
      const createResult = await signUp({
        email,
        password,
        fullName: 'New User',
        role: 'patient',
        requireEmailConfirmation: false,
      });

      console.log('Account creation result:', createResult);

      if (createResult.success) {
        setMessage({ type: 'success', text: 'Account created successfully!' });
        
        // Wait a moment then try to sign in
        setTimeout(async () => {
          try {
            const signInResult = await signIn({ email, password });
            console.log('Sign in result:', signInResult);
            
            if (signInResult.success) {
              setMessage({ type: 'success', text: 'Account created and signed in successfully!' });
              onSuccess?.();
              console.log('Quick account creation successful, navigating to dashboard...');
              navigate('/dashboard', { replace: true });
            } else {
              setMessage({ type: 'error', text: 'Account created but sign in failed. Please try signing in manually.' });
            }
          } catch (signInError) {
            console.error('Sign in error:', signInError);
            setMessage({ type: 'error', text: 'Account created but sign in failed. Please try signing in manually.' });
          }
        }, 1000);
      } else {
        setMessage({ type: 'error', text: createResult.message });
      }
    } catch (error: any) {
      console.error('Account creation error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to create account' });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start space-x-3">
        <UserPlus className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-blue-900 mb-1">
            Account Not Found
          </h4>
          <p className="text-sm text-blue-700 mb-3">
            It looks like you don't have an account yet. Would you like to create one with these credentials?
          </p>
          
          {message && (
            <div className={`mb-3 p-2 rounded border ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center space-x-2">
                {message.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="text-sm">{message.text}</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <button
              onClick={createAndSignIn}
              disabled={isCreating}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account & Sign In</span>
                </>
              )}
            </button>
            
            <span className="text-sm text-blue-600">or</span>
            
            <button
              onClick={() => navigate('/register')}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Go to Registration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAccountCreator;
