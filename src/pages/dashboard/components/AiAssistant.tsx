import { useState } from 'react';
import { Bot, Send, PlusCircle } from 'lucide-react';

const AiAssistant = () => {
  const [message, setMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // In a real app, this would send the message to the AI service
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-accent-50 p-3 flex items-center border-b border-gray-200">
        <Bot className="h-5 w-5 text-accent-600 mr-2" />
        <h3 className="text-sm font-medium text-accent-800">AI Health Assistant</h3>
      </div>
      
      <div className="p-3 bg-white min-h-[150px] max-h-[150px] overflow-y-auto flex flex-col space-y-3">
        <div className="flex items-start">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center mr-2">
            <Bot className="h-4 w-4 text-accent-600" />
          </div>
          <div className="bg-gray-100 rounded-lg p-2 max-w-[85%]">
            <p className="text-sm text-gray-800">
              Hello! I'm your AI health assistant. How can I help you today?
            </p>
          </div>
        </div>
        
        <div className="flex items-start justify-end">
          <div className="bg-primary-100 rounded-lg p-2 max-w-[85%]">
            <p className="text-sm text-primary-800">
              I've been having headaches for the past few days.
            </p>
          </div>
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center ml-2">
            <span className="text-sm font-medium text-primary-600">You</span>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center mr-2">
            <Bot className="h-4 w-4 text-accent-600" />
          </div>
          <div className="bg-gray-100 rounded-lg p-2 max-w-[85%]">
            <p className="text-sm text-gray-800">
              I'm sorry to hear that. Could you tell me more about your headaches? When did they start, and have you noticed any triggers?
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-3 flex items-center">
        <button 
          type="button" 
          className="text-gray-500 hover:text-gray-700 mr-2"
          aria-label="Add attachment"
        >
          <PlusCircle className="h-5 w-5" />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow px-3 py-1 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
        />
        <button 
          type="submit" 
          className="ml-2 flex-shrink-0 bg-accent-500 text-white p-1.5 rounded-full hover:bg-accent-600 transition-colors"
          disabled={!message.trim()}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default AiAssistant;