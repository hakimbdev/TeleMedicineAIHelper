import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader, Mail, ArrowRight } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useSupabaseAuth();
  
  const [verificationState, setVerificationState] = useState<{
    status: 'loading' | 'success' | 'error' | 'already_verified';
    message: string;
  }>({
    status: 'loading',
    message: 'Verifying your email address...',
  });

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Get the token and type from URL parameters
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');

        console.log('Verification params:', { token, type, accessToken, refreshToken });

        // Handle different verification types
        if (type === 'signup' || type === 'email_confirmation') {
          if (accessToken && refreshToken) {
            // Set the session with the tokens from the URL
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              console.error('Session error:', error);
              setVerificationState({
                status: 'error',
                message: 'Failed to verify email. Please try again or contact support.',
              });
              return;
            }

            if (data.user) {
              setVerificationState({
                status: 'success',
                message: 'Email verified successfully! Welcome to TeleMedicine AI Helper.',
              });

              // Redirect to dashboard after 3 seconds
              setTimeout(() => {
                navigate('/dashboard');
              }, 3000);
            }
          } else if (token) {
            // Handle token-based verification
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: token,
              type: 'email',
            });

            if (error) {
              console.error('Verification error:', error);
              setVerificationState({
                status: 'error',
                message: 'Invalid or expired verification link. Please request a new one.',
              });
              return;
            }

            if (data.user) {
              setVerificationState({
                status: 'success',
                message: 'Email verified successfully! Welcome to TeleMedicine AI Helper.',
              });

              // Redirect to dashboard after 3 seconds
              setTimeout(() => {
                navigate('/dashboard');
              }, 3000);
            }
          } else {
            setVerificationState({
              status: 'error',
              message: 'Invalid verification link. Please check your email for the correct link.',
            });
          }
        } else if (type === 'recovery' || type === 'password_recovery') {
          // Handle password recovery
          navigate('/reset-password', { 
            state: { 
              accessToken, 
              refreshToken 
            } 
          });
        } else {
          // Check if user is already verified
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          
          if (currentUser && currentUser.email_confirmed_at) {
            setVerificationState({
              status: 'already_verified',
              message: 'Your email is already verified. You can now use all features.',
            });

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          } else {
            setVerificationState({
              status: 'error',
              message: 'Invalid verification link. Please check your email for the correct link.',
            });
          }
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationState({
          status: 'error',
          message: 'An unexpected error occurred. Please try again.',
        });
      }
    };

    handleEmailVerification();
  }, [searchParams, navigate]);

  const handleResendVerification = async () => {
    try {
      if (user?.email) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: user.email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/verify`,
          },
        });

        if (error) {
          console.error('Resend error:', error);
        } else {
          setVerificationState({
            status: 'loading',
            message: 'Verification email sent! Please check your inbox.',
          });
        }
      }
    } catch (error) {
      console.error('Resend verification error:', error);
    }
  };

  const getStatusIcon = () => {
    switch (verificationState.status) {
      case 'loading':
        return <Loader className="w-12 h-12 text-blue-500 animate-spin" />;
      case 'success':
      case 'already_verified':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      default:
        return <Mail className="w-12 h-12 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (verificationState.status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
      case 'already_verified':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getBackgroundColor = () => {
    switch (verificationState.status) {
      case 'loading':
        return 'bg-blue-50 border-blue-200';
      case 'success':
      case 'already_verified':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            TeleMed<span className="text-blue-600">AI</span> Helper
          </p>
        </div>

        <div className={`rounded-lg border-2 p-8 text-center ${getBackgroundColor()}`}>
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>

          <h3 className={`text-lg font-medium mb-2 ${getStatusColor()}`}>
            {verificationState.status === 'loading' && 'Verifying Email...'}
            {verificationState.status === 'success' && 'Email Verified!'}
            {verificationState.status === 'already_verified' && 'Already Verified!'}
            {verificationState.status === 'error' && 'Verification Failed'}
          </h3>

          <p className="text-gray-700 mb-6">
            {verificationState.message}
          </p>

          {verificationState.status === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <span>Redirecting to dashboard</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Go to Dashboard Now
              </button>
            </div>
          )}

          {verificationState.status === 'already_verified' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <span>Redirecting to dashboard</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {verificationState.status === 'error' && (
            <div className="space-y-4">
              <button
                onClick={handleResendVerification}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Resend Verification Email
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Login
              </button>
            </div>
          )}

          {verificationState.status === 'loading' && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Please wait while we verify your email address...
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a href="mailto:support@telemedicine.demo" className="font-medium text-blue-600 hover:text-blue-500">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
