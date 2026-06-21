# Alexander's Bachelor Party Tracker — Claude Code Spec

## Project Setup

The project root is a folder named `bachelor-tracker`. Initialize the Next.js app directly in this folder (not in a subdirectory). All files should be created relative to `bachelor-tracker/`.

## Overview

Build a mobile-first PWA for tracking shared costs and plans for Alexander Barros's bachelor party at a wilderness lodge in Muskoka, Ontario. The app is fun, energetic, and party-themed. The organizer (Anthony Barros) has admin privileges. All 16 participants can mark themselves as paid, create new cost-splitting tables, and submit suggestions.

**Party date:** August 7, 2025 — check-in at 3:00 PM  
**Location:** Secluded 100 Acre Wilderness Lodge, Lake of Bays, Muskoka, Ontario

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (Postgres + Realtime)
- **Deployment:** Vercel
- **PWA:** `next-pwa`

---

## Supabase Setup

Create the following tables in Supabase:

### `participants`
| column | type | notes |
|--------|------|-------|
| id | uuid (PK) | default gen_random_uuid() |
| name | text | |
| is_admin | boolean | default false |

Seed with the following participants (`is_admin = true` for Anthony Barros only):
- Anthony Barros ← admin
- Andrew Coelho
- Angjelo Prifti
- Anthony Rigakos
- Ben Dunn
- Cleon
- Ed Moore
- Julian Ilkiy
- Jordan Khan
- Lukasch
- Lukas Martinovic
- Nelson Santos
- Petar Pavkovic
- Roman Gulko
- Conor
- Tristan

### `tables`
| column | type | notes |
|--------|------|-------|
| id | uuid (PK) | default gen_random_uuid() |
| title | text | |
| description | text | nullable |
| total_cost | numeric | nullable |
| created_by | uuid (FK → participants.id) | |
| created_at | timestamptz | default now() |

### `payments`
| column | type | notes |
|--------|------|-------|
| id | uuid (PK) | default gen_random_uuid() |
| table_id | uuid (FK → tables.id) | |
| participant_id | uuid (FK → participants.id) | |
| has_paid | boolean | default false |
| paid_at | timestamptz | nullable |
| notes | text | nullable |

### `itinerary_items`
| column | type | notes |
|--------|------|-------|
| id | uuid (PK) | default gen_random_uuid() |
| day | date | |
| time | text | e.g. "3:00 PM" |
| title | text | |
| description | text | nullable |
| emoji | text | nullable |
| sort_order | integer | default 0 |

### `suggestions`
| column | type | notes |
|--------|------|-------|
| id | uuid (PK) | default gen_random_uuid() |
| participant_id | uuid (FK → participants.id) | nullable |
| content | text | |
| created_at | timestamptz | default now() |
| is_resolved | boolean | default false |

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Authentication / Identity

No formal auth. On first visit, show a full-screen **identity picker modal** — a fun welcome screen with the party name and a dropdown to select your name from the 16 participants. Persist the selected `participantId` in `localStorage`. Anthony Barros's participant record has `is_admin = true`.

---

## PWA Configuration

```js
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});
```

`/public/manifest.json`:
```json
{
  "name": "Alex's Bach Party",
  "short_name": "BachParty",
  "description": "The official tracker for Alexander's bachelor party in Muskoka",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#09090b",
  "theme_color": "#09090b",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Generate placeholder icons (dark background, 🍺 emoji or "B" initial).

---

## Design Direction — Party Mode

**Vibe:** Bold, energetic, dark. Think nightlife meets Muskoka wilderness. Not corporate, not minimal — this is a party app for 16 guys at a lakeside lodge.

### Color Palette
- **Background:** `#09090b` (zinc-950)
- **Surface:** `#18181b` (zinc-900)
- **Surface elevated:** `#27272a` (zinc-800)
- **Accent primary:** `#f59e0b` (amber-500) — gold/party energy, used for highlights and CTAs
- **Accent secondary:** `#10b981` (emerald-500) — used for "paid" status
- **Danger:** `#ef4444` (red-500) — unpaid badges
- **Text primary:** `#fafafa` (zinc-50)
- **Text secondary:** `#a1a1aa` (zinc-400)

### Typography
- **Display:** Use a bold, punchy Google Font — `Bebas Neue` for headings and the countdown timer
- **Body:** `Inter` for all other text
- Import both from Google Fonts in the layout

### Signature Element
The **countdown timer** on the home page is the hero — giant `Bebas Neue` numbers with an amber glow effect (`text-shadow` or `drop-shadow`), counting down days, hours, minutes, seconds live.

### UI Rules
- All cards: `rounded-2xl`, dark surface background, subtle amber border on hover
- Badges: `rounded-full`, bold text
- Buttons: bold, full-width on mobile, amber for primary actions
- Bottom nav: dark, amber active indicator
- Minimum tap target: 48px
- No horizontal scroll
- Subtle confetti or party emoji used sparingly in headers (🎉🍺🔥)

---

## Pages & Routing

### `/` — Home

**Hero section:**
- Big bold heading: `"Alex's Bach Party 🎉"`
- Subheading: `"Muskoka Wilderness Lodge · Aug 7–9, 2025"`
- **Live countdown timer** (giant Bebas Neue numbers): `XX days XX hrs XX min XX sec` counting down to August 7, 2025 at 3:00 PM EST
- Amber glow on the numbers, pulsing animation on the seconds

