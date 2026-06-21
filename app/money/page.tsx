'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, Payment } from '@/lib/types';
import TableCard from '@/components/TableCard';
import NewTableModal from '@/components/NewTableModal';

export default function MoneyPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showModal, setShowModal] = useState(false);

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bebas text-4xl text-white tracking-wide">Cost Splits 💰</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#f59e0b] text-[#09090b] font-bold text-sm px-4 py-2 rounded-xl active:scale-95 transition-transform"
        >
          + New
        </button>
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
          <p className="text-[#a1a1aa] text-sm text-center py-8">No cost splits yet.</p>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-[#f59e0b] text-[#09090b] text-2xl font-bold rounded-full shadow-lg active:scale-95 transition-transform flex items-center justify-center"
      >
        +
      </button>

      {showModal && (
        <NewTableModal
          onClose={() => setShowModal(false)}
          onCreated={() => load()}
        />
      )}
    </div>
  );
}
