import React, { useState, useRef, useEffect} from 'react';
import { Button } from '@/components/ui/button';
import { analyzeSecurityIncident } from '@/ai/flows/analyze-security-incident';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

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


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [localMessages]);


  useEffect(() => {
    setMessages([...localMessages]);
  }, [localMessages, setMessages])

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

  return (
            <>

            <ScrollArea className="h-[300px] mb-4 overflow-y-scroll">
                <div className="space-y-2">
                    <div
                        className={`p-3 rounded-lg max-w-[75%] bg-gray-800 text-white mr-auto`}
                    >
                        <div className="text-sm font-medium">
                            Incident Details:
                        </div>
                        <p>Time: {incident.time}</p>
                        <p>Source IP: {incident.sourceIp}</p>
                        <p>Description: {incident.description}</p>
                    </div>
                    {localMessages.map((message, index) => (
                        <div
                            key={index}
                            className={`p-3 rounded-lg max-w-[75%] ${message.role === 'user' ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-800 text-white mr-auto'
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
            <div className="flex items-center space-x-2 border rounded-lg p-2">
                <Input
                    className='flex-grow'
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
            </>
  );
};

export default ChatDialog;
