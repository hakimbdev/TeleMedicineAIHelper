import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Users,
  Phone,
  Video,
  Settings,
  MessageCircle,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessage {
  id: string;
  sender: {
    id: string;
    name: string;
    role: 'doctor' | 'patient' | 'admin';
    avatar?: string;
  };
  content: string;
  timestamp: number;
  type: 'text' | 'file' | 'system';
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

interface ChatDemoProps {
  channelName?: string;
  participants?: Array<{ id: string; name: string; role: string; }>;
  className?: string;
}

const ChatDemo: React.FC<ChatDemoProps> = ({
  channelName = "Consultation Chat",
  participants = [],
  className = '',
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with some demo messages
  useEffect(() => {
    const demoMessages: ChatMessage[] = [
      {
        id: '1',
        sender: {
          id: 'doctor_1',
          name: 'Dr. Sarah Johnson',
          role: 'doctor',
        },
        content: 'Hello! I\'m ready to start our consultation. How are you feeling today?',
        timestamp: Date.now() - 300000, // 5 minutes ago
        type: 'text',
        status: 'read',
      },
      {
        id: '2',
        sender: {
          id: 'patient_1',
          name: 'John Smith',
          role: 'patient',
        },
        content: 'Hi Dr. Johnson, I\'ve been experiencing some chest pain and wanted to discuss it with you.',
        timestamp: Date.now() - 240000, // 4 minutes ago
        type: 'text',
        status: 'read',
      },
      {
        id: '3',
        sender: {
          id: 'doctor_1',
          name: 'Dr. Sarah Johnson',
          role: 'doctor',
        },
        content: 'I understand your concern. Can you describe the pain? When did it start and how severe is it on a scale of 1-10?',
        timestamp: Date.now() - 180000, // 3 minutes ago
        type: 'text',
        status: 'read',
      },
      {
        id: '4',
        sender: {
          id: 'system',
          name: 'System',
          role: 'admin',
        },
        content: 'Video consultation started',
        timestamp: Date.now() - 120000, // 2 minutes ago
        type: 'system',
        status: 'delivered',
      },
    ];

    setMessages(demoMessages);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    if (isTyping) {
      const timeout = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: {
        id: user.id,
        name: user.name,
        role: user.role as 'doctor' | 'patient' | 'admin',
        avatar: user.avatar,
      },
      content: newMessage.trim(),
      timestamp: Date.now(),
      type: 'text',
      status: 'sending',
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, status: 'delivered' as const }
            : msg
        )
      );
    }, 1000);

    // Simulate auto-reply for demo
    if (user.role === 'patient') {
      setTimeout(() => {
        const autoReply: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: {
            id: 'doctor_1',
            name: 'Dr. Sarah Johnson',
            role: 'doctor',
          },
          content: 'Thank you for that information. Let me review your symptoms and medical history.',
          timestamp: Date.now() + 2000,
          type: 'text',
          status: 'sent',
        };
        setMessages(prev => [...prev, autoReply]);
      }, 3000);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (e.target.value && !isTyping) {
      setIsTyping(true);
      // Simulate other user seeing typing
      setTimeout(() => {
        setTypingUsers(['Dr. Johnson']);
        setTimeout(() => setTypingUsers([]), 2000);
      }, 500);
    }
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-card overflow-hidden flex flex-col ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <h3 className="text-lg font-medium text-gray-900">{channelName}</h3>
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{participants.length || 2}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Voice call">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Video call">
              <Video className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Settings">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Connection status */}
        <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
          <span>{isConnected ? 'Connected to SendBird' : 'Connecting...'}</span>
          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <span className="text-xs">{typingUsers.join(', ')} typing...</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0" style={{ maxHeight: '400px' }}>
        {messages.map((message) => {
          const isOwn = message.sender.id === user?.id;
          
          if (message.type === 'system') {
            return (
              <div key={message.id} className="text-center">
                <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  {message.content}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                </div>
              </div>
            );
          }

          return (
            <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'} space-x-2`}>
                {/* Avatar */}
                {!isOwn && (
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full ${getRoleColor(message.sender.role)} flex items-center justify-center text-white text-sm font-medium`}>
                      {message.sender.name.charAt(0)}
                    </div>
                  </div>
                )}

                {/* Message bubble */}
                <div className={`${isOwn ? 'ml-2' : 'mr-2'}`}>
                  {/* Sender info */}
                  {!isOwn && (
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-gray-700">{message.sender.name}</span>
                      <span className="text-xs text-gray-500 capitalize">{message.sender.role}</span>
                    </div>
                  )}

                  {/* Message content */}
                  <div className={`px-4 py-2 rounded-lg ${
                    isOwn
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Message metadata */}
                  <div className={`flex items-center space-x-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                    </span>
                    {isOwn && getStatusIcon(message.status)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="button"
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="flex-shrink-0 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Demo notice */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          <MessageCircle className="w-3 h-3 inline mr-1" />
          Demo chat powered by SendBird • Real-time messaging ready
        </div>
      </form>
    </div>
  );
};

export default ChatDemo;
