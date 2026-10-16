# GERD study questionnaire

A single-page, multi-step research questionnaire (GERD prevalence and risk factors among medical students, University of Al-Qadisiyah). Responses go to Netlify Forms. There are no accounts, no database, and no results dashboard; researchers export data from the Netlify Forms UI.

## Key files

- `src/lib/questionnaire.ts` — **the single source of truth**: sections, questions, option text, field IDs, conditional logic (`showIf` + `skipValue`), exclusive multi-select options, answer validation, `resolveAnswers()` and `computeScores()` (BMI, GerdQ, GAD-2/PHQ-2/PHQ-4).
- `src/components/SurveyForm.tsx` — the stepper UI, section rail, validation display, sessionStorage progress restore, and submission.
- `src/routes/index.tsx` — the page masthead and layout. `src/routes/__root.tsx` — metadata and Google Fonts (Fraunces + IBM Plex Sans).
- `src/styles.css` — color tokens (CSS variables) and the `.choice`, `.paper-card`, `.btn-*` component classes.
- `public/form-survey.html` — hidden static registration form so Netlify detects the form at deploy time.

## Conventions and non-obvious decisions

- Question/option wording is the study instrument; do not reword it without the researchers asking.
- **Field names must match** between `questionnaire.ts` and `public/form-survey.html`. If you add, remove, or rename a question or score field, regenerate or edit the registration file (it lists every question ID, every `computeScores` key, and `submitted_at`).
- Submissions POST URL-encoded data to `/form-survey.html` (not `/`, which SSR handles). The client treats non-2xx responses, and responses that echo the unprocessed registration HTML, as failures.
- Multi-select values are joined with `; ` into one field (Netlify Forms keeps a single value per name).
- Hidden conditional questions are submitted with their `skipValue` so the export has no blanks.
- Declining consent submits only `q1_consent` + `submitted_at`, which lets researchers report the response rate.
- GerdQ scoring: Q8, Q9, Q12, Q13 score 0–3; Q10 and Q11 are reverse-scored (3–0); total ≥ 8 = GERD likely. Scores are not shown to participants, to avoid influencing their answers.
- Netlify Forms is enabled for this site via the netlify-forms skill's enable script.
