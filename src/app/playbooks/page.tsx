'use client';

import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { FileText, Clock, AlertTriangle, Shield, Zap, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

// Define the Playbook interface
interface Playbook {
  id: string;
  name: string;
  description: string;
  lastUpdated: Date;
  category: 'Incident Response' | 'Threat Hunting' | 'Vulnerability Management' | 'Compliance';
  steps: {
    id: string;
    title: string;
    description: string;
    order: number;
  }[];
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

// Sample playbook data
const samplePlaybooks: Playbook[] = [
  {
    id: '1',
    name: 'Phishing Incident Response',
    description: 'Standard procedures for responding to phishing incidents, including email analysis, containment, and user notification.',
    lastUpdated: new Date('2023-11-15T09:30:00'),
    category: 'Incident Response',
    steps: [
      {
        id: '1-1',
        title: 'Identify the Phishing Email',
        description: 'Locate and isolate the phishing email from the user\'s inbox.',
        order: 1
      },
      {
        id: '1-2',
        title: 'Analyze Email Headers',
        description: 'Examine email headers to determine the source and potential indicators of compromise.',
        order: 2
      },
      {
        id: '1-3',
        title: 'Check for Malicious Attachments',
        description: 'Scan any attachments for malware using security tools.',
        order: 3
      },
      {
        id: '1-4',
        title: 'Contain the Threat',
        description: 'Block sender domains, URLs, and IPs associated with the phishing attempt.',
        order: 4
      },
      {
        id: '1-5',
        title: 'Notify Affected Users',
        description: 'Inform users who may have received the phishing email about the incident.',
        order: 5
      }
    ],
    estimatedTime: '1-2 hours',
    difficulty: 'Intermediate'
  },
  {
    id: '2',
    name: 'Ransomware Detection and Response',
    description: 'Procedures for detecting, containing, and recovering from ransomware attacks.',
    lastUpdated: new Date('2023-10-28T14:45:00'),
    category: 'Incident Response',
    steps: [
      {
        id: '2-1',
        title: 'Detect Ransomware Activity',
        description: 'Identify unusual file system activity, network connections, or encryption processes.',
        order: 1
      },
      {
        id: '2-2',
        title: 'Isolate Infected Systems',
        description: 'Disconnect affected systems from the network to prevent lateral movement.',
        order: 2
      },
      {
        id: '2-3',
        title: 'Identify the Ransomware Variant',
        description: 'Determine which ransomware family is involved to understand its behavior.',
        order: 3
      },
      {
        id: '2-4',
        title: 'Assess Impact',
        description: 'Determine the scope of the infection and affected systems.',
        order: 4
      },
      {
        id: '2-5',
        title: 'Begin Recovery Process',
        description: 'Restore systems from backups or rebuild if necessary.',
        order: 5
      }
    ],
    estimatedTime: '4-8 hours',
    difficulty: 'Advanced'
  },
  {
    id: '3',
    name: 'Vulnerability Scanning and Remediation',
    description: 'Process for conducting vulnerability scans and prioritizing remediation efforts.',
    lastUpdated: new Date('2023-11-05T11:20:00'),
    category: 'Vulnerability Management',
    steps: [
      {
        id: '3-1',
        title: 'Schedule Vulnerability Scan',
        description: 'Plan and schedule automated vulnerability scans of the network.',
        order: 1
      },
      {
        id: '3-2',
        title: 'Analyze Scan Results',
        description: 'Review and categorize vulnerabilities by severity and potential impact.',
        order: 2
      },
      {
        id: '3-3',
        title: 'Prioritize Remediation',
        description: 'Assign priority levels to vulnerabilities based on risk assessment.',
        order: 3
      },
      {
        id: '3-4',
        title: 'Apply Patches and Fixes',
        description: 'Implement security patches and configuration changes to address vulnerabilities.',
        order: 4
      },
      {
        id: '3-5',
        title: 'Verify Remediation',
        description: 'Conduct follow-up scans to confirm vulnerabilities have been addressed.',
        order: 5
      }
    ],
    estimatedTime: '2-3 days',
    difficulty: 'Intermediate'
  },
  {
    id: '4',
    name: 'Threat Hunting for Advanced Persistent Threats',
    description: 'Procedures for proactively hunting for signs of advanced persistent threats in the environment.',
    lastUpdated: new Date('2023-09-20T16:15:00'),
    category: 'Threat Hunting',
    steps: [
      {
        id: '4-1',
        title: 'Define Hunting Hypothesis',
        description: 'Develop specific hypotheses about potential threats to investigate.',
        order: 1
      },
      {
        id: '4-2',
        title: 'Collect and Analyze Data',
        description: 'Gather logs, network traffic, and endpoint data for analysis.',
        order: 2
      },
      {
        id: '4-3',
        title: 'Identify Anomalies',
        description: 'Look for patterns and behaviors that deviate from normal activity.',
        order: 3
      },
      {
        id: '4-4',
        title: 'Investigate Findings',
        description: 'Dive deeper into suspicious activities to determine if they represent threats.',
        order: 4
      },
      {
        id: '4-5',
        title: 'Document and Report',
        description: 'Record findings and recommendations for addressing discovered threats.',
        order: 5
      }
    ],
    estimatedTime: '3-5 days',
    difficulty: 'Advanced'
  },
  {
    id: '5',
    name: 'GDPR Compliance Checklist',
    description: 'Comprehensive checklist for ensuring compliance with GDPR requirements.',
    lastUpdated: new Date('2023-10-10T13:40:00'),
    category: 'Compliance',
    steps: [
      {
        id: '5-1',
        title: 'Data Inventory and Mapping',
        description: 'Document all personal data processing activities and data flows.',
        order: 1
      },
      {
        id: '5-2',
        title: 'Privacy Policy Review',
        description: 'Ensure privacy policies accurately reflect data processing practices.',
        order: 2
      },
      {
        id: '5-3',
        title: 'Consent Management',
        description: 'Verify that consent mechanisms meet GDPR requirements.',
        order: 3
      },
      {
        id: '5-4',
        title: 'Data Subject Rights',
        description: 'Implement processes for handling data subject access requests.',
        order: 4
      },
      {
        id: '5-5',
        title: 'Security Measures',
        description: 'Review and enhance security measures to protect personal data.',
        order: 5
      }
    ],
    estimatedTime: '1-2 weeks',
    difficulty: 'Intermediate'
  }
];

const PlaybooksPage = () => {
  const { toast } = useToast();
  const [playbooks, setPlaybooks] = useState<Playbook[]>(samplePlaybooks);
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleViewDetails = (playbook: Playbook) => {
    setIsLoading(true);
    setSelectedPlaybook(playbook);
    setIsDialogOpen(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Incident Response':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'Threat Hunting':
        return <Shield className="h-5 w-5 text-blue-500" />;
      case 'Vulnerability Management':
        return <Zap className="h-5 w-5 text-yellow-500" />;
      case 'Compliance':
        return <FileText className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Format date to a readable string
  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Security Playbooks</h1>
        <p className="text-muted-foreground">
          Standardized procedures for handling security incidents and tasks
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playbooks.map((playbook) => (
          <Card key={playbook.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                {getCategoryIcon(playbook.category)}
                <Badge className={cn(badgeVariants({ variant: "outline" }), "ml-auto")}>
                  {playbook.category}
                </Badge>
              </div>
              <CardTitle>{playbook.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {playbook.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Clock className="h-4 w-4 mr-1" />
                <span>Last updated: {formatDate(playbook.lastUpdated)}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="mr-2">Estimated time: {playbook.estimatedTime}</span>
                <Badge className={getDifficultyColor(playbook.difficulty)}>
                  {playbook.difficulty}
                </Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleViewDetails(playbook)}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading playbook details...</p>
            </div>
          ) : selectedPlaybook ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getCategoryIcon(selectedPlaybook.category)}
                  <Badge className={cn(badgeVariants({ variant: "outline" }), "ml-auto")}>
                    {selectedPlaybook.category}
                  </Badge>
                </div>
                <DialogTitle className="text-2xl">{selectedPlaybook.name}</DialogTitle>
                <DialogDescription className="text-base">
                  {selectedPlaybook.description}
                </DialogDescription>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Last updated: {formatDate(selectedPlaybook.lastUpdated)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">Estimated time: {selectedPlaybook.estimatedTime}</span>
                    <Badge className={getDifficultyColor(selectedPlaybook.difficulty)}>
                      {selectedPlaybook.difficulty}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="py-4">
                <h3 className="text-lg font-semibold mb-4">Playbook Steps</h3>
                <div className="space-y-4">
                  {selectedPlaybook.steps
                    .sort((a, b) => a.order - b.order)
                    .map((step) => (
                      <div key={step.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {step.order}
                          </div>
                          <div>
                            <h4 className="font-medium">{step.title}</h4>
                            <p className="text-muted-foreground mt-1">{step.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
                <Button>
                  Execute Playbook
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlaybooksPage; 