
import React, { useState, useEffect, useCallback } from 'react';
import { ComplaintForm } from '../types';
import { db } from '../services/db';

interface Props {
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [items, setItems] = useState<ComplaintForm[]>([]);
  const [loading, setLoading] = useState(true);
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
      setSelectedItem(prev => ({ ...prev!, adminFeedback: feedbackText }));
      setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, adminFeedback: feedbackText } : i));
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
    } catch (err) {
      alert('অবস্থা আপডেট করতে সমস্যা হয়েছে।');
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
        <div style="border: 2px solid #e2e8f0; border-radius: 15px; padding: 30px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr><td style="padding: 10px 0; width: 160px;"><strong>ট্র্যাকিং আইডি:</strong></td><td>${selectedItem.id}</td></tr>
            <tr><td style="padding: 10px 0;"><strong>আবেদনকারী:</strong></td><td>${selectedItem.name}</td></tr>
            <tr><td style="padding: 10px 0;"><strong>মোবাইল:</strong></td><td>${selectedItem.mobile}</td></tr>
            <tr><td style="padding: 10px 0;"><strong>ঠিকানা:</strong></td><td>${selectedItem.address}</td></tr>
            <tr><td style="padding: 10px 0;"><strong>তারিখ:</strong></td><td>${new Date(selectedItem.submittedAt).toLocaleString('bn-BD')}</td></tr>
            <tr><td style="padding: 10px 0;"><strong>অবস্থা:</strong></td><td>${selectedItem.status === 'solved' ? 'সমাধানকৃত' : selectedItem.status === 'rejected' ? 'বাতিলকৃত' : 'প্রক্রিয়াধীন'}</td></tr>
          </table>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <h3>বিষয়: ${selectedItem.subject}</h3>
          <p style="white-space: pre-wrap; background: #f8fafc; padding: 20px; border-radius: 10px; border: 1px solid #f1f5f9;">${selectedItem.details}</p>
          ${selectedItem.adminFeedback ? `
          <div style="margin-top: 30px; border: 1px solid #fbbf24; background: #fffdf5; padding: 20px; border-radius: 10px;">
            <h4 style="margin-top: 0;">অফিসিয়াল ডিসিশন ও ফিডব্যাক:</h4>
            <p>${selectedItem.adminFeedback}</p>
          </div>` : ''}
        </div>
        <div style="margin-top: 60px; display: flex; justify-content: space-between;">
           <div style="text-align: center;"><p>___________________</p><p>সাক্ষর</p></div>
           <div style="text-align: center;"><p>___________________</p><p>অনুমোদন</p></div>
        </div>
      </div>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<html><head><title>CaseFile-${selectedItem.id}</title></head><body onload="window.print(); window.close();">${printContent}</body></html>`);
      win.document.close();
    }
  };

  const filteredItems = items.filter(item => {
    const cleanSearch = searchTerm.trim().toLowerCase();
    return (item.subject || '').toLowerCase().includes(cleanSearch) || 
           (item.mobile || '').includes(cleanSearch) || 
           (item.name?.toLowerCase().includes(cleanSearch));
  });

  return (
    <div className="view-transition">
      {/* Search Bar */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 flex items-center">
        <div className="relative flex-1">
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input 
            type="text" 
            placeholder="নাম বা মোবাইল দিয়ে খুঁজুন..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-12 pr-6 py-4 rounded-xl bg-slate-50 border-none outline-none font-hind"
          />
        </div>
      </div>

      {/* List Table */}
      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-slate-50/50 text-slate-400 text-[12px] uppercase font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-6 text-left">আবেদনকারী</th>
                <th className="px-8 py-6 text-left">বিষয়</th>
                <th className="px-8 py-6 text-right">ম্যানেজ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map(item => (
                <tr key={item.id} className={`hover:bg-slate-50 transition-all ${!item.isRead ? 'bg-gov-green/5' : ''}`}>
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-800 font-hind">{item.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono tracking-tighter">{item.mobile} | ID: {item.id}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm text-slate-600 font-hind truncate max-w-xs">{item.subject}</div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handleOpenDetails(item)} 
                      className="px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black rounded-lg hover:bg-gov-green transition-all uppercase tracking-widest"
                    >
                      Case File
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10 z-[200] animate-in fade-in overflow-hidden">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl h-full md:h-auto md:max-h-[90vh] flex flex-col relative overflow-hidden">
            
            {/* FIXED CLOSE BUTTON (Top Right) */}
            <button 
              onClick={() => setSelectedItem(null)} 
              className="absolute top-4 right-4 md:top-6 md:right-6 w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all z-[250]"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>

            {/* Modal Header */}
            <div className="p-8 border-b bg-slate-50 shrink-0 pr-20">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 font-hind">অভিযোগের ফাইল কার্ড</h3>
              <p className="text-slate-400 font-mono text-xs uppercase tracking-widest mt-1">ID: {selectedItem.id}</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">আবেদনকারীর প্রোফাইল</p>
                    <div className="text-xl font-black text-slate-900 font-hind">{selectedItem.name}</div>
                    <div className="text-gov-green font-bold mb-4">{selectedItem.mobile}</div>
                    <div className="text-sm text-slate-600 font-hind">ঠিকানা: {selectedItem.address}</div>
                  </div>

                  {selectedItem.attachmentData && (
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">সংযুক্ত নথি</p>
                      {selectedItem.attachmentType?.startsWith('image/') ? (
                        <img src={selectedItem.attachmentData} className="w-full rounded-xl shadow-md border-4 border-white" alt="Evidence" />
                      ) : (
                        <a href={selectedItem.attachmentData} download={selectedItem.attachmentName} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
                          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/></svg>
                          <span className="font-bold text-slate-700 truncate">{selectedItem.attachmentName}</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-8">
                  <div className="bg-white p-8 rounded-2xl border-2 border-slate-50 shadow-sm">
                    <h4 className="text-lg font-black text-slate-900 font-hind mb-3">বিষয়: {selectedItem.subject}</h4>
                    <p className="text-slate-700 font-hind leading-relaxed whitespace-pre-wrap">{selectedItem.details}</p>
                  </div>

                  {/* Feedback Area (FIXED EDITABILITY) */}
                  <div className="bg-amber-50 p-8 rounded-2xl border border-amber-200 space-y-4 shadow-inner">
                    <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest">অফিসিয়াল ডিসিশন ও ফিডব্যাক</label>
                    <textarea 
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="গৃহীত ব্যবস্থা এখানে লিখুন..."
                      className="w-full p-4 rounded-xl bg-white border-2 border-transparent focus:border-gov-green outline-none font-hind text-base min-h-[120px] resize-none cursor-text shadow-sm"
                    ></textarea>
                    <div className="flex justify-end">
                      <button 
                        onClick={handleSaveFeedback}
                        className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black rounded-lg hover:bg-gov-green transition-all uppercase tracking-widest"
                      >
                        Update Feedback
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer (Status & Print) */}
            <div className="p-8 border-t bg-slate-50 shrink-0 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-3 flex-1">
                <button 
                  onClick={() => handleStatusUpdate(selectedItem.id, 'solved')}
                  className={`flex-1 py-4 rounded-xl font-black font-hind text-lg transition-all shadow-md ${
                    selectedItem.status === 'solved' ? 'bg-emerald-600 text-white' : 'bg-white border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  সমাধানকৃত
                </button>
                <button 
                  onClick={() => handleStatusUpdate(selectedItem.id, 'rejected')}
                  className={`flex-1 py-4 rounded-xl font-black font-hind text-lg transition-all shadow-md ${
                    selectedItem.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-white border-2 border-red-100 text-red-500 hover:bg-red-50'
                  }`}
                >
                  বাতিল করুন
                </button>
              </div>
              <button 
                onClick={handlePrint}
                className="px-10 py-4 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                Print Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
