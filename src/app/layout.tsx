'use client';

import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import {Toaster} from "@/components/ui/toaster";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator
} from '@/components/ui/sidebar';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useEffect, useState } from 'react';
import { Incident } from '@/services/incidents';
import { getIncidents } from '@/services/api';
import { Settings, ClipboardList, FileText, BarChart, Bell, Users, Shield, MessageSquare, FileSearch, BookOpen } from 'lucide-react';
import { Inter } from "next/font/google";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const inter = Inter({ subsets: ["latin"] });

export interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    const loadIncidents = async () => {
      const fetchedIncidents = await getIncidents();
      setIncidents(fetchedIncidents);
    };

    loadIncidents();
  }, []);
  
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.className} antialiased`}>
        <SidebarProvider>
          <div className="flex h-screen">
            <Sidebar collapsible="icon">
              <SidebarContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link href="/">
                      <SidebarMenuButton>Dashboard</SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/incidents">
                      <SidebarMenuButton>Incidents</SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/dashboard/agents">
                      <SidebarMenuButton>
                        <Users className="mr-2 h-4 w-4" />
                        Agents
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/settings">
                      <SidebarMenuButton>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/agent-configuration">
                      <SidebarMenuButton>
                        <Settings className="mr-2 h-4 w-4" />
                        Agent Configuration
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/tasks">
                      <SidebarMenuButton>
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Tasks
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/playbooks">
                      <SidebarMenuButton>
                        <FileText className="mr-2 h-4 w-4" />
                        Playbooks
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/analytics">
                      <SidebarMenuButton>
                        <BarChart className="mr-2 h-4 w-4" />
                        Analytics
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/alerts">
                      <SidebarMenuButton>
                        <Bell className="mr-2 h-4 w-4" />
                        Alerts
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/rules">
                      <SidebarMenuButton>
                        <Shield className="mr-2 h-4 w-4" />
                        Rules
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/slack-notifications">
                      <SidebarMenuButton>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Slack Notifications
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/log-integration">
                      <SidebarMenuButton>
                        <FileSearch className="mr-2 h-4 w-4" />
                        Log Integration
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link href="/playbook-maker">
                      <SidebarMenuButton>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Playbook Maker
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </SidebarMenu>
                <SidebarSeparator/>
              </SidebarContent>
            </Sidebar>

            <div className="flex flex-col flex-1 p-4 space-y-4">
              <header className="flex items-center justify-between h-16 border-b bg-background">
                <h1 className="text-2xl font-semibold">SecureView Dashboard</h1>
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-y-auto h-[calc(100vh-5rem)]">
                {children}
              </main>
            </div>
          </div>
          <Toaster/>
        </SidebarProvider>
        <DndProvider backend={HTML5Backend}>
        </DndProvider>
      </body>
    </html>
  );
}

