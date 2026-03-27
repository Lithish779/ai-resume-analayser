import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Copy, Check } from 'lucide-react';

const BOT_USERNAME = 'resume_pdf_analyzer_bot'; // Updated with actual bot username
const BOT_LINK = `https://t.me/${BOT_USERNAME}`;

const steps = [
  { num: 1, text: <>Open Telegram and search <code style={{ background: 'var(--bg4)', padding: '2px 6px', borderRadius: 4, fontSize: 12, color: 'var(--info)' }}>@{BOT_USERNAME}</code></> },
  { num: 2, text: <>Type <code style={{ background: 'var(--bg4)', padding: '2px 6px', borderRadius: 4, fontSize: 12, color: 'var(--info)' }}>/start</code> to begin a new session</> },
  { num: 3, text: 'Send your Job Description file (PDF, DOCX, or plain text) when prompted' },
  { num: 4, text: 'Send your resume file — the bot will analyze both and return your score' },
  { num: 5, text: 'Choose a resume format and get your AI-optimized .docx file instantly' },
];

export default function TelegramModal({ onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(BOT_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.75)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 30 } }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg2)',
          border: '0.5px solid var(--border2)',
          borderRadius: 'var(--r)',
          padding: 'clamp(24px, 6vw, 36px)',
          maxWidth: 500,
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text3)', padding: 6, borderRadius: 6,
            display: 'flex', alignItems: 'center',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--info-dim)',
          border: '0.5px solid rgba(99,179,237,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, color: 'var(--info)',
        }}>
          <Send size={24} />
        </div>

        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, marginBottom: 8 }}>
          ResumeIQ on Telegram
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
          Analyze resumes on the go — send your JD and resume directly in Telegram and get your full score, keyword gaps, recommendations, and an optimized resume in seconds.
        </p>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
          {steps.map((step) => (
            <div key={step.num} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'var(--info-dim)',
                border: '0.5px solid rgba(99,179,237,0.3)',
                color: 'var(--info)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 1,
              }}>
                {step.num}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, paddingTop: 3 }}>
                {step.text}
              </div>
            </div>
          ))}
        </div>

        {/* Supported file types */}
        <div style={{
          padding: '12px 16px',
          background: 'var(--bg3)',
          borderRadius: 'var(--r3)',
          marginBottom: 24,
          fontSize: 12,
          color: 'var(--text3)',
          lineHeight: 1.6,
        }}>
          📎 <strong style={{ color: 'var(--text2)' }}>Supported file types:</strong> PDF, DOCX, DOC, TXT, Markdown — up to 20 MB per file
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <motion.a
            href={BOT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 20px', borderRadius: 'var(--r3)',
              background: '#229ED9', color: '#fff',
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
              fontFamily: "'Syne', sans-serif",
            }}
          >
            <Send size={15} /> Open Bot in Telegram
          </motion.a>

          <motion.button
            onClick={handleCopy}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '12px 18px', borderRadius: 'var(--r3)',
              border: '0.5px solid var(--border2)', background: 'transparent',
              color: copied ? 'var(--accent)' : 'var(--text2)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              fontFamily: "'Syne', sans-serif", transition: 'all 0.2s',
            }}
          >
            {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Link</>}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
