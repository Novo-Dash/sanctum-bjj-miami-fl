import { useEffect, useRef } from 'react'
import { BookingProvider } from '@/nd'
import { CommonQuestions } from './components/CommonQuestions'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { HowToSchedule } from './components/HowToSchedule'
import { InsideSanctum } from './components/InsideSanctum'
import { RightFit } from './components/RightFit'
import { SiteFooter } from './components/SiteFooter'
import { Students } from './components/Students'
import { WhyJiuJitsu } from './components/WhyJiuJitsu'
import { Ribbons } from './components/ui'
import { initMotion } from './motion'

export function BackToSchoolPage() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!root.current) return
    return initMotion(root.current)
  }, [])

  return (
    // Same webhooks, calendars and payload as the main site. Only the source
    // label and the offered programs differ: this campaign is written for
    // parents, so it books the kids calendars.
    <BookingProvider source="Landing Page - Back to School" audience="kids">
      <div ref={root} className="bg-paper">
        <Header />

        <main id="bts-main">
          <Hero />
          {/* the running ribbons double as the chapter divider */}
          <Ribbons />
          <WhyJiuJitsu />
          <Students />
          <HowToSchedule />
          <Ribbons />
          <RightFit />
          <InsideSanctum />
          <CommonQuestions />
        </main>

        <SiteFooter />
      </div>
    </BookingProvider>
  )
}
