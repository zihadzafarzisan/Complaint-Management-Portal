
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
        // Local update to list to reflect read status
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
      // Update local states
      setSelectedItem(prev => prev ? { ...prev, adminFeedback: feedbackText } : null);
      setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, adminFeedback: feedbackText } : i));
    } catch (err) {
      alert('ফিডব্যাক সেভ করতে সমস্যা হয়েছে।');
    }
  };

  const handleStatusUpdate = async (id: string, status: ComplaintForm['status']) => {
    try {
      // Direct call to DB
      await db.updateStatus(id, status);
      // Immediate local state update for responsiveness
      setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
      if (selectedItem?.id === id) {
        setSelectedItem(prev => prev ? { ...prev, status } : null);
      }
    } catch (err) {
      alert('অবস্থা আপডেট করতে সমস্যা হয়েছে।');
      console.error(err);
    }
  };

  const handlePrint = () => {
    if (!selectedItem) return;
    const printContent = `
      <div style="font-family: 'Hind Siliguri', sans-serif; padding: 40px; line-height: 1.6; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #006a4e; margin-bottom: 5px;">এবিএম আশরাফ উদ্দিন নিজান এর কার্যালয়</h1>
          <p style="margin: 0; font-weight: bold; color: #64748b;">ডিজিটাল অভিযোগ নিস্পত্তি রিপোর্ট</p>
        </div>
        <div style="border: 2px solid #e2e8f0; border-radius: 15px; padding: 30px; position: relative; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 25px; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px;">
             <div><strong>ট্র্যাকিং আইডি:</strong> <span style="font-family: monospace; background: #f1f5f9; padding: 2px 8px; border-radius: 4px;">${selectedItem.id}</span></div>
             <div><strong>তারিখ:</strong> ${new Date(selectedItem.submittedAt).toLocaleString('bn-BD')}</div>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr><td style="padding: 10px 0; width: 160px; color: #64748b;"><strong>আবেদনকারী:</strong></td><td style="font-weight: 700;">${selectedItem.name}</td></tr>
            <tr><td style="padding: 10px 0; color: #64748b;"><strong>মোবাইল:</strong></td><td style="font-weight: 700;">${selectedItem.mobile}</td></tr>
            <tr><td style="padding: 10px 0; color: #64748b;"><strong>ঠিকানা:</strong></td><td style="font-weight: 700;">${selectedItem.address}</td></tr>
            <tr><td style="padding: 10px 0; color: #64748b;"><strong>বর্তমান অবস্থা:</strong></td><td style="font-weight: 700; color: ${selectedItem.status === 'solved' ? '#059669' : selectedItem.status === 'rejected' ? '#dc2626' : '#d97706'}">${selectedItem.status === 'solved' ? 'সমাধানকৃত' : selectedItem.status === 'rejected' ? 'বাতিলকৃত' : 'প্রক্রিয়াধীন'}</td></tr>
          </table>
          <div style="margin-top: 20px;">
            <h3 style="border-left: 5px solid #006a4e; padding-left: 15px; margin-bottom: 10px; color: #0f172a;">বিষয়: ${selectedItem.subject}</h3>
            <div style="white-space: pre-wrap; background: #f8fafc; padding: 25px; border-radius: 15px; border: 1px solid #e2e8f0; min-height: 150px; font-size: 1.1em;">${selectedItem.details}</div>
          </div>
          ${selectedItem.adminFeedback ? `
          <div style="margin-top: 35px; border: 2px dashed #fbbf24; background: #fffdf5; padding: 20px; border-radius: 15px;">
            <h4 style="margin: 0 0 10px 0; color: #92400e; font-size: 1.1em;">অফিসিয়াল ডিসিশন ও ফিডব্যাক:</h4>
            <p style="margin: 0; color: #451a03;">${selectedItem.adminFeedback}</p>
          </div>` : ''}
        </div>
        <div style="margin-top: 80px; display: flex; justify-content: space-between; padding: 0 40px;">
          <div style="text-align: center;"><p style="margin-bottom: 5px;">___________________</p><p style="margin:0; font-weight: bold;">সাক্ষর ও সিল</p><p style="margin:0; font-size: 0.8em; color: #64748b;">অফিস সহকারী</p></div>
          <div style="text-align: center;"><p style="margin-bottom: 5px;">___________________</p><p style="margin:0; font-weight: bold;">সাক্ষর ও সিল</p><p style="margin:0; font-size: 0.8em; color: #64748b;">অনুমোদনকারী</p></div>
        </div>
      </div>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<html><head><title>Report-${selectedItem.id}</title></head><body>${printContent}</body></html>`);
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
      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
        {[
          { label: 'মোট অভিযোগ', val: stats.total, color: 'border-gov-green', current: 'all' },
          { label: 'অপেক্ষমান', val: stats.pending, color: 'border-amber-400', current: 'pending' },
          { label: 'সমাধানকৃত', val: stats.solved, color: 'border-emerald-500', current: 'solved' },
          { label: 'বাতিলকৃত', val: stats.rejected, color: 'border-gov-red', current: 'rejected' }
        ].map((s, i) => (
          <div key={i} onClick={() => setFilter(s.current as any)} className={`bg-white p-4 md:p-8 rounded-xl md:rounded-[2rem] border-l-4 md:border-l-[10px] ${s.color} shadow-sm hover:shadow-xl transition-all group cursor-pointer ${filter === s.current ? 'ring-2 ring-inset ring-gov-green/20 scale-105 z-10' : ''}`}>
            <p className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-3 group-hover:text-gov-green transition-colors">{s.label}</p>
            <p className="text-2xl md:text-5xl font-black text-slate-800 leading-none">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Search Header */}
      <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 mb-8 md:mb-12 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <svg className="w-5 h-5 md:w-6 md:h-6 absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input 
            type="text" 
            placeholder="আবেদনকারীর নাম বা মোবাইল দিয়ে খুঁজুন..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-12 md:pl-16 pr-6 py-4 md:py-5 rounded-xl md:rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-gov-green/5 outline-none text-sm md:text-base font-medium font-hind transition-all"
          />
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sorting:</span>
           <span className="text-[11px] font-bold text-slate-700">সর্বশেষ আগে</span>
        </div>
      </div>

      {/* Main Table List */}
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] md:text-[12px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
              <tr>
                <th className="px-8 md:px-12 py-6 md:py-8 text-left">আবেদনকারী ও ট্র্যাকিং আইডি</th>
                <th className="px-8 md:px-12 py-6 md:py-8 text-left">অভিযোগের বিষয়</th>
                <th className="px-8 md:px-12 py-6 md:py-8 text-center">অবস্থা</th>
                <th className="px-8 md:px-12 py-6 md:py-8 text-right">ম্যানেজ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map(item => (
                <tr key={item.id} className={`hover:bg-gov-green/[0.01] transition-all group ${!item.isRead ? 'bg-gov-green/[0.04]' : ''}`}>
                  <td className="px-8 md:px-12 py-8 md:py-10">
                    <div className="flex items-center gap-3">
                       <div className={`text-slate-800 text-base md:text-xl leading-tight ${!item.isRead ? 'font-black text-gov-green' : 'font-bold'}`}>
                         {item.name}
                       </div>
                       {!item.isRead && (
                         <span className="bg-gov-red text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">New</span>
                       )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-[9px] md:text-[11px] text-gov-green font-black tracking-widest bg-gov-green/5 px-2 py-1 rounded-md uppercase">{item.mobile}</span>
                       <span className="text-[9px] text-slate-300 font-mono font-bold tracking-widest">ID: {item.id}</span>
                    </div>
                  </td>
                  <td className="px-8 md:px-12 py-8 md:py-10">
                    <div className={`text-sm md:text-base text-slate-600 max-w-xs truncate ${!item.isRead ? 'font-bold' : 'font-medium'}`}>{item.subject}</div>
                    <div className="text-[10px] text-slate-400 mt-2 font-medium flex items-center gap-2">
                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                       {new Date(item.submittedAt).toLocaleDateString('bn-BD')}
                    </div>
                  </td>
                  <td className="px-8 md:px-12 py-8 md:py-10 text-center">
                    <span className={`px-4 py-2 rounded-xl text-[9px] md:text-[11px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${
                      item.status === 'solved' ? 'bg-green-50 text-green-600 border border-green-200' : 
                      item.status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-200' : 
                      'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        item.status === 'solved' ? 'bg-green-500' : 
                        item.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'
                      }`}></span>
                      {item.status === 'solved' ? 'সমাধানকৃত' : item.status === 'rejected' ? 'বাতিলকৃত' : 'প্রক্রিয়াধীন'}
                    </span>
                  </td>
                  <td className="px-8 md:px-12 py-8 md:py-10 text-right">
                    <button 
                      onClick={() => handleOpenDetails(item)} 
                      className="px-6 py-3 bg-slate-900 text-white text-[10px] md:text-xs font-black rounded-xl hover:bg-gov-green transition-all uppercase tracking-[0.2em] shadow-lg shadow-slate-200"
                    >
                      Case File
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              </div>
              <p className="text-slate-400 font-bold font-hind text-xl uppercase tracking-widest">কোনো অভিযোগ পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Case File Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center p-2 md:p-6 z-[100] animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col transform animate-in zoom-in-95 border border-white/20">
            {/* Modal Header */}
            <div className="bg-slate-50/80 border-b p-6 md:p-12 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
              <div className="flex items-center gap-6">
                <div className="w-2 h-16 bg-gov-green rounded-full"></div>
                <div>
                  <h3 className="text-2xl md:text-4xl font-black text-slate-900 font-hind leading-tight">অভিযোগের ডিজিটাল ফাইল কার্ড</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Case ID: <span className="font-mono text-gov-green">{selectedItem.id}</span></span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      selectedItem.status === 'solved' ? 'bg-green-100 text-green-700' : 
                      selectedItem.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      Current: {selectedItem.status === 'solved' ? 'সমাধানকৃত' : selectedItem.status === 'rejected' ? 'বাতিলকৃত' : 'প্রক্রিয়াধীন'}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedItem(null)} 
                className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-400 hover:text-gov-red transition-all transform hover:rotate-90"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="p-8 md:p-16 overflow-y-auto space-y-12">
              {/* Profile Card Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                <div className="space-y-8">
                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gov-green/5 -mr-10 -mt-10 rounded-full group-hover:scale-150 transition-transform"></div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                      আবেদনকারীর প্রোফাইল
                    </p>
                    <h4 className="text-2xl md:text-3xl font-black text-slate-900 font-hind mb-1">{selectedItem.name}</h4>
                    <p className="text-gov-green font-black text-lg font-mono tracking-wider">{selectedItem.mobile}</p>
                    <div className="mt-6 flex flex-col gap-3">
                       <div className="flex items-center gap-3 text-slate-500 font-hind text-base">
                          <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                          <span>ঠিকানা: <strong>{selectedItem.address}</strong></span>
                       </div>
                       <div className="flex items-center gap-3 text-slate-500 font-hind text-base">
                          <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          <span>জমা: <strong>{new Date(selectedItem.submittedAt).toLocaleString('bn-BD')}</strong></span>
                       </div>
                    </div>
                  </div>

                  {/* Attachment Section */}
                  {selectedItem.attachmentData && (
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">সংযুক্ত প্রমাণাদি / নথি</p>
                      {selectedItem.attachmentType?.startsWith('image/') ? (
                        <div className="relative group cursor-zoom-in">
                          <img src={selectedItem.attachmentData} className="w-full rounded-2xl shadow-xl border-4 border-white transition-all group-hover:shadow-2xl" />
                          <a href={selectedItem.attachmentData} download={selectedItem.attachmentName} className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-2xl">
                             <button className="bg-white text-slate-900 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                               Download
                             </button>
                          </a>
                        </div>
                      ) : (
                        <a href={selectedItem.attachmentData} download={selectedItem.attachmentName} className="flex items-center gap-6 bg-white p-6 rounded-2xl border-2 border-slate-100 hover:border-gov-green transition-all shadow-sm">
                          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shrink-0">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/></svg>
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block text-lg font-hind truncate max-w-[200px]">{selectedItem.attachmentName}</span>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 inline-block">PDF Document</span>
                          </div>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Complaint Details Section */}
                <div className="space-y-8">
                  <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border-2 border-slate-50 shadow-sm relative">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-10 h-10 rounded-2xl bg-gov-red text-white flex items-center justify-center font-black text-xl shadow-lg shadow-red-100">!</div>
                       <h4 className="text-xl md:text-2xl font-black text-slate-900 font-hind">বিষয়: {selectedItem.subject}</h4>
                    </div>
                    <div className="text-slate-700 font-hind text-lg md:text-xl leading-[1.8] whitespace-pre-wrap">
                      {selectedItem.details}
                    </div>
                  </div>

                  {/* Decision & Action Area */}
                  <div className="bg-amber-50/70 p-8 md:p-12 rounded-[2.5rem] border-2 border-amber-100 space-y-8 shadow-inner">
                    <div className="flex items-center justify-between">
                       <p className="text-[11px] font-black text-amber-700 uppercase tracking-[0.3em] flex items-center gap-3">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                         অফিসিয়াল সিদ্ধান্ত ও ফিডব্যাক
                       </p>
                    </div>
                    <textarea 
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="গৃহীত পদক্ষেপ বা সমাধানের বিস্তারিত এখানে লিখুন যা সরাসরি আবেদনকারী দেখতে পাবেন..."
                      className="w-full p-8 rounded-[2rem] bg-white border-2 border-transparent focus:border-gov-green outline-none font-hind text-lg md:text-xl resize-none shadow-sm transition-all min-h-[150px]"
                    ></textarea>
                    <div className="flex justify-end">
                      <button 
                        onClick={handleSaveFeedback}
                        className="px-12 py-5 bg-slate-900 text-white text-sm font-black rounded-2xl hover:bg-gov-green hover:shadow-2xl transition-all uppercase tracking-[0.2em] flex items-center gap-3 transform active:scale-95"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                        Save Decision
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer Actions */}
            <div className="p-8 md:p-14 border-t bg-slate-50/80 backdrop-blur-xl flex flex-wrap gap-6 items-center justify-between sticky bottom-0 z-10 shadow-inner">
              <div className="flex gap-6 flex-1 min-w-[320px]">
                <button 
                  onClick={() => handleStatusUpdate(selectedItem.id, 'solved')}
                  className={`flex-1 py-6 rounded-[2rem] font-black transition-all flex items-center justify-center gap-4 font-hind text-xl shadow-xl transform active:scale-95 ${
                    selectedItem.status === 'solved' 
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' 
                    : 'bg-white border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  সমাধানকৃত
                </button>
                <button 
                  onClick={() => handleStatusUpdate(selectedItem.id, 'rejected')}
                  className={`flex-1 py-6 rounded-[2rem] font-black transition-all flex items-center justify-center gap-4 font-hind text-xl shadow-xl transform active:scale-95 ${
                    selectedItem.status === 'rejected' 
                    ? 'bg-gov-red text-white ring-4 ring-red-100' 
                    : 'bg-white border-2 border-gov-red/10 text-gov-red hover:bg-red-50'
                  }`}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  বাতিল করুন
                </button>
              </div>
              <button 
                onClick={handlePrint}
                className="w-full md:w-auto px-12 py-6 bg-white border-2 border-slate-200 rounded-[2rem] hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center justify-center gap-4 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200/50 group"
              >
                <svg className="w-8 h-8 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                Print Official Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
