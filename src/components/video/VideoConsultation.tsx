import React, { useEffect, useState } from 'react';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useVideoConsultation } from '../../hooks/useVideoConsultation';
import { validateAgoraConfig } from '../../config/agora';
import ParticipantVideo from './ParticipantVideo';
import VideoControls from './VideoControls';

interface VideoConsultationProps {
  consultationId: string;
  autoStart?: boolean;
  onError?: (error: string) => void;
  onParticipantCountChange?: (count: number) => void;
}

const VideoConsultation: React.FC<VideoConsultationProps> = ({
  consultationId,
  autoStart = false,
  onError,
  onParticipantCountChange,
}) => {
  const [configError, setConfigError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const {
    videoSession,
    controls,
    clientState,
    isInitializing,
    initializeVideoCall,
  } = useVideoConsultation({
    consultationId,
    onConnectionStateChange: (isConnected) => {
      console.log('Connection state changed:', isConnected);
    },
  });

  // Validate Agora configuration on mount
  useEffect(() => {
    if (!validateAgoraConfig()) {
      const error = 'Agora SDK is not properly configured. Please check your App ID in the environment variables.';
      setConfigError(error);
      onError?.(error);
    }
  }, [onError]);

  // Auto-start video call if requested
  useEffect(() => {
    if (autoStart && !configError && !videoSession.isConnected && !isInitializing) {
      initializeVideoCall().catch((error) => {
        console.error('Auto-start failed:', error);
        onError?.(error.message || 'Failed to start video call');
      });
    }
  }, [autoStart, configError, videoSession.isConnected, isInitializing, initializeVideoCall, onError]);

  // Notify parent of participant count changes
  useEffect(() => {
    onParticipantCountChange?.(videoSession.participants.length);
  }, [videoSession.participants.length, onParticipantCountChange]);

  // Get local and remote participants
  const localParticipant = videoSession.participants.find(p => p.uid === 'local');
  const remoteParticipants = videoSession.participants.filter(p => p.uid !== 'local');

  if (configError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-medium">Configuration Error</h3>
            <p className="text-red-700 text-sm mt-1">{configError}</p>
            <p className="text-red-600 text-xs mt-2">
              Please set your Agora App ID in the .env file as VITE_AGORA_APP_ID
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      {/* Connection status bar */}
      <div className={`px-4 py-2 text-sm flex items-center justify-between ${
        videoSession.isConnected ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
      }`}>
        <div className="flex items-center space-x-2">
          {videoSession.isConnected ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          <span>
            {videoSession.isConnected 
              ? `Connected to ${videoSession.channelName}` 
              : 'Not connected'
            }
          </span>
        </div>
        <span className="text-xs">
          {videoSession.participants.length} participant{videoSession.participants.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Video grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Remote participants */}
          {remoteParticipants.map((participant, index) => {
            const remoteUser = clientState.remoteUsers.find(u => u.uid === participant.uid);
            return (
              <ParticipantVideo
                key={participant.uid}
                participant={participant}
                videoTrack={remoteUser?.videoTrack}
                className="aspect-video"
              />
            );
          })}

          {/* Local participant */}
          {localParticipant && (
            <ParticipantVideo
              participant={localParticipant}
              videoTrack={clientState.localVideoTrack}
              isLocal={true}
              className={`aspect-video ${remoteParticipants.length === 0 ? 'lg:col-span-2' : ''}`}
            />
          )}

          {/* Placeholder when no participants */}
          {videoSession.participants.length === 0 && (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center lg:col-span-2">
              <div className="text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Wifi className="w-8 h-8" />
                </div>
                <p className="font-medium">Waiting for participants</p>
                <p className="text-sm mt-1">Click connect to join the video consultation</p>
              </div>
            </div>
          )}
        </div>

        {/* Video controls */}
        <VideoControls
          controls={controls}
          videoSession={videoSession}
          isInitializing={isInitializing}
          participantCount={videoSession.participants.length}
          onSettingsClick={() => setShowSettings(!showSettings)}
        />

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
                  value={videoSession.channelName}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm"
                />
              </div>
              <div className="text-xs text-gray-500">
                <p>• Make sure your microphone and camera permissions are enabled</p>
                <p>• Use a stable internet connection for best quality</p>
                <p>• Close other video applications to avoid conflicts</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoConsultation;
