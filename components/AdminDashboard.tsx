
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ComplaintForm } from '../types';
import { db } from '../services/db';

interface Props {
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [items, setItems] = useState<ComplaintForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'solved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<ComplaintForm | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const refreshData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await db.getAllComplaints();
      setItems(data);
    } catch (err) {
      console.error("Failed to refresh data:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    const subscription = db.subscribeToComplaints(() => refreshData(false));
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [refreshData]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      pending: items.filter(i => i.status === 'pending').length,
      solved: items.filter(i => i.status === 'solved').length,
      rejected: items.filter(i => i.status === 'rejected').length
    };
  }, [items]);

  const handleOpenDetails = async (item: ComplaintForm) => {
    setSelectedItem(item);
    setFeedbackText(item.adminFeedback || '');
    if (item.isRead === false || item.isRead === undefined) {
      try {
        await db.markAsRead(item.id);
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, isRead: true } : i));
      } catch (e) {
        console.warn("Could not mark as read", e);
      }
    }
  };

  const handleSaveFeedback = async () => {
    if (!selectedItem) return;
    try {
      await db.updateFeedback(selectedItem.id, feedbackText);
      alert('ফিডব্যাক সফলভাবে সংরক্ষিত হয়েছে।');
      setSelectedItem(prev => prev ? { ...prev, adminFeedback: feedbackText } : null);
      refreshData(false);
    } catch (err) {
      alert('ফিডব্যাক সেভ করতে সমস্যা হয়েছে।');
    }
  };

  const handleStatusUpdate = async (id: string, status: ComplaintForm['status']) => {
    try {
      await db.updateStatus(id, status);
      // Update UI immediately
      setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
      if (selectedItem?.id === id) {
        setSelectedItem(prev => prev ? { ...prev, status } : null);
      }
    } catch (err) {
      alert('অবস্থা আপডেট করতে সমস্যা হয়েছে।');
    }
  };

  const handleDeleteToReject = async (id: string) => {
    if (confirm('আপনি কি এই অভিযোগটি বাতিল করতে চান? এটি ইউজারের কাছে "বাতিলকৃত" হিসেবে দেখাবে।')) {
      await handleStatusUpdate(id, 'rejected');
    }
  };

  const handleDeletePermanent = async (id: string) => {
    if (confirm('সতর্কবার্তা: এটি ডাটাবেজ থেকে চিরতরে মুছে যাবে। আপনি কি নিশ্চিত?')) {
      try {
        await db.deletePermanently(id);
        setItems(prev => prev.filter(i => i.id !== id));
        if (selectedItem?.id === id) setSelectedItem(null);
      } catch (err) {
        alert('মুছে ফেলতে সমস্যা হয়েছে।');
      }
    }
  };

  const handlePrint = () => {
    if (!selectedItem) return;
    const printContent = `
      <div style="font-family: 'Hind Siliguri', sans-serif; padding: 40px; line-height: 1.6;">
        <h1 style="color: #006a4e; text-align: center;">এবিএম আশরাফ উদ্দিন নিজান এর কার্যালয়</h1>
        <hr/>
        <h2>অভিযোগ রিপোর্ট (ID: ${selectedItem.id})</h2>
        <p><strong>আবেদনকারী:</strong> ${selectedItem.name}</p>
        <p><strong>মোবাইল:</strong> ${selectedItem.mobile}</p>
        <p><strong>ঠিকানা:</strong> ${selectedItem.address}</p>
        <p><strong>জমাদানের তারিখ:</strong> ${new Date(selectedItem.submittedAt).toLocaleString('bn-BD')}</p>
        <hr/>
        <h3>বিষয়: ${selectedItem.subject}</h3>
        <p style="white-space: pre-wrap; background: #f9f9f9; padding: 20px; border-radius: 10px;">${selectedItem.details}</p>
        ${selectedItem.adminFeedback ? `<div style="margin-top:20px; border-top:2px solid #fbbf24; padding-top:10px;"><h3>অফিসিয়াল ফিডব্যাক:</h3><p>${selectedItem.adminFeedback}</p></div>` : ''}
        <br/><br/><br/>
        <div style="text-align: right;"><p>___________________</p><p>সাক্ষর ও সীল</p></div>
      </div>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<html><head><title>Print Report</title></head><body>${printContent}</body></html>`);
      win.document.close();
      setTimeout(() => { win.print(); win.close(); }, 500);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const cleanSearch = searchTerm.trim().toLowerCase();
    const matchesSearch = (item.subject || '').toLowerCase().includes(cleanSearch) || 
                          (item.mobile || '').includes(cleanSearch) || 
                          (item.name?.toLowerCase().includes(cleanSearch));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="view-transition">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
        {[
          { label: 'মোট অভিযোগ', val: stats.total, color: 'border-gov-green', action: () => setFilter('all'), current: 'all' },
          { label: 'অপেক্ষমান', val: stats.pending, color: 'border-amber-400', action: () => setFilter('pending'), current: 'pending' },
          { label: 'সমাধানকৃত', val: stats.solved, color: 'border-emerald-500', action: () => setFilter('solved'), current: 'solved' },
          { label: 'বাতিলকৃত', val: stats.rejected, color: 'border-gov-red', action: () => setFilter('rejected'), current: 'rejected' }
        ].map((s, i) => (
          <div key={i} onClick={s.action} className={`bg-white p-4 md:p-8 rounded-xl md:rounded-[1.5rem] border-l-4 md:border-l-8 ${s.color} shadow-sm hover:shadow-xl transition-all group cursor-pointer ${filter === s.current ? 'ring-2 ring-inset ring-gov-green/20 scale-105' : ''}`}>
            <p className="text-[8px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-3 group-hover:text-gov-green transition-colors">{s.label}</p>
            <p className="text-2xl md:text-4xl font-black text-slate-800">{s.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-3 md:p-5 rounded-xl md:rounded-[1.5rem] shadow-sm border border-slate-100 mb-6 md:mb-10 flex flex-col md:flex-row gap-4 md:gap-5 items-center">
        <div className="relative flex-1 w-full">
          <svg className="w-4 h-4 md:w-5 md:h-5 absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input 
            type="text" 
            placeholder="নাম বা মোবাইল দিয়ে খুঁজুন..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-10 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-gov-green/5 outline-none text-[10px] md:text-sm font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl md:rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-slate-50/50 text-slate-400 text-[9px] md:text-[11px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
              <tr>
                <th className="px-6 md:px-10 py-4 md:py-6 text-left">আবেদনকারী</th>
                <th className="px-6 md:px-10 py-4 md:py-6 text-left">অভিযোগের বিষয়</th>
                <th className="px-6 md:px-10 py-4 md:py-6 text-center">অবস্থা</th>
                <th className="px-6 md:px-10 py-4 md:py-6 text-right">ক্রিয়া</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map(item => (
                <tr key={item.id} className={`hover:bg-gov-green/[0.02] transition-colors group ${!item.isRead ? 'bg-gov-green/[0.04]' : ''}`}>
                  <td className="px-6 md:px-10 py-6 md:py-8">
                    <div className="flex items-center gap-2">
                       <div className={`text-slate-800 text-sm md:text-lg leading-tight ${!item.isRead ? 'font-black text-gov-green' : 'font-semibold'}`}>
                         {item.name}
                       </div>
                       {!item.isRead && (
                         <span className="bg-gov-red text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter animate-pulse shadow-sm">New</span>
                       )}
                    </div>
                    <div className="text-[8px] md:text-[11px] text-gov-green font-black tracking-widest mt-1.5 md:mt-2 bg-gov-green/5 inline-block px-1.5 py-0.5 rounded uppercase">{item.mobile}</div>
                  </td>
                  <td className="px-6 md:px-10 py-6 md:py-8">
                    <div className={`text-xs md:text-sm text-slate-700 max-w-[150px] md:max-w-xs truncate ${!item.isRead ? 'font-black' : 'font-medium'}`}>{item.subject}</div>
                    <button onClick={() => handleOpenDetails(item)} className="text-gov-green text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:text-gov-red mt-2 md:mt-3 block transition-colors border-b-2 border-gov-green/20">View Details →</button>
                  </td>
                  <td className="px-6 md:px-10 py-6 md:py-8 text-center">
                    <span className={`px-2 md:px-4 py-1 md:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest ${
                      item.status === 'solved' ? 'bg-green-50 text-green-600 border border-green-100' : 
                      item.status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {item.status === 'solved' ? 'সমাধানকৃত' : item.status === 'rejected' ? 'বাতিলকৃত' : 'প্রক্রিয়াধীন'}
                    </span>
                  </td>
                  <td className="px-6 md:px-10 py-6 md:py-8 text-right">
                    <div className="flex justify-end gap-2 md:gap-3">
                       <button onClick={() => handleStatusUpdate(item.id, 'solved')} className="p-2 md:p-3.5 bg-emerald-50 text-emerald-600 rounded-lg md:rounded-2xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all transform active:scale-90" title="সমাধান"><svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg></button>
                       <button onClick={() => handleDeleteToReject(item.id)} className="p-2 md:p-3.5 bg-red-50 text-red-600 rounded-lg md:rounded-2xl border border-red-100 hover:bg-red-600 hover:text-white transition-all transform active:scale-90" title="বাতিল করুন"><svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
                       <button onClick={() => handleDeletePermanent(item.id)} className="p-2 md:p-3.5 bg-slate-50 text-slate-400 rounded-lg md:rounded-2xl border border-slate-100 hover:bg-slate-800 hover:text-white transition-all transform active:scale-90" title="চিরতরে মুছুন"><svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-slate-400 font-bold font-hind">কোনো তথ্য পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-2 md:p-4 z-[100] animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col transform animate-in zoom-in-95">
            <div className="p-8 md:p-12 overflow-y-auto space-y-8">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="bg-gov-green/10 text-gov-green px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">ID: {selectedItem.id}</span>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-4 font-hind">{selectedItem.subject}</h3>
                </div>
                <button onClick={() => setSelectedItem(null)} className="text-3xl font-light hover:text-gov-red transition-colors">&times;</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-6 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">আবেদনকারী</p>
                  <p className="font-bold text-slate-800 font-hind">{selectedItem.name}</p>
                  <p className="text-gov-green font-black text-xs">{selectedItem.mobile}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ঠিকানা ও সময়</p>
                  <p className="font-bold text-slate-800 font-hind">{selectedItem.address}</p>
                  <p className="text-slate-400 text-[10px]">{new Date(selectedItem.submittedAt).toLocaleString('bn-BD')}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-l-4 border-gov-red pl-2">বর্ণনা</p>
                <div className="bg-slate-50 p-6 rounded-2xl text-slate-700 font-hind whitespace-pre-wrap leading-relaxed shadow-inner">
                  {selectedItem.details}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-l-4 border-amber-400 pl-2">অফিস ফিডব্যাক</p>
                <textarea 
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder=" সমাধান বা আপডেট সম্পর্কে ইউজারকে জানাতে এখানে লিখুন..."
                  className="w-full p-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-gov-green outline-none font-hind text-sm resize-none"
                  rows={3}
                ></textarea>
                <button 
                  onClick={handleSaveFeedback}
                  className="mt-3 px-6 py-2 bg-slate-800 text-white text-xs font-black rounded-lg hover:bg-gov-green transition-all uppercase tracking-widest"
                >
                  Save Feedback
                </button>
              </div>

              {selectedItem.attachmentData && (
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">সংযুক্ত ফাইল</p>
                   {selectedItem.attachmentType?.startsWith('image/') ? (
                     <img src={selectedItem.attachmentData} className="w-full rounded-2xl border-4 border-slate-100" />
                   ) : (
                     <a href={selectedItem.attachmentData} download={selectedItem.attachmentName} className="p-6 bg-slate-50 rounded-2xl flex items-center gap-4 hover:bg-gov-green/5 transition-all">
                       <svg className="w-8 h-8 text-gov-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                       <span className="font-bold text-slate-700 truncate">{selectedItem.attachmentName}</span>
                     </a>
                   )}
                 </div>
              )}
            </div>
            
            <div className="p-8 border-t bg-slate-50/50 flex gap-4">
              <button 
                onClick={() => handleStatusUpdate(selectedItem.id, 'solved')}
                className="flex-1 py-4 bg-gov-green text-white font-black rounded-xl hover:scale-105 transition-all font-hind"
              >
                সমাধান করা হয়েছে
              </button>
              <button 
                onClick={handlePrint}
                className="px-6 py-4 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
              </button>
              <button 
                onClick={() => handleStatusUpdate(selectedItem.id, 'rejected')}
                className="px-6 py-4 bg-white border-2 border-gov-red/20 text-gov-red rounded-xl hover:bg-red-50 font-hind"
              >
                বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
