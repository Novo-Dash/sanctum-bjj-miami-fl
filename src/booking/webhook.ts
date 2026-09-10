/**
 * Webhook transport + payload assembly.
 *
 * Webhook 1 -> GHL Inbound Webhook ([ND] Primary Workflow), per academy.
 * Webhook 2 -> shared n8n workflow (Landing Page - Booking & Availability).
 *              CRITICAL CONTRACT — every academy posts to the same workflow,
 *              routed by location_id. Do not add/remove fields.
 */

import { PROGRAM_OVERRIDES, formatTimeLabel, isoDate } from './schedule'
import type { Program, SlotMap } from './schedule'
import { getAttribution, getSourceLabel } from './attribution'
import { bookingConfig } from './config'

/* Fixed for every academy — never parameterize. */
const N8N_ORIGIN = 'https://n8n.novodash.com'
const N8N_PATH = 'webhook' // production; "webhook-test" only to edit the shared workflow
const BOOKING_WEBHOOK_URL = `${N8N_ORIGIN}/${N8N_PATH}/landing-page-booking`

/* location_id from novodash-tools.clients (Sanctum BJJ - Miami FL). */
const GHL_LOCATION_ID = 'BLAGlS1z3mbc5amsNB1q'
// TODO(Webhook 1): paste the Inbound Webhook UUID from GHL → [ND] Primary
// Workflow → Inbound Webhook trigger. Until set, early-lead capture is a safe
// no-op; the booking (Webhook 2) still upserts the contact in GHL.
const LEAD_WEBHOOK_UUID = 'Jq7krZa8VvVRbAEAr4Y1'
const LEAD_WEBHOOK_URL = LEAD_WEBHOOK_UUID
  ? `https://services.leadconnectorhq.com/hooks/${GHL_LOCATION_ID}/webhook-trigger/${LEAD_WEBHOOK_UUID}`
  : ''

/** Set per entry in booking/config.ts — 'Landing Page - Main' by default. */
function sourceLabel(): string {
  return bookingConfig().source
}

export interface BookingData {
  name: string
  email: string
  phone: string
  childName: string
  program: Program | null
  date: Date | null
  time: string | null
}

/* ------------------------------------------------------------------ *
 * Transport — fire-and-forget: never throws, never blocks the UI.
 * ------------------------------------------------------------------ */
function post(url: string, payload: Record<string, unknown>) {
  if (!url) return
  try {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
      .then((res) => {
        if (!res.ok) console.warn(`[booking] webhook ${url} responded ${res.status}`)
        else if (import.meta.env.DEV) console.info(`[booking] webhook ok: ${url}`)
      })
      .catch((err) => console.warn(`[booking] webhook failed: ${url}`, err))
  } catch (err) {
    console.warn(`[booking] webhook threw: ${url}`, err)
  }
}

/* ------------------------------------------------------------------ *
 * Payload helpers
 * ------------------------------------------------------------------ */
export function splitName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  return { first: parts[0] ?? '', last: parts.slice(1).join(' ') }
}

export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return digits ? `+${digits}` : ''
}

/**
 * Visita vinda de link do GHL (SMS/e-mail com 'full_name'/'email'/'phone' na URL)
 * sem campanha na sessão: o contato já existe no CRM. Mandar o Webhook 1 de
 * novo sobrescreveria a atribuição dele com vazio e o source com o rótulo
 * fixo (spec §3.1, 2026-09-10). Nesse caso o Webhook 1 não dispara; o
 * agendamento segue normal pelo Webhook 2.
 */
export function isGhlReturnVisit(): boolean {
  const a = getAttribution() as Record<string, unknown>
  const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'gad_source', 'wbraid', 'gbraid']
  if (campaignKeys.some((k) => Boolean(a[k]))) return false
  const landing = typeof a.landing_url === 'string' ? a.landing_url : window.location.href
  return /[?&](full_name|email|phone)=/.test(landing)
}

/** Child name only for a kids program with a filled field; else omit the key. */
function childNameOrNull(d: BookingData): string | null {
  if (d.program?.audience !== 'kids') return null
  const name = d.childName.trim()
  return name.length >= 2 ? name : null
}

/* ------------------------------------------------------------------ *
 * Webhook 1 — lead capture (GHL)
 * ------------------------------------------------------------------ */
