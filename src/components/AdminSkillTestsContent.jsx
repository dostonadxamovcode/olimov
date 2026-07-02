import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, BookOpen, Headphones, PenLine, Mic, Trash2, Pencil, Clock,
  AlignLeft, Eye, Layers, CheckSquare,
} from 'lucide-react';
import { Loader, ButtonSpinner } from './common/Loader';
import { toastError, toastSuccess } from '../utils/errorHandler';

// ── Skill tab config ──────────────────────────────────────────────────────────
const SKILL_TABS = [
  {
    id:        'reading',
    label:     'Reading',
    icon:      BookOpen,
    col:       'skillReadingTests',
    col2:      'skillReadingPart2Tests',   // extra collection for matching tests
    addRoute:  '/admin/skill-tests/add',
    editRoute: (id, col) => col === 'skillReadingPart2Tests' ? `/admin/skill-tests/edit/${id}?part=2` : `/admin/skill-tests/edit/${id}`,
    color:     'text-blue-400',
    pill:      'bg-blue-500/15 border-blue-500/25 text-blue-400',
    dot:       'bg-blue-400',
  },
  {
    id:        'listening',
    label:     'Listening',
    icon:      Headphones,
    col:       'skillListeningTests',
    addRoute:  '/admin/skill-tests/listening/add',
    editRoute: (id) => `/admin/skill-tests/listening/edit/${id}`,
    color:     'text-emerald-400',
    pill:      'bg-emerald-500/15 border-emerald-500/25 text-emerald-400',
    dot:       'bg-emerald-400',
  },
  {
    id:        'writing',
    label:     'Writing',
    icon:      PenLine,
    col:       'skillWritingTests',
    addRoute:  '/admin/skill-tests/writing/add',
    editRoute: (id) => `/admin/skill-tests/writing/edit/${id}`,
    partLabel: 'Task',
    color:     'text-amber-400',
    pill:      'bg-amber-500/15 border-amber-500/25 text-amber-400',
    dot:       'bg-amber-400',
  },
  {
    id:        'speaking',
    label:     'Speaking',
    icon:      Mic,
    col:       'skillSpeakingTests',
    addRoute:  '/admin/skill-tests/speaking/add',
    editRoute: (id) => `/admin/skill-tests/speaking/edit/${id}`,
    color:     'text-purple-400',
    pill:      'bg-purple-500/15 border-purple-500/25 text-purple-400',
    dot:       'bg-purple-400',
  },
];

