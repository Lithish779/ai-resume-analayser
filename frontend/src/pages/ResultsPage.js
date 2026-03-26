import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Download, CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import FormatSelector from '../components/FormatSelector';
import ScoreRing from '../components/ScoreRing';
import RecommendationCard from '../components/RecommendationCard';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export default function ResultsPage({ analysisResult, jdText, resumeText, jdFile, resumeFile, onReset }) {
  const [selectedFormat, setSelectedFormat] = useState('classic');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);
  const [showAllRecs, setShowAllRecs] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [customKeyword, setCustomKeyword] = useState('');

  const r = analysisResult;
  const score = r?.score || 0;

  useEffect(() => {
    let start = 0;
    const end = score;
    if (start === end) return;
    const duration = 1200;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = end / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setAnimatedScore(end); clearInterval(timer); }
      else setAnimatedScore(Math.floor(start));
    }, stepTime);
    return () => clearInterval(timer);
  }, [score]);

  const getScoreColor = (s) => s >= 75 ? 'var(--accent)' : s >= 50 ? 'var(--warn)' : 'var(--danger)';
  const getScoreLabel = (s) => s >= 75 ? { text: 'Strong Match', color: 'var(--accent)', bg: 'var(--accent-dim)' } : s >= 50 ? { text: 'Partial Match', color: 'var(--warn)', bg: 'var(--warn-dim)' } : { text: 'Low Match', color: 'var(--danger)', bg: 'var(--danger-dim)' };

  const chip = getScoreLabel(score);
  const visibleRecs = showAllRecs ? r?.recommendations : r?.recommendations?.slice(0, 3);

  const handleDownload = async (fileType = 'docx') => {
    setIsDownloading(fileType);
    try {
      const jdContent = jdText || (jdFile ? `[File: ${jdFile.name}]` : '');
      const resumeContent = resumeText || (resumeFile ? `[File: ${resumeFile.name}]` : '');

      const res = await axios.post('/api/download', {
        jdText: jdContent,
        resumeText: resumeContent,
        format: selectedFormat,
        fileType: fileType,
        analysisResult: r,
        customKeywords: selectedKeywords,
      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      const ext = fileType === 'pdf' ? 'pdf' : 'docx';
      link.setAttribute('download', `ResumeIQ_Optimized_${selectedFormat}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setDownloadDone(true);
      setTimeout(() => setDownloadDone(false), 4000);
    } catch (err) {
      alert('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!r) return null;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ maxWidth: 860, margin: '0 auto', padding: '48px 32px' }}
    >
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: 10, textTransform: 'uppercase' }}>
            Step 3 of 3 — Results
          </div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(30px, 5vw, 46px)', lineHeight: 1.15, marginBottom: 12 }}>
            Your Analysis
          </h1>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 20, background: chip.bg, color: chip.color, fontSize: 12, fontWeight: 600 }}>
            {score >= 75 ? <CheckCircle2 size={13} /> : score >= 50 ? <AlertCircle size={13} /> : <XCircle size={13} />}
            {chip.text}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button
            onClick={onReset}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 'var(--r3)', border: '0.5px solid var(--border2)', background: 'transparent', color: 'var(--text2)', fontSize: 13, fontWeight: 500, fontFamily: "'Syne', sans-serif", cursor: 'pointer' }}
          >
            <RotateCcw size={14} /> Start Over
          </motion.button>
        </div>
      </div>

      {/* Score Hero */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 40, marginBottom: 48, alignItems: 'center' }}
        className="score-hero">
        <ScoreRing score={animatedScore} color={getScoreColor(score)} />
        <div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(22px, 4vw, 32px)', lineHeight: 1.2, marginBottom: 12 }}>
            {r.verdict}
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.8, maxWidth: 460 }}>
            {r.description}
          </p>
          {r.ats_tips?.length > 0 && (
            <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {r.ats_tips.map((tip, i) => (
                <span key={i} style={{ padding: '4px 12px', borderRadius: 20, background: 'var(--bg3)', border: '0.5px solid var(--border)', color: 'var(--text2)', fontSize: 12 }}>
                  💡 {tip}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .score-hero { grid-template-columns: 1fr !important; text-align: center; }
        }
      `}</style>

      {/* Score Breakdown */}
      <Section title="Score Breakdown">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {r.breakdown?.map((item, i) => (
            <BreakdownBar key={i} item={item} delay={i * 0.08} />
          ))}
        </div>
      </Section>

      <Divider />

      {/* Keyword Analysis */}
      <Section title="Keyword Analysis">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={13} /> Matched Keywords
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {r.matched_keywords?.map((kw, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.04 } }}
                  style={{ padding: '5px 12px', borderRadius: 20, background: 'rgba(200,240,100,0.1)', border: '0.5px solid rgba(200,240,100,0.25)', color: 'var(--accent)', fontSize: 12, fontWeight: 500 }}
                >
                  {kw}
                </motion.span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <XCircle size={13} /> Missing Keywords
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {r.missing_keywords?.map((kw, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.04 } }}
                  style={{ padding: '5px 12px', borderRadius: 20, background: 'rgba(245,101,101,0.1)', border: '0.5px solid rgba(245,101,101,0.25)', color: 'var(--danger)', fontSize: 12, fontWeight: 500 }}
                >
                  {kw}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Improved Summary */}
      {r.improved_summary && (
        <>
          <Divider />
          <Section title="AI-Improved Professional Summary">
            <div style={{
              padding: '20px 24px',
              background: 'var(--bg3)',
              border: '0.5px solid var(--border2)',
              borderLeft: '3px solid var(--accent)',
              borderRadius: 'var(--r2)',
              fontSize: 14,
              lineHeight: 1.8,
              color: 'var(--text)',
              fontStyle: 'italic',
            }}>
              "{r.improved_summary}"
            </div>
          </Section>
        </>
      )}

      {/* Recommendations */}
      {r.recommendations?.length > 0 && (
        <>
          <Divider />
          <Section title={`Recommendations to Improve (${r.recommendations.length})`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <AnimatePresence>
                {visibleRecs?.map((rec, i) => (
                  <RecommendationCard key={i} rec={rec} index={i} />
                ))}
              </AnimatePresence>
            </div>
            {r.recommendations.length > 3 && (
              <button
                onClick={() => setShowAllRecs(!showAllRecs)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, marginTop: 16,
                  background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer',
                  fontSize: 13, fontWeight: 500, fontFamily: "'Syne', sans-serif",
                }}
              >
                {showAllRecs ? <><ChevronUp size={15} /> Show less</> : <><ChevronDown size={15} /> Show {r.recommendations.length - 3} more recommendations</>}
              </button>
            )}
          </Section>
        </>
      )}

      <Divider />

      <Section title="Keyword Optimizer">
        <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 20, lineHeight: 1.7 }}>
          Select keywords from the missing list to include in your optimized resume, or add your own.
        </p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          {r.missing_keywords?.map((kw, i) => {
            const isSelected = selectedKeywords.includes(kw);
            return (
              <motion.button
                key={kw}
                onClick={() => {
                  setSelectedKeywords(prev => 
                    prev.includes(kw) ? prev.filter(x => x !== kw) : [...prev, kw]
                  );
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: `0.5px solid ${isSelected ? 'var(--accent)' : 'var(--border2)'}`,
                  background: isSelected ? 'rgba(200,240,100,0.15)' : 'var(--bg3)',
                  color: isSelected ? 'var(--accent)' : 'var(--text2)',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {isSelected ? '✓ ' : '+ '} {kw}
              </motion.button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            type="text"
            value={customKeyword}
            onChange={(e) => setCustomKeyword(e.target.value)}
            placeholder="Add custom keyword (e.g. AWS, Python)..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customKeyword.trim()) {
                if (!selectedKeywords.includes(customKeyword.trim())) {
                  setSelectedKeywords([...selectedKeywords, customKeyword.trim()]);
                }
                setCustomKeyword('');
              }
            }}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 'var(--r3)',
              background: 'var(--bg3)',
              border: '0.5px solid var(--border2)',
              color: 'var(--text)',
              fontSize: 13,
              fontFamily: 'inherit'
            }}
          />
          <button
            onClick={() => {
              if (customKeyword.trim()) {
                if (!selectedKeywords.includes(customKeyword.trim())) {
                  setSelectedKeywords([...selectedKeywords, customKeyword.trim()]);
                }
                setCustomKeyword('');
              }
            }}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--r3)',
              background: 'var(--accent)',
              color: '#000',
              border: 'none',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Add
          </button>
        </div>

        {selectedKeywords.filter(kw => !r.missing_keywords?.includes(kw)).length > 0 && (
          <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {selectedKeywords.filter(kw => !r.missing_keywords?.includes(kw)).map(kw => (
              <span key={kw} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 4, background: 'var(--bg4)', border: '1px solid var(--border)', fontSize: 11 }}>
                {kw} <XCircle size={10} style={{ cursor: 'pointer' }} onClick={() => setSelectedKeywords(prev => prev.filter(x => x !== kw))} />
              </span>
            ))}
          </div>
        )}
      </Section>

      <Divider />

      <Section title="Choose Resume Format & Download">
        <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 28, lineHeight: 1.7 }}>
          Your improved resume content will be rewritten and tailored to this JD, then exported in your chosen format.
        </p>
        <FormatSelector selected={selectedFormat} onSelect={setSelectedFormat} />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
          style={{
            display: 'flex', alignItems: 'center', gap: 20,
            padding: '24px 28px',
            background: downloadDone ? 'rgba(200,240,100,0.08)' : 'var(--bg3)',
            border: `0.5px solid ${downloadDone ? 'rgba(200,240,100,0.3)' : 'var(--border2)'}`,
            borderRadius: 'var(--r)',
            marginTop: 28,
            transition: 'all 0.3s',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
              {downloadDone ? '✅ Downloaded Successfully!' : 'Export Optimized Resume'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>
              {downloadDone
                ? 'Your AI-optimized resume has been saved to your Downloads folder.'
                : `${selectedFormat.charAt(0).toUpperCase() + selectedFormat.slice(1)} style · Tailored by AI`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <motion.button
              onClick={() => handleDownload('docx')}
              disabled={!!isDownloading}
              whileHover={!isDownloading ? { scale: 1.03, translateY: -1 } : {}}
              whileTap={!isDownloading ? { scale: 0.97 } : {}}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                padding: '12px 20px', borderRadius: 'var(--r2)', border: '1px solid var(--border)',
                background: isDownloading === 'docx' ? 'var(--bg4)' : 'transparent',
                color: isDownloading === 'docx' ? 'var(--text3)' : 'var(--text)',
                fontSize: 14, fontWeight: 600, cursor: isDownloading ? 'not-allowed' : 'pointer',
                fontFamily: "'Syne', sans-serif", transition: 'all 0.2s',
              }}
            >
              {isDownloading === 'docx' ? <Spinner /> : <><Download size={15} /> .DOCX</>}
            </motion.button>

            <motion.button
              onClick={() => handleDownload('pdf')}
              disabled={!!isDownloading}
              whileHover={!isDownloading ? { scale: 1.03, translateY: -1 } : {}}
              whileTap={!isDownloading ? { scale: 0.97 } : {}}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                padding: '12px 24px', borderRadius: 'var(--r2)', border: 'none',
                background: isDownloading === 'pdf' ? 'var(--bg4)' : 'var(--accent)',
                color: isDownloading === 'pdf' ? 'var(--text3)' : '#0a0a0c',
                fontSize: 14, fontWeight: 600, cursor: isDownloading ? 'not-allowed' : 'pointer',
                fontFamily: "'Syne', sans-serif", transition: 'all 0.2s',
              }}
            >
              {isDownloading === 'pdf' ? <Spinner /> : <><Download size={15} /> Download PDF</>}
            </motion.button>
          </div>
        </motion.div>
      </Section>

    </motion.div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 20 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: '0.5px', background: 'var(--border)', margin: '40px 0' }} />;
}

function BreakdownBar({ item, delay }) {
  const [width, setWidth] = useState(0);
  const color = item.score >= 70 ? 'var(--accent)' : item.score >= 45 ? 'var(--warn)' : 'var(--danger)';

  useEffect(() => {
    const t = setTimeout(() => setWidth(item.score), 200 + delay * 1000);
    return () => clearTimeout(t);
  }, [item.score, delay]);

  return (
    <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0, transition: { delay } }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {item.note && <span style={{ fontSize: 11, color: 'var(--text3)' }}>{item.note}</span>}
          <span style={{ fontSize: 13, color, fontWeight: 600, minWidth: 36, textAlign: 'right' }}>{item.score}%</span>
        </div>
      </div>
      <div style={{ height: 5, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${width}%`, background: color, borderRadius: 3, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </motion.div>
  );
}
function Spinner() {
  return (
    <span style={{
      width: 15, height: 15,
      border: '2px solid currentColor',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      display: 'inline-block'
    }} />
  );
}
