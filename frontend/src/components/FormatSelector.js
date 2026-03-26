import React from 'react';
import { motion } from 'framer-motion';

const formats = [
  {
    id: 'classic',
    name: 'Classic Single',
    desc: 'Traditional top-to-bottom, ATS-optimized',
    badge: 'Most ATS-Friendly',
    preview: <ClassicPreview />,
  },
  {
    id: 'sidebar',
    name: 'Sidebar Layout',
    desc: 'Dark left panel for skills & contact info',
    preview: <SidebarPreview />,
  },
  {
    id: 'modern',
    name: 'Modern Two-Column',
    desc: 'Bold header, split experience & skills',
    preview: <ModernPreview />,
  },
  {
    id: 'elegant',
    name: 'Elegant Serif',
    desc: 'Centered header, clean and sophisticated',
    preview: <ElegantPreview />,
  },
  {
    id: 'professional',
    name: 'Professional',
    desc: 'High-impact, compact executive layout',
    preview: <ProfessionalPreview />,
  },
];

export default function FormatSelector({ selected, onSelect }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16 }}>
      {formats.map((fmt) => {
        const isSelected = selected === fmt.id;
        return (
          <motion.div
            key={fmt.id}
            onClick={() => onSelect(fmt.id)}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            style={{
              position: 'relative',
              background: 'var(--bg3)',
              border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--border2)',
              borderRadius: 'var(--r)',
              padding: '16px',
              cursor: 'pointer',
              transition: 'border-color 0.2s, background 0.2s',
              background: isSelected ? 'rgba(200,240,100,0.05)' : 'var(--bg3)',
            }}
          >
            {/* Check */}
            <div style={{
              position: 'absolute', top: 12, right: 12,
              width: 20, height: 20, borderRadius: '50%',
              background: isSelected ? 'var(--accent)' : 'var(--bg4)',
              border: isSelected ? 'none' : '1px solid var(--border2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: '#000', transition: 'all 0.2s',
              fontWeight: 700,
            }}>
              {isSelected && '✓'}
            </div>

            {/* Badge */}
            {fmt.badge && (
              <div style={{
                position: 'absolute', top: -1, left: 16,
                padding: '2px 9px',
                background: 'var(--accent)',
                color: '#0a0a0c',
                fontSize: 10, fontWeight: 700,
                borderRadius: '0 0 6px 6px',
                letterSpacing: '0.04em',
              }}>
                {fmt.badge}
              </div>
            )}

            {/* Preview */}
            <div style={{
              aspectRatio: '3 / 4',
              background: 'var(--bg4)',
              borderRadius: 6,
              marginTop: fmt.badge ? 16 : 0,
              marginBottom: 12,
              overflow: 'hidden',
              position: 'relative',
            }}>
              {fmt.preview}
            </div>

            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{fmt.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>{fmt.desc}</div>
          </motion.div>
        );
      })}
      <style>{`@media(max-width:600px){ .format-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function ClassicPreview() {
  return (
    <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 5, height: '100%' }}>
      <div style={{ height: 10, borderRadius: 2, background: 'rgba(200,240,100,0.5)', width: '70%' }} />
      <div style={{ height: 5, borderRadius: 2, background: 'rgba(255,255,255,0.12)', width: '50%' }} />
      <div style={{ height: 0.5, background: 'rgba(200,240,100,0.3)', margin: '4px 0' }} />
      <div style={{ height: 5, borderRadius: 2, background: 'rgba(200,240,100,0.25)', width: '40%' }} />
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', width: '90%' }} />
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', width: '80%' }} />
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', width: '85%' }} />
      <div style={{ height: 0.5, background: 'rgba(200,240,100,0.3)', margin: '4px 0' }} />
      <div style={{ height: 5, borderRadius: 2, background: 'rgba(200,240,100,0.25)', width: '45%' }} />
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', width: '75%' }} />
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', width: '90%' }} />
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', width: '70%' }} />
    </div>
  );
}

function SidebarPreview() {
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ width: '35%', background: 'rgba(26,26,40,0.9)', padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ height: 8, borderRadius: 2, background: 'rgba(200,240,100,0.6)', width: '90%' }} />
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(200,240,100,0.3)', width: '70%' }} />
        <div style={{ height: 0.5, background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', width: '80%' }} />
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', width: '65%' }} />
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', width: '75%' }} />
        <div style={{ height: 0.5, background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', width: '80%' }} />
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', width: '60%' }} />
      </div>
      <div style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ height: 5, borderRadius: 2, background: 'rgba(200,240,100,0.25)', width: '50%' }} />
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', width: '95%' }} />
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', width: '85%' }} />
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', width: '90%' }} />
        <div style={{ height: 0.5, background: 'rgba(200,240,100,0.2)', margin: '4px 0' }} />
        <div style={{ height: 5, borderRadius: 2, background: 'rgba(255,255,255,0.18)', width: '80%' }} />
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', width: '90%' }} />
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', width: '75%' }} />
      </div>
    </div>
  );
}

function ModernPreview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ background: 'rgba(14,14,26,0.95)', padding: '10px 10px 8px' }}>
        <div style={{ height: 10, borderRadius: 2, background: 'rgba(255,255,255,0.7)', width: '75%', marginBottom: 4 }} />
        <div style={{ height: 5, borderRadius: 2, background: 'rgba(200,240,100,0.7)', width: '45%', marginBottom: 4 }} />
        <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.2)', width: '85%' }} />
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, padding: '6px 8px', background: 'var(--bg4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingRight: 6, borderRight: '0.5px solid rgba(255,255,255,0.08)' }}>
          <div style={{ height: 4, borderRadius: 2, background: 'rgba(200,240,100,0.3)', width: '60%' }} />
          <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.1)', width: '80%' }} />
          <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.1)', width: '90%' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingLeft: 6 }}>
          <div style={{ height: 4, borderRadius: 2, background: 'rgba(200,240,100,0.3)', width: '60%' }} />
          <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.1)', width: '70%' }} />
        </div>
      </div>
      <div style={{ padding: '0 8px 8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(200,240,100,0.25)', width: '50%', marginTop: 6 }} />
        <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)', width: '90%' }} />
        <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)', width: '80%' }} />
      </div>
    </div>
  );
}

function ElegantPreview() {
  return (
    <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 4, height: '100%', alignItems: 'center' }}>
      <div style={{ height: 8, borderRadius: 1, background: 'rgba(44, 62, 80, 0.7)', width: '60%', marginBottom: 2 }} />
      <div style={{ height: 4, borderRadius: 1, background: 'rgba(127, 140, 141, 0.5)', width: '40%', marginBottom: 4 }} />
      <div style={{ height: 0.5, background: 'rgba(189, 195, 199, 0.5)', width: '80%', margin: '4px 0' }} />
      <div style={{ height: 4, borderRadius: 1, background: 'rgba(44, 62, 80, 0.4)', width: '30%', marginTop: 6 }} />
      <div style={{ height: 3, borderRadius: 1, background: 'rgba(0,0,0,0.06)', width: '90%' }} />
      <div style={{ height: 3, borderRadius: 1, background: 'rgba(0,0,0,0.06)', width: '85%' }} />
      <div style={{ height: 0.5, background: 'rgba(189, 195, 199, 0.5)', width: '40%', margin: '8px 0' }} />
      <div style={{ height: 4, borderRadius: 1, background: 'rgba(44, 62, 80, 0.4)', width: '35%' }} />
      <div style={{ height: 3, borderRadius: 1, background: 'rgba(0,0,0,0.06)', width: '95%' }} />
    </div>
  );
}

function ProfessionalPreview() {
  return (
    <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
      <div style={{ height: 10, borderRadius: 1, background: 'rgba(0,0,0,0.85)', width: '50%', marginBottom: 2 }} />
      <div style={{ height: 3, borderRadius: 1, background: 'rgba(0,0,0,0.2)', width: '90%', marginBottom: 8 }} />
      
      <div style={{ height: 12, background: 'rgba(0,0,0,0.05)', width: '100%', borderRadius: 2, marginBottom: 4 }} />
      <div style={{ height: 4, borderRadius: 1, background: 'rgba(0,0,0,0.15)', width: '85%' }} />
      <div style={{ height: 4, borderRadius: 1, background: 'rgba(0,0,0,0.15)', width: '80%' }} />
      <div style={{ height: 4, borderRadius: 1, background: 'rgba(0,0,0,0.15)', width: '75%' }} />

      <div style={{ height: 12, background: 'rgba(0,0,0,0.05)', width: '100%', borderRadius: 2, marginTop: 10, marginBottom: 4 }} />
      <div style={{ height: 4, borderRadius: 1, background: 'rgba(0,0,0,0.15)', width: '90%' }} />
    </div>
  );
}
