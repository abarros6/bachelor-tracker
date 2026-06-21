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

  const resolvedCount = suggestions.filter((s) => s.is_resolved).length;

  return (
    <div className="px-4 pt-6 max-w-xl mx-auto pb-8 pr-12">
      <h1 className="font-bebas text-4xl text-hi tracking-wide mb-0.5">Admin Panel ⚙️</h1>
      <p className="text-mid text-sm mb-6">Anthony&apos;s control room</p>

      {/* Cost Split Tables */}
      <section className="mb-8">
        <h2 className="font-bebas text-2xl text-amber-500 tracking-wide mb-1">Cost Split Tables</h2>
        <p className="text-lo text-xs mb-3">Export a CSV or delete a table and all its payment records.</p>
        <div className="space-y-2">
          {tables.map((t) => {
            const paid = payments.filter((p) => p.table_id === t.id && p.has_paid).length;
            return (
              <div key={t.id} className="bg-card rounded-2xl p-4 border border-line card-shadow flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-hi font-semibold text-sm truncate">{t.title}</p>
                  <p className="text-mid text-xs mt-0.5">
                    {paid} / 16 paid{t.total_cost ? ` · $${t.total_cost.toFixed(2)} total` : ''}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => exportCSV(t)}
                    className="bg-raised text-mid hover:text-hi text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors border border-line"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => setDeleteId(t.id)}
                    className="bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
          {tables.length === 0 && (
            <p className="text-mid text-sm text-center py-6">No tables yet.</p>
          )}
        </div>
      </section>

      {/* All Suggestions */}
      <section>
        <div className="flex items-baseline gap-2 mb-1">
          <h2 className="font-bebas text-2xl text-amber-500 tracking-wide">All Suggestions</h2>
          {resolvedCount > 0 && (
            <span className="text-lo text-xs">{resolvedCount} resolved</span>
          )}
        </div>
        <p className="text-lo text-xs mb-3">Including anonymous submissions. Mark as done once addressed.</p>
        <div className="space-y-2">
          {suggestions.map((s) => (
            <div
              key={s.id}
              className={`bg-card rounded-2xl p-4 border card-shadow ${s.is_resolved ? 'border-line opacity-60' : 'border-line'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-hi text-sm leading-relaxed">{s.content}</p>
                  <p className="text-lo text-xs mt-1">
                    {s.participant_id
                      ? (participants.find((p) => p.id === s.participant_id)?.name || 'Unknown')
                      : 'Anonymous'
                    }{' '}
                    · {new Date(s.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                    {s.is_resolved && ' · ✓ Resolved'}
                  </p>
                </div>
                <button
                  onClick={() => toggleResolved(s)}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    s.is_resolved
                      ? 'bg-raised text-mid hover:text-hi'
                      : 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25'
                  }`}
                >
                  {s.is_resolved ? '↩ Reopen' : '✓ Done'}
                </button>
              </div>
            </div>
          ))}
          {suggestions.length === 0 && (
            <p className="text-mid text-sm text-center py-6">No suggestions yet.</p>
          )}
        </div>
      </section>

      {/* Delete confirmation dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
          <div className="bg-card rounded-2xl p-6 border border-line card-shadow w-full max-w-sm">
            <p className="text-hi font-bold text-lg mb-1">Delete this split?</p>
            <p className="text-mid text-sm mb-5">This will permanently delete all payment records for this split. Cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => deleteTable(deleteId)} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl">Delete</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-raised text-hi font-semibold py-3 rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
