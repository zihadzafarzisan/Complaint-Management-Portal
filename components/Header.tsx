
import React from 'react';
import { BANGLADESH_LOGO } from '../constants';

interface HeaderProps {
  currentView: 'public' | 'admin' | 'user';
  onViewChange: (view: 'public' | 'admin' | 'user') => void;
  isAuthenticated: boolean;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange, isAuthenticated, onLogout }) => {
  return (
    <header className="glass-nav border-b shadow-sm sticky top-0 z-40 transition-all duration-300">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
        {/* Logo and Name Container */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 group">
          <div 
            className="w-10 h-10 sm:w-14 sm:h-14 flex-shrink-0 flag-container self-center transform group-hover:scale-110 transition-transform cursor-pointer"
            onClick={() => onViewChange('public')}
            title="হোম পেজ"
          >
            {BANGLADESH_LOGO}
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2">
              <a 
                href="https://abmashrafuddinnizan.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group/link"
              >
                <h1 className="text-gov-green font-black text-xs sm:text-lg md:text-2xl leading-tight truncate tracking-tight hover:text-gov-red transition-colors cursor-pointer">
                  এবিএম আশরাফ উদ্দিন নিজান এর কার্যালয়
                </h1>
              </a>
              <span className="hidden md:flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-[10px] font-bold border border-green-100">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                অনলাইন পোর্টাল
              </span>
            </div>
            <p className="text-slate-500 text-[10px] sm:text-xs md:text-sm font-semibold tracking-wide">
              সংসদ সদস্য, লক্ষ্মীপুর-৪ নির্বাচনী এলাকা
            </p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button 
            onClick={() => onViewChange('public')}
            className={`px-4 py-2.5 rounded-xl text-[11px] sm:text-sm font-bold transition-all ${
              currentView === 'public' 
              ? 'bg-gov-green text-white shadow-lg shadow-green-200 scale-105' 
              : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            নতুন অভিযোগ
          </button>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onViewChange('admin')}
                className={`px-4 py-2.5 rounded-xl text-[11px] sm:text-sm font-bold transition-all ${
                  currentView === 'admin' 
                  ? 'bg-gov-red text-white shadow-lg shadow-red-200' 
                  : 'text-gov-red border border-gov-red/20 hover:bg-red-50'
                }`}
              >
                ড্যাশবোর্ড
              </button>
              <button 
                onClick={onLogout}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="লগ আউট"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onViewChange('admin')}
              className="px-4 py-2.5 rounded-xl text-[11px] sm:text-sm font-bold text-gov-red border border-gov-red/20 hover:bg-red-50 transition-all"
            >
              অফিস লগইন
            </button>
          )}
        </nav>
      </div>
      <div className="h-1 bg-gradient-to-r from-gov-green via-gov-green to-gov-red w-full"></div>
    </header>
  );
};
