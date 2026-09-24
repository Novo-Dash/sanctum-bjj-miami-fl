import { PROGRAMS_URL, client } from './config'
import type { Audience } from './types'

// Classes and open times, live from the Novo Dash app (the academy's schedule,
// minus the starts already full in GHL). Nothing about the class list is
// written by hand: a class added, renamed or paused shows up on the next load.
// BookingProvider starts the fetch on page load, so the modal opens with it done.

export type Program = {
  calendar_id: string
  /** GHL calendar name; this exact string travels on Webhook 1. */
  name: string
  /** Routing for the CRM (adults | kids), and what turns on the child's name field. */
  audience: Audience
  /** GHL calendar group; the picker's sections come from it. */
  group: string | null
  /** "YYYY-MM-DD" -> ["HH:MM"], in the academy's timezone. */
  slots: Record<string, string[]>
  /** Class length in minutes, from the app. */
  duration: number | null
}

const { programOverrides, retiredSlots } = client.booking
const retired = new Set(retiredSlots)

// Each ISO carries the academy's offset: slice the text, never go through Date.
function normalizeSlots(raw: unknown, calendarId: string): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const [day, value] of Object.entries((raw ?? {}) as Record<string, unknown>)) {
    const list = Array.isArray(value) ? value : (value as { slots?: unknown[] })?.slots
    if (!Array.isArray(list)) continue
    const times = list
      .filter((iso): iso is string => typeof iso === 'string' && iso.slice(0, 10) === day)
      .map((iso) => iso.slice(11, 16))
      .filter((t) => !retired.has(`${calendarId}|${t}`))
      .sort()
    if (times.length) out[day] = times
  }
  return out
}

let inflight: Promise<Program[]> | null = null

/** Once per session, shared by every consumer (modal, /book, schedule grids). */
export function fetchPrograms(audience: Audience | null = client.booking.audience): Promise<Program[]> {
  inflight ??= load().catch((err) => {
    inflight = null
    throw err
  })
  return inflight.then((all) => {
    const narrowed = audience ? all.filter((p) => p.audience === audience) : all
    return narrowed.length ? narrowed : all
  })
}

async function load(): Promise<Program[]> {
  if (!client.ghl.locationId) return []
  const url = `${PROGRAMS_URL}?location_id=${encodeURIComponent(client.ghl.locationId)}`
  // One retry before the adults/kids fallback: a cold start or a slow GHL call should not cost the calendar.
  const res = await fetch(url).then((r) => (r.ok ? r : Promise.reject(r))).catch(() => new Promise<Response>((ok) => setTimeout(() => ok(fetch(url)), 1500)))
  if (!res.ok) throw new Error(`get_programs responded ${res.status}`)
  const { programs } = (await res.json()) as { programs?: Array<Record<string, unknown>> }
  return (Array.isArray(programs) ? programs : [])
    .filter((p) => typeof p.calendar_id === 'string' && typeof p.name === 'string')
    .filter((p) => !programOverrides[p.calendar_id as string]?.hide)
    .map((p) => ({
      calendar_id: p.calendar_id as string,
      name: p.name as string,
      audience: p.audience === 'kids' ? 'kids' : 'adults',
      group: typeof p.group === 'string' && p.group.trim() ? p.group.trim() : null,
      slots: normalizeSlots(p.slots, p.calendar_id as string),
      duration: typeof p.duration_minutes === 'number' ? p.duration_minutes : null,
    }))
}

/** The academy's note for one class, shown on the time step. */
export const noteOf = (p: Program | null) => (p ? programOverrides[p.calendar_id]?.note ?? null : null)

/** A paid class the academy also books here (drop-in): its texts never say "free". */
export const isPaid = (p: Program | null) => Boolean(p && programOverrides[p.calendar_id]?.paid)

/** A class the academy marked "Waitlist" in its name: the lead goes in, no booking is offered. */
export const isWaitlist = (p: Program | null) => Boolean(p && /waitlist/i.test(p.name))

/** Display label only; webhooks carry the raw GHL name. */
export function labelOf(calendarId: string, name: string) {
  return programOverrides[calendarId]?.label ?? name
}

/** Drops only the age in parentheses (ageHint shows it below); "(Gi)" stays in the name. */
export function shortName(p: Program) {
  return labelOf(p.calendar_id, p.name).replace(/\s*\([^)]*\d[^)]*\)\s*/g, ' ').trim()
}

/** Hint under the class name: its age, plus "60 min class" when the LP shows lengths (booking.showDuration). */
export function optionHint(p: Program) {
  const parts = [ageHint(p), client.booking.showDuration && p.duration ? `${p.duration} min class` : null].filter(Boolean)
  return parts.length ? parts.join(' · ') : null
}

/** "Little Champions (4-6 years old)" -> "4-6 years old". The label's age wins (the academy asked for it); else GHL's. */
export function ageHint(p: Program) {
  const age = /\(([^)]*\d[^)]*)\)/
  return labelOf(p.calendar_id, p.name).match(age)?.[1] ?? p.name.match(age)?.[1] ?? null
}

const GROUP_ORDER = [/adult/i, /kid|teen|youth|champion/i]

export function groupPrograms(programs: Program[]) {
  const groups = new Map<string, { label: string; programs: Program[]; seen: number }>()
  for (const p of programs) {
    const label = (p.group ?? '').replace(/\bcalendars?\b/gi, '').replace(/^[\s–—-]+|[\s–—-]+$/g, '').trim()
      || (p.audience === 'kids' ? 'Kids' : 'Adults')
    const g = groups.get(label.toLowerCase()) ?? { label, programs: [], seen: groups.size }
    g.programs.push(p)
    groups.set(label.toLowerCase(), g)
  }
  const rank = (label: string) => {
    const i = GROUP_ORDER.findIndex((re) => re.test(label))
    return i === -1 ? GROUP_ORDER.length : i
  }
  return [...groups.values()].sort((a, b) => rank(a.label) - rank(b.label) || a.seen - b.seen)
}

// Local date helpers. Never toISOString: UTC would shift the day.
export const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const parseKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const longDate = (key: string) =>
  parseKey(key).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
/** "17:30" -> "5:30 PM": the exact format Webhook 2 expects. */
export function timeLabel(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}
