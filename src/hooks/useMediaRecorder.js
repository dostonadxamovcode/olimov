import { useState, useRef, useCallback, useEffect } from 'react'

// Best MIME type supported by the current browser — Whisper accepts webm/ogg/mp4/wav
function getSupportedMimeType() {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
  ]
  if (typeof MediaRecorder === 'undefined') return ''
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? ''
}

/**
 * useMediaRecorder
 *
 * Professional voice recorder built on the MediaRecorder API.
 *
 * @param {object}   [opts]
 * @param {Function} [opts.onStop]  — (blob: Blob, url: string) => void
 *                                    Called once when recording stops and
 *                                    the audio Blob is ready. Use this to
 *                                    kick off your upload / transcription
 *                                    pipeline without any polling or timeouts.
 *
 * Returns:
 *   start()       — request mic permission + begin recording
 *   stop()        — end recording  (triggers onStop)
 *   reset()       — discard everything and return to idle
 *   isRecording   boolean
 *   seconds       number   — elapsed recording time in seconds
 *   audioBlob     Blob|null
 *   audioUrl      string|null  — Object URL for <audio> preview
 *   error         string|null
 */
export function useMediaRecorder({ onStop } = {}) {
  const [isRecording, setIsRecording] = useState(false)
  const [seconds,     setSeconds]     = useState(0)
  const [audioBlob,   setAudioBlob]   = useState(null)
  const [audioUrl,    setAudioUrl]    = useState(null)
  const [error,       setError]       = useState(null)

  const mediaRecorderRef = useRef(null)
  const chunksRef        = useRef([])
  const streamRef        = useRef(null)
  const timerRef         = useRef(null)
  const prevUrlRef       = useRef(null)
  const onStopRef        = useRef(onStop)

  // Keep callback ref current without re-subscribing effects
  useEffect(() => { onStopRef.current = onStop }, [onStop])

  // Revoke object URL + kill stream on unmount
  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)
      clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  // ── start ─────────────────────────────────────────────────────────────────
  const start = useCallback(async () => {
    setError(null)
    setAudioBlob(null)
    setAudioUrl(null)
    setSeconds(0)
    chunksRef.current = []

    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current)
      prevUrlRef.current = null
    }

    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount:     1,
          sampleRate:       16000,   // ideal for Whisper
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl:  true,
        },
      })
    } catch (err) {
      const msg =
        err?.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow microphone access and try again.'
          : `Could not access microphone: ${err?.message ?? String(err)}`
      setError(msg)
      return
    }

    streamRef.current = stream
    const mimeType = getSupportedMimeType()
    const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)

    rec.ondataavailable = (e) => {
      if (e.data?.size > 0) chunksRef.current.push(e.data)
    }

    rec.onstop = () => {
      clearInterval(timerRef.current)
      stream.getTracks().forEach((t) => t.stop())

      const blob = new Blob(chunksRef.current, {
        type: mimeType || 'audio/webm',
      })
      const url = URL.createObjectURL(blob)
      prevUrlRef.current = url

      setAudioBlob(blob)
      setAudioUrl(url)
      setIsRecording(false)

      // Fire callback so consumers don't need to watch state
      onStopRef.current?.(blob, url)
    }

    rec.onerror = (e) => {
      clearInterval(timerRef.current)
      setError(`Recording error: ${e.error?.message ?? 'Unknown error'}`)
      setIsRecording(false)
    }

    mediaRecorderRef.current = rec
    rec.start(250)  // chunk every 250 ms
    setIsRecording(true)

    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
  }, [])

  // ── stop ──────────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  // ── reset ─────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    clearInterval(timerRef.current)
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    streamRef.current?.getTracks().forEach((t) => t.stop())
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current)
      prevUrlRef.current = null
    }
    chunksRef.current = []
    setIsRecording(false)
    setSeconds(0)
    setAudioBlob(null)
    setAudioUrl(null)
    setError(null)
  }, [])

  return { start, stop, reset, isRecording, seconds, audioBlob, audioUrl, error }
}
