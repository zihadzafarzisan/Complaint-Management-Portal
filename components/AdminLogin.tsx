
import React, { useState, useEffect } from 'react';

interface Props {
  onLogin: (success: boolean) => void;
}

export const AdminLogin: React.FC<Props> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [view, setView] = useState<'login' | 'reset'>('login');
  
  // States for Reset
  const [masterKey, setMasterKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Environment variables with fallbacks
  const MASTER_RESET_KEY = process.env.MASTER_RESET_KEY || 'MP_OFFICE_MASTER_2024'; 
  const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'nizam_office_2024';

  useEffect(() => {
    if (!localStorage.getItem('admin_password')) {
      localStorage.setItem('admin_password', DEFAULT_PASSWORD);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPassword = localStorage.getItem('admin_password') || DEFAULT_PASSWORD;
    
    if (password === storedPassword) {
      onLogin(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterKey !== MASTER_RESET_KEY) {
      setResetError('মাস্টার রিসেট কী (Master Key) ভুল।');
      return;
    }
    if (newPassword.length < 6) {
      setResetError('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    localStorage.setItem('admin_password', newPassword);
    setResetSuccess(true);
    setResetError('');
    setTimeout(() => {
      setView('login');
      setResetSuccess(false);
      setNewPassword('');
      setMasterKey('');
    }, 2000);
  };

  if (view === 'reset') {
    return (
      <div className="max-w-md mx-auto mt-12 md:mt-24 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-gov-red p-8 text-center text-white">
            <h2 className="text-2xl font-bold">পাসওয়ার্ড রিসেট করুন</h2>
            <p className="text-white/70 text-sm mt-1">নিরাপত্তা যাচাইকরণের জন্য মাস্টার কী প্রদান করুন</p>
          </div>
          
          <form onSubmit={handleReset} className="p-8 space-y-5">
            {resetSuccess ? (
              <div className="bg-green-50 text-green-600 p-4 rounded-xl text-center font-bold animate-bounce">
                পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">মাস্টার রিসেট কী</label>
                  <input
                    required
                    type="password"
                    value={masterKey}
                    onChange={(e) => setMasterKey(e.target.value)}
                    placeholder="মাস্টার কী লিখুন"
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-gov-red outline-none text-center"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">নতুন পাসওয়ার্ড সেট করুন</label>
                  <input
                    required
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="নতুন পাসওয়ার্ড"
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-gov-red outline-none text-center"
                  />
                </div>
                {resetError && (
                  <p className="text-red-500 text-xs font-bold text-center">{resetError}</p>
                )}
                <button
                  type="submit"
                  className="w-full py-4 bg-gov-red hover:bg-opacity-90 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
                >
                  পাসওয়ার্ড আপডেট করুন
                </button>
              </>
            )}
            
            <button
              type="button"
              onClick={() => setView('login')}
              className="w-full text-center text-sm text-gray-500 hover:text-gov-green font-bold transition-colors"
            >
              ← লগইন পেজে ফিরে যান
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 md:mt-24 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-gov-green p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">অফিস লগইন</h2>
          <p className="text-white/70 text-sm mt-1">শুধুমাত্র অনুমোদিত কর্মকর্তাদের জন্য</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">অ্যাক্সেস পাসওয়ার্ড</label>
            <input
              autoFocus
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="পাসওয়ার্ড লিখুন"
              className={`w-full px-5 py-4 rounded-xl border-2 transition-all outline-none text-center text-xl font-mono tracking-[0.5em] ${
                error ? 'border-red-500 bg-red-50' : 'border-gray-100 focus:border-gov-green focus:bg-white'
              }`}
            />
            {error && (
              <p className="text-red-500 text-xs font-bold text-center animate-bounce mt-2">ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gov-green hover:bg-opacity-90 text-white font-bold rounded-xl shadow-lg shadow-gov-green/20 transition-all active:scale-95"
          >
            প্রবেশ করুন
          </button>
          
          <div className="flex flex-col items-center gap-4">
            <button 
              type="button"
              onClick={() => setView('reset')}
              className="text-xs text-gray-400 hover:text-gov-red font-bold transition-colors underline decoration-dotted"
            >
              পাসওয়ার্ড ভুলে গেছেন? রিসেট করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
