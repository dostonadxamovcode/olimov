import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Trash2, AlertCircle, CheckCircle, Pencil } from 'lucide-react';
import { Loader, ButtonSpinner } from './common/Loader';

export default function AdminSkillTestsContent() {
  const navigate             = useNavigate();
  const [tests,    setTests]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [toast,    setToast]    = useState(null);

  // ── Load ────────────────────────────────────────────────────────────────────
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
      showToast('err', 'Failed to load tests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTests(); }, [loadTests]);

  function showToast(type, msg) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this test? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db }             = await import('../firebase');
      await deleteDoc(doc(db, 'skillReadingTests', id));
      showToast('ok', 'Test deleted');
      setTests(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      showToast('err', 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'relative' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 18px', borderRadius: 12,
          background: toast.type === 'ok' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'ok' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: toast.type === 'ok' ? '#86efac' : '#fca5a5',
          fontSize: 13, fontWeight: 500, backdropFilter: 'blur(12px)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        }}>
          {toast.type === 'ok' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>Skill Reading Tests</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Fill-in-the-blanks reading tests</p>
        </div>
        <button
          onClick={() => navigate('/admin/skill-tests/add')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: '#fff', fontWeight: 600, fontSize: 14,
          }}
        >
          <Plus size={16} />
          Add New Test
        </button>
      </div>

      {/* ── List ── */}
      {loading ? (
        <div style={{ padding: '40px 0' }}>
          <Loader size="md" text="Loading tests…" />
        </div>
      ) : tests.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
          border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 14,
        }}>
          <BookOpen size={40} color="#1e3a5f" style={{ marginBottom: 14 }} />
          <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: '#334155' }}>No skill tests yet</p>
          <p style={{ margin: 0, fontSize: 13, color: '#1e3a5f' }}>Click "Add New Test" to create the first one</p>
        </div>
      ) : (
        <>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: '#475569' }}>
            {tests.length} test{tests.length !== 1 ? 's' : ''}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tests.map(test => (
              <div key={test.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
              }}>

                {/* Part badge */}
                <div style={{
                  width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 11, color: '#60a5fa',
                }}>
                  P{test.part}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {test.title}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', background: 'rgba(59,130,246,0.1)', padding: '2px 7px', borderRadius: 4 }}>
                      {test.level}
                    </span>
                    <span style={{ fontSize: 11, color: '#475569' }}>
                      {test.answers?.length ?? 0} blanks · {test.timeLimit} min
                    </span>
                  </div>
                </div>

                {/* Edit */}
                <button
                  onClick={() => navigate(`/admin/skill-tests/edit/${test.id}`)}
                  title="Edit test"
                  style={{
                    width: 34, height: 34, borderRadius: 8, border: 'none',
                    background: 'rgba(99,102,241,0.08)', color: '#818cf8',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Pencil size={13} />
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(test.id)}
                  disabled={deleting === test.id}
                  title="Delete test"
                  style={{
                    width: 34, height: 34, borderRadius: 8, border: 'none',
                    background: 'rgba(239,68,68,0.08)', color: '#f87171',
                    cursor: deleting === test.id ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, opacity: deleting === test.id ? 0.5 : 1,
                  }}
                >
                  {deleting === test.id ? <ButtonSpinner /> : <Trash2 size={13} />}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
