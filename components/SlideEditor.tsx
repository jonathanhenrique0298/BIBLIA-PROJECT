
import { ArrowLeft, Download, MoveVertical, Maximize2, Image as ImageIcon, Trash2, X, AlignLeft, AlignCenter, AlignRight, Type } from 'lucide-react';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { SlideConfig, Verse } from '../types';

interface SlideEditorProps {
  verse: Verse;
  onBack: () => void;
}

const PRESET_COLORS = [
  '#ffffff', '#ffff00', '#ff0000', '#00ff00', '#00ffff', 
  '#ff00ff', '#ffa500', '#c0c0c0', '#42a5f5', '#ffeb3b', '#fb923c', '#f472b6'
];

interface TextPart {
  text: string;
  wordIndex: number; 
  isContinuation: boolean;
}

const SlideEditor: React.FC<SlideEditorProps> = ({ verse, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bgImageElement, setBgImageElement] = useState<HTMLImageElement | null>(null);
  const [selectedWordIdx, setSelectedWordIdx] = useState<number | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  const [config, setConfig] = useState<SlideConfig>({
    verse,
    fontSize: 120,
    backgroundColor: '#000000',
    textColor: '#ffffff',
    lineHeight: 1.05,
    textAlign: 'center',
    backgroundImage: undefined,
    wordColors: {},
    showShadow: true
  });

  // Margem mínima para o layout (invisível, mas respeitada no cálculo)
  const MARGIN_PIXELS = 80;
  const SAFETY_FACTOR = 0.92;

  useEffect(() => {
    document.fonts.load('bold 16px "League Spartan"').then(() => {
      setFontsLoaded(true);
    });
  }, []);

  const originalWords = useMemo(() => {
    const cleanText = (verse.text || "").trim().replace(/^["']+|["']+$/g, '');
    const fullText = `"${cleanText}"`.toUpperCase();
    return fullText.split(/\s+/);
  }, [verse.text]);

  const measureTextWidth = (text: string, fontSize: number): number => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;
    ctx.font = `bold ${fontSize}px "League Spartan"`;
    return ctx.measureText(text).width;
  };

  const wrappedLines = useMemo(() => {
    if (!fontsLoaded) return [];

    const canvasWidth = 1920;
    const maxWidth = (canvasWidth - (MARGIN_PIXELS * 2)) * SAFETY_FACTOR;
    const gapWidth = config.fontSize * 0.22; 
    
    const lines: { parts: TextPart[], width: number }[] = [];
    let currentLineParts: TextPart[] = [];
    let currentLineWidth = 0;

    originalWords.forEach((word, wordIdx) => {
      let remainingWord = word;
      let firstPart = true;

      while (remainingWord.length > 0) {
        const wordWidth = measureTextWidth(remainingWord, config.fontSize);
        
        const spaceBetween = currentLineWidth > 0 ? gapWidth : 0;
        if (currentLineWidth + spaceBetween + wordWidth <= maxWidth) {
          currentLineParts.push({ text: remainingWord, wordIndex: wordIdx, isContinuation: !firstPart });
          currentLineWidth += spaceBetween + wordWidth;
          remainingWord = "";
        } else {
          if (currentLineWidth === 0) {
            let splitIdx = remainingWord.length - 1;
            while (splitIdx > 0 && measureTextWidth(remainingWord.substring(0, splitIdx), config.fontSize) > maxWidth) {
              splitIdx--;
            }
            const part = remainingWord.substring(0, Math.max(1, splitIdx));
            currentLineParts.push({ text: part, wordIndex: wordIdx, isContinuation: !firstPart });
            lines.push({ parts: currentLineParts, width: measureTextWidth(part, config.fontSize) });
            
            remainingWord = remainingWord.substring(Math.max(1, splitIdx));
            currentLineParts = [];
            currentLineWidth = 0;
            firstPart = false;
          } else {
            lines.push({ parts: currentLineParts, width: currentLineWidth });
            currentLineParts = [];
            currentLineWidth = 0;
          }
        }
      }
    });

    if (currentLineParts.length > 0) {
      lines.push({ parts: currentLineParts, width: currentLineWidth });
    }

    return lines;
  }, [originalWords, config.fontSize, fontsLoaded, config.textAlign]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setConfig(prev => ({ ...prev, backgroundImage: result }));
        const img = new Image();
        img.onload = () => setBgImageElement(img);
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setConfig(prev => ({ ...prev, backgroundImage: undefined }));
    setBgImageElement(null);
  };

  const handleWordColorChange = (color: string) => {
    if (selectedWordIdx === null) return;
    setConfig(prev => ({
      ...prev,
      wordColors: { ...(prev.wordColors || {}), [selectedWordIdx]: color }
    }));
    setSelectedWordIdx(null);
  };

  const drawToCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    await document.fonts.load(`bold ${config.fontSize}px "League Spartan"`);

    canvas.width = 1920;
    canvas.height = 1080;

    if (bgImageElement) {
      const canvasAspect = canvas.width / canvas.height;
      const imageAspect = bgImageElement.width / bgImageElement.height;
      let dW, dH, oX, oY;
      if (imageAspect > canvasAspect) {
        dH = canvas.height; 
        dW = bgImageElement.width * (canvas.height / bgImageElement.height);
        oX = (canvas.width - dW) / 2; oY = 0;
      } else {
        dW = canvas.width; 
        dH = bgImageElement.height * (canvas.width / bgImageElement.width);
        oX = 0; oY = (canvas.height - dH) / 2;
      }
      ctx.drawImage(bgImageElement, oX, oY, dW, dH);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.textBaseline = 'middle';
    ctx.font = `bold ${config.fontSize}px "League Spartan"`;
    
    if (config.showShadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 25;
      ctx.shadowOffsetY = 12;
    } else {
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }

    const gapWidth = config.fontSize * 0.22; 
    const refFontSize = Math.floor(config.fontSize * 0.38); 
    const lineSpacing = config.fontSize * config.lineHeight;
    const spacingToRef = config.fontSize * 0.35;
    
    const totalTextHeight = (wrappedLines.length - 1) * lineSpacing;
    const totalContentHeight = totalTextHeight + spacingToRef + refFontSize;
    
    let startY = (canvas.height / 2) - (totalContentHeight / 2) + (config.fontSize / 2);

    wrappedLines.forEach((line, lineIdx) => {
      let currentX = MARGIN_PIXELS; 
      if (config.textAlign === 'center') {
        currentX = (canvas.width / 2) - (line.width / 2);
      } else if (config.textAlign === 'right') {
        currentX = canvas.width - MARGIN_PIXELS - line.width;
      }
      
      const y = startY + (lineIdx * lineSpacing);
      
      line.parts.forEach((p, pIdx) => {
        const color = config.wordColors?.[p.wordIndex] || config.textColor;
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        
        if (pIdx > 0) {
          currentX += gapWidth;
        }

        ctx.fillText(p.text, currentX, y);
        currentX += ctx.measureText(p.text).width;
      });
    });

    if (config.showShadow) {
      ctx.shadowBlur = 10;
    } else {
      ctx.shadowBlur = 0;
    }
    ctx.font = `bold ${refFontSize}px "League Spartan"`;
    ctx.fillStyle = config.textColor;
    ctx.textAlign = config.textAlign;
    
    let refX = MARGIN_PIXELS;
    if (config.textAlign === 'center') refX = canvas.width / 2;
    if (config.textAlign === 'right') refX = canvas.width - MARGIN_PIXELS;

    const reference = `${(config.verse.book_name || "").toUpperCase()} ${config.verse.chapter}:${config.verse.verse}`;
    const refY = startY + (wrappedLines.length - 1) * lineSpacing + (config.fontSize / 2) + spacingToRef;
    ctx.fillText(reference, refX, refY);
  };

  const handleDownload = async () => {
    await drawToCanvas();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `SLIDE-${verse.book_name}-${verse.chapter}-${verse.verse}.jpg`.toUpperCase();
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  const scale = 19.2;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white overflow-hidden font-sans">
      {/* App Bar */}
      <div className="safe-top bg-slate-900 border-b border-white/10 px-4 h-14 flex items-center justify-between shrink-0 z-40">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full active:bg-white/10">
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-2">
          <div className="flex bg-slate-800 p-1 rounded-lg">
            {(['left', 'center', 'right'] as const).map((align) => (
              <button 
                key={align}
                onClick={() => setConfig({...config, textAlign: align})}
                className={`p-1.5 rounded-md transition-all ${config.textAlign === align ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
              >
                {align === 'left' && <AlignLeft size={16} />}
                {align === 'center' && <AlignCenter size={16} />}
                {align === 'right' && <AlignRight size={16} />}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setConfig({...config, showShadow: !config.showShadow})}
            className={`p-2.5 rounded-lg transition-all ${config.showShadow ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400'}`}
            title="Sombra do Texto"
          >
            <Type size={16} />
          </button>
        </div>
        <button 
          onClick={handleDownload}
          className="bg-blue-600 active:bg-blue-700 px-4 py-2 rounded-lg font-black flex items-center gap-2 shadow-lg text-[10px] uppercase tracking-widest"
        >
          <Download size={14} />
          Salvar
        </button>
      </div>

      {/* Preview Master - FUNDO FIXO DO APP PARA CONTRASTE */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-950 relative overflow-hidden transition-all duration-300">
        <div 
          className="w-full aspect-video relative overflow-hidden flex flex-col justify-center shadow-[0_30px_90px_rgba(0,0,0,0.8)] transition-all duration-500"
          style={{ 
            backgroundColor: config.backgroundColor,
            backgroundImage: config.backgroundImage ? `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${config.backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: `${MARGIN_PIXELS / scale}vw`, 
            boxSizing: 'border-box'
          }}
        >
          {!fontsLoaded ? (
            <div className="w-full text-center animate-pulse text-[10px] font-black uppercase opacity-20">Carregando Fontes...</div>
          ) : (
            <div 
              className="w-full h-full flex flex-col justify-center overflow-hidden"
              style={{
                alignItems: config.textAlign === 'left' ? 'flex-start' : config.textAlign === 'right' ? 'flex-end' : 'center'
              }}
            >
              <div 
                className="max-w-full flex flex-col font-spartan font-bold select-none"
                style={{ 
                  fontSize: `${config.fontSize / scale}vw`,
                  lineHeight: config.lineHeight,
                  alignItems: config.textAlign === 'left' ? 'flex-start' : config.textAlign === 'right' ? 'flex-end' : 'center',
                  textShadow: config.showShadow ? '0 8px 16px rgba(0,0,0,0.9)' : 'none'
                }}
              >
                {wrappedLines.map((line, lIdx) => (
                  <div 
                    key={lIdx} 
                    className="flex shrink-0 whitespace-nowrap"
                    style={{ 
                      gap: '0.22em'
                    }}
                  >
                    {line.parts.map((p, pIdx) => (
                      <span
                        key={`${lIdx}-${pIdx}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWordIdx(p.wordIndex === selectedWordIdx ? null : p.wordIndex);
                        }}
                        className={`transition-all duration-200 cursor-pointer rounded px-0.5 ${
                          selectedWordIdx === p.wordIndex ? 'ring-2 ring-blue-500 bg-blue-500/30 scale-105 z-10 shadow-2xl' : ''
                        }`}
                        style={{ color: config.wordColors?.[p.wordIndex] || config.textColor }}
                      >
                        {p.text}
                      </span>
                    ))}
                  </div>
                ))}
              </div>

              <div 
                className="font-spartan font-bold opacity-80 whitespace-nowrap"
                style={{ 
                  marginTop: `${(config.fontSize * 0.35) / scale}vw`,
                  fontSize: `${(config.fontSize * 0.38) / scale}vw`,
                  color: config.textColor,
                  textShadow: config.showShadow ? '0 5px 10px rgba(0,0,0,0.8)' : 'none',
                  width: '100%',
                  textAlign: config.textAlign
                }}
              >
                {(config.verse.book_name || "").toUpperCase()} {config.verse.chapter}:{config.verse.verse}
              </div>
            </div>
          )}

          {/* Color Picker Float */}
          {selectedWordIdx !== null && (
            <div className="absolute inset-x-0 top-0 bg-slate-900/95 backdrop-blur-2xl border-b border-white/20 p-4 flex flex-col gap-3 animate-in slide-in-from-top duration-300 z-50">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                  Palavra: <span className="text-white">"{originalWords[selectedWordIdx]}"</span>
                </span>
                <button onClick={() => setSelectedWordIdx(null)} className="p-1">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 px-2 no-scrollbar">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => handleWordColorChange(color)}
                    className={`w-11 h-11 rounded-full shrink-0 border-2 transition-all active:scale-90 ${config.wordColors?.[selectedWordIdx] === color ? 'border-white scale-110 shadow-xl' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none opacity-40">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Pré-visualização 16:9
          </p>
          <div className="w-16 h-0.5 bg-blue-600/30 rounded-full"></div>
        </div>
      </div>

      {/* Global Controls */}
      <div className="bg-slate-900 border-t border-white/10 p-5 pb-10 space-y-6 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-1"><Maximize2 size={10}/> Tamanho</span>
              <span className="text-blue-500">{config.fontSize}</span>
            </div>
            <input 
              type="range" min="40" max="250" value={config.fontSize}
              onChange={(e) => setConfig({ ...config, fontSize: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-full appearance-none accent-blue-500"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-1"><MoveVertical size={10}/> Altura</span>
              <span className="text-blue-500">{config.lineHeight}x</span>
            </div>
            <input 
              type="range" min="0.6" max="2.0" step="0.05" value={config.lineHeight}
              onChange={(e) => setConfig({ ...config, lineHeight: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-full appearance-none accent-blue-500"
            />
          </div>
        </div>

        <div className="flex items-end gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Imagem de Fundo</label>
            <div className="flex gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl transition-all border ${config.backgroundImage ? 'bg-blue-600/10 border-blue-600/50 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'bg-slate-800 border-white/5 text-slate-400'}`}
              >
                <ImageIcon size={18} />
                <span className="text-[10px] font-black uppercase">Fundo</span>
              </button>
              {config.backgroundImage && (
                <button onClick={removeImage} className="w-11 h-11 bg-red-600/10 border border-red-600/20 rounded-xl flex items-center justify-center text-red-500">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase text-slate-500 text-center block tracking-tighter">Papel</label>
              <input type="color" value={config.backgroundColor} disabled={!!config.backgroundImage} onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })} className={`w-11 h-11 rounded-xl bg-slate-800 border border-white/10 cursor-pointer ${!!config.backgroundImage ? 'opacity-20' : ''}`} />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase text-slate-500 text-center block tracking-tighter">Tinta</label>
              <input type="color" value={config.textColor} onChange={(e) => setConfig({ ...config, textColor: e.target.value })} className="w-11 h-11 rounded-xl bg-slate-800 border border-white/10 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input[type="range"]::-webkit-slider-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          -webkit-appearance: none;
          border: 3px solid #0f172a;
          box-shadow: 0 0 10px rgba(37,99,235,0.4);
        }
      `}</style>
    </div>
  );
};

export default SlideEditor;
