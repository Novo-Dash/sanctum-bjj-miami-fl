/*
 * Novo Dash kit: mirrors the Pixel events into the Meta Conversions API,
 * deduplicated by the browser's event_id. Needs META_CAPI_ACCESS_TOKEN on the
 * Vercel project; without it the browser Pixel still reports on its own.
 */
import { createHash } from 'node:crypto'

// .js on purpose: under "type": "module" Node needs the extension; Vercel compiles the .ts.
import client from '../src/nd/client.js'

type Body = {
  event?: string
  event_id?: string
  pixel_id?: string
  params?: Record<string, unknown>
  url?: string
  fbp?: string
  fbc?: string
  user?: { name?: string; email?: string; phone?: string }
}

const sha256 = (v: string) => createHash('sha256').update(v).digest('hex')
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export default async function handler(
  req: { method?: string; body?: Body; headers?: Record<string, string | string[] | undefined> },
  res: { status: (code: number) => { json: (body: unknown) => void } },
): Promise<void> {
  const body = req.body ?? {}
  if (req.method !== 'POST' || !body.event || !body.event_id) return res.status(400).json({ error: 'bad request' })
  // Only this academy's own pixel: the token reaches every pixel of the agency.
  if (!client.tracking.pixel || body.pixel_id !== client.tracking.pixel) return res.status(400).json({ error: 'unknown pixel' })
  const token = process.env.META_CAPI_ACCESS_TOKEN
  if (!token) return res.status(200).json({ ok: false })

  const u = body.user ?? {}
  const user: Record<string, unknown> = {}
  if (u.email) user.em = [sha256(u.email.trim().toLowerCase())]
  const digits = (u.phone ?? '').replace(/\D/g, '')
  if (digits) user.ph = [sha256(digits.length === 10 ? `1${digits}` : digits)]
  const [fn, ...ln] = (u.name ?? '').trim().toLowerCase().split(/\s+/)
  if (fn) user.fn = [sha256(fn)]
  if (ln.length) user.ln = [sha256(ln.join(' '))]
  const ip = first(req.headers?.['x-forwarded-for'])?.split(',')[0]?.trim()
  const agent = first(req.headers?.['user-agent'])
  if (ip) user.client_ip_address = ip
  if (agent) user.client_user_agent = agent
  if (body.fbp) user.fbp = body.fbp
  if (body.fbc) user.fbc = body.fbc

  try {
    const r = await fetch(`https://graph.facebook.com/v23.0/${client.tracking.pixel}/events?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name: body.event, event_time: Math.floor(Date.now() / 1000), event_id: body.event_id,
          event_source_url: body.url, action_source: 'website', user_data: user, custom_data: body.params ?? {},
        }],
        ...(process.env.META_TEST_EVENT_CODE ? { test_event_code: process.env.META_TEST_EVENT_CODE } : {}),
      }),
    })
    if (!r.ok) console.error('capi: Meta rejected', body.event, await r.text())
  } catch (err) {
    console.error('capi: request failed', err)
  }
  res.status(200).json({ ok: true })
}
