
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ComplaintForm } from '../types';
import { db } from '../services/db';

interface Props {
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [items, setItems] = useState<ComplaintForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'active' | 'trash'>('active');
  const [filter, setFilter] = useState<'all' | 'pending' | 'solved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<ComplaintForm | null>(null);

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
    return () => subscription?.unsubscribe();
  }, [refreshData]);

  const stats = useMemo(() => {
    const active = items.filter(i => !i.deletedAt);
    return {
      total: active.length,
      pending: active.filter(i => i.status === 'pending').length,
      solved: active.filter(i => i.status === 'solved').length,
      trash: items.filter(i => i.deletedAt).length
    };
  }, [items]);

  const handlePrint = () => {
    if (!selectedItem) return;
    const printContent = `
      <div style="font-family: 'Hind Siliguri', sans-serif; padding: 40px; border: 1px solid #eee;">
        <h1 style="color: #006a4e;">এবিএম আশরাফ উদ্দিন নিজান এর কার্যালয়</h1>
        <hr/>
        <h2>অভিযোগ রিপোর্ট (ID: ${selectedItem.id})</h2>
        <p><strong>আবেদনকারী:</strong> ${selectedItem.name}</p>
        <p><strong>মোবাইল:</strong> ${selectedItem.mobile}</p>
        <p><strong>ঠিকানা:</strong> ${selectedItem.address}</p>
        <p><strong>জমাদানের তারিখ:</strong> ${new Date(selectedItem.submittedAt).toLocaleString('bn-BD')}</p>
        <hr/>
        <h3>বিষয়: ${selectedItem.subject}</h3>
        <p style="white-space: pre-wrap;">${selectedItem.details}</p>
        <br/><br/><br/>
        <p style="text-align: right;">সাক্ষর ও সীল: ___________________</p>
      </div>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<html><head><title>Print Report</title></head><body>${printContent}</body></html>`);
      win.document.close();
      win.print();
    }
  };

  const filteredItems = items.filter(item => {
    const matchesView = view === 'active' ? !item.deletedAt : !!item.deletedAt;
    const matchesFilter = filter === 'all' || item.status === filter;
    const cleanSearch = searchTerm.trim().toLowerCase();
    const matchesSearch = item.subject.toLowerCase().includes(cleanSearch) || 
                          item.mobile.includes(cleanSearch) || 
                          (item.name?.toLowerCase().includes(cleanSearch));
    return matchesView && matchesFilter && matchesSearch;
  });

  return (
    <div className="view-transition">
      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
        {[
          { label: 'মোট অভিযোগ', val: stats.total, color: 'border-gov-green' },
          { label: 'অপেক্ষমান', val: stats.pending, color: 'border-amber-400' },
          { label: 'সমাধানকৃত', val: stats.solved, color: 'border-emerald-500' },
          { label: 'রিসাইকেল বিন', val: stats.trash, color: 'border-slate-300' }
        ].map((s, i) => (
          <div key={i} className={`bg-white p-4 md:p-8 rounded-xl md:rounded-[1.5rem] border-l-4 md:border-l-8 ${s.color} shadow-sm hover:shadow-xl transition-all group`}>
            <p className="text-[8px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-3 group-hover:text-gov-green transition-colors">{s.label}</p>
            <p className="text-2xl md:text-4xl font-black text-slate-800">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="bg-white p-3 md:p-5 rounded-xl md:rounded-[1.5rem] shadow-sm border border-slate-100 mb-6 md:mb-10 flex flex-col md:flex-row gap-4 md:gap-5 items-center">
        <div className="flex gap-2 p-1 md:p-1.5 bg-slate-50 rounded-lg md:rounded-2xl w-full md:w-auto">
          <button onClick={() => setView('active')} className={`flex-1 px-4 md:px-8 py-2 md:py-3 rounded-md md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${view === 'active' ? 'bg-gov-green text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>সক্রিয়</button>
          <button onClick={() => setView('trash')} className={`flex-1 px-4 md:px-8 py-2 md:py-3 rounded-md md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${view === 'trash' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>রিসাইকেল</button>
        </div>
        
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

      {/* Table - Optimized for mobile with horizontal scroll */}
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
                <tr key={item.id} className="hover:bg-gov-green/[0.02] transition-colors group">
                  <td className="px-6 md:px-10 py-6 md:py-8">
                    <div className="font-black text-slate-800 text-sm md:text-lg leading-tight">{item.name}</div>
                    <div className="text-[8px] md:text-[11px] text-gov-green font-black tracking-widest mt-1.5 md:mt-2 bg-gov-green/5 inline-block px-1.5 py-0.5 rounded uppercase">{item.mobile}</div>
                  </td>
                  <td className="px-6 md:px-10 py-6 md:py-8">
                    <div className="text-xs md:text-sm font-bold text-slate-700 max-w-[150px] md:max-w-xs truncate">{item.subject}</div>
                    <button onClick={() => setSelectedItem(item)} className="text-gov-green text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:text-gov-red mt-2 md:mt-3 block transition-colors border-b-2 border-gov-green/20">View Details →</button>
                  </td>
                  <td className="px-6 md:px-10 py-6 md:py-8 text-center">
                    <span className={`px-2 md:px-4 py-1 md:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest ${
                      item.status === 'solved' ? 'bg-green-50 text-green-600 border border-green-100' : 
                      item.status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 md:px-10 py-6 md:py-8 text-right">
                    <div className="flex justify-end gap-2 md:gap-3">
                       <button onClick={() => db.updateStatus(item.id, 'solved').then(() => refreshData(false))} className="p-2 md:p-3.5 bg-emerald-50 text-emerald-600 rounded-lg md:rounded-2xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all transform active:scale-90"><svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg></button>
                       <button onClick={() => db.moveToTrash(item.id).then(() => refreshData(false))} className="p-2 md:p-3.5 bg-slate-50 text-slate-400 rounded-lg md:rounded-2xl border border-slate-100 hover:bg-red-50 hover:text-red-500 transition-all transform active:scale-90"><svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="py-20 md:py-32 text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-slate-200">
                <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[8px] md:text-[10px]">No Complaints Found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal - Optimized for mobile */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-2 md:p-4 z-[100] animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-2xl md:rounded-[3rem] shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden flex flex-col transform animate-in zoom-in-95 duration-500 border border-white/20 my-4">
            <div className="p-6 md:p-14 overflow-y-auto custom-scrollbar space-y-6 md:space-y-10">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <span className="bg-gov-green/10 text-gov-green px-3 md:px-5 py-1.5 md:py-2 rounded-full text-[8px] md:text-[11px] font-black uppercase tracking-[0.2em] border border-gov-green/10">CASE ID: {selectedItem.id}</span>
                  <h3 className="text-xl md:text-4xl font-black text-slate-900 mt-4 md:mt-6 leading-tight font-hind break-words">{selectedItem.subject}</h3>
                </div>
                <button onClick={() => setSelectedItem(null)} className="w-10 h-10 md:w-14 md:h-14 bg-slate-100 hover:bg-gov-red hover:text-white rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-3xl transition-all shadow-sm flex-shrink-0">&times;</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-slate-50 p-4 md:p-8 rounded-xl md:rounded-[2rem] border border-slate-100 shadow-inner">
                  <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">আবেদনকারী</p>
                  <p className="font-black text-slate-800 text-lg md:text-2xl font-hind">{selectedItem.name}</p>
                  <p className="text-gov-green font-black text-xs md:text-sm tracking-widest mt-1">{selectedItem.mobile}</p>
                </div>
                <div className="bg-slate-50 p-4 md:p-8 rounded-xl md:rounded-[2rem] border border-slate-100 shadow-inner">
                  <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ঠিকানা ও সময়</p>
                  <p className="font-bold text-slate-800 text-base md:text-lg font-hind">{selectedItem.address}</p>
                  <p className="text-slate-400 text-[10px] mt-1 font-medium">{new Date(selectedItem.submittedAt).toLocaleString('bn-BD')}</p>
                </div>
              </div>

              <div>
                <p className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 md:mb-6 pl-2 border-l-4 border-gov-red">বিস্তারিত অভিযোগ</p>
                <div className="bg-slate-900 text-slate-200 p-6 md:p-10 rounded-xl md:rounded-[2.5rem] text-base md:text-xl leading-relaxed shadow-2xl font-light font-hind whitespace-pre-wrap">
                  {selectedItem.details}
                </div>
              </div>

              {selectedItem.attachmentData && (
                 <div className="pt-4 md:pt-6">
                   <p className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 md:mb-6">সংযুক্ত নথি</p>
                   {selectedItem.attachmentType?.startsWith('image/') ? (
                     <img src={selectedItem.attachmentData} className="w-full rounded-xl md:rounded-[2.5rem] shadow-2xl border-4 md:border-8 border-slate-50" alt="Evidence" />
                   ) : (
                     <a href={selectedItem.attachmentData} download={selectedItem.attachmentName} className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 bg-slate-50 border-4 border-dashed border-slate-100 p-8 md:p-14 rounded-xl md:rounded-[2.5rem] hover:border-gov-green hover:bg-gov-green/5 transition-all group">
                       <div className="w-14 h-14 md:w-20 md:h-20 bg-white rounded-xl md:rounded-3xl flex items-center justify-center text-gov-green group-hover:scale-110 transition-transform shadow-sm"><svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg></div>
                       <div className="text-center md:text-left">
                         <p className="font-black text-slate-800 text-lg md:text-xl">ডাউনলোড করুন</p>
                         <p className="text-[10px] md:text-sm text-slate-400 mt-1 font-bold truncate max-w-[200px]">{selectedItem.attachmentName}</p>
                       </div>
                     </a>
                   )}
                 </div>
              )}
            </div>
            
            <div className="p-6 md:p-10 border-t bg-slate-50/50 flex flex-col md:flex-row gap-3 md:gap-4 flex-shrink-0">
              <button 
                onClick={() => { db.updateStatus(selectedItem.id, 'solved').then(() => {refreshData(false); setSelectedItem(null);}); }}
                className="flex-1 py-4 md:py-6 bg-gov-green text-white font-black text-lg md:text-xl rounded-xl md:rounded-2xl shadow-xl shadow-green-100 hover:scale-[1.02] active:scale-95 transition-all font-hind"
              >
                সমাধান করা হয়েছে
              </button>
              <div className="flex gap-3 md:gap-4">
                <button 
                  onClick={handlePrint}
                  className="flex-1 md:flex-none px-4 md:px-8 py-4 md:py-6 bg-white text-slate-700 border-2 border-slate-200 font-black rounded-xl md:rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                  <span className="hidden sm:inline">প্রিন্ট</span>
                </button>
                <button 
                  onClick={() => { db.updateStatus(selectedItem.id, 'rejected').then(() => {refreshData(false); setSelectedItem(null);}); }}
                  className="flex-1 md:flex-none px-4 md:px-8 py-4 md:py-6 bg-white text-gov-red border-2 border-gov-red/20 font-black rounded-xl md:rounded-2xl hover:bg-red-50 transition-all font-hind text-center"
                >
                  বাতিল
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
