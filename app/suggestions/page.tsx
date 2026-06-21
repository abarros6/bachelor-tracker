'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useIdentity } from '@/lib/identity';
import { Suggestion, Participant } from '@/lib/types';
import InfoTooltip from '@/components/InfoTooltip';

export default function SuggestionsPage() {
  const { participantId, isAdmin, participant } = useIdentity();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [participants, setParticipants] = useState<Record<string, Participant>>({});
  const [content, setContent] = useState('');
  const [anon, setAnon] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [{ data: s }, { data: p }] = await Promise.all([
      supabase.from('suggestions').select('*').order('created_at', { ascending: false }),
      supabase.from('participants').select('*'),
    ]);
    setSuggestions((s as Suggestion[]) || []);
    const map: Record<string, Participant> = {};
    ((p as Participant[]) || []).forEach((pt) => { map[pt.id] = pt; });
    setParticipants(map);
  }

  async function submit() {
    if (!content.trim()) return;
    setSubmitting(true);
    await supabase.from('suggestions').insert({
      participant_id: anon ? null : participantId,
      content: content.trim(),
    });
    setContent('');
    setSubmitting(false);
    load();
  }

  async function toggleResolved(suggestion: Suggestion) {
    await supabase
      .from('suggestions')
      .update({ is_resolved: !suggestion.is_resolved })
      .eq('id', suggestion.id);
    load();
  }

  const visible = isAdmin ? suggestions : suggestions.filter((s) => !s.is_resolved);

  return (
    <div className="px-4 pt-6 max-w-xl mx-auto pb-8 pr-12">
      <h1 className="font-bebas text-4xl text-hi tracking-wide mb-0.5">Drop Your Ideas 💡</h1>
      <p className="text-mid text-sm mb-6">Activities, food, vibes — throw anything in here.</p>

      {/* Compose box */}
      <div className="bg-card rounded-2xl p-5 border border-line card-shadow mb-6">
        <label className="text-xs font-semibold text-mid uppercase tracking-wide block mb-2">Your idea</label>
        <textarea
          className="w-full bg-raised text-hi rounded-xl px-4 py-3 border border-line focus:outline-none focus:border-amber-500 placeholder:text-lo resize-none text-sm transition-colors"
          rows={4}
          placeholder="What's on your mind? Activites, food, vibes..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex items-center justify-between mt-3">
          {/* Anonymous toggle */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer" onClick={() => setAnon(!anon)}>
              <div className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${anon ? 'bg-amber-500' : 'bg-overlay'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${anon ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
              <span className="text-mid text-sm">Anonymous</span>
            </label>
            <InfoTooltip
              content="When on, your name won't appear with this suggestion — only Anthony (admin) can see all submissions."
              align="left"
            />
          </div>

          <button
            onClick={submit}
            disabled={!content.trim() || submitting}
            className="bg-amber-500 text-[#09090b] font-bold text-sm px-5 py-2.5 rounded-xl disabled:opacity-40 active:scale-95 transition-transform"
          >
            {submitting ? '…' : 'Submit 🚀'}
          </button>
        </div>

        {!anon && participant && (
          <p className="text-lo text-xs mt-2">Posting as <span className="text-mid font-medium">{participant.name}</span></p>
        )}
      </div>

      {/* Feed */}
      {visible.length > 0 && (
        <p className="text-lo text-xs font-semibold uppercase tracking-wide mb-3">
          {visible.length} suggestion{visible.length !== 1 ? 's' : ''}
          {isAdmin && suggestions.some(s => s.is_resolved) && ` · ${suggestions.filter(s => s.is_resolved).length} resolved`}
        </p>
      )}

      <div className="space-y-3">
        {visible.map((s) => (
          <div
            key={s.id}
            className={`bg-card rounded-2xl p-4 border transition-all card-shadow ${
              s.is_resolved ? 'border-line opacity-50' : 'border-line'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-hi text-sm leading-relaxed">{s.content}</p>
                <p className="text-lo text-xs mt-1.5">
                  {s.participant_id
                    ? (participants[s.participant_id]?.name || 'Someone')
                    : 'Anonymous'
                  }{' '}
                  · {new Date(s.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              {isAdmin && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleResolved(s)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      s.is_resolved
                        ? 'bg-raised text-mid hover:text-hi'
                        : 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25'
                    }`}
                  >
                    {s.is_resolved ? '↩ Reopen' : '✓ Done'}
                  </button>
                  <InfoTooltip
                    content={s.is_resolved ? 'Reopen this suggestion.' : 'Mark as addressed / done.'}
                    align="right"
                  />
                </div>
              )}
            </div>
            {s.is_resolved && (
              <p className="text-emerald-500 text-xs mt-2 font-semibold">✓ Addressed</p>
            )}
          </div>
        ))}

        {visible.length === 0 && (
          <div className="text-center py-12 bg-card rounded-2xl border border-line border-dashed">
            <p className="text-mid text-sm">No ideas yet.</p>
            <p className="text-lo text-xs mt-1">Be the first to drop one above!</p>
          </div>
        )}
      </div>
    </div>
  );
}
