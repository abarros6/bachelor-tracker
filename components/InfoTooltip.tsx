'use client';

import { useState, useRef, useEffect } from 'react';

interface InfoTooltipProps {
  content: string;
  className?: string;
  align?: 'center' | 'left' | 'right';
}

export default function InfoTooltip({ content, className = '', align = 'center' }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  const posClass =
    align === 'right' ? 'right-0' :
    align === 'left'  ? 'left-0' :
    'left-1/2 -translate-x-1/2';

  const arrowClass =
    align === 'right' ? 'right-3' :
    align === 'left'  ? 'left-3' :
    'left-1/2 -translate-x-1/2';

  return (
    <div ref={ref} className={`relative inline-flex items-center ${className}`}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="w-[18px] h-[18px] rounded-full bg-raised text-mid hover:text-amber-500 flex items-center justify-center text-[10px] font-bold border border-line hover:border-amber-500/50 transition-colors shrink-0"
        aria-label="More info"
      >
        ?
      </button>

      {open && (
        <div className={`absolute z-50 top-full mt-2 ${posClass} w-56 bg-raised text-hi text-xs rounded-xl p-3 card-shadow border border-line leading-relaxed whitespace-normal`}>
          <div className={`absolute -top-[7px] ${arrowClass} w-3 h-3 rotate-45 bg-raised border-l border-t border-line`} />
          {content}
        </div>
      )}
    </div>
  );
}
