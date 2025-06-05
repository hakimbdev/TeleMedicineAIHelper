import { useState, useEffect, useCallback, useRef } from 'react';
import SendBird from '@sendbird/chat';
import { 
  GroupChannelModule, 
  OpenChannelModule,
  GroupChannel,
  BaseMessage,
  UserMessage,
  FileMessage,
  AdminMessage,
  SendBirdError
} from '@sendbird/chat/groupChannel';
import { SENDBIRD_CONFIG, validateSendBirdConfig, generateUserId } from '../config/sendbird';
import { ChatConnectionState, ChatChannel, SendBirdMessage, ChatUser } from '../types';
import { useAuth } from './useAuth';

interface UseSendBirdReturn {
  // Connection state
  connectionState: ChatConnectionState;
  currentUser: ChatUser | null;
  
  // Connection methods
  connect: (userId?: string, nickname?: string) => Promise<void>;
  disconnect: () => Promise<void>;
  
  // Channel methods
  createChannel: (userIds: string[], channelName?: string, customType?: string) => Promise<GroupChannel>;
  getChannel: (channelUrl: string) => Promise<GroupChannel | null>;
  leaveChannel: (channelUrl: string) => Promise<void>;
  
  // Message methods
  sendMessage: (channelUrl: string, message: string, customType?: string) => Promise<UserMessage>;
  sendFileMessage: (channelUrl: string, file: File, customType?: string) => Promise<FileMessage>;
  
  // Utility methods
  markAsRead: (channelUrl: string) => Promise<void>;
  updateUserProfile: (nickname?: string, profileUrl?: string) => Promise<void>;
  
  // SendBird instance
  sb: SendBird | null;
}

