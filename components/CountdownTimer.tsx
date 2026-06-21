'use client';

import { useEffect, useState } from 'react';

const PARTY_DATE = new Date('2025-08-07T15:00:00-04:00').getTime();

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function CountdownTimer() {
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    function tick() {
      setDiff(PARTY_DATE - Date.now());
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (diff === null) return null;

  if (diff <= 0) {
    return (
      <div className="text-center py-4">
        <p className="font-bebas text-5xl text-[#f59e0b] amber-glow tracking-wider">
          The party is ON 🎉
        </p>
      </div>
    );
  }

  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hrs = Math.floor((totalSec % 86400) / 3600);
  const min = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;

  return (
    <div className="flex justify-center gap-2 sm:gap-4 text-[#f59e0b] amber-glow select-none">
      {[
        { val: days, label: 'days' },
        { val: hrs, label: 'hrs' },
        { val: min, label: 'min' },
        { val: sec, label: 'sec' },
      ].map(({ val, label }, i) => (
        <div key={label} className="flex flex-col items-center">
          <span
            className={`font-bebas text-5xl sm:text-7xl leading-none tracking-wide ${
              label === 'sec' ? 'pulse-glow' : ''
            }`}
          >
            {pad(val)}
          </span>
          <span className="text-[#a1a1aa] text-xs uppercase tracking-widest font-medium mt-1">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
