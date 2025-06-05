import { useState, useCallback, useRef } from 'react';
import { 
  InfermedicaApiClient, 
  createPatient, 
  createEvidence, 
  updateEvidence,
  hasInitialEvidence 
} from '../services/infermedicaApi';
import { 
  MedicalInterview, 
  InfermedicaEvidence, 
  InfermedicaQuestion,
  InfermedicaCondition,
  InfermedicaTriageResponse,
  InfermedicaNLPResponse
} from '../types';
import { generateInterviewId } from '../config/infermedica';

interface UseMedicalInterviewProps {
  onError?: (error: string) => void;
  onComplete?: (interview: MedicalInterview) => void;
}

interface UseMedicalInterviewReturn {
  // Interview state
  interview: MedicalInterview | null;
  isLoading: boolean;
  error: string | null;
  
  // Interview actions
  startInterview: (age: number, sex: 'male' | 'female', initialSymptoms?: string[]) => Promise<void>;
  answerQuestion: (evidenceId: string, choiceId: 'present' | 'absent' | 'unknown') => Promise<void>;
  addSymptom: (symptomId: string, choiceId: 'present' | 'absent' | 'unknown') => Promise<void>;
  parseSymptoms: (text: string) => Promise<InfermedicaNLPResponse | null>;
  getTriage: () => Promise<InfermedicaTriageResponse | null>;
  completeInterview: () => void;
  resetInterview: () => void;
  
  // Utility functions
  canProceed: boolean;
  progressPercentage: number;
}

export const useMedicalInterview = ({
  onError,
  onComplete,
}: UseMedicalInterviewProps = {}): UseMedicalInterviewReturn => {
  const [interview, setInterview] = useState<MedicalInterview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const apiClientRef = useRef<InfermedicaApiClient | null>(null);

  const handleError = useCallback((error: any) => {
    const errorMessage = error.message || 'An unexpected error occurred';
    setError(errorMessage);
    onError?.(errorMessage);
    console.error('Medical interview error:', error);
  }, [onError]);

  const startInterview = useCallback(async (
    age: number, 
    sex: 'male' | 'female', 
    initialSymptoms: string[] = []
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const interviewId = generateInterviewId();
      apiClientRef.current = new InfermedicaApiClient(interviewId);

      // Create initial evidence from symptoms
      const evidence: InfermedicaEvidence[] = initialSymptoms.map((symptomId, index) => 
        createEvidence(symptomId, 'present', 'initial', index === 0)
      );

      // Ensure at least one initial evidence if symptoms provided
      if (evidence.length > 0 && !hasInitialEvidence(evidence)) {
        evidence[0].initial = true;
      }

      const newInterview: MedicalInterview = {
        id: interviewId,
        patientInfo: { age, sex },
        evidence,
        currentQuestion: null,
        conditions: [],
        shouldStop: false,
        questionCount: 0,
        startTime: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        status: 'active',
      };

      setInterview(newInterview);

      // Get first question if we have initial evidence
      if (evidence.length > 0) {
        await getNextQuestion(newInterview);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const getNextQuestion = useCallback(async (currentInterview: MedicalInterview) => {
    if (!apiClientRef.current) return;

    try {
      const patient = createPatient(
        currentInterview.patientInfo.age,
        currentInterview.patientInfo.sex,
        currentInterview.evidence
      );

      const response = await apiClientRef.current.getDiagnosis(patient);

      setInterview(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          currentQuestion: response.question,
          conditions: response.conditions,
          shouldStop: response.should_stop,
          lastUpdated: new Date().toISOString(),
        };
      });

      // Auto-complete if should stop
      if (response.should_stop) {
        setInterview(prev => {
          if (!prev) return prev;
          
          const completedInterview = {
            ...prev,
            status: 'completed' as const,
            lastUpdated: new Date().toISOString(),
          };
          
          onComplete?.(completedInterview);
          return completedInterview;
        });
      }
    } catch (err) {
      handleError(err);
    }
  }, [handleError, onComplete]);

  const answerQuestion = useCallback(async (
    evidenceId: string, 
    choiceId: 'present' | 'absent' | 'unknown'
  ) => {
    if (!interview || !apiClientRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const updatedEvidence = updateEvidence(interview.evidence, evidenceId, choiceId);
      
      const updatedInterview: MedicalInterview = {
        ...interview,
        evidence: updatedEvidence,
        questionCount: interview.questionCount + 1,
        lastUpdated: new Date().toISOString(),
      };

      setInterview(updatedInterview);
      await getNextQuestion(updatedInterview);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [interview, getNextQuestion, handleError]);

  const addSymptom = useCallback(async (
    symptomId: string, 
    choiceId: 'present' | 'absent' | 'unknown'
  ) => {
    if (!interview) return;

    setIsLoading(true);
    setError(null);

    try {
      const newEvidence = createEvidence(symptomId, choiceId, 'suggested');
      const updatedEvidence = [...interview.evidence, newEvidence];
      
      const updatedInterview: MedicalInterview = {
        ...interview,
        evidence: updatedEvidence,
        lastUpdated: new Date().toISOString(),
      };

      setInterview(updatedInterview);
      await getNextQuestion(updatedInterview);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [interview, getNextQuestion, handleError]);

  const parseSymptoms = useCallback(async (text: string): Promise<InfermedicaNLPResponse | null> => {
    if (!apiClientRef.current) return null;

    try {
      setIsLoading(true);
      const response = await apiClientRef.current.parseText(text, interview?.evidence);
      return response;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [interview?.evidence, handleError]);

  const getTriage = useCallback(async (): Promise<InfermedicaTriageResponse | null> => {
    if (!interview || !apiClientRef.current) return null;

    try {
      setIsLoading(true);
      const patient = createPatient(
        interview.patientInfo.age,
        interview.patientInfo.sex,
        interview.evidence
      );

      const triageResponse = await apiClientRef.current.getTriage(patient);
      
      setInterview(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          triageResult: triageResponse,
          lastUpdated: new Date().toISOString(),
        };
      });

      return triageResponse;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [interview, handleError]);

  const completeInterview = useCallback(() => {
    if (!interview) return;

    const completedInterview: MedicalInterview = {
      ...interview,
      status: 'completed',
      lastUpdated: new Date().toISOString(),
    };

    setInterview(completedInterview);
    onComplete?.(completedInterview);
  }, [interview, onComplete]);

  const resetInterview = useCallback(() => {
    setInterview(null);
    setError(null);
    setIsLoading(false);
    apiClientRef.current = null;
  }, []);

  // Computed values
  const canProceed = interview ? 
    interview.evidence.length > 0 && hasInitialEvidence(interview.evidence) : 
    false;

  const progressPercentage = interview ? 
    Math.min((interview.questionCount / 20) * 100, 100) : 
    0;

  return {
    interview,
    isLoading,
    error,
    startInterview,
    answerQuestion,
    addSymptom,
    parseSymptoms,
    getTriage,
    completeInterview,
    resetInterview,
    canProceed,
    progressPercentage,
  };
};