export const useSendBird = (): UseSendBirdReturn => {
  const { user } = useAuth();
  const [connectionState, setConnectionState] = useState<ChatConnectionState>({
    isConnected: false,
    isConnecting: false,
    reconnectCount: 0,
  });
  const [currentUser, setCurrentUser] = useState<ChatUser | null>(null);
  const sbRef = useRef<SendBird | null>(null);

  // Initialize SendBird
  useEffect(() => {
    if (!validateSendBirdConfig()) {
      setConnectionState(prev => ({
        ...prev,
        error: 'SendBird configuration is invalid',
      }));
      return;
    }

    try {
      const sb = SendBird.init({
        appId: SENDBIRD_CONFIG.APP_ID,
        modules: [new GroupChannelModule(), new OpenChannelModule()],
        localCacheEnabled: true,
      });

      sbRef.current = sb;

      // Set up connection event handlers
      sb.addConnectionHandler('telemed_connection', {
        onReconnectStarted: () => {
          setConnectionState(prev => ({
            ...prev,
            isConnecting: true,
            error: undefined,
          }));
        },
        onReconnectSucceeded: () => {
          setConnectionState(prev => ({
            ...prev,
            isConnected: true,
            isConnecting: false,
            error: undefined,
            reconnectCount: prev.reconnectCount + 1,
          }));
        },
        onReconnectFailed: () => {
          setConnectionState(prev => ({
            ...prev,
            isConnected: false,
            isConnecting: false,
            error: 'Failed to reconnect to chat service',
          }));
        },
      });

    } catch (error) {
      console.error('Failed to initialize SendBird:', error);
      setConnectionState(prev => ({
        ...prev,
        error: 'Failed to initialize chat service',
      }));
    }

    return () => {
      if (sbRef.current) {
        sbRef.current.removeAllConnectionHandlers();
        sbRef.current.disconnect();
      }
    };
  }, []);

  // Auto-connect when user is available
  useEffect(() => {
    if (user && sbRef.current && !connectionState.isConnected && !connectionState.isConnecting) {
      connect();
    }
  }, [user, connectionState.isConnected, connectionState.isConnecting]);

  const connect = useCallback(async (userId?: string, nickname?: string) => {
    if (!sbRef.current || !user) return;

    const userIdToUse = userId || generateUserId(user.id, user.role);
    const nicknameToUse = nickname || user.name;

    setConnectionState(prev => ({ ...prev, isConnecting: true, error: undefined }));

    try {
      const connectedUser = await sbRef.current.connect(userIdToUse);
      
      // Update user profile
      await sbRef.current.updateCurrentUserInfo({
        nickname: nicknameToUse,
        profileUrl: user.avatar || SENDBIRD_CONFIG.DEFAULT_PROFILE_URL,
      });

      setCurrentUser({
        userId: connectedUser.userId,
        nickname: connectedUser.nickname,
        profileUrl: connectedUser.profileUrl,
        role: user.role,
        isOnline: true,
        metadata: {
          role: user.role,
          specialization: user.specialization || '',
        },
      });

      setConnectionState({
        isConnected: true,
        isConnecting: false,
        reconnectCount: 0,
      });

      console.log('Connected to SendBird:', connectedUser);
    } catch (error) {
      console.error('Failed to connect to SendBird:', error);
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect to chat service',
      }));
    }
  }, [user]);

  const disconnect = useCallback(async () => {
    if (!sbRef.current) return;

    try {
      await sbRef.current.disconnect();
      setConnectionState({
        isConnected: false,
        isConnecting: false,
        reconnectCount: 0,
      });
      setCurrentUser(null);
      console.log('Disconnected from SendBird');
    } catch (error) {
      console.error('Failed to disconnect from SendBird:', error);
    }
  }, []);

  const createChannel = useCallback(async (
    userIds: string[], 
    channelName?: string, 
    customType?: string
  ): Promise<GroupChannel> => {
    if (!sbRef.current) throw new Error('SendBird not initialized');

    const params = {
      invitedUserIds: userIds,
      isDistinct: true,
      name: channelName,
      customType: customType || 'consultation',
      data: JSON.stringify({
        createdBy: currentUser?.userId,
        createdAt: Date.now(),
      }),
    };

    return await sbRef.current.groupChannel.createChannel(params);
  }, [currentUser]);

  const getChannel = useCallback(async (channelUrl: string): Promise<GroupChannel | null> => {
    if (!sbRef.current) return null;

    try {
      return await sbRef.current.groupChannel.getChannel(channelUrl);
    } catch (error) {
      console.error('Failed to get channel:', error);
      return null;
    }
  }, []);

  const leaveChannel = useCallback(async (channelUrl: string): Promise<void> => {
    if (!sbRef.current) return;

    try {
      const channel = await sbRef.current.groupChannel.getChannel(channelUrl);
      await channel.leave();
    } catch (error) {
      console.error('Failed to leave channel:', error);
      throw error;
    }
  }, []);

  const sendMessage = useCallback(async (
    channelUrl: string, 
    message: string, 
    customType?: string
  ): Promise<UserMessage> => {
    if (!sbRef.current) throw new Error('SendBird not initialized');

    const channel = await sbRef.current.groupChannel.getChannel(channelUrl);
    const params = {
      message,
      customType,
      data: JSON.stringify({
        timestamp: Date.now(),
        sender: currentUser?.userId,
      }),
    };

    return await channel.sendUserMessage(params);
  }, [currentUser]);

  const sendFileMessage = useCallback(async (
    channelUrl: string, 
    file: File, 
    customType?: string
  ): Promise<FileMessage> => {
    if (!sbRef.current) throw new Error('SendBird not initialized');

    const channel = await sbRef.current.groupChannel.getChannel(channelUrl);
    const params = {
      file,
      customType,
      data: JSON.stringify({
        timestamp: Date.now(),
        sender: currentUser?.userId,
      }),
    };

    return await channel.sendFileMessage(params);
  }, [currentUser]);

  const markAsRead = useCallback(async (channelUrl: string): Promise<void> => {
    if (!sbRef.current) return;

    try {
      const channel = await sbRef.current.groupChannel.getChannel(channelUrl);
      await channel.markAsRead();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, []);

  const updateUserProfile = useCallback(async (
    nickname?: string, 
    profileUrl?: string
  ): Promise<void> => {
    if (!sbRef.current) return;

    try {
      await sbRef.current.updateCurrentUserInfo({
        nickname: nickname || currentUser?.nickname,
        profileUrl: profileUrl || currentUser?.profileUrl,
      });

      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          nickname: nickname || currentUser.nickname,
          profileUrl: profileUrl || currentUser.profileUrl,
        });
      }
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }, [currentUser]);

  return {
    connectionState,
    currentUser,
    connect,
    disconnect,
    createChannel,
    getChannel,
    leaveChannel,
    sendMessage,
    sendFileMessage,
    markAsRead,
    updateUserProfile,
    sb: sbRef.current,
  };
};
