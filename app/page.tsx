'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, Payment } from '@/lib/types';
import CountdownTimer from '@/components/CountdownTimer';
import TableCard from '@/components/TableCard';
import NewTableModal from '@/components/NewTableModal';
import ItinerarySection from '@/components/ItinerarySection';
import { runSeed } from '@/lib/seed';

export default function HomePage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    runSeed().then(() => {
      setSeeded(true);
      load();
    });
  }, []);

  async function load() {
    const [{ data: t }, { data: p }] = await Promise.all([
      supabase.from('tables').select('*').order('created_at'),
      supabase.from('payments').select('*'),
    ]);
    setTables((t as Table[]) || []);
    setPayments((p as Payment[]) || []);
  }

  const totalPaid = payments.filter((p) => p.has_paid).length;
  const uniquePayers = new Set(payments.filter((p) => p.has_paid).map((p) => p.participant_id)).size;

  const daysUntil = Math.max(
    0,
    Math.ceil((new Date('2025-08-07T15:00:00-04:00').getTime() - Date.now()) / 86400000)
  );

  return (
    <div className="px-4 pt-6 max-w-xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="font-bebas text-5xl sm:text-6xl text-white tracking-wide leading-tight">
          Alex&apos;s Bach Party 🎉
        </h1>
        <p className="text-[#a1a1aa] text-sm mt-1 mb-6">
          Muskoka Wilderness Lodge · Aug 7–9, 2025
        </p>
        <CountdownTimer />
      </div>

      {/* Stats strip */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-8 -mx-4 px-4 scrollbar-hide">
        {[
          { label: 'Paid Up', value: `${uniquePayers} / 16`, sub: 'people' },
          { label: 'Payments', value: totalPaid.toString(), sub: 'completed' },
          { label: 'Days Away', value: daysUntil.toString(), sub: 'until Muskoka' },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[#18181b] rounded-2xl p-4 border border-[#27272a] min-w-[120px] flex-1 shrink-0"
          >
            <p className="text-[#a1a1aa] text-xs font-medium uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-[#f59e0b] font-bold text-2xl leading-none">{s.value}</p>
            <p className="text-[#52525b] text-xs mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Cost Splits */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bebas text-3xl text-white tracking-wide">Cost Splits</h2>
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
          {seeded && tables.length === 0 && (
            <p className="text-[#a1a1aa] text-sm text-center py-4">No tables yet. Create one above!</p>
          )}
        </div>
      </section>

      {/* Itinerary */}
      <ItinerarySection />

      {showModal && (
        <NewTableModal
          onClose={() => setShowModal(false)}
          onCreated={() => load()}
        />
      )}
    </div>
  );
}
