import {
  INFERMEDICA_CONFIG,
  getInfermedicaHeaders,
  validateInfermedicaConfig,
  INFERMEDICA_ERRORS
} from '../config/infermedica';
import {
  InfermedicaPatient,
  InfermedicaDiagnosisResponse,
  InfermedicaSymptom,
  InfermedicaRiskFactor,
  InfermedicaCondition,
  InfermedicaTriageResponse,
  InfermedicaSearchResult,
  InfermedicaNLPResponse,
  InfermedicaExplanation,
  InfermedicaEvidence
} from '../types';
import { InfermedicaDemoClient } from './infermedicaDemo';

class InfermedicaApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'InfermedicaApiError';
  }
}

class InfermedicaApiClient {
  private baseUrl: string;
  private interviewId: string;
  private demoClient: InfermedicaDemoClient | null = null;
  private useDemo: boolean;

  constructor(interviewId?: string) {
    this.baseUrl = INFERMEDICA_CONFIG.BASE_URL;
    this.interviewId = interviewId || `interview_${Date.now()}`;
    this.useDemo = !validateInfermedicaConfig();

    if (this.useDemo) {
      this.demoClient = new InfermedicaDemoClient();
      console.warn('Infermedica credentials not found. Using demo mode.');
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = getInfermedicaHeaders(this.interviewId);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        switch (response.status) {
          case 401:
            throw new InfermedicaApiError(
              INFERMEDICA_ERRORS.INVALID_CREDENTIALS,
              401,
              'UNAUTHORIZED'
            );
          case 429:
            throw new InfermedicaApiError(
              INFERMEDICA_ERRORS.RATE_LIMIT_EXCEEDED,
              429,
              'RATE_LIMIT'
            );
          case 400:
            throw new InfermedicaApiError(
              errorData.message || INFERMEDICA_ERRORS.INVALID_REQUEST,
              400,
              'BAD_REQUEST'
            );
          default:
            throw new InfermedicaApiError(
              errorData.message || INFERMEDICA_ERRORS.SERVER_ERROR,
              response.status,
              'SERVER_ERROR'
            );
        }
      }

      return await response.json();
    } catch (error) {
      if (error instanceof InfermedicaApiError) {
        throw error;
      }
      
      throw new InfermedicaApiError(
        INFERMEDICA_ERRORS.NETWORK_ERROR,
        0,
        'NETWORK_ERROR'
      );
    }
  }

  // Get diagnosis based on patient data
  async getDiagnosis(patient: InfermedicaPatient): Promise<InfermedicaDiagnosisResponse> {
    if (this.useDemo && this.demoClient) {
      return this.demoClient.getDiagnosis(patient);
    }

    return this.makeRequest<InfermedicaDiagnosisResponse>(
      INFERMEDICA_CONFIG.ENDPOINTS.DIAGNOSIS,
      'POST',
      patient
    );
  }

  // Get all available symptoms
  async getSymptoms(age?: number): Promise<InfermedicaSymptom[]> {
    const params = age ? `?age.value=${age}` : '';
    return this.makeRequest<InfermedicaSymptom[]>(
      `${INFERMEDICA_CONFIG.ENDPOINTS.SYMPTOMS}${params}`
    );
  }

  // Get specific symptom by ID
  async getSymptom(id: string): Promise<InfermedicaSymptom> {
    return this.makeRequest<InfermedicaSymptom>(
      `${INFERMEDICA_CONFIG.ENDPOINTS.SYMPTOMS}/${id}`
    );
  }

  // Get all available risk factors
  async getRiskFactors(age?: number): Promise<InfermedicaRiskFactor[]> {
    const params = age ? `?age.value=${age}` : '';
    return this.makeRequest<InfermedicaRiskFactor[]>(
      `${INFERMEDICA_CONFIG.ENDPOINTS.RISK_FACTORS}${params}`
    );
  }

  // Get all available conditions
  async getConditions(): Promise<InfermedicaCondition[]> {
    return this.makeRequest<InfermedicaCondition[]>(
      INFERMEDICA_CONFIG.ENDPOINTS.CONDITIONS
    );
  }

  // Get specific condition by ID
  async getCondition(id: string): Promise<InfermedicaCondition> {
    return this.makeRequest<InfermedicaCondition>(
      `${INFERMEDICA_CONFIG.ENDPOINTS.CONDITIONS}/${id}`
    );
  }

  // Search for symptoms, conditions, or risk factors
  async search(
    phrase: string,
    sex?: 'male' | 'female',
    age?: number,
    type?: 'symptom' | 'risk_factor' | 'condition'
  ): Promise<InfermedicaSearchResult[]> {
    if (this.useDemo && this.demoClient) {
      return this.demoClient.search(phrase);
    }

    const params = new URLSearchParams({ phrase });
    if (sex) params.append('sex', sex);
    if (age) params.append('age.value', age.toString());
    if (type) params.append('type', type);

    return this.makeRequest<InfermedicaSearchResult[]>(
      `${INFERMEDICA_CONFIG.ENDPOINTS.SEARCH}?${params.toString()}`
    );
  }

  // Parse natural language text to extract medical concepts
  async parseText(
    text: string,
    context?: InfermedicaEvidence[]
  ): Promise<InfermedicaNLPResponse> {
    if (this.useDemo && this.demoClient) {
      return this.demoClient.parseText(text);
    }

    const body: any = { text };
    if (context) body.context = context;

    return this.makeRequest<InfermedicaNLPResponse>(
      INFERMEDICA_CONFIG.ENDPOINTS.NLP,
      'POST',
      body
    );
  }

  // Get triage recommendation
  async getTriage(patient: InfermedicaPatient): Promise<InfermedicaTriageResponse> {
    if (this.useDemo && this.demoClient) {
      return this.demoClient.getTriage(patient);
    }

    return this.makeRequest<InfermedicaTriageResponse>(
      INFERMEDICA_CONFIG.ENDPOINTS.TRIAGE,
      'POST',
      patient
    );
  }

  // Get explanation for a specific condition
  async getExplanation(
    patient: InfermedicaPatient,
    target: string
  ): Promise<InfermedicaExplanation> {
    return this.makeRequest<InfermedicaExplanation>(
      INFERMEDICA_CONFIG.ENDPOINTS.EXPLAIN,
      'POST',
      { ...patient, target }
    );
  }

  // Get suggested symptoms based on current evidence
  async getSuggestions(
    patient: InfermedicaPatient,
    max_results: number = 8
  ): Promise<InfermedicaSymptom[]> {
    return this.makeRequest<InfermedicaSymptom[]>(
      INFERMEDICA_CONFIG.ENDPOINTS.SUGGEST,
      'POST',
      { ...patient, max_results }
    );
  }

  // Get API information
  async getInfo(): Promise<any> {
    return this.makeRequest<any>(INFERMEDICA_CONFIG.ENDPOINTS.INFO);
  }

  // Update interview ID
  setInterviewId(interviewId: string): void {
    this.interviewId = interviewId;
  }

  // Get current interview ID
  getInterviewId(): string {
    return this.interviewId;
  }
}

