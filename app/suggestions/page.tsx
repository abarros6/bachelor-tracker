'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useIdentity } from '@/lib/identity';
import { Suggestion, Participant } from '@/lib/types';

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
    <div className="px-4 pt-6 max-w-xl mx-auto">
      <h1 className="font-bebas text-4xl text-white tracking-wide mb-1">Drop Your Ideas 💡</h1>
      <p className="text-[#a1a1aa] text-sm mb-6">Got something to add? Throw it in.</p>

      <div className="bg-[#18181b] rounded-2xl p-5 border border-[#27272a] mb-6">
        <textarea
          className="w-full bg-[#27272a] text-white rounded-xl px-4 py-3 border border-[#3f3f46] focus:outline-none focus:border-[#f59e0b] placeholder:text-[#52525b] resize-none text-sm"
          rows={4}
          placeholder="What's on your mind? Activities, food, vibes..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex items-center justify-between mt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setAnon(!anon)}
              className={`w-10 h-6 rounded-full transition-colors ${anon ? 'bg-[#f59e0b]' : 'bg-[#3f3f46]'} relative`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${anon ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
            <span className="text-[#a1a1aa] text-sm">Post anonymously</span>
          </label>
          <button
            onClick={submit}
            disabled={!content.trim() || submitting}
            className="bg-[#f59e0b] text-[#09090b] font-bold text-sm px-5 py-2.5 rounded-xl disabled:opacity-40 active:scale-95 transition-transform"
          >
            {submitting ? '...' : 'Submit 🚀'}
          </button>
        </div>
        {!anon && participant && (
          <p className="text-[#52525b] text-xs mt-2">Posting as {participant.name}</p>
        )}
      </div>

      <div className="space-y-3">
        {visible.map((s) => (
          <div
            key={s.id}
            className={`bg-[#18181b] rounded-2xl p-4 border transition-all ${
              s.is_resolved ? 'border-[#27272a] opacity-50' : 'border-[#27272a]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-white text-sm">{s.content}</p>
                <p className="text-[#52525b] text-xs mt-1.5">
                  {s.participant_id ? (participants[s.participant_id]?.name || 'Someone') : 'Anonymous'} ·{' '}
                  {new Date(s.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => toggleResolved(s)}
                  className={`shrink-0 text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    s.is_resolved
                      ? 'bg-[#27272a] text-[#a1a1aa]'
                      : 'bg-[#10b981]/20 text-[#10b981] hover:bg-[#10b981]/30'
                  }`}
                >
                  {s.is_resolved ? '↩ Reopen' : '✓ Done'}
                </button>
              )}
            </div>
            {s.is_resolved && (
              <p className="text-[#10b981] text-xs mt-2 font-medium">✓ Resolved</p>
            )}
          </div>
        ))}
        {visible.length === 0 && (
          <p className="text-[#a1a1aa] text-sm text-center py-8">No suggestions yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}
