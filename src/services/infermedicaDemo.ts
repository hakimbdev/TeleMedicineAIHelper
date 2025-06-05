// Demo implementation of Infermedica API for development and testing
import {
  InfermedicaPatient,
  InfermedicaDiagnosisResponse,
  InfermedicaSymptom,
  InfermedicaCondition,
  InfermedicaTriageResponse,
  InfermedicaSearchResult,
  InfermedicaNLPResponse,
  InfermedicaEvidence
} from '../types';

// Demo symptoms database
const DEMO_SYMPTOMS: InfermedicaSymptom[] = [
  {
    id: 's_1193',
    name: 'Headache',
    common_name: 'Head pain',
    question: 'Do you have a headache?',
    category: 'neurological',
    seriousness: 'moderate',
  },
  {
    id: 's_488',
    name: 'Photophobia',
    common_name: 'Light sensitivity',
    question: 'Are you sensitive to light?',
    category: 'neurological',
    seriousness: 'moderate',
  },
  {
    id: 's_418',
    name: 'Neck stiffness',
    common_name: 'Stiff neck',
    question: 'Do you have neck stiffness?',
    category: 'musculoskeletal',
    seriousness: 'serious',
  },
  {
    id: 's_98',
    name: 'Fever',
    common_name: 'High temperature',
    question: 'Do you have a fever?',
    category: 'general',
    seriousness: 'moderate',
  },
  {
    id: 's_13',
    name: 'Cough',
    common_name: 'Coughing',
    question: 'Do you have a cough?',
    category: 'respiratory',
    seriousness: 'mild',
  },
  {
    id: 's_21',
    name: 'Shortness of breath',
    common_name: 'Difficulty breathing',
    question: 'Do you have shortness of breath?',
    category: 'respiratory',
    seriousness: 'serious',
  },
  {
    id: 's_102',
    name: 'Chest pain',
    common_name: 'Pain in chest',
    question: 'Do you have chest pain?',
    category: 'cardiovascular',
    seriousness: 'serious',
  },
  {
    id: 's_15',
    name: 'Nausea',
    common_name: 'Feeling sick',
    question: 'Do you feel nauseous?',
    category: 'gastrointestinal',
    seriousness: 'mild',
  },
  {
    id: 's_28',
    name: 'Vomiting',
    common_name: 'Being sick',
    question: 'Have you been vomiting?',
    category: 'gastrointestinal',
    seriousness: 'moderate',
  },
  {
    id: 's_1394',
    name: 'Fatigue',
    common_name: 'Tiredness',
    question: 'Do you feel unusually tired?',
    category: 'general',
    seriousness: 'mild',
  },
];

// Demo conditions database
const DEMO_CONDITIONS: InfermedicaCondition[] = [
  {
    id: 'c_49',
    name: 'Migraine',
    common_name: 'Migraine headache',
    probability: 0.0,
    acuteness: 'acute_potentially_chronic',
    severity: 'moderate',
    categories: ['neurological'],
    prevalence: 'common',
  },
  {
    id: 'c_151',
    name: 'Meningitis',
    common_name: 'Brain infection',
    probability: 0.0,
    acuteness: 'acute',
    severity: 'severe',
    categories: ['neurological', 'infectious'],
    prevalence: 'rare',
  },
  {
    id: 'c_55',
    name: 'Tension-type headache',
    common_name: 'Tension headache',
    probability: 0.0,
    acuteness: 'acute_potentially_chronic',
    severity: 'mild',
    categories: ['neurological'],
    prevalence: 'very_common',
  },
  {
    id: 'c_544',
    name: 'Common cold',
    common_name: 'Cold',
    probability: 0.0,
    acuteness: 'acute',
    severity: 'mild',
    categories: ['respiratory', 'infectious'],
    prevalence: 'very_common',
  },
  {
    id: 'c_340',
    name: 'Influenza',
    common_name: 'Flu',
    probability: 0.0,
    acuteness: 'acute',
    severity: 'moderate',
    categories: ['respiratory', 'infectious'],
    prevalence: 'common',
  },
  {
    id: 'c_62',
    name: 'Pneumonia',
    common_name: 'Lung infection',
    probability: 0.0,
    acuteness: 'acute',
    severity: 'severe',
    categories: ['respiratory', 'infectious'],
    prevalence: 'moderate',
  },
];

class InfermedicaDemoClient {
  private questionCount = 0;
  private maxQuestions = 5;

  // Simulate diagnosis API
  async getDiagnosis(patient: InfermedicaPatient): Promise<InfermedicaDiagnosisResponse> {
    await this.simulateDelay();

    const presentSymptoms = patient.evidence.filter(e => e.choice_id === 'present');
    const conditions = this.calculateConditions(presentSymptoms);
    
    this.questionCount++;
    const shouldStop = this.questionCount >= this.maxQuestions || presentSymptoms.length >= 4;
    
    let question = null;
    if (!shouldStop) {
      question = this.generateQuestion(presentSymptoms);
    }

    return {
      question,
      conditions,
      should_stop: shouldStop,
    };
  }

  // Simulate search API
  async search(phrase: string): Promise<InfermedicaSearchResult[]> {
    await this.simulateDelay(300);

    const searchTerm = phrase.toLowerCase();
    const results = DEMO_SYMPTOMS
      .filter(symptom => 
        symptom.name.toLowerCase().includes(searchTerm) ||
        symptom.common_name?.toLowerCase().includes(searchTerm)
      )
      .slice(0, 8)
      .map(symptom => ({
        id: symptom.id,
        label: symptom.name,
        type: 'symptom' as const,
      }));

    return results;
  }

