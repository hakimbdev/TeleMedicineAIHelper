import React, { useState } from 'react';
import { 
  MoreVertical, 
  Reply, 
  Edit3, 
  Trash2, 
  Download, 
  Image, 
  FileText,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react';
import { SendBirdMessage } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  message: SendBirdMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  onReply?: (message: SendBirdMessage) => void;
  onEdit?: (messageId: number, newMessage: string) => void;
  onDelete?: (messageId: number) => void;
  className?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isOwn,
  showAvatar = true,
  onReply,
  onEdit,
  onDelete,
  className = '',
}) => {
  const { user } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.message);

  const handleEdit = () => {
    if (onEdit && editText.trim() !== message.message) {
      onEdit(message.messageId, editText.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(message.message);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'doctor':
        return 'text-blue-600';
      case 'patient':
        return 'text-green-600';
      case 'admin':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getFileIcon = (type?: string) => {
    if (!type) return <FileText className="w-4 h-4" />;
    
    if (type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const formatTime = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const renderMessageContent = () => {
    if (message.messageType === 'file') {
      return (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0">
            {getFileIcon(message.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {message.name || 'File'}
            </p>
            {message.size && (
              <p className="text-xs text-gray-500">
                {(message.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>
          {message.url && (
            <button
              onClick={() => window.open(message.url, '_blank')}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      );
    }

    if (isEditing) {
      return (
        <div className="space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            autoFocus
          />
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEdit}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditText(message.message);
              }}
              className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="prose prose-sm max-w-none">
        <p className="text-gray-900 whitespace-pre-wrap break-words">
          {message.message}
        </p>
      </div>
    );
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${className}`}>
      <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'} space-x-2`}>
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <div className="flex-shrink-0">
            <img
              src={message.sender.profileUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender.nickname)}&background=4F46E5&color=fff`}
              alt={message.sender.nickname}
              className="w-8 h-8 rounded-full"
            />
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`relative group ${
            isOwn ? 'ml-2' : 'mr-2'
          }`}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {/* Sender info */}
          {!isOwn && (
            <div className="flex items-center space-x-2 mb-1">
              <span className={`text-xs font-medium ${getRoleColor(message.sender.role)}`}>
                {message.sender.nickname}
              </span>
              <span className="text-xs text-gray-400 capitalize">
                {message.sender.role}
              </span>
            </div>
          )}

          {/* Message content */}
          <div
            className={`px-4 py-2 rounded-lg ${
              isOwn
                ? 'bg-blue-500 text-white'
                : message.messageType === 'admin'
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                : 'bg-white text-gray-900 border border-gray-200'
            }`}
          >
            {renderMessageContent()}
          </div>

          {/* Message metadata */}
          <div className={`flex items-center space-x-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-gray-400">
              {formatTime(message.createdAt)}
            </span>
            {message.updatedAt > message.createdAt && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
            {isOwn && (
              <div className="flex items-center">
                <Check className="w-3 h-3 text-gray-400" />
              </div>
            )}
          </div>

          {/* Message actions */}
          {showActions && (
            <div
              className={`absolute top-0 ${
                isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'
              } flex items-center space-x-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1`}
            >
              {onReply && (
                <button
                  onClick={() => onReply(message)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Reply"
                >
                  <Reply className="w-4 h-4" />
                </button>
              )}
              {isOwn && onEdit && message.messageType === 'user' && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
              {isOwn && onDelete && (
                <button
                  onClick={() => onDelete(message.messageId)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
