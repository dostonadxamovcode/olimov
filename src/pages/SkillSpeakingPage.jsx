import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Mic, Clock, ChevronRight, CheckCircle2, RotateCcw, Play, Pause,
  Sparkles, BookOpen, Brain, Zap, Mic2, TrendingUp, MessageSquare,
  XCircle, ArrowRight, Star, Loader2,
} from 'lucide-react';
import { SectionLoader } from '../components/common/Loader';
import { analyzeIELTSSpeaking } from '../services/geminiAI';

const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

const storageKey = (part) => `skillSpeaking_testId_p${part}`;

// ── Countdown timer hook ──────────────────────────────────────────────────────
function useTimer(initialSeconds) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) { setRunning(false); return; }
    const id = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running, seconds]);

  const start  = () => setRunning(true);
  const pause  = () => setRunning(false);
  const reset  = (s) => { setRunning(false); setSeconds(s ?? initialSeconds); };

  return { seconds, running, start, pause, reset };
}

function TimerDisplay({ seconds, isLow }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return (
    <span className={`text-2xl font-black tabular-nums ${isLow ? 'text-red-400' : 'text-white'}`}>
      {mins}:{secs.toString().padStart(2, '0')}
    </span>
  );
}

// ── Part 2: Cue card view with prepare → speak flow ──────────────────────────
function Part2View({ test, onDone, onFinish }) {
  const [phase, setPhase] = useState('prepare'); // 'prepare' | 'speak' | 'done'
  const prepSecs  = test.preparationTime ?? 60;
  const speakSecs = (test.timeLimit ?? 2) * 60;
  const timer = useTimer(prepSecs);

  const [localTranscript, setLocalTranscript] = useState("");
  const localTranscriptRef = useRef("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    localTranscriptRef.current = localTranscript;
  }, [localTranscript]);

  const startListening = useCallback(() => {
    console.log("MIC STARTING");
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition is not supported in this browser.");
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log("MIC STARTED");
      };

      recognition.onresult = (event) => {
        let text = "";
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setLocalTranscript(text);
        console.log("TRANSCRIPT:", text);
      };

      recognition.onend = () => {
        console.log("MIC STOPPED");
      };

      recognition.onerror = (event) => {
        console.error("SpeechRecognition error:", event.error);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Failed to start SpeechRecognition:", e);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }
      recognitionRef.current = null;
    }
  }, []);

  const startPrepare = () => timer.start();
  const startSpeak   = useCallback(() => {
    console.log("START BUTTON CLICKED");
    setLocalTranscript("");
    setPhase('speak');
    timer.reset(speakSecs);
    timer.start();
  }, [speakSecs, timer]);

  useEffect(() => {
    if (phase === 'prepare' && timer.seconds === 0) {
      setPhase('speak');
      timer.reset(speakSecs);
    }
    if (phase === 'speak' && timer.seconds === 0) {
      stopListening();
      console.log("FINISH TEST");
      setPhase('done');
      onFinish?.(localTranscriptRef.current);
    }
  }, [timer.seconds, phase, speakSecs, stopListening, onFinish]);

  const isSpeakingAndRunning = phase === 'speak' && timer.running;

  useEffect(() => {
    if (isSpeakingAndRunning) {
      startListening();
    } else {
      stopListening();
    }
    return () => {
      stopListening();
    };
  }, [isSpeakingAndRunning, startListening, stopListening]);

  useEffect(() => {
    window.startSpeakingRecording = () => {
      console.log("window.startSpeakingRecording called");
      if (phase === 'prepare') {
        startSpeak();
      } else if (phase === 'speak' && !timer.running) {
        timer.start();
      }
    };
    window.stopSpeakingRecording = () => {
      console.log("window.stopSpeakingRecording called");
      if (phase === 'speak') {
        stopListening();
        console.log("FINISH TEST");
        setPhase('done');
        onFinish?.(localTranscriptRef.current);
      }
    };
    return () => {
      delete window.startSpeakingRecording;
      delete window.stopSpeakingRecording;
    };
  }, [phase, timer, startSpeak, stopListening, onFinish]);

  return (
    <div className="space-y-4">
      {/* Cue card */}
      <div className="rounded-2xl border border-purple-500/20 p-6" style={{ background: 'rgba(168,85,247,0.06)', backdropFilter: 'blur(12px)' }}>
        <p className="text-[10px] font-bold text-purple-400/80 uppercase tracking-widest mb-3">Cue Card</p>
        <p className="text-[#c8d6e8] text-sm leading-relaxed whitespace-pre-line">{test.cueCard}</p>
      </div>

      {/* Timer + controls */}
      <div className="rounded-2xl border border-white/[0.08] p-6 text-center" style={{ background: 'rgba(10,16,35,0.7)' }}>
        {phase === 'done' ? (
          <>
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-white font-bold text-lg mb-1">Well done!</p>
            <p className="text-slate-400 text-sm mb-5">You completed the speaking task.</p>
            <div className="flex gap-2.5 justify-center">
              <button type="button" onClick={() => { setPhase('prepare'); timer.reset(prepSecs); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all">
                <RotateCcw className="w-4 h-4" /> Retry
              </button>
              <button type="button" onClick={() => { onFinish?.(localTranscript); onDone(); }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-violet-600 shadow-lg hover:-translate-y-0.5 transition-all">
                More Tests <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              {phase === 'prepare' ? 'Preparation Time' : 'Speaking Time'}
            </p>
            <div className="mb-4">
              <TimerDisplay seconds={timer.seconds} isLow={timer.seconds <= 10} />
            </div>
            <p className="text-slate-400 text-xs mb-5">
              {phase === 'prepare'
                ? 'Make notes. Start the timer when you are ready.'
                : 'Speak clearly about the cue card topic.'}
            </p>
            <div className="flex gap-2.5 justify-center">
              {!timer.running ? (
                <button type="button" onClick={phase === 'prepare' ? startPrepare : startSpeak} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-violet-600 shadow-lg hover:-translate-y-0.5 transition-all">
                  <Play className="w-4 h-4" /> {phase === 'prepare' ? 'Start Preparing' : 'Start Speaking'}
                </button>
              ) : (
                <>
                  <button type="button" onClick={timer.pause} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all">
                    <Pause className="w-4 h-4" /> Pause
                  </button>
                  {phase === 'prepare' && (
                    <button type="button" onClick={startSpeak} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-violet-600 hover:-translate-y-0.5 transition-all">
                      Start Speaking <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Parts 1 & 3: Questions list with per-question timer ───────────────────────
function QuestionsView({ test, onDone, onFinish }) {
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [answering,  setAnswering]    = useState(false);
  const [done,       setDone]         = useState(false);
  const perQuestionSecs = Math.floor(((test.timeLimit ?? 5) * 60) / (test.questions?.length ?? 1));
  const timer = useTimer(perQuestionSecs);

  const questions = test.questions ?? [];

  const [localTranscript, setLocalTranscript] = useState("");
  const [accumulatedTranscript, setAccumulatedTranscript] = useState("");
  const localTranscriptRef = useRef("");
  const accumulatedTranscriptRef = useRef("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    localTranscriptRef.current = localTranscript;
  }, [localTranscript]);

  useEffect(() => {
    accumulatedTranscriptRef.current = accumulatedTranscript;
  }, [accumulatedTranscript]);

  const startListening = useCallback(() => {
    console.log("MIC STARTING");
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition is not supported in this browser.");
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log("MIC STARTED");
      };

      recognition.onresult = (event) => {
        let text = "";
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setLocalTranscript(text);
        console.log("TRANSCRIPT:", text);
      };

      recognition.onend = () => {
        console.log("MIC STOPPED");
      };

      recognition.onerror = (event) => {
        console.error("SpeechRecognition error:", event.error);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Failed to start SpeechRecognition:", e);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }
      recognitionRef.current = null;
    }
  }, []);

  const handleStart = useCallback(() => {
    console.log("START BUTTON CLICKED");
    setLocalTranscript("");
    setAnswering(true);
    timer.start();
  }, [timer]);

  const handleNext = useCallback(() => {
    stopListening();
    
    const updatedAccumulated = (accumulatedTranscriptRef.current + " " + localTranscriptRef.current).trim();
    setAccumulatedTranscript(updatedAccumulated);
    setLocalTranscript("");

    setAnswering(false);
    timer.reset(perQuestionSecs);

    if (currentIdx >= questions.length - 1) {
      console.log("FINISH TEST");
      setDone(true);
      onFinish?.(updatedAccumulated);
    } else {
      console.log("NEXT QUESTION");
      setCurrentIdx(i => i + 1);
    }
  }, [currentIdx, questions.length, stopListening, timer, perQuestionSecs, onFinish]);

  // Synchronize microphone with answering state
  useEffect(() => {
    if (answering) {
      startListening();
    } else {
      stopListening();
    }
    return () => {
      stopListening();
    };
  }, [answering, startListening, stopListening]);

  // Synchronize window methods for tests
  useEffect(() => {
    window.startSpeakingRecording = () => {
      console.log("window.startSpeakingRecording called");
      if (!answering && !done) {
        handleStart();
      }
    };
    window.stopSpeakingRecording = () => {
      console.log("window.stopSpeakingRecording called");
      if (answering && !done) {
        handleNext();
      }
    };
    return () => {
      delete window.startSpeakingRecording;
      delete window.stopSpeakingRecording;
    };
  }, [answering, done, handleStart, handleNext]);

  // Timer expiration effect
  useEffect(() => {
    if (answering && timer.seconds === 0) {
      stopListening();
      const updatedAccumulated = (accumulatedTranscriptRef.current + " " + localTranscriptRef.current).trim();
      setAccumulatedTranscript(updatedAccumulated);
      setLocalTranscript("");
      setAnswering(false);
      timer.reset(perQuestionSecs);
    }
  }, [timer.seconds, answering, perQuestionSecs, stopListening]);

  if (done) {
    return (
      <div className="rounded-2xl border border-white/[0.08] p-8 text-center" style={{ background: 'rgba(10,16,35,0.7)' }}>
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
        <p className="text-white font-bold text-lg mb-1">Great job!</p>
        <p className="text-slate-400 text-sm mb-5">You answered all {questions.length} questions.</p>
        <div className="flex gap-2.5 justify-center">
          <button type="button" onClick={() => { setCurrentIdx(0); setDone(false); timer.reset(perQuestionSecs); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all">
            <RotateCcw className="w-4 h-4" /> Retry
          </button>
          <button type="button" onClick={() => { onFinish?.(accumulatedTranscript); onDone(); }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-violet-600 shadow-lg hover:-translate-y-0.5 transition-all">
            More Tests <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {questions.map((_, i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i < currentIdx ? 'bg-purple-400' : i === currentIdx ? 'bg-purple-500/60' : 'bg-white/10'}`} />
        ))}
        <span className="text-xs text-gray-500 whitespace-nowrap ml-1">{currentIdx + 1}/{questions.length}</span>
      </div>

      {/* Question card */}
      <div className="rounded-2xl border border-purple-500/20 p-6" style={{ background: 'rgba(168,85,247,0.06)' }}>
        <p className="text-[10px] font-bold text-purple-400/80 uppercase tracking-widest mb-3">Question {currentIdx + 1}</p>
        <p className="text-white text-base font-semibold leading-relaxed">{q?.text}</p>
      </div>

      {/* Timer + controls */}
      <div className="rounded-2xl border border-white/[0.08] p-6 text-center" style={{ background: 'rgba(10,16,35,0.7)' }}>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Response Time</p>
        <div className="mb-4">
          <TimerDisplay seconds={timer.seconds} isLow={timer.seconds <= 10} />
        </div>
        <div className="flex gap-2.5 justify-center">
          {!answering ? (
            <button type="button" onClick={handleStart} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-violet-600 shadow-lg hover:-translate-y-0.5 transition-all">
              <Play className="w-4 h-4" /> Start Answering
            </button>
          ) : (
            <>
              <button type="button" onClick={timer.pause} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all">
                <Pause className="w-4 h-4" /> Pause
              </button>
              <button type="button" onClick={handleNext} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-violet-600 hover:-translate-y-0.5 transition-all">
                {currentIdx < questions.length - 1 ? 'Next Question' : 'Finish'} <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Analysis Results Component ────────────────────────────────────────────────
function AnalysisResults({ analysis, analyzing }) {
  if (analyzing) {
    return (
      <div className="rounded-2xl border border-purple-500/20 p-8 text-center" style={{ background: 'rgba(168,85,247,0.06)', backdropFilter: 'blur(12px)' }}>
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
        <p className="text-white font-semibold mb-1">Analyzing your speech...</p>
        <p className="text-slate-400 text-sm">This may take a few seconds</p>
      </div>
    );
  }

  if (!analysis) return null;

  const getScoreColor = (score) => {
    if (score >= 7) return 'text-emerald-400';
    if (score >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 7) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 5) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="space-y-4">
      {/* Score Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* CEFR Level */}
        <div className="rounded-xl border border-purple-500/20 p-4" style={{ background: 'rgba(168,85,247,0.06)' }}>
          <p className="text-[10px] font-bold text-purple-400/70 uppercase tracking-widest mb-2">CEFR Level</p>
          <p className="text-2xl font-black text-white">{analysis.cefrLevel}</p>
        </div>

        {/* IELTS Band */}
        <div className="rounded-xl border border-purple-500/20 p-4" style={{ background: 'rgba(168,85,247,0.06)' }}>
          <p className="text-[10px] font-bold text-purple-400/70 uppercase tracking-widest mb-2">IELTS Band</p>
          <p className={`text-2xl font-black ${getScoreColor(analysis.ieltsBand)}`}>{analysis.ieltsBand}</p>
        </div>

        {/* Word Count */}
        <div className="rounded-xl border border-white/[0.08] p-4" style={{ background: 'rgba(10,16,35,0.7)' }}>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Word Count</p>
          <p className="text-2xl font-black text-white">{analysis.wordCount}</p>
        </div>

        {/* Grammar Score */}
        <div className={`rounded-xl border p-4 ${getScoreBg(analysis.grammarScore)}`}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Grammar</p>
          <p className={`text-2xl font-black ${getScoreColor(analysis.grammarScore)}`}>{analysis.grammarScore}/9</p>
        </div>

        {/* Vocabulary Score */}
        <div className={`rounded-xl border p-4 ${getScoreBg(analysis.vocabularyScore)}`}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Vocabulary</p>
          <p className={`text-2xl font-black ${getScoreColor(analysis.vocabularyScore)}`}>{analysis.vocabularyScore}/9</p>
        </div>

        {/* Fluency Score */}
        <div className={`rounded-xl border p-4 ${getScoreBg(analysis.fluencyScore)}`}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Fluency</p>
          <p className={`text-2xl font-black ${getScoreColor(analysis.fluencyScore)}`}>{analysis.fluencyScore}/9</p>
        </div>

        {/* Pronunciation Score */}
        <div className={`rounded-xl border p-4 ${getScoreBg(analysis.pronunciationScore)}`}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Pronunciation</p>
          <p className={`text-2xl font-black ${getScoreColor(analysis.pronunciationScore)}`}>{analysis.pronunciationScore}/9</p>
        </div>

        {/* Grammar Mistakes */}
        <div className="rounded-xl border border-white/[0.08] p-4" style={{ background: 'rgba(10,16,35,0.7)' }}>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Mistakes</p>
          <p className="text-2xl font-black text-white">{analysis.grammarMistakes}</p>
        </div>
      </div>

      {/* Overall Feedback */}
      <div className="rounded-2xl border border-purple-500/20 p-5" style={{ background: 'rgba(168,85,247,0.06)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <p className="text-xs font-bold text-purple-400 uppercase tracking-widest">Overall Feedback</p>
        </div>
        <p className="text-[#c8d6e8] text-sm leading-relaxed">{analysis.overallFeedback}</p>
      </div>

      {/* Grammar Mistakes */}
      {analysis.mistakes && analysis.mistakes.length > 0 && (
        <div className="rounded-2xl border border-red-500/20 p-5" style={{ background: 'rgba(239,68,68,0.04)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-4 h-4 text-red-400" />
            <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Grammar Mistakes</p>
          </div>
          <ul className="space-y-2">
            {analysis.mistakes.map((mistake, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-red-300/80">
                <span className="text-red-400 mt-1">•</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvement Tips */}
      {analysis.improvementTips && analysis.improvementTips.length > 0 && (
        <div className="rounded-2xl border border-yellow-500/20 p-5" style={{ background: 'rgba(234,179,8,0.04)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-yellow-400" />
            <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Improvement Tips</p>
          </div>
          <ul className="space-y-2">
            {analysis.improvementTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-yellow-300/80">
                <Star className="w-3.5 h-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improved Answer */}
      {analysis.improvedAnswer && (
        <div className="rounded-2xl border border-emerald-500/20 p-5" style={{ background: 'rgba(16,185,129,0.04)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Improved Answer</p>
          </div>
          <p className="text-[#c8d6e8] text-sm leading-relaxed whitespace-pre-line">{analysis.improvedAnswer}</p>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SkillSpeakingPage() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const partParam      = searchParams.get('part') ?? '1';

  const [test,      setTest]      = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setTest(null);
    setLoadError(false);

    const load = async () => {
      try {
        const { collection, getDocs, query, where, doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');

        const savedId = localStorage.getItem(storageKey(partParam));
        if (savedId) {
          const snap = await getDoc(doc(db, 'skillSpeakingTests', savedId));
          if (!cancelled && snap.exists()) { setTest({ id: snap.id, ...snap.data() }); return; }
          localStorage.removeItem(storageKey(partParam));
        }

        const colSnap = await getDocs(
          query(collection(db, 'skillSpeakingTests'), where('part', '==', Number(partParam)))
        );
        if (cancelled) return;
        if (!colSnap.empty) {
          const all    = colSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          const chosen = all[Math.floor(Math.random() * all.length)];
          localStorage.setItem(storageKey(partParam), chosen.id);
          setTest(chosen);
        } else {
          setLoadError(true);
        }
      } catch (e) {
        if (!cancelled) { console.error('Speaking test load:', e); setLoadError(true); }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [partParam]);

  const handleExit = useCallback(() => {
    localStorage.removeItem(storageKey(partParam));
    navigate('/skill-tests');
  }, [partParam, navigate]);

  const analyzeTranscript = useCallback(async (textToAnalyze) => {
    const text = textToAnalyze !== undefined ? textToAnalyze : transcript;
    if (!text || !text.trim()) {
      console.log("No transcript to analyze.");
      return;
    }
    
    setAnalyzing(true);
    try {
      const result = await analyzeIELTSSpeaking(text);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  }, [transcript]);

  const handleFinish = useCallback((finalText) => {
    setTranscript(finalText || "");
    analyzeTranscript(finalText);
  }, [analyzeTranscript]);

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #020812 0%, #060e1c 45%, #020812 100%)' }}>
        {loadError ? (
          <div className="text-center px-6">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-5"><Mic className="w-7 h-7 text-purple-400" /></div>
            <p className="text-white font-semibold mb-2">Test topilmadi</p>
            <p className="text-slate-400 text-sm mb-6">Part {partParam} uchun speaking test hali qo'shilmagan.</p>
            <button onClick={handleExit} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-slate-300 hover:bg-white/10 transition-all text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Orqaga
            </button>
          </div>
        ) : <SectionLoader text="Test yuklanmoqda…" />}
      </div>
    );
  }

  const isPart2 = Number(test.part) === 2;

  return (
    <div className="relative min-h-screen" style={{ background: 'linear-gradient(160deg, #020812 0%, #060e1c 45%, #020812 100%)' }}>
      <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-purple-700/[0.05] blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-violet-700/[0.04] blur-3xl pointer-events-none" />

      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-white/[0.06]" style={{ background: 'rgba(3,9,22,0.88)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-[76px] flex items-center gap-5">
          <button type="button" onClick={handleExit} className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors group flex-shrink-0 px-3 py-2 rounded-lg hover:bg-white/[0.06]">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span className="hidden sm:inline">Skills</span>
          </button>
          <div className="w-px h-5 bg-white/10 flex-shrink-0" />
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-purple-500/15 border border-purple-500/25 flex-shrink-0">
              <Mic className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-purple-400/70 uppercase tracking-widest leading-none mb-0.5">Speaking Part {partParam}</p>
              <span className="text-white font-semibold text-sm truncate block leading-tight">{test.title}</span>
            </div>
          </div>
          {test.topic && (
            <span className="hidden sm:inline text-xs px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-gray-500 flex-shrink-0">{test.topic}</span>
          )}
        </div>
      </div>

      {/* Instructions banner */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-purple-500/[0.15] text-sm text-purple-300/80" style={{ background: 'rgba(168,85,247,0.06)' }}>
          <Mic className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            {isPart2
              ? 'Read the cue card. Prepare for the allotted time, then speak for 1–2 minutes.'
              : `Answer each question aloud. You have approximately ${Math.floor(((test.timeLimit ?? 5) * 60) / (test.questions?.length ?? 1))} seconds per question.`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        {isPart2
          ? <Part2View test={test} onDone={handleExit} onFinish={handleFinish} />
          : <QuestionsView test={test} onDone={handleExit} onFinish={handleFinish} />
        }
        
        {/* Analysis Results */}
        <div className="mt-8">
          <AnalysisResults analysis={analysis} analyzing={analyzing} />
        </div>
      </div>
    </div>
  );
}
