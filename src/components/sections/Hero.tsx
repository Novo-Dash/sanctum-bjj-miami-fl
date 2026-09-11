import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface HeroProps {
  onBookClick: () => void
  className?: string
}

export function Hero({ onBookClick, className }: HeroProps) {
  const badgeRef   = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef= useRef<HTMLParagraphElement>(null)
  const ctaRef     = useRef<HTMLDivElement>(null)
  const imageRef   = useRef<HTMLDivElement>(null)
  const ctxRef     = useRef<{ revert: () => void } | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let cancelled = false

    async function animate() {
      const { gsap } = await import('gsap')
      if (cancelled) return
      ctxRef.current?.revert()
      ctxRef.current = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        tl.fromTo(badgeRef.current,    { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.15)
          .fromTo(headingRef.current,  { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.27)
          .fromTo(subtitleRef.current, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.42)
          .fromTo(ctaRef.current,      { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.54)
          .fromTo(imageRef.current,    { autoAlpha: 0, scale: 1.03 }, { autoAlpha: 1, scale: 1, duration: 1.1 }, 0.1)
      })
    }

    animate()
    return () => {
      cancelled = true
      ctxRef.current?.revert()
      ctxRef.current = null
    }
  }, [])

  return (
    <section
      id="main-content"
      aria-label="Hero: Start your BJJ journey"
      className={cn(
        'relative min-h-screen flex items-center overflow-hidden bg-[var(--color-bg)] pt-[68px]',
        className
      )}
    >
      {/* Background image */}
      <picture className="pointer-events-none absolute inset-0 h-full w-full">
        <source srcSet="/imagem/foto 1.webp" type="image/webp" />
        <img
          src="/imagem/foto 1.webp"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          loading="eager"
          decoding="sync"
          className="h-full w-full object-cover object-center"
        />
      </picture>

      {/* Dark overlay for text readability */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.62)' }}
        aria-hidden="true"
      />

      {/* Subtle accent gradient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 70% 50%, var(--color-accent), transparent)',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-6 py-16 md:px-10 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-12">

          {/* Text — 7 cols */}
          <div className="md:col-span-7 flex flex-col gap-6">
            <h1
              ref={headingRef}
              className="text-fluid-hero uppercase text-white"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, opacity: 0 }}
            >
              Start Jiu-Jitsu with<br />
              a World Champion at<br />
              Sanctum, Miami
            </h1>

            <p
              ref={subtitleRef}
              className="text-fluid-body text-white/75 max-w-xl"
              style={{ opacity: 0, fontSize: 'clamp(0.875rem, 0.3vw + 0.8rem, 1rem)', fontFamily: 'var(--font-body)' }}
            >
              Sanctum's Head Coach won the Jiu-Jitsu World Championship in 2025, but that's not his greatest title. He says helping his students improve on and off the mats in a beginner-friendly gym is even better.
            </p>

            <div ref={ctaRef} className="flex flex-wrap gap-3" style={{ opacity: 0 }}>
              <Button onClick={onBookClick} size="lg">
                Book my first free trial class
                <ArrowRight />
              </Button>
            </div>
          </div>

          {/* Video — 5 cols */}
          <div ref={imageRef} className="md:col-span-5" style={{ opacity: 0 }}>
            <div className="relative w-full overflow-hidden rounded-[var(--radius-lg)]" style={{ aspectRatio: '4/5' }}>
              <video
                autoPlay
                muted
                loop
                playsInline
                width={800}
                height={1000}
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src="/video/video1-opt.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3.75 9H14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 3.75L14.25 9 9 14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
