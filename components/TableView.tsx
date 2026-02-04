
import React from 'react';
import { GlossaryTerm, getCategoryColor } from '../types';
import { Language } from '../App';

interface TableViewProps {
  terms: GlossaryTerm[];
  lang: Language;
  onView: (term: GlossaryTerm) => void;
  onEdit: (term: GlossaryTerm) => void;
  onDelete: (id: number) => void;
}

export const TableView: React.FC<TableViewProps> = ({ terms, lang, onView, onEdit, onDelete }) => {
  return (
    <div className="admin-card rounded-xl overflow-hidden overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-admin-border dark:border-slate-800">
            <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-16">ID</th>
            <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-[150px]">Unit Name</th>
            <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-[120px]">Reading</th>
            <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-[120px]">English</th>
            <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
            <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-[200px]">Meaning</th>
            <th className="px-5 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {terms.map((term) => (
            <tr key={term.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer" onClick={() => onView(term)}>
              <td className="px-5 py-3.5"><span className="mono text-[10px] text-slate-400">#{term.id.toString().padStart(4, '0')}</span></td>
              <td className="px-5 py-3.5"><span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">{term.word}</span></td>
              <td className="px-5 py-3.5"><span className="mono text-[11px] font-medium text-indigo-500/80">{term.reading}</span></td>
              <td className="px-5 py-3.5"><span className="text-[10px] font-bold text-slate-400 uppercase">{term.english || '—'}</span></td>
              <td className="px-5 py-3.5"><span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded border ${getCategoryColor(term.category)}`}>{term.category}</span></td>
              <td className="px-5 py-3.5"><p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs italic">"{term.meanings[lang] || term.meanings['mn']}"</p></td>
              <td className="px-5 py-3.5 text-right">
                <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={(e) => { e.stopPropagation(); onEdit(term); }} className="p-1.5 text-slate-400 hover:text-emerald-500 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(term.id); }} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
