import { supabase } from './supabase';

const PARTICIPANTS = [
  { name: 'Anthony Barros', is_admin: true },
  { name: 'Andrew Coelho', is_admin: false },
  { name: 'Angjelo Prifti', is_admin: false },
  { name: 'Anthony Rigakos', is_admin: false },
  { name: 'Ben Dunn', is_admin: false },
  { name: 'Cleon', is_admin: false },
  { name: 'Ed Moore', is_admin: false },
  { name: 'Julian Ilkiy', is_admin: false },
  { name: 'Jordan Khan', is_admin: false },
  { name: 'Lukasch', is_admin: false },
  { name: 'Lukas Martinovic', is_admin: false },
  { name: 'Nelson Santos', is_admin: false },
  { name: 'Petar Pavkovic', is_admin: false },
  { name: 'Roman Gulko', is_admin: false },
  { name: 'Conor', is_admin: false },
  { name: 'Tristan', is_admin: false },
];

const ITINERARY = [
  { day: '2025-08-07', time: '3:00 PM', title: 'Check-in opens', description: 'Arrive at the lodge, get settled in', emoji: '🚗', sort_order: 1 },
  { day: '2025-08-07', time: '6:00 PM', title: 'BBQ night', description: 'Fire up the grill, crack the first beers', emoji: '🍖', sort_order: 2 },
  { day: '2025-08-07', time: '9:00 PM', title: 'Bonfire', description: 'Campfire by the lake', emoji: '🔥', sort_order: 3 },
  { day: '2025-08-08', time: '9:00 AM', title: 'Morning coffee', description: 'Wake up slow', emoji: '☕', sort_order: 4 },
  { day: '2025-08-08', time: '11:00 AM', title: 'Lake activities', description: 'Canoes, kayaks, swimming', emoji: '🛶', sort_order: 5 },
  { day: '2025-08-08', time: '2:00 PM', title: 'Games room', description: 'Pool table tournament', emoji: '🎱', sort_order: 6 },
  { day: '2025-08-08', time: '7:00 PM', title: 'Big dinner', description: 'Feast mode', emoji: '🍽️', sort_order: 7 },
  { day: '2025-08-08', time: '10:00 PM', title: 'Night games', description: 'Whatever happens, happens', emoji: '🍺', sort_order: 8 },
  { day: '2025-08-09', time: '11:00 AM', title: 'Check-out', description: 'Checkout before 11 AM, pack up and hit the road', emoji: '🧹', sort_order: 9 },
];

export async function runSeed() {
  // Upsert participants — safe to call multiple times
  await supabase
    .from('participants')
    .upsert(PARTICIPANTS, { onConflict: 'name', ignoreDuplicates: true });

  // Seed itinerary if none exists
  const { data: existingItinerary } = await supabase.from('itinerary_items').select('id').limit(1);
  if (!existingItinerary || existingItinerary.length === 0) {
    await supabase.from('itinerary_items').insert(ITINERARY);
  }

  // Seed first table if none exists
  const { data: existingTables } = await supabase.from('tables').select('id').limit(1);
  if (!existingTables || existingTables.length === 0) {
    const { data: admin } = await supabase
      .from('participants')
      .select('id')
      .eq('is_admin', true)
      .single();

    if (admin) {
      const { data: newTable } = await supabase
        .from('tables')
        .insert({
          title: 'Airbnb Rental 🏡',
          description: 'Secluded 100 Acre Wilderness Lodge, Lake of Bays — pay Anthony back for the rental',
          total_cost: null,
          created_by: admin.id,
        })
        .select()
        .single();

      if (newTable) {
        const { data: participants } = await supabase.from('participants').select('id');
        if (participants) {
          const payments = participants.map((p) => ({
            table_id: newTable.id,
            participant_id: p.id,
            has_paid: false,
          }));
          await supabase.from('payments').insert(payments);
        }
      }
    }
  }
}
