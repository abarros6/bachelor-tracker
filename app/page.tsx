'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, Payment } from '@/lib/types';
import CountdownTimer from '@/components/CountdownTimer';
import TableCard from '@/components/TableCard';
import NewTableModal from '@/components/NewTableModal';
import ItinerarySection from '@/components/ItinerarySection';
import InfoTooltip from '@/components/InfoTooltip';
import { useIdentity } from '@/lib/identity';

const AIRBNB_URL = 'https://www.airbnb.ca/rooms/34679712?unique_share_id=b9a00ebf-21fd-4920-8437-ece3ad078039&viralityEntryPoint=1&s=76';

export default function HomePage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const { isAdmin } = useIdentity();

  useEffect(() => { load(); }, []);

  async function load() {
    const [{ data: t }, { data: p }] = await Promise.all([
      supabase.from('tables').select('*').order('created_at'),
      supabase.from('payments').select('*'),
    ]);
    setTables((t as Table[]) || []);
    setPayments((p as Payment[]) || []);
  }

  const uniquePayers = new Set(payments.filter((p) => p.has_paid).map((p) => p.participant_id)).size;
  const totalPayments = payments.filter((p) => p.has_paid).length;
  const daysUntil = Math.max(0, Math.ceil((new Date('2025-08-07T15:00:00-04:00').getTime() - Date.now()) / 86400000));

  const STATS = [
    {
      label: 'Paid up',
      value: `${uniquePayers}/16`,
      tip: 'Number of guys who have paid at least one cost split.',
    },
    {
      label: 'Payments',
      value: totalPayments,
      tip: 'Total individual payment confirmations across all cost splits.',
    },
    {
      label: 'Days out',
      value: daysUntil,
      tip: 'Days until check-in at the lodge on August 7th.',
    },
  ];

  return (
    <div className="max-w-xl mx-auto px-4 pt-8 pb-6">

      {/* Hero */}
      <div className="text-center mb-10">
        <p className="text-amber-500 text-xs font-bold uppercase tracking-[0.2em] mb-3">August 7–9, 2025</p>
        <h1 className="font-bebas text-6xl text-hi tracking-wide leading-none mb-1">
          Alex&apos;s Bach Party
        </h1>
        <p className="text-lo text-sm mb-8">Muskoka Wilderness Lodge · Lake of Bays, Ontario</p>
        <CountdownTimer />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-8">
        {STATS.map((s) => (
          <div key={s.label} className="bg-card rounded-2xl py-4 px-2 text-center border border-line card-shadow relative">
            <p className="font-bebas text-3xl text-amber-500 leading-none">{s.value}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <p className="text-lo text-[10px] font-semibold uppercase tracking-wide">{s.label}</p>
              <InfoTooltip content={s.tip} align="center" />
            </div>
          </div>
        ))}
      </div>

      {/* Lodge info card */}
      <div className="bg-card rounded-2xl border border-line card-shadow overflow-hidden mb-8">
        <div className="bg-amber-500/10 border-b border-line px-5 py-3 flex items-center gap-2">
          <span className="text-lg">🏡</span>
          <span className="font-semibold text-hi text-sm">The Lodge</span>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <p className="text-hi font-semibold text-sm">Secluded 100 Acre Wilderness Lodge</p>
            <p className="text-mid text-sm">Lake of Bays, Muskoka, Ontario</p>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-lo text-xs uppercase tracking-wide font-semibold mb-0.5">Check-in</p>
              <p className="text-hi font-medium">Aug 7 · 3:00 PM</p>
            </div>
            <div>
              <p className="text-lo text-xs uppercase tracking-wide font-semibold mb-0.5">Check-out</p>
              <p className="text-hi font-medium">Aug 9 · 11:00 AM</p>
            </div>
            <div>
              <p className="text-lo text-xs uppercase tracking-wide font-semibold mb-0.5">Guests</p>
              <p className="text-hi font-medium">16 guys</p>
            </div>
          </div>
          <a
            href={AIRBNB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-raised hover:bg-overlay text-hi font-semibold text-sm py-3 rounded-xl transition-colors active:scale-95"
          >
            <span>View Airbnb Listing</span>
            <span className="text-mid text-xs">↗</span>
          </a>
        </div>
      </div>

      {/* Cost Splits */}
      <section className="mb-8">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bebas text-2xl text-hi tracking-wide">Cost Splits</h2>
              <InfoTooltip
                content="Each split tracks who has paid for a shared expense. Tap any card to see details and mark yourself as paid."
                align="left"
              />
            </div>
            <p className="text-lo text-xs mt-0.5">Tap a card to mark yourself as paid</p>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-1 mt-1">
              <button
                onClick={() => setShowModal(true)}
                className="bg-amber-500 text-[#09090b] font-bold text-xs px-3 py-2 rounded-lg active:scale-95 transition-transform"
              >
                + New
              </button>
              <InfoTooltip
                content="Create a new expense to split evenly across all 16 guys. Only admins can create splits."
                align="right"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              payments={payments.filter((p) => p.table_id === table.id)}
            />
          ))}
          {tables.length === 0 && (
            <div className="text-center py-10 bg-card rounded-2xl border border-line border-dashed">
              <p className="text-mid text-sm">No cost splits yet.</p>
              <p className="text-lo text-xs mt-1">Anthony will add them as costs come in.</p>
            </div>
          )}
        </div>
      </section>

      {/* Itinerary */}
      <ItinerarySection />

      {showModal && (
        <NewTableModal onClose={() => setShowModal(false)} onCreated={() => load()} />
      )}
    </div>
  );
}
