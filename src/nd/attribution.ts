const KEY = 'nd_attribution'
const LANDING_KEY = 'nd_landing'
const LANDING_URL_MAX = 1000
const PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'fbclid', 'gclid', 'gad_source', 'wbraid', 'gbraid',
] as const

function clean(value: string | null) {
  const v = value?.trim()
  return v && !v.includes('{{') && !v.includes('}}') ? v : null
}

function fromUrl(): Record<string, string> {
  const out: Record<string, string> = {}
  const params = new URLSearchParams(window.location.search)
  for (const key of PARAMS) {
    const value = clean(params.get(key))
    if (value) out[key] = value
  }
  return out
}

function landingFromUrl(): Record<string, string> {
  const out: Record<string, string> = { landing_url: window.location.href.slice(0, LANDING_URL_MAX) }
  const referrer = clean(document.referrer)
  if (referrer) out.landing_referrer = referrer
  return out
}

function read(key: string): Record<string, string> | null {
  try {
    const stored = sessionStorage.getItem(key)
    return stored ? (JSON.parse(stored) as Record<string, string>) : null
  } catch {
    return null
  }
}

/** First touch wins: the landing params and URL are stored once per session. */
export function captureAttribution() {
  try {
    if (!sessionStorage.getItem(LANDING_KEY)) sessionStorage.setItem(LANDING_KEY, JSON.stringify(landingFromUrl()))
    const params = fromUrl()
    if (!sessionStorage.getItem(KEY) && Object.keys(params).length) sessionStorage.setItem(KEY, JSON.stringify(params))
  } catch {
    /* private mode: attribution is best effort */
  }
}

export function getAttribution(): Record<string, string> {
  return { ...(read(KEY) ?? fromUrl()), ...(read(LANDING_KEY) ?? landingFromUrl()) }
}

const META_SOURCES = new Set(['facebook', 'fb', 'instagram', 'ig', 'meta'])

/** fbclid or Meta utm_source -> Meta; gclid or google utm_source -> Google; else the page's label. */
export function getSourceLabel(fallback: string): string {
  const a = getAttribution()
  const utm = (a.utm_source ?? '').trim().toLowerCase()
  if (a.fbclid || META_SOURCES.has(utm)) return 'Landing Page - Meta Ads'
  if (a.gclid || utm.includes('google')) return 'Landing Page - Google'
  return fallback
}

/** A contact already in the CRM, back from a GHL link with no campaign: Webhook 1 would wipe its attribution. */
export function isGhlReturnVisit(): boolean {
  const a = getAttribution()
  if (PARAMS.some((k) => a[k])) return false
  return /[?&](full_name|email|phone)=/.test(a.landing_url ?? window.location.href)
}

export function prefillFromUrl() {
  const params = new URLSearchParams(window.location.search)
  return {
    fullName: clean(params.get('full_name')) ?? '',
    email: clean(params.get('email')) ?? '',
    phone: formatPhone(clean(params.get('phone')) ?? ''),
  }
}

export function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '')
  const ten = (digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits).slice(0, 10)
  if (ten.length < 4) return ten
  if (ten.length < 7) return `(${ten.slice(0, 3)}) ${ten.slice(3)}`
  return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`
}

export function toE164(raw: string) {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return digits ? `+${digits}` : ''
}
