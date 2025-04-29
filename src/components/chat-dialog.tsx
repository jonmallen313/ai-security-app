import { Incident } from '@/services/incidents';

interface ChatDialogProps {
  incident: Incident;
  onClose: () => void;
}

// ... existing code ... 