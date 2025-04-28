'use client';

import React, {useState, useRef, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {analyzeSecurityIncident} from '@/ai/flows/analyze-security-incident';
import {Input} from '@/components/ui/input';
import {ScrollArea} from '@/components/ui/scroll-area';
import {X, Minus, ChevronDown} from 'lucide-react';
import {cn} from '@/lib/utils';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatDialogProps {
  incident: any;
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  onClose: () => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isChatExpanded: boolean;
  setIsChatExpanded: (isChatExpanded: boolean) => void;
}

const ChatDialog: React.FC<ChatDialogProps> = ({
  incident,
  onSendMessage,
  isLoading,
  onClose,
  messages,
  setMessages,
  isChatExpanded,
  setIsChatExpanded,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([...messages]);

  useEffect(() => {
    setLocalMessages([...messages]);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  };

  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value);
  };

  const handleLocalSendMessage = async () => {
    if (newMessage.trim() !== '') {
      setLocalMessages(prevMessages => [
        ...prevMessages,
        {role: 'user', content: newMessage},
      ]);
      setNewMessage('');
      await onSendMessage(newMessage);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleLocalSendMessage();
      event.preventDefault();
    }
  };

  const toggleOpen = () => setIsChatExpanded(!isChatExpanded);

  return (
    <div
      className={cn(
        `fixed bottom-4 right-4 z-50 transition-all duration-300 bg-[#1e1e1e] text-white rounded-md border shadow-md opacity-90 overflow-hidden flex flex-col`,
        isChatExpanded ? 'w-96 h-96' : 'w-32 h-12',
        'ml-4', // Add right margin when both are at the bottom
      )}
    >
      <div
        className="bg-[#333] p-2 cursor-move flex items-center justify-between"
        onClick={toggleOpen}
      >
        <h3 className="text-lg font-semibold flex items-center gap-2">
          Agentforce Chat
        </h3>
        <div className="flex gap-2 items-center">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isChatExpanded && (
        <div className="flex flex-col h-full">
          <ScrollArea className="h-[calc(100% - 70px)] p-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Incident Details:</div>
              <p>Time: {incident.time}</p>
              <p>Source IP: {incident.sourceIp}</p>
              <p>Description: {incident.description}</p>
              {localMessages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg max-w-[75%] ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white ml-auto'
                      : 'bg-gray-700 text-white mr-auto'
                  }`}
                >
                  <div className="text-sm font-medium">
                    {message.role === 'user' ? 'You' : 'Agentforce'}:
                  </div>
                  {message.content}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="flex items-center space-x-2 border-t border-gray-700 p-4">
            <Input
              className="flex-grow bg-gray-800 border-gray-700 text-white"
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
            />
            <Button onClick={handleLocalSendMessage}>Send</Button>
          </div>
          {isLoading && <div className="text-sm text-gray-500 mt-2">Loading...</div>}
        </div>
      )}
    </div>
  );
};

export default ChatDialog;
