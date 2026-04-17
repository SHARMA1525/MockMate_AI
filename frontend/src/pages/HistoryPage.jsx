import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { interviewService } from '../services/interviewService';
import './HistoryPage.css';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    interviewService.getHistory()
      .then(res => setHistory(res.data.data))
      .catch(() => setError('Failed to load history.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="spinner-container"><div className="spinner" /></div>
  );

  return (
    <div className="page">
      <div className="container">
        <div className="page-header fade-in-up">
          <h1>Interview History</h1>
          <p>Track your progress across all past interview sessions</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {history.length === 0 ? (
          <div className="history-empty fade-in-up">
            <span className="history-empty-icon">🗂️</span>
            <h3>No interviews yet</h3>
            <p>Start your first mock interview to see results here.</p>
            <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 16 }}>
              Start Interview →
            </Link>
          </div>
        ) : (
          <div className="history-list">
            {history.map(({ session, totalScore, maxScore }, idx) => {
              const pct = maxScore ? Math.round((totalScore / maxScore) * 100) : null;
              const completed = session.status === 'completed';
              return (
                <div className="history-card fade-in-up" key={session._id}>
                  <div className="history-card-left">
                    <div className="history-rank">#{history.length - idx}</div>
                    <div>
                      <div className="history-category">{session.category}</div>
                      <div className="history-date">
                        {new Date(session.startTime).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="history-card-right">
                    <span className={`badge ${completed ? 'badge-completed' : 'badge-in-progress'}`}>
                      {completed ? 'Completed' : 'In Progress'}
                    </span>

                    {completed && pct !== null ? (
                      <div className="history-score" style={{
                        color: pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)'
                      }}>
                        {pct}%
                      </div>
                    ) : (
                      <span className="history-score-na">—</span>
                    )}

                    {completed && (
                      <Link
                        to={`/results/${session._id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        View Report
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
