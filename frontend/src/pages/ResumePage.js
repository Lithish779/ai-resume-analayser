import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import FileDropzone from '../components/FileDropzone';

const pageVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -24, transition: { duration: 0.2 } },
};

const loadingMessages = [
  'Extracting keywords from job description...',
  'Scanning resume for skill matches...',
  'Calculating ATS relevance score...',
  'Identifying keyword gaps...',
  'Generating improvement recommendations...',
  'Finalizing your analysis...',
];

export default function ResumePage({ resumeText, setResumeText, resumeFile, setResumeFile, jdText, jdFile, onBack, onComplete, isAnalyzing, setIsAnalyzing }) {
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [error, setError] = useState('');
  const hasContent = resumeText.trim() || resumeFile;

  const handleAnalyze = async () => {
    if (!hasContent) return;
    setError('');
    setIsAnalyzing(true);

    const interval = setInterval(() => {
      setLoadingMsg(prev => (prev + 1) % loadingMessages.length);
    }, 2200);

    try {
      const formData = new FormData();
      if (jdFile) formData.append('jdFile', jdFile);
      else formData.append('jdText', jdText);
      if (resumeFile) formData.append('resumeFile', resumeFile);
      else formData.append('resumeText', resumeText);

      const res = await axios.post('/api/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      clearInterval(interval);
      setIsAnalyzing(false);
      onComplete(res.data.data, res.data.jdText, res.data.resumeText);
    } catch (err) {
      clearInterval(interval);
      setIsAnalyzing(false);
      setError(err.response?.data?.error || 'Analysis failed. Please check your API key and try again.');
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ maxWidth: 760, margin: '0 auto', padding: '56px 32px' }}
    >
      {/* Loading overlay */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,10,12,0.92)',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
          }}
        >
          <div style={{
            width: 56, height: 56,
            border: '2px solid var(--border2)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, marginBottom: 8 }}>
              Analyzing your resume...
            </div>
            <motion.div
              key={loadingMsg}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ color: 'var(--text2)', fontSize: 13 }}
            >
              {loadingMessages[loadingMsg]}
            </motion.div>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: 16, textTransform: 'uppercase' }}>
          Step 2 of 3
        </div>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(36px, 6vw, 56px)', lineHeight: 1.1, marginBottom: 12 }}>
          Upload your<br />
          <em style={{ color: 'var(--text2)' }}>Resume</em>
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 15, marginBottom: 48, maxWidth: 480 }}>
          Share your resume — we'll run AI-powered ATS analysis and score it against the job description.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.12 } }}>
        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 10 }}>
            Upload Resume File
          </label>
          <FileDropzone
            file={resumeFile}
            onFile={setResumeFile}
            onRemove={() => setResumeFile(null)}
            accept={{ 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] }}
            label="Drop your resume here or click to browse"
            hint="PDF or DOCX preferred for best parsing results"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap' }}>or paste text directly</span>
          <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
        </div>

        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 10 }}>
            Paste Resume Text
          </label>
          <textarea
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            placeholder={`John Doe\njohn@email.com  |  +1 (555) 000-1234  |  San Francisco, CA\n\nSUMMARY\nFull-stack engineer with 4 years of experience building web applications...\n\nEXPERIENCE\nSoftware Engineer — Acme Corp  (2021 – Present)\n• Built REST APIs serving 500K+ daily users\n• Reduced database query time by 35%...\n\nSKILLS\nPython, JavaScript, React, Node.js, PostgreSQL, Git...`}
            style={{
              width: '100%',
              minHeight: 260,
              background: 'var(--bg3)',
              border: '0.5px solid var(--border2)',
              borderRadius: 'var(--r2)',
              color: 'var(--text)',
              fontSize: 13,
              lineHeight: 1.7,
              padding: '16px 18px',
              resize: 'vertical',
              outline: 'none',
              fontFamily: "'Syne', sans-serif",
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(200,240,100,0.5)'}
            onBlur={e => e.target.style.borderColor = 'var(--border2)'}
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: '12px 16px',
              background: 'var(--danger-dim)',
              border: '0.5px solid rgba(245,101,101,0.3)',
              borderRadius: 'var(--r3)',
              color: 'var(--danger)',
              fontSize: 13,
              marginBottom: 24,
            }}
          >
            ⚠️ {error}
          </motion.div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 22px', borderRadius: 'var(--r2)',
              border: '0.5px solid var(--border2)', background: 'transparent',
              color: 'var(--text2)', fontSize: 14, fontWeight: 500,
              fontFamily: "'Syne', sans-serif", cursor: 'pointer',
            }}
          >
            <ArrowLeft size={15} /> Back
          </motion.button>

          <motion.button
            onClick={handleAnalyze}
            disabled={!hasContent || isAnalyzing}
            whileHover={hasContent && !isAnalyzing ? { scale: 1.02, translateY: -1 } : {}}
            whileTap={hasContent && !isAnalyzing ? { scale: 0.98 } : {}}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '13px 28px', borderRadius: 'var(--r2)',
              border: 'none',
              background: hasContent && !isAnalyzing ? 'var(--accent)' : 'var(--bg4)',
              color: hasContent && !isAnalyzing ? '#0a0a0c' : 'var(--text3)',
              fontSize: 14, fontWeight: 600,
              cursor: hasContent && !isAnalyzing ? 'pointer' : 'not-allowed',
              fontFamily: "'Syne', sans-serif", transition: 'all 0.2s',
            }}
          >
            {isAnalyzing ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Analyzing...</> : <>Analyze Resume <ArrowRight size={15} /></>}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
