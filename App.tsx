
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

  const handleReload = () => {
    window.location.reload();
  };

  const copySQL = (type: 'update' | 'create') => {
    const updateSQL = `ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS attachmentName TEXT,
ADD COLUMN IF NOT EXISTS attachmentData TEXT,
ADD COLUMN IF NOT EXISTS attachmentType TEXT;`;

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
);`;

    const sql = type === 'create' ? createSQL : updateSQL;
    
    navigator.clipboard.writeText(sql).then(() => {
      alert('SQL কোডটি কপি করা হয়েছে! এখন সুপাবেস SQL Editor-এ গিয়ে পেস্ট করুন এবং Run বাটনে ক্লিক করুন।');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert('কোডটি ম্যানুয়ালি সিলেক্ট করে কপি করুন।');
    });
  };

  useEffect(() => {
    if (status.type === 'success' || status.type === 'error') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [status.type]);

  const isSchemaError = status.message?.includes('PGRST204');
  const isTableMissing = status.message?.includes('PGRST205');
  const errorTitle = isSchemaError ? 'ডেটাবেজ আপডেট প্রয়োজন' : (isTableMissing ? 'টেবিল তৈরি করা প্রয়োজন' : 'একটি সমস্যা হয়েছে');

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
              <h1 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">আপনার কথা বলুন সরাসরি</h1>
              <p className="text-lg md:text-xl opacity-90 leading-relaxed max-w-3xl mx-auto">
                আপনার এলাকার যেকোনো সমস্যা বা মতামত সরাসরি আমাদের জানান। অবস্থা দেখতে শুধুমাত্র আপনার মোবাইল নম্বরটি ব্যবহার করুন।
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => setCurrentView('user')}
                  className="bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  আমার অভিযোগের অবস্থা দেখুন
                </button>
              </div>
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
        <div className="fixed inset-0 bg-gov-green/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-2xl transform transition-all animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">বার্তা পৌঁছেছে!</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              আপনার মতামত গৃহীত হয়েছে।
            </p>
            <button onClick={() => setStatus({ type: 'idle' })} className="w-full bg-gov-green text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:bg-opacity-90 transition-all">ঠিক আছে</button>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {status.type === 'error' && (
        <div className="fixed inset-0 bg-red-500/10 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 md:p-10 max-w-lg w-full text-center shadow-2xl transform transition-all animate-in fade-in zoom-in duration-300 my-8">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{errorTitle}</h2>
            <div className="bg-red-50 p-4 rounded-xl text-red-700 text-sm mb-6 border border-red-100 font-mono text-left whitespace-pre-wrap break-words">
              {status.message}
            </div>
            
            {(isSchemaError || isTableMissing) && (
              <div className="mb-6 p-4 bg-slate-50 border rounded-xl text-left">
                <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-tighter">সমাধান (এটি সুপাবেস SQL Editor-এ রান করুন):</p>
                <div className="bg-slate-900 text-green-400 p-3 rounded-lg text-[10px] font-mono mb-3 overflow-x-auto whitespace-pre select-all">
                  {isSchemaError ? 
`ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS attachmentName TEXT,
ADD COLUMN IF NOT EXISTS attachmentData TEXT,
ADD COLUMN IF NOT EXISTS attachmentType TEXT;` :
`CREATE TABLE complaints (
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
                <button 
                  onClick={() => copySQL(isTableMissing ? 'create' : 'update')} 
                  className="w-full bg-gov-green text-white py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all mb-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 8h3m-3 4h3m-6-4h.01M9 17h.01" /></svg>
                  কোড কপি করুন
                </button>
                <button onClick={handleReload} className="w-full border border-slate-300 text-slate-600 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-all">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                  কোড রান করার পর পেজ রিফ্রেশ দিন
                </button>
              </div>
            )}

            <div className="space-y-3">
              <button onClick={() => setStatus({ type: 'idle' })} className="w-full bg-gov-red text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:bg-opacity-90 transition-all">বন্ধ করুন</button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {status.type === 'loading' && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-gov-green border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gov-green font-bold animate-pulse">{status.message || 'অপেক্ষা করুন...'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
