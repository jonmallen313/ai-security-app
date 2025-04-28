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
import ActivityFeedOverlay from '@/components/ActivityFeed';
import { useEffect, useState } from 'react';
import { Incident, getIncidents } from '@/services/incidents';
import {ActivityItem} from '@/components/ActivityFeed';
import { metadata } from './metadata';
import type { Metadata } from 'next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
                </SidebarMenu>
                <SidebarSeparator/>
              </SidebarContent>
            </Sidebar>

            <div className="flex flex-col flex-1 p-4 space-y-4">
              <header className="flex items-center justify-between h-16 border-b bg-background">
                <h1 className="text-2xl font-semibold">SecureView Dashboard</h1>
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
          <Toaster/>
        </SidebarProvider>
        <DndProvider backend={HTML5Backend}>
          <ActivityFeedOverlay events={[]} />
        </DndProvider>
      </body>
    </html>
  );
}
