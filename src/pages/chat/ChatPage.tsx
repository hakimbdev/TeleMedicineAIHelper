import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ChatDemo from '../../components/chat/ChatDemo';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedChannel, setSelectedChannel] = useState<string>('general');

  const channels = [
    { id: 'general', name: 'General Chat', type: 'support' },
    { id: 'consultation', name: 'Consultation Room', type: 'consultation' },
    { id: 'support', name: 'Technical Support', type: 'support' },
  ];

  const getChannelData = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    return channel || channels[0];
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600">SendBird Chat Integration Demo</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Channel selector */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Select Channel:</span>
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedChannel === channel.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {channel.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main chat interface */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <ChatDemo
            channelName={getChannelData(selectedChannel).name}
            participants={[
              { id: 'user_1', name: user?.name || 'You', role: user?.role || 'patient' },
              { id: 'other_1', name: selectedChannel === 'consultation' ? 'Dr. Sarah Johnson' : 'Support Agent', role: selectedChannel === 'consultation' ? 'doctor' : 'admin' }
            ]}
            className="h-[600px]"
          />
        </div>

        {/* Info panel */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <MessageCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">SendBird Chat Integration</h3>
              <p className="text-sm text-blue-700 mt-1">
                This is a demo of the SendBird chat implementation. In production, this will connect to real SendBird channels with:
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Real-time messaging with delivery receipts</li>
                <li>• File sharing and media support</li>
                <li>• Typing indicators and user presence</li>
                <li>• Message history and offline sync</li>
                <li>• Push notifications and alerts</li>
                <li>• HIPAA-compliant secure messaging</li>
              </ul>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default ChatPage;
