export interface Participant {
  id: string;
  name: string;
  is_admin: boolean;
}

export interface Table {
  id: string;
  title: string;
  description: string | null;
  total_cost: number | null;
  created_by: string;
  created_at: string;
}

export interface Payment {
  id: string;
  table_id: string;
  participant_id: string;
  has_paid: boolean;
  paid_at: string | null;
  notes: string | null;
}

export interface ItineraryItem {
  id: string;
  day: string;
  time: string;
  title: string;
  description: string | null;
  emoji: string | null;
  sort_order: number;
}

export interface Suggestion {
  id: string;
  participant_id: string | null;
  content: string;
  created_at: string;
  is_resolved: boolean;
}
