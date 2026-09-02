'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect } from 'react';

const STORAGE_KEY = 'ace-theme';

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
}

export function ThemeToggle() {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const updateFromSystem = () => {
      if (window.localStorage.getItem(STORAGE_KEY) === null) {
        applyTheme(media.matches);
      }
    };

    media.addEventListener('change', updateFromSystem);
    return () => media.removeEventListener('change', updateFromSystem);
  }, []);

  function toggleTheme() {
    const next = !document.documentElement.classList.contains('dark');
    window.localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Alternar entre modo claro e escuro"
      title="Alternar modo de cor"
      className="grid size-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <Moon className="size-[18px] dark:hidden" />
      <Sun className="hidden size-[18px] dark:block" />
    </button>
  );
}
