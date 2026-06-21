'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useIdentity } from '@/lib/identity';
import { Suggestion, Table, Payment, Participant } from '@/lib/types';

export default function AdminPage() {
  const { isAdmin, loading } = useIdentity();
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) router.replace('/');
  }, [isAdmin, loading, router]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  async function load() {
    const [{ data: s }, { data: t }, { data: p }, { data: parts }] = await Promise.all([
      supabase.from('suggestions').select('*').order('created_at', { ascending: false }),
      supabase.from('tables').select('*').order('created_at'),
      supabase.from('payments').select('*'),
      supabase.from('participants').select('*').order('name'),
    ]);
    setSuggestions((s as Suggestion[]) || []);
    setTables((t as Table[]) || []);
    setPayments((p as Payment[]) || []);
    setParticipants((parts as Participant[]) || []);
  }

  async function deleteTable(id: string) {
    await supabase.from('payments').delete().eq('table_id', id);
    await supabase.from('tables').delete().eq('id', id);
    setDeleteId(null);
    load();
  }

  function exportCSV(table: Table) {
    const tablePayments = payments.filter((p) => p.table_id === table.id);
    const rows = [
      ['Name', 'Paid', 'Paid At', 'Notes'],
      ...participants.map((part) => {
        const pay = tablePayments.find((p) => p.participant_id === part.id);
        return [
          part.name,
          pay?.has_paid ? 'Yes' : 'No',
          pay?.paid_at ? new Date(pay.paid_at).toLocaleString() : '',
          pay?.notes || '',
        ];
      }),
    ];
    const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${table.title.replace(/[^a-z0-9]/gi, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function toggleResolved(s: Suggestion) {
    await supabase.from('suggestions').update({ is_resolved: !s.is_resolved }).eq('id', s.id);
    load();
  }

  if (loading || !isAdmin) return null;

  return (
    <div className="px-4 pt-6 max-w-xl mx-auto">
      <h1 className="font-bebas text-4xl text-white tracking-wide mb-1">Admin Panel ⚙️</h1>
      <p className="text-[#a1a1aa] text-sm mb-6">Anthony&apos;s control room</p>

      {/* Tables management */}
      <section className="mb-8">
        <h2 className="font-bebas text-2xl text-[#f59e0b] tracking-wide mb-3">Cost Split Tables</h2>
        <div className="space-y-2">
          {tables.map((t) => {
            const paid = payments.filter((p) => p.table_id === t.id && p.has_paid).length;
            return (
              <div key={t.id} className="bg-[#18181b] rounded-2xl p-4 border border-[#27272a] flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{t.title}</p>
                  <p className="text-[#a1a1aa] text-xs">{paid} / 16 paid{t.total_cost ? ` · $${t.total_cost.toFixed(2)}` : ''}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => exportCSV(t)}
                    className="bg-[#27272a] text-[#a1a1aa] hover:text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => setDeleteId(t.id)}
                    className="bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* All Suggestions */}
      <section>
        <h2 className="font-bebas text-2xl text-[#f59e0b] tracking-wide mb-3">All Suggestions</h2>
        <div className="space-y-2">
          {suggestions.map((s) => (
            <div key={s.id} className={`bg-[#18181b] rounded-2xl p-4 border ${s.is_resolved ? 'border-[#27272a] opacity-60' : 'border-[#27272a]'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-white text-sm">{s.content}</p>
                  <p className="text-[#52525b] text-xs mt-1">
                    {s.participant_id ? (participants.find((p) => p.id === s.participant_id)?.name || 'Unknown') : 'Anonymous'} ·{' '}
                    {new Date(s.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                    {s.is_resolved && ' · ✓ Resolved'}
                  </p>
                </div>
                <button
                  onClick={() => toggleResolved(s)}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium ${s.is_resolved ? 'bg-[#27272a] text-[#a1a1aa]' : 'bg-[#10b981]/20 text-[#10b981]'}`}
                >
                  {s.is_resolved ? '↩ Reopen' : '✓ Done'}
                </button>
              </div>
            </div>
          ))}
          {suggestions.length === 0 && (
            <p className="text-[#a1a1aa] text-sm text-center py-4">No suggestions yet.</p>
          )}
        </div>
      </section>

      {/* Delete confirmation dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <div className="bg-[#18181b] rounded-2xl p-6 border border-[#27272a] w-full max-w-sm">
            <p className="text-white font-semibold text-lg mb-1">Delete this table?</p>
            <p className="text-[#a1a1aa] text-sm mb-4">This will also delete all payment records. Cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => deleteTable(deleteId)} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl">Delete</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-[#27272a] text-white py-3 rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
