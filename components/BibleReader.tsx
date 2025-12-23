
import React, { useState, useMemo } from 'react';
import { Verse, BibleBook } from '../types';
import { BOOKS } from '../constants';
import { fetchChapter } from '../services/bibleService';
import { ChevronRight, Search, ChevronLeft, LayoutGrid, List, BookText, Sparkles, Cast } from 'lucide-react';

interface BibleReaderProps {
  onVerseSelect: (verse: Verse) => void;
}

const BibleReader: React.FC<BibleReaderProps> = ({ onVerseSelect }) => {
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isBookMenuOpen, setIsBookMenuOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  const oldTestament = useMemo(() => BOOKS.slice(0, 39), []);
  const newTestament = useMemo(() => BOOKS.slice(39), []);

  const filterList = (list: BibleBook[]) => 
    list.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const loadVerses = async (book: BibleBook, chapter: number) => {
    setLoading(true);
    const data = await fetchChapter(book.id, book.name, chapter);
    setVerses(data);
    setLoading(false);
    setIsBookMenuOpen(false);
  };

  const handleBookClick = (book: BibleBook) => {
    setSelectedBook(book);
    setSelectedChapter(null);
    setVerses([]);
    setSearchTerm(''); 
  };

  const handleChapterClick = (chapter: number) => {
    if (!selectedBook) return;
    setSelectedChapter(chapter);
    loadVerses(selectedBook, chapter);
  };

  const renderBookItem = (book: BibleBook) => {
    if (layoutMode === 'grid') {
      return (
        <button
          key={book.id}
          onClick={() => handleBookClick(book)}
          className="flex flex-col items-center justify-center aspect-square p-2 bg-slate-900/40 border border-white/10 rounded-2xl active:scale-95 transition-all shadow-xl group relative overflow-hidden"
        >
          <div className="absolute top-2 left-2 text-[8px] font-black text-slate-600 group-hover:text-blue-500/50 transition-colors uppercase">
            {book.id}
          </div>
          <span className="font-bold text-[12px] text-center leading-tight px-1 uppercase tracking-tight group-hover:text-blue-400 transition-colors">
            {book.name}
          </span>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      );
    }

    return (
      <button
        key={book.id}
        onClick={() => handleBookClick(book)}
        className="flex items-center justify-between p-4 bg-slate-900/30 border border-white/5 rounded-2xl active:scale-[0.98] transition-all shadow-md mb-2 w-full hover:bg-slate-800 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
            {book.id}
          </div>
          <span className="font-bold uppercase tracking-tight text-slate-200 group-hover:text-white transition-colors">{book.name}</span>
        </div>
        <ChevronRight size={18} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans">
      {/* Header Premium Redesenhado */}
      <header className="safe-top bg-slate-900/95 backdrop-blur-2xl px-6 pt-8 pb-6 border-b border-white/5 sticky top-0 z-30 shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {!isBookMenuOpen && (
              <button onClick={() => setIsBookMenuOpen(true)} className="p-2 -ml-3 rounded-full active:bg-white/10 text-blue-500 transition-transform active:scale-75">
                <ChevronLeft size={28} />
              </button>
            )}
            <div className="relative group">
              {/* Brilho de fundo (Glow) */}
              <div className="absolute -inset-2 bg-blue-600/20 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <div className="relative flex items-center gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] rotate-3 group-hover:rotate-0 transition-transform">
                      <Cast size={18} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter font-spartan uppercase leading-none flex items-center">
                      <span className="text-slate-50">Bíblia</span>
                      <span className="mx-1.5 w-1.5 h-1.5 rounded-full bg-blue-500/50"></span>
                      <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Projeção</span>
                    </h1>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="h-[1px] w-4 bg-blue-500/30"></div>
                    <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.5em]">Semeando a Palavra</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {isBookMenuOpen && !selectedBook && (
            <div className="flex bg-slate-800/40 p-1 rounded-xl border border-white/5 shadow-inner">
              <button 
                onClick={() => setLayoutMode('grid')} 
                className={`p-2 rounded-lg transition-all ${layoutMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button 
                onClick={() => setLayoutMode('list')} 
                className={`p-2 rounded-lg transition-all ${layoutMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}
              >
                <List size={16} />
              </button>
            </div>
          )}
        </div>

        {isBookMenuOpen && !selectedBook && (
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Encontrar livro sagrado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-slate-800 transition-all placeholder:text-slate-700 shadow-inner"
            />
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto">
        {isBookMenuOpen ? (
          <div className="px-6 pt-6 pb-28">
            {!selectedBook ? (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Antigo Testamento */}
                {filterList(oldTestament).length > 0 && (
                  <section>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">
                        Antigo Testamento
                      </h3>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
                    </div>
                    <div className={layoutMode === 'grid' ? "grid grid-cols-3 sm:grid-cols-4 gap-4" : "flex flex-col"}>
                      {filterList(oldTestament).map(renderBookItem)}
                    </div>
                  </section>
                )}

                {/* Novo Testamento */}
                {filterList(newTestament).length > 0 && (
                  <section>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">
                        Novo Testamento
                      </h3>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent"></div>
                    </div>
                    <div className={layoutMode === 'grid' ? "grid grid-cols-3 sm:grid-cols-4 gap-4" : "flex flex-col"}>
                      {filterList(newTestament).map(renderBookItem)}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              /* Seletor de Capítulos Moderno */
              <div className="animate-in zoom-in-95 duration-500">
                <div className="text-center py-12 relative">
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-[0.03] scale-150 -z-10 text-blue-500">
                     <BookText size={180} />
                   </div>
                  <button onClick={() => setSelectedBook(null)} className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 bg-blue-500/10 px-6 py-2.5 rounded-full border border-blue-500/20 active:scale-90 transition-all inline-flex items-center gap-2">
                    <ChevronLeft size={14} />
                    Voltar para Livros
                  </button>
                  <h2 className="text-6xl font-black font-spartan tracking-tighter uppercase mb-3 text-white drop-shadow-2xl">{selectedBook.name}</h2>
                  <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full mb-3 shadow-[0_0_15px_rgba(37,99,235,0.6)]"></div>
                  <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.5em]">Selecione o Capítulo</p>
                </div>
                
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 p-4 bg-slate-900/30 rounded-[2.5rem] border border-white/5">
                  {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(ch => (
                    <button
                      key={ch}
                      onClick={() => handleChapterClick(ch)}
                      className={`aspect-square flex items-center justify-center rounded-2xl font-black text-xl transition-all shadow-lg active:scale-75 ${
                        selectedChapter === ch ? 'bg-blue-600 text-white ring-4 ring-blue-500/20' : 'bg-slate-800/80 border border-white/10 hover:border-blue-500/30 text-slate-400'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Lista de Versículos Premium */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 px-6 pt-12 pb-28">
             <div className="mb-14 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Sparkles size={14} className="text-blue-500" />
                  <p className="text-[11px] text-blue-400 font-black uppercase tracking-[0.6em]">{selectedBook?.name.toUpperCase()}</p>
                  <Sparkles size={14} className="text-blue-500" />
                </div>
                <h2 className="text-7xl font-black tracking-tighter font-spartan uppercase leading-none text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                  {selectedChapter}
                </h2>
                <div className="mt-10 inline-flex items-center gap-3 px-8 py-3 bg-blue-600 text-white rounded-2xl shadow-[0_15px_35px_rgba(37,99,235,0.4)] border border-blue-400/30 active:scale-95 transition-transform">
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shadow-[0_0_10px_white]"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Toque no versículo para projetar</p>
                </div>
             </div>

            {loading ? (
              <div className="flex flex-col justify-center items-center py-40 gap-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-slate-800 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-t-blue-500 rounded-full animate-spin absolute top-0 left-0 shadow-[0_0_20px_rgba(37,99,235,0.3)]"></div>
                </div>
                <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] animate-pulse">Sincronizando Escrituras...</p>
              </div>
            ) : (
              <div className="space-y-6 max-w-2xl mx-auto">
                {verses.map((v) => (
                  <button
                    key={v.verse}
                    onClick={() => onVerseSelect(v)}
                    className="w-full text-left p-8 bg-slate-900/60 border border-white/5 rounded-[2.5rem] active:bg-blue-600 active:text-white active:scale-[0.98] transition-all group flex gap-6 items-start shadow-xl hover:bg-slate-900/90 hover:border-white/10"
                  >
                    <span className="shrink-0 font-black text-blue-500 group-active:text-white text-base bg-blue-500/10 group-active:bg-white/20 w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-inner border border-blue-500/10 group-active:border-white/20">
                      {v.verse}
                    </span>
                    <span className="text-xl leading-[1.6] font-medium tracking-tight text-slate-200 group-active:text-white transition-colors">{v.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Info Overlay */}
      {!isBookMenuOpen && !loading && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full px-8 max-w-xs z-20 pointer-events-none">
          <div className="bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-2xl py-5 px-6 shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex items-center justify-center gap-4 animate-in slide-in-from-bottom-10">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_15px_#3b82f6] animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white">
              SISTEMA PRONTO
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BibleReader;
