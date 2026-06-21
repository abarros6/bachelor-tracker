'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Participant } from './types';
import { supabase } from './supabase';

interface IdentityCtx {
  participant: Participant | null;
  participantId: string | null;
  isAdmin: boolean;
  setParticipantId: (id: string) => void;
  refreshParticipant: () => Promise<void>;
  loading: boolean;
}

const Ctx = createContext<IdentityCtx>({
  participant: null,
  participantId: null,
  isAdmin: false,
  setParticipantId: () => {},
  refreshParticipant: async () => {},
  loading: true,
});

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [participantId, setParticipantIdState] = useState<string | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('participantId');
    if (stored) setParticipantIdState(stored);
    else setLoading(false);
  }, []);

  useEffect(() => {
    if (!participantId) {
      setParticipant(null);
      setLoading(false);
      return;
    }
    supabase
      .from('participants')
      .select('*')
      .eq('id', participantId)
      .single()
      .then(({ data }) => {
        setParticipant(data as Participant | null);
        setLoading(false);
      });
  }, [participantId]);

  function setParticipantId(id: string) {
    localStorage.setItem('participantId', id);
    setParticipantIdState(id);
  }

  async function refreshParticipant() {
    if (!participantId) return;
    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('id', participantId)
      .single();
    setParticipant(data as Participant | null);
  }

  return (
    <Ctx.Provider
      value={{
        participant,
        participantId,
        isAdmin: participant?.is_admin ?? false,
        setParticipantId,
        refreshParticipant,
        loading,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useIdentity = () => useContext(Ctx);
