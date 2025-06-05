import React, { createContext, useContext, ReactNode } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';
import { UserRole } from '../config/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin' | 'nurse';
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  medicalLicense?: string;
  specialization?: string;
  department?: string;
  dateCreated?: string;
  lastActive?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole, additionalData?: any) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    user: supabaseUser,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile: updateSupabaseProfile,
    uploadAvatar,
    clearError,
  } = useSupabaseAuth();

  // Simplified authentication - only requires Supabase user session
  const user: User | null = supabaseUser ? {
    id: supabaseUser.id,
    name: profile?.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
    email: profile?.email || supabaseUser.email || '',
    role: (profile?.role || supabaseUser.user_metadata?.role || 'patient') as UserRole,
    avatar: profile?.avatar_url || undefined,
    phone: profile?.phone || undefined,
    dateOfBirth: profile?.date_of_birth || undefined,
    gender: profile?.gender || undefined,
    medicalLicense: profile?.medical_license || undefined,
    specialization: profile?.specialization || undefined,
    department: profile?.department || undefined,
    dateCreated: profile?.created_at || supabaseUser.created_at,
    lastActive: profile?.updated_at || undefined,
  } : null;

  // Authentication is true if we have a Supabase user, regardless of profile status
  const isAuthenticated = !!supabaseUser && !!supabaseUser.id;

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await signIn({ email, password });
      return result.success;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    additionalData?: {
      phone?: string;
      dateOfBirth?: string;
      gender?: 'male' | 'female' | 'other';
      medicalLicense?: string;
      specialization?: string;
      department?: string;
    }
  ): Promise<boolean> => {
    try {
      const result = await signUp({
        email,
        password,
        fullName: name,
        role,
        phone: additionalData?.phone,
        dateOfBirth: additionalData?.dateOfBirth,
        gender: additionalData?.gender,
        medicalLicense: additionalData?.medicalLicense,
        specialization: additionalData?.specialization,
        department: additionalData?.department,
      });
      return result.success;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    await signOut();
  };

  const updateProfile = async (data: any): Promise<void> => {
    await updateSupabaseProfile(data);
  };

  // Debug logging for authentication state
  console.log('useAuth state:', {
    supabaseUser: !!supabaseUser,
    supabaseUserId: supabaseUser?.id,
    user: !!user,
    isAuthenticated,
    loading,
    error,
    userRole: user?.role,
    profileLoaded: !!profile
  });

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      error,
      login,
      register,
      logout,
      updateProfile,
      uploadAvatar,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};