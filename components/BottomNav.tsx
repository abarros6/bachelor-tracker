'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useIdentity } from '@/lib/identity';

const NAV = [
  { href: '/', label: 'Home', emoji: '🏠' },
  { href: '/money', label: 'Money', emoji: '💰' },
  { href: '/suggestions', label: 'Ideas', emoji: '💡' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { isAdmin } = useIdentity();

  const tabs = isAdmin ? [...NAV, { href: '/admin', label: 'Admin', emoji: '⚙️' }] : NAV;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#09090b] border-t border-[#27272a]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex">
        {tabs.map((tab) => {
          const active = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 min-h-[56px] transition-colors ${
                active ? 'text-[#f59e0b]' : 'text-[#a1a1aa]'
              }`}
            >
              <span className="text-xl leading-none">{tab.emoji}</span>
              <span className={`text-xs font-medium ${active ? 'text-[#f59e0b]' : ''}`}>
                {tab.label}
              </span>
              {active && (
                <span className="absolute bottom-0 h-0.5 w-12 bg-[#f59e0b] rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
