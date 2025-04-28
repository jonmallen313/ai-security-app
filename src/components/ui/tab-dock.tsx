
import React, { useState, useRef, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from "@/lib/utils";

interface WindowData {
  id: string;
  title: string;
  isActive: boolean;
  content: React.ReactNode;
}

interface SortableTabProps {
    id: string;
    style: React.CSSProperties;
    listeners: any;
    transform: string | null;
    transition: string | null;
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}
  
const SortableTab = React.forwardRef<HTMLDivElement, SortableTabProps>(({ id, style, listeners, transform, transition, isActive, onClick, children }, ref) => {
  const tabClasses = cn("px-4 py-2 rounded-t-md cursor-pointer text-sm select-none", isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground");
  return (
    <div ref={ref} style={{ transform: CSS.Transform.toString(transform), transition, ...style }} {...listeners} className={tabClasses} onClick={onClick}>
      {children}
    </div>
  );
});

const TabDock = () => {
  const [windows, setWindows] = useState<WindowData[]>([
    { id: 'activity-feed', title: 'Activity Feed', isActive: true, content: <div>Activity Feed Content</div> },
    { id: 'chat-dialog', title: 'Chat', isActive: false, content: <div>Chat Dialog Content</div> },
  ]);
  const activeWindow = windows.find(window => window.isActive);
  const sensors = useSensors(useSensor(PointerSensor));

  const handleWindowChange = (id: string) => {
    setWindows(prevWindows => prevWindows.map(window => ({
      ...window,
      isActive: window.id === id
    })));
  };
  const activeIdRef = useRef<string | null>(null);

  const handleDragStart = ({ active }: { active: { id: string } }) => {
      activeIdRef.current = active.id;
  };

  const handleDragEnd = ({ active, over }: { active: { id: string }, over: { id: string | null } }) => {
    if (!over) return;
    if (active.id !== over.id) {
      setWindows((items) => {
        const oldIndex = items.findIndex(window => window.id === active.id);
        const newIndex = items.findIndex(window => window.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    activeIdRef.current = null;
  };

  return (
    <div className="fixed bottom-0 right-0 flex flex-col items-end p-4 w-full max-w-sm">
      {activeWindow && (
        <div className="mb-2 w-full rounded-lg bg-card shadow-lg p-4 z-20">
          {activeWindow.content}
        </div>
      )}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={windows.map(window => window.id)} strategy={horizontalListStrategy}>
            <div className="flex gap-2 flex-row-reverse w-full z-30">
                {windows.map((window) => (
                    <SortableTab key={window.id} id={window.id} isActive={window.isActive} onClick={() => handleWindowChange(window.id)}>
                        {window.title}
                    </SortableTab>
                ))}
            </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default TabDock;
