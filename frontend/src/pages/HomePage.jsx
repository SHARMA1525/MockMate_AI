import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bot, Clock, LineChart, Mic, BookOpen, Star, 
  ChevronRight, Sparkles 
} from 'lucide-react';
import './HomePage.css';
const features = [
  { icon: <Bot size={24} />, title: "AI-Powered Simulation", desc: "Experience realistic interview scenarios with advanced AI." },
  { icon: <Clock size={24} />, title: "Real-Time Feedback", desc: "Get instant, actionable insights to improve your answers." },
  { icon: <BookOpen size={24} />, title: "Resume-Based Questions", desc: "Custom questions tailored perfectly to your unique profile." },
  { icon: <LineChart size={24} />, title: "Performance Analytics", desc: "Track progress visually with deep performance metrics." },
  { icon: <Mic size={24} />, title: "Voice Recognition", desc: "Practice speaking naturally with accurate voice analysis." },
  { icon: <Star size={24} />, title: "Personalized Plans", desc: "Targeted practice regimens to overcome weaknesses." }
];
export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="home-container page">
      <section className="hero-section text-center">
        <motion.div 
          className="hero-blob blob-1 float-anim"
          initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ duration: 1 }}
        />
        <motion.div 
          className="hero-blob blob-2 float-anim"
          style={{ animationDelay: "2s" }}
          initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ duration: 1.5 }}
        />
        <div className="container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
          >
            <div className="badge badge-blue mb-6 mx-auto">
              <Sparkles size={14} /> The Future of Interview Prep
            </div>
            <h1 className="hero-title text-gradient">Master Your Interviews<br/>with AI</h1>
            <p className="hero-subtext mx-auto">
              Practice real interview questions, get instant feedback, and track your progress. Build confidence with every session.
            </p>
            <div className="hero-cta-group mt-8">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
                Start Mock Interview <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>
      <section className="preview-section container">
        <motion.div 
          className="glass-card preview-card"
          initial={{ opacity: 0, y: 50 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="preview-header">
            <h3>Dashboard Overview</h3>
            <div className="preview-dots"><span></span><span></span><span></span></div>
          </div>
          <div className="preview-body">
            <div className="preview-score-box">
              <h4>Interview Score</h4>
              <div className="score-circle">85%</div>
            </div>
            <div className="preview-stats">
              <div className="stat-bar"><div className="bar-fill" style={{ width: '90%' }}></div></div>
              <div className="stat-bar"><div className="bar-fill" style={{ width: '75%' }}></div></div>
              <div className="stat-bar"><div className="bar-fill" style={{ width: '60%' }}></div></div>
            </div>
          </div>
        </motion.div>
      </section>
      <section className="features-section container">
        <div className="text-center mb-16">
          <h2 className="text-gradient">Everything you need to succeed</h2>
          <p className="text-secondary">Comprehensive tools to elevate your performance.</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
             <motion.div 
                key={i} 
                className="card feature-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
             >
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p className="text-muted">{f.desc}</p>
             </motion.div>
          ))}
        </div>
      </section>
      <section className="testimonials-section container">
        <div className="text-center mb-12">
          <h2>Loved by ambitious job seekers</h2>
        </div>
        <div className="testimonials-grid">
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i} 
              className="glass-card testimonial-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p className="text-secondary mb-6">
                "MockMate completely transformed my interview prep. The AI feedback is pinpoint accurate and helped me land my dream job!"
              </p>
              <div className="user-profile">
                <div className="avatar">U{i}</div>
                <div>
                  <h4>User {i}</h4>
                  <span className="text-muted text-sm">Software Engineer</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      <section className="cta-section text-center">
        <motion.div 
          className="container"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-gradient">Ready to Crack Your Next Interview?</h2>
          <p className="text-secondary mt-4 mb-8">Join thousands of successful candidates today.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
            Start Practicing Now
          </button>
        </motion.div>
      </section>
      <footer className="footer border-t border-dark-grey mt-24">
        <div className="container footer-content">
          <div className="footer-brand">
            <div className="logo d-flex align-items-center gap-2">
              <Bot size={28} className="text-soft-blue" />
              <span className="font-bold text-xl">MockMate</span>
            </div>
            <p className="text-muted mt-4 max-w-xs">
              Practice Interviews. Build Confidence. AI-powered prep platform.
            </p>
          </div>
          <div className="footer-links">
            <div className="link-col">
              <h4>Product</h4>
              <a href="#">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Dashboard</a>
            </div>
            <div className="link-col">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Contact</a>
              <a href="#">Privacy Policy</a>
            </div>
            <div className="link-col">
              <h4>Connect</h4>
              <a href="#">Twitter</a>
              <a href="#">LinkedIn</a>
              <a href="#">GitHub</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom text-center text-muted mt-12 py-6 border-t border-dark-grey">
          &copy; {new Date().getFullYear()} MockMate AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