export function sendLeadWebhook(d: BookingData) {
  if (isGhlReturnVisit()) return
  if (!d.program || !LEAD_WEBHOOK_URL) return
  const { first, last } = splitName(d.name)
  const child = childNameOrNull(d)
  post(LEAD_WEBHOOK_URL, {
    event: 'lead_captured',
    name: d.name.trim(),
    firstName: first,
    lastName: last,
    ...(child ? { child_name: child } : {}),
    email: d.email.trim(),
    phone: d.phone.trim(),
    phoneE164: toE164(d.phone),
    program: d.program.name, // raw GHL calendar name -> CRM Program field (never the alias)
    audience: d.program.audience, // adults | kids — routes the shared workflow
    submittedAt: new Date().toISOString(),
    source: getSourceLabel(sourceLabel()),
    ...getAttribution(),
  })
}

/* ------------------------------------------------------------------ *
 * Webhook 2 — booking (shared n8n workflow) — CRITICAL SCHEMA
 * ------------------------------------------------------------------ */
export function sendBookingWebhook(d: BookingData) {
  if (!d.program || !d.date || !d.time) return
  const child = childNameOrNull(d)
  post(BOOKING_WEBHOOK_URL, {
    parent_name: d.name.trim(), // required & non-null — n8n splits it to name the contact
    ...(child ? { child_name: child } : {}),
    email: d.email.trim(),
    phone: d.phone.trim(),
    calendar_id: d.program.calendar_id, // matches calendar in n8n (rename-proof)
    location_id: GHL_LOCATION_ID,
    stage: 'appointment_selected',
    appointment_date: isoDate(d.date), // local YYYY-MM-DD
    appointment_time: formatTimeLabel(d.time), // 12h + AM/PM for Luxon
    source: sourceLabel(),
  })
}

/* ------------------------------------------------------------------ *
 * Live programs + slots, ONE call (same n8n workflow, action-discriminated)
 * ------------------------------------------------------------------ */

/** ISO list -> "HH:MM" wall-clock list. Each ISO already carries the academy's
 *  timezone, so date/time come straight from the string (no TZ math, §5.1). */
function toSlotMap(raw: unknown): SlotMap {
  const map: SlotMap = {}
  if (!raw || typeof raw !== 'object') return map
  for (const [date, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Array.isArray(value)) continue
    const times = value
      .filter((s): s is string => typeof s === 'string')
      .map((iso) => iso.slice(11, 16))
      .filter((t) => /^\d{2}:\d{2}$/.test(t))
    if (times.length) map[date] = times.sort()
  }
  return map
}

interface RawProgram {
  calendar_id?: string
  name?: string
  audience?: string
  duration_minutes?: number | null
  capacity?: number
  slots?: unknown
  slots_error?: string | null
}

/**
 * POST { action:"get_programs" } — the ONE live fetch (§5.1): programs and the
 * slots of every program together, once per session (module-level cache; the
 * shared workflow answers ordered adults-first). Unlike the webhooks this is
 * NOT fire-and-forget — without it there is nothing to render, so failures
 * surface as an error state in the UI.
 */
let programsPromise: Promise<Program[]> | null = null

export function fetchPrograms(): Promise<Program[]> {
  if (!programsPromise) {
    programsPromise = (async () => {
      const res = await fetch(BOOKING_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_programs',
          location_id: GHL_LOCATION_ID,
        }),
      })
      if (!res.ok) throw new Error(`get_programs responded ${res.status}`)
      const raw = (await res.json()) as { programs?: RawProgram[] }
      return (raw?.programs ?? [])
        .filter((p) => Boolean(p?.calendar_id && p?.name))
        .filter((p) => !PROGRAM_OVERRIDES[p.calendar_id as string]?.hide)
        .map(
          (p): Program => ({
            calendar_id: p.calendar_id as string,
            name: p.name as string,
            audience: p.audience === 'kids' ? 'kids' : 'adults',
            duration_minutes: p.duration_minutes ?? null,
            capacity: p.capacity ?? 0,
            slots: toSlotMap(p.slots),
            slots_error: p.slots_error ?? null,
          })
        )
    })()
    programsPromise.catch(() => {
      programsPromise = null // failed fetch doesn't poison the session cache
    })
  }
  return programsPromise
}
