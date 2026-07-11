// ── OpenAI Whisper — browser-side transcription ───────────────────────────────
// Sends an audio Blob directly to the Whisper API via multipart/form-data.
// No backend required. Key stored in VITE_OPENAI_API_KEY (.env.local).
//
// Whisper accepts: flac, m4a, mp3, mp4, mpeg, mpga, oga, ogg, wav, webm
// Max file size: 25 MB

const WHISPER_URL = 'https://api.openai.com/v1/audio/transcriptions'

/**
 * transcribeAudio
 *
 * @param {Blob}     audioBlob          — audio recorded by MediaRecorder
 * @param {Function} [onProgress]       — (pct: number) => void  (0-100, approximate)
 * @returns {Promise<string>}           — plain-text transcript
 */
export async function transcribeAudio(audioBlob, onProgress) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  if (!apiKey) {
    throw new Error(
      'OpenAI API key is missing. Add VITE_OPENAI_API_KEY to your .env.local file.',
    )
  }

  if (!audioBlob || audioBlob.size === 0) {
    throw new Error('Audio blob is empty. Please record your answer first.')
  }

  // Derive a sensible filename with the correct extension
  const ext      = audioBlob.type.includes('ogg')  ? 'ogg'
                 : audioBlob.type.includes('mp4')  ? 'mp4'
                 : 'webm'
  const filename = `ielts-speaking.${ext}`

  const form = new FormData()
  form.append('file',            new File([audioBlob], filename, { type: audioBlob.type }))
  form.append('model',           'whisper-1')
  form.append('language',        'en')
  form.append('response_format', 'json')
  // Prompt nudges Whisper toward IELTS-exam vocabulary
  form.append(
    'prompt',
    'IELTS Speaking test. The speaker is answering a question in English.',
  )

  // Simulate upload progress with XHR so we can fire onProgress
  if (typeof onProgress === 'function') {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 80)) // 0-80 % upload
        }
      }

      xhr.onload = () => {
        onProgress(100)
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText)
            resolve(data.text ?? '')
          } catch {
            reject(new Error('Whisper returned malformed JSON.'))
          }
        } else {
          reject(new Error(`Whisper API error ${xhr.status}: ${xhr.responseText}`))
        }
      }

      xhr.onerror = () => reject(new Error('Network error while uploading audio.'))
      xhr.ontimeout = () => reject(new Error('Request timed out while uploading audio.'))

      xhr.open('POST', WHISPER_URL)
      xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`)
      xhr.timeout = 120_000 // 2-minute timeout
      xhr.send(form)
    })
  }

  // Fallback: plain fetch (no progress)
  const response = await fetch(WHISPER_URL, {
    method:  'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body:    form,
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText)
    throw new Error(`Whisper API error ${response.status}: ${errText}`)
  }

  const data = await response.json()
  return data.text ?? ''
}
