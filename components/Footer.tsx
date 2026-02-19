
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t mt-12 md:mt-20 pt-12 md:pt-20 pb-8 md:pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 md:gap-16 mb-12 md:mb-20">
          <div className="col-span-1 lg:col-span-2 text-center lg:text-left">
            <h3 className="text-gov-green font-black text-2xl md:text-3xl mb-6 md:mb-8 tracking-tighter font-hind">এবিএম আশরাফ উদ্দিন নিজান এর কার্যালয়</h3>
            <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 font-hind">
              জনগণের কথা সরাসরি শুনতে এবং নির্বাচনী এলাকার সমস্যাগুলো দ্রুত সমাধানে এই পোর্টালটি কাজ করছে। আমাদের লক্ষ্য উন্নত সেবা ও সরাসরি সংযোগ।
            </p>
            <div className="flex justify-center lg:justify-start gap-4 mt-8 md:mt-10">
               <a href="#" className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-gov-green hover:text-white transition-all transform hover:-translate-y-1">f</a>
               <a href="#" className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-gov-green hover:text-white transition-all transform hover:-translate-y-1">t</a>
               <a href="#" className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-gov-green hover:text-white transition-all transform hover:-translate-y-1">y</a>
            </div>
          </div>
          <div className="text-center lg:text-left">
            <h4 className="text-slate-900 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs mb-6 md:mb-8">যোগাযোগ</h4>
            <ul className="space-y-4 md:space-y-5 text-slate-600 font-medium font-hind text-sm md:text-base">
              <li className="flex flex-col lg:flex-row items-center lg:items-start gap-2 lg:gap-4">
                <div className="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center text-gov-green shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <span>প্রধান কার্যালয়: রামগঞ্জ রোড, লক্ষ্মীপুর</span>
              </li>
              <li className="flex flex-col lg:flex-row items-center lg:items-start gap-2 lg:gap-4">
                <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center text-gov-red shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                </div>
                <span>ফোন: +৮৮০১XXXXXXXXX</span>
              </li>
            </ul>
          </div>
          <div className="text-center lg:text-left">
            <h4 className="text-slate-900 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs mb-6 md:mb-8">অফিসিয়াল লিঙ্ক</h4>
            <ul className="space-y-4 md:space-y-5 text-slate-600 font-medium font-hind text-sm md:text-base">
              <li><a href="https://www.parliament.gov.bd" target="_blank" className="hover:text-gov-green transition-colors flex items-center justify-center lg:justify-start gap-2">জাতীয় সংসদ <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg></a></li>
              <li><a href="#" className="hover:text-gov-green transition-colors">গোপনীয়তা নীতি</a></li>
              <li><a href="#" className="hover:text-gov-green transition-colors">ব্যবহার নির্দেশিকা</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-8 md:pt-12 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 text-slate-400 text-[10px] md:text-sm font-medium text-center">
          <p>© ২০২৪-২৫ এবিএম আশরাফ উদ্দিন নিজান এর কার্যালয়।</p>
          <div className="flex gap-4 md:gap-8 items-center justify-center">
            <span className="bg-slate-100 text-slate-500 px-3 md:px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">সংসদ সচিবালয়</span>
            <p className="text-[9px]">CREATED BY ZIHAD ZAFAR ZISAN</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
