'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Table, Payment, Participant } from '@/lib/types';
import { useIdentity } from '@/lib/identity';
import InfoTooltip from '@/components/InfoTooltip';

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
  const total = 16;
  const pct = (paid / total) * 100;
  const perPerson = table?.total_cost ? (table.total_cost / 16).toFixed(2) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-mid text-sm">Loading…</p>
      </div>
    );
  }

  if (!table) return null;

  const myRow = rows.find((r) => r.participant.id === participantId);
  const iAlreadyPaid = myRow?.payment.has_paid ?? false;

  return (
    <div className="px-4 pt-6 max-w-xl mx-auto pb-8">
      <button
        onClick={() => router.back()}
        className="text-mid text-sm mb-4 flex items-center gap-1 hover:text-hi transition-colors"
      >
        ← Back
      </button>

      {/* Summary card */}
      <div className="bg-card rounded-2xl p-5 border border-line card-shadow mb-4">
        <h1 className="font-bebas text-3xl text-hi tracking-wide mb-0.5">{table.title}</h1>
        {table.description && (
          <p className="text-mid text-sm mb-3">{table.description}</p>
        )}

        {/* Cost row */}
        <div className="flex items-center gap-3 mb-4">
          {editingCost ? (
            <div className="flex gap-2 items-center">
              <input
                type="number"
                className="bg-raised text-hi rounded-lg px-3 py-2 w-32 border border-amber-500 focus:outline-none text-sm"
                value={costInput}
                onChange={(e) => setCostInput(e.target.value)}
                placeholder="Total cost"
                autoFocus
              />
              <button onClick={saveCost} className="bg-amber-500 text-[#09090b] font-bold px-3 py-2 rounded-lg text-sm">Save</button>
              <button onClick={() => setEditingCost(false)} className="text-mid px-2 py-2 text-sm hover:text-hi">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-mid text-sm">
                Total: <span className="text-hi font-semibold">
                  {table.total_cost ? `$${table.total_cost.toFixed(2)}` : 'TBD'}
                </span>
              </span>
              {perPerson && (
                <span className="text-mid text-sm">
                  · <span className="text-amber-500 font-bold">${perPerson}/person</span>
                </span>
              )}
              {isAdmin && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setCostInput(table.total_cost?.toString() || ''); setEditingCost(true); }}
                    className="text-mid hover:text-amber-500 text-sm transition-colors"
                    title="Edit total cost"
                  >
                    ✏️
                  </button>
                  <InfoTooltip content="Update the total cost for this split. The per-person amount will recalculate automatically." />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-raised rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm text-mid whitespace-nowrap">
            <span className="text-hi font-semibold">{paid}</span> / {total} paid
          </span>
        </div>
      </div>

      {/* Instruction banner */}
      {isAdmin ? (
        <div className="bg-raised border border-line rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
          <span className="text-amber-500 text-sm">⚙️</span>
          <p className="text-mid text-xs">Admin: tap any row to toggle payment status.</p>
        </div>
      ) : !iAlreadyPaid ? (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
          <span className="text-amber-500 text-sm">👇</span>
          <p className="text-hi text-xs">Find your name below and tap <strong>Mark Paid</strong> once you've sent the money.</p>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
          <span className="text-emerald-500 text-sm">✓</span>
          <p className="text-hi text-xs font-medium">You're paid up for this split!</p>
        </div>
      )}

      {/* Participant rows */}
      <div className="space-y-2">
        {rows.map((row) => {
          const isMe = row.participant.id === participantId;

          return (
            <div
              key={row.participant.id}
              onClick={() => isAdmin && togglePaid(row)}
              className={`flex items-center justify-between bg-card rounded-2xl px-4 py-3 border transition-all card-shadow ${
                isMe ? 'border-amber-500/40' : 'border-line'
              } ${isAdmin ? 'cursor-pointer hover:border-amber-500/30 active:scale-[0.98]' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${isMe ? 'text-amber-500' : 'text-hi'}`}>
                  {row.participant.name}
                  {isMe && <span className="text-mid font-normal"> (you)</span>}
                </p>
                {row.payment.paid_at && (
                  <p className="text-lo text-xs mt-0.5">
                    {new Date(row.payment.paid_at).toLocaleDateString('en-CA', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {row.payment.has_paid ? (
                  <span className="bg-emerald-500/15 text-emerald-500 text-xs font-bold px-3 py-1 rounded-full">
                    ✓ Paid
                  </span>
                ) : (
                  <span className="bg-red-500/15 text-red-400 text-xs font-bold px-3 py-1 rounded-full">
                    Unpaid
                  </span>
                )}
                {isMe && !row.payment.has_paid && !isAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markSelfPaid(); }}
                    className="bg-amber-500 text-[#09090b] font-bold text-xs px-3 py-1.5 rounded-lg active:scale-95 transition-transform whitespace-nowrap"
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
