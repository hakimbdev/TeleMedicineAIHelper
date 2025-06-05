// Infermedica Health API Configuration
export const INFERMEDICA_CONFIG = {
  // API Credentials
  APP_ID: import.meta.env.VITE_INFERMEDICA_APP_ID || '',
  APP_KEY: import.meta.env.VITE_INFERMEDICA_APP_KEY || '',
  
  // API Base URLs
  BASE_URL: 'https://api.infermedica.com/v3',
  
  // API Endpoints
  ENDPOINTS: {
    DIAGNOSIS: '/diagnosis',
    CONDITIONS: '/conditions',
    SYMPTOMS: '/symptoms',
    RISK_FACTORS: '/risk_factors',
    SEARCH: '/search',
    NLP: '/parse',
    TRIAGE: '/triage',
    EXPLAIN: '/explain',
    SUGGEST: '/suggest',
    INFO: '/info',
  },
  
  // Request Configuration
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Dev-Mode': 'true', // Set to false in production
  },
  
  // Interview Configuration
  INTERVIEW: {
    MAX_QUESTIONS: 20,
    MIN_EVIDENCE_COUNT: 1,
    STOP_THRESHOLD: 0.8,
    DISABLE_GROUPS: false, // Set to true for chatbot-style single questions
  },
  
  // Supported Languages
  LANGUAGES: {
    ENGLISH: 'en',
    SPANISH: 'es',
    FRENCH: 'fr',
    GERMAN: 'de',
    POLISH: 'pl',
    RUSSIAN: 'ru',
    CHINESE: 'zh',
    JAPANESE: 'ja',
  },
  
  // Age Groups
  AGE_GROUPS: {
    INFANT: { min: 0, max: 1 },
    TODDLER: { min: 2, max: 4 },
    CHILD: { min: 5, max: 12 },
    ADOLESCENT: { min: 13, max: 17 },
    ADULT: { min: 18, max: 64 },
    SENIOR: { min: 65, max: 120 },
  },
  
  // Evidence Choice IDs
  EVIDENCE_CHOICES: {
    PRESENT: 'present',
    ABSENT: 'absent',
    UNKNOWN: 'unknown',
  },
  
  // Evidence Sources
  EVIDENCE_SOURCES: {
    INITIAL: 'initial',
    PREDEFINED: 'predefined',
    SUGGESTED: 'suggested',
  },
  
  // Question Types
  QUESTION_TYPES: {
    SINGLE: 'single',
    GROUP_SINGLE: 'group_single',
    GROUP_MULTIPLE: 'group_multiple',
  },
  
  // Triage Levels
  TRIAGE_LEVELS: {
    EMERGENCY: 'emergency',
    CONSULTATION: 'consultation',
    SELF_CARE: 'self_care',
  },
  
  // Condition Categories
  CONDITION_CATEGORIES: {
    SYMPTOM: 'symptom',
    RISK_FACTOR: 'risk_factor',
    CONDITION: 'condition',
  },
} as const;

// Validate Infermedica configuration
export const validateInfermedicaConfig = (): boolean => {
  if (!INFERMEDICA_CONFIG.APP_ID || !INFERMEDICA_CONFIG.APP_KEY) {
    console.warn('Infermedica credentials are not configured. Using demo mode. Please set VITE_INFERMEDICA_APP_ID and VITE_INFERMEDICA_APP_KEY in your .env file for production use.');
    return false;
  }
  return true;
};

// Generate unique interview ID
export const generateInterviewId = (): string => {
  return `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get request headers for Infermedica API
export const getInfermedicaHeaders = (interviewId?: string) => {
  return {
    ...INFERMEDICA_CONFIG.DEFAULT_HEADERS,
    'App-Id': INFERMEDICA_CONFIG.APP_ID,
    'App-Key': INFERMEDICA_CONFIG.APP_KEY,
    'Interview-Id': interviewId || generateInterviewId(),
  };
};

// Age validation
export const validateAge = (age: number): boolean => {
  return age >= 0 && age <= 120;
};

// Sex validation
export const validateSex = (sex: string): boolean => {
  return ['male', 'female'].includes(sex.toLowerCase());
};

// Evidence validation
export const validateEvidence = (evidence: any[]): boolean => {
  if (!Array.isArray(evidence) || evidence.length === 0) {
    return false;
  }
  
  return evidence.every(item => 
    item.id && 
    item.choice_id && 
    Object.values(INFERMEDICA_CONFIG.EVIDENCE_CHOICES).includes(item.choice_id)
  );
};

// Format age for API
export const formatAge = (age: number) => {
  return { value: age };
};

// Get age group
export const getAgeGroup = (age: number): string => {
  for (const [group, range] of Object.entries(INFERMEDICA_CONFIG.AGE_GROUPS)) {
    if (age >= range.min && age <= range.max) {
      return group.toLowerCase();
    }
  }
  return 'adult';
};

// Error messages
export const INFERMEDICA_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid Infermedica API credentials',
  NETWORK_ERROR: 'Network error occurred while connecting to Infermedica API',
  INVALID_REQUEST: 'Invalid request format',
  RATE_LIMIT_EXCEEDED: 'API rate limit exceeded',
  SERVER_ERROR: 'Infermedica server error',
  INVALID_AGE: 'Age must be between 0 and 120',
  INVALID_SEX: 'Sex must be either "male" or "female"',
  INVALID_EVIDENCE: 'Evidence list is invalid or empty',
  MISSING_INITIAL_EVIDENCE: 'At least one evidence item must be marked as initial',
} as const;
