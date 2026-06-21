'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', label: 'Home', emoji: '🏠' },
  { href: '/money', label: 'Money', emoji: '💰' },
  { href: '/suggestions', label: 'Ideas', emoji: '💡' },
  { href: '/share', label: 'Share', emoji: '📲' },
  { href: '/settings', label: 'Settings', emoji: '⚙️' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 nav-backdrop backdrop-blur-md border-t border-line"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex max-w-xl mx-auto">
        {NAV.map((tab) => {
          const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex-1 flex flex-col items-center justify-center py-3 gap-0.5 min-h-[56px]"
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-500 rounded-b-full" />
              )}
              <span className="text-lg leading-none">{tab.emoji}</span>
              <span className={`text-[10px] font-semibold tracking-wide uppercase ${active ? 'text-amber-500' : 'text-mid'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
