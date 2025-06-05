import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { supabase } from '../../config/supabase';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { signIn } = useSupabaseAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Use Supabase auth directly for better error messages
      const result = await signIn({ email, password });
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-card">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your TeleMed<span className="text-accent-400">AI</span> account
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                onClick={async () => {
                  const email = prompt('Enter your email address to reset your password:');
                  if (email) {
                    try {
                      const { error } = await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: `${window.location.origin}/auth/verify`,
                      });
                      if (error) {
                        alert('Error: ' + error.message);
                      } else {
                        alert('Password reset email sent! Check your inbox.');
                      }
                    } catch (error) {
                      alert('Failed to send reset email. Please try again.');
                    }
                  }
                }}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Sign up
            </Link>
          </p>
        </div>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={async () => {
                setEmail('patient@telemedicine.demo');
                setPassword('demo123456');
                // Auto-create demo account if it doesn't exist
                try {
                  await signIn({ email: 'patient@telemedicine.demo', password: 'demo123456' });
                } catch (error) {
                  // If login fails, create the demo account
                  try {
                    await signUp({
                      email: 'patient@telemedicine.demo',
                      password: 'demo123456',
                      fullName: 'Demo Patient',
                      role: 'patient',
                    });
                  } catch (createError) {
                    console.log('Demo account creation failed:', createError);
                  }
                }
              }}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Patient Demo
            </button>
            <button
              type="button"
              onClick={async () => {
                setEmail('doctor@telemedicine.demo');
                setPassword('demo123456');
                // Auto-create demo account if it doesn't exist
                try {
                  await signIn({ email: 'doctor@telemedicine.demo', password: 'demo123456' });
                } catch (error) {
                  // If login fails, create the demo account
                  try {
                    await signUp({
                      email: 'doctor@telemedicine.demo',
                      password: 'demo123456',
                      fullName: 'Dr. Demo Doctor',
                      role: 'doctor',
                      specialization: 'General Medicine',
                      medicalLicense: 'DEMO123456',
                    });
                  } catch (createError) {
                    console.log('Demo account creation failed:', createError);
                  }
                }
              }}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Doctor Demo
            </button>
            <button
              type="button"
              onClick={async () => {
                setEmail('admin@telemedicine.demo');
                setPassword('demo123456');
                // Auto-create demo account if it doesn't exist
                try {
                  await signIn({ email: 'admin@telemedicine.demo', password: 'demo123456' });
                } catch (error) {
                  // If login fails, create the demo account
                  try {
                    await signUp({
                      email: 'admin@telemedicine.demo',
                      password: 'demo123456',
                      fullName: 'Demo Administrator',
                      role: 'admin',
                    });
                  } catch (createError) {
                    console.log('Demo account creation failed:', createError);
                  }
                }
              }}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Admin Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;