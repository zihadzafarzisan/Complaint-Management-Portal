
import React, { useState, useRef } from 'react';
import { ComplaintForm, SubmissionStatus } from '../types';
import { db } from '../services/db';

interface Props {
  status: SubmissionStatus;
  setStatus: (status: SubmissionStatus) => void;
  onSuccess: (id: string) => void;
}

export const ComplaintFormSection: React.FC<Props> = ({ status, setStatus, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<ComplaintForm>>({
    isPrivate: false,
    name: '',
    mobile: '',
    address: '',
    subject: '',
    details: '',
    email: ''
  });
  const [fileData, setFileData] = useState<{ name: string; type: string; data: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert("ফাইল সাইজ ২ মেগাবাইটের বেশি হতে পারবে না।");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFileData({ name: file.name, type: file.type, data: base64 });
        setFormData(prev => ({ ...prev, attachmentName: file.name }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.mobile || !formData.address || !formData.subject || !formData.details) {
      alert('অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।');
      return;
    }

    if (!/^01[3-9]\d{8}$/.test(formData.mobile)) {
      alert('সঠিক বাংলাদেশি মোবাইল নম্বর দিন।');
      return;
    }

    setStatus({ type: 'loading', message: 'আপনার বার্তা পাঠানো হচ্ছে...' });

    try {
      const trackingId = Math.random().toString(36).substr(2, 6).toUpperCase();
      const newEntry: ComplaintForm = {
        id: trackingId,
        name: formData.name || 'Anonymous',
        mobile: formData.mobile,
        email: formData.email || null,
        address: formData.address,
        subject: formData.subject,
        details: formData.details,
        isPrivate: formData.isPrivate || false,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        attachmentName: fileData?.name || null,
        attachmentData: fileData?.data || null,
        attachmentType: fileData?.type || null
      };

      await db.saveComplaint(newEntry);
      
      onSuccess(trackingId);
      
      setFormData({
        isPrivate: false,
        name: '',
        mobile: '',
        address: '',
        subject: '',
        details: '',
        email: ''
      });
      setFileData(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
    } catch (error: any) {
      console.error('Submission failed:', error);
      setStatus({ 
        type: 'error', 
        message: 'Database Error: Could not save complaint.' 
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-3">
          <label className="block text-slate-500 font-black text-xs uppercase tracking-[0.2em] mb-1">আপনার নাম (ঐচ্ছিক)</label>
          <input type="text" name="name" value={formData.name || ''} onChange={handleChange} placeholder="পুরো নাম লিখুন" className="w-full px-6 py-5 rounded-[1.5rem] bg-slate-50 border-none focus:ring-4 focus:ring-gov-green/5 outline-none text-lg font-hind transition-all" />
        </div>
        <div className="space-y-3">
          <label className="block text-slate-500 font-black text-xs uppercase tracking-[0.2em] mb-1">মোবাইল নম্বর <span className="text-gov-red">*</span></label>
          <input required type="tel" name="mobile" value={formData.mobile || ''} onChange={handleChange} placeholder="০১৮XXXXXXXX" className="w-full px-6 py-5 rounded-[1.5rem] bg-slate-50 border-none focus:ring-4 focus:ring-gov-green/5 outline-none text-lg font-hind transition-all" />
        </div>
        <div className="space-y-3">
          <label className="block text-slate-500 font-black text-xs uppercase tracking-[0.2em] mb-1">ইউনিয়ন/এলাকা <span className="text-gov-red">*</span></label>
          <input required type="text" name="address" value={formData.address || ''} onChange={handleChange} placeholder="আপনার এলাকার নাম" className="w-full px-6 py-5 rounded-[1.5rem] bg-slate-50 border-none focus:ring-4 focus:ring-gov-green/5 outline-none text-lg font-hind transition-all" />
        </div>
        <div className="space-y-3">
          <label className="block text-slate-500 font-black text-xs uppercase tracking-[0.2em] mb-1">ইমেল (ঐচ্ছিক)</label>
          <input type="email" name="email" value={formData.email || ''} onChange={handleChange} placeholder="example@mail.com" className="w-full px-6 py-5 rounded-[1.5rem] bg-slate-50 border-none focus:ring-4 focus:ring-gov-green/5 outline-none text-lg font-hind transition-all" />
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-slate-500 font-black text-xs uppercase tracking-[0.2em] mb-1">বিষয় <span className="text-gov-red">*</span></label>
        <input required type="text" name="subject" value={formData.subject || ''} onChange={handleChange} placeholder="সংক্ষেপে বিষয়টি লিখুন" className="w-full px-6 py-5 rounded-[1.5rem] bg-slate-50 border-none focus:ring-4 focus:ring-gov-green/5 outline-none text-lg font-hind transition-all" />
      </div>

      <div className="space-y-3">
        <label className="block text-slate-500 font-black text-xs uppercase tracking-[0.2em] mb-1">বিস্তারিত বর্ণনা <span className="text-gov-red">*</span></label>
        <textarea required name="details" rows={6} value={formData.details || ''} onChange={handleChange} placeholder="আপনার কথা বিস্তারিত লিখুন..." className="w-full px-6 py-6 rounded-[1.5rem] bg-slate-50 border-none focus:ring-4 focus:ring-gov-green/5 outline-none text-lg font-hind transition-all resize-none"></textarea>
      </div>

      <div className="space-y-3">
        <label className="block text-slate-500 font-black text-xs uppercase tracking-[0.2em] mb-1">সহায়ক ছবি বা নথি (ঐচ্ছিক)</label>
        <div onClick={() => fileInputRef.current?.click()} className={`flex flex-col items-center justify-center w-full h-48 border-4 border-dashed rounded-[2rem] cursor-pointer transition-all ${fileData ? 'bg-gov-green/5 border-gov-green/20' : 'bg-slate-50 border-slate-100 hover:border-gov-green/20 hover:bg-white'}`}>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            {fileData ? (
              <div className="flex flex-col items-center gap-3 text-gov-green font-black">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                <span className="text-sm tracking-wide">ফাইল যুক্ত হয়েছে: {fileData.name}</span>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 text-slate-300 group-hover:text-gov-green transition-colors"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg></div>
                <p className="text-sm text-slate-400 font-black uppercase tracking-widest">ক্লিক করে ছবি বা PDF যুক্ত করুন</p>
              </>
            )}
          </div>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" />
        </div>
      </div>

      <div className={`flex items-center gap-5 p-6 rounded-[1.5rem] border-2 transition-all ${formData.isPrivate ? 'bg-gov-red/5 border-gov-red/10' : 'bg-slate-50 border-slate-50'}`}>
        <div className="relative">
          <input type="checkbox" id="isPrivate" name="isPrivate" checked={formData.isPrivate} onChange={handleChange} className="w-6 h-6 rounded-lg border-slate-300 text-gov-red focus:ring-gov-red cursor-pointer" />
        </div>
        <label htmlFor="isPrivate" className="text-sm font-black text-slate-600 cursor-pointer uppercase tracking-widest">তথ্য গোপন রাখতে চাই (শুধুমাত্র অফিস দেখবে)</label>
      </div>

      <button type="submit" disabled={status.type === 'loading'} className={`w-full py-6 rounded-[1.5rem] text-white font-black text-2xl shadow-2xl transition-all transform hover:scale-[1.01] active:scale-[0.98] ${status.type === 'loading' ? 'bg-slate-300 cursor-not-allowed' : 'bg-gov-red shadow-red-200'}`}>
        {status.type === 'loading' ? 'প্রেরণ করা হচ্ছে...' : 'মতামত পাঠান'}
      </button>
    </form>
  );
};
