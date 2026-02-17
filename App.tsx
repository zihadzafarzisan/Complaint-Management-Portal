
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
  const [submittedId, setSubmittedId] = useState<string | null>(null);
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
          message: 'এই মোবাইল নম্বর দিয়ে কোনো সক্রিয় অভিযোগ পাওয়া যায়নি। অনুগ্রহ করে সঠিক নম্বর দিন।' 
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

-- ২. সিকিউরিটি লক খুলে দিন
ALTER TABLE complaints DISABLE ROW LEVEL SECURITY;

-- ৩. রিয়েল-টাইম আপডেট চালু করুন
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE complaints;`;

    navigator.clipboard.writeText(createSQL).then(() => {
      alert('SQL কপি হয়েছে! এটি Supabase SQL Editor-এ রান করুন।');
    });
  };

  const onSubmissionSuccess = (id: string) => {
    setSubmittedId(id);
    setStatus({ type: 'success' });
  };

  useEffect(() => {
    if (status.type === 'success' || status.type === 'error') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [status.type]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfdfe] text-slate-900 selection:bg-gov-green/20">
      <Header 
        currentView={currentView} 
        onViewChange={(v) => setCurrentView(v as any)} 
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {currentView === 'public' && (
          <div className="view-transition max-w-4xl mx-auto space-y-12">
            {/* Hero & Search Section */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
              <div className="bg-gov-green p-12 md:p-20 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                
                <h1 className="text-4xl md:text-7xl font-black mb-8 tracking-tight text-white font-hind leading-tight">আপনার কথা বলুন সরাসরি</h1>
                <p className="text-lg md:text-2xl opacity-90 leading-relaxed max-w-2xl mx-auto text-white font-hind font-medium mb-12">
                  জনপ্রতিনিধির কাছে আপনার এলাকার সমস্যা সরাসরি পৌঁছে দিন।
                </p>

                {/* Main Search Bar */}
                <div className="max-w-md mx-auto relative group">
                  <div className="absolute inset-0 bg-white/20 blur-xl rounded-full group-hover:bg-white/30 transition-all"></div>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const mobile = (e.currentTarget.elements.namedItem('search_mobile') as HTMLInputElement).value;
                      handleUserLogin(mobile);
                    }}
                    className="relative flex bg-white p-2 rounded-2xl shadow-lg"
                  >
                    <input 
                      name="search_mobile"
                      required
                      type="tel" 
                      placeholder="অভিযোগের অবস্থা দেখতে নম্বর লিখুন..." 
                      className="flex-1 px-6 py-4 bg-transparent outline-none text-slate-800 font-bold placeholder:text-slate-400 font-hind"
                    />
                    <button type="submit" className="bg-gov-red text-white px-8 py-4 rounded-xl font-black flex items-center gap-2 hover:bg-gov-red/90 transition-all active:scale-95">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                      খুঁজুন
                    </button>
                  </form>
                </div>
              </div>

              {/* Form Section */}
              <div className="p-8 md:p-16">
                <div className="mb-12 flex items-center gap-5">
                  <div className="w-2 h-12 bg-gov-red rounded-full"></div>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-800 font-hind">নতুন অভিযোগ বা পরামর্শ ফর্ম</h2>
                </div>
                <ComplaintFormSection setStatus={setStatus} status={status} onSuccess={onSubmissionSuccess} />
              </div>
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
        <div className="fixed inset-0 bg-gov-green/60 backdrop-blur-2xl flex items-center justify-center p-4 z-[100] animate-in fade-in duration-500">
          <div className="bg-white rounded-[3rem] p-12 max-w-lg w-full text-center shadow-2xl transform animate-in zoom-in-95 duration-500 border border-white/20">
            <div className="w-28 h-28 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner scale-110">
              <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-6 font-hind">বার্তা সফলভাবে পৌঁছেছে!</h2>
            <p className="text-slate-500 mb-8 leading-relaxed font-hind font-medium text-lg">আপনার মতামতটি গুরুত্বের সাথে বিবেচনা করা হবে। নিচের ট্র্যাকিং আইডিটি সংরক্ষণ করুন:</p>
            
            <div className="bg-slate-50 p-6 rounded-2xl mb-10 border-2 border-dashed border-gov-green/20 flex items-center justify-between group">
               <span className="text-gov-green font-mono font-black text-2xl tracking-widest">{submittedId}</span>
               <button 
                 onClick={() => {
                   navigator.clipboard.writeText(submittedId || '');
                   alert('আইডি কপি হয়েছে!');
                 }}
                 className="text-[10px] font-black uppercase tracking-widest bg-gov-green text-white px-4 py-2 rounded-lg hover:scale-105 active:scale-95 transition-all"
               >
                 Copy ID
               </button>
            </div>

            <button onClick={() => setStatus({ type: 'idle' })} className="w-full bg-gov-green text-white font-black py-6 rounded-2xl text-xl shadow-2xl shadow-green-200 hover:scale-[1.02] active:scale-95 transition-all font-hind">ঠিক আছে</button>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {status.type === 'error' && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4 z-[100] animate-in fade-in">
          <div className="bg-white rounded-[3rem] p-12 max-w-lg w-full shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-6 mb-8">
               <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shrink-0">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               </div>
               <div>
                 <h2 className="text-3xl font-black text-slate-800 font-hind">একটি সমস্যা হয়েছে</h2>
                 <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1">Information System</p>
               </div>
            </div>
            
            <p className="text-slate-600 text-lg mb-10 font-hind leading-relaxed font-medium">
              {status.message || 'দুঃখিত, কোনো তথ্য পাওয়া যায়নি। সঠিক মোবাইল নম্বর ব্যবহার করে আবার চেষ্টা করুন।'}
            </p>

            <div className="flex flex-col gap-4">
              <button onClick={() => setStatus({ type: 'idle' })} className="w-full bg-gov-green text-white py-6 rounded-2xl font-black text-xl shadow-2xl shadow-green-100 hover:scale-[1.02] active:scale-95 transition-all font-hind">
                আবার চেষ্টা করুন
              </button>
              <button onClick={copySQL} className="text-xs text-slate-400 font-black uppercase tracking-widest mt-4 hover:text-gov-red transition-colors">Setup Database (Admin Only)</button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {status.type === 'loading' && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md flex items-center justify-center z-[150] animate-in fade-in duration-500">
          <div className="flex flex-col items-center gap-8">
            <div className="relative w-24 h-24">
               <div className="absolute inset-0 border-[10px] border-slate-100 rounded-full"></div>
               <div className="absolute inset-0 border-[10px] border-gov-green border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gov-green text-2xl font-black animate-pulse font-hind">{status.message || 'দয়া করে অপেক্ষা করুন...'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
