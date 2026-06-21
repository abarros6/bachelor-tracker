'use client';

import { useState, useRef, useEffect } from 'react';

interface InfoTooltipProps {
  content: string;
  className?: string;
}

const TOOLTIP_W = 224; // w-56 = 14rem
const MARGIN = 12;     // min gap from viewport edge
const GAP = 6;         // gap below the button

export default function InfoTooltip({ content, className = '' }: InfoTooltipProps) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!pos) return;
    function dismiss(e: MouseEvent | TouchEvent) {
      // Button's own onClick handles the toggle; ignore clicks on the button itself
      if (btnRef.current?.contains(e.target as Node)) return;
      setPos(null);
    }
    document.addEventListener('mousedown', dismiss);
    document.addEventListener('touchstart', dismiss);
    return () => {
      document.removeEventListener('mousedown', dismiss);
      document.removeEventListener('touchstart', dismiss);
    };
  }, [pos]);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (pos) { setPos(null); return; }

    const rect = btnRef.current!.getBoundingClientRect();

    // Center tooltip on the button, then clamp so it never leaves the viewport
    const ideal = rect.left + rect.width / 2 - TOOLTIP_W / 2;
    const left = Math.max(MARGIN, Math.min(ideal, window.innerWidth - TOOLTIP_W - MARGIN));

    setPos({ top: rect.bottom + GAP, left });
  }

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        ref={btnRef}
        onClick={handleClick}
        className="w-[18px] h-[18px] rounded-full bg-raised text-mid hover:text-amber-500 flex items-center justify-center text-[10px] font-bold border border-line hover:border-amber-500/50 transition-colors shrink-0"
        aria-label="More info"
      >
        ?
      </button>

      {pos && (
        <div
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: TOOLTIP_W }}
          className="z-[100] bg-raised text-hi text-xs rounded-xl p-3 card-shadow border border-line leading-relaxed"
        >
          {content}
        </div>
      )}
    </div>
  );
}
