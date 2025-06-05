// Agora Configuration
export const AGORA_CONFIG = {
  // Get your App ID from Agora Console: https://console.agora.io/
  APP_ID: import.meta.env.VITE_AGORA_APP_ID || '',
  
  // Channel configuration
  CHANNEL_PREFIX: 'telemed_',
  
  // Video configuration
  VIDEO_PROFILE: {
    width: 640,
    height: 480,
    frameRate: 15,
    bitrateMin: 200,
    bitrateMax: 1000,
  },
  
  // Audio configuration
  AUDIO_PROFILE: {
    sampleRate: 48000,
    bitrate: 48,
    stereo: false,
  },
  
  // Connection configuration
  CONNECTION_CONFIG: {
    codec: 'vp8' as const,
    mode: 'rtc' as const,
  },
} as const;

// Validate configuration
export const validateAgoraConfig = (): boolean => {
  if (!AGORA_CONFIG.APP_ID) {
    console.error('Agora App ID is not configured. Please set VITE_AGORA_APP_ID in your .env file');
    return false;
  }
  return true;
};

// Generate channel name for consultation
export const generateChannelName = (consultationId: string): string => {
  return `${AGORA_CONFIG.CHANNEL_PREFIX}${consultationId}`;
};
