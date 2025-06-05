import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  X, 
  User, 
  Calendar,
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { InfermedicaApiClient } from '../../services/infermedicaApi';
import { 
  InfermedicaSymptom, 
  InfermedicaSearchResult, 
  InfermedicaEvidence,
  InfermedicaCondition,
  InfermedicaTriageResponse 
} from '../../types';
import { formatConditionProbability, getTriageLevelColor, getTriageLevelIcon } from '../../services/infermedicaApi';

interface SymptomCheckerProps {
  onDiagnosisComplete?: (conditions: InfermedicaCondition[], triage: InfermedicaTriageResponse) => void;
  className?: string;
}

interface SelectedSymptom {
  id: string;
  name: string;
  choice: 'present' | 'absent' | 'unknown';
}

const SymptomChecker: React.FC<SymptomCheckerProps> = ({
  onDiagnosisComplete,
  className = '',
}) => {
  const [step, setStep] = useState<'patient-info' | 'symptoms' | 'results'>('patient-info');
  const [patientInfo, setPatientInfo] = useState({ age: '', sex: '' as 'male' | 'female' | '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<InfermedicaSearchResult[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<SelectedSymptom[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    conditions: InfermedicaCondition[];
    triage: InfermedicaTriageResponse | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiClient = new InfermedicaApiClient();

  // Search for symptoms
  useEffect(() => {
    const searchSymptoms = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await apiClient.search(
          searchQuery,
          patientInfo.sex || undefined,
          patientInfo.age ? parseInt(patientInfo.age) : undefined,
          'symptom'
        );
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchSymptoms, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, patientInfo.sex, patientInfo.age]);

  const handlePatientInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientInfo.age && patientInfo.sex) {
      setStep('symptoms');
    }
  };

  const addSymptom = (symptom: InfermedicaSearchResult) => {
    if (!selectedSymptoms.find(s => s.id === symptom.id)) {
      setSelectedSymptoms(prev => [...prev, {
        id: symptom.id,
        name: symptom.label,
        choice: 'present'
      }]);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const removeSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev => prev.filter(s => s.id !== symptomId));
  };

  const updateSymptomChoice = (symptomId: string, choice: 'present' | 'absent' | 'unknown') => {
    setSelectedSymptoms(prev => 
      prev.map(s => s.id === symptomId ? { ...s, choice } : s)
    );
  };

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const evidence: InfermedicaEvidence[] = selectedSymptoms.map((symptom, index) => ({
        id: symptom.id,
        choice_id: symptom.choice,
        source: 'initial' as const,
        initial: index === 0,
      }));

      const patient = {
        sex: patientInfo.sex,
        age: { value: parseInt(patientInfo.age) },
        evidence,
      };

      // Get diagnosis
      const diagnosisResponse = await apiClient.getDiagnosis(patient);
      
      // Get triage
      const triageResponse = await apiClient.getTriage(patient);

      const analysisResults = {
        conditions: diagnosisResponse.conditions,
        triage: triageResponse,
      };

      setResults(analysisResults);
      setStep('results');
      onDiagnosisComplete?.(analysisResults.conditions, triageResponse);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze symptoms');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetChecker = () => {
    setStep('patient-info');
    setPatientInfo({ age: '', sex: '' });
    setSelectedSymptoms([]);
    setResults(null);
    setError(null);
  };

  const renderPatientInfoStep = () => (
    <div className="p-6">
      <div className="text-center mb-6">
        <User className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Information</h2>
        <p className="text-gray-600">Please provide some basic information to get started</p>
      </div>

      <form onSubmit={handlePatientInfoSubmit} className="max-w-md mx-auto space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
          <input
            type="number"
            min="0"
            max="120"
            value={patientInfo.age}
            onChange={(e) => setPatientInfo(prev => ({ ...prev, age: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter age"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sex</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPatientInfo(prev => ({ ...prev, sex: 'male' }))}
              className={`p-3 border rounded-md text-center transition-colors ${
                patientInfo.sex === 'male'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => setPatientInfo(prev => ({ ...prev, sex: 'female' }))}
              className={`p-3 border rounded-md text-center transition-colors ${
                patientInfo.sex === 'female'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              Female
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!patientInfo.age || !patientInfo.sex}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue to Symptoms
        </button>
      </form>
    </div>
  );

  const renderSymptomsStep = () => (
    <div className="p-6">
      <div className="text-center mb-6">
        <Stethoscope className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Symptom Selection</h2>
        <p className="text-gray-600">Search and select your symptoms</p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symptoms (e.g., headache, fever, cough)"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="mt-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => addSymptom(result)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-900">{result.label}</span>
                  <Plus className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        )}

        {isSearching && (
          <div className="mt-2 text-center text-sm text-gray-500">
            Searching...
          </div>
        )}
      </div>

      {/* Selected symptoms */}
      {selectedSymptoms.length > 0 && (
        <div className="max-w-2xl mx-auto mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Selected Symptoms</h3>
          <div className="space-y-3">
            {selectedSymptoms.map((symptom) => (
              <div key={symptom.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <span className="font-medium text-gray-900">{symptom.name}</span>
                <div className="flex items-center space-x-2">
                  <select
                    value={symptom.choice}
                    onChange={(e) => updateSymptomChoice(symptom.id, e.target.value as any)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="unknown">Unknown</option>
                  </select>
                  <button
                    onClick={() => removeSymptom(symptom.id)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="max-w-md mx-auto flex space-x-3">
        <button
          onClick={() => setStep('patient-info')}
          className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={analyzeSymptoms}
          disabled={selectedSymptoms.length === 0 || isAnalyzing}
          className="flex-1 py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Symptoms'}
        </button>
      </div>

      {error && (
        <div className="max-w-md mx-auto mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderResultsStep = () => {
    if (!results) return null;

    return (
      <div className="p-6">
        <div className="text-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Results</h2>
          <p className="text-gray-600">Based on your symptoms</p>
        </div>

        {/* Triage */}
        {results.triage && (
          <div className={`max-w-2xl mx-auto mb-6 border rounded-lg p-4 ${getTriageLevelColor(results.triage.triage_level)}`}>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{getTriageLevelIcon(results.triage.triage_level)}</span>
              <div className="flex-1">
                <h3 className="font-medium mb-2">{results.triage.label}</h3>
                <p className="text-sm mb-3">{results.triage.description}</p>
                
                {results.triage.serious.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Serious conditions to consider:</p>
                    <ul className="text-sm space-y-1">
                      {results.triage.serious.map((condition) => (
                        <li key={condition.id} className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{condition.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Conditions */}
        {results.conditions.length > 0 && (
          <div className="max-w-2xl mx-auto mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Possible Conditions</h3>
            <div className="space-y-3">
              {results.conditions.map((condition) => (
                <div key={condition.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{condition.name}</h4>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">
                        {formatConditionProbability(condition.probability)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round(condition.probability * 100)}%
                      </p>
                    </div>
                  </div>
                  
                  {condition.common_name && condition.common_name !== condition.name && (
                    <p className="text-sm text-gray-600 mb-2">{condition.common_name}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {condition.acuteness && (
                      <span className="capitalize">{condition.acuteness.replace(/_/g, ' ')}</span>
                    )}
                    {condition.severity && (
                      <span className="capitalize">{condition.severity}</span>
                    )}
                    {condition.prevalence && (
                      <span className="capitalize">{condition.prevalence.replace(/_/g, ' ')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="max-w-md mx-auto">
          <button
            onClick={resetChecker}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Start New Assessment
          </button>
        </div>

        {/* Disclaimer */}
        <div className="max-w-2xl mx-auto mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Important Disclaimer</p>
              <p>
                This assessment is for informational purposes only and should not replace professional medical advice. 
                Always consult with a healthcare provider for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-card overflow-hidden ${className}`}>
      {/* Progress indicator */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium text-gray-900">Symptom Checker</h1>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'patient-info' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
            }`}>
              1
            </div>
            <div className={`w-8 h-1 ${step !== 'patient-info' ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'symptoms' ? 'bg-blue-500 text-white' : 
              step === 'results' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <div className={`w-8 h-1 ${step === 'results' ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'results' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {step === 'patient-info' && renderPatientInfoStep()}
      {step === 'symptoms' && renderSymptomsStep()}
      {step === 'results' && renderResultsStep()}
    </div>
  );
};

export default SymptomChecker;
