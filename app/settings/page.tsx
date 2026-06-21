'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useIdentity } from '@/lib/identity';
import { useTheme } from '@/lib/theme';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <p className="text-xs font-semibold text-mid uppercase tracking-widest mb-2 px-1">{title}</p>
      <div className="bg-card rounded-2xl border border-line card-shadow overflow-hidden">
        {children}
      </div>
    </section>
  );
}

function Row({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`px-5 py-4 ${!last ? 'border-b border-line' : ''}`}>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { participant, participantId, isAdmin, refreshParticipant } = useIdentity();
  const { theme, toggle } = useTheme();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(participant?.name ?? '');
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState('');

  async function saveName() {
    const trimmed = nameInput.trim();
    if (!trimmed || !participantId) return;
    if (trimmed === participant?.name) { setEditingName(false); return; }
    setSavingName(true);
    setNameError('');
    const { error } = await supabase
      .from('participants')
      .update({ name: trimmed })
      .eq('id', participantId);
    if (error) {
      setNameError('Failed to save — try again.');
      setSavingName(false);
      return;
    }
    await refreshParticipant();
    setEditingName(false);
    setSavingName(false);
  }

  return (
    <div className="px-4 pt-6 max-w-xl mx-auto pb-8">
      <h1 className="font-bebas text-4xl text-hi tracking-wide mb-6">Settings</h1>

      {/* Profile */}
      <Section title="Profile">
        <Row last={!editingName}>
          <p className="text-xs font-semibold text-mid uppercase tracking-wide mb-3">Display Name</p>
          {editingName ? (
            <div className="space-y-2">
              <input
                className="w-full bg-raised text-hi rounded-xl px-4 py-3 border border-amber-500 focus:outline-none placeholder:text-mid text-sm"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                placeholder="Your full name"
                autoFocus
              />
              {nameError && <p className="text-red-400 text-xs">{nameError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={saveName}
                  disabled={!nameInput.trim() || savingName}
                  className="flex-1 bg-amber-500 text-[#09090b] font-bold text-sm py-2.5 rounded-xl disabled:opacity-40 active:scale-95 transition-transform"
                >
                  {savingName ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditingName(false); setNameInput(participant?.name ?? ''); setNameError(''); }}
                  className="px-4 py-2.5 rounded-xl bg-raised text-mid text-sm font-semibold hover:text-hi transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-hi font-medium text-sm">{participant?.name ?? '—'}</span>
              <button
                onClick={() => { setNameInput(participant?.name ?? ''); setEditingName(true); }}
                className="text-amber-500 text-xs font-semibold hover:text-amber-400 transition-colors"
              >
                Edit
              </button>
            </div>
          )}
        </Row>
        {!editingName && (
          <Row last>
            <p className="text-lo text-xs leading-relaxed">
              Fix spelling or add your last name — this updates how you appear everywhere in the app.
            </p>
          </Row>
        )}
      </Section>

      {/* Appearance */}
      <Section title="Appearance">
        <Row last>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-hi text-sm font-medium">Theme</p>
              <p className="text-lo text-xs mt-0.5">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
            </div>
            <div
              onClick={toggle}
              className={`w-12 h-7 rounded-full transition-colors relative flex-shrink-0 cursor-pointer overflow-hidden ${theme === 'dark' ? 'bg-amber-500' : 'bg-overlay'}`}
            >
              <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
          </div>
        </Row>
      </Section>

      {/* Admin (admin only) */}
      {isAdmin && (
        <Section title="Admin">
          <Row last>
            <Link
              href="/admin"
              className="flex items-center justify-between group"
            >
              <div>
                <p className="text-hi text-sm font-medium">Admin Panel</p>
                <p className="text-lo text-xs mt-0.5">Manage splits, export CSVs, view all suggestions</p>
              </div>
              <span className="text-mid text-sm group-hover:text-hi transition-colors">→</span>
            </Link>
          </Row>
        </Section>
      )}
    </div>
  );
}
