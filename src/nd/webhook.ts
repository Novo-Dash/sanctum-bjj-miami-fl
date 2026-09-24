import { getAttribution, getSourceLabel, isGhlReturnVisit, toE164 } from './attribution'
import { BOOKING_WEBHOOK, LEAD_WEBHOOK, client } from './config'
import { timeLabel, type Program } from './programs'
import type { Audience } from './types'

export type BookingData = {
  fullName: string
  childName: string
  email: string
  phone: string
  calendarId: string
  date: string
  time: string
  /** Fallback only (no live calendar): which mats they want. */
  preferredAudience: Audience | ''
}

/** Fire and forget: a webhook failure must never block someone's booking. */
function post(url: string, payload: unknown) {
  if (!url) return
  void fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {})
}

/** Webhook 1: the lead, the moment someone leaves step 1. */
export function sendLead(data: BookingData, program: Program | null, source: string, extra: Record<string, unknown> = {}) {
  if (isGhlReturnVisit()) return
  const [first = '', ...rest] = data.fullName.trim().split(/\s+/)
  const audience = program?.audience ?? data.preferredAudience
  const child = data.childName.trim()
  post(LEAD_WEBHOOK, {
    event: 'lead_captured',
    name: data.fullName.trim(),
    firstName: first,
    lastName: rest.join(' '),
    ...(audience === 'kids' && child ? { child_name: child } : {}),
    email: data.email.trim(),
    phone: data.phone.trim(),
    phoneE164: toE164(data.phone),
    program: program?.name ?? '',
    audience,
    submittedAt: new Date().toISOString(),
    source: getSourceLabel(source),
    ...getAttribution(),
    ...extra,
  })
}

/**
 * Webhook 2: the booking. Fixed contract with the n8n flow: do not add or
 * remove fields. Only sent for a real calendar and a real slot.
 */
export function sendBooking(data: BookingData, program: Program, source: string) {
  const child = data.childName.trim()
  post(BOOKING_WEBHOOK, {
    parent_name: data.fullName.trim(),
    ...(program.audience === 'kids' && child ? { child_name: child } : {}),
    email: data.email.trim(),
    phone: data.phone.trim(),
    calendar_id: program.calendar_id,
    location_id: client.ghl.locationId,
    stage: 'appointment_selected',
    appointment_date: data.date,
    appointment_time: timeLabel(data.time),
    source,
  })
}
