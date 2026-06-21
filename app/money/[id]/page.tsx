'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Table, Payment, Participant } from '@/lib/types';
import { useIdentity } from '@/lib/identity';

interface PaymentRow {
  payment: Payment;
  participant: Participant;
}

export default function TableDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { participantId, isAdmin } = useIdentity();

  const [table, setTable] = useState<Table | null>(null);
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [editingCost, setEditingCost] = useState(false);
  const [costInput, setCostInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    load();

    const channel = supabase
      .channel(`payments-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments', filter: `table_id=eq.${id}` },
        () => load()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  async function load() {
    const [{ data: t }, { data: p }, { data: parts }] = await Promise.all([
      supabase.from('tables').select('*').eq('id', id).single(),
      supabase.from('payments').select('*').eq('table_id', id),
      supabase.from('participants').select('*').order('name'),
    ]);

    setTable(t as Table);
    const payments = (p as Payment[]) || [];
    const participants = (parts as Participant[]) || [];
    const combined: PaymentRow[] = participants.map((part) => ({
      participant: part,
      payment: payments.find((pay) => pay.participant_id === part.id) || {
        id: '',
        table_id: id,
        participant_id: part.id,
        has_paid: false,
        paid_at: null,
        notes: null,
      },
    }));
    setRows(combined);
    setLoading(false);
  }

  async function togglePaid(row: PaymentRow) {
    if (!row.payment.id) return;
    const newPaid = !row.payment.has_paid;
    await supabase
      .from('payments')
      .update({ has_paid: newPaid, paid_at: newPaid ? new Date().toISOString() : null })
      .eq('id', row.payment.id);
  }

  async function markSelfPaid() {
    const myRow = rows.find((r) => r.participant.id === participantId);
    if (!myRow || myRow.payment.has_paid) return;
    await togglePaid(myRow);
  }

  async function saveCost() {
    const val = parseFloat(costInput);
    if (isNaN(val)) return;
    await supabase.from('tables').update({ total_cost: val }).eq('id', id);
    setEditingCost(false);
    load();
  }

  const paid = rows.filter((r) => r.payment.has_paid).length;
  const total = rows.length;
  const pct = total > 0 ? (paid / total) * 100 : 0;
  const perPerson = table?.total_cost ? (table.total_cost / 16).toFixed(2) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#a1a1aa]">Loading...</p>
      </div>
    );
  }

  if (!table) return null;

  return (
    <div className="px-4 pt-6 max-w-xl mx-auto">
      <button
        onClick={() => router.back()}
        className="text-[#a1a1aa] text-sm mb-4 flex items-center gap-1"
      >
        ← Back
      </button>

      <div className="bg-[#18181b] rounded-2xl p-5 border border-[#27272a] mb-6">
        <h1 className="font-bebas text-3xl text-white tracking-wide mb-1">{table.title}</h1>
        {table.description && (
          <p className="text-[#a1a1aa] text-sm mb-3">{table.description}</p>
        )}

        <div className="flex items-center gap-3 mb-3">
          {editingCost ? (
            <div className="flex gap-2 items-center">
              <input
                type="number"
                className="bg-[#27272a] text-white rounded-lg px-3 py-2 w-32 border border-[#f59e0b] focus:outline-none text-sm"
                value={costInput}
                onChange={(e) => setCostInput(e.target.value)}
                placeholder="Total cost"
                autoFocus
              />
              <button onClick={saveCost} className="bg-[#f59e0b] text-[#09090b] font-bold px-3 py-2 rounded-lg text-sm">Save</button>
              <button onClick={() => setEditingCost(false)} className="text-[#a1a1aa] px-2 py-2 text-sm">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[#a1a1aa] text-sm">
                Total: <span className="text-white font-semibold">
                  {table.total_cost ? `$${table.total_cost.toFixed(2)}` : 'TBD'}
                </span>
              </span>
              {perPerson && (
                <span className="text-[#a1a1aa] text-sm">
                  · <span className="text-[#f59e0b] font-bold">${perPerson}/person</span>
                </span>
              )}
              {isAdmin && (
                <button
                  onClick={() => { setCostInput(table.total_cost?.toString() || ''); setEditingCost(true); }}
                  className="text-[#a1a1aa] hover:text-[#f59e0b] text-sm ml-1"
                >
                  ✏️
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-[#27272a] rounded-full overflow-hidden">
            <div className="h-full bg-[#10b981] rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm text-[#a1a1aa] whitespace-nowrap">
            <span className="text-white font-semibold">{paid}</span> / {total} paid
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((row) => {
          const isMe = row.participant.id === participantId;
          const canToggle = isAdmin || (isMe && !row.payment.has_paid);

          return (
            <div
              key={row.participant.id}
              onClick={() => isAdmin && togglePaid(row)}
              className={`flex items-center justify-between bg-[#18181b] rounded-2xl px-4 py-3 border transition-colors ${
                isMe ? 'border-[#f59e0b]/40' : 'border-[#27272a]'
              } ${isAdmin ? 'cursor-pointer hover:border-[#f59e0b]/40 active:scale-[0.98]' : ''}`}
            >
              <div className="flex-1">
                <p className={`font-medium text-sm ${isMe ? 'text-[#f59e0b]' : 'text-white'}`}>
                  {row.participant.name} {isMe && '(you)'}
                </p>
                {row.payment.paid_at && (
                  <p className="text-[#52525b] text-xs mt-0.5">
                    {new Date(row.payment.paid_at).toLocaleDateString('en-CA', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {row.payment.has_paid ? (
                  <span className="bg-[#10b981]/20 text-[#10b981] text-xs font-bold px-3 py-1 rounded-full">
                    ✓ Paid
                  </span>
                ) : (
                  <span className="bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1 rounded-full">
                    Unpaid
                  </span>
                )}
                {isMe && !row.payment.has_paid && !isAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markSelfPaid(); }}
                    className="bg-[#f59e0b] text-[#09090b] font-bold text-xs px-3 py-1.5 rounded-lg active:scale-95 transition-transform whitespace-nowrap"
                  >
                    Mark Paid
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
