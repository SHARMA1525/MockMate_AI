import { useState, useEffect } from 'react';
import { adminService, questionService } from '../services/interviewService';
import './AdminPage.css';

const CATEGORIES = ['JavaScript', 'React', 'Node.js', 'System Design', 'Data Structures'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

const emptyForm = {
  category: 'JavaScript',
  difficulty: 'medium',
  content: '',
  requiredKeywords: '',
  bonusKeywords: '',
};

export default function AdminPage() {
  const [tab, setTab]           = useState('questions'); // 'questions' | 'users' | 'analytics'
  const [questions, setQuestions] = useState([]);
  const [users, setUsers]       = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState(emptyForm);
  const [editId, setEditId]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [filterCat, setFilterCat] = useState('');

  // Load data on tab change
  useEffect(() => {
    setLoading(true);
    setError('');
    if (tab === 'questions') {
      questionService.getAll()
        .then(res => setQuestions(res.data.data))
        .catch(() => setError('Failed to load questions.'))
        .finally(() => setLoading(false));
    } else if (tab === 'users') {
      adminService.getUsers()
        .then(res => setUsers(res.data.data))
        .catch(() => setError('Failed to load users.'))
        .finally(() => setLoading(false));
    } else {
      adminService.getAnalytics()
        .then(res => setAnalytics(res.data.data))
        .catch(() => setError('Failed to load analytics.'))
        .finally(() => setLoading(false));
    }
  }, [tab]);

  const showMsg = (msg, isError = false) => {
    if (isError) { setError(msg); setSuccess(''); }
    else { setSuccess(msg); setError(''); }
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  // Parse comma-separated keywords → array of objects
  const parseKeywords = (str) =>
    str.split(',')
      .map(k => k.trim())
      .filter(Boolean)
      .map(k => ({ keyword: k.toLowerCase(), weight: 1 }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) { showMsg('Question content is required.', true); return; }
    if (!form.requiredKeywords.trim()) { showMsg('At least one required keyword is needed.', true); return; }

    setSaving(true);
    const payload = {
      category: form.category,
      difficulty: form.difficulty,
      content: form.content.trim(),
      requiredKeywords: parseKeywords(form.requiredKeywords),
      bonusKeywords: parseKeywords(form.bonusKeywords),
    };

    try {
      if (editId) {
        const res = await questionService.update(editId, payload);
        setQuestions(qs => qs.map(q => q._id === editId ? res.data.data : q));
        showMsg('Question updated successfully!');
      } else {
        const res = await questionService.create(payload);
        setQuestions(qs => [res.data.data, ...qs]);
        showMsg('Question created successfully!');
      }
      setForm(emptyForm);
      setEditId(null);
    } catch (err) {
      showMsg(err.response?.data?.message || 'Save failed.', true);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (q) => {
    setEditId(q._id);
    setForm({
      category: q.category,
      difficulty: q.difficulty,
      content: q.content,
      requiredKeywords: q.requiredKeywords.map(k => k.keyword).join(', '),
      bonusKeywords: q.bonusKeywords.map(k => k.keyword).join(', '),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this question? This cannot be undone.')) return;
    try {
      await questionService.remove(id);
      setQuestions(qs => qs.filter(q => q._id !== id));
      showMsg('Question deleted.');
    } catch {
      showMsg('Failed to delete.', true);
    }
  };

  const filteredQuestions = filterCat
    ? questions.filter(q => q.category === filterCat)
    : questions;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header fade-in-up">
          <h1>🛡️ Admin Panel</h1>
          <p>Manage questions, view users, and track analytics</p>
        </div>

        {/* Tab bar */}
        <div className="admin-tabs fade-in-up">
          {[['questions','📝 Questions'], ['users','👥 Users'], ['analytics','📊 Analytics']].map(([key, label]) => (
            <button
              key={key}
              className={`admin-tab ${tab === key ? 'active' : ''}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* ── QUESTIONS TAB ── */}
        {tab === 'questions' && (
          <div className="admin-layout fade-in-up">
            {/* Form */}
            <div className="admin-form-card">
              <h2 className="admin-form-title">
                {editId ? '✏️ Edit Question' : '➕ Add Question'}
              </h2>
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={e => setForm({ ...form, difficulty: e.target.value })}
                  >
                    {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Question</label>
                  <textarea
                    value={form.content}
                    onChange={e => setForm({ ...form, content: e.target.value })}
                    placeholder="Write the interview question here…"
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Required Keywords <span className="field-hint">(comma-separated)</span></label>
                  <input
                    type="text"
                    value={form.requiredKeywords}
                    onChange={e => setForm({ ...form, requiredKeywords: e.target.value })}
                    placeholder="closure, scope, function"
                  />
                </div>
                <div className="form-group">
                  <label>Bonus Keywords <span className="field-hint">(optional, comma-separated)</span></label>
                  <input
                    type="text"
                    value={form.bonusKeywords}
                    onChange={e => setForm({ ...form, bonusKeywords: e.target.value })}
                    placeholder="lexical, variable"
                  />
                </div>
                <div className="form-actions">
                  <button className="btn btn-primary" type="submit" disabled={saving}>
                    {saving ? 'Saving…' : editId ? 'Update Question' : 'Add Question'}
                  </button>
                  {editId && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => { setForm(emptyForm); setEditId(null); }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Question list */}
            <div className="admin-list">
              <div className="admin-list-header">
                <span className="admin-list-title">
                  All Questions <span className="count-badge">{filteredQuestions.length}</span>
                </span>
                <select
                  className="filter-select"
                  value={filterCat}
                  onChange={e => setFilterCat(e.target.value)}
                >
                  <option value="">All categories</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {loading ? (
                <div className="spinner-container" style={{ minHeight: 200 }}><div className="spinner" /></div>
              ) : (
                <div className="question-list">
                  {filteredQuestions.map(q => (
                    <div className="question-list-item" key={q._id}>
                      <div className="qli-body">
                        <div className="qli-meta">
                          <span className="qli-cat">{q.category}</span>
                          <span className={`badge badge-${q.difficulty}`}>{q.difficulty}</span>
                        </div>
                        <p className="qli-content">{q.content}</p>
                        <div className="qli-kws">
                          {q.requiredKeywords?.slice(0, 5).map(k => (
                            <span key={k.keyword} className="kw-tag kw-tag-match">{k.keyword}</span>
                          ))}
                          {q.requiredKeywords?.length > 5 && (
                            <span className="kw-tag" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                              +{q.requiredKeywords.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="qli-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(q)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(q._id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                  {filteredQuestions.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', padding: 20, textAlign: 'center' }}>No questions found.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <div className="fade-in-up">
            {loading ? <div className="spinner-container"><div className="spinner" /></div> : (
              <div className="user-table-wrap">
                <table className="user-table">
                  <thead>
                    <tr><th>#</th><th>Username</th><th>Email</th><th>Role</th><th>Joined</th></tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u._id}>
                        <td className="table-num">{i + 1}</td>
                        <td className="table-username">{u.username}</td>
                        <td className="table-email">{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-completed' : ''}`}
                            style={u.role !== 'admin' ? { background: 'var(--bg-secondary)', color: 'var(--text-secondary)' } : {}}>
                            {u.role}
                          </span>
                        </td>
                        <td className="table-date">
                          {new Date(u.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {tab === 'analytics' && (
          <div className="analytics-grid fade-in-up">
            {loading ? <div className="spinner-container"><div className="spinner" /></div> : analytics && (
              <>
                {[
                  { label: 'Total Users',         value: analytics.totalUsers,              icon: '👥' },
                  { label: 'Total Interviews',    value: analytics.totalInterviews,         icon: '📋' },
                  { label: 'Completed',           value: analytics.completedInterviews,     icon: '✅' },
                  { label: 'Avg Score',           value: `${analytics.averageScorePercentage}%`, icon: '🎯' },
                  { label: 'Score Reports',       value: analytics.totalReports,            icon: '📊' },
                ].map((stat) => (
                  <div className="analytics-card" key={stat.label}>
                    <span className="analytics-icon">{stat.icon}</span>
                    <span className="analytics-value">{stat.value}</span>
                    <span className="analytics-label">{stat.label}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
