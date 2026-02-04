
import React, { useState } from 'react';
import { Category, GlossaryTerm } from '../types';
import { CATEGORIES_LIST } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";

interface TermEditModalProps {
  term: GlossaryTerm | null;
  onClose: () => void;
  onSave: (data: Partial<GlossaryTerm>) => void;
}

export const TermEditModal: React.FC<TermEditModalProps> = ({ term, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    word: term?.word || '',
    reading: term?.reading || '',
    alias: term?.alias || '',
    english: term?.english || '',
    meanings: {
      mn: term?.meanings?.mn || '',
      en: term?.meanings?.en || '',
      jp: term?.meanings?.jp || ''
    },
    category: term?.category || Category.General,
    imageUrl: term?.imageUrl || '',
    videoUrl: term?.videoUrl || '',
  });

  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleAutoFillText = async () => {
    if (!formData.word) return alert('Эхлээд Япон нэршлийг оруулна уу.');
    setIsGeneratingText(true);
    
    // Just-in-time initialization
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Research the technical term "${formData.word}" in the context of "${formData.category}". Provide: 1. Reading (kana), 2. English name, 3. Short definitions in Mongolian, English, and Japanese.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reading: { type: Type.STRING },
              english: { type: Type.STRING },
              meanings: {
                type: Type.OBJECT,
                properties: {
                  mn: { type: Type.STRING },
                  en: { type: Type.STRING },
                  jp: { type: Type.STRING }
                }
              }
            }
          }
        }
      });
      
      const res = JSON.parse(response.text || '{}');
      setFormData(prev => ({
        ...prev,
        reading: res.reading || prev.reading,
        english: res.english || prev.english,
        meanings: {
          mn: res.meanings?.mn || prev.meanings.mn,
          en: res.meanings?.en || prev.meanings.en,
          jp: res.meanings?.jp || prev.meanings.jp
        }
      }));
    } catch (e: any) {
      if (e.message?.includes("429")) {
        alert('Квота дууссан байна. Төлбөртэй API түлхүүр сонгож ашиглана уу.');
      } else {
        alert('AI-аар текст бөглөхөд алдаа гарлаа.');
      }
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!formData.word) return alert('Зураг үүсгэхийн тулд эхлээд нэршлийг оруулна уу.');
    setIsGeneratingImage(true);
    
    // Just-in-time initialization
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `Create a professional, clean technical illustration or realistic 3D render for the manufacturing/engineering term: "${formData.word}". Category: ${formData.category}. Minimal background, high quality, 4k.` }]
        },
        config: {
          imageConfig: { aspectRatio: "16:9" }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          setFormData(prev => ({ ...prev, imageUrl: `data:image/png;base64,${base64Data}` }));
          break;
        }
      }
    } catch (e: any) {
      if (e.message?.includes("429")) {
        alert('Квота дууссан байна. Төлбөртэй API түлхүүр сонгож ашиглана уу.');
      } else {
        alert('Зураг үүсгэхэд алдаа гарлаа. Та дахин оролдоно уу эсвэл URL-аар оруулна уу.');
      }
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.word || !formData.meanings.mn) return alert('Гарчиг болон Монгол утга заавал байх ёстой.');
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md transition-all animate-in fade-in zoom-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-none">{term ? 'Дата засах' : 'Шинэ нэгж нэмэх'}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Engineering Database Management</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl border dark:border-slate-800 hover:text-rose-500 transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1 dark:bg-slate-900">
          {/* Main Info Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
               <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Үг (語句) *</label>
                    <input type="text" required className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl dark:text-white transition-all outline-none" value={formData.word} onChange={(e) => setFormData({ ...formData, word: e.target.value })} />
                  </div>
                  <div className="flex items-end">
                    <button type="button" onClick={handleAutoFillText} disabled={isGeneratingText} className="px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase rounded-2xl transition-all shadow-lg disabled:opacity-50">
                      {isGeneratingText ? '...' : 'AI Fill'}
                    </button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2"><label className="block text-[10px] font-black text-slate-400 uppercase">Уншигдах (読み方)</label><input type="text" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl dark:text-white outline-none" value={formData.reading} onChange={(e) => setFormData({ ...formData, reading: e.target.value })} /></div>
                 <div className="space-y-2"><label className="block text-[10px] font-black text-slate-400 uppercase">Англи (English)</label><input type="text" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl dark:text-white outline-none" value={formData.english} onChange={(e) => setFormData({ ...formData, english: e.target.value })} /></div>
                 <div className="space-y-2"><label className="block text-[10px] font-black text-slate-400 uppercase">Alias / Alternate</label><input type="text" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl dark:text-white outline-none" value={formData.alias} onChange={(e) => setFormData({ ...formData, alias: e.target.value })} /></div>
                 <div className="space-y-2"><label className="block text-[10px] font-black text-slate-400 uppercase">Ангилал</label><select className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl dark:text-white outline-none" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}>{CATEGORIES_LIST.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
               </div>
            </div>

            {/* Media Preview Section */}
            <div className="space-y-6">
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Media Preview</label>
               <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 relative group">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : formData.videoUrl ? (
                    <div className="flex flex-col items-center gap-2 text-indigo-500">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>
                      <span className="text-[10px] font-bold">Video URL Detected</span>
                    </div>
                  ) : (
                    <div className="text-slate-300 dark:text-slate-600 flex flex-col items-center gap-2">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-[10px] font-bold">No Media</span>
                    </div>
                  )}
                  {isGeneratingImage && (
                    <div className="absolute inset-0 bg-indigo-600/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4 text-center">
                       <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                       <p className="text-xs font-bold uppercase tracking-widest">AI Generating Visual...</p>
                    </div>
                  )}
               </div>
               <button type="button" onClick={handleGenerateImage} disabled={isGeneratingImage} className="w-full py-3.5 bg-slate-900 dark:bg-indigo-600 text-white text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.673.337a4 4 0 01-2.506.326l-1.741-.348a2 2 0 01-1.037-.697l-1.082-1.442a2 2 0 01-.157-1.427l.45-1.799a2 2 0 01.32-.61l1.545-2.06a2 2 0 011.53-.826l2.115-.141a2 2 0 011.393.513l1.583 1.583a2 2 0 01.515 1.4l-.14 2.116a2 2 0 01-.826 1.53l-2.06 1.545a2 2 0 01-.61.32l-1.8.45a2 2 0 01-1.427-.157l-1.442-1.082a2 2 0 01-.697-1.037l-.348-1.741a4 4 0 01.326-2.506l.337-.673a6 6 0 00.517-3.86l-.477-2.387a2 2 0 00-.547-1.022L1.5 1.5" /></svg>
                 AI Image Generate
               </button>
            </div>
          </div>

          {/* Meaning Section */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] border-b dark:border-slate-800 pb-2">Multi-language Meanings</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2"><label className="block text-[9px] font-black text-slate-400 uppercase">Mongolian (MN) *</label><textarea required rows={4} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl dark:text-white outline-none focus:border-indigo-500/20" value={formData.meanings.mn} onChange={(e) => setFormData({ ...formData, meanings: {...formData.meanings, mn: e.target.value} })} /></div>
               <div className="space-y-2"><label className="block text-[9px] font-black text-slate-400 uppercase">English (EN)</label><textarea rows={4} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl dark:text-white outline-none focus:border-indigo-500/20" value={formData.meanings.en} onChange={(e) => setFormData({ ...formData, meanings: {...formData.meanings, en: e.target.value} })} /></div>
               <div className="space-y-2"><label className="block text-[9px] font-black text-slate-400 uppercase">Japanese (JP)</label><textarea rows={4} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl dark:text-white outline-none focus:border-indigo-500/20" value={formData.meanings.jp} onChange={(e) => setFormData({ ...formData, meanings: {...formData.meanings, jp: e.target.value} })} /></div>
            </div>
          </div>

          {/* Media Links Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
             <div className="space-y-2"><label className="block text-[10px] font-black text-slate-400 uppercase">Image URL (Custom)</label><input type="text" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl dark:text-white outline-none" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} /></div>
             <div className="space-y-2"><label className="block text-[10px] font-black text-slate-400 uppercase">Video URL (MP4 Link)</label><input type="text" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl dark:text-white outline-none" value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} /></div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-6 pt-10 border-t dark:border-slate-800">
            <button type="button" onClick={onClose} className="flex-1 px-8 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl uppercase text-xs hover:bg-slate-200 transition-all">Цуцлах</button>
            <button type="submit" className="flex-[2] px-8 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none uppercase text-xs transition-all">Мэдээллийг Хадгалах</button>
          </div>
        </form>
      </div>
    </div>
  );
};
