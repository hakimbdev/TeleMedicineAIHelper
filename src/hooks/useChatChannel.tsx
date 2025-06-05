import { useState, useEffect, useCallback, useRef } from 'react';
import { GroupChannel, BaseMessage, UserMessage, FileMessage } from '@sendbird/chat/groupChannel';
import { useSendBird } from './useSendBird';
import { SendBirdMessage, ChatChannel } from '../types';

interface UseChatChannelProps {
  channelUrl?: string;
  autoConnect?: boolean;
}

interface UseChatChannelReturn {
  // Channel state
  channel: GroupChannel | null;
  messages: SendBirdMessage[];
  isLoading: boolean;
  error: string | null;
  
  // Channel info
  memberCount: number;
  unreadCount: number;
  isTyping: boolean;
  typingMembers: string[];
  
  // Message methods
  sendMessage: (message: string, customType?: string) => Promise<UserMessage | null>;
  sendFileMessage: (file: File, customType?: string) => Promise<FileMessage | null>;
  loadPreviousMessages: () => Promise<void>;
  
  // Channel methods
  joinChannel: (channelUrl: string) => Promise<void>;
  leaveChannel: () => Promise<void>;
  markAsRead: () => Promise<void>;
  
  // Typing indicators
  startTyping: () => void;
  endTyping: () => void;
  
  // Message management
  deleteMessage: (messageId: number) => Promise<void>;
  updateMessage: (messageId: number, message: string) => Promise<void>;
}

