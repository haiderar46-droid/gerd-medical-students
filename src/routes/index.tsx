import { createFileRoute } from '@tanstack/react-router'
import { ClipboardList, Clock, GraduationCap } from 'lucide-react'
import SurveyForm from '../components/SurveyForm'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen">
      <header className="masthead">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-8 sm:px-8">
          <div className="mb-10 flex items-center gap-3 text-sm text-white/80">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30">
              <GraduationCap className="h-4.5 w-4.5" />
            </span>
            <span>
              College of Medicine <span className="text-white/40">·</span> University of Al-Qadisiyah, Iraq
            </span>
          </div>
          <p className="eyebrow mb-4 !text-[var(--amber)]">Cross-sectional research study</p>
          <h1 className="font-display max-w-4xl text-3xl leading-[1.12] text-white sm:text-5xl">
            Prevalence and Risk Factors of Gastroesophageal Reflux Disease (GERD) Among Medical Students
          </h1>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/75">
            <span className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[var(--amber)]" /> First- to sixth-year students
            </span>
            <span className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-[var(--amber)]" /> 37 questions · 7 sections
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[var(--amber)]" /> About 8–10 minutes
            </span>
          </div>
        </div>
      </header>

      <main className="relative -mt-6 px-4 pb-20 sm:px-8">
        <SurveyForm />
      </main>

      <footer className="border-t border-[var(--line)] px-5 py-8 text-center text-xs text-[var(--ink-faint)]">
        Responses are anonymous and used solely for research at the College of Medicine, University of Al-Qadisiyah.
      </footer>
    </div>
  )
}
