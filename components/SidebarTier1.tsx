
import React, { useState, useRef, useEffect } from 'react';
import { AppContextType } from '../types';
import { ICONS } from '../constants';

interface SidebarTier1Props {
  activeContext: AppContextType;
  onContextChange: (ctx: AppContextType) => void;
}

const SidebarTier1: React.FC<SidebarTier1Props> = ({ activeContext, onContextChange }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);

  const items = [
    { type: AppContextType.GLOBAL, icon: ICONS.Global, label: 'Global' },
    { type: AppContextType.PERSONAL, icon: ICONS.Personal, label: 'Personal' },
    { type: AppContextType.PROJECT, icon: ICONS.Project, label: 'Project' },
  ];

  // Close help menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setShowHelp(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Real implementation would toggle a 'dark' class on the document root
    document.documentElement.classList.toggle('dark');
  };

  const helpMenuItems = [
    { label: 'Open a ticket', icon: (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg> },
    { label: 'My tickets', icon: (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg> },
    { label: 'Ask Community', icon: (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
    { label: 'VDC knowledge', icon: (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'Privacy Notice', icon: (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
    { label: 'Version 20251230.12', icon: (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ];

  return (
    <div 
      className="w-16 h-full flex flex-col items-center py-4 z-50 transition-colors duration-200 shrink-0"
      style={{ backgroundColor: '#0f6cbd' }}
    >
      {/* VDC Logo */}
      <div className="mb-8 w-11 h-11 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer">
        <ICONS.VDCLogo className="w-10 h-10 drop-shadow-md" />
      </div>

      <nav className="flex flex-col gap-4 w-full px-2">
        {items.map((item) => {
          const isActive = activeContext === item.type;
          return (
            <button
              key={item.type}
              onClick={() => onContextChange(item.type)}
              title={item.label}
              className={`
                group relative w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-200
                ${isActive 
                  ? 'bg-white/20 text-white shadow-lg ring-1 ring-white/30' 
                  : 'text-blue-100 hover:text-white hover:bg-white/10'}
              `}
            >
              <item.icon className="w-6 h-6" />
              {isActive && (
                <div className="absolute right-[-10px] w-1 h-6 bg-white rounded-l-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
              )}
              {/* Tooltip */}
              <div className="absolute left-16 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity uppercase font-bold tracking-widest z-50 whitespace-nowrap shadow-xl">
                {item.label}
              </div>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4 w-full px-2 relative" ref={helpRef}>
        {/* Theme Switcher */}
        <button 
          onClick={toggleTheme}
          title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} mode`}
          className="w-full aspect-square rounded-xl flex items-center justify-center text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
        >
          {isDarkMode ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>

        {/* Help Menu Trigger */}
        <button 
          onClick={() => setShowHelp(!showHelp)}
          title="Help Menu"
          className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-200 ${showHelp ? 'bg-white text-blue-600' : 'text-blue-100 hover:text-white hover:bg-white/10'}`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* User Profile */}
        <div className="w-full aspect-square rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white border-2 border-white/30 hover:border-white transition-colors cursor-pointer">
          JD
        </div>

        {/* Help Dropdown Menu (Screenshot Alignment) */}
        {showHelp && (
          <div className="absolute left-16 bottom-0 w-56 bg-white rounded-lg shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-left-2 duration-200 z-[60] py-2">
            <div className="flex flex-col">
              {helpMenuItems.map((menu, i) => (
                <button 
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-[12px] font-medium border-l-2 border-transparent hover:border-blue-600 group"
                >
                  <menu.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                  <span className={menu.label.includes('Version') ? 'text-slate-400 font-normal' : ''}>
                    {menu.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarTier1;
