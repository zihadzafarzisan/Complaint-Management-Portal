
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
          <h2 className="text-3xl font-black text-gov-green">আমার অভিযোগসমূহ</h2>
          <p className="text-gray-500 mt-1">আপনার করা অভিযোগগুলোর বর্তমান অবস্থা নিচে দেওয়া হলো।</p>
        </div>
        <button 
          onClick={onLogout}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2"
        >
          লগ আউট <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-gov-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold">লোড হচ্ছে...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {userComplaints.length > 0 ? userComplaints.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.status === 'solved' ? 'bg-green-100 text-green-700' : 
                      item.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status === 'solved' ? 'সমাধানকৃত' : 
                       item.status === 'rejected' ? 'বাতিলকৃত' : 
                       'প্রক্রিয়াধীন'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">ID: {item.id}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{item.subject}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{item.details}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">জমাদানের তারিখ</div>
                  <div className="font-bold text-slate-700">{new Date(item.submittedAt).toLocaleDateString('bn-BD')}</div>
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-white py-20 rounded-3xl text-center border-2 border-dashed border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="text-gray-400 font-bold uppercase tracking-widest">এখনো কোনো অভিযোগ পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
