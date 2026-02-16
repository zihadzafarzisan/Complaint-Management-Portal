
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
    onLogin(mobile);
  };

  return (
    <div className="max-w-md mx-auto mt-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-gov-green p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <h2 className="text-2xl font-bold">অভিযোগ ট্র্যাকিং</h2>
          <p className="text-white/70 text-sm mt-1">শুধুমাত্র মোবাইল নম্বর দিয়ে অবস্থা দেখুন</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">মোবাইল নম্বর</label>
              <input
                required
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="০১৮XXXXXXXX"
                className="w-full px-5 py-4 rounded-xl border border-gray-100 focus:border-gov-green outline-none text-center text-xl font-bold tracking-wider"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-4 bg-gov-green hover:bg-opacity-90 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
          >
            অবস্থা দেখুন
          </button>
          
          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
            * আপনার মোবাইল নম্বরটি দিয়ে ইতিপূর্বে করা সকল অভিযোগের সর্বশেষ আপডেট জানতে পারবেন।
          </p>
        </form>
      </div>
    </div>
  );
};
