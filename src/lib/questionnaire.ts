export type Answers = Record<string, string | string[]>

type BaseQuestion = {
  id: string
  number: number
  label: string
  /** Hide the question (and submit `skipValue`) unless this returns true. */
  showIf?: (a: Answers) => boolean
  skipValue?: string
}

export type ChoiceQuestion = BaseQuestion & {
  type: 'single' | 'multi'
  options: string[]
  /** Options in a multi-select that clear every other selection. */
  exclusive?: string[]
}

export type NumberQuestion = BaseQuestion & {
  type: 'number'
  unit: string
  placeholder: string
  min: number
  max: number
}

export type Question = ChoiceQuestion | NumberQuestion

export type Section = {
  id: string
  number: number
  title: string
  short: string
  instructions?: string
  questions: Question[]
}

const days = ['0 days', '1 day', '2–3 days', '4–7 days']
const phq = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
const weekly = ['Never', 'Less than once per week', '1–3 days per week', '4–6 days per week', 'Daily']
const often = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always or almost always']
const yesNo = ['Yes', 'No']
const yesNoUnsure = ['Yes', 'No', 'Not sure']

const smokes = (a: Answers) => a.q14_smoking === 'Yes'
const usesCigarettes = (a: Answers) =>
  smokes(a) && Array.isArray(a.q15_tobacco_products) && a.q15_tobacco_products.includes('Cigarettes')

export const CONSENT_ID = 'q1_consent'
export const CONSENT_YES = 'Yes, I agree to participate.'
export const CONSENT_NO = 'No, I do not agree to participate.'

