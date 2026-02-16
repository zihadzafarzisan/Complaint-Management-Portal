
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
    <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-3xl shadow-2xl border border-gray-100">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 1.1.9 2 2 2h12a2 2 0 002-2V7M4 7c0-1.1.9-2 2-2h12a2 2 0 012 2M4 7l8 5 8-5M12 12l8-5M12 12l-8-5" /></svg>
        </div>
        <h2 className="text-2xl font-black text-gray-800">ডেটাবেজ কনফিগারেশন</h2>
        <p className="text-gray-500 mt-2">অ্যাপটি চালু করতে আপনার Supabase প্রোজেক্টের তথ্য দিন।</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Supabase Project URL</label>
          <input 
            required
            type="url" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-project.supabase.co" 
            className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-gov-green outline-none font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Anon Key (Public API Key)</label>
          <input 
            required
            type="password" 
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
            className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-gov-green outline-none font-mono text-sm"
          />
        </div>
        
        <div className="bg-amber-50 p-4 rounded-xl text-xs text-amber-700 leading-relaxed border border-amber-100">
          <strong>কোথায় পাবেন?</strong> আপনার Supabase ড্যাশবোর্ডে গিয়ে <strong>Project Settings > API</strong> সেকশনে এই তথ্যগুলো পাবেন। এগুলো শুধুমাত্র আপনার এই ব্রাউজারে সংরক্ষিত থাকবে।
        </div>

        <button 
          type="submit" 
          className="w-full py-4 bg-gov-green hover:bg-opacity-90 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
        >
          কানেক্ট করুন
        </button>
      </form>
    </div>
  );
};
