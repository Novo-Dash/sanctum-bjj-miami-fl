import { client } from './config'

// Meta Pixel + GA4 + Google Ads, no GTM. The base tags load in index.html
// (nd:tracking block); these helpers fire the funnel events. Every helper is a
// silent no-op without its id, and none can break the funnel.

type Params = Record<string, unknown>
export type User = { name?: string; email?: string; phone?: string }
type MetaEvent = 'ViewContent' | 'Lead' | 'Schedule'

// Local view of the globals: LPs declare window.fbq / window.gtag their own way.
const w = window as unknown as { fbq?: (...args: unknown[]) => void; gtag?: (...args: unknown[]) => void }

const { pixel, ads } = client.tracking

function cookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

/** Browser Pixel + Conversions API mirror with the same event_id, so Meta counts it once. */
export function fbTrack(event: MetaEvent, params: Params = {}, user?: User) {
  if (!pixel) return
  const eventId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  try {
    w.fbq?.('track', event, params, { eventID: eventId })
  } catch {
    /* never break the funnel */
  }
  void fetch('/api/capi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      event, event_id: eventId, pixel_id: pixel, params,
      url: window.location.href, fbp: cookie('_fbp'), fbc: cookie('_fbc'),
      ...(user ? { user } : {}),
    }),
  }).catch(() => {})
}

export function gaTrack(event: string, params: Params = {}) {
  try {
    w.gtag?.('event', event, params)
  } catch {
    /* ignore */
  }
}

export function adsConversion(label: string) {
  if (!ads || !label) return
  try {
    w.gtag?.('event', 'conversion', { send_to: `${ads}/${label}` })
  } catch {
    /* ignore */
  }
}

/** Meta Advanced Matching + Google Enhanced Conversions, before the Lead fires. */
export function identify(user: Required<User>) {
  try {
    if (pixel) {
      const [first, ...rest] = user.name.trim().toLowerCase().split(/\s+/)
      w.fbq?.('init', pixel, {
        em: user.email.trim().toLowerCase(),
        ph: user.phone.replace(/\D/g, ''),
        fn: first ?? '',
        ln: rest.join(' '),
      })
    }
    w.gtag?.('set', 'user_data', { email: user.email, phone_number: user.phone })
  } catch {
    /* ignore */
  }
}
