'use client';

import Link from 'next/link';
import { Table, Payment } from '@/lib/types';

interface Props {
  table: Table;
  payments: Payment[];
}

export default function TableCard({ table, payments }: Props) {
  const total = payments.length || 16;
  const paid = payments.filter((p) => p.has_paid).length;
  const pct = total > 0 ? (paid / total) * 100 : 0;
  const perPerson = table.total_cost ? (table.total_cost / 16).toFixed(2) : null;

  return (
    <Link href={`/money/${table.id}`}>
      <div className="bg-[#18181b] rounded-2xl p-4 border border-[#27272a] hover:border-[#f59e0b]/40 transition-colors active:scale-[0.98] transition-transform">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-white text-base leading-tight flex-1 pr-2">
            {table.title}
          </h3>
          {perPerson && (
            <span className="text-[#f59e0b] font-bold text-sm whitespace-nowrap">
              ${perPerson}/ea
            </span>
          )}
        </div>
        {table.description && (
          <p className="text-[#a1a1aa] text-sm mb-3 line-clamp-2">{table.description}</p>
        )}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1 h-2 bg-[#27272a] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10b981] rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-sm font-medium text-[#a1a1aa] whitespace-nowrap">
            <span className="text-white">{paid}</span> / {total} paid
          </span>
        </div>
      </div>
    </Link>
  );
}
