import { Section, SectionHeader } from '@/components/ui'
import { scheduleNote } from '@/data/schedule'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const SCHEDULE_DATA: Record<string, { label: string; type: 'kids' | 'adults' | 'all' } | null> = {
  Monday: null,
  Tuesday: null,
  Wednesday: null,
  Thursday: null,
  Friday: null,
  Saturday: null,
  Sunday: null,
}

export function OurSchedule() {
  const hasPendingData = Object.values(SCHEDULE_DATA).every((v) => v === null)

  return (
    <Section id="our-schedule" aria-labelledby="schedule-heading">
      <SectionHeader
        id="schedule-heading"
        label="Schedule"
        title="Our Schedule"
        subtitle="Find the right time to stay consistent on your journey."
        center
      />

      {hasPendingData ? (
        <div className="mx-auto max-w-lg rounded-[var(--radius-card)] border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface-alt)] p-12 text-center">
          <p className="mb-3 text-sm font-bold text-[var(--color-danger)]">
            [HORÁRIOS: CONFIRMAR]
          </p>
          <p className="mb-1 text-sm text-[var(--color-text-secondary)]">
            {scheduleNote}
          </p>
          <a
            href="tel:+17867226008"
            className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 text-xs font-bold uppercase tracking-wide text-white shadow-[0_4px_20px_rgba(var(--accent-rgb),0.30)] hover:bg-[var(--color-accent-hover)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
          >
            Call Us: (786) 722-6008
          </a>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)]">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-text)]">Day</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-text)]">Time</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-text)]">Program</th>
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => {
                const slot = SCHEDULE_DATA[day]
                if (!slot) return null
                return (
                  <tr
                    key={day}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-alt)] transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--color-text)]">{day}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">[CONFIRMAR]</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          slot.type === 'kids'
                            ? 'bg-blue-50 text-blue-700'
                            : slot.type === 'adults'
                            ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                            : 'bg-green-50 text-green-700'
                        }`}
                      >
                        {slot.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  )
}
