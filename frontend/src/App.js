import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import JDPage from './pages/JDPage';
import ResumePage from './pages/ResumePage';
import ResultsPage from './pages/ResultsPage';
import TelegramModal from './components/TelegramModal';

export default function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showTelegramModal, setShowTelegramModal] = useState(false);

  const [jdText, setJdText] = useState('');
  const [jdFile, setJdFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const goToPage = (page) => {
    if (page > 1 && !jdText && !jdFile) return;
    if (page > 2 && !resumeText && !resumeFile) return;
    setCurrentPage(page);
  };

  const handleAnalysisComplete = (result, jd, resume) => {
    setAnalysisResult(result);
    setCurrentPage(3);
  };

  const handleReset = () => {
    setCurrentPage(1);
    setJdText('');
    setJdFile(null);
    setResumeText('');
    setResumeFile(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentPage={currentPage}
        goToPage={goToPage}
        onTelegramClick={() => setShowTelegramModal(true)}
        hasJD={!!(jdText || jdFile)}
        hasResume={!!(resumeText || resumeFile)}
      />

      <main style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          {currentPage === 1 && (
            <JDPage
              key="page1"
              jdText={jdText}
              setJdText={setJdText}
              jdFile={jdFile}
              setJdFile={setJdFile}
              onNext={() => setCurrentPage(2)}
            />
          )}
          {currentPage === 2 && (
            <ResumePage
              key="page2"
              resumeText={resumeText}
              setResumeText={setResumeText}
              resumeFile={resumeFile}
              setResumeFile={setResumeFile}
              jdText={jdText}
              jdFile={jdFile}
              onBack={() => setCurrentPage(1)}
              onComplete={handleAnalysisComplete}
              isAnalyzing={isAnalyzing}
              setIsAnalyzing={setIsAnalyzing}
            />
          )}
          {currentPage === 3 && (
            <ResultsPage
              key="page3"
              analysisResult={analysisResult}
              jdText={jdText}
              resumeText={resumeText}
              jdFile={jdFile}
              resumeFile={resumeFile}
              onReset={handleReset}
            />
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showTelegramModal && (
          <TelegramModal onClose={() => setShowTelegramModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
