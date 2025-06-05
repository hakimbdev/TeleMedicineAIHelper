import { useState, useEffect, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, UserRole, handleSupabaseError, TABLES } from '../config/supabase';
import { Database } from '../types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  medicalLicense?: string;
  specialization?: string;
  department?: string;
}

interface SignInData {
  email: string;
  password: string;
}

interface UpdateProfileData {
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergency_contact?: any;
  medical_license?: string;
  specialization?: string;
  department?: string;
  avatar_url?: string;
}

export const useSupabaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  });

  // Fetch user profile
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROFILES)
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Error getting session:', error);
          if (mounted) {
            setAuthState({
              user: null,
              profile: null,
              session: null,
              loading: false,
              error: error.message,
            });
          }
          return;
        }

        if (session?.user && mounted) {
          console.log('✅ Session found, user:', session.user.id);
          // Load profile in background, don't block authentication
          let profile = null;
          try {
            profile = await fetchProfile(session.user.id);
            console.log('📋 Profile loaded:', !!profile);
          } catch (profileError) {
            console.warn('⚠️ Profile loading failed, continuing without profile:', profileError);
          }

          setAuthState({
            user: session.user,
            profile,
            session,
            loading: false,
            error: null,
          });
        } else if (mounted) {
          console.log('ℹ️ No session found');
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        if (mounted) {
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: 'Failed to initialize authentication',
          });
        }
      }
    };

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('⏰ Auth initialization timeout, setting loading to false');
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    }, 5000); // 5 second timeout

    initializeAuth().finally(() => {
      clearTimeout(timeoutId);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('🔄 Auth state change:', event, !!session?.user);

        if (event === 'SIGNED_IN' && session?.user) {
          // Load profile in background, don't block
          let profile = null;
          try {
            profile = await fetchProfile(session.user.id);
          } catch (error) {
            console.warn('⚠️ Profile loading failed during sign in:', error);
          }

          setAuthState({
            user: session.user,
            profile,
            session,
            loading: false,
            error: null,
          });
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null,
          });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setAuthState(prev => ({
            ...prev,
            session,
            user: session.user,
          }));
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign up with optional email verification (disabled by default for easy access)
  const signUp = useCallback(async (data: SignUpData & { requireEmailConfirmation?: boolean }): Promise<{ success: boolean; needsConfirmation: boolean; message: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      // Email verification is now OPTIONAL by default for easy access
      // Only require email confirmation if explicitly requested
      const requireConfirmation = data.requireEmailConfirmation === true;

      const signUpOptions: any = {
        data: {
          full_name: data.fullName,
          role: data.role,
        },
      };

      // Only add email redirect if confirmation is explicitly required
      if (requireConfirmation) {
        signUpOptions.emailRedirectTo = `${window.location.origin}/auth/verify`;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: signUpOptions,
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Create profile immediately
        const profileData: Database['public']['Tables']['profiles']['Insert'] = {
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName,
          role: data.role,
          phone: data.phone || null,
          date_of_birth: data.dateOfBirth || null,
          gender: data.gender || null,
          medical_license: data.medicalLicense || null,
          specialization: data.specialization || null,
          department: data.department || null,
          is_active: true,
        };

        const { error: profileError } = await supabase
          .from(TABLES.PROFILES)
          .insert(profileData);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Continue anyway, profile can be created later
        }

        setAuthState(prev => ({ ...prev, loading: false }));

        // Check if we have a session (user is automatically signed in)
        if (authData.session) {
          return {
            success: true,
            needsConfirmation: false,
            message: 'Registration successful! You are now signed in and can access the dashboard.',
          };
        }

        // With optional email verification, users can always sign in
        if (authData.user) {
          if (requireConfirmation && !authData.user.email_confirmed_at) {
            return {
              success: true,
              needsConfirmation: true,
              message: 'Registration successful! Please check your email to verify your account, or you can sign in immediately.',
            };
          } else {
            return {
              success: true,
              needsConfirmation: false,
              message: 'Registration successful! You can now sign in and access the dashboard.',
            };
          }
        }
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return {
        success: false,
        needsConfirmation: false,
        message: 'Registration failed. Please try again.',
      };
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to sign up',
      }));

      let message = 'Registration failed. Please try again.';
      if (error.message?.includes('already registered') || error.message?.includes('User already registered')) {
        message = 'This email is already registered. Please try signing in instead.';
      } else if (error.message?.includes('invalid email')) {
        message = 'Please enter a valid email address.';
      } else if (error.message?.includes('password')) {
        message = 'Password must be at least 6 characters long.';
      } else if (error.message?.includes('email')) {
        message = 'Email verification is having issues. You can still try signing in with your credentials.';
      }

      return {
        success: false,
        needsConfirmation: false,
        message,
      };
    }
  }, []);

  // Sign in with enhanced error handling and debugging
  const signIn = useCallback(async (data: SignInData): Promise<{ success: boolean; message: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      console.log('Attempting sign in with:', { email: data.email, passwordLength: data.password.length });

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      console.log('Sign in response:', { authData, error });

      if (error) {
        console.error('Sign in error:', error);

        // Handle different types of authentication errors
        if (error.message?.includes('Invalid login credentials')) {
          setAuthState(prev => ({ ...prev, loading: false }));
          return {
            success: false,
            message: 'Invalid email or password. Please check your credentials and try again.',
          };
        }

        if (error.message?.includes('Email not confirmed') || error.message?.includes('email_not_confirmed')) {
          setAuthState(prev => ({ ...prev, loading: false }));
          return {
            success: false,
            message: 'Your account exists but email verification is pending. Please check your email or try creating a new account.',
          };
        }

        if (error.message?.includes('Too many requests')) {
          setAuthState(prev => ({ ...prev, loading: false }));
          return {
            success: false,
            message: 'Too many sign in attempts. Please wait a moment and try again.',
          };
        }

        // Generic error handling
        setAuthState(prev => ({ ...prev, loading: false }));
        return {
          success: false,
          message: `Sign in failed: ${error.message}. Please try again or contact support.`,
        };
      }

      if (authData.user && authData.session) {
        console.log('Sign in successful, user:', authData.user);

        // Check if profile exists, create if it doesn't
        let userProfile = null;
        try {
          userProfile = await fetchProfile(authData.user.id);
          if (!userProfile) {
            console.log('Creating profile for user:', authData.user.id);
            // Create profile if it doesn't exist
            const profileData: Database['public']['Tables']['profiles']['Insert'] = {
              id: authData.user.id,
              email: authData.user.email || data.email,
              full_name: authData.user.user_metadata?.full_name || 'User',
              role: authData.user.user_metadata?.role || 'patient',
              is_active: true,
            };

            const { data: newProfile, error: profileError } = await supabase
              .from(TABLES.PROFILES)
              .insert(profileData)
              .select()
              .single();

            if (profileError) {
              console.error('Profile creation error:', profileError);
            } else {
              console.log('Profile created successfully:', newProfile);
              userProfile = newProfile;
            }
          } else {
            console.log('Profile exists:', userProfile);
          }
        } catch (profileError) {
          console.error('Profile check/creation error:', profileError);
          // Continue anyway, profile issues shouldn't block login
        }

        // Update authentication state with user, session, and profile
        setAuthState(prev => ({
          ...prev,
          user: authData.user,
          session: authData.session,
          profile: userProfile,
          loading: false,
        }));

        console.log('✅ Authentication state updated successfully:', {
          userId: authData.user.id,
          userEmail: authData.user.email,
          session: !!authData.session,
          profile: !!userProfile,
          isAuthenticated: true
        });

        // Email verification is optional - users can always access the dashboard
        return {
          success: true,
          message: 'Successfully signed in! Welcome to your dashboard.',
        };
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return {
        success: false,
        message: 'Sign in failed. Please try again.',
      };
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to sign in',
      }));

      let message = 'Sign in failed. Please check your credentials.';
      if (error.message?.includes('Invalid login credentials')) {
        message = 'Invalid email or password. Please try again.';
      } else if (error.message?.includes('Email not confirmed') || error.message?.includes('email_not_confirmed')) {
        message = 'Email verification required. Please check your email or contact support if you didn\'t receive the verification email.';
      } else if (error.message?.includes('Too many requests')) {
        message = 'Too many sign in attempts. Please wait a moment and try again.';
      } else if (error.message?.includes('email')) {
        message = 'Email verification issues detected. Please try again or contact support.';
      }

      return {
        success: false,
        message,
      };
    }
  }, [fetchProfile]);

  // Sign out
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // Auth state will be updated by the listener
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to sign out',
      }));
      throw error;
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates: UpdateProfileData): Promise<void> => {
    try {
      if (!authState.user) {
        throw new Error('No authenticated user');
      }

      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase
        .from(TABLES.PROFILES)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authState.user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setAuthState(prev => ({
        ...prev,
        profile: data,
        loading: false,
      }));
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to update profile',
      }));
      throw error;
    }
  }, [authState.user]);

  // Reset password
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/verify`,
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send reset email');
    }
  }, []);

  // Update password
  const updatePassword = useCallback(async (newPassword: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update password');
    }
  }, []);

  // Upload avatar
  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
    try {
      if (!authState.user) {
        throw new Error('No authenticated user');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${authState.user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: publicUrl });

      return publicUrl;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload avatar');
    }
  }, [authState.user, updateProfile]);

  // Resend verification email
  const resendVerificationEmail = useCallback(async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        },
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Verification email sent! Please check your inbox and spam folder.',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to send verification email. Please try again later.',
      };
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    user: authState.user,
    profile: authState.profile,
    session: authState.session,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    userRole: authState.profile?.role || null,

    // Actions
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    uploadAvatar,
    resendVerificationEmail,
    clearError,
  };
};
