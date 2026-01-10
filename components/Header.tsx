
import React from 'react';
import { AppContextType, Project } from '../types';
import { ICONS } from '../constants';

interface HeaderProps {
  activeContext: AppContextType;
  activeProject: Project | null;
  activeTab: string;
  onToggleSidebar: () => void;
  isSidebarExpanded: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  activeContext, 
  activeProject, 
  activeTab, 
  onToggleSidebar, 
  isSidebarExpanded 
}) => {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors"
          title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          <svg className={`w-5 h-5 transition-transform ${isSidebarExpanded ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        {/* Breadcrumbs - Central orientation */}
        <nav className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
          <span className="uppercase tracking-widest font-black text-slate-500 opacity-60">{activeContext}</span>
          <ICONS.ChevronRight className="w-3 h-3" />
          {activeContext === AppContextType.PROJECT && activeProject && (
            <>
              <span className="text-slate-800 font-bold uppercase tracking-tight">{activeProject.name}</span>
              <ICONS.ChevronRight className="w-3 h-3" />
            </>
          )}
          <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-tighter mono font-black ring-1 ring-slate-200">
            {activeTab}
          </span>
        </nav>
      </div>

      <div className="flex-1 flex justify-end items-center max-w-xl">
        {/* Release ID Search Bar - Specialized */}
        <div className="relative group w-full max-w-md">
          <ICONS.Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search Release by ID (e.g. 1166)"
            className="w-full h-9 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-12 text-[12px] outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
          <div className="absolute right-3 top-2 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-400 shadow-sm pointer-events-none">
            ID
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
