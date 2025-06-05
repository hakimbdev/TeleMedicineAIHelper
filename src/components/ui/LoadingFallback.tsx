import React from 'react';
import { Loader, AlertCircle } from 'lucide-react';

interface LoadingFallbackProps {
  message?: string;
  timeout?: boolean;
  onForceLoad?: () => void;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = "Loading...",
  timeout = false,
  onForceLoad
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        {!timeout ? (
          <>
            <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              TeleMedicine AI Helper
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Loading Taking Longer Than Expected
            </h2>
            <p className="text-gray-600 mb-4">
              The app is taking longer to load than usual. This might be due to network issues.
            </p>
            <div className="space-y-3">
              {onForceLoad && (
                <button
                  onClick={onForceLoad}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Continue Anyway
                </button>
              )}
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
              >
                Go to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoadingFallback;
