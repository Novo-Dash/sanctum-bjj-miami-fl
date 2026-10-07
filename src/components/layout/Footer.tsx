export function Footer() {
  return (
    <footer className="bg-[var(--color-text)] overflow-hidden">

      {/* Full-width map */}
      <div style={{ width: '100%', height: '400px', lineHeight: 0 }}>
        <iframe
          src="https://maps.google.com/maps?q=Sanctum+BJJ+Miami&output=embed"
          width="100%"
          height="400"
          style={{ border: 0, display: 'block', filter: 'grayscale(30%) contrast(1.05)' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Sanctum BJJ Miami location"
        />
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-14">
        <div className="grid gap-10 md:grid-cols-12">

          {/* Brand — 6 cols */}
          <div className="md:col-span-6">
            <img
              src="/foto1.webp"
              alt="Sanctum BJJ"
              style={{ height: '100px', width: 'auto', marginBottom: '1rem' }}
              loading="lazy"
              decoding="async"
            />
            <p className="text-sm text-white/50 leading-relaxed mb-6 max-w-sm">
              Sanctum Jiu-Jitsu Academy is one of the most trusted names in martial arts around the world. Our values, commitment to excellence, and dedication to jiu-jitsu have set us apart as a leader in the Florida area martial arts community.
            </p>

            {/* Social icons */}
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/sanctumjiujitsu?igsh=MTNjbHBzOG9oMWIzbQ=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/50 hover:text-white hover:border-white/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61575493373445"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/50 hover:text-white hover:border-white/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              >
                <FacebookIcon />
              </a>
            </div>
          </div>

          {/* Contact — 6 cols */}
          <div className="md:col-span-6 md:flex md:justify-end">
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
                Contact
              </p>
              <ul className="flex flex-col gap-4" role="list">
                <li>
                  <a
                    href="mailto:sanctumjiujitsu@gmail.com"
                    className="flex items-start gap-3 min-h-[44px] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-sm"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] group-hover:bg-[var(--color-accent)] transition-colors duration-200">
                      <MailIcon />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Email</p>
                      <p className="text-sm text-white/70 group-hover:text-white transition-colors">sanctumjiujitsu@gmail.com</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+17867226008"
                    className="flex items-start gap-3 min-h-[44px] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-sm"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] group-hover:bg-[var(--color-accent)] transition-colors duration-200">
                      <PhoneIcon />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Phone</p>
                      <p className="text-sm text-white/70 group-hover:text-white transition-colors">+1 786 722 6008</p>
                    </div>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-6 md:px-10 py-5 text-[11px] text-white/25 sm:flex-row">
          <p>© {new Date().getFullYear()} All rights reserved.</p>
          <p>
            By{' '}
            <a href="https://lp.novodash.com/site?utm_source=sanctum-bjj-miami-fl&utm_medium=referral&utm_campaign=lp-footer" target="_blank" rel="noopener" className="font-medium text-white/40">Novo Dash</a>
          </p>
        </div>
      </div>

    </footer>
  )
}


function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.667 2.667h10.666c.737 0 1.334.597 1.334 1.333v8c0 .736-.597 1.333-1.334 1.333H2.667A1.333 1.333 0 0 1 1.333 12V4c0-.736.598-1.333 1.334-1.333Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.667 4 8 8.667 1.333 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M14 11.27v2a1.333 1.333 0 0 1-1.453 1.333A13.19 13.19 0 0 1 6.8 12.42a13 13 0 0 1-3.6-3.6 13.19 13.19 0 0 1-2.18-5.8A1.333 1.333 0 0 1 2.347 1.6h2a1.333 1.333 0 0 1 1.333 1.147A8.567 8.567 0 0 0 6.147 4.8a1.333 1.333 0 0 1-.3 1.407L4.88 7.173A10.667 10.667 0 0 0 8.48 10.773l.967-.967a1.333 1.333 0 0 1 1.406-.3 8.567 8.567 0 0 0 2.054.467A1.333 1.333 0 0 1 14 11.27Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

