import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Users, 
  Clock,
  Hash,
  Lock
} from 'lucide-react';
import { GroupChannel } from '@sendbird/chat/groupChannel';
import { useSendBird } from '../../hooks/useSendBird';
import { ChatChannel } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface ChatChannelListProps {
  onChannelSelect: (channelUrl: string) => void;
  selectedChannelUrl?: string;
  onCreateChannel?: () => void;
  className?: string;
}

const ChatChannelList: React.FC<ChatChannelListProps> = ({
  onChannelSelect,
  selectedChannelUrl,
  onCreateChannel,
  className = '',
}) => {
  const { sb, connectionState } = useSendBird();
  const [channels, setChannels] = useState<GroupChannel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load channels
  useEffect(() => {
    if (!sb || !connectionState.isConnected) return;

    const loadChannels = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const query = sb.groupChannel.createMyGroupChannelListQuery({
          limit: 50,
          includeEmpty: true,
          order: 'latest_last_message',
        });

        const channelList = await query.next();
        setChannels(channelList);
      } catch (err) {
        console.error('Failed to load channels:', err);
        setError('Failed to load channels');
      } finally {
        setIsLoading(false);
      }
    };

    loadChannels();

    // Set up channel event handlers
    const handlerId = `channel_list_${Date.now()}`;
    sb.groupChannel.addGroupChannelHandler(handlerId, {
      onChannelChanged: (channel) => {
        setChannels(prev => 
          prev.map(ch => ch.url === channel.url ? channel : ch)
        );
      },
      onChannelDeleted: (channelUrl) => {
        setChannels(prev => prev.filter(ch => ch.url !== channelUrl));
      },
      onUserJoined: (channel) => {
        setChannels(prev => 
          prev.map(ch => ch.url === channel.url ? channel : ch)
        );
      },
      onUserLeft: (channel) => {
        setChannels(prev => 
          prev.map(ch => ch.url === channel.url ? channel : ch)
        );
      },
      onMessageReceived: (channel) => {
        setChannels(prev => {
          const updated = prev.map(ch => ch.url === channel.url ? channel : ch);
          // Move channel with new message to top
          const channelIndex = updated.findIndex(ch => ch.url === channel.url);
          if (channelIndex > 0) {
            const [movedChannel] = updated.splice(channelIndex, 1);
            updated.unshift(movedChannel);
          }
          return updated;
        });
      },
    });

    return () => {
      sb.groupChannel.removeGroupChannelHandler(handlerId);
    };
  }, [sb, connectionState.isConnected]);

  // Filter channels based on search query
  const filteredChannels = channels.filter(channel => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      channel.name?.toLowerCase().includes(query) ||
      channel.members.some(member => 
        member.nickname?.toLowerCase().includes(query)
      )
    );
  });

  const formatLastMessageTime = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const getChannelIcon = (channel: GroupChannel) => {
    if (channel.customType === 'consultation') {
      return <MessageSquare className="w-4 h-4" />;
    } else if (channel.customType === 'support') {
      return <Users className="w-4 h-4" />;
    } else if (channel.customType === 'private') {
      return <Lock className="w-4 h-4" />;
    }
    return <Hash className="w-4 h-4" />;
  };

  const getChannelName = (channel: GroupChannel) => {
    if (channel.name) return channel.name;
    
    // Generate name from members
    const otherMembers = channel.members.filter(member => member.userId !== sb?.currentUser?.userId);
    if (otherMembers.length === 1) {
      return otherMembers[0].nickname || 'Unknown User';
    } else if (otherMembers.length > 1) {
      return `${otherMembers[0].nickname || 'User'} and ${otherMembers.length - 1} others`;
    }
    
    return 'Chat';
  };

  const getLastMessagePreview = (channel: GroupChannel) => {
    const lastMessage = channel.lastMessage;
    if (!lastMessage) return 'No messages yet';

    if (lastMessage.messageType === 'user') {
      return lastMessage.message;
    } else if (lastMessage.messageType === 'file') {
      return '📎 File attachment';
    } else {
      return 'System message';
    }
  };

  if (!connectionState.isConnected) {
    return (
      <div className={`bg-white rounded-lg shadow-card p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-card overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">Chats</h3>
          {onCreateChannel && (
            <button
              onClick={onCreateChannel}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Start new chat"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Channel list */}
      <div className="overflow-y-auto max-h-96">
        {isLoading && (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
          </div>
        )}

        {error && (
          <div className="p-6 text-center text-red-500">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && filteredChannels.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium mb-2">No chats found</p>
            <p className="text-sm">
              {searchQuery ? 'Try a different search term' : 'Start a new conversation'}
            </p>
          </div>
        )}

        {filteredChannels.map((channel) => (
          <button
            key={channel.url}
            onClick={() => onChannelSelect(channel.url)}
            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
              selectedChannelUrl === channel.url ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* Channel icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                channel.customType === 'consultation' ? 'bg-blue-100 text-blue-600' :
                channel.customType === 'support' ? 'bg-green-100 text-green-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {getChannelIcon(channel)}
              </div>

              {/* Channel info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {getChannelName(channel)}
                  </h4>
                  {channel.lastMessage && (
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {formatLastMessageTime(channel.lastMessage.createdAt)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">
                    {getLastMessagePreview(channel)}
                  </p>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    {channel.unreadMessageCount > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-500 rounded-full">
                        {channel.unreadMessageCount > 99 ? '99+' : channel.unreadMessageCount}
                      </span>
                    )}
                    
                    {channel.memberCount > 2 && (
                      <div className="flex items-center text-gray-400">
                        <Users className="w-3 h-3" />
                        <span className="text-xs ml-1">{channel.memberCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatChannelList;
