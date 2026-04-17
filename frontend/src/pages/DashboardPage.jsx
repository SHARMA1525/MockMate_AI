import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { questionService, interviewService } from '../services/interviewService';
import './DashboardPage.css';

const CATEGORIES = ['JavaScript', 'React', 'Node.js', 'System Design', 'Data Structures'];

const categoryMeta = {
  'JavaScript'      : { icon: '⚡', color: '#f7df1e' },
  'React'           : { icon: '⚛️', color: '#61dafb' },
  'Node.js'         : { icon: '🟢', color: '#68a063' },
  'System Design'   : { icon: '🏗️', color: '#a78bfa' },
  'Data Structures' : { icon: '📊', color: '#fb923c' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [selected, setSelected]   = useState('');
  const [starting, setStarting]   = useState(false);
  const [error, setError]         = useState('');

  const handleStart = async () => {
    if (!selected) { setError('Please select a category first.'); return; }
    setError('');
    setStarting(true);
    try {
      const res = await interviewService.start(selected);
      const { session, questions } = res.data.data;
      // Pass session + questions via navigate state
      navigate(`/interview/${session._id}`, { state: { session, questions } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start interview.');
      setStarting(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        {/* Hero */}
        <div className="dashboard-hero fade-in-up">
          <div>
            <h1>Hello, {user?.username} 👋</h1>
            <p>Ready to practice? Pick a category and start your mock interview.</p>
          </div>
          <div className="dashboard-hero-badge">
            <span className="hero-score-label">Role</span>
            <span className="hero-score-value">{user?.role === 'admin' ? '🛡️ Admin' : '👤 Candidate'}</span>
          </div>
        </div>

        {/* Category picker */}
        <div className="dashboard-section fade-in-up">
          <h2 className="section-title">Choose Interview Category</h2>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="category-grid">
            {CATEGORIES.map((cat) => {
              const meta = categoryMeta[cat];
              const isSelected = selected === cat;
              return (
                <button
                  key={cat}
                  className={`category-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelected(cat)}
                  style={{ '--cat-color': meta.color }}
                >
                  <span className="category-icon">{meta.icon}</span>
                  <span className="category-name">{cat}</span>
                  <span className="category-info">5 questions</span>
                  {isSelected && <span className="category-check">✓</span>}
                </button>
              );
            })}
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={handleStart}
            disabled={starting || !selected}
            style={{ marginTop: 24 }}
          >
            {starting ? 'Starting…' : `Start ${selected || 'Interview'} Interview →`}
          </button>
        </div>

        {/* Info cards */}
        <div className="info-cards fade-in-up">
          <div className="info-card">
            <div className="info-icon">📋</div>
            <div>
              <h3>5 Questions</h3>
              <p>Randomly selected from your chosen category</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">🧠</div>
            <div>
              <h3>Keyword Scoring</h3>
              <p>Rule-based engine checks your answers for key concepts</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">📊</div>
            <div>
              <h3>Instant Report</h3>
              <p>Get detailed feedback after submitting your interview</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
