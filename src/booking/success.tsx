import { Button } from '@/components/ui'
import { ACADEMY_ADDRESS, formatDateLong, formatTimeLabel } from './schedule'

interface SuccessProps {
  date: Date | null
  time: string | null
  onFinish: () => void
}

/** Confirms the exact date & time the user just picked — never generic copy. */
export function Success({ date, time, onFinish }: SuccessProps) {
  const when = date && time ? `${formatDateLong(date)} at ${formatTimeLabel(time)}` : null

  return (
    <div className="flex flex-col items-center py-4 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
        <svg
          viewBox="0 0 24 24"
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12l5 5L20 7" />
        </svg>
      </span>

      <h3 className="mt-6 text-2xl font-bold text-[var(--color-text)]">You're all set!</h3>

      {when && (
        <p className="mt-3 text-base leading-relaxed text-[var(--color-text)]">
          Your trial class is booked for{' '}
          <strong className="font-semibold text-[var(--color-accent)]">{when}</strong>.
        </p>
      )}

      <p className="mt-3 max-w-sm text-[0.95rem] leading-relaxed text-[var(--color-text-secondary)]">
        You'll get a confirmation by email and text. Come 10 minutes early, wear comfortable
        clothes and we'll take care of the rest.
      </p>

      <a
        href={ACADEMY_ADDRESS.mapsUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-6 flex items-center gap-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-left text-sm text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)]"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-[1.15rem] w-[1.15rem] shrink-0 text-[var(--color-accent)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 21s7-6.1 7-11a7 7 0 10-14 0c0 4.9 7 11 7 11z" />
          <circle cx="12" cy="10" r="2.6" />
        </svg>
        <span>
          {ACADEMY_ADDRESS.street}
          <br />
          <span className="text-[var(--color-text-muted)]">{ACADEMY_ADDRESS.city}</span>
        </span>
      </a>

      <Button type="button" variant="dark" onClick={onFinish} className="mt-6 w-full">
        Done
      </Button>
    </div>
  )
}
