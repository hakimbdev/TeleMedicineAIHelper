import { useState, useEffect, useRef, useCallback } from 'react';
import AgoraRTC, { 
  IAgoraRTCClient, 
  ICameraVideoTrack, 
  IMicrophoneAudioTrack,
  IRemoteUser,
  UID
} from 'agora-rtc-sdk-ng';
import { AGORA_CONFIG, validateAgoraConfig } from '../config/agora';
import { AgoraClientState } from '../types';

export const useAgoraClient = () => {
  const [clientState, setClientState] = useState<AgoraClientState>({
    isJoined: false,
    isPublishing: false,
    localVideoTrack: null,
    localAudioTrack: null,
    remoteUsers: [],
  });

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);

  // Initialize Agora client
  useEffect(() => {
    if (!validateAgoraConfig()) {
      console.error('Agora configuration is invalid');
      return;
    }

    const client = AgoraRTC.createClient({
      mode: AGORA_CONFIG.CONNECTION_CONFIG.mode,
      codec: AGORA_CONFIG.CONNECTION_CONFIG.codec,
    });

    clientRef.current = client;

    // Set up event listeners
    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);
    client.on('user-joined', handleUserJoined);
    client.on('user-left', handleUserLeft);

    return () => {
      client.removeAllListeners();
      leaveChannel();
    };
  }, []);

  const handleUserPublished = useCallback(async (user: IRemoteUser, mediaType: 'audio' | 'video') => {
    if (!clientRef.current) return;

    await clientRef.current.subscribe(user, mediaType);
    
    setClientState(prev => ({
      ...prev,
      remoteUsers: prev.remoteUsers.some(u => u.uid === user.uid) 
        ? prev.remoteUsers.map(u => u.uid === user.uid ? user : u)
        : [...prev.remoteUsers, user]
    }));

    // Auto-play remote audio
    if (mediaType === 'audio' && user.audioTrack) {
      user.audioTrack.play();
    }
  }, []);

  const handleUserUnpublished = useCallback((user: IRemoteUser, mediaType: 'audio' | 'video') => {
    console.log('User unpublished:', user.uid, mediaType);
  }, []);

  const handleUserJoined = useCallback((user: IRemoteUser) => {
    console.log('User joined:', user.uid);
  }, []);

  const handleUserLeft = useCallback((user: IRemoteUser) => {
    setClientState(prev => ({
      ...prev,
      remoteUsers: prev.remoteUsers.filter(u => u.uid !== user.uid)
    }));
  }, []);

  const joinChannel = useCallback(async (channelName: string, uid?: UID, token?: string) => {
    if (!clientRef.current || clientState.isJoined) return;

    try {
      await clientRef.current.join(AGORA_CONFIG.APP_ID, channelName, token || null, uid || null);
      
      setClientState(prev => ({ ...prev, isJoined: true }));
      console.log('Successfully joined channel:', channelName);
    } catch (error) {
      console.error('Failed to join channel:', error);
      throw error;
    }
  }, [clientState.isJoined]);

  const leaveChannel = useCallback(async () => {
    if (!clientRef.current || !clientState.isJoined) return;

    try {
      // Stop and close local tracks
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.close();
        localVideoTrackRef.current = null;
      }
      
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }

      await clientRef.current.leave();
      
      setClientState({
        isJoined: false,
        isPublishing: false,
        localVideoTrack: null,
        localAudioTrack: null,
        remoteUsers: [],
      });
      
      console.log('Successfully left channel');
    } catch (error) {
      console.error('Failed to leave channel:', error);
    }
  }, [clientState.isJoined]);

  const createLocalTracks = useCallback(async (enableVideo = true, enableAudio = true) => {
    try {
      const tracks = [];
      
      if (enableVideo) {
        const videoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: AGORA_CONFIG.VIDEO_PROFILE,
        });
        localVideoTrackRef.current = videoTrack;
        tracks.push(videoTrack);
      }
      
      if (enableAudio) {
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: AGORA_CONFIG.AUDIO_PROFILE,
        });
        localAudioTrackRef.current = audioTrack;
        tracks.push(audioTrack);
      }

      setClientState(prev => ({
        ...prev,
        localVideoTrack: localVideoTrackRef.current,
        localAudioTrack: localAudioTrackRef.current,
      }));

      return tracks;
    } catch (error) {
      console.error('Failed to create local tracks:', error);
      throw error;
    }
  }, []);

  const publishTracks = useCallback(async () => {
    if (!clientRef.current || !clientState.isJoined || clientState.isPublishing) return;

    try {
      const tracks = [];
      if (localVideoTrackRef.current) tracks.push(localVideoTrackRef.current);
      if (localAudioTrackRef.current) tracks.push(localAudioTrackRef.current);

      if (tracks.length > 0) {
        await clientRef.current.publish(tracks);
        setClientState(prev => ({ ...prev, isPublishing: true }));
        console.log('Successfully published tracks');
      }
    } catch (error) {
      console.error('Failed to publish tracks:', error);
      throw error;
    }
  }, [clientState.isJoined, clientState.isPublishing]);

  const unpublishTracks = useCallback(async () => {
    if (!clientRef.current || !clientState.isPublishing) return;

    try {
      const tracks = [];
      if (localVideoTrackRef.current) tracks.push(localVideoTrackRef.current);
      if (localAudioTrackRef.current) tracks.push(localAudioTrackRef.current);

      if (tracks.length > 0) {
        await clientRef.current.unpublish(tracks);
        setClientState(prev => ({ ...prev, isPublishing: false }));
        console.log('Successfully unpublished tracks');
      }
    } catch (error) {
      console.error('Failed to unpublish tracks:', error);
    }
  }, [clientState.isPublishing]);

  const toggleVideo = useCallback(async (enabled: boolean) => {
    if (localVideoTrackRef.current) {
      await localVideoTrackRef.current.setEnabled(enabled);
    }
  }, []);

  const toggleAudio = useCallback(async (enabled: boolean) => {
    if (localAudioTrackRef.current) {
      await localAudioTrackRef.current.setEnabled(enabled);
    }
  }, []);

  return {
    clientState,
    joinChannel,
    leaveChannel,
    createLocalTracks,
    publishTracks,
    unpublishTracks,
    toggleVideo,
    toggleAudio,
    client: clientRef.current,
  };
};