export const useChatChannel = ({ 
  channelUrl, 
  autoConnect = true 
}: UseChatChannelProps = {}): UseChatChannelReturn => {
  const { sb, connectionState, sendMessage: sbSendMessage, sendFileMessage: sbSendFileMessage } = useSendBird();
  
  const [channel, setChannel] = useState<GroupChannel | null>(null);
  const [messages, setMessages] = useState<SendBirdMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMembers, setTypingMembers] = useState<string[]>([]);
  
  const messageCollectionRef = useRef<any>(null);
  const channelHandlerRef = useRef<string>(`channel_handler_${Date.now()}`);

  // Convert SendBird message to our message format
  const convertMessage = useCallback((sbMessage: BaseMessage): SendBirdMessage => {
    const baseMessage = {
      messageId: sbMessage.messageId,
      message: '',
      messageType: 'user' as const,
      sender: {
        userId: sbMessage.sender?.userId || '',
        nickname: sbMessage.sender?.nickname || '',
        profileUrl: sbMessage.sender?.profileUrl,
        role: 'patient' as const, // This should be determined from metadata
        isOnline: sbMessage.sender?.connectionStatus === 'online',
        metadata: sbMessage.sender?.metaData,
      },
      createdAt: sbMessage.createdAt,
      updatedAt: sbMessage.updatedAt,
      channelUrl: sbMessage.channelUrl,
      customType: sbMessage.customType,
      data: sbMessage.data,
    };

    if (sbMessage.messageType === 'user') {
      const userMessage = sbMessage as UserMessage;
      return {
        ...baseMessage,
        message: userMessage.message,
        messageType: 'user',
        mentionedUsers: userMessage.mentionedUsers?.map(user => ({
          userId: user.userId,
          nickname: user.nickname,
          profileUrl: user.profileUrl,
          role: 'patient' as const,
          isOnline: user.connectionStatus === 'online',
        })),
      };
    } else if (sbMessage.messageType === 'file') {
      const fileMessage = sbMessage as FileMessage;
      return {
        ...baseMessage,
        message: fileMessage.name || 'File',
        messageType: 'file',
        url: fileMessage.url,
        name: fileMessage.name,
        size: fileMessage.size,
        type: fileMessage.type,
      };
    } else {
      return {
        ...baseMessage,
        message: (sbMessage as any).message || 'System message',
        messageType: 'admin',
      };
    }
  }, []);

  // Join channel
  const joinChannel = useCallback(async (url: string) => {
    if (!sb || !connectionState.isConnected) {
      setError('Not connected to chat service');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const groupChannel = await sb.groupChannel.getChannel(url);
      setChannel(groupChannel);
      setMemberCount(groupChannel.memberCount);
      setUnreadCount(groupChannel.unreadMessageCount);

      // Create message collection for real-time updates
      const messageListParams = {
        limit: 50,
        reverse: false,
      };

      const collection = groupChannel.createMessageCollection({
        filter: messageListParams,
        startingPoint: Date.now(),
      });

      messageCollectionRef.current = collection;

      // Set up collection event handlers
      collection.setMessageCollectionHandler({
        onMessagesAdded: (context, channel, messages) => {
          const convertedMessages = messages.map(convertMessage);
          setMessages(prev => [...prev, ...convertedMessages]);
        },
        onMessagesUpdated: (context, channel, messages) => {
          const convertedMessages = messages.map(convertMessage);
          setMessages(prev => 
            prev.map(msg => {
              const updated = convertedMessages.find(cm => cm.messageId === msg.messageId);
              return updated || msg;
            })
          );
        },
        onMessagesDeleted: (context, channel, messageIds) => {
          setMessages(prev => prev.filter(msg => !messageIds.includes(msg.messageId)));
        },
        onChannelUpdated: (context, channel) => {
          setMemberCount(channel.memberCount);
          setUnreadCount(channel.unreadMessageCount);
        },
        onChannelDeleted: (context, channelUrl) => {
          setChannel(null);
          setMessages([]);
        },
        onHugeGapDetected: () => {
          // Reload messages when a huge gap is detected
          collection.loadPrevious().then(() => {
            const messages = collection.succeededMessages.map(convertMessage);
            setMessages(messages);
          });
        },
      });

      // Load initial messages
      await collection.loadPrevious();
      const initialMessages = collection.succeededMessages.map(convertMessage);
      setMessages(initialMessages);

      // Set up channel event handlers
      sb.groupChannel.addGroupChannelHandler(channelHandlerRef.current, {
        onTypingStatusUpdated: (channel) => {
          if (channel.url === url) {
            const typingUsers = channel.getTypingUsers();
            setTypingMembers(typingUsers.map(user => user.nickname));
            setIsTyping(typingUsers.length > 0);
          }
        },
        onUnreadMemberStatusUpdated: (channel) => {
          if (channel.url === url) {
            setUnreadCount(channel.unreadMessageCount);
          }
        },
      });

      // Mark as read
      await groupChannel.markAsRead();

    } catch (err) {
      console.error('Failed to join channel:', err);
      setError(err instanceof Error ? err.message : 'Failed to join channel');
    } finally {
      setIsLoading(false);
    }
  }, [sb, connectionState.isConnected, convertMessage]);

  // Auto-join channel when URL is provided
  useEffect(() => {
    if (channelUrl && autoConnect && connectionState.isConnected) {
      joinChannel(channelUrl);
    }

    return () => {
      if (sb && channelHandlerRef.current) {
        sb.groupChannel.removeGroupChannelHandler(channelHandlerRef.current);
      }
      if (messageCollectionRef.current) {
        messageCollectionRef.current.dispose();
      }
    };
  }, [channelUrl, autoConnect, connectionState.isConnected, joinChannel, sb]);

  const leaveChannel = useCallback(async () => {
    if (!channel) return;

    try {
      await channel.leave();
      setChannel(null);
      setMessages([]);
      setMemberCount(0);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to leave channel:', err);
      setError(err instanceof Error ? err.message : 'Failed to leave channel');
    }
  }, [channel]);

  const sendMessage = useCallback(async (message: string, customType?: string): Promise<UserMessage | null> => {
    if (!channel || !sbSendMessage) return null;

    try {
      const sentMessage = await sbSendMessage(channel.url, message, customType);
      return sentMessage;
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      return null;
    }
  }, [channel, sbSendMessage]);

  const sendFileMessage = useCallback(async (file: File, customType?: string): Promise<FileMessage | null> => {
    if (!channel || !sbSendFileMessage) return null;

    try {
      const sentMessage = await sbSendFileMessage(channel.url, file, customType);
      return sentMessage;
    } catch (err) {
      console.error('Failed to send file:', err);
      setError(err instanceof Error ? err.message : 'Failed to send file');
      return null;
    }
  }, [channel, sbSendFileMessage]);

  const loadPreviousMessages = useCallback(async () => {
    if (!messageCollectionRef.current) return;

    try {
      await messageCollectionRef.current.loadPrevious();
      const allMessages = messageCollectionRef.current.succeededMessages.map(convertMessage);
      setMessages(allMessages);
    } catch (err) {
      console.error('Failed to load previous messages:', err);
    }
  }, [convertMessage]);

  const markAsRead = useCallback(async () => {
    if (!channel) return;

    try {
      await channel.markAsRead();
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, [channel]);

  const startTyping = useCallback(() => {
    if (channel) {
      channel.startTyping();
    }
  }, [channel]);

  const endTyping = useCallback(() => {
    if (channel) {
      channel.endTyping();
    }
  }, [channel]);

  const deleteMessage = useCallback(async (messageId: number) => {
    if (!channel) return;

    try {
      await channel.deleteMessage(messageId);
    } catch (err) {
      console.error('Failed to delete message:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete message');
    }
  }, [channel]);

  const updateMessage = useCallback(async (messageId: number, message: string) => {
    if (!channel) return;

    try {
      const params = { message };
      await channel.updateUserMessage(messageId, params);
    } catch (err) {
      console.error('Failed to update message:', err);
      setError(err instanceof Error ? err.message : 'Failed to update message');
    }
  }, [channel]);

  return {
    channel,
    messages,
    isLoading,
    error,
    memberCount,
    unreadCount,
    isTyping,
    typingMembers,
    sendMessage,
    sendFileMessage,
    loadPreviousMessages,
    joinChannel,
    leaveChannel,
    markAsRead,
    startTyping,
    endTyping,
    deleteMessage,
    updateMessage,
  };
};
