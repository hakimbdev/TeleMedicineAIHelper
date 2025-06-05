import React, { useState } from 'react';
import { ArrowLeft, Stethoscope, Brain, MessageSquare, Search, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DiagnosisChatbot from '../../components/diagnosis/DiagnosisChatbot';
import SymptomChecker from '../../components/diagnosis/SymptomChecker';
import { InfermedicaCondition, InfermedicaTriageResponse } from '../../types';

const ChatbotPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'chatbot' | 'checker'>('chatbot');
  const [diagnosisResults, setDiagnosisResults] = useState<{
    conditions: InfermedicaCondition[];
    triage?: InfermedicaTriageResponse;
  } | null>(null);
  const handleDiagnosisComplete = (conditions: InfermedicaCondition[], triage?: InfermedicaTriageResponse) => {
    setDiagnosisResults({ conditions, triage });
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Medical Assistant</h1>
                <p className="text-gray-600">Powered by Infermedica Health API</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Infermedica Connected</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('chatbot')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'chatbot'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>AI Chatbot</span>
            </button>
            <button
              onClick={() => setActiveTab('checker')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'checker'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Symptom Checker</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          {activeTab === 'chatbot' ? (
            <DiagnosisChatbot
              onDiagnosisComplete={handleDiagnosisComplete}
              className="h-[600px]"
            />
          ) : (
            <SymptomChecker
              onDiagnosisComplete={handleDiagnosisComplete}
              className="min-h-[600px]"
            />
          )}
        </div>

        {/* Features Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">AI-Powered Diagnosis</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Advanced medical AI analyzes symptoms and provides preliminary diagnosis suggestions
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Stethoscope className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-sm font-medium text-green-900">Medical Knowledge Base</h3>
                <p className="text-sm text-green-700 mt-1">
                  Access to comprehensive medical database with thousands of conditions and symptoms
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-purple-500" />
              <div>
                <h3 className="text-sm font-medium text-purple-900">Triage Recommendations</h3>
                <p className="text-sm text-purple-700 mt-1">
                  Get guidance on urgency level and appropriate next steps for your health concerns
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnosis Results */}
        {diagnosisResults && (
          <div className="mt-6 bg-white rounded-xl shadow-card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Latest Diagnosis Results</h2>

            {diagnosisResults.triage && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Triage Recommendation</h3>
                <div className={`border rounded-lg p-4 ${
                  diagnosisResults.triage.triage_level === 'emergency'
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : diagnosisResults.triage.triage_level === 'consultation'
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-900'
                    : 'bg-green-50 border-green-200 text-green-900'
                }`}>
                  <h4 className="font-medium mb-2">{diagnosisResults.triage.label}</h4>
                  <p className="text-sm">{diagnosisResults.triage.description}</p>
                </div>
              </div>
            )}

            {diagnosisResults.conditions.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Possible Conditions</h3>
                <div className="space-y-3">
                  {diagnosisResults.conditions.slice(0, 5).map((condition) => (
                    <div key={condition.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{condition.name}</h4>
                        {condition.common_name && condition.common_name !== condition.name && (
                          <p className="text-sm text-gray-600">{condition.common_name}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-600">
                          {Math.round(condition.probability * 100)}%
                        </p>
                        <p className="text-xs text-gray-500">probability</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 text-yellow-600 flex-shrink-0">⚠️</div>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Medical Disclaimer</p>
              <p>
                This AI assistant provides preliminary health information based on symptoms and should not replace
                professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare
                provider for medical concerns, especially in emergency situations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;