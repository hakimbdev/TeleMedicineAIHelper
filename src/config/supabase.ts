import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Auth helpers
export const auth = supabase.auth;

// Database helpers
export const db = supabase;

// Storage helpers
export const storage = supabase.storage;

// Realtime helpers
export const realtime = supabase.realtime;

// User roles enum
export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
  NURSE = 'nurse',
}

// Auth state types
export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    role?: UserRole;
  };
  app_metadata: {
    role?: UserRole;
  };
}

// Database table names
export const TABLES = {
  PROFILES: 'profiles',
  MEDICAL_RECORDS: 'medical_records',
  APPOINTMENTS: 'appointments',
  PRESCRIPTIONS: 'prescriptions',
  CONSULTATIONS: 'consultations',
  CHAT_MESSAGES: 'chat_messages',
  CHAT_CHANNELS: 'chat_channels',
  DIAGNOSIS_SESSIONS: 'diagnosis_sessions',
  NOTIFICATIONS: 'notifications',
} as const;

// RLS (Row Level Security) policies helper
export const RLS_POLICIES = {
  // Users can only see their own profile
  PROFILES_SELECT: 'profiles_select_own',
  PROFILES_UPDATE: 'profiles_update_own',
  
  // Medical records - patients see own, doctors see assigned
  MEDICAL_RECORDS_SELECT: 'medical_records_select_policy',
  MEDICAL_RECORDS_INSERT: 'medical_records_insert_policy',
  MEDICAL_RECORDS_UPDATE: 'medical_records_update_policy',
  
  // Appointments - users see own appointments
  APPOINTMENTS_SELECT: 'appointments_select_policy',
  APPOINTMENTS_INSERT: 'appointments_insert_policy',
  APPOINTMENTS_UPDATE: 'appointments_update_policy',
  
  // Chat messages - users see messages in their channels
  CHAT_MESSAGES_SELECT: 'chat_messages_select_policy',
  CHAT_MESSAGES_INSERT: 'chat_messages_insert_policy',
} as const;

// Error handling
export class SupabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SupabaseError';
  }
}

// Helper functions
export const handleSupabaseError = (error: any): never => {
  console.error('Supabase error:', error);
  throw new SupabaseError(error.message || 'An unexpected error occurred', error.code);
};

export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user as AuthUser | null;
};

export const getUserRole = async (): Promise<UserRole | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  
  // Check app_metadata first (set by admin), then user_metadata
  return user.app_metadata?.role || user.user_metadata?.role || null;
};

export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) handleSupabaseError(error);
};

// Real-time subscription helpers
export const subscribeToTable = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  const channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter,
      },
      callback
    )
    .subscribe();

  return channel;
};

export const unsubscribeFromChannel = (channel: any) => {
  supabase.removeChannel(channel);
};

// File upload helpers
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File,
  options?: { upsert?: boolean }
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, options);

  if (error) handleSupabaseError(error);

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
};

export const deleteFile = async (bucket: string, path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) handleSupabaseError(error);
};

// Database query helpers
export const createRecord = async <T>(
  table: string,
  data: Partial<T>
): Promise<T> => {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select()
    .single();

  if (error) handleSupabaseError(error);
  return result as T;
};

export const updateRecord = async <T>(
  table: string,
  id: string,
  data: Partial<T>
): Promise<T> => {
  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) handleSupabaseError(error);
  return result as T;
};

export const deleteRecord = async (table: string, id: string): Promise<void> => {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) handleSupabaseError(error);
};

export const getRecord = async <T>(
  table: string,
  id: string
): Promise<T | null> => {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') handleSupabaseError(error);
  return data as T | null;
};

export const getRecords = async <T>(
  table: string,
  query?: {
    select?: string;
    filter?: Record<string, any>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
  }
): Promise<T[]> => {
  let queryBuilder = supabase.from(table).select(query?.select || '*');

  if (query?.filter) {
    Object.entries(query.filter).forEach(([key, value]) => {
      queryBuilder = queryBuilder.eq(key, value);
    });
  }

  if (query?.order) {
    queryBuilder = queryBuilder.order(query.order.column, {
      ascending: query.order.ascending ?? true,
    });
  }

  if (query?.limit) {
    queryBuilder = queryBuilder.limit(query.limit);
  }

  if (query?.offset) {
    queryBuilder = queryBuilder.range(query.offset, query.offset + (query.limit || 10) - 1);
  }

  const { data, error } = await queryBuilder;

  if (error) handleSupabaseError(error);
  return data as T[];
};
