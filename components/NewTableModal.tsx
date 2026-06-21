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

    try {
      const { data: newTable, error: tableError } = await supabase
        .from('tables')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          total_cost: cost ? parseFloat(cost) : null,
          created_by: participantId,
        })
        .select()
        .single();

      if (tableError) throw tableError;

      if (newTable) {
        const { data: participants, error: partError } = await supabase
          .from('participants')
          .select('id');
        if (partError) throw partError;

        if (participants && participants.length > 0) {
          const payments = participants.map((p) => ({
            table_id: newTable.id,
            participant_id: p.id,
            has_paid: false,
          }));
          const { error: payError } = await supabase.from('payments').insert(payments);
          if (payError) throw payError;
        }
      }

      onCreated();
      onClose();
    } catch (e: any) {
      console.error('Failed to create split:', e);
      alert(`Error: ${e?.message ?? 'Something went wrong'}`);
    } finally {
      setSaving(false);
    }
  }

  const inputClass = 'w-full bg-raised text-hi rounded-xl px-4 py-3 border border-line focus:outline-none focus:border-amber-500 placeholder:text-lo transition-colors text-sm';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl sm:rounded-2xl p-6 border border-line card-shadow">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bebas text-2xl text-amber-500 tracking-wide">New Cost Split</h2>
            <p className="text-lo text-xs mt-0.5">Split evenly across all 16 guys</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-raised flex items-center justify-center text-mid hover:text-hi transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-mid uppercase tracking-wide block mb-1.5">
              Title <span className="text-amber-500">*</span>
            </label>
            <input
              className={inputClass}
              placeholder="e.g. Gas money 🚗, Airbnb deposit…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-mid uppercase tracking-wide block mb-1.5">
              Description <span className="text-lo font-normal">(optional)</span>
            </label>
            <input
              className={inputClass}
              placeholder="Any extra context"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-mid uppercase tracking-wide block mb-1.5">
              Total Cost ($) <span className="text-lo font-normal">(optional)</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              placeholder="Leave blank to set later"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
            <p className="text-lo text-xs mt-1.5">
              You can always update the total cost after creating the split.
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!title.trim() || saving}
          className="mt-6 w-full bg-amber-500 text-[#09090b] font-bold text-lg py-4 rounded-xl disabled:opacity-40 active:scale-95 transition-transform"
        >
          {saving ? 'Creating…' : 'Create Split 💰'}
        </button>
      </div>
    </div>
  );
}
