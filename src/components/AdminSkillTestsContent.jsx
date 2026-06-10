import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Trash2, Pencil, Target } from 'lucide-react';
import { Loader, ButtonSpinner } from './common/Loader';
import { toastError, toastSuccess } from '../utils/errorHandler';

export default function AdminSkillTestsContent() {
  const navigate             = useNavigate();
  const [tests,    setTests]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(null);

  const loadTests = useCallback(async () => {
    setLoading(true);
    try {
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      const snap = await getDocs(
        query(collection(db, 'skillReadingTests'), orderBy('part', 'asc'))
      );
      setTests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('loadTests:', e);
      toastError('Failed to load tests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTests(); }, [loadTests]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this test? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db }             = await import('../firebase');
      await deleteDoc(doc(db, 'skillReadingTests', id));
      toastSuccess('Test deleted');
      setTests(prev => prev.filter(t => t.id !== id));
    } catch {
      toastError('Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const LEVEL_COLOR = {
    'A2':  'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    'B1':  'bg-violet-500/15 text-violet-400 border-violet-500/20',
    'B1+': 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    'B2':  'bg-orange-500/15 text-orange-400 border-orange-500/20',
    'B2+': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    'C1':  'bg-rose-500/15 text-rose-400 border-rose-500/20',
  };

  return (
    <div className="pb-20">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Skill Reading Tests</h1>
          <p className="text-sm text-slate-500 mt-1">Fill-in-the-blanks reading tests</p>
        </div>
        <button
          onClick={() => navigate('/admin/skill-tests/add')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
            bg-gradient-to-r from-blue-500 to-violet-500 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add New Test
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
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
          <BookOpen className="w-10 h-10 text-slate-700 mb-4" />
          <h3 className="text-base font-semibold text-slate-300 mb-1.5">No skill tests yet</h3>
          <p className="text-sm text-slate-500 mb-5">Click "Add New Test" to create the first one</p>
          <button
            onClick={() => navigate('/admin/skill-tests/add')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white
              bg-gradient-to-r from-blue-500 to-violet-500 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add New Test
          </button>
        </div>
      )}

      {/* List */}
      {!loading && tests.length > 0 && (
        <div className="flex flex-col gap-3">
          {tests.map(test => (
            <div
              key={test.id}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/8 hover:border-white/12 transition-colors animate-fadeInUp"
            >
              {/* Part badge */}
              <div className="w-11 h-11 rounded-xl shrink-0 flex flex-col items-center justify-center bg-blue-500/10 border border-blue-500/20">
                <span className="text-[9px] font-bold text-blue-400 leading-none">PART</span>
                <span className="text-base font-black text-blue-300 leading-none">{test.part}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-100 truncate mb-1">{test.title}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${LEVEL_COLOR[test.level] ?? 'bg-white/5 text-slate-400 border-white/10'}`}>
                    {test.level}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {test.answers?.length ?? 0} blanks · {test.timeLimit} min
                  </span>
                </div>
              </div>

              {/* Target icon */}
              <Target className="w-4 h-4 text-slate-700 shrink-0 hidden sm:block" />

              {/* Edit */}
              <button
                onClick={() => navigate(`/admin/skill-tests/edit/${test.id}`)}
                title="Edit"
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                  bg-indigo-500/8 text-indigo-400 hover:bg-indigo-500/15 transition-colors border border-indigo-500/20"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDelete(test.id)}
                disabled={deleting === test.id}
                title="Delete"
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                  bg-red-500/8 text-red-400 hover:bg-red-500/15 transition-colors border border-red-500/20
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting === test.id ? <ButtonSpinner /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
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
        </div>
      )}
    </div>
  );
}