export const sections: Section[] = [
  {
    id: 'consent',
    number: 1,
    title: 'Informed Consent',
    short: 'Consent',
    questions: [
      {
        id: CONSENT_ID,
        number: 1,
        type: 'single',
        label: 'Do you agree to participate voluntarily in this research study?',
        options: [CONSENT_YES, CONSENT_NO],
      },
    ],
  },
  {
    id: 'demographics',
    number: 2,
    title: 'Demographic Information',
    short: 'Demographics',
    questions: [
      {
        id: 'q2_age',
        number: 2,
        type: 'single',
        label: 'What is your age in years?',
        options: [
          '18 years', '19 years', '20 years', '21 years', '22 years',
          '23 years', '24 years', '25 years', '26 years or older',
        ],
      },
      { id: 'q3_gender', number: 3, type: 'single', label: 'What is your gender?', options: ['Male', 'Female'] },
      {
        id: 'q4_pregnant',
        number: 4,
        type: 'single',
        label: 'Are you currently pregnant?',
        options: ['Yes', 'No', 'Not applicable'],
        showIf: (a) => a.q3_gender === 'Female',
        skipValue: 'Not applicable',
      },
      {
        id: 'q5_academic_year',
        number: 5,
        type: 'single',
        label: 'What is your current academic year?',
        options: ['First year', 'Second year', 'Third year', 'Fourth year', 'Fifth year', 'Sixth year'],
      },
    ],
  },
  {
    id: 'anthropometrics',
    number: 3,
    title: 'Anthropometric Measurements',
    short: 'Body measures',
    questions: [
      {
        id: 'q6_weight_kg',
        number: 6,
        type: 'number',
        label: 'What is your current weight in kilograms (kg)?',
        unit: 'kg',
        placeholder: 'e.g. 68',
        min: 30,
        max: 250,
      },
      {
        id: 'q7_height_cm',
        number: 7,
        type: 'number',
        label: 'What is your current height in centimeters (cm)?',
        unit: 'cm',
        placeholder: 'e.g. 172',
        min: 120,
        max: 230,
      },
    ],
  },
  {
    id: 'gerdq',
    number: 4,
    title: 'GERD Assessment — GerdQ Questionnaire',
    short: 'GerdQ',
    instructions:
      'The following questions concern your symptoms and medication use during the past 7 days. Select one answer for each question.',
    questions: [
      { id: 'q8_heartburn', number: 8, type: 'single', options: days,
        label: 'How often did you have a burning feeling behind your breastbone (heartburn)?' },
      { id: 'q9_regurgitation', number: 9, type: 'single', options: days,
        label: 'How often did you have stomach contents (liquid or food) moving upwards to your throat or mouth (regurgitation)?' },
      { id: 'q10_epigastric_pain', number: 10, type: 'single', options: days,
        label: 'How often did you have pain in the center of your upper stomach?' },
      { id: 'q11_nausea', number: 11, type: 'single', options: days,
        label: 'How often did you have nausea?' },
      { id: 'q12_sleep_disturbance', number: 12, type: 'single', options: days,
        label: 'How often did you have difficulty getting a good night’s sleep because of heartburn and/or regurgitation?' },
      { id: 'q13_extra_medication', number: 13, type: 'single', options: days,
        label: 'How often did you take additional medication for heartburn and/or regurgitation, other than what your physician told you to take (such as antacids)?' },
    ],
  },
  {
    id: 'lifestyle',
    number: 5,
    title: 'Lifestyle, Dietary Factors, Sleep and Physical Activity',
    short: 'Lifestyle',
    questions: [
      { id: 'q14_smoking', number: 14, type: 'single', options: yesNo,
        label: 'Do you currently smoke cigarettes or use other tobacco products?' },
      {
        id: 'q15_tobacco_products',
        number: 15,
        type: 'multi',
        label: 'Which tobacco product do you use? Select all that apply.',
        options: ['Cigarettes', 'Waterpipe (hookah)', 'E-cigarettes or vaping products', 'Other tobacco products', 'Not applicable'],
        exclusive: ['Not applicable'],
        showIf: smokes,
        skipValue: 'Not applicable',
      },
      {
        id: 'q16_cigarettes_per_day',
        number: 16,
        type: 'single',
        label: 'On average, how many cigarettes do you smoke per day?',
        options: ['1–5 cigarettes', '6–10 cigarettes', '11–20 cigarettes', 'More than 20 cigarettes', 'I do not smoke cigarettes'],
        showIf: usesCigarettes,
        skipValue: 'I do not smoke cigarettes',
      },
      {
        id: 'q17_smoking_years',
        number: 17,
        type: 'single',
        label: 'For how many years have you been smoking cigarettes?',
        options: ['Less than 1 year', '1–3 years', '4–6 years', 'More than 6 years', 'I do not smoke cigarettes'],
        showIf: usesCigarettes,
        skipValue: 'I do not smoke cigarettes',
      },
      {
        id: 'q18_waterpipe_frequency',
        number: 18,
        type: 'single',
        label: 'How often do you use a waterpipe (hookah)?',
        options: ['Never', 'Less than once per week', '1–2 times per week', '3 or more times per week', 'I used to smoke waterpipe but no longer do'],
      },
      {
        id: 'q19_coffee_tea',
        number: 19,
        type: 'single',
        label: 'How often do you consume coffee or tea?',
        options: ['Never', 'Less than once daily', 'Once daily', '2–3 times daily', '4 or more times daily'],
      },
      { id: 'q20_carbonated_drinks', number: 20, type: 'single', options: weekly,
        label: 'How often do you consume carbonated or soft drinks?' },
      { id: 'q21_spicy_sour_foods', number: 21, type: 'single', options: weekly,
        label: 'How often do you consume spicy or sour foods?' },
      {
        id: 'q22_skip_breakfast',
        number: 22,
        type: 'single',
        label: 'How often do you skip breakfast?',
        options: ['Never', 'Less than once per week', '1–2 days per week', '3–4 days per week', '5–7 days per week'],
      },
      { id: 'q23_late_eating', number: 23, type: 'single', options: often,
        label: 'How often do you eat within 3 hours before going to bed?' },
      { id: 'q24_lying_after_meal', number: 24, type: 'single', options: often,
        label: 'How often do you lie down within 3 hours after eating a main meal?' },
      {
        id: 'q25_sleep_hours',
        number: 25,
        type: 'single',
        label: 'On average, how many hours do you sleep per night?',
        options: ['Less than 5 hours', '5–6 hours', '7–8 hours', 'More than 8 hours'],
      },
      {
        id: 'q26_physical_activity',
        number: 26,
        type: 'single',
        label: 'How often do you engage in at least 30 minutes of physical activity?',
        options: ['Never', '1–2 days per week', '3–4 days per week', '5 or more days per week'],
      },
    ],
  },
  {
    id: 'phq4',
    number: 6,
    title: 'Psychological Health Assessment — PHQ-4',
    short: 'PHQ-4',
    instructions:
      'The following questions concern the past 2 weeks. Select the answer that best describes how often you have been bothered by each problem.',
    questions: [
      { id: 'q27_nervous', number: 27, type: 'single', options: phq, label: 'Feeling nervous, anxious, or on edge.' },
      { id: 'q28_worrying', number: 28, type: 'single', options: phq, label: 'Not being able to stop or control worrying.' },
      { id: 'q29_little_interest', number: 29, type: 'single', options: phq, label: 'Little interest or pleasure in doing things.' },
      { id: 'q30_feeling_down', number: 30, type: 'single', options: phq, label: 'Feeling down, depressed, or hopeless.' },
    ],
  },
  {
    id: 'medical',
    number: 7,
    title: 'Medication Use and Medical History',
    short: 'Medical history',
    questions: [
      {
        id: 'q31_nsaid_frequency',
        number: 31,
        type: 'single',
        label: 'How often do you use non-steroidal anti-inflammatory drugs (NSAIDs), such as ibuprofen, diclofenac, or naproxen?',
        options: ['Never', 'Less than once per month', '1–3 days per month', '1–2 days per week', '3 or more days per week'],
      },
      {
        id: 'q32_medications_3_months',
        number: 32,
        type: 'multi',
        label: 'Which of the following medications have you used during the past 3 months? Select all that apply.',
        options: ['Ibuprofen', 'Diclofenac', 'Naproxen', 'Aspirin', 'Other NSAIDs', 'None of the above', 'I am not sure'],
        exclusive: ['None of the above', 'I am not sure'],
      },
      { id: 'q33_gerd_diagnosed', number: 33, type: 'single', options: yesNoUnsure,
        label: 'Have you ever been diagnosed with GERD by a healthcare professional?' },
      {
        id: 'q34_gerd_medication',
        number: 34,
        type: 'single',
        label: 'Are you currently taking medication for GERD or acid-related symptoms?',
        options: [
          'Yes, prescribed medication',
          'Yes, non-prescription medication',
          'Yes, both prescribed and non-prescription medication',
          'No',
        ],
      },
      { id: 'q35_upper_gi_disorder', number: 35, type: 'single', options: yesNoUnsure,
        label: 'Have you ever been diagnosed with a condition such as a hiatal hernia or another upper gastrointestinal disorder?' },
      { id: 'q36_other_medications', number: 36, type: 'single', options: yesNo,
        label: 'Do you regularly take any medications other than NSAIDs?' },
      {
        id: 'q37_medication_groups',
        number: 37,
        type: 'multi',
        label: 'Which of the following medication groups do you use? Select all that apply.',
        options: ['Calcium channel blockers', 'Nitrates', 'Other medications', 'Not sure of the medication group', 'Not applicable'],
        exclusive: ['Not applicable'],
        showIf: (a) => a.q36_other_medications === 'Yes',
        skipValue: 'Not applicable',
      },
    ],
  },
]

