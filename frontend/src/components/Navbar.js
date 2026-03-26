import React from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

const steps = [
  { num: 1, label: 'Job Description' },
  { num: 2, label: 'Resume' },
  { num: 3, label: 'Results' },
];

export default function Navbar({ currentPage, goToPage, onTelegramClick, hasJD, hasResume }) {
  const canGo = (num) => {
    if (num === 1) return true;
    if (num === 2) return hasJD;
    if (num === 3) return hasJD && hasResume;
    return false;
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(10,10,12,0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '0.5px solid rgba(255,255,255,0.07)',
      padding: '0 32px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 24,
    }}>
      {/* Logo */}
      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: 'var(--accent)', letterSpacing: '-0.5px', flexShrink: 0 }}>
        Resume<span style={{ color: 'var(--text3)' }}>IQ</span>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {steps.map((step, i) => {
          const isActive = currentPage === step.num;
          const isDone = currentPage > step.num;
          const canClick = canGo(step.num);

          return (
            <React.Fragment key={step.num}>
              <motion.button
                onClick={() => canClick && goToPage(step.num)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: isActive ? '0.5px solid rgba(200,240,100,0.3)' : '0.5px solid transparent',
                  background: isActive ? 'rgba(200,240,100,0.08)' : 'transparent',
                  color: isActive ? 'var(--accent)' : isDone ? 'var(--text2)' : 'var(--text3)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: canClick ? 'pointer' : 'default',
                  fontFamily: "'Syne', sans-serif",
                  transition: 'all 0.2s',
                }}
                whileHover={canClick ? { scale: 1.02 } : {}}
              >
                <span style={{
                  width: 20, height: 20,
                  borderRadius: '50%',
                  background: isActive ? 'var(--accent)' : isDone ? 'var(--bg4)' : 'var(--bg3)',
                  color: isActive ? '#000' : 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 600, flexShrink: 0,
                }}>
                  {isDone ? '✓' : step.num}
                </span>
                <span style={{ display: 'none' }} className="step-label">{step.label}</span>
                <span style={{ '@media(minWidth:640px)': { display: 'inline' } }}>{step.label}</span>
              </motion.button>
              {i < steps.length - 1 && (
                <div style={{ width: 20, height: 1, background: 'var(--border)', flexShrink: 0 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Telegram button */}
      <motion.button
        onClick={onTelegramClick}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '7px 16px',
          borderRadius: 20,
          border: '0.5px solid var(--border2)',
          background: 'transparent',
          color: 'var(--info)',
          fontSize: 13,
          fontWeight: 500,
          flexShrink: 0,
          fontFamily: "'Syne', sans-serif",
          transition: 'background 0.2s',
        }}
      >
        <Send size={14} />
        Telegram Bot
      </motion.button>
    </nav>
  );
}
