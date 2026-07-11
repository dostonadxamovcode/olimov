// ── Gemini REST API — IELTS Speaking Analyzer ─────────────────────────────────
// Calls the Gemini API directly from the browser. No backend or Firebase
// Functions required. API key is stored in VITE_GEMINI_API_KEY (.env.local).

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

/**
 * analyzeIELTSSpeaking
 * Sends the transcript to Gemini and returns a structured evaluation object.
 *
 * @param {string} transcript  — raw SpeechRecognition transcript
 * @returns {Promise<{
 *   cefrLevel: string,
 *   ieltsBand: number,
 *   wordCount: number,
 *   grammarMistakes: number,
 *   vocabularyScore: number,
 *   fluencyScore: number,
 *   grammarScore: number,
 *   pronunciationScore: number,
 *   overallFeedback: string,
 *   mistakes: Array<{original:string, corrected:string, explanation:string}>,
 *   advancedVocabulary: string[],
 *   improvementTips: string[],
 *   improvedAnswer: string,
 * }>}
 */
export async function analyzeIELTSSpeaking(transcript) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error(
      'Gemini API key is missing. Add VITE_GEMINI_API_KEY to your .env.local file.',
    )
  }

  if (!transcript || transcript.trim().length === 0) {
    throw new Error('Transcript is empty. Please record your answer first.')
  }

  const prompt = `Analyze this IELTS Speaking transcript and return ONLY valid JSON with no markdown fences, no extra text, no explanation.

Return exactly this JSON structure:
{
  "cefrLevel": "",
  "ieltsBand": 0,
  "wordCount": 0,
  "grammarMistakes": 0,
  "vocabularyScore": 0,
  "fluencyScore": 0,
  "grammarScore": 0,
  "pronunciationScore": 0,
  "overallFeedback": "",
  "mistakes": [
    { "original": "", "corrected": "", "explanation": "" }
  ],
  "advancedVocabulary": [],
  "improvementTips": [],
  "improvedAnswer": ""
}

Field rules:
- cefrLevel: one of A1 | A2 | B1 | B2 | C1 | C2
- ieltsBand: number from 1.0 to 9.0 in 0.5 steps
- wordCount: integer count of words in the transcript
- grammarMistakes: integer count of grammar errors found
- vocabularyScore: integer 0–100
- fluencyScore: integer 0–100
- grammarScore: integer 0–100
- pronunciationScore: integer 0–100 (estimated from written patterns)
- overallFeedback: 2–3 sentence examiner-style summary
- mistakes: list each grammar error (may be empty array if none)
- advancedVocabulary: list of C1/C2 words or phrases the speaker used well
- improvementTips: 3–5 actionable tips to improve their score
- improvedAnswer: a Band 8+ rewrite of the entire answer

Transcript:
${transcript}`

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
    },
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText)
    throw new Error(`Gemini API error ${response.status}: ${errText}`)
  }

  const data = await response.json()

  // Navigate Gemini's response envelope
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!rawText) {
    throw new Error('Gemini returned an empty response. Please try again.')
  }

  // Strip accidental markdown fences (```json … ```)
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')

  try {
    return JSON.parse(cleaned)
  } catch {
    throw new Error('Gemini returned malformed JSON. Please try again.')
  }
}
