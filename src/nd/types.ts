// Shape of src/nd/client.ts, the only per-academy file of the Novo Dash kit.
export type Audience = 'adults' | 'kids'

export type Client = {
  /** logo and photo: paths in the LP's public/ (logo reads on the dark brand panel; photo sits behind it). */
  academy: { name: string; phone: string; address: string; mapsUrl: string; logo?: string; photo?: string }
  ghl: { locationId: string; leadWebhookUuid: string }
  /** Brand panel and form texts; defaults in config.ts. proof = Google rating line, shown with five stars. */
  copy?: {
    eyebrow?: string
    panelTitle?: string
    panelText?: string
    bullets?: string[]
    proof?: string
    formTitle?: string
    formText?: string
    confirm?: string
    tips?: string[]
    consent?: string
    /** Lead-only mode: step 1 button and the thank-you screen. */
    submit?: string
    doneTitle?: string
    doneText?: string
  }
  /** CRM source when the visit carries no paid click id. */
  source: string
  tracking: {
    pixel: string
    ga4: string
    ads: string
    adsLeadLabel: string
    adsBookedLabel: string
    clarity: string
  }
  booking: {
    /** Campaign pages can narrow the classes to one audience. */
    audience: Audience | null
    /** Lead only (pre-opening, reserve a spot): no time step, no Webhook 2, no Schedule. */
    leadOnly?: boolean
    /** Show each class length ("60 min class") under its name, live from the app. */
    showDuration?: boolean
    /** GHL calendar id -> display label or hidden. Webhooks always carry the raw GHL name. */
    /** note: shown on the time step for that class (e.g. "The 6:00 PM class runs 1h30"). */
    programOverrides: Record<string, { label?: string; hide?: boolean; note?: string }>
    /** "calendarId|HH:MM" of classes the academy retired while GHL catches up. */
    retiredSlots: string[]
  }
}
