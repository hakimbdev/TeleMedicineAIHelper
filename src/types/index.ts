export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  specialization?: string; // For doctors
  phone?: string;
  dateCreated: string;
  lastActive?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  type: 'video' | 'audio' | 'ai-assisted';
  notes?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  title: string;
  type: 'lab' | 'imaging' | 'prescription' | 'note' | 'other';
  date: string;
  fileUrl?: string;
  notes?: string;
  doctorId?: string;
  doctorName?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  medications: Medication[];
  instructions: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment' | 'message' | 'prescription' | 'system';
  read: boolean;
  date: string;
  link?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'doctor';
  content: string;
  timestamp: string;
  attachments?: string[];
}

export interface ConsultationSession {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  startTime: string;
  endTime?: string;
  status: 'waiting' | 'active' | 'completed' | 'ai-mode';
  notes?: string;
  messages: ChatMessage[];
  videoSession?: VideoSession;
}

// Video consultation types
export interface VideoSession {
  channelName: string;
  token?: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isConnected: boolean;
  participants: VideoParticipant[];
}

export interface VideoParticipant {
  uid: string | number;
  userId: string;
  name: string;
  role: UserRole;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  joinedAt: string;
}

export interface VideoCallControls {
  toggleVideo: () => void;
  toggleAudio: () => void;
  toggleConnection: () => void;
  shareScreen?: () => void;
  endCall: () => void;
}

export interface AgoraClientState {
  isJoined: boolean;
  isPublishing: boolean;
  localVideoTrack: any;
  localAudioTrack: any;
  remoteUsers: any[];
}

// SendBird Chat types
export interface ChatChannel {
  url: string;
  name: string;
  channelType: 'group' | 'open';
  memberCount: number;
  unreadMessageCount: number;
  lastMessage?: ChatMessage;
  createdAt: number;
  updatedAt: number;
  customType?: string;
  data?: string;
  coverUrl?: string;
}

export interface ChatUser {
  userId: string;
  nickname: string;
  profileUrl?: string;
  role: UserRole;
  isOnline: boolean;
  lastSeenAt?: number;
  metadata?: Record<string, string>;
}

export interface SendBirdMessage {
  messageId: number;
  message: string;
  messageType: 'user' | 'file' | 'admin';
  sender: ChatUser;
  createdAt: number;
  updatedAt: number;
  channelUrl: string;
  customType?: string;
  data?: string;
  mentionedUsers?: ChatUser[];
  reactions?: MessageReaction[];
  threadInfo?: ThreadInfo;
  parentMessage?: SendBirdMessage;
  url?: string; // For file messages
  name?: string; // For file messages
  size?: number; // For file messages
  type?: string; // For file messages
}

export interface MessageReaction {
  key: string;
  userIds: string[];
  updatedAt: number;
}

export interface ThreadInfo {
  replyCount: number;
  mostRepliedUsers: ChatUser[];
  lastRepliedAt: number;
}

export interface ChatConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error?: string;
  reconnectCount: number;
}

export interface ChatChannelListQuery {
  hasNext: boolean;
  isLoading: boolean;
  limit: number;
  channelType?: 'group' | 'open';
  customTypes?: string[];
}

export interface ChatMessageListQuery {
  hasNext: boolean;
  hasPrevious: boolean;
  isLoading: boolean;
  limit: number;
  reverse: boolean;
  messageTypeFilter?: string;
  customTypeFilter?: string;
}

export interface ChatNotification {
  id: string;
  type: 'message' | 'mention' | 'channel_invitation' | 'system';
  title: string;
  body: string;
  channelUrl?: string;
  messageId?: number;
  sender?: ChatUser;
  createdAt: number;
  isRead: boolean;
}

export interface ChatSettings {
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    mobile: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  enterToSend: boolean;
  showDeliveryReceipt: boolean;
  showReadReceipt: boolean;
  showTypingIndicator: boolean;
}

