import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { interviewService } from '../services/interviewService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Play, TrendingUp, Award, Clock, Flame, Target, BookOpen, AlertCircle } from 'lucide-react';
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

  const [selected, setSelected] = useState('');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    interviewService.getHistory()
      .then(res => setHistory(res.data.data || []))
      .catch(() => setError('Failed to load user statistics.'))
      .finally(() => setLoadingHistory(false));
  }, []);

  const handleStart = async () => {
    if (!selected) { setError('Please select a category first.'); return; }
    setError('');
    setStarting(true);
    try {
      const res = await interviewService.start(selected);
      const { session, questions } = res.data.data;
      navigate(`/interview/${session._id}`, { state: { session, questions } });
    } catch (err) {
      if (err.response?.status === 409) {
        setError('You have an unfinished interview session. Please resume or cancel it above.');
        interviewService.getHistory().then(r => setHistory(r.data.data || [])); 
      } else {
        setError(err.response?.data?.message || 'Failed to start interview.');
      }
      setStarting(false);
    }
  };

  // -------------------------------------------------------------
  // DYNAMIC CALCULATIONS
  // -------------------------------------------------------------
  const completedSessions = history
    .filter(h => h.session.status === 'completed')
    .sort((a, b) => new Date(a.session.startTime) - new Date(b.session.startTime));

  const totalInterviews = completedSessions.length;
  
  // Practice Time (minutes)
  const practiceTimeMinutes = completedSessions.reduce((acc, h) => {
    if (h.session.endTime && h.session.startTime) {
      const ms = new Date(h.session.endTime) - new Date(h.session.startTime);
      return acc + (ms / 60000);
    }
    return acc;
  }, 0);

  // Average Score
  const averageScore = totalInterviews > 0 
    ? Math.round(completedSessions.reduce((acc, h) => {
        const pct = h.maxScore > 0 ? (h.totalScore / h.maxScore) * 100 : 0;
        return acc + pct;
      }, 0) / totalInterviews)
    : 0;

  // Success Rate (Assuming Success is >= 70%)
  const sumSuccess = completedSessions.reduce((acc, h) => {
    const pct = h.maxScore > 0 ? (h.totalScore / h.maxScore) * 100 : 0;
    return acc + (pct >= 70 ? 1 : 0);
  }, 0);
  const successRate = totalInterviews > 0 ? Math.round((sumSuccess / totalInterviews) * 100) : 0;

  // Questions Answered
  const questionsAnswered = completedSessions.reduce((acc, h) => acc + (h.session.questionIds?.length || 0), 0);

  // Streak Calculation
  let streak = 0;
  if (completedSessions.length > 0) {
    const uniqueDates = [...new Set(completedSessions.map(h => new Date(h.session.startTime).toDateString()))].sort((a,b) => new Date(b) - new Date(a));
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (uniqueDates[0] === today.toDateString() || uniqueDates[0] === yesterday.toDateString()) {
       streak = 1;
       let checkDate = new Date(uniqueDates[0]);
       for (let i = 1; i < uniqueDates.length; i++) {
           checkDate.setDate(checkDate.getDate() - 1);
           if (uniqueDates[i] === checkDate.toDateString()) {
               streak++;
           } else {
               break;
           }
       }
    }
  }

  // Charts Data
  const progressData = completedSessions.slice(-7).map((h, i) => {
    const d = new Date(h.session.startTime);
    const pct = h.maxScore > 0 ? Math.round((h.totalScore / h.maxScore) * 100) : 0;
    return { name: `S${i+1} (${d.toLocaleDateString('en-US', { weekday: 'short' })})`, score: pct };
  });

  const skillMap = {};
  CATEGORIES.forEach(c => skillMap[c] = { totalPct: 0, count: 0 });
  completedSessions.forEach(h => {
    const cat = h.session.category;
    if(skillMap[cat]) {
      const pct = h.maxScore ? Math.round((h.totalScore / h.maxScore) * 100) : 0;
      skillMap[cat].totalPct += pct;
      skillMap[cat].count += 1;
    }
  });

  const skillData = CATEGORIES.map(c => ({
     subject: c,
     A: skillMap[c].count > 0 ? Math.round(skillMap[c].totalPct / skillMap[c].count) : 0,
     fullMark: 100
  }));

  const activeSessionItem = history.find(h => h.session.status === 'in-progress');
  const isStale = activeSessionItem 
     ? (Date.now() - new Date(activeSessionItem.session.startTime).getTime()) > (30 * 60 * 1000)
     : false;

  const recentSessions = [...completedSessions].reverse().slice(0, 3); // Last 3

  return (
    <div className="page dashboard-page">
      <div className="container">
        
        {/* HEADER SECTION */}
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p className="text-secondary">Welcome back, {user?.username}. Here's your interview progress.</p>
          </div>
          
          {loadingHistory ? (
            <div className="dashboard-stats-row">
              <div className="skeleton" style={{ width: 120, height: 80, borderRadius: 12 }}></div>
              <div className="skeleton" style={{ width: 120, height: 80, borderRadius: 12 }}></div>
              <div className="skeleton" style={{ width: 120, height: 80, borderRadius: 12 }}></div>
            </div>
          ) : (
            <div className="dashboard-stats-row">
              <div className="glass-card stat-bubble" title="Average percentage score across all your interviews">
                <Award size={24} className="text-soft-blue mb-2" />
                <h3>Avg Score</h3>
                <p className="stat-val">{averageScore}%</p>
              </div>
              <div className="glass-card stat-bubble" title="Total number of interviews completed">
                <TrendingUp size={24} className="text-success mb-2" />
                <h3>Sessions</h3>
                <p className="stat-val">{totalInterviews}</p>
              </div>
              <div className="glass-card stat-bubble" title="Consecutive days of practice">
                <Flame size={24} className="text-warning mb-2" />
                <h3>Streak</h3>
                <p className="stat-val">{streak}</p>
              </div>
            </div>
          )}
        </div>

        {/* ADDITIONAL QUICK STATS - Requested explicitly */}
        {!loadingHistory && totalInterviews > 0 && (
          <div className="dashboard-quick-stats mb-8 grid grid-cols-4 gap-4">
             <div className="card text-center p-4">
               <p className="text-muted text-sm uppercase">Total Interviews</p>
               <h4 className="text-2xl font-bold">{totalInterviews}</h4>
             </div>
             <div className="card text-center p-4">
               <p className="text-muted text-sm uppercase">Practice Time</p>
               <h4 className="text-2xl font-bold">{Math.round(practiceTimeMinutes)} mins</h4>
             </div>
             <div className="card text-center p-4">
               <p className="text-muted text-sm uppercase">Success Rate</p>
               <h4 className="text-2xl font-bold text-success">{successRate}%</h4>
             </div>
             <div className="card text-center p-4">
               <p className="text-muted text-sm uppercase">Questions Answered</p>
               <h4 className="text-2xl font-bold">{questionsAnswered}</h4>
             </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loadingHistory && totalInterviews === 0 && (
          <div className="card empty-state mb-8 text-center p-12">
             <BookOpen size={48} className="text-muted mx-auto mb-4" />
             <h2 className="mb-2">No data yet</h2>
             <p className="text-secondary max-w-md mx-auto">
               You haven't completed any interviews yet. Start your first mock interview to see your progress.
             </p>
             <div className="grid grid-cols-6 gap-4 mt-8 opacity-50 pointer-events-none">
                 {/* Dummy stats emphasizing zeros */}
                 <div className="text-center"><p className="text-sm">Total Interviews</p><p className="text-xl font-bold">0</p></div>
                 <div className="text-center"><p className="text-sm">Practice Time</p><p className="text-xl font-bold">0 mins</p></div>
                 <div className="text-center"><p className="text-sm">Average Score</p><p className="text-xl font-bold">0%</p></div>
                 <div className="text-center"><p className="text-sm">Success Rate</p><p className="text-xl font-bold">0%</p></div>
                 <div className="text-center"><p className="text-sm">Questions Answered</p><p className="text-xl font-bold">0</p></div>
                 <div className="text-center"><p className="text-sm">Current Streak</p><p className="text-xl font-bold">0 days</p></div>
             </div>
          </div>
        )}

        {/* MAIN GRID */}
        <div className="dashboard-grid">
          
          {/* CHARTS CONTAINER */}
          <div className="dashboard-charts">
            <div className="card chart-card relative">
              <h3>Performance Trend</h3>
              <p className="text-muted mb-4 text-sm">Your scores over the last {Math.min(7, totalInterviews)} sessions</p>
              
              {loadingHistory ? (
                <div className="skeleton w-full h-full rounded-md mt-4"></div>
              ) : totalInterviews > 0 ? (
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                      <XAxis dataKey="name" stroke="#9CA3AF" tick={{fill: '#9CA3AF', fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis stroke="#9CA3AF" tick={{fill: '#9CA3AF'}} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1F2937', borderRadius: '8px' }}
                        itemStyle={{ color: '#3B82F6' }}
                      />
                      <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#0B1220', stroke: '#3B82F6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted">
                    Take an interview to unlock performance trends.
                </div>
              )}
            </div>

            <div className="card chart-card">
              <h3>Skill Breakdown</h3>
              <p className="text-muted mb-4 text-sm">Average performance by category</p>
              
              {loadingHistory ? (
                 <div className="skeleton w-full h-full rounded-md mt-4"></div>
              ) : totalInterviews > 0 ? (
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillData}>
                      <PolarGrid stroke="#1F2937" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                      <Radar name="Category Avg" dataKey="A" stroke="#3B82F6" strokeWidth={2} fill="#3B82F6" fillOpacity={0.4} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#0B1220', borderColor: '#1F2937', borderRadius: '8px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted">
                    Waiting for category data.
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-sidebar">
            {activeSessionItem ? (
              <div className="card actions-card" style={{ borderColor: 'var(--soft-blue)' }}>
                {isStale ? (
                  <>
                    <h3 className="flex items-center gap-2 text-warning mb-2"><AlertCircle size={20}/> Stale Session Detected</h3>
                    <p className="text-muted mb-6 text-sm">
                      You have an unfinished interview session from {new Date(activeSessionItem.session.startTime).toLocaleDateString()}, but it has timed out.
                    </p>
                    <button 
                      className="btn btn-primary btn-full"
                      onClick={async () => {
                        try {
                          await interviewService.cancel(activeSessionItem.session._id);
                          setHistory(history.filter(h => h.session._id !== activeSessionItem.session._id));
                        } catch (e) {
                          interviewService.getHistory().then(r => setHistory(r.data.data)); // Force refresh just in case
                        }
                      }}
                    >
                      Force Reset Session
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="flex items-center gap-2 mb-2"><Clock size={20}/> Active Interview</h3>
                    <p className="text-muted mb-6 text-sm">
                      You have an ongoing <strong className="text-soft-blue">{activeSessionItem.session.category}</strong> interview.
                    </p>
                    
                    <div className="flex flex-col gap-3">
                      <button 
                        className="btn btn-primary btn-full flex items-center justify-center gap-2"
                        onClick={() => navigate(`/interview/${activeSessionItem.session._id}`)}
                      >
                       <Play size={16}/> Resume Interview
                      </button>
                      <button 
                         className="btn btn-secondary btn-full"
                         onClick={async () => {
                           if(confirm('Are you sure you want to submit your incomplete interview?')) {
                             try {
                               await interviewService.submit(activeSessionItem.session._id);
                               navigate(`/results/${activeSessionItem.session._id}`);
                             } catch(e) {
                               alert('Failed to submit: ' + (e.response?.data?.message || e.message));
                             }
                           }
                         }}
                      >
                         Submit Early
                      </button>
                      <button 
                        className="btn btn-secondary btn-full text-danger"
                        style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}
                        onClick={async () => {
                          if(confirm('Are you sure you want to cancel this interview? Your progress will be lost.')) {
                             await interviewService.cancel(activeSessionItem.session._id);
                             setHistory(history.filter(h => h.session._id !== activeSessionItem.session._id));
                          }
                        }}
                      >
                        Cancel Interview
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="card actions-card">
                <h3>Start Practicing</h3>
                <p className="text-muted mb-6 text-sm">Select a category and hit start</p>
                {error && <div className="badge badge-error mb-4 w-full justify-center text-center leading-tight p-2">{error}</div>}
                
                <div className="category-list">
                  {CATEGORIES.map((cat) => {
                    const meta = categoryMeta[cat];
                    const isSelected = selected === cat;
                    
                    const catScore = skillMap[cat]?.count > 0 ? Math.round(skillMap[cat].totalPct / skillMap[cat].count) : null;
                    
                    return (
                      <button
                        key={cat}
                        className={`category-select-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelected(cat)}
                        style={{ '--cat-color': meta.color }}
                      >
                        <span className="category-select-icon">{meta.icon}</span>
                        <div className="flex flex-col items-start flex-1">
                          <span className="category-select-name">{cat}</span>
                          {catScore !== null && <span className="text-xs text-muted">Avg: {catScore}%</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  className="btn btn-primary btn-full mt-6 flex justify-center items-center gap-2"
                  onClick={handleStart}
                  disabled={starting || !selected}
                >
                  {starting ? 'Starting...' : <><Play size={18} /> Start Session</>}
                </button>
              </div>
            )}
            
            <div className="card recent-card mt-6">
              <h3>Recent Sessions</h3>
              <p className="text-muted text-sm mb-4">Your latest mock interviews</p>
              
              {loadingHistory ? (
                 <div className="flex flex-col gap-3">
                   <div className="skeleton w-full h-12 rounded"></div>
                   <div className="skeleton w-full h-12 rounded"></div>
                 </div>
              ) : totalInterviews === 0 ? (
                 <p className="text-center text-muted py-4 text-sm">No recent activity.</p>
              ) : (
                <div className="recent-list">
                  {recentSessions.map(rs => {
                    const pct = rs.maxScore > 0 ? Math.round((rs.totalScore / rs.maxScore) * 100) : 0;
                    return (
                      <div className="recent-item" key={rs.session._id}>
                        <div className="recent-icon">{categoryMeta[rs.session.category]?.icon || '📋'}</div>
                        <div className="recent-info">
                          <h4>{rs.session.category}</h4>
                          <span>{new Date(rs.session.startTime).toLocaleDateString()}</span>
                        </div>
                        <div className={`recent-score ${pct >= 80 ? 'text-success' : pct >= 60 ? 'text-warning' : 'text-danger'}`}>
                          {pct}%
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
