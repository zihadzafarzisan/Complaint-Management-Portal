
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
          message: 'এই মোবাইল নম্বর দিয়ে কোনো সক্রিয় অভিযোগ পাওয়া যায়নি। দয়া করে সঠিক নম্বর দিয়ে আবার চেষ্টা করুন।' 
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setStatus({ 
        type: 'error', 
        message: `ডেটাবেজ এরর: ${error.message || 'অজানা সমস্যা'} (Code: ${error.code || 'N/A'})` 
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
    const createSQL = `CREATE TABLE IF NOT EXISTS complaints (
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

-- Enable Realtime for this table
alter publication supabase_realtime add table complaints;`;

    navigator.clipboard.writeText(createSQL).then(() => {
      alert('SQL কোডটি কপি হয়েছে! এখন আপনার Supabase ড্যাশবোর্ডে গিয়ে SQL Editor-এ এটি পেস্ট করে Run করুন।');
    });
  };

  useEffect(() => {
    if (status.type === 'success' || status.type === 'error') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [status.type]);

  const isTableError = status.message?.includes('PGRST204') || status.message?.includes('PGRST205') || status.message?.includes('relation "complaints" does not exist');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-slate-900 selection:bg-gov-green/20">
      <Header 
        currentView={currentView} 
        onViewChange={(v) => setCurrentView(v as any)} 
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {currentView === 'public' && (
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 max-w-4xl mx-auto">
            <div className="bg-gov-green text-white p-8 md:p-12 text-center border-b-4 border-gov-red relative overflow-hidden">
              <h1 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-white">আপনার কথা বলুন সরাসরি</h1>
              <p className="text-lg md:text-xl opacity-90 leading-relaxed max-w-3xl mx-auto text-white">
                আপনার এলাকার যেকোনো সমস্যা বা মতামত সরাসরি আমাদের জানান।
              </p>
            </div>

            <div className="p-6 md:p-12">
              <div className="mb-8 flex items-center gap-3 text-gov-green">
                <div className="w-2 h-8 bg-gov-red rounded-full"></div>
                <h2 className="text-2xl font-bold">অভিযোগ ফর্ম</h2>
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
        <div className="fixed inset-0 bg-gov-green/20 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 font-hind">বার্তা পৌঁছেছে!</h2>
            <p className="text-gray-600 mb-8 leading-relaxed font-hind">আপনার মতামত সফলভাবে গৃহীত হয়েছে।</p>
            <button onClick={() => setStatus({ type: 'idle' })} className="w-full bg-gov-green text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:bg-opacity-90 transition-all font-hind">ঠিক আছে</button>
          </div>
        </div>
      )}

      {/* Error Popup - Enhanced for SQL Fix */}
      {status.type === 'error' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl overflow-hidden relative">
            <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shrink-0">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               </div>
               <h2 className="text-xl font-black text-slate-800 font-hind">ডেটাবেজ সেটআপ প্রয়োজন</h2>
            </div>
            
            <p className="text-slate-600 text-sm mb-6 font-hind leading-relaxed">
              আপনার Supabase প্রজেক্টে এখনও প্রয়োজনীয় টেবিল তৈরি করা হয়নি। নিচের বাটনটি ক্লিক করে SQL কোডটি কপি করুন এবং আপনার Supabase ড্যাশবোর্ডের **SQL Editor**-এ গিয়ে পেস্ট করে **Run** করুন।
            </p>

            <div className="bg-slate-900 rounded-2xl p-4 mb-6 font-mono text-[10px] text-green-400 overflow-x-auto whitespace-pre border-2 border-slate-800 shadow-inner">
{`CREATE TABLE complaints (
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
);`}
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={copySQL} className="w-full bg-gov-green text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-100 hover:scale-[1.02] active:scale-95 transition-all font-hind">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 8h3m-3 4h3m-6-4h.01M9 17h.01" /></svg>
                SQL কোড কপি করুন
              </button>
              <button onClick={() => setStatus({ type: 'idle' })} className="w-full text-slate-400 py-3 text-sm font-bold hover:text-slate-600 transition-colors font-hind">পরে করব</button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {status.type === 'loading' && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[70]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gov-green border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gov-green font-bold animate-pulse font-hind">{status.message || 'অপেক্ষা করুন...'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
