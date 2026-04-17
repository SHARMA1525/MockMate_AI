import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { interviewService } from '../services/interviewService';
import './InterviewPage.css';

export default function InterviewPage() {
  const { sessionId }       = useParams();
  const { state }           = useLocation();
  const navigate            = useNavigate();

  // Questions and session come from navigation state
  const [questions]         = useState(state?.questions || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers]   = useState({}); // { questionId: answerText }
  const [draft, setDraft]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');
  const [saved, setSaved]       = useState({}); // { questionId: true }

  // If navigated here without questions, redirect back
  useEffect(() => {
    if (!state?.questions || questions.length === 0) {
      navigate('/dashboard');
    }
  }, []);

  const currentQuestion = questions[currentIndex];
  const totalQuestions  = questions.length;
  const progress        = Math.round(((currentIndex) / totalQuestions) * 100);

  // Load saved draft when switching questions
  useEffect(() => {
    if (currentQuestion) {
      setDraft(answers[currentQuestion._id] || '');
    }
  }, [currentIndex]);

  // Save answer for current question
  const handleSaveAnswer = async () => {
    if (!draft.trim()) { setError('Please write an answer before saving.'); return; }
    setError('');
    setSaving(true);
    try {
      await interviewService.submitAnswer(sessionId, currentQuestion._id, draft.trim());
      setAnswers(prev => ({ ...prev, [currentQuestion._id]: draft.trim() }));
      setSaved(prev => ({ ...prev, [currentQuestion._id]: true }));

      // Auto-advance to next question
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(i => i + 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save answer.');
    } finally {
      setSaving(false);
    }
  };

  // Final submit
  const handleSubmitInterview = async () => {
    const answeredCount = Object.keys(saved).length;
    if (answeredCount === 0) {
      setError('Please answer at least one question before submitting.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await interviewService.submit(sessionId);
      navigate(`/results/${sessionId}`, { state: { report: res.data.data } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit interview.');
      setSubmitting(false);
    }
  };

  if (!currentQuestion) return null;

  const difficultyColor = {
    easy: 'var(--success)',
    medium: 'var(--warning)',
    hard: 'var(--danger)',
  };

  return (
    <div className="interview-page">
      <div className="container">
        {/* Header bar */}
        <div className="interview-header fade-in-up">
          <div className="interview-meta">
            <span className="interview-label">📋 {state?.session?.category}</span>
            <span className="interview-counter">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
          </div>
          {/* Progress bar */}
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="interview-layout">
          {/* Question panel */}
          <div className="interview-main fade-in-up">
            <div className="question-card">
              <div className="question-card-header">
                <span className="question-number">Q{currentIndex + 1}</span>
                <span
                  className={`badge badge-${currentQuestion.difficulty}`}
                  style={{ color: difficultyColor[currentQuestion.difficulty] }}
                >
                  {currentQuestion.difficulty}
                </span>
                {saved[currentQuestion._id] && (
                  <span className="saved-indicator">✅ Saved</span>
                )}
              </div>
              <p className="question-text">{currentQuestion.content}</p>
            </div>

            {/* Answer area */}
            <div className="answer-area">
              <label className="answer-label">Your Answer</label>
              <textarea
                className="answer-textarea"
                placeholder="Type your answer here. Be specific — include technical terms and key concepts related to this topic…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={saving || submitting}
              />
              <div className="answer-footer">
                <span className="char-count">{draft.length} characters</span>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveAnswer}
                  disabled={saving || submitting || !draft.trim()}
                >
                  {saving ? 'Saving…' : currentIndex < totalQuestions - 1 ? 'Save & Next →' : 'Save Answer'}
                </button>
              </div>
            </div>

            {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}
          </div>

          {/* Sidebar — question navigator */}
          <div className="interview-sidebar fade-in-up">
            <h3 className="sidebar-title">Questions</h3>
            <div className="question-nav-grid">
              {questions.map((q, idx) => (
                <button
                  key={q._id}
                  className={`question-nav-btn
                    ${idx === currentIndex ? 'current' : ''}
                    ${saved[q._id] ? 'answered' : ''}
                  `}
                  onClick={() => setCurrentIndex(idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <div className="sidebar-legend">
              <span className="legend-item"><span className="dot dot-answered" />Answered</span>
              <span className="legend-item"><span className="dot dot-current" />Current</span>
              <span className="legend-item"><span className="dot dot-unsaved" />Pending</span>
            </div>

            <div className="sidebar-progress">
              <span>{Object.keys(saved).length} / {totalQuestions} answered</span>
            </div>

            <button
              className="btn btn-success btn-full"
              onClick={handleSubmitInterview}
              disabled={submitting || Object.keys(saved).length === 0}
              style={{ marginTop: 16 }}
            >
              {submitting ? 'Scoring…' : '🚀 Submit Interview'}
            </button>

            <p className="sidebar-hint">
              You can submit anytime after answering at least one question.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
