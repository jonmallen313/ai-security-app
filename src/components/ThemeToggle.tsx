'use client';

import {useEffect, useState} from 'react';
import {Switch} from '@/components/ui/switch';
import {Moon, Sun} from 'lucide-react';

const ThemeToggle = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    setEnabled(storedTheme === 'dark');

    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setEnabled(!enabled);
    const newTheme = !enabled ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', !enabled);
  };

  return (
    <Switch
      checked={enabled}
      onCheckedChange={toggleTheme}
      className="peer h-6 w-12 rounded-full bg-secondary text-secondary-foreground shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
    >
      {enabled ? <Moon className="h-4 w-4"/> : <Sun className="h-4 w-4"/>}
    </Switch>
  );
};

export default ThemeToggle;
