
import React, { useState } from 'react';
import { db } from '../services/db';

interface Props {
  onConfigured: () => void;
}

export const SupabaseConfig: React.FC<Props> = ({ onConfigured }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && key) {
      db.saveConfig(url, key);
      onConfigured();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-10 font-hind">
      <div className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-10 duration-700">
        <div className="bg-gov-green p-10 md:p-14 text-center text-white relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 7v10c0 1.1.9 2 2 2h12a2 2 0 002-2V7M4 7c0-1.1.9-2 2-2h12a2 2 0 012 2M4 7l8 5 8-5M12 12l8-5M12 12l-8-5" /></svg>
          </div>
          <h2 className="text-3xl font-black mb-2">ডাটাবেজ সেটআপ</h2>
          <p className="text-white/80 font-medium">সিস্টেম চালু করতে Supabase তথ্য দিন</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Supabase Project URL</label>
              <input 
                required
                type="url" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co" 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-gov-green focus:bg-white outline-none font-mono text-sm transition-all shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Anon Key (Public API Key)</label>
              <input 
                required
                type="password" 
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-gov-green focus:bg-white outline-none font-mono text-sm transition-all shadow-inner"
              />
            </div>
          </div>
          
          <div className="bg-amber-50 p-6 rounded-2xl border-2 border-amber-100 flex gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shrink-0 shadow-sm font-black text-xl">!</div>
            <div>
              <p className="text-amber-900 font-bold text-sm mb-1">কোথায় পাবেন?</p>
              <p className="text-amber-700/80 text-[11px] leading-relaxed">
                Supabase ড্যাশবোর্ডে গিয়ে <strong>Project Settings > API</strong> সেকশনে এই তথ্যগুলো পাবেন। এগুলো ব্রাউজারের <strong>LocalStorage</strong> এ সংরক্ষিত হবে।
              </p>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-6 bg-gov-green text-white font-black rounded-2xl shadow-2xl shadow-green-100 hover:scale-[1.02] active:scale-95 transition-all text-xl"
          >
            কানেক্ট করুন
          </button>
        </form>
      </div>
    </div>
  );
};
