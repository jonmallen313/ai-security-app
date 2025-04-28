import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTabDock } from "../hooks/useTabDock";
import { useEffect } from "react";

interface ChatDialogProps {
  children?: React.ReactNode;
}

export const ChatDialog: React.FC<ChatDialogProps> = ({ children }) => {
  const {
    registerWindow,
    toggleWindow,
    isWindowActive,
  } = useTabDock();

  const windowId = "chat";

  useEffect(() => {
    registerWindow({ id: windowId, title: "Chat" });
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    toggleWindow(windowId);
  };

  return (
    <>
      {children}
      <Dialog
        open={isWindowActive(windowId)}        
        onOpenChange={handleOpenChange}
      >
        <DialogContent className="sm:max-w-[425px] fixed bottom-16 right-4 border-none bg-popover text-popover-foreground">
        <DialogHeader>
          <DialogTitle>Chat</DialogTitle>
          <DialogDescription>
            This is a simple chat dialog.
          </DialogDescription>
        </DialogHeader>
        {/* Add chat messages here */}
        <DialogFooter>
          <Button type="submit">Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};