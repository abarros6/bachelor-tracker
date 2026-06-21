'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useIdentity } from '@/lib/identity';
import { Participant } from '@/lib/types';

export default function IdentityPickerModal() {
  const { participantId, setParticipantId, loading } = useIdentity();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selected, setSelected] = useState('');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    supabase
      .from('participants')
      .select('*')
      .order('name')
      .then(({ data }) => {
        setParticipants((data as Participant[]) || []);
        setFetching(false);
      });
  }, []);

  if (loading || fetching) return null;
  if (participantId) return null;

  function handleSubmit() {
    if (!selected) return;
    setParticipantId(selected);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090b] px-6">
      <div className="w-full max-w-sm text-center">
        <div className="mb-2 text-6xl">🍺</div>
        <h1 className="font-bebas text-5xl text-[#f59e0b] amber-glow mb-2 tracking-wide">
          Welcome to Alex&apos;s Bach
        </h1>
        <p className="text-[#a1a1aa] text-lg mb-8">Muskoka · August 7–9, 2025</p>

        <div className="bg-[#18181b] rounded-2xl p-6 border border-[#27272a]">
          <p className="text-white font-semibold text-xl mb-4">Who are you?</p>
          <select
            className="w-full bg-[#27272a] text-white rounded-xl px-4 py-3 text-base border border-[#3f3f46] focus:outline-none focus:border-[#f59e0b] mb-6 appearance-none"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Select your name...</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleSubmit}
            disabled={!selected}
            className="w-full bg-[#f59e0b] text-[#09090b] font-bold text-xl py-4 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            Let&apos;s Go 🔥
          </button>
        </div>
      </div>
    </div>
  );
}
