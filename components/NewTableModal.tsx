'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useIdentity } from '@/lib/identity';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function NewTableModal({ onClose, onCreated }: Props) {
  const { participantId } = useIdentity();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!title.trim() || !participantId) return;
    setSaving(true);

    const { data: newTable } = await supabase
      .from('tables')
      .insert({
        title: title.trim(),
        description: description.trim() || null,
        total_cost: cost ? parseFloat(cost) : null,
        created_by: participantId,
      })
      .select()
      .single();

    if (newTable) {
      const { data: participants } = await supabase.from('participants').select('id');
      if (participants) {
        const payments = participants.map((p) => ({
          table_id: newTable.id,
          participant_id: p.id,
          has_paid: false,
        }));
        await supabase.from('payments').insert(payments);
      }
    }

    setSaving(false);
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
      <div className="w-full max-w-lg bg-[#18181b] rounded-t-3xl sm:rounded-2xl p-6 border border-[#27272a]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bebas text-2xl text-[#f59e0b] tracking-wide">New Cost Split</h2>
          <button onClick={onClose} className="text-[#a1a1aa] text-2xl leading-none p-1">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#a1a1aa] block mb-1">Title *</label>
            <input
              className="w-full bg-[#27272a] text-white rounded-xl px-4 py-3 border border-[#3f3f46] focus:outline-none focus:border-[#f59e0b] placeholder:text-[#52525b]"
              placeholder="e.g. Gas money 🚗"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#a1a1aa] block mb-1">Description</label>
            <input
              className="w-full bg-[#27272a] text-white rounded-xl px-4 py-3 border border-[#3f3f46] focus:outline-none focus:border-[#f59e0b] placeholder:text-[#52525b]"
              placeholder="Optional details"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#a1a1aa] block mb-1">Total Cost ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full bg-[#27272a] text-white rounded-xl px-4 py-3 border border-[#3f3f46] focus:outline-none focus:border-[#f59e0b] placeholder:text-[#52525b]"
              placeholder="Leave blank to set later"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!title.trim() || saving}
          className="mt-6 w-full bg-[#f59e0b] text-[#09090b] font-bold text-lg py-4 rounded-xl disabled:opacity-40 active:scale-95 transition-transform"
        >
          {saving ? 'Creating...' : 'Create Split 💰'}
        </button>
      </div>
    </div>
  );
}
