import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { interviewService } from '../services/interviewService';
import './ResultsPage.css';

export default function ResultsPage() {
  const { sessionId } = useParams();
  const { state }     = useLocation();
  const navigate      = useNavigate();

  const [report, setReport]   = useState(state?.report || null);
  const [loading, setLoading] = useState(!state?.report);
  const [error, setError]     = useState('');

  // If no state, fetch the report from the API
  useEffect(() => {
    if (!report) {
      interviewService.getReport(sessionId)
        .then(res => setReport(res.data.data))
        .catch(() => setError('Could not load score report.'))
        .finally(() => setLoading(false));
    }
  }, []);

  if (loading) return (
    <div className="spinner-container">
      <div className="spinner" />
      <p style={{ color: 'var(--text-secondary)' }}>Loading results…</p>
    </div>
  );

  if (error) return (
    <div className="page"><div className="container">
      <div className="alert alert-error">{error}</div>
      <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 12 }}>← Dashboard</Link>
    </div></div>
  );

  if (!report) return null;

  const percentage = report.maxPossibleScore > 0
    ? Math.round((report.totalScore / report.maxPossibleScore) * 100)
    : 0;

  const scoreColor =
    percentage >= 80 ? 'var(--success)' :
    percentage >= 60 ? 'var(--warning)' :
    'var(--danger)';

  const scoreLabel =
    percentage >= 80 ? 'Excellent 🌟' :
    percentage >= 60 ? 'Good 👍' :
    percentage >= 40 ? 'Fair 📚' :
    'Needs Work 💪';

  return (
    <div className="page">
      <div className="container">

        {/* Score Hero */}
        <div className="results-hero fade-in-up">
          <div className="score-circle" style={{ '--score-color': scoreColor }}>
            <span className="score-percent">{percentage}%</span>
            <span className="score-raw">{report.totalScore} / {report.maxPossibleScore}</span>
          </div>
          <div className="results-hero-text">
            <h1>{scoreLabel}</h1>
            <p className="results-feedback">{report.overallFeedback}</p>
            <div className="results-actions">
              <Link to="/dashboard" className="btn btn-primary">🔁 Take Another</Link>
              <Link to="/history" className="btn btn-secondary">📋 View History</Link>
            </div>
          </div>
        </div>

        {/* Per-question breakdown */}
        <h2 className="section-heading fade-in-up">Question Breakdown</h2>

        <div className="results-questions">
          {report.questionResults.map((result, idx) => {
            const qPct = result.maxScore > 0
              ? Math.round((result.score / result.maxScore) * 100)
              : 0;
            return (
              <div className="result-card fade-in-up" key={idx}>
                <div className="result-card-header">
                  <span className="result-q-num">Q{idx + 1}</span>
                  <span className="result-score" style={{
                    color: qPct >= 70 ? 'var(--success)' : qPct >= 40 ? 'var(--warning)' : 'var(--danger)'
                  }}>
                    {result.score}/{result.maxScore} pts
                  </span>
                  <div className="result-mini-bar">
                    <div
                      className="result-mini-fill"
                      style={{
                        width: `${qPct}%`,
                        background: qPct >= 70 ? 'var(--success)' : qPct >= 40 ? 'var(--warning)' : 'var(--danger)'
                      }}
                    />
                  </div>
                  <span className="result-pct">{qPct}%</span>
                </div>

                {/* Keywords */}
                <div className="keywords-row">
                  {result.matchedKeywords.length > 0 && (
                    <div className="keywords-group">
                      <span className="kw-label kw-matched">✓ Matched</span>
                      <div className="kw-tags">
                        {result.matchedKeywords.map(kw => (
                          <span key={kw} className="kw-tag kw-tag-match">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.missedKeywords.length > 0 && (
                    <div className="keywords-group">
                      <span className="kw-label kw-missed">✗ Missed</span>
                      <div className="kw-tags">
                        {result.missedKeywords.map(kw => (
                          <span key={kw} className="kw-tag kw-tag-miss">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {result.feedback && (
                  <p className="result-feedback">{result.feedback}</p>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
