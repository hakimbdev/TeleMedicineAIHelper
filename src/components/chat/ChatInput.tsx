import React, { useState, useRef, useCallback } from 'react';
import { 
  Send, 
  Paperclip, 
  Image, 
  Smile, 
  X,
  FileText,
  AlertCircle
} from 'lucide-react';
import { SENDBIRD_CONFIG } from '../../config/sendbird';

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  onSendFile: (file: File) => Promise<void>;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onSendFile,
  onTypingStart,
  onTypingEnd,
  disabled = false,
  placeholder = "Type a message...",
  maxLength = 1000,
  className = '',
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  // Handle typing indicators
  const handleTypingStart = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      onTypingStart?.();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTypingEnd?.();
    }, 1000);
  }, [isTyping, onTypingStart, onTypingEnd]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
      adjustTextareaHeight();
      
      if (value.trim()) {
        handleTypingStart();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSendMessage(trimmedMessage);
      setMessage('');
      adjustTextareaHeight();
      
      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        onTypingEnd?.();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > SENDBIRD_CONFIG.FILE_UPLOAD.maxSize) {
      return `File size must be less than ${SENDBIRD_CONFIG.FILE_UPLOAD.maxSize / 1024 / 1024}MB`;
    }

    // Check file type
    if (!SENDBIRD_CONFIG.FILE_UPLOAD.allowedTypes.includes(file.type)) {
      return 'File type not supported';
    }

    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setFileError(error);
      return;
    }

    setSelectedFile(file);
    setFileError(null);
  };

  const handleSendFile = async () => {
    if (!selectedFile || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSendFile(selectedFile);
      setSelectedFile(null);
      setFileError(null);
    } catch (error) {
      console.error('Failed to send file:', error);
      setFileError('Failed to send file');
    } finally {
      setIsSending(false);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className={`bg-white border-t border-gray-200 ${className}`}>
      {/* File preview */}
      {selectedFile && (
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 text-gray-500">
                {getFileIcon(selectedFile)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSendFile}
                disabled={isSending}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {isSending ? 'Sending...' : 'Send'}
              </button>
              <button
                onClick={removeSelectedFile}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File error */}
      {fileError && (
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 rounded-lg p-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{fileError}</span>
            <button
              onClick={() => setFileError(null)}
              className="ml-auto p-1 hover:bg-red-100 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="px-4 py-3">
        <div className="flex items-end space-x-3">
          {/* File upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isSending}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled || isSending}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            
            {/* Character count */}
            <div className="absolute bottom-1 right-2 text-xs text-gray-400">
              {message.length}/{maxLength}
            </div>
          </div>

          {/* Send button */}
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || disabled || isSending}
            className="flex-shrink-0 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Typing indicator */}
        {isTyping && (
          <div className="mt-2 text-xs text-gray-500">
            Typing...
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept={SENDBIRD_CONFIG.FILE_UPLOAD.allowedTypes.join(',')}
        className="hidden"
      />
    </div>
  );
};

export default ChatInput;
