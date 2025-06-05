import React, { useEffect, useRef, useState } from 'react';
import { 
  Users, 
  Settings, 
  Search, 
  MoreVertical,
  AlertCircle,
  Wifi,
  WifiOff,
  ChevronDown
} from 'lucide-react';
import { useChatChannel } from '../../hooks/useChatChannel';
import { useSendBird } from '../../hooks/useSendBird';
import { SendBirdMessage } from '../../types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatWindowProps {
  channelUrl: string;
  title?: string;
  onClose?: () => void;
  className?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  channelUrl,
  title,
  onClose,
  className = '',
}) => {
  const { connectionState, currentUser } = useSendBird();
  const {
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
    markAsRead,
    startTyping,
    endTyping,
    deleteMessage,
    updateMessage,
  } = useChatChannel({ channelUrl, autoConnect: true });

  const [showMemberList, setShowMemberList] = useState(false);
  const [replyingTo, setReplyingTo] = useState<SendBirdMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark messages as read when component mounts or channel changes
  useEffect(() => {
    if (channel && connectionState.isConnected) {
      markAsRead();
    }
  }, [channel, connectionState.isConnected, markAsRead]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    let finalMessage = message;
    
    // Add reply context if replying
    if (replyingTo) {
      finalMessage = `@${replyingTo.sender.nickname} ${message}`;
      setReplyingTo(null);
    }

    await sendMessage(finalMessage);
  };

  const handleSendFile = async (file: File) => {
    await sendFileMessage(file);
  };

  const handleReply = (message: SendBirdMessage) => {
    setReplyingTo(message);
  };

  const handleEdit = async (messageId: number, newMessage: string) => {
    await updateMessage(messageId, newMessage);
  };

  const handleDelete = async (messageId: number) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      await deleteMessage(messageId);
    }
  };

  const handleLoadMore = async () => {
    await loadPreviousMessages();
  };

  const getChannelTitle = () => {
    if (title) return title;
    if (channel) return channel.name || 'Chat';
    return 'Loading...';
  };

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-card overflow-hidden ${className}`}>
        <div className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chat Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-card overflow-hidden flex flex-col ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionState.isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <h3 className="text-lg font-medium text-gray-900">
                {getChannelTitle()}
              </h3>
            </div>
            
            {memberCount > 0 && (
              <button
                onClick={() => setShowMemberList(!showMemberList)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>{memberCount}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showMemberList ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {!connectionState.isConnected && (
              <div className="flex items-center space-x-1 text-red-500">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm">Offline</span>
              </div>
            )}
            
            <button
              onClick={() => setShowMemberList(!showMemberList)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Close chat"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Connection status */}
        <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>
              {connectionState.isConnected ? 'Connected' : 'Connecting...'}
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
                {unreadCount} unread
              </span>
            )}
          </div>
          
          {isTyping && typingMembers.length > 0 && (
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <span className="text-xs">
                {typingMembers.join(', ')} {typingMembers.length === 1 ? 'is' : 'are'} typing...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-blue-600">Replying to</span>
              <span className="text-sm font-medium text-blue-800">
                {replyingTo.sender.nickname}
              </span>
              <span className="text-sm text-blue-600 truncate max-w-xs">
                {replyingTo.message}
              </span>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-blue-400 hover:text-blue-600 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
        style={{ maxHeight: '400px' }}
      >
        {isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}

        {messages.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium mb-2">No messages yet</p>
            <p className="text-sm">Start the conversation by sending a message below.</p>
          </div>
        )}

        {messages.map((message, index) => {
          const isOwn = message.sender.userId === currentUser?.userId;
          const showAvatar = !isOwn && (
            index === 0 || 
            messages[index - 1].sender.userId !== message.sender.userId
          );

          return (
            <ChatMessage
              key={message.messageId}
              message={message}
              isOwn={isOwn}
              showAvatar={showAvatar}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
        onTypingStart={startTyping}
        onTypingEnd={endTyping}
        disabled={!connectionState.isConnected}
        placeholder={
          connectionState.isConnected 
            ? "Type a message..." 
            : "Connecting to chat..."
        }
      />
    </div>
  );
};

export default ChatWindow;
