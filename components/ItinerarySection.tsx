'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useIdentity } from '@/lib/identity';
import { ItineraryItem } from '@/lib/types';

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

export default function ItinerarySection() {
  const { isAdmin } = useIdentity();
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ time: '', title: '', description: '', emoji: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

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
      <h2 className="font-bebas text-3xl text-white tracking-wide mb-4">The Plan 🗓️</h2>
      <div className="space-y-6">
        {days.map((day) => (
          <div key={day}>
            <div className="text-[#f59e0b] text-sm font-bold uppercase tracking-widest mb-3">
              {DAY_LABELS[day] || day}
            </div>
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-[#27272a]" />
              <div className="space-y-3">
                {grouped[day].map((item) => (
                  <div key={item.id} className="relative">
                    <div className="absolute -left-4 top-2 w-4 h-4 rounded-full bg-[#27272a] border-2 border-[#f59e0b] flex items-center justify-center">
                      <span className="text-[8px]">●</span>
                    </div>
                    {editing?.id === item.id ? (
                      <div className="bg-[#18181b] rounded-2xl p-4 border border-[#f59e0b]/40 space-y-2">
                        <div className="flex gap-2">
                          <input
                            className="w-20 bg-[#27272a] text-white rounded-lg px-2 py-1.5 text-sm border border-[#3f3f46] focus:outline-none"
                            placeholder="Emoji"
                            value={editing.emoji}
                            onChange={(e) => setEditing({ ...editing, emoji: e.target.value })}
                          />
                          <input
                            className="flex-1 bg-[#27272a] text-white rounded-lg px-2 py-1.5 text-sm border border-[#3f3f46] focus:outline-none"
                            placeholder="Time"
                            value={editing.time}
                            onChange={(e) => setEditing({ ...editing, time: e.target.value })}
                          />
                        </div>
                        <input
                          className="w-full bg-[#27272a] text-white rounded-lg px-2 py-1.5 text-sm border border-[#3f3f46] focus:outline-none"
                          placeholder="Title"
                          value={editing.title}
                          onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                        />
                        <input
                          className="w-full bg-[#27272a] text-white rounded-lg px-2 py-1.5 text-sm border border-[#3f3f46] focus:outline-none"
                          placeholder="Description"
                          value={editing.description}
                          onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <button onClick={saveEdit} className="flex-1 bg-[#f59e0b] text-[#09090b] font-bold py-2 rounded-lg text-sm">Save</button>
                          <button onClick={() => setEditing(null)} className="flex-1 bg-[#27272a] text-white py-2 rounded-lg text-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#18181b] rounded-2xl p-4 border border-[#27272a] hover:border-[#f59e0b]/20 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              {item.emoji && <span className="text-xl">{item.emoji}</span>}
                              <span className="text-[#a1a1aa] text-xs font-medium">{item.time}</span>
                            </div>
                            <p className="text-white font-semibold text-sm">{item.title}</p>
                            {item.description && (
                              <p className="text-[#a1a1aa] text-sm mt-0.5">{item.description}</p>
                            )}
                          </div>
                          {isAdmin && (
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => setEditing({
                                  id: item.id,
                                  time: item.time,
                                  title: item.title,
                                  description: item.description || '',
                                  emoji: item.emoji || '',
                                })}
                                className="text-[#a1a1aa] hover:text-[#f59e0b] p-1.5 rounded-lg hover:bg-[#27272a] transition-colors"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => setDeleteId(item.id)}
                                className="text-[#a1a1aa] hover:text-red-500 p-1.5 rounded-lg hover:bg-[#27272a] transition-colors"
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
                    <div className="bg-[#18181b] rounded-2xl p-4 border border-[#f59e0b]/40 space-y-2">
                      <div className="flex gap-2">
                        <input
                          className="w-20 bg-[#27272a] text-white rounded-lg px-2 py-1.5 text-sm border border-[#3f3f46] focus:outline-none"
                          placeholder="Emoji"
                          value={newItem.emoji}
                          onChange={(e) => setNewItem({ ...newItem, emoji: e.target.value })}
                        />
                        <input
                          className="flex-1 bg-[#27272a] text-white rounded-lg px-2 py-1.5 text-sm border border-[#3f3f46] focus:outline-none"
                          placeholder="Time (e.g. 4:00 PM)"
                          value={newItem.time}
                          onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                        />
                      </div>
                      <input
                        className="w-full bg-[#27272a] text-white rounded-lg px-2 py-1.5 text-sm border border-[#3f3f46] focus:outline-none"
                        placeholder="Title *"
                        value={newItem.title}
                        onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      />
                      <input
                        className="w-full bg-[#27272a] text-white rounded-lg px-2 py-1.5 text-sm border border-[#3f3f46] focus:outline-none"
                        placeholder="Description"
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => addItem(day)} className="flex-1 bg-[#f59e0b] text-[#09090b] font-bold py-2 rounded-lg text-sm">Add</button>
                        <button onClick={() => setAdding(null)} className="flex-1 bg-[#27272a] text-white py-2 rounded-lg text-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAdding(day)}
                      className="w-full py-2 border border-dashed border-[#3f3f46] rounded-xl text-[#a1a1aa] text-sm hover:border-[#f59e0b] hover:text-[#f59e0b] transition-colors"
                    >
                      + Add item
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <div className="bg-[#18181b] rounded-2xl p-6 border border-[#27272a] w-full max-w-sm">
            <p className="text-white font-semibold text-lg mb-1">Delete item?</p>
            <p className="text-[#a1a1aa] text-sm mb-4">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => deleteItem(deleteId)} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl">Delete</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-[#27272a] text-white py-3 rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
