import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import FileDropzone from '../components/FileDropzone';

const pageVariants = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: 24, transition: { duration: 0.2 } },
};

export default function JDPage({ jdText, setJdText, jdFile, setJdFile, onNext }) {
  const hasContent = jdText.trim() || jdFile;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ maxWidth: 760, margin: '0 auto', padding: '56px 32px' }}
    >
      {/* Heading */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: 16, textTransform: 'uppercase' }}>
          Step 1 of 3
        </div>
        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 'clamp(36px, 6vw, 56px)',
          lineHeight: 1.1,
          marginBottom: 12,
        }}>
          Paste the Job<br />
          <em style={{ color: 'var(--text2)' }}>Description</em>
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 15, marginBottom: 48, maxWidth: 480 }}>
          Upload a JD file or paste the text directly. Supports PDF, DOCX, TXT, and Markdown.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.12 } }}>
        {/* File Upload */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 10 }}>
            Upload JD File
          </label>
          <FileDropzone
            file={jdFile}
            onFile={setJdFile}
            onRemove={() => setJdFile(null)}
            accept={{ 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'], 'text/markdown': ['.md'] }}
            label="Drop your JD file here or click to browse"
            hint="PDF, DOCX, TXT, Markdown — up to 10 MB"
          />
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap' }}>or paste text directly</span>
          <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
        </div>

        {/* Textarea */}
        <div style={{ marginBottom: 40 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 10 }}>
            Paste JD Text
          </label>
          <textarea
            value={jdText}
            onChange={e => setJdText(e.target.value)}
            placeholder={`We're looking for a Senior Software Engineer with 5+ years of experience in Python, AWS, and distributed systems.\n\nResponsibilities:\n• Design and build scalable microservices...\n• Collaborate with product and design teams...\n\nRequirements:\n• Strong proficiency in Python or Go\n• Experience with AWS (EC2, S3, Lambda)\n• Familiarity with Docker and Kubernetes...`}
            style={{
              width: '100%',
              minHeight: 220,
              background: 'var(--bg3)',
              border: '0.5px solid var(--border2)',
              borderRadius: 'var(--r2)',
              color: 'var(--text)',
              fontSize: 13,
              lineHeight: 1.7,
              padding: '16px 18px',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s',
              fontFamily: "'Syne', sans-serif",
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(200,240,100,0.5)'}
            onBlur={e => e.target.style.borderColor = 'var(--border2)'}
          />
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <motion.button
            onClick={onNext}
            disabled={!hasContent}
            whileHover={hasContent ? { scale: 1.02, translateY: -1 } : {}}
            whileTap={hasContent ? { scale: 0.98 } : {}}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '13px 28px',
              borderRadius: 'var(--r2)',
              border: 'none',
              background: hasContent ? 'var(--accent)' : 'var(--bg4)',
              color: hasContent ? '#0a0a0c' : 'var(--text3)',
              fontSize: 14,
              fontWeight: 600,
              cursor: hasContent ? 'pointer' : 'not-allowed',
              fontFamily: "'Syne', sans-serif",
              transition: 'all 0.2s',
            }}
          >
            Continue to Resume
            <ArrowRight size={16} />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
