
import React from 'react';
import { GlossaryTerm, getCategoryColor } from '../types';
import { Language } from '../App';

interface TermCardProps {
  term: GlossaryTerm;
  lang: Language;
  onClick: (term: GlossaryTerm) => void;
  onEdit: (term: GlossaryTerm) => void;
  onDelete: (id: number) => void;
}

export const TermCard: React.FC<TermCardProps> = ({ term, lang, onClick, onEdit, onDelete }) => {
  const categoryStyles = getCategoryColor(term.category);
  const displayMeaning = term.meanings[lang] || term.meanings['mn'] || '';

  return (
    <div 
      className="admin-card rounded-xl overflow-hidden group cursor-pointer transition-all hover:border-indigo-500/50 flex flex-col h-full"
      onClick={() => onClick(term)}
    >
      <div className="h-32 bg-slate-50 dark:bg-slate-950 relative overflow-hidden flex items-center justify-center shrink-0 border-b border-admin-border dark:border-slate-800">
        {term.imageUrl ? (
          <img src={term.imageUrl} alt={term.word} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
        ) : term.videoUrl ? (
          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
             <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
             </div>
          </div>
        ) : (
          <div className="text-slate-200 dark:text-slate-800"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
        )}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={(e) => { e.stopPropagation(); onEdit(term); }} className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 rounded shadow-sm"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(term.id); }} className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 rounded shadow-sm"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
        </div>
        <div className="absolute bottom-2 left-2"><span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${categoryStyles}`}>{term.category}</span></div>
      </div>
      <div className="p-4 flex flex-col flex-1 gap-1">
        <div className="flex justify-between items-start mb-1"><span className="mono text-[8px] font-bold text-slate-400">#{term.id.toString().padStart(4, '0')}</span>{term.english && <span className="text-[8px] font-bold text-slate-400 uppercase truncate max-w-[100px]">{term.english}</span>}</div>
        <div className="mb-2">
          <p className="mono text-[9px] font-bold text-indigo-500/80 mb-0.5">{term.reading}</p>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors truncate">{term.word}</h3>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">"{displayMeaning}"</p>
      </div>
    </div>
  );
};
