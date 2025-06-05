import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, User } from 'lucide-react';
import { VideoParticipant } from '../../types';
import { ICameraVideoTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';

interface ParticipantVideoProps {
  participant: VideoParticipant;
  videoTrack?: ICameraVideoTrack | IRemoteVideoTrack | null;
  isLocal?: boolean;
  className?: string;
}

const ParticipantVideo: React.FC<ParticipantVideoProps> = ({
  participant,
  videoTrack,
  isLocal = false,
  className = '',
}) => {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoTrack && videoRef.current) {
      // Play the video track in the div element
      videoTrack.play(videoRef.current);
      
      return () => {
        // Stop playing when component unmounts or track changes
        videoTrack.stop();
      };
    }
  }, [videoTrack]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'doctor':
        return 'bg-blue-500';
      case 'patient':
        return 'bg-green-500';
      case 'admin':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Video container */}
      <div 
        ref={videoRef}
        className="w-full h-full flex items-center justify-center"
      >
        {/* Fallback when no video */}
        {!participant.isVideoEnabled && (
          <div className="flex flex-col items-center justify-center text-white">
            <div className={`w-16 h-16 rounded-full ${getRoleColor(participant.role)} flex items-center justify-center mb-2`}>
              <User className="w-8 h-8" />
            </div>
            <span className="text-sm font-medium">{participant.name}</span>
          </div>
        )}
      </div>

      {/* Participant info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-white text-sm font-medium truncate">
              {participant.name}
              {isLocal && ' (You)'}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full text-white ${getRoleColor(participant.role)}`}>
              {participant.role}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Audio indicator */}
            <div className={`p-1 rounded-full ${participant.isAudioEnabled ? 'bg-green-500' : 'bg-red-500'}`}>
              {participant.isAudioEnabled ? (
                <Mic className="w-3 h-3 text-white" />
              ) : (
                <MicOff className="w-3 h-3 text-white" />
              )}
            </div>
            
            {/* Video indicator */}
            <div className={`p-1 rounded-full ${participant.isVideoEnabled ? 'bg-green-500' : 'bg-red-500'}`}>
              {participant.isVideoEnabled ? (
                <Video className="w-3 h-3 text-white" />
              ) : (
                <VideoOff className="w-3 h-3 text-white" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Connection status for local user */}
      {isLocal && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center space-x-1 bg-black/50 rounded-full px-2 py-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-white text-xs">Live</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantVideo;