**Quick stats strip** (horizontal scroll row of stat cards):
- Total paid / 16
- Amount collected
- Days until party

**Tables section:**
- Heading: `"Cost Splits"`
- List of all cost-splitting table cards (see TableCard component)
- **+ New Table** button — visible to ALL participants (not just admin)

**Itinerary section:**
- Heading: `"The Plan 🗓️"`
- Grouped by day (Aug 7, Aug 8, Aug 9, Aug 10)
- Timeline layout: vertical line with emoji icons and time labels
- Admin can add/edit/delete itinerary items inline (pencil icon per item, plus button per day)
- Non-admins see a read-only view

**Bottom nav:** Home | Money | Suggestions | (Admin tab if admin)

---

### `/money` — Cost Splits (Table List)

- Lists all tables as cards
- Each card: title, description, progress bar, `X / 16 paid`, cost per person
- Tapping navigates to `/money/[id]`
- **+ New Table** FAB — all participants can use this

---

### `/money/[id]` — Table Detail

- Header: title, description, total cost, cost per person (`total / 16`)
- **Participant list** — all 16 people, each row shows:
  - Name
  - Paid/Unpaid badge
  - Timestamp if paid
  - `Mark as Paid` button on the current user's own row (if unpaid)
- Admin can tap any row to toggle paid status
- Admin can edit the total cost inline
- **Realtime:** subscribe to `payments` table changes — UI updates instantly

---

### `/suggestions` — Suggestion Box

- Fun header: `"Drop Your Ideas 💡"`
- Textarea + submit button
- Name pre-filled from localStorage (with option to submit anonymously)
- List of all suggestions below, newest first
- Admin can tap a suggestion to mark it resolved (fades out with ✓)

---

### `/admin` — Admin Panel (Anthony only, redirect others to `/`)

- View all suggestions including resolved
- Edit itinerary items (can also be done inline on home page)
- Delete tables (with confirmation dialog)
- Export any table as CSV (client-side generation, no library needed — manual CSV string construction is fine)

---

## Seed Data

### First Table (auto-seed on first run if no tables exist)

```
Title: "Airbnb Rental 🏡"
Description: "Secluded 100 Acre Wilderness Lodge, Lake of Bays — pay Anthony back for the rental"
Total cost: null (admin can set later)
```

Create payment rows for all 16 participants with `has_paid = false`.

### Starter Itinerary (seed on first run)

**Friday, August 7**
- 3:00 PM — 🚗 Check-in opens — "Arrive at the lodge, get settled in"
- 6:00 PM — 🍖 BBQ night — "Fire up the grill, crack the first beers"
- 9:00 PM — 🔥 Bonfire — "Campfire by the lake"

**Saturday, August 8**
- 9:00 AM — ☕ Morning coffee — "Wake up slow"
- 11:00 AM — 🛶 Lake activities — "Canoes, kayaks, swimming"
- 2:00 PM — 🎱 Games room — "Pool table tournament"
- 7:00 PM — 🍽️ Big dinner — "Feast mode"
- 10:00 PM — 🍺 Night games — "Whatever happens, happens"

**Sunday, August 9**
- 11:00 AM — 🧹 Check-out — "Checkout before 11 AM, pack up and hit the road"

---

## Key Components

### `CountdownTimer`
- Live countdown to August 7, 2025 at 15:00 EST
- Uses `useEffect` with `setInterval` (1 second tick)
- Display: `DD days HH hrs MM min SS sec` in large Bebas Neue
- Amber text with glow via Tailwind `drop-shadow`
- After the party date has passed, display `"The party is ON 🎉"` instead

### `TableCard`
- Title, description (truncated), cost per person
- Progress bar (emerald fill, zinc track)
- `X / 16 paid` label

### `ParticipantRow`
- Name, badge (Paid ✓ / Unpaid), paid timestamp
- `Mark as Paid` CTA for current user's own row
- Admin: tap anywhere on row to toggle

### `ItineraryItem`
- Emoji icon, time, title, description
- Admin pencil icon → inline edit mode (input fields replace text)
- Admin trash icon → delete with confirmation

### `NewTableModal`
- Sheet/bottom drawer on mobile
- Fields: Title (required), Description (optional), Total Cost (optional)
- Submit creates table + 16 payment rows

### `SuggestionForm`
- Textarea, anonymous toggle, submit button

### `BottomNav`
- 4 tabs: Home 🏠 | Money 💰 | Ideas 💡 | Admin ⚙️ (admin only)
- Amber underline on active tab

### `IdentityPickerModal`
- Full screen on first visit
- Party-themed welcome: `"Welcome to Alex's Bach 🍺"`, `"Who are you?"`
- Dropdown of 16 names
- `"Let's Go 🔥"` button
- Stores `participantId` in localStorage

---

## Realtime

On `/money/[id]`, subscribe to the `payments` table:

```ts
supabase
  .channel(`payments-${tableId}`)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'payments', filter: `table_id=eq.${tableId}` }, payload => {
    // update local state
  })
  .subscribe()
```

---

## Notes

- RLS: disable or set permissive policies for all tables (no auth, this is a private party app)
- No email/push notifications needed
- No file uploads
- Keep bundle lean — Google Fonts only for Bebas Neue + Inter, no heavy UI libraries
- App has a finite lifespan — don't over-engineer
- The lodge note says "NOT a party spot" — the irony is not lost on us
