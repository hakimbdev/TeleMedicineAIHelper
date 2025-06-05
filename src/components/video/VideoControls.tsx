import React from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff, 
  Monitor,
  Settings,
  Users
} from 'lucide-react';
import { VideoCallControls, VideoSession } from '../../types';

interface VideoControlsProps {
  controls: VideoCallControls;
  videoSession: VideoSession;
  isInitializing?: boolean;
  participantCount?: number;
  onSettingsClick?: () => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  controls,
  videoSession,
  isInitializing = false,
  participantCount = 0,
  onSettingsClick,
}) => {
  const { toggleVideo, toggleAudio, toggleConnection, endCall, shareScreen } = controls;

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        {/* Left side - Connection info */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              videoSession.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className="text-white text-sm font-medium">
              {videoSession.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {participantCount > 0 && (
            <div className="flex items-center space-x-1 text-gray-300">
              <Users className="w-4 h-4" />
              <span className="text-sm">{participantCount}</span>
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
              videoSession.isAudioEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            } ${isInitializing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={videoSession.isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {videoSession.isAudioEnabled ? (
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
              videoSession.isVideoEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            } ${isInitializing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={videoSession.isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {videoSession.isVideoEnabled ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )}
          </button>

          {/* Screen share (if available) */}
          {shareScreen && (
            <button
              onClick={shareScreen}
              disabled={isInitializing}
              className={`p-3 rounded-full transition-colors bg-gray-700 hover:bg-gray-600 text-white ${
                isInitializing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Share screen"
            >
              <Monitor className="w-5 h-5" />
            </button>
          )}

          {/* Connection toggle */}
          <button
            onClick={toggleConnection}
            disabled={isInitializing}
            className={`p-3 rounded-full transition-colors ${
              videoSession.isConnected
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } ${isInitializing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={videoSession.isConnected ? 'Disconnect' : 'Connect'}
          >
            {isInitializing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : videoSession.isConnected ? (
              <PhoneOff className="w-5 h-5" />
            ) : (
              <Phone className="w-5 h-5" />
            )}
          </button>

          {/* End call */}
          <button
            onClick={endCall}
            disabled={isInitializing}
            className={`p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors ${
              isInitializing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="End call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>

        {/* Right side - Settings */}
        <div className="flex items-center space-x-2">
          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Status message */}
      {isInitializing && (
        <div className="mt-3 text-center">
          <span className="text-gray-300 text-sm">Initializing video call...</span>
        </div>
      )}
    </div>
  );
};

export default VideoControls;
