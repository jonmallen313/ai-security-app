"use client";

import React, { useEffect } from "react";
import Dashboard from "@/components/Dashboard";
import { useTheme } from "@/hooks/use-theme";

export default function Home() {
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex justify-end p-4">
        <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
          {resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
        <Dashboard/>
    </main>
  );
}
