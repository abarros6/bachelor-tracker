'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, Payment } from '@/lib/types';
import TableCard from '@/components/TableCard';
import NewTableModal from '@/components/NewTableModal';
import InfoTooltip from '@/components/InfoTooltip';
import { useIdentity } from '@/lib/identity';

export default function MoneyPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const { isAdmin } = useIdentity();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [{ data: t }, { data: p }] = await Promise.all([
      supabase.from('tables').select('*').order('created_at'),
      supabase.from('payments').select('*'),
    ]);
    setTables((t as Table[]) || []);
    setPayments((p as Payment[]) || []);
  }

  return (
    <div className="px-4 pt-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 pr-10">
        <div>
          <h1 className="font-bebas text-4xl text-hi tracking-wide">Cost Splits 💰</h1>
          <p className="text-mid text-sm mt-0.5">Tap any split to view details and mark yourself as paid</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-1 mt-1">
            <button
              onClick={() => setShowModal(true)}
              className="bg-amber-500 text-[#09090b] font-bold text-sm px-4 py-2 rounded-xl active:scale-95 transition-transform"
            >
              + New
            </button>
            <InfoTooltip
              content="Create a new shared expense. It will be split evenly across all 16 guys."
              align="right"
            />
          </div>
        )}
      </div>

      {/* How it works banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3 mb-5 flex gap-3 items-start">
        <span className="text-amber-500 text-lg mt-0.5">ℹ</span>
        <div>
          <p className="text-hi text-sm font-semibold">How cost splits work</p>
          <p className="text-mid text-xs mt-0.5 leading-relaxed">
            Each card below is a shared expense. Open it to see the full list, then tap <strong className="text-hi">Mark Paid</strong> next to your name once you've sent money to Anthony.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {tables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            payments={payments.filter((p) => p.table_id === table.id)}
          />
        ))}
        {tables.length === 0 && (
          <div className="text-center py-12 bg-card rounded-2xl border border-line border-dashed">
            <p className="text-mid text-sm">No cost splits yet.</p>
            <p className="text-lo text-xs mt-1">Anthony will add expenses as they come in.</p>
          </div>
        )}
      </div>

      {/* FAB (admin only) */}
      {isAdmin && (
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-24 right-4 w-14 h-14 bg-amber-500 text-[#09090b] text-2xl font-bold rounded-full shadow-lg active:scale-95 transition-transform flex items-center justify-center"
          title="Create new cost split"
        >
          +
        </button>
      )}

      {showModal && (
        <NewTableModal
          onClose={() => setShowModal(false)}
          onCreated={() => load()}
        />
      )}
    </div>
  );
}
