import React, { useState } from 'react';
import { Mail, RefreshCw, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

interface EmailVerificationHelperProps {
  email: string;
  onClose?: () => void;
  onSkip?: () => void;
  showSkipOption?: boolean;
}

const EmailVerificationHelper: React.FC<EmailVerificationHelperProps> = ({
  email,
  onClose,
  onSkip,
  showSkipOption = true,
}) => {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { resendVerificationEmail } = useSupabaseAuth();

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage(null);
    
    try {
      const result = await resendVerificationEmail(email);
      setResendSuccess(result.success);
      setResendMessage(result.message);
    } catch (error) {
      setResendSuccess(false);
      setResendMessage('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Email Verification</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Check Your Email
          </h4>
          
          <p className="text-gray-600 text-sm mb-4">
            We've sent a verification link to:
          </p>
          
          <p className="font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-md text-sm">
            {email}
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h5 className="font-medium text-blue-900 mb-2">What to do next:</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Check your email inbox</li>
              <li>• Look in your spam/junk folder</li>
              <li>• Click the verification link in the email</li>
              <li>• Return here to sign in</li>
            </ul>
          </div>

          {resendMessage && (
            <div className={`border rounded-md p-3 ${
              resendSuccess 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center">
                {resendSuccess ? (
                  <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                )}
                <span className="text-sm">{resendMessage}</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full flex items-center justify-center py-2 px-4 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </button>

            {showSkipOption && onSkip && (
              <button
                onClick={onSkip}
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Skip for Now (Continue to Sign In)
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-2 px-4 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              I'll verify later
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Having trouble? Contact support at{' '}
            <a href="mailto:support@telemedicine.demo" className="text-blue-600 hover:text-blue-500">
              support@telemedicine.demo
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationHelper;
