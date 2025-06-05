import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Monitor,
  Settings,
  Users,
  Wifi,
  WifiOff,
  User,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface VideoConsultationDemoProps {
  consultationId: string;
  autoStart?: boolean;
  onError?: (error: string) => void;
  onParticipantCountChange?: (count: number) => void;
}

const VideoConsultationDemo: React.FC<VideoConsultationDemoProps> = ({
  consultationId,
  autoStart = false,
  onError,
  onParticipantCountChange,
}) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Simulate getting user media
  useEffect(() => {
    if (isConnected && localVideoRef.current) {
      navigator.mediaDevices.getUserMedia({ 
        video: isVideoEnabled, 
        audio: isAudioEnabled 
      })
      .then(stream => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch(error => {
        console.error('Error accessing media devices:', error);
        setConnectionError('Failed to access camera/microphone');
        onError?.('Failed to access camera/microphone');
      });
    }
  }, [isConnected, isVideoEnabled, isAudioEnabled, onError]);

  // Simulate participants
  useEffect(() => {
    if (isConnected) {
      const mockParticipants = [
        {
          uid: 'local',
          userId: user?.id || 'user1',
          name: user?.name || 'You',
          role: user?.role || 'patient',
          isVideoEnabled,
          isAudioEnabled,
          joinedAt: new Date().toISOString(),
        },
        {
          uid: 'remote1',
          userId: 'doctor1',
          name: user?.role === 'doctor' ? 'Patient Smith' : 'Dr. Johnson',
          role: user?.role === 'doctor' ? 'patient' : 'doctor',
          isVideoEnabled: true,
          isAudioEnabled: true,
          joinedAt: new Date().toISOString(),
        }
      ];
      setParticipants(mockParticipants);
      onParticipantCountChange?.(mockParticipants.length);
    } else {
      setParticipants([]);
      onParticipantCountChange?.(0);
    }
  }, [isConnected, isVideoEnabled, isAudioEnabled, user, onParticipantCountChange]);

  const handleConnect = async () => {
    setIsInitializing(true);
    setConnectionError(null);
    
    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(true);
      setIsInitializing(false);
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setParticipants([]);
    
    // Stop local video stream
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'doctor':
        return 'bg-blue-500';
      case 'patient':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      {/* Connection status bar */}
      <div className={`px-4 py-2 text-sm flex items-center justify-between ${
        isConnected ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
      }`}>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          <span>
            {isConnected 
              ? `Connected to telemed_${consultationId}` 
              : 'Not connected'
            }
          </span>
        </div>
        <span className="text-xs">
          {participants.length} participant{participants.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Error Display */}
      {connectionError && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{connectionError}</p>
          </div>
        </div>
      )}

      {/* Video grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Local participant */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            {isVideoEnabled && isConnected ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <div className={`w-16 h-16 rounded-full ${getRoleColor(user?.role || 'patient')} flex items-center justify-center mb-2 mx-auto`}>
                    <User className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-medium">{user?.name || 'You'}</span>
                </div>
              </div>
            )}
            
            {/* Local participant overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm font-medium">
                    {user?.name || 'You'} (You)
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full text-white ${getRoleColor(user?.role || 'patient')}`}>
                    {user?.role || 'patient'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <div className={`p-1 rounded-full ${isAudioEnabled ? 'bg-green-500' : 'bg-red-500'}`}>
                    {isAudioEnabled ? (
                      <Mic className="w-3 h-3 text-white" />
                    ) : (
                      <MicOff className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className={`p-1 rounded-full ${isVideoEnabled ? 'bg-green-500' : 'bg-red-500'}`}>
                    {isVideoEnabled ? (
                      <Video className="w-3 h-3 text-white" />
                    ) : (
                      <VideoOff className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Live indicator */}
            <div className="absolute top-2 right-2">
              <div className="flex items-center space-x-1 bg-black/50 rounded-full px-2 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-white text-xs">Live</span>
              </div>
            </div>
          </div>

          {/* Remote participant */}
          {isConnected && participants.length > 1 && (
            <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <div className={`w-16 h-16 rounded-full ${getRoleColor(participants[1].role)} flex items-center justify-center mb-2 mx-auto`}>
                    <User className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-medium">{participants[1].name}</span>
                </div>
              </div>
              
              {/* Remote participant overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-white text-sm font-medium">
                      {participants[1].name}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full text-white ${getRoleColor(participants[1].role)}`}>
                      {participants[1].role}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <div className="p-1 rounded-full bg-green-500">
                      <Mic className="w-3 h-3 text-white" />
                    </div>
                    <div className="p-1 rounded-full bg-green-500">
                      <Video className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder when no participants */}
          {!isConnected && (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center lg:col-span-2">
              <div className="text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Wifi className="w-8 h-8" />
                </div>
                <p className="font-medium">Ready for Video Consultation</p>
                <p className="text-sm mt-1">Click connect to join the video consultation</p>
              </div>
            </div>
          )}
        </div>

        {/* Video controls */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            {/* Left side - Connection info */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}></div>
                <span className="text-white text-sm font-medium">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {participants.length > 0 && (
                <div className="flex items-center space-x-1 text-gray-300">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{participants.length}</span>
                </div>
              )}
            </div>

            {/* Center - Main controls */}
            <div className="flex items-center space-x-2">
              {/* Audio toggle */}
              <button
                onClick={toggleAudio}
                disabled={isInitializing}
                className={`p-3 rounded-full transition-colors ${
                  isAudioEnabled
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                } ${isInitializing ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
              >
                {isAudioEnabled ? (
                  <Mic className="w-5 h-5" />
                ) : (
                  <MicOff className="w-5 h-5" />
                )}
              </button>

              {/* Video toggle */}
              <button
                onClick={toggleVideo}
                disabled={isInitializing}
                className={`p-3 rounded-full transition-colors ${
                  isVideoEnabled
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                } ${isInitializing ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {isVideoEnabled ? (
                  <Video className="w-5 h-5" />
                ) : (
                  <VideoOff className="w-5 h-5" />
                )}
              </button>

              {/* Connection toggle */}
              <button
                onClick={isConnected ? handleDisconnect : handleConnect}
                disabled={isInitializing}
                className={`p-3 rounded-full transition-colors ${
                  isConnected
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } ${isInitializing ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isConnected ? 'Disconnect' : 'Connect'}
              >
                {isInitializing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isConnected ? (
                  <PhoneOff className="w-5 h-5" />
                ) : (
                  <Phone className="w-5 h-5" />
                )}
              </button>

              {/* End call */}
              <button
                onClick={handleDisconnect}
                disabled={isInitializing || !isConnected}
                className={`p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors ${
                  isInitializing || !isConnected ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title="End call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>

            {/* Right side - Settings */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status message */}
          {isInitializing && (
            <div className="mt-3 text-center">
              <span className="text-gray-300 text-sm">Initializing video call...</span>
            </div>
          )}
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Video Settings</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Channel Name
                </label>
                <input
                  type="text"
                  value={`telemed_${consultationId}`}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm"
                />
              </div>
              <div className="text-xs text-gray-500">
                <p>• This is a demo implementation</p>
                <p>• Real implementation requires Agora SDK installation</p>
                <p>• See VIDEO_CONSULTATION_SETUP.md for full setup instructions</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoConsultationDemo;
