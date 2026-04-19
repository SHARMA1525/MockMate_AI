import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { interviewService } from '../services/interviewService';
import { Award, ArrowLeft, RefreshCw, BarChart2, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import './ResultsPage.css';
export default function ResultsPage() {
  const { sessionId } = useParams();
  const { state }     = useLocation();
  const navigate      = useNavigate();
  const [report, setReport]   = useState(state?.report || null);
  const [loading, setLoading] = useState(!state?.report);
  const [error, setError]     = useState('');
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
      <p className="text-secondary mt-4">Analyzing your responses...</p>
    </div>
  );
  if (error) return (
    <div className="page"><div className="container">
      <div className="alert alert-error flex items-center gap-2"><XCircle/> {error}</div>
      <Link to="/dashboard" className="btn btn-primary mt-4"><ArrowLeft size={16}/> Back to Dashboard</Link>
    </div></div>
  );
  if (!report) return null;
  const percentage = report.maxPossibleScore > 0
    ? Math.round((report.totalScore / report.maxPossibleScore) * 100)
    : 0;
  let scoreColor = 'var(--danger)';
  let scoreLabel = 'Needs Work 💪';
  if (percentage >= 80) { scoreColor = 'var(--success)'; scoreLabel = 'Excellent 🌟'; }
  else if (percentage >= 60) { scoreColor = 'var(--warning)'; scoreLabel = 'Good 👍'; }
  else if (percentage >= 40) { scoreColor = 'var(--warning)'; scoreLabel = 'Fair 📚'; }
  return (
    <div className="page results-page">
      <div className="container">
        <div className="results-top-nav">
           <Link to="/dashboard" className="btn btn-secondary btn-sm"><ArrowLeft size={16}/> Dashboard</Link>
           <Link to="/history" className="btn btn-secondary btn-sm"><BarChart2 size={16}/> All History</Link>
        </div>
        <motion.div 
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
           className="results-hero glass-card"
        >
          <div className="hero-left">
            <h1 className="text-gradient">{scoreLabel}</h1>
            <p className="results-feedback text-secondary mt-4">{report.overallFeedback || "Great job completing the interview. Review your detailed feedback below to improve your skills."}</p>
            <button className="btn btn-primary mt-6" onClick={() => navigate('/dashboard')}>
              <RefreshCw size={16}/> Practice Again
            </button>
          </div>
          <div className="hero-right">
             <div className="score-ring" style={{ '--score-color': scoreColor }}>
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path className="circle"
                    strokeDasharray={`${percentage}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="percentage">{percentage}%</text>
                </svg>
             </div>
             <p className="text-muted mt-2">{report.totalScore} / {report.maxPossibleScore} Points</p>
          </div>
        </motion.div>
        <h2 className="section-title mt-12 mb-6 flex items-center gap-2">
           <Award size={24} className="text-soft-blue"/> Detailed Breakdown
        </h2>
        <div className="results-grid">
          {report.questionResults.map((result, idx) => {
            const qPct = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0;
            const qColor = qPct >= 70 ? 'var(--success)' : qPct >= 40 ? 'var(--warning)' : 'var(--danger)';
            return (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="card q-result-card"
              >
                <div className="q-res-header">
                  <div className="q-res-title">
                    <span className="q-num">Q{idx + 1}</span>
                    <span className="q-score" style={{ color: qColor }}>
                      {result.score}/{result.maxScore} pts
                    </span>
                  </div>
                  <div className="q-res-bar">
                    <div className="q-res-fill" style={{ width: `${qPct}%`, background: qColor }} />
                  </div>
                </div>
                <div className="kw-box mt-4">
                  {result.matchedKeywords.length > 0 && (
                    <div className="kw-group">
                      <span className="kw-title text-success"><CheckCircle size={14}/> Matched Focus Areas</span>
                      <div className="kw-tags">
                        {result.matchedKeywords.map(kw => <span key={kw} className="badge badge-success">{kw}</span>)}
                      </div>
                    </div>
                  )}
                  {result.missedKeywords.length > 0 && (
                    <div className="kw-group mt-4">
                      <span className="kw-title text-danger"><XCircle size={14}/> Missed Concepts</span>
                      <div className="kw-tags">
                        {result.missedKeywords.map(kw => <span key={kw} className="badge badge-error">{kw}</span>)}
                      </div>
                    </div>
                  )}
                </div>
                {result.feedback && (
                  <div className="ai-feedback mt-6">
                    <div className="ai-feedback-title">💡 AI Suggestions</div>
                    <p>{result.feedback}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
