import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Loader2, ShieldCheck } from 'lucide-react'
import {
  CONSENT_ID,
  CONSENT_NO,
  FORM_NAME,
  computeScores,
  isAnswered,
  isVisible,
  resolveAnswers,
  sections,
  type Answers,
  type ChoiceQuestion,
  type NumberQuestion,
  type Question,
} from '../lib/questionnaire'

type Status = 'idle' | 'pending' | 'error' | 'complete' | 'declined'

const STORAGE_KEY = 'gerd-study-progress'

async function submitResponse(fields: Record<string, string>) {
  const body = new URLSearchParams({ 'form-name': FORM_NAME, 'bot-field': '', ...fields })
  const response = await fetch('/form-survey.html', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) throw new Error('Submission failed')
  // A plain static server echoes the registration file back with 200 instead of recording it.
  if (/\bdata-netlify\s*=/i.test(await response.text())) throw new Error('Form handling unavailable')
}

export default function SurveyForm() {
  const [answers, setAnswers] = useState<Answers>({})
  const [step, setStep] = useState(0)
  const [status, setStatus] = useState<Status>('idle')
  const [showErrors, setShowErrors] = useState(false)
  const [restored, setRestored] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)

  // Restore an unfinished questionnaire after an accidental reload.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as { answers: Answers; step: number }
        setAnswers(parsed.answers)
        setStep(parsed.step)
      }
    } catch {}
    setRestored(true)
  }, [])

  useEffect(() => {
    if (!restored) return
    if (status === 'complete' || status === 'declined') sessionStorage.removeItem(STORAGE_KEY)
    else sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, step }))
  }, [answers, step, status, restored])

  const section = sections[step]
  const visible = section.questions.filter((q) => isVisible(q, answers))
  const missing = visible.filter((q) => !isAnswered(q, answers))
  const isLast = step === sections.length - 1
  const progress = Math.round((step / (sections.length - 1)) * 100)

  function scrollTop() {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function setAnswer(id: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [id]: value }))
    if (status === 'error') setStatus('idle')
  }

  async function send(fields: Record<string, string>, done: Status) {
    if (status === 'pending') return
    setStatus('pending')
    try {
      await submitResponse({ ...fields, submitted_at: new Date().toISOString() })
      setStatus(done)
      scrollTop()
    } catch {
      setStatus('error')
    }
  }

  async function next() {
    if (missing.length > 0) {
      setShowErrors(true)
      document.getElementById(`q-${missing[0].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setShowErrors(false)

    if (step === 0 && answers[CONSENT_ID] === CONSENT_NO) {
      // Record the refusal only (no other data) so the response rate can be reported.
      await send({ [CONSENT_ID]: CONSENT_NO }, 'declined')
      return
    }
    if (isLast) {
      const resolved = resolveAnswers(answers)
      await send({ ...resolved, ...computeScores(resolved) }, 'complete')
      return
    }
    setStep(step + 1)
    scrollTop()
  }

  function back() {
    setShowErrors(false)
    setStatus('idle')
    setStep(Math.max(0, step - 1))
    scrollTop()
  }

  if (status === 'complete' || status === 'declined') {
    return (
      <div ref={topRef} className="paper-card mx-auto max-w-2xl px-6 py-14 text-center sm:px-12">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--teal)] text-white">
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </div>
        {status === 'complete' ? (
          <>
            <p className="eyebrow mb-3">End of Questionnaire</p>
            <h2 className="font-display text-3xl leading-tight text-[var(--ink)] sm:text-4xl">
              Thank you for your time and participation.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[var(--ink-soft)]">
              Your contribution is valuable to understanding GERD and its associated factors among
              medical students at the University of Al-Qadisiyah, Iraq.
            </p>
          </>
        ) : (
          <>
            <p className="eyebrow mb-3">Participation declined</p>
            <h2 className="font-display text-3xl leading-tight text-[var(--ink)] sm:text-4xl">
              Thank you for considering the study.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[var(--ink-soft)]">
              You have chosen not to participate, and no further questions will be asked. Your decision
              has no effect on your studies in any way.
            </p>
          </>
        )}
      </div>
    )
  }

  return (
    <div ref={topRef} className="mx-auto grid max-w-6xl scroll-mt-6 gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">
        <nav className="sticky top-8" aria-label="Questionnaire sections">
          <p className="eyebrow mb-4">Sections</p>
          <ol className="space-y-1">
            {sections.map((s, i) => (
              <li
                key={s.id}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                  i === step
                    ? 'bg-white font-semibold text-[var(--ink)] shadow-sm'
                    : i < step
                      ? 'text-[var(--teal)]'
                      : 'text-[var(--ink-faint)]'
                }`}
                aria-current={i === step ? 'step' : undefined}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                    i < step
                      ? 'border-[var(--teal)] bg-[var(--teal)] text-white'
                      : i === step
                        ? 'border-[var(--ink)] text-[var(--ink)]'
                        : 'border-[var(--line)]'
                  }`}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : s.number}
                </span>
                {s.short}
              </li>
            ))}
          </ol>
        </nav>
      </aside>

      <div>
        <div className="mb-6">
          <div className="mb-2 flex items-baseline justify-between text-sm text-[var(--ink-soft)]">
            <span>
              Section {section.number} of {sections.length}
            </span>
            <span className="tabular-nums">{progress}% complete</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--line)]">
            <div
              className="h-full rounded-full bg-[var(--teal)] transition-[width] duration-500"
              style={{ width: `${Math.max(progress, 3)}%` }}
            />
          </div>
        </div>

        <form
          name={FORM_NAME}
          method="POST"
          action="/form-survey.html"
          data-netlify="true"
          netlify-honeypot="bot-field"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            next()
          }}
          className="paper-card overflow-hidden"
        >
          <header className="border-b border-[var(--line)] px-6 py-7 sm:px-10">
            <p className="eyebrow mb-2">Section {section.number}</p>
            <h2 className="font-display text-2xl leading-snug text-[var(--ink)] sm:text-3xl">{section.title}</h2>
            {section.instructions && (
              <p className="mt-4 rounded-md border-l-4 border-[var(--amber)] bg-[var(--amber-wash)] px-4 py-3 text-sm text-[var(--ink-soft)]">
                <span className="font-semibold text-[var(--ink)]">Instructions: </span>
                {section.instructions}
              </p>
            )}
            {step === 0 && <ConsentIntro />}
          </header>

          <fieldset disabled={status === 'pending'} className="divide-y divide-[var(--line)]">
            {visible.map((q) => (
              <QuestionBlock
                key={q.id}
                question={q}
                answers={answers}
                invalid={showErrors && !isAnswered(q, answers)}
                onChange={setAnswer}
              />
            ))}
          </fieldset>

          <footer className="border-t border-[var(--line)] bg-[var(--paper-deep)] px-6 py-5 sm:px-10">
            {showErrors && missing.length > 0 && (
              <p role="alert" className="mb-4 text-sm font-medium text-[var(--danger)]">
                Please answer {missing.length === 1 ? 'the highlighted question' : `the ${missing.length} highlighted questions`} to continue.
              </p>
            )}
            {status === 'error' && (
              <p role="alert" className="mb-4 text-sm font-medium text-[var(--danger)]">
                Your response could not be confirmed as sent. Your answers are kept on this page — please check
                your connection and try again.
              </p>
            )}
            <div className="flex items-center justify-between gap-4">
              {step > 0 ? (
                <button type="button" onClick={back} disabled={status === 'pending'} className="btn-ghost">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              ) : (
                <span />
              )}
              <button type="submit" disabled={status === 'pending'} className="btn-primary">
                {status === 'pending' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                  </>
                ) : step === 0 && answers[CONSENT_ID] === CONSENT_NO ? (
                  'Finish'
                ) : isLast ? (
                  <>
                    Submit questionnaire <Check className="h-4 w-4" />
                  </>
                ) : step === 0 ? (
                  <>
                    Begin questionnaire <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next section <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  )
}

function ConsentIntro() {
  return (
    <div className="mt-5 space-y-3 text-[15px] leading-relaxed text-[var(--ink-soft)]">
      <p>
        You are invited to take part in a cross-sectional study on the prevalence and risk factors of
        gastroesophageal reflux disease (GERD) among first- to sixth-year students at the College of Medicine,
        University of Al-Qadisiyah. The questionnaire has 7 short sections and takes about 8–10 minutes.
      </p>
      <p className="flex gap-3 rounded-md bg-[var(--teal-wash)] px-4 py-3 text-sm text-[var(--ink)]">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--teal)]" />
        <span>
          Participation is voluntary and anonymous — no name, student ID, or contact details are collected.
          You may stop at any time, and your answers are used only for research purposes.
        </span>
      </p>
    </div>
  )
}

type BlockProps = {
  question: Question
  answers: Answers
  invalid: boolean
  onChange: (id: string, value: string | string[]) => void
}

function QuestionBlock({ question, answers, invalid, onChange }: BlockProps) {
  return (
    <div
      id={`q-${question.id}`}
      role="group"
      aria-labelledby={`label-${question.id}`}
      className={`scroll-mt-24 px-6 py-7 transition-colors sm:px-10 ${invalid ? 'bg-[var(--danger-wash)]' : ''}`}
    >
      <p id={`label-${question.id}`} className="mb-4 flex gap-3 text-[17px] font-medium leading-snug text-[var(--ink)]">
        <span className="font-display shrink-0 text-[var(--teal)]">Q{question.number}.</span>
        <span>
          {question.label}
          {question.type === 'multi' && <span className="sr-only"> (select all that apply)</span>}
        </span>
      </p>
      {question.type === 'number' ? (
        <NumberField question={question} value={answers[question.id]} invalid={invalid} onChange={onChange} />
      ) : (
        <ChoiceField question={question} value={answers[question.id]} onChange={onChange} />
      )}
      {invalid && (
        <p className="mt-3 text-sm text-[var(--danger)]">
          {question.type === 'number'
            ? `Please enter a value between ${question.min} and ${question.max} ${question.unit}.`
            : 'This question requires an answer.'}
        </p>
      )}
    </div>
  )
}

function ChoiceField({
  question,
  value,
  onChange,
}: {
  question: ChoiceQuestion
  value: Answers[string] | undefined
  onChange: BlockProps['onChange']
}) {
  const multi = question.type === 'multi'
  const selected = multi ? (Array.isArray(value) ? value : []) : value

  function toggle(option: string) {
    if (!multi) return onChange(question.id, option)
    const current = selected as string[]
    if (current.includes(option)) return onChange(question.id, current.filter((o) => o !== option))
    if (question.exclusive?.includes(option)) return onChange(question.id, [option])
    onChange(question.id, [...current.filter((o) => !question.exclusive?.includes(o)), option])
  }

  const compact = question.options.length >= 4 && question.options.every((o) => o.length <= 14)

  return (
    <div className={`grid gap-2 ${compact ? 'grid-cols-2 sm:grid-cols-4' : 'sm:grid-cols-2'}`}>
      {question.options.map((option) => {
        const checked = multi ? (selected as string[]).includes(option) : selected === option
        return (
          <label key={option} className={`choice ${checked ? 'choice-checked' : ''}`}>
            <input
              type={multi ? 'checkbox' : 'radio'}
              name={question.id}
              value={option}
              checked={checked}
              onChange={() => toggle(option)}
              className="sr-only"
            />
            <span className={`choice-mark ${multi ? 'rounded-[4px]' : 'rounded-full'}`} aria-hidden>
              {checked && (multi ? <Check className="h-3 w-3" strokeWidth={3.5} /> : <span className="h-2 w-2 rounded-full bg-white" />)}
            </span>
            <span>{option}</span>
          </label>
        )
      })}
    </div>
  )
}

function NumberField({
  question,
  value,
  invalid,
  onChange,
}: {
  question: NumberQuestion
  value: Answers[string] | undefined
  invalid: boolean
  onChange: BlockProps['onChange']
}) {
  return (
    <div className="flex max-w-xs items-stretch">
      <input
        type="number"
        inputMode="decimal"
        step="0.1"
        min={question.min}
        max={question.max}
        name={question.id}
        aria-label={question.label}
        aria-invalid={invalid}
        placeholder={question.placeholder}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(question.id, e.target.value)}
        className={`w-full rounded-l-md border bg-white px-4 py-3 text-lg tabular-nums text-[var(--ink)] outline-none transition focus:border-[var(--teal)] focus:ring-2 focus:ring-[var(--teal-wash)] ${
          invalid ? 'border-[var(--danger)]' : 'border-[var(--line-strong)]'
        }`}
      />
      <span className="flex items-center rounded-r-md border border-l-0 border-[var(--line-strong)] bg-[var(--paper-deep)] px-4 font-medium text-[var(--ink-soft)]">
        {question.unit}
      </span>
    </div>
  )
}
