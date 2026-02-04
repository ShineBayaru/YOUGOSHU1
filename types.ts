
export enum Category {
  General = '一般',
  ALJSpecial = 'ALJ専門',
  Toyota = 'トヨタ用語',
  Others = 'その他',
  ResinMolding = '樹脂成型',
  ResinDie = '樹脂金型',
  DesignSpecial = '設計専門'
}

export interface GlossaryTerm {
  id: number;
  word: string;
  reading: string;
  alias?: string;
  english: string;
  meanings: {
    mn: string;
    en: string;
    jp: string;
  };
  category: Category;
  imageUrl?: string;
  videoUrl?: string;
}

export interface AISearchResult {
  explanation: string;
  examples: string[];
  relatedTerms: string[];
}

export const getCategoryColor = (category: Category) => {
  switch (category) {
    case Category.Toyota: return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
    case Category.ResinMolding: return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
    case Category.ResinDie: return 'bg-teal-50 text-teal-600 border-teal-100 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800';
    case Category.DesignSpecial: return 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800';
    case Category.ALJSpecial: return 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
    case Category.General: return 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    default: return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
  }
};
