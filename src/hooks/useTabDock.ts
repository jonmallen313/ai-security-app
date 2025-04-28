import { useState, useEffect } from "react";

interface WindowState {
  id: string;
  title: string;
  isOpen?: boolean;
}

export const useTabDock = () => {
  const [windows, setWindows] = useState<WindowState[]>([]);

  useEffect(() => {
    console.log("windows", windows);
  }, [windows]);

  const registerWindow = (windowState: WindowState) => {
    setWindows((prevWindows) => [...prevWindows, windowState]);
  };

  const unregisterWindow = (windowId: string) => {
    setWindows((prevWindows) =>
      prevWindows.filter((window) => window.id !== windowId)
    );
  };

  const toggleWindow = (windowId: string) => {
    setWindows((prevWindows) =>
      prevWindows.map((window) =>
        window.id === windowId ? { ...window, isOpen: !window.isOpen } : window
      )
    );
  };

  const isWindowActive = (windowId: string) => {
    return windows.find((window) => window.id === windowId)?.isOpen ?? false;
  };

  return {
    registerWindow,
    unregisterWindow,
    toggleWindow,
    isWindowActive,
  };
};