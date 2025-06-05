import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ConsultationSession } from '../../types';
import VideoConsultationDemo from '../../components/video/VideoConsultationDemo';
import ChatDemo from '../../components/chat/ChatDemo';

const ConsultationPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<ConsultationSession | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching consultation session
    const mockSession: ConsultationSession = {
      id: id || '1',
      appointmentId: '123',
      patientId: '1',
      doctorId: '2',
      startTime: new Date().toISOString(),
      status: 'active',
      messages: [],
      videoSession: {
        channelName: `telemed_${id || '1'}`,
        isVideoEnabled: true,
        isAudioEnabled: true,
        isConnected: false,
        participants: [],
      },
    };
    setSession(mockSession);
  }, [id]);



  const handleVideoError = (error: string) => {
    setVideoError(error);
    console.error('Video consultation error:', error);
  };

  const handleParticipantCountChange = (count: number) => {
    setParticipantCount(count);
  };

  if (!session) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading consultation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Video Consultation</h1>
              <p className="text-gray-600 mt-1">
                Session with {user?.role === 'doctor' ? 'Patient' : 'Dr. Smith'} • Session ID: {session.id}
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {videoError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="text-red-800 font-medium">Video Error</h3>
                <p className="text-red-700 text-sm mt-1">{videoError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Area */}
          <div className="lg:col-span-2">
            <VideoConsultationDemo
              consultationId={session.id}
              autoStart={false}
              onError={handleVideoError}
              onParticipantCountChange={handleParticipantCountChange}
            />
          </div>

          {/* Chat Area */}
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Consultation Chat
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Real-time messaging with SendBird
              </p>
            </div>

            {/* SendBird Chat Demo */}
            <div className="h-96">
              <ChatDemo
                channelName={`Consultation ${session.id}`}
                participants={[
                  { id: 'doctor_1', name: 'Dr. Sarah Johnson', role: 'doctor' },
                  { id: 'patient_1', name: user?.name || 'Patient', role: 'patient' }
                ]}
                className="h-full border-0 shadow-none rounded-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationPage;