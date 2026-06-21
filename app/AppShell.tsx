'use client';

import { ReactNode, useEffect, useState } from 'react';
import { IdentityProvider } from '@/lib/identity';
import IdentityPickerModal from '@/components/IdentityPickerModal';
import BottomNav from '@/components/BottomNav';
import { useTheme } from '@/lib/theme';

function ThemeToggle() {
  const { theme, toggle, mounted } = useTheme();
  if (!mounted) return <div className="w-9 h-9" />;
  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-full bg-card border border-line card-shadow flex items-center justify-center hover:border-amber-500/50 transition-colors"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="text-base leading-none select-none">
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>
    </button>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <IdentityProvider>
      {/* Theme toggle — always visible above modals */}
      <div className="fixed top-4 right-4 z-[60]">
        <ThemeToggle />
      </div>

      <IdentityPickerModal />

      <main className="min-h-screen pb-20">
        {children}
      </main>

      <BottomNav />
    </IdentityProvider>
  );
}
