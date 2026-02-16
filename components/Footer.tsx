
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t mt-20 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-gov-green font-black text-3xl mb-8 tracking-tighter">এবিএম আশরাফ উদ্দিন নিজান এর কার্যালয়</h3>
            <p className="text-slate-500 text-lg leading-relaxed max-w-lg">
              জনগণের কথা সরাসরি শুনতে এবং নির্বাচনী এলাকার সমস্যাগুলো দ্রুত সমাধানে এই আধুনিক পোর্টালটি কাজ করছে। আমাদের লক্ষ্য উন্নত সেবা ও সরাসরি সংযোগ।
            </p>
            <div className="flex gap-4 mt-10">
               <a href="#" className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-gov-green hover:text-white transition-all transform hover:-translate-y-1">f</a>
               <a href="#" className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-gov-green hover:text-white transition-all transform hover:-translate-y-1">t</a>
               <a href="#" className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-gov-green hover:text-white transition-all transform hover:-translate-y-1">y</a>
            </div>
          </div>
          <div>
            <h4 className="text-slate-900 font-bold uppercase tracking-[0.2em] text-xs mb-8">যোগাযোগ</h4>
            <ul className="space-y-5 text-slate-600 font-medium">
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center text-gov-green shrink-0 mt-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <span>প্রধান কার্যালয়: রামগঞ্জ রোড, লক্ষ্মীপুর</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center text-gov-red shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                </div>
                <span>ফোন: +৮৮০১XXXXXXXXX</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-900 font-bold uppercase tracking-[0.2em] text-xs mb-8">অফিসিয়াল লিঙ্ক</h4>
            <ul className="space-y-5 text-slate-600 font-medium">
              <li><a href="https://www.parliament.gov.bd" target="_blank" className="hover:text-gov-green transition-colors flex items-center gap-2">বাংলাদেশ জাতীয় সংসদ <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg></a></li>
              <li><a href="#" className="hover:text-gov-green transition-colors">গোপনীয়তা ও নিরাপত্তা নীতি</a></li>
              <li><a href="#" className="hover:text-gov-green transition-colors">ব্যবহারকারীর নির্দেশিকা</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-12 flex flex-col md:flex-row items-center justify-between gap-8 text-slate-400 text-sm font-medium">
          <p>© ২০২৪-২৫ এবিএম আশরাফ উদ্দিন নিজান এর কার্যালয়। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-8 items-center">
            <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest">সংসদ সদস্য সচিবালয়</span>
            <p className="text-[11px]">পাওয়ার্ড বাই MP-IT সেল</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
