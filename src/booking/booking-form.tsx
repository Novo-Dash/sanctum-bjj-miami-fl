import { useCallback, useEffect, useRef, useState } from 'react'
import {
  GADS_BOOKING,
  GADS_LEAD,
  fbqTrack,
  ga4Event,
  gtagConversion,
  identify,
  setUserData,
} from './analytics'
import { bookingConfig } from './config'
import { fetchPrograms, sendBookingWebhook, sendLeadWebhook, toE164 } from './webhook'
import type { BookingData } from './webhook'
import type { Program } from './schedule'
import { Step1Details } from './step1-details'
import { Step2Schedule } from './step2-schedule'
import { Success } from './success'

export type ProgramsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; programs: Program[] }

const EMPTY: BookingData = {
  name: '',
  email: '',
  phone: '',
  childName: '',
  program: null,
  date: null,
  time: null,
}

/** Unresolved merge tags must not land in the inputs as literals. */
function usable(value: string | null): value is string {
  return !!value && !value.includes('{{') && !value.includes('}}') && value.trim().length > 0
}

export function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^1(?=\d{10})/, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

/** Prefill from the query string (GHL links, §4.2). Read once on mount. */
function readPrefill(): BookingData {
  if (typeof window === 'undefined') return EMPTY
  const params = new URLSearchParams(window.location.search)
  const name = params.get('full_name')
  const email = params.get('email')
  const phone = params.get('phone')

  let phoneValue = ''
  if (usable(phone)) {
    // GHL sends E.164 (+15555555555); strip country code before formatting.
    let digits = phone.replace(/\D/g, '')
    if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1)
    phoneValue = formatPhoneInput(digits)
  }

  return {
    ...EMPTY,
    name: usable(name) ? name.trim() : '',
    email: usable(email) ? email.trim() : '',
    phone: phoneValue,
  }
}

export function isStep1Valid(d: BookingData): boolean {
  if (d.name.trim().length < 2) return false
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) return false
  if (d.phone.replace(/\D/g, '').length < 10) return false
  if (!d.program) return false
  if (d.program.audience === 'kids' && d.childName.trim().length < 2) return false
  return true
}

type Step = 1 | 2 | 'success'

/** The one shared form — rendered by both the modal and /book. */
export function BookingForm({ onClose }: { onClose?: () => void }) {
  const [step, setStep] = useState<Step>(1)
  const [data, setData] = useState<BookingData>(readPrefill) // lazy init so edits win over prefill
  // Live programs (get_programs, §5.1). `loading` BEFORE first paint — no stale flash.
  const [programs, setPrograms] = useState<ProgramsState>({ status: 'loading' })
  const leadSent = useRef(false) // dedupes Webhook 1 + Lead conversions per session

  // The single live fetch starts when the form mounts (modal open / /book load);
  // fetchPrograms caches per session, so re-opening the modal doesn't refetch.
  useEffect(() => {
    let cancelled = false
    fetchPrograms()
      .then((list) => {
        // A kids-only entry (Back to School) offers only the kids calendars.
        // If the filter would empty the list, show everything rather than a
        // dead end — the visitor can still book.
        const { audience } = bookingConfig()
        const narrowed = audience ? list.filter((p) => p.audience === audience) : list
        if (!cancelled) {
          setPrograms({ status: 'ready', programs: narrowed.length > 0 ? narrowed : list })
        }
      })
      .catch(() => {
        if (!cancelled) setPrograms({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const patch = useCallback((next: Partial<BookingData>) => {
    setData((d) => ({ ...d, ...next }))
  }, [])

  const handleNext = useCallback(() => {
    if (!isStep1Valid(data)) return
    if (!leadSent.current) {
      leadSent.current = true
      identify({ name: data.name, email: data.email, phone: data.phone }) // §7.6.4
      setUserData(data.email.trim(), toE164(data.phone)) // Enhanced Conversions
      sendLeadWebhook(data)
      const audience = data.program?.audience
      fbqTrack('Lead', { content_category: audience })
      ga4Event('generate_lead', { audience })
      gtagConversion(GADS_LEAD)
    }
    setStep(2)
  }, [data])

  const handleConfirm = useCallback(() => {
    if (!data.program || !data.date || !data.time) return
    const audience = data.program.audience
    fbqTrack('Schedule', { content_category: audience }) // no value — trial is free
    ga4Event('trial_booked', { audience })
    gtagConversion(GADS_BOOKING)
    sendBookingWebhook(data)
    setStep('success')
  }, [data])

  const handleFinish = useCallback(() => {
    setData(EMPTY)
    setStep(1)
    leadSent.current = false
    onClose?.()
  }, [onClose])

  if (step === 'success') {
    return <Success date={data.date} time={data.time} onFinish={handleFinish} />
  }
  if (step === 2) {
    return (
      <Step2Schedule data={data} patch={patch} onBack={() => setStep(1)} onConfirm={handleConfirm} />
    )
  }
  return <Step1Details data={data} programs={programs} patch={patch} onNext={handleNext} />
}
