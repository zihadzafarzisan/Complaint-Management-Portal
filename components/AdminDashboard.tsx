
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ComplaintForm } from '../types';
import { db } from '../services/db';

interface Props {
  onLogout?: () => void;
}

const ITEMS_PER_PAGE = 8;

export const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [items, setItems] = useState<ComplaintForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<ComplaintForm | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'solved' | 'rejected'>('all');

  const refreshData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await db.getAllComplaints();
      setItems(data);
    } catch (err: any) {
      console.error("Failed to refresh data:", err);
      setError("ডেটা লোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
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
      setSelectedItem(prev => prev ? { ...prev, adminFeedback: feedbackText } : null);
      setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, adminFeedback: feedbackText } : i));
      alert('ফিডব্যাক সফলভাবে সংরক্ষিত হয়েছে।');
    } catch (err) {
      alert('ফিডব্যাক সেভ করতে সমস্যা হয়েছে।');
    }
  };

  const handleStatusUpdate = async (id: string, status: ComplaintForm['status']) => {
    try {
      await db.updateStatus(id, status);
      setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
      if (selectedItem?.id === id) {
        setSelectedItem(prev => prev ? { ...prev, status } : null);
      }
      alert('অবস্থা আপডেট হয়েছে।');
    } catch (err) {
      alert('অবস্থা আপডেট করতে সমস্যা হয়েছে।');
    }
  };

  const handlePrint = () => {
    if (!selectedItem) return;
    const printContent = `
      <div style="font-family: 'Hind Siliguri', sans-serif; padding: 40px; line-height: 1.6; color: #1e293b; max-width: 800px; margin: auto;">
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #006a4e; padding-bottom: 20px;">
          <h1 style="color: #006a4e; margin-bottom: 5px; font-size: 28px;">এবিএম আশরাফ উদ্দিন নিজান এর কার্যালয়</h1>
          <p style="margin: 0; font-weight: bold; color: #64748b; font-size: 16px;">সংসদ সদস্য, লক্ষ্মীপুর-৪ নির্বাচনী এলাকা</p>
          <div style="margin-top: 10px; font-weight: 900; color: #f42a41; text-transform: uppercase; letter-spacing: 2px;">ডিজিটাল অভিযোগ নিস্পত্তি কার্ড</div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
             <p style="margin: 0 0 10px 0; font-size: 12px; color: #94a3b8; font-weight: bold; text-transform: uppercase;">আবেদনকারীর তথ্য</p>
             <h2 style="margin: 0; font-size: 20px; color: #1e293b;">${selectedItem.name}</h2>
             <p style="margin: 5px 0; color: #006a4e; font-weight: bold;">${selectedItem.mobile}</p>
             <p style="margin: 5px 0; font-size: 14px;">ঠিকানা: ${selectedItem.address}</p>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
             <p style="margin: 0 0 10px 0; font-size: 12px; color: #94a3b8; font-weight: bold; text-transform: uppercase;">ফাইলের তথ্য</p>
             <p style="margin: 5px 0; font-size: 14px;">ট্র্যাকিং আইডি: <strong>${selectedItem.id}</strong></p>
             <p style="margin: 5px 0; font-size: 14px;">তারিখ: <strong>${new Date(selectedItem.submittedAt).toLocaleString('bn-BD')}</strong></p>
             <p style="margin: 5px 0; font-size: 14px;">অবস্থা: <strong>${selectedItem.status === 'solved' ? 'সমাধানকৃত' : selectedItem.status === 'rejected' ? 'বাতিলকৃত' : 'প্রক্রিয়াধীন'}</strong></p>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="margin: 0 0 15px 0; font-size: 18px; border-left: 4px solid #f42a41; padding-left: 15px;">বিষয়: ${selectedItem.subject}</h3>
          <div style="background: #ffffff; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; min-height: 150px; white-space: pre-wrap;">${selectedItem.details}</div>
        </div>

        ${selectedItem.adminFeedback ? `
        <div style="margin-top: 30px; background: #fffbeb; padding: 25px; border-radius: 12px; border: 1px solid #fef3c7;">
          <h4 style="margin: 0 0 10px 0; color: #92400e; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">অফিসিয়াল সিদ্ধান্ত ও ফিডব্যাক</h4>
          <p style="margin: 0; font-size: 16px; color: #451a03;">${selectedItem.adminFeedback}</p>
        </div>` : ''}

        <div style="margin-top: 80px; display: flex; justify-content: space-between;">
           <div style="text-align: center; width: 200px;"><div style="border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 14px; font-weight: bold;">সাক্ষর (কর্তৃপক্ষ)</div></div>
           <div style="text-align: center; width: 200px;"><div style="border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 14px; font-weight: bold;">তারিখ</div></div>
        </div>
        
        <div style="margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8;">
          এটি একটি ডিজিটাল কপি এবং এটি সিস্টেম দ্বারা প্রস্তুতকৃত।
        </div>
      </div>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<html><head><title>Complaint_Report_${selectedItem.id}</title><link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri&display=swap" rel="stylesheet"></head><body style="margin:0;">${printContent}</body></html>`);
      win.document.close();
      setTimeout(() => {
        win.focus();
        win.print();
      }, 700);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const cleanSearch = searchTerm.trim().toLowerCase();
      const matchesSearch = (item.subject || '').toLowerCase().includes(cleanSearch) || 
                            (item.mobile || '').includes(cleanSearch) || 
                            (item.name?.toLowerCase().includes(cleanSearch));
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  return (
    <div className="view-transition">
      {/* List Header Controls */}
      <div className="bg-white p-4 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <h2 className="text-2xl font-black text-slate-800 font-hind">অভিযোগ ব্যবস্থাপনা</h2>
              <p className="text-slate-400 text-sm font-hind">সকল জমা পড়া অভিযোগ এবং তাদের বর্তমান অবস্থা</p>
           </div>
           <div className="flex items-center gap-3">
              <div className="px-5 py-2 bg-gov-green/5 text-gov-green rounded-full font-black text-xs uppercase tracking-widest border border-gov-green/10">
                Total: {items.length}
              </div>
              <button onClick={() => refreshData()} className="p-2 text-slate-400 hover:text-gov-green transition-colors">
                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input 
              type="text" 
              placeholder="নাম, মোবাইল বা বিষয় লিখে খুঁজুন..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-gov-green focus:bg-white outline-none font-hind transition-all shadow-inner"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-gov-green outline-none font-hind font-bold text-slate-600 cursor-pointer shadow-inner"
            >
              <option value="all">সবগুলো স্ট্যাটাস</option>
              <option value="pending">প্রক্রিয়াধীন</option>
              <option value="solved">সমাধানকৃত</option>
              <option value="rejected">বাতিলকৃত</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      {error && (
        <div className="mb-8 p-6 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-4 text-red-600 font-hind animate-in slide-in-from-top-4">
          <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <p className="font-bold flex-1">{error}</p>
          <button onClick={() => refreshData()} className="px-4 py-2 bg-red-600 text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">Retry</button>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100 min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] md:text-[12px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
              <tr>
                <th className="px-8 py-6 text-left">আবেদনকারী</th>
                <th className="px-8 py-6 text-left">বিষয় ও বিবরণ</th>
                <th className="px-8 py-6 text-center">অবস্থা</th>
                <th className="px-8 py-6 text-right">ম্যানেজ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-8 py-7"><div className="h-4 bg-slate-100 rounded w-24 mb-2"></div><div className="h-3 bg-slate-50 rounded w-32"></div></td>
                    <td className="px-8 py-7"><div className="h-4 bg-slate-100 rounded w-48 mb-2"></div><div className="h-3 bg-slate-50 rounded w-20"></div></td>
                    <td className="px-8 py-7"><div className="h-6 bg-slate-100 rounded-full w-16 mx-auto"></div></td>
                    <td className="px-8 py-7 text-right"><div className="h-10 bg-slate-100 rounded-xl w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : paginatedItems.map(item => (
                <tr key={item.id} className={`hover:bg-slate-50/70 transition-all group ${!item.isRead ? 'bg-gov-green/[0.03]' : ''}`}>
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-3">
                       {!item.isRead && <div className="w-2.5 h-2.5 bg-gov-red rounded-full shadow-sm ring-4 ring-red-50"></div>}
                       <div>
                          <div className={`text-base md:text-lg ${!item.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-700'} font-hind`}>{item.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono tracking-widest">{item.mobile}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="text-sm font-bold text-slate-600 font-hind truncate max-w-xs">{item.subject}</div>
                    <div className="text-[10px] text-slate-300 mt-1 uppercase font-black tracking-widest">{new Date(item.submittedAt).toLocaleDateString('bn-BD')}</div>
                  </td>
                  <td className="px-8 py-7 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-block shadow-sm ${
                      item.status === 'solved' ? 'bg-emerald-100 text-emerald-700' : 
                      item.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status === 'solved' ? 'Solved' : item.status === 'rejected' ? 'Rejected' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <button 
                      onClick={() => handleOpenDetails(item)} 
                      className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-gov-green transition-all uppercase tracking-widest shadow-md active:scale-95 group-hover:-translate-x-1"
                    >
                      Case File
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && paginatedItems.length === 0 && (
            <div className="py-32 text-center bg-slate-50/20">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.183.445V20a2 2 0 002 2h11.429a2 2 0 002-2v-4.572zM12 2a5 5 0 00-5 5v2a5 5 0 0010 0V7a5 5 0 00-5-5z"/></svg>
              </div>
              <p className="text-slate-400 font-hind font-black text-xl">কোনো তথ্য খুঁজে পাওয়া যায়নি</p>
              <button onClick={() => {setSearchTerm(''); setStatusFilter('all');}} className="mt-4 text-gov-green font-bold text-sm underline">রিসেট করুন</button>
            </div>
          )}
        </div>

        {/* Footer Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Page {currentPage} of {totalPages}</span>
            <div className="flex gap-3">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-gov-green disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-gov-green disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Case File Page (Modal View) - PERFECT VISIBILITY AND CENTERED */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-slate-500/30 backdrop-blur-md flex items-center justify-center p-4 z-[9999] opacity-100 transition-all"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative overflow-hidden transform scale-100 opacity-100 transition-all border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Area */}
            <div className="px-6 py-4 md:px-10 md:py-6 border-b bg-slate-50/80 shrink-0 flex items-center gap-4">
              <button 
                onClick={() => setSelectedItem(null)}
                className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-500 hover:text-gov-green border border-slate-200 shadow-sm transition-all active:scale-90"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              </button>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg md:text-xl font-black text-slate-900 font-hind truncate">অভিযোগের ফাইল কার্ড</h3>
                  <span className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest inline-block ${
                    selectedItem.status === 'solved' ? 'bg-emerald-100 text-emerald-700' : 
                    selectedItem.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedItem.status === 'solved' ? 'Solved' : selectedItem.status === 'rejected' ? 'Rejected' : 'Pending'}
                  </span>
                </div>
                <p className="text-slate-400 font-mono text-[9px] uppercase tracking-[0.2em] mt-0.5 truncate">Tracking ID: {selectedItem.id}</p>
              </div>
            </div>

            {/* Scrollable Content View */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-white">
              {/* Applicant Info */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">আবেদনকারীর প্রোফাইল</p>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-black text-slate-900 font-hind">{selectedItem.name}</h4>
                      <p className="text-gov-green font-black text-base font-mono mt-0.5">{selectedItem.mobile}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:border-l border-slate-200 md:pl-6">
                       <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          <p className="text-xs font-bold text-slate-600 font-hind truncate max-w-[150px]">{selectedItem.address}</p>
                       </div>
                       <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                          <p className="text-xs font-bold text-slate-600 font-hind">{new Date(selectedItem.submittedAt).toLocaleDateString('bn-BD')}</p>
                       </div>
                    </div>
                  </div>
              </div>

              {/* Subject & Details */}
              <div className="space-y-4">
                <div className="inline-block bg-gov-red text-white px-4 py-1 rounded-full font-black text-[9px] uppercase tracking-widest">বিষয়বস্তু</div>
                <h4 className="text-base md:text-lg font-black text-slate-900 font-hind leading-tight">বিষয়: {selectedItem.subject}</h4>
                <div className="text-slate-700 font-hind text-base leading-relaxed whitespace-pre-wrap p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                  {selectedItem.details}
                </div>
              </div>

              {/* Attachment */}
              {selectedItem.attachmentData && (
                <div className="pt-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">সংযুক্ত নথি</p>
                  {selectedItem.attachmentType?.startsWith('image/') ? (
                    <div className="rounded-xl overflow-hidden border border-slate-100 shadow-md max-w-sm mx-auto">
                      <img src={selectedItem.attachmentData} className="w-full h-auto" alt="Attachment" />
                    </div>
                  ) : (
                    <a href={selectedItem.attachmentData} download={selectedItem.attachmentName} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 hover:bg-white transition-all">
                      <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center shrink-0 font-bold">PDF</div>
                      <span className="font-bold text-slate-700 font-hind truncate text-sm">{selectedItem.attachmentName}</span>
                    </a>
                  )}
                </div>
              )}

              {/* Feedback */}
              <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100/50 space-y-4">
                <label className="text-[9px] font-black text-amber-700 uppercase tracking-widest block">অফিসিয়াল ফিডব্যাক</label>
                <textarea 
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="মতামত এখানে লিখুন..."
                  className="w-full p-4 rounded-xl bg-white border border-amber-100 outline-none font-hind text-sm md:text-base min-h-[100px] resize-none shadow-sm"
                ></textarea>
                <div className="flex justify-end">
                  <button onClick={handleSaveFeedback} className="px-6 py-2 bg-slate-900 text-white text-[10px] font-black rounded-lg hover:bg-gov-green transition-all uppercase tracking-widest">Update Feedback</button>
                </div>
              </div>
            </div>

            {/* Sticky Actions */}
            <div className="p-6 md:p-8 border-t bg-slate-50/90 shrink-0 flex flex-wrap gap-3 items-center">
              <div className="flex gap-3 flex-1 min-w-[200px]">
                <button 
                  onClick={() => handleStatusUpdate(selectedItem.id, 'solved')}
                  className={`flex-1 py-3.5 rounded-xl font-black font-hind text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${
                    selectedItem.status === 'solved' ? 'bg-emerald-600 text-white' : 'bg-white border border-emerald-100 text-emerald-600'
                  }`}
                >
                  সমাধানকৃত
                </button>
                <button 
                  onClick={() => handleStatusUpdate(selectedItem.id, 'rejected')}
                  className={`flex-1 py-3.5 rounded-xl font-black font-hind text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${
                    selectedItem.status === 'rejected' ? 'bg-gov-red text-white' : 'bg-white border border-red-100 text-gov-red'
                  }`}
                >
                  বাতিল করুন
                </button>
              </div>
              <button 
                onClick={handlePrint}
                className="w-full md:w-auto px-6 py-3.5 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                Print Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
