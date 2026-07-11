import { useState, useCallback, useRef } from 'react'
import {
  Mic, MicOff, RotateCcw, Upload, FileText,
  Sparkles, AlertCircle, CheckCircle, Clock,
} from 'lucide-react'
import { useMediaRecorder }     from '../hooks/useMediaRecorder'
import { transcribeAudio }      from '../services/whisper'
import { analyzeIELTSSpeaking } from '../services/geminiAI'
import { saveIELTSResult }      from '../services/ieltsResults'
import { IELTSResultCard }      from './IELTSResultCard'

// ── Step constants ────────────────────────────────────────────────────────────
const S = {
  IDLE:         'idle',
  RECORDING:    'recording',
  UPLOADING:    'uploading',
  TRANSCRIBING: 'transcribing',
  ANALYZING:    'analyzing',
  DONE:         'done',
  ERROR:        'error',
}

const PIPELINE_STEPS = [S.UPLOADING, S.TRANSCRIBING, S.ANALYZING, S.DONE]

// ── Sub-components ────────────────────────────────────────────────────────────

function RecordingDot() {
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
    </span>
  )
}

function TimerDisplay({ seconds }) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return (
    <div className="flex items-center gap-1.5 text-rose-400 font-mono font-bold text-sm">
      <Clock className="w-3.5 h-3.5" />
      {m}:{s}
    </div>
  )
}

