import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Stethoscope,
  Brain,
  Activity
} from 'lucide-react';
import { useMedicalInterview } from '../../hooks/useMedicalInterview';
import { useAuth } from '../../hooks/useAuth';
import { 
  DiagnosisChatMessage, 
  InfermedicaQuestion,
  InfermedicaCondition,
  InfermedicaTriageResponse 
} from '../../types';
import { formatConditionProbability, getTriageLevelColor, getTriageLevelIcon } from '../../services/infermedicaApi';
import { formatDistanceToNow } from 'date-fns';

interface DiagnosisChatbotProps {
  onDiagnosisComplete?: (conditions: InfermedicaCondition[], triage?: InfermedicaTriageResponse) => void;
  className?: string;
}

const DiagnosisChatbot: React.FC<DiagnosisChatbotProps> = ({
  onDiagnosisComplete,
  className = '',
}) => {
  const { user } = useAuth();
  const [chatHistory, setChatHistory] = useState<DiagnosisChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [patientInfo, setPatientInfo] = useState<{ age: number; sex: 'male' | 'female' } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    interview,
    isLoading,
    error,
    startInterview,
    answerQuestion,
    parseSymptoms,
    getTriage,
    completeInterview,
    resetInterview,
    progressPercentage,
  } = useMedicalInterview({
    onError: (error) => {
      addMessage('system', `Error: ${error}`, { triageLevel: 'error' });
    },
    onComplete: (completedInterview) => {
      addMessage('bot', 'Thank you for completing the medical assessment. Based on your responses, here are the possible conditions:', {
        conditionsUpdated: true,
      });
      
      if (completedInterview.triageResult) {
        onDiagnosisComplete?.(completedInterview.conditions, completedInterview.triageResult);
      } else {
        // Get triage if not already available
        getTriage().then(triage => {
          if (triage) {
            onDiagnosisComplete?.(completedInterview.conditions, triage);
          }
        });
      }
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Initialize chat
  useEffect(() => {
    if (!isInitialized) {
      addMessage('bot', 'Hello! I\'m your AI medical assistant. I can help you understand your symptoms and provide preliminary health guidance.');
      addMessage('bot', 'Please note: This is not a substitute for professional medical advice. Always consult with a healthcare provider for serious concerns.');
      addMessage('bot', 'To get started, please tell me your age and sex, then describe your symptoms.');
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const addMessage = (
    type: 'user' | 'bot' | 'system',
    content: string,
    metadata?: any
  ) => {
    const message: DiagnosisChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date().toISOString(),
      metadata,
    };
    setChatHistory(prev => [...prev, message]);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const message = userInput.trim();
    setUserInput('');
    addMessage('user', message);

    // If not initialized, try to extract patient info
    if (!patientInfo) {
      const ageMatch = message.match(/(\d+)\s*(?:years?\s*old|yo|y\.o\.?)/i);
      const sexMatch = message.match(/\b(male|female|man|woman|boy|girl)\b/i);
      
      if (ageMatch && sexMatch) {
        const age = parseInt(ageMatch[1]);
        const sexInput = sexMatch[1].toLowerCase();
        const sex = ['male', 'man', 'boy'].includes(sexInput) ? 'male' : 'female';
        
        if (age >= 0 && age <= 120) {
          setPatientInfo({ age, sex });
          addMessage('bot', `Thank you! I understand you are a ${age}-year-old ${sex}. Now, please describe your symptoms in detail.`);
          return;
        }
      }
      
      addMessage('bot', 'I need your age and sex to provide accurate guidance. Please tell me: "I am a [age]-year-old [male/female]" and then describe your symptoms.');
      return;
    }

    // If we have patient info but no interview started, parse symptoms and start
    if (patientInfo && !interview) {
      try {
        addMessage('bot', 'Let me analyze your symptoms...');
        
        const nlpResponse = await parseSymptoms(message);
        
        if (nlpResponse && nlpResponse.mentions.length > 0) {
          const symptomIds = nlpResponse.mentions
            .filter(mention => mention.choice_id === 'present')
            .map(mention => mention.id);
          
          if (symptomIds.length > 0) {
            await startInterview(patientInfo.age, patientInfo.sex, symptomIds);
            addMessage('bot', `I've identified the following symptoms: ${nlpResponse.mentions.map(m => m.name).join(', ')}. Let me ask you some questions to better understand your condition.`);
          } else {
            addMessage('bot', 'I couldn\'t identify specific symptoms from your description. Could you please be more specific? For example: "I have a headache and fever"');
          }
        } else {
          addMessage('bot', 'I couldn\'t identify specific symptoms from your description. Could you please be more specific? For example: "I have a headache and fever"');
        }
      } catch (error) {
        addMessage('bot', 'I\'m having trouble processing your symptoms. Could you please describe them differently?');
      }
      return;
    }

    // If interview is active, handle general responses
    if (interview && interview.currentQuestion) {
      addMessage('bot', 'Please answer the current question using the provided options, or type "skip" if you\'re unsure.');
      return;
    }

    // General conversation
    addMessage('bot', 'I\'m here to help with medical questions. Please describe your symptoms or ask about your health concerns.');
  };

  const handleQuestionAnswer = async (evidenceId: string, choiceId: 'present' | 'absent' | 'unknown') => {
    await answerQuestion(evidenceId, choiceId);
    
    const choiceText = choiceId === 'present' ? 'Yes' : choiceId === 'absent' ? 'No' : 'I don\'t know';
    addMessage('user', choiceText, { evidenceAdded: [{ id: evidenceId, choice_id: choiceId }] });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderQuestion = (question: InfermedicaQuestion) => {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <div className="flex items-start space-x-3">
          <Bot className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <p className="text-blue-900 font-medium mb-3">{question.text}</p>
            
            {question.items.map((item) => (
              <div key={item.id} className="mb-3 last:mb-0">
                <p className="text-sm text-blue-800 mb-2">{item.name}</p>
                <div className="flex flex-wrap gap-2">
                  {item.choices.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => handleQuestionAnswer(item.id, choice.id as any)}
                      disabled={isLoading}
                      className="px-3 py-1 text-sm bg-white border border-blue-300 rounded-md hover:bg-blue-50 disabled:opacity-50 transition-colors"
                    >
                      {choice.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderConditions = (conditions: InfermedicaCondition[]) => {
    if (conditions.length === 0) return null;

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
        <div className="flex items-start space-x-3">
          <Stethoscope className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="text-green-900 font-medium mb-3">Possible Conditions</h4>
            <div className="space-y-2">
              {conditions.slice(0, 5).map((condition) => (
                <div key={condition.id} className="flex items-center justify-between bg-white rounded-md p-2">
                  <div>
                    <p className="font-medium text-gray-900">{condition.name}</p>
                    {condition.common_name && condition.common_name !== condition.name && (
                      <p className="text-sm text-gray-600">{condition.common_name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      {formatConditionProbability(condition.probability)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.round(condition.probability * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTriage = (triage: InfermedicaTriageResponse) => {
    const colorClass = getTriageLevelColor(triage.triage_level);
    const icon = getTriageLevelIcon(triage.triage_level);

    return (
      <div className={`border rounded-lg p-4 mt-4 ${colorClass}`}>
        <div className="flex items-start space-x-3">
          <span className="text-2xl">{icon}</span>
          <div className="flex-1">
            <h4 className="font-medium mb-2">{triage.label}</h4>
            <p className="text-sm mb-3">{triage.description}</p>
            
            {triage.serious.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Serious conditions to consider:</p>
                <ul className="text-sm space-y-1">
                  {triage.serious.map((condition) => (
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
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-card overflow-hidden flex flex-col ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">AI Medical Assistant</h3>
              <p className="text-sm text-gray-600">Powered by Infermedica Health API</p>
            </div>
          </div>
          
          {interview && (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Progress</p>
                <p className="text-xs text-gray-600">{Math.round(progressPercentage)}%</p>
              </div>
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0" style={{ maxHeight: '500px' }}>
        {chatHistory.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-xs lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} space-x-2`}>
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : message.type === 'system'
                    ? 'bg-red-500 text-white'
                    : 'bg-green-500 text-white'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : message.type === 'system' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
              </div>

              {/* Message bubble */}
              <div className={`${message.type === 'user' ? 'ml-2' : 'mr-2'}`}>
                <div className={`px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : message.type === 'system'
                    ? 'bg-red-100 text-red-900'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                
                <div className={`flex items-center space-x-1 mt-1 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Current question */}
        {interview?.currentQuestion && renderQuestion(interview.currentQuestion)}

        {/* Current conditions */}
        {interview?.conditions && interview.conditions.length > 0 && renderConditions(interview.conditions)}

        {/* Triage result */}
        {interview?.triageResult && renderTriage(interview.triageResult)}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-2">
              <Activity className="w-4 h-4 text-gray-500 animate-pulse" />
              <span className="text-sm text-gray-600">Analyzing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                !patientInfo 
                  ? "Tell me your age and sex, then describe your symptoms..."
                  : interview?.currentQuestion
                  ? "Use the buttons above to answer, or type here..."
                  : "Describe your symptoms or ask a question..."
              }
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!userInput.trim() || isLoading}
            className="flex-shrink-0 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Disclaimer */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          <p>⚠️ This is for informational purposes only. Always consult a healthcare professional for medical advice.</p>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisChatbot;
