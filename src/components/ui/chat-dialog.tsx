import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { analyzeSecurityIncident } from '@/ai/flows/analyze-security-incident';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatDialogProps {
  incident: any;
  initialMessages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  onClose: () => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const ChatDialog: React.FC<ChatDialogProps> = ({ incident, onSendMessage, isLoading, onClose, messages, setMessages }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([...messages]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setLocalMessages([...messages]);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value);
  };

  const handleLocalSendMessage = async () => {
    if (newMessage.trim() !== '') {
      setLocalMessages((prevMessages) => [...prevMessages, { role: 'user', content: newMessage }]);
      setNewMessage('');
      await onSendMessage(newMessage);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleLocalSendMessage();
      event.preventDefault()
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const element = dialogRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const element = dialogRef.current;
    if (!element) return;

    element.style.left = `${e.clientX - position.x}px`;
    element.style.top = `${e.clientY - position.y}px`;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={dialogRef}
      className="relative w-96 h-96 bg-gray-900 text-white rounded-md shadow-lg z-50"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div className="handle cursor-move bg-gray-800 p-3 rounded-t-md flex items-center justify-between">
        Agentforce Chat
        <div className="flex items-center space-x-2">
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100% - 70px)] p-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">
            Incident Details:
          </div>
          <p>Time: {incident.time}</p>
          <p>Source IP: {incident.sourceIp}</p>
          <p>Description: {incident.description}</p>
          {localMessages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-[75%] ${message.role === 'user' ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-700 text-white mr-auto'
                }`}
            >
              <div className="text-sm font-medium">
                {message.role === "user" ? "You" : "Agentforce"}:
              </div>
              {message.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="flex items-center space-x-2 border-t border-gray-700 p-4">
        <Input
          className='flex-grow bg-gray-800 border-gray-700 text-white'
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
        />
        <Button onClick={handleLocalSendMessage}>Send</Button>
      </div>
      {isLoading && (
        <div className="text-sm text-gray-500 mt-2">Loading...</div>
      )}
    </div>
  );
};

export default ChatDialog;
