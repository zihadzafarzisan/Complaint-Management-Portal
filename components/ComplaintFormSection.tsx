
import React, { useState, useRef } from 'react';
import { ComplaintForm, SubmissionStatus } from '../types';
import { db } from '../services/db';

interface Props {
  status: SubmissionStatus;
  setStatus: (status: SubmissionStatus) => void;
}

export const ComplaintFormSection: React.FC<Props> = ({ status, setStatus }) => {
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
    
    // Basic validation
    if (!formData.mobile || !formData.address || !formData.subject || !formData.details) {
      setStatus({ type: 'error', message: 'অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।' });
      return;
    }

    if (!/^01[3-9]\d{8}$/.test(formData.mobile)) {
      setStatus({ type: 'error', message: 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: ০১৮XXXXXXXX)।' });
      return;
    }

    setStatus({ type: 'loading', message: 'আপনার মতামত পাঠানো হচ্ছে...' });

    try {
      const newEntry: ComplaintForm = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        name: formData.name || 'নামহীন',
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
      
      setStatus({ type: 'success' });
      
      // Reset form
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
      
      let errorMsg = 'দুঃখিত, আপনার মতামত পাঠানো সম্ভব হয়নি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।';
      if (error?.code === 'PGRST205') {
        errorMsg = 'আপনার ডেটাবেজে "complaints" টেবিলটি খুঁজে পাওয়া যাচ্ছে না। অনুগ্রহ করে এটি তৈরি করুন।';
      } else if (error?.code === 'PGRST204') {
        errorMsg = 'ডেটাবেজ টেবিল স্ট্রাকচারে সমস্যা আছে (কলাম খুঁজে পাওয়া যাচ্ছে না)। অনুগ্রহ করে SQL Editor এ টেবিলটি আপডেট করুন।';
      }

      setStatus({ 
        type: 'error', 
        message: errorMsg 
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="block text-gray-700 font-bold text-sm uppercase tracking-wider">আপনার নাম (ঐচ্ছিক)</label>
          <input type="text" name="name" value={formData.name || ''} onChange={handleChange} placeholder="পুরো নাম লিখুন" className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-gov-green transition outline-none" />
        </div>
        <div className="space-y-2">
          <label className="block text-gray-700 font-bold text-sm uppercase tracking-wider">মোবাইল নম্বর <span className="text-red-500 font-bold">*</span></label>
          <input required type="tel" name="mobile" value={formData.mobile || ''} onChange={handleChange} placeholder="০১৮XXXXXXXX" className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-gov-green transition outline-none" />
        </div>
        <div className="space-y-2">
          <label className="block text-gray-700 font-bold text-sm uppercase tracking-wider">ইউনিয়ন/এলাকা <span className="text-red-500 font-bold">*</span></label>
          <input required type="text" name="address" value={formData.address || ''} onChange={handleChange} placeholder="আপনার এলাকার নাম" className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-gov-green transition outline-none" />
        </div>
        <div className="space-y-2">
          <label className="block text-gray-700 font-bold text-sm uppercase tracking-wider">ইমেল (ঐচ্ছিক)</label>
          <input type="email" name="email" value={formData.email || ''} onChange={handleChange} placeholder="example@mail.com" className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-gov-green transition outline-none" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-gray-700 font-bold text-sm uppercase tracking-wider">বিষয় <span className="text-red-500 font-bold">*</span></label>
        <input required type="text" name="subject" value={formData.subject || ''} onChange={handleChange} placeholder="সংক্ষেপে বিষয়টি লিখুন" className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-gov-green transition outline-none" />
      </div>

      <div className="space-y-2">
        <label className="block text-gray-700 font-bold text-sm uppercase tracking-wider">বিস্তারিত বর্ণনা <span className="text-red-500 font-bold">*</span></label>
        <textarea required name="details" rows={6} value={formData.details || ''} onChange={handleChange} placeholder="আপনার কথা বিস্তারিত লিখুন..." className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-gov-green transition outline-none resize-none"></textarea>
      </div>

      <div className="space-y-2">
        <label className="block text-gray-700 font-bold text-sm uppercase tracking-wider">সহায়ক ছবি বা নথি (ঐচ্ছিক)</label>
        <div onClick={() => fileInputRef.current?.click()} className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${fileData ? 'bg-green-50 border-gov-green' : 'bg-gray-50 border-gray-200 hover:border-gov-green hover:bg-white'}`}>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            {fileData ? (
              <div className="flex flex-col items-center gap-2 text-gov-green font-bold">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-sm">যুক্ত হয়েছে: {fileData.name}</span>
              </div>
            ) : (
              <>
                <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                <p className="text-sm text-gray-600 font-medium">ক্লিক করে ছবি বা PDF যুক্ত করুন</p>
              </>
            )}
          </div>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" />
        </div>
      </div>

      <div className={`flex items-center gap-4 p-5 rounded-xl border transition-all ${formData.isPrivate ? 'bg-gov-red/5 border-gov-red/20' : 'bg-blue-50/50 border-blue-100'}`}>
        <input type="checkbox" id="isPrivate" name="isPrivate" checked={formData.isPrivate} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-gov-red focus:ring-gov-red" />
        <label htmlFor="isPrivate" className="text-sm font-bold text-gray-700 cursor-pointer">তথ্য গোপন রাখতে চাই (শুধুমাত্র অফিস দেখবে)</label>
      </div>

      <button type="submit" disabled={status.type === 'loading'} className={`w-full py-5 rounded-2xl text-white font-black text-xl shadow-2xl transition-all ${status.type === 'loading' ? 'bg-gray-400' : 'bg-gov-red hover:bg-red-600'}`}>
        {status.type === 'loading' ? 'প্রেরণ করা হচ্ছে...' : 'মতামত পাঠান'}
      </button>
    </form>
  );
};