// ── Level colour map ──────────────────────────────────────────────────────────
const LEVEL_COLOR = {
  'A2':  { pill: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',       dot: 'bg-cyan-400'    },
  'B1':  { pill: 'bg-violet-500/15 text-violet-400 border-violet-500/25', dot: 'bg-violet-400'  },
  'B1+': { pill: 'bg-violet-500/15 text-violet-400 border-violet-500/25', dot: 'bg-violet-400'  },
  'B2':  { pill: 'bg-orange-500/15 text-orange-400 border-orange-500/25', dot: 'bg-orange-400'  },
  'B2+': { pill: 'bg-orange-500/15 text-orange-400 border-orange-500/25', dot: 'bg-orange-400'  },
  'C1':  { pill: 'bg-rose-500/15 text-rose-400 border-rose-500/25',       dot: 'bg-rose-400'    },
};
const DEFAULT_COLOR = { pill: 'bg-white/8 text-slate-400 border-white/10', dot: 'bg-slate-400' };

// ── Generic test meta (footer info) ──────────────────────────────────────────
function testMeta(test, skillId) {
  const col   = test._collection ?? '';
  const time  = test.timeLimit ?? 0;

  if (col === 'skillReadingPart2Tests') {
    return (
      <>
        <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{test.articles?.length ?? 8} ads</span>
        <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3" />{test.questions?.length ?? 0} Q</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{time} min</span>
      </>
    );
  }
  if (skillId === 'writing') {
    return (
      <>
        <span className="flex items-center gap-1"><AlignLeft className="w-3 h-3" />{test.wordLimit ?? 150}+ words</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{time} min</span>
      </>
    );
  }
  if (skillId === 'speaking') {
    const qCount = test.questions?.length ?? 0;
    return (
      <>
        {test.cueCard
          ? <span className="flex items-center gap-1"><AlignLeft className="w-3 h-3" />Cue card</span>
          : <span className="flex items-center gap-1"><AlignLeft className="w-3 h-3" />{qCount} Q</span>
        }
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{time} min</span>
      </>
    );
  }
  // Reading Part 1 + Listening
  const blanks = test.answers?.length ?? 0;
  return (
    <>
      <span className="flex items-center gap-1"><AlignLeft className="w-3 h-3" />{blanks} blanks</span>
      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{time} min</span>
    </>
  );
}

// ── Generic test card ─────────────────────────────────────────────────────────
function SkillTestCard({ test, skillId, skillTab, onEdit, onPreview, onDelete, deleting }) {
  const colors      = LEVEL_COLOR[test.level] ?? DEFAULT_COLOR;
  const isMatching  = test._collection === 'skillReadingPart2Tests';
  const partLabel   = skillTab.partLabel ?? 'Part';
  const partNum     = test.part ?? (test.taskType ?? '—');

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white/[0.035] border border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.055] transition-all duration-200 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div className="flex items-start gap-2">
          <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 shrink-0">
            <span className="text-[8px] font-bold text-blue-400 leading-none tracking-widest">{partLabel.toUpperCase()}</span>
            <span className="text-[15px] font-black text-blue-300 leading-none mt-0.5">{partNum}</span>
          </div>
          {isMatching && (
            <span className="mt-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              Matching
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button onClick={() => onPreview(test)} title="Preview" className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-colors">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onEdit(test.id, test._collection)} title="Edit" className="w-7 h-7 rounded-lg flex items-center justify-center text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/12 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(test.id, test._collection)} disabled={deleting === test.id} title="Delete" className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/12 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {deleting === test.id ? <ButtonSpinner /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="px-4 pb-3 flex-1">
        <h3 className="text-sm font-semibold text-slate-100 leading-snug line-clamp-2">{test.title}</h3>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 pb-4 pt-2 border-t border-white/[0.05] mt-auto">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${colors.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
          {test.level ?? '—'}
        </span>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          {testMeta(test, skillId)}
        </div>
      </div>
    </div>
  );
}

// ── Preview modal ─────────────────────────────────────────────────────────────
function PreviewModal({ test, skillTab, onClose, onEdit }) {
  if (!test || !skillTab) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f1a28] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/12 border border-blue-500/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">
                {skillTab.partLabel ?? 'Part'} {test.part} · {skillTab.label}
              </p>
              <p className="text-sm font-semibold text-slate-100">{test.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/6 transition-colors text-lg leading-none">×</button>
        </div>

        <div className="flex items-center gap-4 px-5 py-3 bg-white/[0.02] border-b border-white/[0.04]">
          {[
            { label: 'Level', value: test.level ?? '—' },
            { label: 'Time',  value: `${test.timeLimit} min` },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{s.label}</p>
              <p className="text-sm font-bold text-slate-100 mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 max-h-64 overflow-y-auto">
          {test.prompt ? (
            <p className="text-sm text-slate-300 leading-relaxed">{test.prompt}</p>
          ) : test.cueCard ? (
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{test.cueCard}</p>
          ) : (
            <p className="text-xs text-slate-600 italic">(Content stored in Firestore — edit to view full details)</p>
          )}
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-white/[0.06]">
          <button onClick={() => { onEdit(test.id, test._collection); onClose(); }} className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-violet-500 hover:opacity-90 transition-opacity">
            Edit Test
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 border border-white/8 hover:bg-white/5 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Skill tab content ─────────────────────────────────────────────────────────
function SkillTabContent({ tab }) {
  const navigate             = useNavigate();
  const [tests,    setTests]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [preview,  setPreview]  = useState(null);

  const loadTests = useCallback(async () => {
    setLoading(true);
    try {
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const { db } = await import('../firebase');

      const isReading = tab.id === 'reading';

      if (isReading) {
        const [snap1, snap2] = await Promise.all([
          getDocs(query(collection(db, 'skillReadingTests'),      orderBy('part', 'asc'))),
          getDocs(query(collection(db, 'skillReadingPart2Tests'), orderBy('createdAt', 'asc'))),
        ]);
        const p1 = snap1.docs.map(d => ({ id: d.id, ...d.data(), _collection: 'skillReadingTests' }));
        const p2 = snap2.docs.map(d => ({ id: d.id, ...d.data(), _collection: 'skillReadingPart2Tests' }));
        setTests([...p1, ...p2].sort((a, b) => (a.part ?? 0) - (b.part ?? 0)));
      } else {
        const snap = await getDocs(query(collection(db, tab.col), orderBy('part', 'asc')));
        setTests(snap.docs.map(d => ({ id: d.id, ...d.data(), _collection: tab.col })));
      }
    } catch (e) {
      console.error('loadTests:', e);
      toastError('Failed to load tests');
    } finally {
      setLoading(false);
    }
  }, [tab.id, tab.col]);

  useEffect(() => { loadTests(); }, [loadTests]);

  const handleEdit = (id, col) => navigate(tab.editRoute(id, col));

  const handleDelete = async (id, col) => {
    if (!window.confirm('Delete this test? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db }             = await import('../firebase');
      await deleteDoc(doc(db, col ?? tab.col, id));
      toastSuccess('Test deleted');
      setTests(prev => prev.filter(t => t.id !== id));
    } catch {
      toastError('Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const Icon = tab.icon;

  return (
    <div>
      {/* Sub-header */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Icon className={`w-5 h-5 ${tab.color}`} />
            {tab.label} Tests
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">{tests.length} test{tests.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={() => navigate(tab.addRoute)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-violet-500 hover:opacity-90 transition-opacity shrink-0`}
        >
          <Plus className="w-4 h-4" /> Add Test
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader size="lg" text="Loading tests…" />
        </div>
      )}

      {!loading && tests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-white/8 bg-white/[0.015]">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-4">
            <Icon className={`w-5 h-5 ${tab.color}`} />
          </div>
          <h3 className="text-sm font-semibold text-slate-300 mb-1">No {tab.label.toLowerCase()} tests yet</h3>
          <p className="text-xs text-slate-500 mb-5">Click "Add Test" to create the first one</p>
          <button onClick={() => navigate(tab.addRoute)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-violet-500 hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Add Test
          </button>
        </div>
      )}

      {!loading && tests.length > 0 && (
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
          {tests.map(test => (
            <SkillTestCard
              key={`${test._collection}-${test.id}`}
              test={test}
              skillId={tab.id}
              skillTab={tab}
              onEdit={handleEdit}
              onPreview={setPreview}
              onDelete={handleDelete}
              deleting={deleting}
            />
          ))}
        </div>
      )}

      <PreviewModal test={preview} skillTab={tab} onClose={() => setPreview(null)} onEdit={handleEdit} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminSkillTestsContent() {
  const [activeTab, setActiveTab] = useState('reading');
  const currentTab = SKILL_TABS.find(t => t.id === activeTab) ?? SKILL_TABS[0];

  return (
    <div className="pb-20">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-100">Skill Tests</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage tests for all IELTS skill types</p>
      </div>

      {/* Skill type tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-8 w-fit">
        {SKILL_TABS.map(tab => {
          const TabIcon    = tab.icon;
          const isActive   = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-white/[0.1] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
              }`}
            >
              <TabIcon className={`w-4 h-4 ${isActive ? tab.color : ''}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content — remount on tab switch so it re-fetches */}
      <SkillTabContent key={activeTab} tab={currentTab} />
    </div>
  );
}
