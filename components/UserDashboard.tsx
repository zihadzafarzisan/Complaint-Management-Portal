
import React, { useState, useEffect } from 'react';
import { ComplaintForm } from '../types';
import { db } from '../services/db';

interface Props {
  userMobile: string;
  onLogout: () => void;
}

export const UserDashboard: React.FC<Props> = ({ userMobile, onLogout }) => {
  const [userComplaints, setUserComplaints] = useState<ComplaintForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await db.getComplaintsByMobile(userMobile);
        setUserComplaints(data);
      } catch (error) {
        console.error("Failed to load complaints", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userMobile]);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-gov-green font-hind">আমার অভিযোগসমূহ</h2>
          <p className="text-gray-500 mt-1 font-hind">আপনার করা অভিযোগগুলোর বর্তমান অবস্থা নিচে দেওয়া হলো।</p>
        </div>
        <button 
          onClick={onLogout}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 font-hind"
        >
          লগ আউট <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-gov-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold font-hind">লোড হচ্ছে...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {userComplaints.length > 0 ? userComplaints.map(item => (
            <div key={item.id} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      item.status === 'solved' ? 'bg-green-50 text-green-700 border-green-100' : 
                      item.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' : 
                      'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {item.status === 'solved' ? 'সমাধানকৃত' : 
                       item.status === 'rejected' ? 'বাতিলকৃত' : 
                       'প্রক্রিয়াধীন'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono font-bold bg-slate-50 px-3 py-1.5 rounded-full">TRACKING ID: {item.id}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-800 font-hind leading-tight">{item.subject}</h3>
                    <p className="text-gray-500 text-sm md:text-base mt-2 font-hind leading-relaxed">{item.details}</p>
                  </div>

                  {/* Admin Feedback Display */}
                  {item.adminFeedback && (
                    <div className="bg-amber-50/50 border-2 border-amber-100/50 p-5 rounded-2xl">
                      <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/></svg>
                        অফিস ফিডব্যাক
                      </p>
                      <p className="text-slate-700 font-hind font-semibold leading-relaxed">
                        {item.adminFeedback}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="text-left md:text-right shrink-0 border-t md:border-t-0 md:border-l border-slate-50 pt-4 md:pt-0 md:pl-8">
                  <div className="text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">জমাদানের তারিখ</div>
                  <div className="font-black text-slate-700 text-lg">{new Date(item.submittedAt).toLocaleDateString('bn-BD')}</div>
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-white py-20 rounded-3xl text-center border-2 border-dashed border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="text-gray-400 font-bold uppercase tracking-widest font-hind">এখনো কোনো অভিযোগ পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
