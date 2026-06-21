'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useIdentity } from '@/lib/identity';

const NAMES = [
  'Andrew Coelho',
  'Angjelo Prifti',
  'Anthony Barros',
  'Anthony Rigakos',
  'Ben Dunn',
  'Cleon',
  'Conor',
  'Ed Moore',
  'Jordan Khan',
  'Julian Ilkiy',
  'Lukasch',
  'Lukas Martinovic',
  'Nelson Santos',
  'Petar Pavkovic',
  'Roman Gulko',
  'Tristan',
];

export default function IdentityPickerModal() {
  const { participantId, setParticipantId, loading } = useIdentity();
  const [selected, setSelected] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (participantId) return null;

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);
    try {
      let { data } = await supabase
        .from('participants')
        .select('id')
        .eq('name', selected)
        .maybeSingle();

      if (!data) {
        const { data: inserted, error } = await supabase
          .from('participants')
          .insert({ name: selected, is_admin: selected === 'Anthony Barros' })
          .select('id')
          .single();
        if (error) throw error;
        data = inserted;
      }

      if (data) {
        import('@/lib/seed').then(({ runSeed }) => runSeed());
        setParticipantId(data.id);
      }
    } catch (e) {
      console.error('Login failed:', e);
      alert('Something went wrong — check the console.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-base px-6">
      <div className="w-full max-w-sm text-center">
        <div className="mb-3 text-6xl">🍺</div>
        <h1 className="font-bebas text-5xl text-amber-500 amber-glow mb-2 tracking-wide">
          Welcome to Alex&apos;s Bach
        </h1>
        <p className="text-mid text-base mb-1">Muskoka · August 7–9, 2025</p>
        <p className="text-lo text-sm mb-8">No passwords — just pick your name and we'll remember you.</p>

        <div className="bg-card rounded-2xl p-6 border border-line card-shadow">
          <p className="text-hi font-semibold text-lg mb-1">Who are you?</p>
          <p className="text-lo text-xs mb-4">Select your name from the list below</p>

          <div className="relative mb-5">
            <select
              className="w-full bg-raised text-hi rounded-xl px-4 py-3 text-base border border-input focus:outline-none focus:border-amber-500 appearance-none cursor-pointer transition-colors"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Select your name...</option>
              {NAMES.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mid text-xs">▼</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selected || submitting}
            className="w-full bg-amber-500 text-[#09090b] font-bold text-lg py-4 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            {submitting ? 'Loading...' : "Let's Go 🔥"}
          </button>
        </div>
      </div>
    </div>
  );
}
