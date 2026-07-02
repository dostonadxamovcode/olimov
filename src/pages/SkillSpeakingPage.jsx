import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Mic, Clock, ChevronRight, CheckCircle2, RotateCcw, Play, Pause,
} from 'lucide-react';
import { SectionLoader } from '../components/common/Loader';

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
function Part2View({ test, onDone }) {
  const [phase, setPhase] = useState('prepare'); // 'prepare' | 'speak' | 'done'
  const prepSecs  = test.preparationTime ?? 60;
  const speakSecs = (test.timeLimit ?? 2) * 60;
  const timer = useTimer(prepSecs);

  useEffect(() => {
    if (phase === 'prepare' && timer.seconds === 0) {
      setPhase('speak');
      timer.reset(speakSecs);
    }
    if (phase === 'speak' && timer.seconds === 0) {
      setPhase('done');
    }
  }, [timer.seconds, phase]);

  const startPrepare = () => timer.start();
  const startSpeak   = () => { setPhase('speak'); timer.reset(speakSecs); timer.start(); };

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
              <button type="button" onClick={onDone} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-violet-600 shadow-lg hover:-translate-y-0.5 transition-all">
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
function QuestionsView({ test, onDone }) {
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [answering,  setAnswering]    = useState(false);
  const [done,       setDone]         = useState(false);
  const perQuestionSecs = Math.floor(((test.timeLimit ?? 5) * 60) / (test.questions?.length ?? 1));
  const timer = useTimer(perQuestionSecs);

  const questions = test.questions ?? [];

  useEffect(() => {
    if (answering && timer.seconds === 0) {
      setAnswering(false);
      timer.reset(perQuestionSecs);
    }
  }, [timer.seconds, answering]);

  const handleStart = () => { setAnswering(true); timer.start(); };
  const handleNext  = () => {
    setAnswering(false);
    timer.reset(perQuestionSecs);
    if (currentIdx >= questions.length - 1) { setDone(true); }
    else { setCurrentIdx(i => i + 1); }
  };

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
          <button type="button" onClick={onDone} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-violet-600 shadow-lg hover:-translate-y-0.5 transition-all">
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SkillSpeakingPage() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const partParam      = searchParams.get('part') ?? '1';

  const [test,      setTest]      = useState(null);
  const [loadError, setLoadError] = useState(false);

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
          ? <Part2View test={test} onDone={handleExit} />
          : <QuestionsView test={test} onDone={handleExit} />
        }
      </div>
    </div>
  );
}
