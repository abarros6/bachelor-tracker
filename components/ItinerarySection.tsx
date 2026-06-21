'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useIdentity } from '@/lib/identity';
import { ItineraryItem } from '@/lib/types';
import InfoTooltip from './InfoTooltip';

const DAY_LABELS: Record<string, string> = {
  '2025-08-07': 'Friday, August 7',
  '2025-08-08': 'Saturday, August 8',
  '2025-08-09': 'Sunday, August 9',
  '2025-08-10': 'Monday, August 10',
};

interface EditState {
  id: string;
  time: string;
  title: string;
  description: string;
  emoji: string;
}

const inputCls = 'w-full bg-raised text-hi rounded-lg px-3 py-2 text-sm border border-input focus:outline-none focus:border-amber-500 placeholder:text-mid transition-colors';

export default function ItinerarySection() {
  const { isAdmin } = useIdentity();
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ time: '', title: '', description: '', emoji: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase
      .from('itinerary_items')
      .select('*')
      .order('sort_order');
    setItems((data as ItineraryItem[]) || []);
  }

  const grouped = items.reduce<Record<string, ItineraryItem[]>>((acc, item) => {
    if (!acc[item.day]) acc[item.day] = [];
    acc[item.day].push(item);
    return acc;
  }, {});

  const days = Object.keys(grouped).sort();

  async function saveEdit() {
    if (!editing) return;
    await supabase.from('itinerary_items').update({
      time: editing.time,
      title: editing.title,
      description: editing.description || null,
      emoji: editing.emoji || null,
    }).eq('id', editing.id);
    setEditing(null);
    load();
  }

  async function deleteItem(id: string) {
    await supabase.from('itinerary_items').delete().eq('id', id);
    setDeleteId(null);
    load();
  }

  async function addItem(day: string) {
    if (!newItem.title.trim()) return;
    const dayItems = grouped[day] || [];
    const maxOrder = dayItems.reduce((m, i) => Math.max(m, i.sort_order), 0);
    await supabase.from('itinerary_items').insert({
      day,
      time: newItem.time,
      title: newItem.title.trim(),
      description: newItem.description || null,
      emoji: newItem.emoji || null,
      sort_order: maxOrder + 1,
    });
    setAdding(null);
    setNewItem({ time: '', title: '', description: '', emoji: '' });
    load();
  }

  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-bebas text-3xl text-hi tracking-wide">The Plan 🗓️</h2>
        <InfoTooltip
          content="The weekend itinerary. Times are approximate — just a guide for what's happening when."
         
        />
      </div>

      <div className="space-y-6">
        {days.map((day) => (
          <div key={day}>
            <div className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-3">
              {DAY_LABELS[day] || day}
            </div>
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-line" />
              <div className="space-y-3">
                {grouped[day].map((item) => (
                  <div key={item.id} className="relative">
                    <div className="absolute -left-4 top-3.5 w-3.5 h-3.5 rounded-full bg-card border-2 border-amber-500" />

                    {editing?.id === item.id ? (
                      <div className="bg-card rounded-2xl p-4 border border-amber-500/40 card-shadow space-y-2">
                        <div className="flex gap-2">
                          <input className={`w-16 ${inputCls}`} placeholder="Emoji" value={editing.emoji} onChange={(e) => setEditing({ ...editing, emoji: e.target.value })} />
                          <input className={`flex-1 ${inputCls}`} placeholder="Time (e.g. 4:00 PM)" value={editing.time} onChange={(e) => setEditing({ ...editing, time: e.target.value })} />
                        </div>
                        <input className={inputCls} placeholder="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                        <input className={inputCls} placeholder="Description (optional)" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                        <div className="flex gap-2 pt-1">
                          <button onClick={saveEdit} className="flex-1 bg-amber-500 text-[#09090b] font-bold py-2 rounded-lg text-sm">Save</button>
                          <button onClick={() => setEditing(null)} className="flex-1 bg-raised text-hi py-2 rounded-lg text-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-card rounded-2xl p-4 border border-line card-shadow hover:border-amber-500/20 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              {item.emoji && <span className="text-lg leading-none">{item.emoji}</span>}
                              {item.time && <span className="text-lo text-xs font-medium">{item.time}</span>}
                            </div>
                            <p className="text-hi font-semibold text-sm">{item.title}</p>
                            {item.description && (
                              <p className="text-mid text-xs mt-0.5 leading-relaxed">{item.description}</p>
                            )}
                          </div>
                          {isAdmin && (
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                onClick={() => setEditing({
                                  id: item.id,
                                  time: item.time,
                                  title: item.title,
                                  description: item.description || '',
                                  emoji: item.emoji || '',
                                })}
                                className="text-lo hover:text-amber-500 p-1.5 rounded-lg hover:bg-raised transition-colors"
                                title="Edit this item"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => setDeleteId(item.id)}
                                className="text-lo hover:text-red-400 p-1.5 rounded-lg hover:bg-raised transition-colors"
                                title="Delete this item"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isAdmin && (
                  adding === day ? (
                    <div className="bg-card rounded-2xl p-4 border border-amber-500/40 card-shadow space-y-2">
                      <div className="flex gap-2">
                        <input className={`w-16 ${inputCls}`} placeholder="Emoji" value={newItem.emoji} onChange={(e) => setNewItem({ ...newItem, emoji: e.target.value })} />
                        <input className={`flex-1 ${inputCls}`} placeholder="Time (e.g. 4:00 PM)" value={newItem.time} onChange={(e) => setNewItem({ ...newItem, time: e.target.value })} />
                      </div>
                      <input className={inputCls} placeholder="Title *" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
                      <input className={inputCls} placeholder="Description (optional)" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => addItem(day)} className="flex-1 bg-amber-500 text-[#09090b] font-bold py-2 rounded-lg text-sm">Add</button>
                        <button onClick={() => setAdding(null)} className="flex-1 bg-raised text-hi py-2 rounded-lg text-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAdding(day)}
                      className="w-full py-2.5 border border-dashed border-overlay rounded-xl text-lo text-sm hover:border-amber-500 hover:text-amber-500 transition-colors"
                    >
                      + Add item
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        ))}

        {days.length === 0 && (
          <p className="text-mid text-sm text-center py-8">Itinerary coming soon.</p>
        )}
      </div>

      {/* Delete confirm dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
          <div className="bg-card rounded-2xl p-6 border border-line card-shadow w-full max-w-sm">
            <p className="text-hi font-bold text-lg mb-1">Delete this item?</p>
            <p className="text-mid text-sm mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => deleteItem(deleteId)} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl">Delete</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-raised text-hi font-semibold py-3 rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
