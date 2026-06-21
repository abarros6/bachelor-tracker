'use client';

import Link from 'next/link';
import { Table, Payment } from '@/lib/types';

interface Props {
  table: Table;
  payments: Payment[];
}

export default function TableCard({ table, payments }: Props) {
  const paid = payments.filter((p) => p.has_paid).length;
  const pct = (paid / 16) * 100;
  const perPerson = table.total_cost ? `$${(table.total_cost / 16).toFixed(2)}/ea` : 'TBD';

  return (
    <Link href={`/money/${table.id}`}>
      <div className="bg-card rounded-2xl p-4 border border-line card-shadow hover:border-amber-500/30 transition-all active:scale-[0.98]">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-hi text-sm leading-snug">{table.title}</h3>
          <span className={`font-bold text-sm whitespace-nowrap shrink-0 ${table.total_cost ? 'text-amber-500' : 'text-mid'}`}>
            {perPerson}
          </span>
        </div>
        {table.description && (
          <p className="text-lo text-xs mb-3 line-clamp-1">{table.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 h-1.5 bg-raised rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-mid whitespace-nowrap">
            <span className="text-hi font-semibold">{paid}</span>/16 paid
          </span>
        </div>
      </div>
    </Link>
  );
}
