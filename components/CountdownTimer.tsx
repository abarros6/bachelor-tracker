'use client';

import { useEffect, useState } from 'react';

const PARTY_DATE = new Date('2025-08-07T15:00:00-04:00').getTime();

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function CountdownTimer() {
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    function tick() { setDiff(PARTY_DATE - Date.now()); }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (diff === null) return <div className="h-20" />;

  if (diff <= 0) {
    return (
      <p className="font-bebas text-4xl text-amber-500 amber-glow tracking-wider">
        The party is ON 🎉
      </p>
    );
  }

  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hrs = Math.floor((totalSec % 86400) / 3600);
  const min = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;

  const units = [
    { val: days, label: 'days' },
    { val: hrs, label: 'hrs' },
    { val: min, label: 'min' },
    { val: sec, label: 'sec' },
  ];

  return (
    <div className="inline-flex items-end gap-1 select-none">
      {units.map(({ val, label }, i) => (
        <div key={label} className="flex items-end gap-1">
          <div className="flex flex-col items-center">
            <span className={`font-bebas text-6xl leading-none text-amber-500 amber-glow ${label === 'sec' ? 'pulse-glow' : ''}`}>
              {pad(val)}
            </span>
            <span className="text-lo text-[10px] uppercase tracking-widest font-semibold mt-1">
              {label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="font-bebas text-4xl text-lo leading-none mb-4 mx-0.5">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
