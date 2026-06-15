import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, BookOpen, Trash2, Pencil, Clock, AlignLeft, Eye,
  Layers, CheckSquare,
} from 'lucide-react';
import { Loader, ButtonSpinner } from './common/Loader';
import { toastError, toastSuccess } from '../utils/errorHandler';

// ── Level colours ─────────────────────────────────────────────────────────────
const LEVEL_COLOR = {
  'A2':  { pill: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',       dot: 'bg-cyan-400'    },
  'B1':  { pill: 'bg-violet-500/15 text-violet-400 border-violet-500/25', dot: 'bg-violet-400'  },
  'B1+': { pill: 'bg-violet-500/15 text-violet-400 border-violet-500/25', dot: 'bg-violet-400'  },
  'B2':  { pill: 'bg-orange-500/15 text-orange-400 border-orange-500/25', dot: 'bg-orange-400'  },
  'B2+': { pill: 'bg-orange-500/15 text-orange-400 border-orange-500/25', dot: 'bg-orange-400'  },
  'C1':  { pill: 'bg-rose-500/15 text-rose-400 border-rose-500/25',       dot: 'bg-rose-400'    },
};
const DEFAULT_COLOR = { pill: 'bg-white/8 text-slate-400 border-white/10', dot: 'bg-slate-400' };

// ── Test card ─────────────────────────────────────────────────────────────────
function TestCard({ test, onEdit, onPreview, onDelete, deleting }) {
  const colors    = LEVEL_COLOR[test.level] ?? DEFAULT_COLOR;
  const isMatching = test._collection === 'skillReadingPart2Tests';
  const blanks    = test.answers?.length ?? 0;
  const qCount    = test.questions?.length ?? 0;

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white/[0.035] border border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.055] transition-all duration-200 overflow-hidden">

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Card header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        {/* Part + type badge */}
        <div className="flex items-start gap-2">
          <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 shrink-0">
            <span className="text-[8px] font-bold text-blue-400 leading-none tracking-widest">PART</span>
            <span className="text-[15px] font-black text-blue-300 leading-none mt-0.5">{test.part}</span>
          </div>
          {isMatching && (
            <span className="mt-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              Matching
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={() => onPreview(test)}
            title="Preview"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEdit(test.id, test._collection)}
            title="Edit"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/12 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(test.id, test._collection)}
            disabled={deleting === test.id}
            title="Delete"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/12 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {deleting === test.id ? <ButtonSpinner /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="px-4 pb-3 flex-1">
        <h3 className="text-sm font-semibold text-slate-100 leading-snug line-clamp-2">
          {test.title}
        </h3>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 pb-4 pt-2 border-t border-white/[0.05] mt-auto">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${colors.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
          {test.level ?? '—'}
        </span>

        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          {isMatching ? (
            <>
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {test.articles?.length ?? 8} ads
              </span>
              <span className="flex items-center gap-1">
                <CheckSquare className="w-3 h-3" />
                {qCount} Q
              </span>
            </>
          ) : (
            <span className="flex items-center gap-1">
              <AlignLeft className="w-3 h-3" />
              {blanks} blanks
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {test.timeLimit} min
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Preview modal ─────────────────────────────────────────────────────────────
function PreviewModal({ test, onClose, onEdit }) {
  if (!test) return null;
  const isMatching = test._collection === 'skillReadingPart2Tests';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f1a28] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/12 border border-blue-500/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">
                Part {test.part}{isMatching ? ' · Matching' : ' · Fill Blanks'}
              </p>
              <p className="text-sm font-semibold text-slate-100">{test.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/6 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 px-5 py-3 bg-white/[0.02] border-b border-white/[0.04]">
          {isMatching ? [
            { label: 'Level',     value: test.level ?? '—' },
            { label: 'Articles',  value: test.articles?.length ?? 8 },
            { label: 'Questions', value: test.questions?.length ?? 0 },
            { label: 'Time',      value: `${test.timeLimit} min` },
          ] : [
            { label: 'Level',  value: test.level ?? '—' },
            { label: 'Blanks', value: test.answers?.length ?? 0 },
            { label: 'Time',   value: `${test.timeLimit} min` },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{s.label}</p>
              <p className="text-sm font-bold text-slate-100 mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="px-5 py-4 max-h-64 overflow-y-auto space-y-3">
          {isMatching ? (
            <>
              {/* Articles preview */}
              {(test.articles ?? []).slice(0, 3).map(a => (
                <div key={a.id} className="flex gap-2 text-xs">
                  <span className="w-5 h-5 rounded bg-blue-500/15 text-blue-300 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                    {a.id}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-300">
                      {a.company || a.title || `Article ${a.id}`}
                      {(a.role) && <span className="font-normal text-slate-500"> — {a.role}</span>}
                    </p>
                    <p className="text-slate-500 leading-relaxed line-clamp-2">{a.description || a.content}</p>
                  </div>
                </div>
              ))}
              {(test.articles?.length ?? 0) > 3 && (
                <p className="text-xs text-slate-600 italic">
                  + {test.articles.length - 3} more articles…
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line italic text-slate-600">
              (Passage stored in Firestore — edit to view full text)
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 py-4 border-t border-white/[0.06]">
          <button
            onClick={() => { onEdit(test.id, test._collection); onClose(); }}
            className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-violet-500 hover:opacity-90 transition-opacity"
          >
            Edit Test
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 border border-white/8 hover:bg-white/5 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminSkillTestsContent() {
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

      // Load both collections in parallel
      const [snapP1, snapP2] = await Promise.all([
        getDocs(query(collection(db, 'skillReadingTests'),      orderBy('part', 'asc'))),
        getDocs(query(collection(db, 'skillReadingPart2Tests'), orderBy('createdAt', 'asc'))),
      ]);

      const p1 = snapP1.docs.map(d => ({
        id: d.id,
        ...d.data(),
        _collection: 'skillReadingTests',
      }));
      const p2 = snapP2.docs.map(d => ({
        id: d.id,
        ...d.data(),
        _collection: 'skillReadingPart2Tests',
      }));

      // Combine and sort by part
      const all = [...p1, ...p2].sort((a, b) => (a.part ?? 0) - (b.part ?? 0));
      setTests(all);
    } catch (e) {
      console.error('loadTests:', e);
      toastError('Failed to load tests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTests(); }, [loadTests]);

  const handleEdit = (id, col) => {
    if (col === 'skillReadingPart2Tests') {
      navigate(`/admin/skill-tests/edit/${id}?part=2`);
    } else {
      navigate(`/admin/skill-tests/edit/${id}`);
    }
  };

  const handleDelete = async (id, col) => {
    if (!window.confirm('Delete this test? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db }             = await import('../firebase');
      await deleteDoc(doc(db, col, id));
      toastSuccess('Test deleted');
      setTests(prev => prev.filter(t => t.id !== id));
    } catch {
      toastError('Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  // Stats
  const p1Tests = tests.filter(t => t._collection === 'skillReadingTests');
  const p2Tests = tests.filter(t => t._collection === 'skillReadingPart2Tests');
  const avgBlanks = p1Tests.length
    ? Math.round(p1Tests.reduce((s, t) => s + (t.answers?.length ?? 0), 0) / p1Tests.length)
    : 0;

  return (
    <div className="pb-20">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Skill Reading Tests</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {p1Tests.length} fill-in-blanks · {p2Tests.length} matching
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/skill-tests/add')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white
            bg-gradient-to-r from-blue-500 to-violet-500 hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Test
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader size="lg" text="Loading tests…" />
        </div>
      )}

      {/* Empty */}
      {!loading && tests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-white/8 bg-white/[0.015]">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-4">
            <BookOpen className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-300 mb-1">No skill tests yet</h3>
          <p className="text-xs text-slate-500 mb-5">Click "Add Test" to create the first one</p>
          <button
            onClick={() => navigate('/admin/skill-tests/add')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white
              bg-gradient-to-r from-blue-500 to-violet-500 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Test
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && tests.length > 0 && (
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
          {tests.map(test => (
            <TestCard
              key={`${test._collection}-${test.id}`}
              test={test}
              onEdit={handleEdit}
              onPreview={setPreview}
              onDelete={handleDelete}
              deleting={deleting}
            />
          ))}
        </div>
      )}

      {/* Bottom stats bar */}
      {!loading && tests.length > 0 && (
        <div className="fixed bottom-0 left-0 md:left-[220px] right-0 h-14 flex items-center gap-3 px-6 bg-[#0d1b2a]/95 backdrop-blur-md border-t border-white/[0.04] z-[100]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.04] text-xs">
            <span className="text-slate-500 font-medium">Total</span>
            <span className="text-slate-100 font-semibold">{tests.length}</span>
          </div>
          {p1Tests.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.04] text-xs">
              <span className="text-slate-500 font-medium">Fill-blanks avg</span>
              <span className="text-slate-100 font-semibold">{avgBlanks}</span>
            </div>
          )}
          {p2Tests.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.04] text-xs">
              <span className="text-slate-500 font-medium">Matching tests</span>
              <span className="text-emerald-300 font-semibold">{p2Tests.length}</span>
            </div>
          )}
        </div>
      )}

      {/* Preview modal */}
      <PreviewModal
        test={preview}
        onClose={() => setPreview(null)}
        onEdit={handleEdit}
      />
    </div>
  );
}
