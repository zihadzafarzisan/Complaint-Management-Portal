
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ComplaintFormSection } from './components/ComplaintFormSection';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { UserLogin } from './components/UserLogin';
import { UserDashboard } from './components/UserDashboard';
import { Footer } from './components/Footer';
import { SubmissionStatus } from './types';
import { db } from './services/db';

const App: React.FC = () => {
  const [status, setStatus] = useState<SubmissionStatus>({ type: 'idle' });
  const [currentView, setCurrentView] = useState<'public' | 'admin' | 'user'>('public');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('isAdminAuth') === 'true';
  });
  const [userMobile, setUserMobile] = useState<string | null>(() => {
    return sessionStorage.getItem('userMobile');
  });

  const handleAdminLogin = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true);
      sessionStorage.setItem('isAdminAuth', 'true');
    }
  };

  const handleUserLogin = async (mobile: string) => {
    setStatus({ type: 'loading', message: 'খোঁজা হচ্ছে...' });
    try {
      const data = await db.getComplaintsByMobile(mobile);
      if (data.length > 0) {
        setUserMobile(mobile);
        sessionStorage.setItem('userMobile', mobile);
        setCurrentView('user');
        setStatus({ type: 'idle' });
      } else {
        setStatus({ 
          type: 'error', 
          message: 'এই মোবাইল নম্বর দিয়ে কোনো সক্রিয় অভিযোগ পাওয়া যায়নি।' 
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setStatus({ 
        type: 'error', 
        message: `ডেটাবেজ এরর: ${error.message || 'অজানা সমস্যা'}` 
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserMobile(null);
    sessionStorage.removeItem('isAdminAuth');
    sessionStorage.removeItem('userMobile');
    setCurrentView('public');
  };

  const copySQL = () => {
    const createSQL = `-- ১. টেবিল তৈরি করুন
CREATE TABLE IF NOT EXISTS complaints (
  id TEXT PRIMARY KEY,
  name TEXT,
  mobile TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  subject TEXT NOT NULL,
  details TEXT NOT NULL,
  isPrivate BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending',
  submittedAt TIMESTAMPTZ DEFAULT NOW(),
  deletedAt TIMESTAMPTZ,
  attachmentName TEXT,
  attachmentData TEXT,
  attachmentType TEXT
);

-- ২. সিকিউরিটি লক খুলে দিন (এটি খুবই গুরুত্বপূর্ণ)
ALTER TABLE complaints DISABLE ROW LEVEL SECURITY;

-- ৩. রিয়েল-টাইম আপডেট চালু করুন
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE complaints;`;

    navigator.clipboard.writeText(createSQL).then(() => {
      alert('নতুন SQL কোডটি কপি হয়েছে! এটি Supabase-এর SQL Editor-এ রান করুন।');
    });
  };

  useEffect(() => {
    if (status.type === 'success' || status.type === 'error') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [status.type]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-gov-green/20">
      <Header 
        currentView={currentView} 
        onViewChange={(v) => setCurrentView(v as any)} 
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {currentView === 'public' && (
          <div className="view-transition bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 max-w-4xl mx-auto">
            <div className="bg-gov-green p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
              <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white font-hind">আপনার কথা বলুন সরাসরি</h1>
              <p className="text-lg md:text-xl opacity-90 leading-relaxed max-w-2xl mx-auto text-white font-hind font-medium">
                জনপ্রতিনিধির কাছে আপনার এলাকার সমস্যা বা গুরুত্বপূর্ণ মতামত সরাসরি পৌঁছে দিন।
              </p>
            </div>

            <div className="p-8 md:p-16">
              <div className="mb-10 flex items-center gap-4">
                <div className="w-1.5 h-10 bg-gov-red rounded-full"></div>
                <h2 className="text-3xl font-black text-slate-800 font-hind">অভিযোগ বা পরামর্শ ফর্ম</h2>
              </div>
              <ComplaintFormSection setStatus={setStatus} status={status} />
            </div>
          </div>
        )}

        {currentView === 'user' && (
          userMobile ? (
            <UserDashboard userMobile={userMobile} onLogout={handleLogout} />
          ) : (
            <UserLogin onLogin={handleUserLogin} />
          )
        )}

        {currentView === 'admin' && (
          isAuthenticated ? (
            <AdminDashboard onLogout={handleLogout} />
          ) : (
            <AdminLogin onLogin={handleAdminLogin} />
          )
        )}
      </main>

      <Footer />

      {/* Success Popup */}
      {status.type === 'success' && (
        <div className="fixed inset-0 bg-gov-green/40 backdrop-blur-xl flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-12 max-w-md w-full text-center shadow-2xl transform animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 font-hind">বার্তা পৌঁছেছে!</h2>
            <p className="text-slate-500 mb-10 leading-relaxed font-hind font-medium text-lg">আপনার মতামতটি গুরুত্বের সাথে বিবেচনা করা হবে। ধন্যবাদ।</p>
            <button onClick={() => setStatus({ type: 'idle' })} className="w-full bg-gov-green text-white font-black py-5 rounded-2xl text-xl shadow-xl shadow-gov-green/20 hover:scale-[1.02] active:scale-95 transition-all font-hind">ঠিক আছে</button>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {status.type === 'error' && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-5 mb-8">
               <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               </div>
               <div>
                 <h2 className="text-2xl font-black text-slate-800 font-hind">একটি সমস্যা হয়েছে</h2>
                 <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Database Fix Required</p>
               </div>
            </div>
            
            <p className="text-slate-600 text-lg mb-8 font-hind leading-relaxed font-medium">
              আপনার Supabase প্রজেক্টে আর এল এস (RLS) লক করা আছে। নিচের বাটনটি ক্লিক করে নতুন কোডটি কপি করুন এবং Supabase SQL Editor-এ রান করুন।
            </p>

            <div className="flex flex-col gap-4">
              <button onClick={copySQL} className="w-full bg-gov-green text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-green-100 hover:scale-[1.02] active:scale-95 transition-all font-hind">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 8h3m-3 4h3m-6-4h.01M9 17h.01" /></svg>
                নতুন SQL কোড কপি করুন
              </button>
              <button onClick={() => window.location.reload()} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all font-hind">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Reload Application
              </button>
              <button onClick={() => setStatus({ type: 'idle' })} className="w-full text-slate-400 py-3 text-sm font-black hover:text-slate-600 transition-colors font-hind uppercase tracking-widest">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {status.type === 'loading' && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-20 h-20">
               <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
               <div className="absolute inset-0 border-8 border-gov-green border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gov-green text-xl font-black animate-pulse font-hind">{status.message || 'দয়া করে অপেক্ষা করুন...'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
