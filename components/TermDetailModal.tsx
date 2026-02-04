
import React, { useState, useEffect } from 'react';
import { GlossaryTerm, AISearchResult } from '../types';
import { geminiService } from '../services/geminiService';
import { Language } from '../App';

interface TermDetailModalProps {
  term: GlossaryTerm | null;
  lang: Language;
  onClose: () => void;
}

export const TermDetailModal: React.FC<TermDetailModalProps> = ({ term, lang, onClose }) => {
  const [aiResult, setAiResult] = useState<AISearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (term) handleAskAI();
    else setAiResult(null);
  }, [term, lang]);

  const handleAskAI = async () => {
    if (!term) return;
    setLoading(true);
    const result = await geminiService.explainTerm(term.word, term.category, lang);
    setAiResult(result);
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (!term) return;
    navigator.clipboard.writeText(term.word);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!term) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-slate-900/40 dark:bg-black/60 backdrop-blur-lg transition-all animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[80vh]">
        <div className="w-full md:w-1/2 bg-slate-950 flex items-center justify-center relative group">
           {term.videoUrl ? (
             <video src={term.videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
           ) : term.imageUrl ? (
             <img src={term.imageUrl} alt={term.word} className="w-full h-full object-cover opacity-80" />
           ) : (
             <div className="text-slate-800 flex flex-col items-center gap-6"><div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center"><svg className="w-10 h-10 opacity-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div><p className="text-[10px] font-black uppercase text-white opacity-40">No preview available</p></div>
           )}
           <button onClick={onClose} className="absolute left-6 top-6 md:hidden p-3 bg-white/10 text-white rounded-full"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
          <div className="relative px-12 pt-12 pb-8 border-b dark:border-slate-800">
            <button onClick={onClose} className="hidden md:block absolute right-8 top-12 text-slate-300 dark:text-slate-700 hover:text-slate-900 dark:hover:text-white"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
            <div className="flex items-center gap-4 mb-6"><span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-1.5 rounded-full uppercase border border-indigo-100/50 dark:border-indigo-500/30">{term.category}</span><span className="mono text-[10px] font-bold text-slate-300 dark:text-slate-700">ID:{term.id}</span></div>
            
            <p className="mono text-sm font-bold text-indigo-400 dark:text-indigo-500 mb-2">{term.reading}</p>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-5xl font-extrabold text-slate-900 dark:text-white leading-none">{term.word}</h2>
              <button onClick={copyToClipboard} className={`p-2 rounded-xl transition-all ${copied ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-500'}`}>
                {copied ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-10">
              <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase">English</p><p className="text-sm font-bold text-slate-700 dark:text-slate-300">{term.english || '—'}</p></div>
              {term.alias && <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase">Alias</p><p className="text-sm font-bold text-slate-700 dark:text-slate-300">{term.alias}</p></div>}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar px-12 py-10">
            <div className="grid grid-cols-1 gap-12">
               <section>
                 <h4 className="text-[10px] font-black text-slate-300 uppercase mb-4">Meaning ({lang.toUpperCase()})</h4>
                 <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-xl font-medium">{term.meanings[lang] || term.meanings['mn']}</p>
               </section>
               <section className="bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-800 rounded-[2rem] p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center"><svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg></div><h4 className="text-xs font-black text-slate-800 dark:text-white uppercase">Gemini AI Discovery</h4></div>
                      {loading && <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>}
                    </div>
                    {!loading && aiResult && (
                      <div className="space-y-6 animate-in fade-in duration-700">
                        <p className="text-slate-600 dark:text-slate-400 text-sm italic border-l-4 border-indigo-200 pl-4">{aiResult.explanation}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                           <div className="space-y-4">
                              <h5 className="text-[10px] font-black text-indigo-400 uppercase">Examples</h5>
                              <ul className="space-y-2">{aiResult.examples.map((ex, i) => (<li key={i} className="text-xs text-slate-700 dark:text-slate-300 font-bold bg-white dark:bg-slate-900 p-3 rounded-xl border dark:border-slate-800">{ex}</li>))}</ul>
                           </div>
                           <div className="space-y-4">
                              <h5 className="text-[10px] font-black text-indigo-400 uppercase">Related</h5>
                              <div className="flex flex-wrap gap-2">{aiResult.relatedTerms.map((rt, i) => (<span key={i} className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-lg">{rt}</span>))}</div>
                           </div>
                        </div>
                      </div>
                    )}
               </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