function ProgressBar({ pct, color = 'bg-violet-500' }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-300 ${color}`}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  )
}

function StepRow({ icon: Icon, label, stepKey, currentStep }) {
  const idx     = PIPELINE_STEPS.indexOf(stepKey)
  const curIdx  = PIPELINE_STEPS.indexOf(currentStep)
  const isActive = currentStep === stepKey
  const isDone   = curIdx > idx && currentStep !== S.IDLE && currentStep !== S.RECORDING
  const isError  = currentStep === S.ERROR

  const color = isDone ? 'text-emerald-400' : isActive ? 'text-violet-400' : 'text-slate-600'

  return (
    <div className={`flex items-center gap-2.5 text-sm ${color}`}>
      {isDone && !isError ? (
        <CheckCircle className="w-4 h-4 shrink-0" />
      ) : isActive ? (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
      ) : (
        <Icon className="w-4 h-4 shrink-0 opacity-40" />
      )}
      <span className={isActive ? 'animate-pulse' : ''}>{label}</span>
    </div>
  )
}

function ErrorBanner({ message }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-rose-500/25 px-4 py-3"
      style={{ background: 'rgba(239,68,68,0.08)' }}
    >
      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
      <p className="text-rose-300 text-sm leading-relaxed">{message}</p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * IELTSSpeakingEvaluator
 *
 * Complete IELTS Speaking recording + evaluation flow:
 *   MediaRecorder → Whisper STT → Gemini analysis → Firestore → ResultCard
 *
 * Props:
 *   question  {string}  — Speaking question shown to the user
 *   userId    {string}  — Firestore UID for saving results (optional)
 */
export function IELTSSpeakingEvaluator({
  question = 'Describe a memorable event from your childhood. You should say: what happened, when it happened, who was involved, and explain why it was memorable.',
  userId   = null,
}) {
  const [step,       setStep]       = useState(S.IDLE)
  const [uploadPct,  setUploadPct]  = useState(0)
  const [transcript, setTranscript] = useState('')
  const [result,     setResult]     = useState(null)
  const [savedId,    setSavedId]    = useState(null)
  const [errorMsg,   setErrorMsg]   = useState('')
  const [audioUrl,   setAudioUrl]   = useState(null)

  // Keep latest userId in a ref so the pipeline closure always sees current value
  const userIdRef = useRef(userId)
  userIdRef.current = userId

  // ── Pipeline ──────────────────────────────────────────────────────────────
  const runPipeline = useCallback(async (blob, url) => {
    setAudioUrl(url)
    setUploadPct(0)
    setTranscript('')
    setResult(null)
    setSavedId(null)
    setErrorMsg('')

    try {
      // Step 1 — Upload + Whisper transcription
      setStep(S.UPLOADING)
      let text
      try {
        text = await transcribeAudio(blob, (pct) => {
          setUploadPct(pct)
          if (pct >= 80) setStep(S.TRANSCRIBING)
        })
      } catch (err) {
        throw new Error(`Transcription failed: ${err.message}`)
      }

      if (!text?.trim()) {
        throw new Error(
          'Whisper could not detect any speech in your recording. ' +
          'Please ensure your microphone is working, speak clearly, and try again.',
        )
      }

      const cleanText = text.trim()
      setTranscript(cleanText)
      setUploadPct(100)

      // Step 2 — Gemini IELTS analysis
      setStep(S.ANALYZING)
      let analysis
      try {
        analysis = await analyzeIELTSSpeaking(cleanText)
      } catch (err) {
        throw new Error(`AI analysis failed: ${err.message}`)
      }
      setResult(analysis)

      // Step 3 — Firestore save (non-fatal)
      const uid = userIdRef.current
      if (uid) {
        try {
          const id = await saveIELTSResult({
            userId:       uid,
            transcript:   cleanText,
            questionText: question,
            result:       analysis,
          })
          setSavedId(id)
        } catch (err) {
          console.warn('[IELTSSpeakingEvaluator] Firestore save failed:', err)
        }
      }

      setStep(S.DONE)
    } catch (err) {
      setErrorMsg(err?.message ?? 'An unexpected error occurred. Please try again.')
      setStep(S.ERROR)
    }
  }, [question])

  // ── MediaRecorder ─────────────────────────────────────────────────────────
  // onStop is called by the hook with the finished Blob — no polling needed.
  const { start, stop, reset: resetRecorder, isRecording, seconds, error: recorderError } =
    useMediaRecorder({
      onStop: (blob, url) => runPipeline(blob, url),
    })

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStart = useCallback(async () => {
    setStep(S.RECORDING)
    setTranscript('')
    setResult(null)
    setSavedId(null)
    setErrorMsg('')
    setUploadPct(0)
    setAudioUrl(null)
    await start()
  }, [start])

  const handleStop = useCallback(() => {
    stop() // onstop fires → runPipeline is called
  }, [stop])

  const handleReset = useCallback(() => {
    resetRecorder()
    setStep(S.IDLE)
    setTranscript('')
    setResult(null)
    setSavedId(null)
    setErrorMsg('')
    setUploadPct(0)
    setAudioUrl(null)
  }, [resetRecorder])

  // ── Derived UI helpers ────────────────────────────────────────────────────
  const isPipelineRunning = [S.UPLOADING, S.TRANSCRIBING, S.ANALYZING].includes(step)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">

      {/* ── Question ───────────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border border-purple-500/20 px-5 py-4"
        style={{ background: 'rgba(139,92,246,0.07)' }}
      >
        <p className="text-[10px] font-bold text-purple-400/70 uppercase tracking-widest mb-1.5">
          IELTS Speaking Question
        </p>
        <p className="text-slate-200 text-sm leading-relaxed">{question}</p>
      </div>

      {/* ── Recording UI ───────────────────────────────────────────────────── */}
      {(step === S.IDLE || step === S.RECORDING) && (
        <div
          className="rounded-2xl border border-white/[0.07] p-5 space-y-4"
          style={{ background: 'rgba(255,255,255,0.025)' }}
        >
          {/* Status row */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              {isRecording && <RecordingDot />}
              <span className={`text-sm font-medium ${isRecording ? 'text-rose-400' : 'text-slate-400'}`}>
                {isRecording ? 'Recording…' : 'Ready to record'}
              </span>
            </div>
            {isRecording && <TimerDisplay seconds={seconds} />}
          </div>

          {/* Animated waveform */}
          {isRecording && (
            <div className="flex items-center justify-center gap-[3px] h-12 overflow-hidden rounded-xl bg-black/20 px-4">
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-rose-500/80"
                  style={{
                    height: `${10 + Math.abs(Math.sin(i * 0.7)) * 22}px`,
                    animation: `waveBar ${0.4 + (i % 7) * 0.08}s ease-in-out infinite alternate`,
                    animationDelay: `${(i * 35) % 300}ms`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 flex-wrap">
            {!isRecording ? (
              <button
                type="button"
                onClick={handleStart}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl font-semibold text-sm text-white bg-gradient-to-r from-rose-500 to-pink-500 shadow-md shadow-rose-500/20 hover:-translate-y-0.5 hover:shadow-rose-500/35 transition-all duration-200"
              >
                <Mic className="w-4 h-4" />
                Start Recording
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStop}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl font-semibold text-sm text-white bg-gradient-to-r from-slate-600 to-slate-500 shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <MicOff className="w-4 h-4" />
                Stop &amp; Analyze
              </button>
            )}
          </div>

          {/* Recorder error */}
          {recorderError && <ErrorBanner message={recorderError} />}

          <p className="text-slate-600 text-xs">
            Audio is sent only to the Whisper API for transcription. Nothing is
            stored on any server without your permission.
          </p>
        </div>
      )}

      {/* ── Pipeline progress ──────────────────────────────────────────────── */}
      {isPipelineRunning && (
        <div
          className="rounded-2xl border border-white/[0.07] p-5 space-y-5"
          style={{ background: 'rgba(255,255,255,0.025)' }}
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Processing
          </p>

          <div className="space-y-3.5">
            <StepRow icon={Upload}   label="Uploading audio to Whisper"  stepKey={S.UPLOADING}    currentStep={step} />
            <StepRow icon={FileText} label="Transcribing speech to text"  stepKey={S.TRANSCRIBING} currentStep={step} />
            <StepRow icon={Sparkles} label="AI analysis — CEFR + Band"    stepKey={S.ANALYZING}    currentStep={step} />
          </div>

          {step === S.UPLOADING && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Upload progress</span>
                <span>{uploadPct}%</span>
              </div>
              <ProgressBar pct={uploadPct} color="bg-violet-500" />
            </div>
          )}

          {step === S.TRANSCRIBING && (
            <p className="text-sky-400 text-xs animate-pulse">
              Whisper is converting your audio to text…
            </p>
          )}

          {step === S.ANALYZING && (
            <p className="text-violet-400 text-xs animate-pulse">
              Gemini AI is evaluating your transcript for CEFR level and IELTS band…
            </p>
          )}
        </div>
      )}

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {step === S.ERROR && (
        <div className="space-y-3">
          <ErrorBanner message={errorMsg} />
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium text-slate-300 border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )}

      {/* ── Transcript preview ─────────────────────────────────────────────── */}
      {transcript && (
        <div
          className="rounded-2xl border border-sky-500/20 p-4 space-y-2"
          style={{ background: 'rgba(14,165,233,0.05)' }}
        >
          <p className="text-[10px] font-bold text-sky-400/70 uppercase tracking-widest">
            Whisper Transcript
          </p>
          <p className="text-slate-300 text-sm leading-relaxed">{transcript}</p>
        </div>
      )}

      {/* ── Audio playback ─────────────────────────────────────────────────── */}
      {audioUrl && step === S.DONE && (
        <div
          className="rounded-2xl border border-white/[0.07] px-4 py-3 space-y-1.5"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Your Recording
          </p>
          <audio src={audioUrl} controls className="w-full h-9" />
        </div>
      )}

      {/* ── Result card ────────────────────────────────────────────────────── */}
      {step === S.DONE && result && (
        <IELTSResultCard
          result={result}
          saved={Boolean(savedId)}
          onReset={handleReset}
        />
      )}

      {/* ── Inline keyframes for the waveform ─────────────────────────────── */}
      <style>{`
        @keyframes waveBar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1.0); }
        }
      `}</style>
    </div>
  )
}
