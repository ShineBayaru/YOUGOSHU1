
import React, { useState, useMemo, useEffect } from 'react';
import { GLOSSARY_DATA, CATEGORIES_LIST } from './constants';
import { Category, GlossaryTerm } from './types';
import { TermCard } from './components/TermCard';
import { TermDetailModal } from './components/TermDetailModal';
import { TermEditModal } from './components/TermEditModal';
import { TableView } from './components/TableView';

const STORAGE_KEY = 'techgloss_v2_data';
const THEME_KEY = 'techgloss_theme';
const LANG_KEY = 'techgloss_lang';
const UPDATE_KEY = 'techgloss_last_update';

export type Language = 'mn' | 'en' | 'jp';

const translations = {
  mn: {
    title: "TechGloss Admin",
    searchPlaceholder: "Search units...",
    addBtn: "Create Term",
    mainMenu: "Console Navigation",
    categories: "Term Categories",
    gridView: "Dashboard View",
    tableView: "Data Table",
    statsTotal: "Total Entries",
    statsRecent: "Last Activity",
    results: "items",
    noResults: "Empty Records",
    noResultsSub: "Your search query yielded no results.",
    theme: "Appearance",
    lang: "Interface Language",
    export: "Export DB",
    import: "Import DB",
    justNow: "Just now",
    minutesAgo: "m ago",
    hoursAgo: "h ago",
    today: "Today",
    apiKey: "API Key Selection",
    switchKey: "Switch API Key",
    billingInfo: "Billing Info",
    statusReady: "AI Ready",
    statusNoKey: "Key Required"
  },
  en: {
    title: "TechGloss Admin",
    searchPlaceholder: "Search units...",
    addBtn: "Create Term",
    mainMenu: "Console Navigation",
    categories: "Term Categories",
    gridView: "Dashboard View",
    tableView: "Data Table",
    statsTotal: "Total Entries",
    statsRecent: "Last Activity",
    results: "items",
    noResults: "Empty Records",
    noResultsSub: "Your search query yielded no results.",
    theme: "Appearance",
    lang: "Interface Language",
    export: "Export DB",
    import: "Import DB",
    justNow: "Just now",
    minutesAgo: "m ago",
    hoursAgo: "h ago",
    today: "Today",
    apiKey: "API Key Selection",
    switchKey: "Switch API Key",
    billingInfo: "Billing Info",
    statusReady: "AI Ready",
    statusNoKey: "Key Required"
  },
  jp: {
    title: "TechGloss 管理",
    searchPlaceholder: "用語を検索...",
    addBtn: "用語を作成",
    mainMenu: "メニュー",
    categories: "カテゴリ",
    gridView: "ダッシュボード",
    tableView: "データテーブル",
    statsTotal: "総エントリー",
    statsRecent: "最終アクティビティ",
    results: "件",
    noResults: "レコードなし",
    noResultsSub: "検索クエリの結果が見つかりませんでした。",
    theme: "外観",
    lang: "インターフェース言語",
    export: "DB出力",
    import: "DB入力",
    justNow: "たった今",
    minutesAgo: "分前",
    hoursAgo: "時間前",
    today: "今日",
    apiKey: "APIキー選択",
    switchKey: "キーを切り替える",
    billingInfo: "請求情報",
    statusReady: "AI準備完了",
    statusNoKey: "キーが必要"
  }
};

