import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X } from 'lucide-react';

const fileIcons = {
  pdf: '📕',
  doc: '📘',
  docx: '📘',
  txt: '📄',
  md: '📝',
};

export default function FileDropzone({ file, onFile, onRemove, accept, label, hint }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles[0]) onFile(acceptedFiles[0]);
  }, [onFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const ext = file?.name?.split('.').pop()?.toLowerCase();
  const icon = fileIcons[ext] || '📄';

  return (
    <div>
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...getRootProps()}
            style={{
              border: `1px dashed ${isDragActive ? 'var(--accent)' : 'var(--border2)'}`,
              borderRadius: 'var(--r)',
              padding: '36px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragActive ? 'rgba(200,240,100,0.04)' : 'var(--bg3)',
              transition: 'all 0.2s',
            }}
          >
            <input {...getInputProps()} />
            <div style={{ marginBottom: 12, color: isDragActive ? 'var(--accent)' : 'var(--text3)' }}>
              <Upload size={28} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4, color: isDragActive ? 'var(--accent)' : 'var(--text)' }}>
              {isDragActive ? 'Drop it here!' : label || 'Drop file here or click to browse'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>
              {hint || 'PDF, DOCX, TXT, Markdown — up to 10 MB'}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 18px',
              background: 'rgba(200,240,100,0.07)',
              border: '0.5px solid rgba(200,240,100,0.25)',
              borderRadius: 'var(--r2)',
            }}
          >
            <span style={{ fontSize: 26 }}>{icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {file.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                {(file.size / 1024).toFixed(1)} KB
              </div>
            </div>
            <button
              onClick={onRemove}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text3)',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
