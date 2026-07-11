import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
})

// ── Full IELTS speaking analysis ──────────────────────────────────────────────
export async function analyzeIELTSSpeaking(transcript) {
  if (!transcript || transcript.trim().length === 0) {
    throw new Error('Transcript is empty. Please record your answer first.')
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    temperature: 0.3,
    messages: [
      {
        role: 'system',
        content: `You are an expert IELTS Speaking examiner with 15 years of experience.
Analyze the following IELTS Speaking answer and return ONLY valid JSON — no markdown fences, no extra text.

The JSON must follow this exact schema:
{
  "cefrLevel": "A1|A2|B1|B2|C1|C2",
  "ieltsBand": <number 1.0–9.0 in 0.5 steps>,
  "wordCount": <integer>,
  "grammarMistakes": <integer count of errors>,
  "vocabularyScore": <integer 0–100>,
  "fluencyScore": <integer 0–100>,
  "grammarScore": <integer 0–100>,
  "pronunciationScore": <integer 0–100>,
  "overallFeedback": "<2–3 sentence summary>",
  "mistakes": [
    { "original": "<wrong text>", "corrected": "<corrected text>", "explanation": "<brief reason>" }
  ],
  "advancedVocabulary": ["<word or phrase>"],
  "improvementTips": ["<actionable tip>"],
  "improvedAnswer": "<a model rewrite of the answer at a higher band>"
}

Scoring guide:
- Band 9 = expert / native-like → CEFR C2
- Band 7-8 = good user → CEFR C1
- Band 5-6 = modest user → CEFR B1-B2
- Band 3-4 = limited user → CEFR A2-B1
- Band 1-2 = intermittent user → CEFR A1-A2`,
      },
      {
        role: 'user',
        content: `Analyze the following IELTS Speaking answer.\n\nTranscript:\n${transcript}`,
      },
    ],
  })

  const raw = response.choices[0].message.content.trim()

  // Strip accidental markdown fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')

  try {
    return JSON.parse(cleaned)
  } catch {
    throw new Error('AI returned malformed JSON. Please try again.')
  }
}

// ── Legacy basic evaluation (kept for backwards compatibility) ────────────────
export async function evaluateSpeaking(transcript) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: `You are a CEFR speaking examiner.
Analyze the transcript.
Return JSON only:
{ "level": "", "grammar": 0, "vocabulary": 0, "fluency": 0, "feedback": "" }`,
      },
      { role: 'user', content: transcript },
    ],
  })
  return JSON.parse(response.choices[0].message.content)
}
