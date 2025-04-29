'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AIChat } from '@/components/ui/ai-chat';

interface AIChatDialogProps {
  incident: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIChatDialog({ incident, open, onOpenChange }: AIChatDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0">
        <AIChat 
          incident={incident} 
          onClose={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  );
} 