export const allQuestions = sections.flatMap((s) => s.questions)

export function isVisible(q: Question, a: Answers) {
  return !q.showIf || q.showIf(a)
}

export function isAnswered(q: Question, a: Answers) {
  const v = a[q.id]
  if (q.type === 'multi') return Array.isArray(v) && v.length > 0
  if (q.type === 'number') {
    const n = Number(v)
    return typeof v === 'string' && v.trim() !== '' && n >= q.min && n <= q.max
  }
  return typeof v === 'string' && v !== ''
}

/** Final value for every question, filling in skip values for hidden follow-ups. */
export function resolveAnswers(a: Answers): Record<string, string> {
  const out: Record<string, string> = {}
  for (const q of allQuestions) {
    if (!isVisible(q, a)) {
      out[q.id] = q.skipValue ?? ''
      continue
    }
    const v = a[q.id]
    out[q.id] = Array.isArray(v) ? v.join('; ') : (v ?? '')
  }
  return out
}

// GerdQ: Q8, Q9, Q12, Q13 score 0–3; Q10 and Q11 are reverse-scored 3–0. Total ≥ 8 suggests GERD.
const GERDQ_POSITIVE = ['q8_heartburn', 'q9_regurgitation', 'q12_sleep_disturbance', 'q13_extra_medication']
const GERDQ_NEGATIVE = ['q10_epigastric_pain', 'q11_nausea']

/** Derived study variables, stored alongside the raw answers for analysis. */
export function computeScores(a: Record<string, string>) {
  const dayScore = (id: string) => days.indexOf(a[id])
  const phqScore = (id: string) => phq.indexOf(a[id])

  const gerdq =
    GERDQ_POSITIVE.reduce((s, id) => s + dayScore(id), 0) +
    GERDQ_NEGATIVE.reduce((s, id) => s + (3 - dayScore(id)), 0)

  const gad2 = phqScore('q27_nervous') + phqScore('q28_worrying')
  const phq2 = phqScore('q29_little_interest') + phqScore('q30_feeling_down')
  const phq4 = gad2 + phq2
  const phq4Category = phq4 >= 9 ? 'Severe' : phq4 >= 6 ? 'Moderate' : phq4 >= 3 ? 'Mild' : 'Normal'

  const weight = Number(a.q6_weight_kg)
  const heightM = Number(a.q7_height_cm) / 100
  const bmi = weight / (heightM * heightM)
  const bmiCategory =
    bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal weight' : bmi < 30 ? 'Overweight' : 'Obese'

  return {
    bmi: bmi.toFixed(1),
    bmi_category: bmiCategory,
    gerdq_score: String(gerdq),
    gerdq_result: gerdq >= 8 ? 'GERD likely (score ≥ 8)' : 'GERD unlikely (score < 8)',
    gad2_score: String(gad2),
    phq2_score: String(phq2),
    phq4_score: String(phq4),
    phq4_category: phq4Category,
  }
}

export const SCORE_FIELDS = Object.keys(
  computeScores({ q6_weight_kg: '70', q7_height_cm: '170' }),
)

export const FORM_NAME = 'gerd-study-questionnaire'
