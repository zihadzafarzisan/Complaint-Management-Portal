
import React, { useState } from 'react';
import { db } from '../services/db';

interface Props {
  onLogin: (success: boolean) => void;
}

export const AdminLogin: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await db.login(email, password);
      onLogin(true);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message === 'Invalid login credentials' ? 'ভুল ইমেল অথবা পাসওয়ার্ড!' : err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 md:mt-24 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-gov-green p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold font-hind">অফিস লগইন</h2>
          <p className="text-white/70 text-sm mt-1 font-hind">শুধুমাত্র অনুমোদিত কর্মকর্তাদের জন্য</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">অফিসিয়াল ইমেল</label>
              <input
                autoFocus
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@office.com"
                className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:border-gov-green focus:bg-white outline-none transition-all font-medium"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">পাসওয়ার্ড</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:border-gov-green focus:bg-white outline-none transition-all font-medium"
              />
            </div>
            
            {error && (
              <p className="text-red-500 text-xs font-bold text-center animate-shake mt-2 font-hind">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 bg-gov-green hover:bg-opacity-90 text-white font-bold rounded-xl shadow-lg shadow-gov-green/20 transition-all active:scale-95 font-hind ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'প্রবেশ করা হচ্ছে...' : 'প্রবেশ করুন'}
          </button>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
             <p className="text-[10px] text-slate-500 font-medium leading-relaxed font-hind text-center">
               অ্যাকাউন্ট না থাকলে অথবা পাসওয়ার্ড ভুলে গেলে সিস্টেম অ্যাডমিনিস্ট্রেটরের সাথে যোগাযোগ করুন।
             </p>
          </div>
        </form>
      </div>
    </div>
  );
};
