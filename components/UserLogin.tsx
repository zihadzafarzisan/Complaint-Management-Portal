
import React, { useState } from 'react';

interface Props {
  onLogin: (mobile: string) => void;
}

export const UserLogin: React.FC<Props> = ({ onLogin }) => {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile) {
      setError('আপনার মোবাইল নম্বরটি প্রদান করুন।');
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(mobile)) {
      setError('সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: ০১৮XXXXXXXX)');
      return;
    }
    onLogin(mobile);
  };

  return (
    <div className="max-w-md mx-auto mt-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-gov-green p-10 text-center text-white relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <h2 className="text-3xl font-black font-hind">অভিযোগ ট্র্যাক করুন</h2>
          <p className="text-white/80 text-sm mt-2 font-hind font-medium">মোবাইল নম্বর দিয়ে বর্তমান অবস্থা দেখুন</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2">আবেদনকারীর মোবাইল নম্বর</label>
              <input
                required
                type="tel"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value);
                  if(error) setError('');
                }}
                placeholder="০১৮XXXXXXXX"
                className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-gov-green outline-none text-center text-2xl font-black tracking-widest text-slate-800 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-black text-center animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-6 bg-gov-red hover:bg-gov-red/90 text-white font-black rounded-2xl shadow-xl shadow-red-100 transition-all active:scale-95 text-xl font-hind"
          >
            সার্চ করুন
          </button>
          
          <div className="flex items-center gap-4 py-4 px-6 bg-slate-50 rounded-2xl">
             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gov-green shrink-0 shadow-sm font-black text-xs">!</div>
             <p className="text-[11px] text-slate-500 font-medium leading-relaxed font-hind">
               আপনার অভিযোগ জমা দেওয়ার সময় ব্যবহৃত মোবাইল নম্বরটি লিখুন। নম্বরটি দিয়ে ইতিপূর্বে করা সকল অভিযোগের তালিকা দেখা যাবে।
             </p>
          </div>
        </form>
      </div>
    </div>
  );
};