// Infermedica Health API Types
export interface InfermedicaPatient {
  sex: 'male' | 'female';
  age: {
    value: number;
  };
  evidence: InfermedicaEvidence[];
  extras?: {
    disable_groups?: boolean;
  };
}

export interface InfermedicaEvidence {
  id: string;
  choice_id: 'present' | 'absent' | 'unknown';
  source?: 'initial' | 'predefined' | 'suggested';
  initial?: boolean;
}

export interface InfermedicaQuestion {
  type: 'single' | 'group_single' | 'group_multiple';
  text: string;
  items: InfermedicaQuestionItem[];
  extras?: Record<string, any>;
}

export interface InfermedicaQuestionItem {
  id: string;
  name: string;
  choices: InfermedicaChoice[];
}

export interface InfermedicaChoice {
  id: string;
  label: string;
}

export interface InfermedicaCondition {
  id: string;
  name: string;
  common_name?: string;
  probability: number;
  icd10?: string;
  acuteness?: 'chronic' | 'chronic_with_exacerbations' | 'acute_potentially_chronic' | 'acute';
  severity?: 'mild' | 'moderate' | 'severe';
  categories?: string[];
  prevalence?: 'very_rare' | 'rare' | 'moderate' | 'common' | 'very_common';
  hint?: string;
}

export interface InfermedicaDiagnosisResponse {
  question: InfermedicaQuestion | null;
  conditions: InfermedicaCondition[];
  should_stop: boolean;
  extras?: Record<string, any>;
}

export interface InfermedicaSymptom {
  id: string;
  name: string;
  common_name?: string;
  question: string;
  category: string;
  seriousness?: 'emergency' | 'serious' | 'moderate' | 'mild';
  children?: InfermedicaSymptom[];
  image_url?: string;
  image_source?: string;
  parent_id?: string;
  parent_relation?: string;
  sex_filter?: 'male' | 'female' | 'both';
  extras?: Record<string, any>;
}

export interface InfermedicaRiskFactor {
  id: string;
  name: string;
  common_name?: string;
  question: string;
  category: string;
  extras?: Record<string, any>;
}

export interface InfermedicaTriageResponse {
  triage_level: 'emergency' | 'consultation' | 'self_care';
  serious: InfermedicaCondition[];
  description: string;
  label: string;
}

export interface InfermedicaSearchResult {
  id: string;
  label: string;
  type: 'symptom' | 'risk_factor' | 'condition';
}

export interface InfermedicaNLPResponse {
  mentions: InfermedicaMention[];
  obvious: boolean;
}

export interface InfermedicaMention {
  id: string;
  name: string;
  common_name?: string;
  orth: string;
  choice_id: 'present' | 'absent' | 'unknown';
  type: 'symptom' | 'risk_factor';
}

export interface InfermedicaExplanation {
  condition: InfermedicaCondition;
  supporting_evidence: InfermedicaEvidence[];
  conflicting_evidence: InfermedicaEvidence[];
  unconfirmed_evidence: InfermedicaEvidence[];
}

export interface MedicalInterview {
  id: string;
  patientInfo: {
    age: number;
    sex: 'male' | 'female';
    name?: string;
  };
  evidence: InfermedicaEvidence[];
  currentQuestion: InfermedicaQuestion | null;
  conditions: InfermedicaCondition[];
  shouldStop: boolean;
  questionCount: number;
  startTime: string;
  lastUpdated: string;
  status: 'active' | 'completed' | 'abandoned';
  triageResult?: InfermedicaTriageResponse;
}

export interface DiagnosisSession {
  id: string;
  userId: string;
  interview: MedicalInterview;
  chatHistory: DiagnosisChatMessage[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'completed' | 'paused';
}

export interface DiagnosisChatMessage {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    questionType?: string;
    evidenceAdded?: InfermedicaEvidence[];
    conditionsUpdated?: boolean;
    triageLevel?: string;
  };
}