# GERD Among Medical Students — Study Questionnaire

An anonymous online questionnaire for the cross-sectional study **"Prevalence and Risk Factors of Gastroesophageal Reflux Disease (GERD) Among Students at the College of Medicine, University of Al-Qadisiyah, Iraq"**, aimed at first- to sixth-year medical students.

## What it does

- Opens with informed consent. If a participant declines, the form ends and only the refusal is recorded, so the response rate can be reported.
- Walks through 7 sections (37 questions): demographics, anthropometrics, the GerdQ questionnaire, lifestyle/diet/sleep/activity, PHQ-4, and medication and medical history.
- Shows follow-up questions only when they apply (pregnancy for female participants, tobacco details for smokers, cigarette questions for cigarette users, medication groups when other medications are used). Skipped questions are stored as "Not applicable" or "I do not smoke cigarettes".
- Requires every visible question and checks weight (30–250 kg) and height (120–230 cm) ranges.
- Calculates study variables with each response: BMI and category, GerdQ score (≥ 8 = GERD likely), GAD-2, PHQ-2, and PHQ-4 total and category. Participants don't see these scores.
- Keeps progress in the browser tab, so an accidental reload doesn't lose answers.

## Collecting the data

Responses are stored with **Netlify Forms** under the form name `gerd-study-questionnaire`. View them in the Netlify dashboard under **Forms**, and export them as CSV for SPSS, Excel, or R. Each question has its own column (`q1_consent` … `q37_medication_groups`), followed by the calculated score columns and `submitted_at`. Multi-select answers are joined with `; `.

## Technology

- TanStack Start (React 19) with Vite
- Tailwind CSS v4
- Netlify Forms for storing responses

## Running locally

```bash
pnpm install
netlify dev
```

Submissions are only recorded on Netlify (or with `netlify dev`). A plain Vite server shows an error message rather than claiming a submission succeeded.