  // Simulate NLP parsing
  async parseText(text: string): Promise<InfermedicaNLPResponse> {
    await this.simulateDelay(500);

    const mentions = [];
    const lowerText = text.toLowerCase();

    // Simple keyword matching for demo
    for (const symptom of DEMO_SYMPTOMS) {
      const keywords = [
        symptom.name.toLowerCase(),
        symptom.common_name?.toLowerCase(),
      ].filter(Boolean);

      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          mentions.push({
            id: symptom.id,
            name: symptom.name,
            common_name: symptom.common_name,
            orth: keyword,
            choice_id: 'present' as const,
            type: 'symptom' as const,
          });
          break;
        }
      }
    }

    return {
      mentions,
      obvious: mentions.length > 0,
    };
  }

  // Simulate triage API
  async getTriage(patient: InfermedicaPatient): Promise<InfermedicaTriageResponse> {
    await this.simulateDelay();

    const presentSymptoms = patient.evidence.filter(e => e.choice_id === 'present');
    const seriousSymptoms = presentSymptoms.filter(evidence => {
      const symptom = DEMO_SYMPTOMS.find(s => s.id === evidence.id);
      return symptom?.seriousness === 'serious' || symptom?.seriousness === 'emergency';
    });

    let triageLevel: 'emergency' | 'consultation' | 'self_care';
    let label: string;
    let description: string;
    let serious: InfermedicaCondition[] = [];

    if (seriousSymptoms.length > 0) {
      triageLevel = 'emergency';
      label = 'Emergency Care Recommended';
      description = 'Your symptoms suggest a potentially serious condition that requires immediate medical attention.';
      serious = DEMO_CONDITIONS.filter(c => c.severity === 'severe').slice(0, 2);
    } else if (presentSymptoms.length >= 3) {
      triageLevel = 'consultation';
      label = 'Medical Consultation Recommended';
      description = 'Your symptoms suggest you should consult with a healthcare provider for proper evaluation.';
      serious = DEMO_CONDITIONS.filter(c => c.severity === 'moderate').slice(0, 1);
    } else {
      triageLevel = 'self_care';
      label = 'Self-Care May Be Appropriate';
      description = 'Your symptoms may be manageable with self-care, but monitor for any worsening.';
    }

    return {
      triage_level: triageLevel,
      label,
      description,
      serious,
    };
  }

  // Helper methods
  private async simulateDelay(ms: number = 800): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private calculateConditions(presentSymptoms: InfermedicaEvidence[]): InfermedicaCondition[] {
    const conditions = [...DEMO_CONDITIONS];
    
    // Simple scoring based on symptom matches
    conditions.forEach(condition => {
      let score = 0;
      
      // Headache conditions
      if (condition.id === 'c_49' || condition.id === 'c_55') { // Migraine or tension headache
        if (presentSymptoms.some(s => s.id === 's_1193')) score += 0.6; // headache
        if (presentSymptoms.some(s => s.id === 's_488')) score += 0.3; // light sensitivity
      }
      
      // Serious neurological condition
      if (condition.id === 'c_151') { // Meningitis
        if (presentSymptoms.some(s => s.id === 's_1193')) score += 0.2; // headache
        if (presentSymptoms.some(s => s.id === 's_418')) score += 0.4; // neck stiffness
        if (presentSymptoms.some(s => s.id === 's_98')) score += 0.3; // fever
      }
      
      // Respiratory conditions
      if (condition.id === 'c_544' || condition.id === 'c_340') { // Cold or flu
        if (presentSymptoms.some(s => s.id === 's_13')) score += 0.4; // cough
        if (presentSymptoms.some(s => s.id === 's_98')) score += 0.3; // fever
        if (presentSymptoms.some(s => s.id === 's_1394')) score += 0.2; // fatigue
      }
      
      if (condition.id === 'c_62') { // Pneumonia
        if (presentSymptoms.some(s => s.id === 's_13')) score += 0.3; // cough
        if (presentSymptoms.some(s => s.id === 's_21')) score += 0.4; // shortness of breath
        if (presentSymptoms.some(s => s.id === 's_98')) score += 0.2; // fever
      }
      
      condition.probability = Math.min(score, 0.95);
    });
    
    return conditions
      .filter(c => c.probability > 0.1)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);
  }

  private generateQuestion(presentSymptoms: InfermedicaEvidence[]): any {
    const usedSymptomIds = presentSymptoms.map(s => s.id);
    const availableSymptoms = DEMO_SYMPTOMS.filter(s => !usedSymptomIds.includes(s.id));
    
    if (availableSymptoms.length === 0) {
      return null;
    }
    
    // Pick a relevant symptom based on what's already present
    let nextSymptom = availableSymptoms[0];
    
    // If headache is present, ask about related symptoms
    if (presentSymptoms.some(s => s.id === 's_1193')) {
      const relatedSymptom = availableSymptoms.find(s => s.id === 's_488' || s.id === 's_98');
      if (relatedSymptom) nextSymptom = relatedSymptom;
    }
    
    // If respiratory symptoms, ask about related ones
    if (presentSymptoms.some(s => s.id === 's_13')) {
      const relatedSymptom = availableSymptoms.find(s => s.id === 's_21' || s.id === 's_98');
      if (relatedSymptom) nextSymptom = relatedSymptom;
    }

    return {
      type: 'single',
      text: nextSymptom.question,
      items: [
        {
          id: nextSymptom.id,
          name: nextSymptom.name,
          choices: [
            { id: 'present', label: 'Yes' },
            { id: 'absent', label: 'No' },
            { id: 'unknown', label: "I don't know" },
          ],
        },
      ],
      extras: {},
    };
  }

  // Reset for new interview
  reset(): void {
    this.questionCount = 0;
  }
}

export { InfermedicaDemoClient };
