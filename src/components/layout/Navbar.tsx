import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface NavbarProps {
  onBookClick: () => void
}

const NAV_LINKS = [
  { href: '#our-classes', label: 'Programs' },
  { href: '#our-instructors', label: 'About' },
  { href: '#our-schedule', label: 'Schedule' },
]

export function Navbar({ onBookClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 40) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault()
      closeMenu()
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    [closeMenu]
  )

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[#0D0D0D] shadow-[0_2px_24px_rgba(0,0,0,0.4)]'
          : 'bg-[#0D0D0D]/90 backdrop-blur-md'
      )}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-6 md:px-10"
      >
        {/* Logo */}
        <a
          href="#main-content"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-sm"
          aria-label="Sanctum Jiu Jitsu Academy, back to top"
        >
          <img
            src="/imagem/foto 2.webp"
            alt="Sanctum Jiu Jitsu Academy"
            className="h-16 w-auto object-contain"
          />
        </a>

        {/* Desktop pill nav links */}
        <ul className="hidden md:flex items-center gap-2" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="inline-flex items-center rounded-full bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-white/20 active:bg-white/25 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <button
            type="button"
            onClick={onBookClick}
            className="inline-flex min-h-[36px] items-center gap-2 rounded-full bg-[var(--color-accent)] px-5 text-xs font-bold uppercase tracking-wide text-white shadow-[0_4px_16px_rgba(var(--accent-rgb),0.35)] hover:bg-[var(--color-accent-hover)] hover:shadow-[0_6px_24px_rgba(var(--accent-rgb),0.50)] hover:scale-[1.02] active:scale-[0.97] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0D]"
          >
            Book Free Class
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden flex h-[44px] w-[44px] items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            {menuOpen ? (
              <>
                <line x1="4" y1="4" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="18" y1="4" x2="4" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="19" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          className="md:hidden border-t border-white/10 bg-[#0D0D0D] px-6 pb-6 pt-4"
          role="dialog"
          aria-label="Navigation menu"
        >
          <ul className="flex flex-col gap-2 mb-5" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="block rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white bg-white/10 hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => { closeMenu(); onBookClick() }}
            className="w-full inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold uppercase tracking-wide text-white shadow-[0_4px_20px_rgba(var(--accent-rgb),0.30)] hover:bg-[var(--color-accent-hover)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            Book Free Class
          </button>
        </div>
      )}
    </header>
  )
}
