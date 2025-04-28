import React, { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { analyzeSecurityIncident } from '@/ai/flows/analyze-security-incident';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  incident: any;
  initialMessages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    trigger: React.ReactNode;

}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, setIsOpen, incident, initialMessages, setMessages, trigger }) => {
    const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
	const [messages, setLocalMessages] = useState<Message[]>([...initialMessages]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);


  useEffect(() => {
    setMessages([...messages]);
  }, [messages])



  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() !== '') {
      setLocalMessages((prevMessages) => [...prevMessages, { role: 'user', content: newMessage }]);
      
      const currentMessage = newMessage;
      setNewMessage('');
      try {
        const analysisResult = await analyzeSecurityIncident({
          time: incident.time,
          sourceIp: incident.sourceIp,
          threatLevel: incident.threatLevel,
          description: incident.description + '\\nUser Question: ' + currentMessage
        });
        setLocalMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: analysisResult.analysis }]);
      } catch (error) {
        console.error('Error analyzing incident:', error);
      }
    }
  };

  
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
      event.preventDefault()
    }
  };  

  return (
            <>
            <DialogHeader>
                <DialogTitle>Chat with Agentforce</DialogTitle>
                <DialogDescription>
                    Ask Agentforce about this incident.
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[300px] mb-4 overflow-y-scroll">
                <div className="space-y-2">
                    <div
                        className={`p-3 rounded-lg max-w-[75%] bg-gray-200 mr-auto`}
                    >
                        <div className="text-sm font-medium">
                            Incident Details:
                        </div>
                        <p>Time: {incident.time}</p>
                        <p>Source IP: {incident.sourceIp}</p>
                        <p>Description: {incident.description}</p>
                    </div>
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`p-3 rounded-lg max-w-[75%] ${message.role === 'user' ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-200 mr-auto'
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
                <Button onClick={handleSendMessage}>Send</Button>
            </div>
            </>
  );
};

export default ChatModal;