// Utility functions for working with Infermedica data

export const createPatient = (
  age: number,
  sex: 'male' | 'female',
  evidence: InfermedicaEvidence[] = []
): InfermedicaPatient => {
  return {
    sex,
    age: { value: age },
    evidence,
    extras: {
      disable_groups: false, // Enable grouped questions for better UX
    },
  };
};

export const createEvidence = (
  id: string,
  choice_id: 'present' | 'absent' | 'unknown',
  source: 'initial' | 'predefined' | 'suggested' = 'predefined',
  initial: boolean = false
): InfermedicaEvidence => {
  return {
    id,
    choice_id,
    source,
    initial,
  };
};

export const updateEvidence = (
  evidenceList: InfermedicaEvidence[],
  id: string,
  choice_id: 'present' | 'absent' | 'unknown'
): InfermedicaEvidence[] => {
  const existingIndex = evidenceList.findIndex(e => e.id === id);
  
  if (existingIndex >= 0) {
    // Update existing evidence
    const updated = [...evidenceList];
    updated[existingIndex] = { ...updated[existingIndex], choice_id };
    return updated;
  } else {
    // Add new evidence
    return [...evidenceList, createEvidence(id, choice_id)];
  }
};

export const removeEvidence = (
  evidenceList: InfermedicaEvidence[],
  id: string
): InfermedicaEvidence[] => {
  return evidenceList.filter(e => e.id !== id);
};

export const hasInitialEvidence = (evidenceList: InfermedicaEvidence[]): boolean => {
  return evidenceList.some(e => e.initial === true);
};

export const getEvidenceByChoice = (
  evidenceList: InfermedicaEvidence[],
  choice_id: 'present' | 'absent' | 'unknown'
): InfermedicaEvidence[] => {
  return evidenceList.filter(e => e.choice_id === choice_id);
};

export const formatConditionProbability = (probability: number): string => {
  if (probability >= 0.8) return 'Very likely';
  if (probability >= 0.6) return 'Likely';
  if (probability >= 0.4) return 'Possible';
  if (probability >= 0.2) return 'Unlikely';
  return 'Very unlikely';
};

export const getTriageLevelColor = (level: string): string => {
  switch (level) {
    case 'emergency':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'consultation':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'self_care':
      return 'text-green-600 bg-green-50 border-green-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getTriageLevelIcon = (level: string): string => {
  switch (level) {
    case 'emergency':
      return '🚨';
    case 'consultation':
      return '👩‍⚕️';
    case 'self_care':
      return '🏠';
    default:
      return 'ℹ️';
  }
};

export { InfermedicaApiClient, InfermedicaApiError };
