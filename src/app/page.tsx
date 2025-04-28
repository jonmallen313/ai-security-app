"use client";

import React, { useEffect, useState } from "react";
import Dashboard from "@/components/Dashboard";
import { useTheme } from "@/hooks/use-theme";
import ChatDialog, { Message } from "@/components/ui/chat-dialog";
import ActivityFeedOverlay from '@/components/ActivityFeed';
import { Incident } from "@/services/incidents";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyzeSecurityIncident, AnalyzeSecurityIncidentOutput } from '@/ai/flows/analyze-security-incident';

export default function Home() {
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isActivityFeedOpen, setIsActivityFeedOpen] = useState<boolean>(false);
  const [chatDialogPosition, setChatDialogPosition] = useState({ top: 0, left: 0 });
  const [activityFeedPosition, setActivityFeedPosition] = useState({ top: 0, left: 0 });
  const [isChatExpanded, setIsChatExpanded] = useState<boolean>(true);
  const [isActivityExpanded, setIsActivityExpanded] = useState<boolean>(true);

  const handleAskAgentforce = async (incident: Incident) => {
    if (!incident) return;
    setSelectedIncident(incident);
    setIsChatModalOpen(true);
    setMessages([
      {
        role: "assistant",
        content: `Analyzing incident: Time: ${incident.time}, Source IP: ${incident.sourceIp}, Description: ${incident.description}. Suggested mitigations and analysis will appear below.`,
      },
    ]);
  };

  const handleSendMessage = async (message: string): Promise<void> => {
    if (!selectedIncident) return;
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      if (!selectedIncident) {
        console.error("No incident selected.");
        return;
      }

      const analysisResult: AnalyzeSecurityIncidentOutput = await analyzeSecurityIncident({
        time: selectedIncident.time,
        sourceIp: selectedIncident.sourceIp,
        threatLevel: selectedIncident.threatLevel,
        description: selectedIncident.description,
        message: message,
      });

      const response: any = { analysis: analysisResult.analysis }; // Replace 'analysisResult' with the actual analysis.

      setMessages((prev) => [...prev, {
        role: "assistant",
        content: response.analysis,
      }]);

    } catch (error: any) {
      console.error("Error analyzing security incident:", error);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `Failed to analyze the incident. Please try again later. ${error.message}`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsChatModalOpen(false);
    setSelectedIncident(null);
  };

  const toggleChatOpenState = () => {
    setIsChatExpanded(!isChatExpanded);
  }

    const toggleActivityOpenState = () => {
        setIsActivityExpanded(!isActivityExpanded);
    }


  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex justify-end p-4">
        <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
          {resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
        <Dashboard
        onAskAgentforce={handleAskAgentforce}
        isActivityFeedOpen={isActivityFeedOpen}
        setIsActivityFeedOpen={setIsActivityFeedOpen}
            activityFeedPosition={activityFeedPosition}
        />
        <section className={cn(
            isChatModalOpen || isActivityFeedOpen ? 'absolute' : 'relative',
            'flex flex-col items-end justify-end gap-4',
            'bottom-4 right-4',
            isChatModalOpen && isActivityFeedOpen ? 'md:flex-row' : ''
        )}>
            {isChatModalOpen && selectedIncident && (
                <div
                    className={cn(
                        `fixed bottom-4 right-[13rem] z-40 transition-all duration-300 bg-[#1e1e1e] text-white rounded-md border shadow-md opacity-90 overflow-hidden flex flex-col`,
                        isChatExpanded ? 'w-96 h-96' : 'w-32 h-12',
                        'ml-4', // Add right margin when both are at the bottom
                    )}
                >
                    <div
                        className="bg-[#333] p-2 cursor-move flex items-center justify-between"
                        onClick={toggleChatOpenState}
                    >
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            Agentforce Chat
                        </h3>
                        <div className="flex gap-2 items-center">
                            <Button variant="ghost" size="icon" onClick={() => {
                                setIsChatModalOpen(false)
                            }}>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    {isChatExpanded && (
                        <ChatDialog
                            messages={messages}
                            incident={selectedIncident}
                            isLoading={isLoading}
                            onSendMessage={handleSendMessage}
                            onClose={handleCloseModal}
                            setMessages={setMessages}
                            isChatExpanded={isChatExpanded}
                            setIsChatExpanded={setIsChatExpanded}
                        />)}
                </div>)}
        </section>
    </main>
  );
}

