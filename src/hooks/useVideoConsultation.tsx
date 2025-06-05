import { useState, useCallback, useEffect } from 'react';
import { useAgoraClient } from './useAgoraClient';
import { generateChannelName } from '../config/agora';
import { VideoSession, VideoParticipant, VideoCallControls } from '../types';
import { useAuth } from './useAuth';

interface UseVideoConsultationProps {
  consultationId: string;
  onParticipantJoined?: (participant: VideoParticipant) => void;
  onParticipantLeft?: (participantId: string) => void;
  onConnectionStateChange?: (isConnected: boolean) => void;
}

export const useVideoConsultation = ({
  consultationId,
  onParticipantJoined,
  onParticipantLeft,
  onConnectionStateChange,
}: UseVideoConsultationProps) => {
  const { user } = useAuth();
  const {
    clientState,
    joinChannel,
    leaveChannel,
    createLocalTracks,
    publishTracks,
    unpublishTracks,
    toggleVideo: toggleVideoTrack,
    toggleAudio: toggleAudioTrack,
  } = useAgoraClient();

  const [videoSession, setVideoSession] = useState<VideoSession>({
    channelName: generateChannelName(consultationId),
    isVideoEnabled: true,
    isAudioEnabled: true,
    isConnected: false,
    participants: [],
  });

  const [isInitializing, setIsInitializing] = useState(false);

  // Update connection state when client state changes
  useEffect(() => {
    const isConnected = clientState.isJoined && clientState.isPublishing;
    setVideoSession(prev => ({ ...prev, isConnected }));
    onConnectionStateChange?.(isConnected);
  }, [clientState.isJoined, clientState.isPublishing, onConnectionStateChange]);

  // Update participants when remote users change
  useEffect(() => {
    const participants: VideoParticipant[] = clientState.remoteUsers.map(remoteUser => ({
      uid: remoteUser.uid,
      userId: remoteUser.uid.toString(),
      name: `User ${remoteUser.uid}`, // In a real app, you'd get this from your user database
      role: 'patient' as const, // You'd determine this based on your app logic
      isVideoEnabled: !!remoteUser.videoTrack,
      isAudioEnabled: !!remoteUser.audioTrack,
      joinedAt: new Date().toISOString(),
    }));

    // Add local user as participant
    if (clientState.isJoined && user) {
      participants.unshift({
        uid: 'local',
        userId: user.id,
        name: user.name,
        role: user.role,
        isVideoEnabled: videoSession.isVideoEnabled,
        isAudioEnabled: videoSession.isAudioEnabled,
        joinedAt: new Date().toISOString(),
      });
    }

    setVideoSession(prev => ({ ...prev, participants }));
  }, [clientState.remoteUsers, clientState.isJoined, user, videoSession.isVideoEnabled, videoSession.isAudioEnabled]);

  const initializeVideoCall = useCallback(async () => {
    if (isInitializing || clientState.isJoined) return;

    setIsInitializing(true);
    try {
      // Create local tracks
      await createLocalTracks(videoSession.isVideoEnabled, videoSession.isAudioEnabled);
      
      // Join channel
      await joinChannel(videoSession.channelName);
      
      // Publish tracks
      await publishTracks();
      
      console.log('Video consultation initialized successfully');
    } catch (error) {
      console.error('Failed to initialize video consultation:', error);
      throw error;
    } finally {
      setIsInitializing(false);
    }
  }, [
    isInitializing,
    clientState.isJoined,
    createLocalTracks,
    joinChannel,
    publishTracks,
    videoSession.channelName,
    videoSession.isVideoEnabled,
    videoSession.isAudioEnabled,
  ]);

  const endVideoCall = useCallback(async () => {
    try {
      await unpublishTracks();
      await leaveChannel();
      console.log('Video consultation ended successfully');
    } catch (error) {
      console.error('Failed to end video consultation:', error);
    }
  }, [unpublishTracks, leaveChannel]);

  const toggleVideo = useCallback(async () => {
    const newVideoState = !videoSession.isVideoEnabled;
    setVideoSession(prev => ({ ...prev, isVideoEnabled: newVideoState }));
    
    if (clientState.isJoined) {
      await toggleVideoTrack(newVideoState);
    }
  }, [videoSession.isVideoEnabled, clientState.isJoined, toggleVideoTrack]);

  const toggleAudio = useCallback(async () => {
    const newAudioState = !videoSession.isAudioEnabled;
    setVideoSession(prev => ({ ...prev, isAudioEnabled: newAudioState }));
    
    if (clientState.isJoined) {
      await toggleAudioTrack(newAudioState);
    }
  }, [videoSession.isAudioEnabled, clientState.isJoined, toggleAudioTrack]);

  const toggleConnection = useCallback(async () => {
    if (videoSession.isConnected) {
      await endVideoCall();
    } else {
      await initializeVideoCall();
    }
  }, [videoSession.isConnected, endVideoCall, initializeVideoCall]);

  const controls: VideoCallControls = {
    toggleVideo,
    toggleAudio,
    toggleConnection,
    endCall: endVideoCall,
  };

  return {
    videoSession,
    controls,
    clientState,
    isInitializing,
    initializeVideoCall,
    endVideoCall,
  };
};
