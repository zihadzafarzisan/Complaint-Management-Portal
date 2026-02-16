
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ComplaintForm } from '../types';
import { db } from '../services/db';
import { GoogleGenAI } from "@google/genai";

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
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

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

  const generateAiSummary = async (text: string) => {
    setIsAiLoading(true);
    setAiSummary(null);
    try {
      // Always use process.env.API_KEY directly as a named parameter.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `বড় এই অভিযোগটির একটি ছোট এবং অর্থবহ ৩-৪ লাইনের সারসংক্ষেপ তৈরি করে দাও যাতে কোনো কর্মকর্তা দ্রুত বুঝতে পারেন মূল সমস্যাটি কী: "${text}"`,
        config: { temperature: 0.7 }
      });
      // Directly access .text property from GenerateContentResponse
      setAiSummary(response.text || "দুঃখিত, সারসংক্ষেপ তৈরি করা যায়নি।");
    } catch (error) {
      setAiSummary("AI সার্ভিস এই মুহূর্তে উপলব্ধ নেই।");
    } finally {
      setIsAiLoading(false);
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'মোট অভিযোগ', val: stats.total, color: 'border-gov-green' },
          { label: 'অপেক্ষমান', val: stats.pending, color: 'border-amber-400' },
          { label: 'সমাধানকৃত', val: stats.solved, color: 'border-emerald-500' },
          { label: 'রিসাইকেল বিন', val: stats.trash, color: 'border-slate-300' }
        ].map((s, i) => (
          <div key={i} className={`bg-white p-6 rounded-2xl border-l-4 ${s.color} shadow-sm hover:shadow-md transition-all`}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-3xl font-black text-slate-800">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex gap-2 p-1 bg-gray-50 rounded-xl w-full md:w-auto">
          <button onClick={() => setView('active')} className={`flex-1 px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${view === 'active' ? 'bg-gov-green text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}>সক্রিয়</button>
          <button onClick={() => setView('trash')} className={`flex-1 px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${view === 'trash' ? 'bg-slate-700 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}>ট্র্যাশ</button>
        </div>
        
        <div className="relative flex-1 w-full">
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input 
            type="text" 
            placeholder="নাম বা মোবাইল নম্বর দিয়ে খুঁজুন..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-gov-green/10 outline-none text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-[0.2em] border-b">
              <tr>
                <th className="px-8 py-5 text-left">আবেদনকারী</th>
                <th className="px-8 py-5 text-left">বিষয়</th>
                <th className="px-8 py-5 text-center">অবস্থা</th>
                <th className="px-8 py-5 text-right">ক্রিয়া</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gov-green/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-800">{item.name}</div>
                    <div className="text-[11px] text-gov-green font-bold tracking-wider mt-1">{item.mobile}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-semibold text-slate-700 max-w-xs truncate">{item.subject}</div>
                    <button onClick={() => {setSelectedItem(item); setAiSummary(null);}} className="text-gov-green text-[10px] font-bold hover:underline mt-2">বিস্তারিত দেখুন →</button>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      item.status === 'solved' ? 'bg-green-100 text-green-700' : 
                      item.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status === 'solved' ? 'সমাধান' : item.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমান'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => db.updateStatus(item.id, 'solved').then(() => refreshData(false))} className="p-2.5 bg-green-50 text-green-600 rounded-xl border border-green-100 hover:bg-green-600 hover:text-white transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg></button>
                       <button onClick={() => db.moveToTrash(item.id).then(() => refreshData(false))} className="p-2.5 bg-gray-50 text-gray-400 rounded-xl border border-gray-100 hover:bg-red-50 hover:text-red-500 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">কোনো তথ্য পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      </div>

      {/* Modern Detailed Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col transform animate-in zoom-in-95 duration-500">
            <div className="p-10 overflow-y-auto custom-scrollbar space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-gov-green/10 text-gov-green px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-gov-green/10">অভিযোগ ID: {selectedItem.id}</span>
                  <h3 className="text-3xl font-black text-slate-900 mt-4 leading-tight">{selectedItem.subject}</h3>
                </div>
                <button onClick={() => setSelectedItem(null)} className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-2xl flex items-center justify-center text-2xl transition-all">&times;</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">আবেদনকারী</p>
                  <p className="font-bold text-slate-800 text-lg">{selectedItem.name}</p>
                  <p className="text-gov-green font-bold text-sm">{selectedItem.mobile}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">এলাকা/ঠিকানা</p>
                  <p className="font-bold text-slate-800">{selectedItem.address}</p>
                  <p className="text-gray-400 text-xs mt-1">{new Date(selectedItem.submittedAt).toLocaleString('bn-BD')}</p>
                </div>
              </div>

              {/* AI Summary Section */}
              <div className="bg-gov-green/5 rounded-[2rem] p-8 border border-gov-green/10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="flex items-center gap-2 text-gov-green font-black uppercase text-xs tracking-widest">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"/></svg>
                    স্মার্ট সারসংক্ষেপ (AI Summary)
                  </h4>
                  {!aiSummary && !isAiLoading && (
                    <button onClick={() => generateAiSummary(selectedItem.details)} className="text-[10px] font-bold text-white bg-gov-green px-4 py-2 rounded-xl shadow-lg hover:scale-105 transition-all">তৈরি করুন</button>
                  )}
                </div>
                {isAiLoading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-gov-green/10 rounded-full w-full"></div>
                    <div className="h-4 bg-gov-green/10 rounded-full w-4/5"></div>
                  </div>
                ) : aiSummary ? (
                  <p className="text-gov-green font-medium italic leading-relaxed">"{aiSummary}"</p>
                ) : (
                  <p className="text-gray-400 text-xs text-center py-2">মূল সমস্যাটি দ্রুত বুঝতে AI ব্যবহার করুন</p>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">বিস্তারিত অভিযোগ</p>
                <div className="bg-slate-900 text-slate-200 p-8 rounded-3xl text-lg leading-relaxed shadow-inner font-light">
                  {selectedItem.details}
                </div>
              </div>

              {selectedItem.attachmentData && (
                 <div className="pt-4">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">সংযুক্ত ফাইল</p>
                   {selectedItem.attachmentType?.startsWith('image/') ? (
                     <img src={selectedItem.attachmentData} className="w-full rounded-3xl shadow-xl border-4 border-white" alt="Evidence" />
                   ) : (
                     <a href={selectedItem.attachmentData} download={selectedItem.attachmentName} className="flex items-center justify-center gap-4 bg-slate-50 border-2 border-dashed border-slate-200 p-10 rounded-3xl hover:border-gov-green hover:bg-gov-green/5 transition-all group">
                       <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gov-green group-hover:scale-110 transition-transform"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg></div>
                       <div className="text-left">
                         <p className="font-bold text-slate-800">ফাইল ডাউনলোড করুন</p>
                         <p className="text-xs text-slate-400">{selectedItem.attachmentName}</p>
                       </div>
                     </a>
                   )}
                 </div>
              )}
            </div>
            
            <div className="p-8 border-t bg-slate-50 flex gap-4">
              <button 
                onClick={() => { db.updateStatus(selectedItem.id, 'solved').then(() => {refreshData(false); setSelectedItem(null);}); }}
                className="flex-1 py-5 bg-gov-green text-white font-black text-lg rounded-2xl shadow-xl shadow-gov-green/20 hover:bg-opacity-90 active:scale-95 transition-all"
              >
                সমাধান হয়েছে
              </button>
              <button 
                onClick={() => { db.updateStatus(selectedItem.id, 'rejected').then(() => {refreshData(false); setSelectedItem(null);}); }}
                className="px-10 py-5 bg-white text-gov-red border-2 border-gov-red/20 font-black rounded-2xl hover:bg-red-50 transition-all"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
