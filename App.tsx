
import React, { useState, useEffect } from 'react';
import BibleReader from './components/BibleReader';
import SlideEditor from './components/SlideEditor';
import { Verse, ViewState } from './types';
import { Download } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('reader');
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    // Detecta se o navegador permite instalação
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    });

    window.addEventListener('appinstalled', () => {
      setShowInstallBtn(false);
      setDeferredPrompt(null);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  const handleVerseSelect = (verse: Verse) => {
    setSelectedVerse(verse);
    setView('editor');
  };

  const handleBackToReader = () => {
    setView('reader');
  };

  return (
    <div className="fixed inset-0 bg-slate-950 overflow-hidden select-none">
      {/* Botão de Instalação Flutuante para Android */}
      {showInstallBtn && view === 'reader' && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <button 
            onClick={handleInstallClick}
            className="bg-emerald-600 text-white px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-[0_10px_30px_rgba(5,150,105,0.4)] flex items-center gap-2 border border-emerald-400/30"
          >
            <Download size={14} />
            Baixar App
          </button>
        </div>
      )}

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
