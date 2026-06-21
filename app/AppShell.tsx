'use client';

import { ReactNode } from 'react';
import { IdentityProvider } from '@/lib/identity';
import IdentityPickerModal from '@/components/IdentityPickerModal';
import BottomNav from '@/components/BottomNav';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <IdentityProvider>
      <IdentityPickerModal />
      <main className="min-h-screen pb-20">
        {children}
      </main>
      <BottomNav />
    </IdentityProvider>
  );
}
