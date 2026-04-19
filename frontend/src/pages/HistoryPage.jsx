import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { interviewService } from '../services/interviewService';
import { History, ChevronRight, Calendar, Folders } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <div className="spinner-container">
      <div className="spinner" />
      <p className="text-secondary mt-4">Loading history...</p>
    </div>
  );
  return (
    <div className="page history-page">
      <div className="container">
        <div className="page-header text-center">
          <div className="badge badge-blue mb-4 mx-auto w-max flex items-center gap-2">
            <History size={16} /> Session Log
          </div>
          <h1 className="text-gradient">Interview History</h1>
          <p className="text-secondary">Track your progress and review past performances.</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {history.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="card history-empty text-center py-16"
          >
            <Folders size={48} className="text-muted mx-auto mb-6" />
            <h3 className="mb-2">No interviews yet</h3>
            <p className="text-secondary mb-8">Start your first mock interview to see results here.</p>
            <Link to="/dashboard" className="btn btn-primary">
              Start Interview <ChevronRight size={16} />
            </Link>
          </motion.div>
        ) : (
          <div className="history-list">
            {history.map(({ session, totalScore, maxScore }, idx) => {
              const pct = maxScore ? Math.round((totalScore / maxScore) * 100) : null;
              const completed = session.status === 'completed';
              let scoreColor = 'var(--text-muted)';
              if (completed && pct !== null) {
                if (pct >= 80) scoreColor = 'var(--success)';
                else if (pct >= 60) scoreColor = 'var(--warning)';
                else scoreColor = 'var(--danger)';
              }
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card history-card" 
                  key={session._id}
                >
                  <div className="history-info">
                    <div className="history-icon text-soft-blue">
                       {session.category === 'JavaScript' ? '⚡' : 
                        session.category === 'React' ? '⚛️' : 
                        session.category === 'Node.js' ? '🟢' : 
                        session.category === 'System Design' ? '🏗️' : '📊'}
                    </div>
                    <div>
                      <h3 className="history-cat">{session.category}</h3>
                      <div className="history-date text-muted flex items-center gap-2">
                        <Calendar size={14}/> 
                        {new Date(session.startTime).toLocaleDateString('en-US', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="history-actions">
                    <div className="history-status">
                      <span className={`badge ${completed ? 'badge-success' : 'badge-warning'}`}>
                        {completed ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                    <div className="history-score" style={{ color: scoreColor }}>
                      {completed && pct !== null ? `${pct}%` : '—'}
                    </div>
                    {completed && (
                      <Link to={`/results/${session._id}`} className="btn btn-secondary btn-sm">
                        View Report
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
