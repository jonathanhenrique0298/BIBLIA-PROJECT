
import React, { useState } from 'react';
import BibleReader from './components/BibleReader';
import SlideEditor from './components/SlideEditor';
import { Verse, ViewState } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('reader');
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);

  const handleVerseSelect = (verse: Verse) => {
    setSelectedVerse(verse);
    setView('editor');
  };

  const handleBackToReader = () => {
    setView('reader');
  };

  return (
    <div className="fixed inset-0 bg-slate-900 overflow-hidden select-none">
      {view === 'reader' && (
        <BibleReader onVerseSelect={handleVerseSelect} />
      )}
      {view === 'editor' && selectedVerse && (
        <SlideEditor 
          verse={selectedVerse} 
          onBack={handleBackToReader} 
        />
      )}
    </div>
  );
};

export default App;
