// SendBird Configuration
export const SENDBIRD_CONFIG = {
  // SendBird App ID
  APP_ID: import.meta.env.VITE_SENDBIRD_APP_ID || '9217f88251964e5bba4c5ca9',
  
  // API Configuration
  API_TOKEN: '', // Set this in production for server-side operations
  
  // Channel Configuration
  CHANNEL_PREFIX: 'telemed_',
  
  // Message Configuration
  MESSAGE_LIMIT: 50,
  MESSAGE_COLLECTION_LIMIT: 100,
  
  // User Configuration
  DEFAULT_PROFILE_URL: 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=U',
  
  // Theme Configuration
  THEME: {
    primary: '#4F46E5',
    secondary: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
  },
  
  // File Upload Configuration
  FILE_UPLOAD: {
    maxSize: 25 * 1024 * 1024, // 25MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
  },
  
  // Notification Configuration
  NOTIFICATIONS: {
    enabled: true,
    sound: true,
    badge: true,
  },
} as const;

// Validate SendBird configuration
export const validateSendBirdConfig = (): boolean => {
  if (!SENDBIRD_CONFIG.APP_ID) {
    console.error('SendBird App ID is not configured. Please set VITE_SENDBIRD_APP_ID in your .env file');
    return false;
  }
  return true;
};

// Generate channel URL for consultation
export const generateChannelUrl = (consultationId: string, type: 'group' | 'open' = 'group'): string => {
  return `${SENDBIRD_CONFIG.CHANNEL_PREFIX}${type}_${consultationId}`;
};

// Generate user ID from user data
export const generateUserId = (userId: string, role: string): string => {
  return `${role}_${userId}`;
};

// Get user profile URL
export const getUserProfileUrl = (user: any): string => {
  return user?.avatar || SENDBIRD_CONFIG.DEFAULT_PROFILE_URL;
};

// Channel types
export enum ChannelType {
  CONSULTATION = 'consultation',
  SUPPORT = 'support',
  GENERAL = 'general',
  EMERGENCY = 'emergency',
}

// Message types
export enum MessageType {
  TEXT = 'text',
  FILE = 'file',
  IMAGE = 'image',
  ADMIN = 'admin',
  SYSTEM = 'system',
}

// User roles for SendBird
export enum SendBirdUserRole {
  DOCTOR = 'doctor',
  PATIENT = 'patient',
  ADMIN = 'admin',
  SUPPORT = 'support',
}
