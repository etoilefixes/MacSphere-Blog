
'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  // Initialize theme to 'light' by default, will be updated by useEffect
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // This effect runs once on the client after hydration
    let initialTheme: 'light' | 'dark' = 'light';
    try {
      const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      if (storedTheme) {
        initialTheme = storedTheme;
      } else if (systemPrefersDark) {
        initialTheme = 'dark';
      }
    } catch (error) {
      // localStorage or matchMedia might not be available (e.g., in certain testing environments)
      console.warn("Could not access theme preference, defaulting to light.", error);
    }
    
    setTheme(initialTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    // This effect runs whenever the theme state changes, after initial mount
    if (mounted) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        try {
          localStorage.setItem('theme', 'dark');
        } catch (error) {
          console.warn("Could not save dark theme preference to localStorage.", error);
        }
      } else {
        document.documentElement.classList.remove('dark');
        try {
          localStorage.setItem('theme', 'light');
        } catch (error) {
          console.warn("Could not save light theme preference to localStorage.", error);
        }
      }
    }
  }, [theme, mounted]);

  if (!mounted) {
    // Render a placeholder or a disabled button to avoid layout shift and hydration issues.
    // This ensures the button size is reserved in the layout before client-side JS runs.
    return <Button variant="ghost" size="icon" className="h-10 w-10 opacity-0" disabled aria-hidden="true" />;
  }

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
      {theme === 'light' ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
}
