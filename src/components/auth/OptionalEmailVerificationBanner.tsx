import React, { useState } from 'react';
import { Mail, X, CheckCircle } from 'lucide-react';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

interface OptionalEmailVerificationBannerProps {
  userEmail: string;
  onDismiss?: () => void;
}

const OptionalEmailVerificationBanner: React.FC<OptionalEmailVerificationBannerProps> = ({
  userEmail,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const { resendVerificationEmail } = useSupabaseAuth();

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage(null);
    
    try {
      const result = await resendVerificationEmail(userEmail);
      setResendMessage(result.success ? 'Verification email sent!' : 'Failed to send email');
    } catch (error) {
      setResendMessage('Failed to send email');
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <Mail className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-blue-900 mb-1">
            Email Verification (Optional)
          </h4>
          <p className="text-sm text-blue-700 mb-3">
            You can verify your email address to secure your account and receive important notifications.
            This is optional and won't affect your access to the dashboard.
          </p>
          
          {resendMessage && (
            <div className="mb-3 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-700">{resendMessage}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Send Verification Email'}
            </button>
            <span className="text-sm text-blue-500">•</span>
            <button
              onClick={handleDismiss}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Maybe Later
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-blue-400 hover:text-blue-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default OptionalEmailVerificationBanner;
