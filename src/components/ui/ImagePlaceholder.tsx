import { cn } from '@/lib/utils'

interface ImagePlaceholderProps {
  label: string
  aspectRatio?: string
  className?: string
}

export function ImagePlaceholder({
  label,
  aspectRatio = '4/3',
  className,
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-surface-alt)] border-2 border-dashed border-[var(--color-border)]',
        className
      )}
      style={{ aspectRatio }}
      role="img"
      aria-label={label}
    >
      <div className="flex flex-col items-center gap-3 p-6 text-center">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect width="48" height="48" rx="12" fill="var(--color-border)" />
          <path d="M16 32L22 24L27 29L31 24L36 32H16Z" fill="var(--color-placeholder-icon)" />
          <circle cx="19" cy="21" r="3" fill="var(--color-placeholder-icon)" />
        </svg>
        <span className="text-sm font-semibold text-[var(--color-danger)] leading-tight">
          [FOTO: CONFIRMAR]
        </span>
        <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
      </div>
    </div>
  )
}