const App: React.FC = () => {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [viewingTerm, setViewingTerm] = useState<GlossaryTerm | null>(null);
  const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [lastUpdate, setLastUpdate] = useState<string>(() => localStorage.getItem(UPDATE_KEY) || new Date().toISOString());
  const [hasApiKey, setHasApiKey] = useState(false);
  
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem(THEME_KEY) === 'dark');
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem(LANG_KEY) as Language) || 'mn');

  const t = translations[lang];

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkKey();

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setTerms(JSON.parse(saved)); } catch (e) { setTerms(GLOSSARY_DATA); }
    } else { setTerms(GLOSSARY_DATA); }
  }, []);

  const handleSwitchKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const updateTerms = (newTerms: GlossaryTerm[]) => {
    setTerms(newTerms);
    const now = new Date().toISOString();
    setLastUpdate(now);
    localStorage.setItem(UPDATE_KEY, now);
  };

  useEffect(() => {
    if (terms.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(terms));
  }, [terms]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
  }, [lang]);

  const filteredTerms = useMemo(() => {
    return terms.filter((term) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        term.word.toLowerCase().includes(q) ||
        term.reading.toLowerCase().includes(q) ||
        term.english.toLowerCase().includes(q) ||
        term.meanings.mn.toLowerCase().includes(q) ||
        term.meanings.en.toLowerCase().includes(q) ||
        term.meanings.jp.toLowerCase().includes(q) ||
        term.alias?.toLowerCase().includes(q);
      const matchesCategory = selectedCategory === 'All' || term.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [terms, searchQuery, selectedCategory]);

  const stats = useMemo(() => {
    const counts = terms.reduce((acc, term) => {
      acc[term.category] = (acc[term.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return counts;
  }, [terms]);

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return t.justNow;
    if (diffMins < 60) return `${diffMins}${t.minutesAgo}`;
    if (diffHours < 24) return `${diffHours}${t.hoursAgo}`;
    return t.today;
  };

  const exportData = () => {
    const dataStr = JSON.stringify(terms, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `techgloss_db_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          updateTerms(data);
          alert('Database updated successfully.');
        }
      } catch (err) {
        alert('File read error.');
      }
    };
    reader.readAsText(file);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Permanent delete this record?')) {
      updateTerms(terms.filter(t => t.id !== id));
    }
  };

  const handleSave = (data: Partial<GlossaryTerm>) => {
    if (editingTerm) {
      updateTerms(terms.map(t => t.id === editingTerm.id ? { ...t, ...data } : t));
    } else {
      const newId = terms.length > 0 ? Math.max(...terms.map(t => t.id)) + 1 : 1;
      updateTerms([...terms, { ...data, id: newId } as GlossaryTerm]);
    }
    setEditingTerm(null);
    setIsAdding(false);
  };

  return (
    <div className={`flex h-screen overflow-hidden`}>
      {/* ADMIN SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 admin-sidebar shrink-0">
        <div className="h-16 flex items-center px-6 gap-3 border-b border-white/5">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className="text-white font-bold tracking-tight text-lg">TechGloss <span className="text-indigo-400">v2</span></span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.mainMenu}</div>
          <button onClick={() => setViewMode('grid')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-xs font-medium ${viewMode === 'grid' ? 'nav-item-active' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            {t.gridView}
          </button>
          <button onClick={() => setViewMode('table')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-xs font-medium ${viewMode === 'table' ? 'nav-item-active' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            {t.tableView}
          </button>

          <div className="px-3 pt-6 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.categories}</div>
          <button onClick={() => setSelectedCategory('All')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-xs font-medium ${selectedCategory === 'All' ? 'text-white bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <span>All Entities</span>
            <span className="text-[10px] bg-white/10 px-1.5 rounded">{terms.length}</span>
          </button>
          {CATEGORIES_LIST.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-xs font-medium ${selectedCategory === cat ? 'text-white bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <span className="truncate pr-2">{cat}</span>
              <span className="text-[10px] bg-white/10 px-1.5 rounded">{stats[cat] || 0}</span>
            </button>
          ))}

          <div className="px-3 pt-6 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Status</div>
          <div className="px-3 py-3 bg-white/5 rounded-xl space-y-3">
             <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Gemini AI</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${hasApiKey ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {hasApiKey ? t.statusReady : t.statusNoKey}
                </span>
             </div>
             <button onClick={handleSwitchKey} className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-[9px] font-black uppercase rounded-lg transition-all">
                {t.switchKey}
             </button>
             <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="block text-center text-[8px] text-slate-500 hover:text-slate-300 uppercase tracking-tighter">
                {t.billingInfo}
             </a>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 space-y-2">
           <button onClick={exportData} className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-slate-400 uppercase hover:text-white transition-all">
             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
             {t.export}
           </button>
           <label className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-slate-400 uppercase hover:text-white transition-all cursor-pointer">
             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
             {t.import}
             <input type="file" accept=".json" onChange={importData} className="hidden" />
           </label>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-admin-bg dark:bg-slate-900">
        {/* TOP NAV BAR */}
        <header className="h-16 bg-white dark:bg-slate-950 border-b border-admin-border dark:border-slate-800 flex items-center justify-between px-8 shrink-0 z-20">
          <div className="flex-1 max-w-xl relative">
            <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              className="w-full pl-11 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-admin-border dark:border-slate-800 rounded-lg text-sm outline-none focus:ring-2 ring-indigo-500/10 transition-all dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-900 rounded-lg border dark:border-slate-800">
              {(['mn', 'en', 'jp'] as Language[]).map(l => (
                <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${lang === l ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>{l.toUpperCase()}</button>
              ))}
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              {darkMode ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
            </button>
            <button 
              onClick={() => setIsAdding(true)}
              className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
              {t.addBtn}
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {/* WIDGETS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="admin-card p-5 rounded-xl flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center shrink-0"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2" /></svg></div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.statsTotal}</p>
                   <p className="text-xl font-bold text-slate-800 dark:text-white leading-none">{terms.length}</p>
                 </div>
              </div>
              <div className="admin-card p-5 rounded-xl flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center shrink-0"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.statsRecent}</p>
                   <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 leading-none">{formatTimeAgo(lastUpdate)}</p>
                 </div>
              </div>
              <div className="lg:col-span-2 admin-card p-5 rounded-xl flex flex-col justify-center">
                 <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category Distribution</p>
                    <p className="text-[10px] font-bold text-indigo-500">{(filteredTerms.length / terms.length * 100).toFixed(0)}% View</p>
                 </div>
                 <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {CATEGORIES_LIST.map((cat, idx) => {
                      const count = stats[cat] || 0;
                      const percentage = (count / terms.length) * 100;
                      if (count === 0) return null;
                      const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500', 'bg-purple-500', 'bg-slate-500'];
                      return <div key={cat} style={{ width: `${percentage}%` }} className={`${colors[idx % colors.length]} h-full opacity-80`} title={cat}></div>
                    })}
                 </div>
              </div>
            </div>

            {/* MAIN LIST SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">{selectedCategory === 'All' ? 'System Records' : selectedCategory}</h2>
                  <p className="text-xs text-slate-400">{filteredTerms.length} {t.results} found in current scope</p>
                </div>
                <div className="flex bg-white dark:bg-slate-950 p-1 rounded-lg border border-admin-border dark:border-slate-800">
                  <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg></button>
                  <button onClick={() => setViewMode('table')} className={`p-1.5 rounded transition-all ${viewMode === 'table' ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg></button>
                </div>
              </div>

              {filteredTerms.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {filteredTerms.map((term) => (
                      <TermCard key={term.id} term={term} lang={lang} onClick={setViewingTerm} onEdit={setEditingTerm} onDelete={handleDelete} />
                    ))}
                  </div>
                ) : (
                  <TableView terms={filteredTerms} lang={lang} onView={setViewingTerm} onEdit={setEditingTerm} onDelete={handleDelete} />
                )
              ) : (
                <div className="admin-card rounded-xl py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 text-slate-300"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                  <h3 className="font-bold text-slate-800 dark:text-white">{t.noResults}</h3>
                  <p className="text-xs text-slate-400 mt-1">{t.noResultsSub}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODALS */}
      <TermDetailModal term={viewingTerm} lang={lang} onClose={() => setViewingTerm(null)} />
      {(isAdding || editingTerm) && (
        <TermEditModal 
          term={editingTerm} 
          onClose={() => { setEditingTerm(null); setIsAdding(false); }} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
};

export default App;
