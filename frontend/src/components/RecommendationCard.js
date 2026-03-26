import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const priorityConfig = {
  high: { label: 'High Impact', color: 'var(--danger)', bg: 'var(--danger-dim)', border: 'rgba(245,101,101,0.3)', accent: '#f56565' },
  med:  { label: 'Medium',      color: 'var(--warn)',   bg: 'var(--warn-dim)',   border: 'rgba(246,173,85,0.3)',  accent: '#f6ad55' },
  low:  { label: 'Low',         color: 'var(--accent)', bg: 'var(--accent-dim)', border: 'rgba(200,240,100,0.3)', accent: '#c8f064' },
};

export default function RecommendationCard({ rec, index }) {
  const [expanded, setExpanded] = useState(index === 0);
  const p = priorityConfig[rec.priority] || priorityConfig.low;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.07 } }}
      style={{
        background: 'var(--bg3)',
        border: `0.5px solid var(--border)`,
        borderLeft: `3px solid ${p.accent}`,
        borderRadius: 'var(--r2)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '16px 20px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: "'Syne', sans-serif",
        }}
      >
        <span style={{
          padding: '3px 9px',
          borderRadius: 6,
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          background: p.bg,
          color: p.color,
          flexShrink: 0,
        }}>
          {p.label}
        </span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
          {rec.title}
        </span>
        {rec.impact && (
          <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 500, flexShrink: 0, marginRight: 8 }}>
            +{rec.impact}
          </span>
        )}
        <span style={{ color: 'var(--text3)', flexShrink: 0 }}>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </button>

      <motion.div
        initial={false}
        animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        style={{ overflow: 'hidden' }}
      >
        <div style={{
          padding: '0 20px 18px 20px',
          fontSize: 13,
          color: 'var(--text2)',
          lineHeight: 1.75,
          borderTop: '0.5px solid var(--border)',
          paddingTop: 14,
          marginTop: 0,
        }}>
          {rec.body}
        </div>
      </motion.div>
    </motion.div>
  );
}
