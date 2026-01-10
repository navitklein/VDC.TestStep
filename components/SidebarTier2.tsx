
import React, { useState, useMemo } from 'react';
import { AppContextType, Project } from '../types';
import { MOCK_PROJECTS, COLORS, ICONS } from '../constants';

interface SidebarTier2Props {
  activeContext: AppContextType;
  activeProject: Project | null;
  activeTab: string;
  onTabChange: (id: string) => void;
  onProjectSelect: (p: Project) => void;
  onProjectDeselect: () => void;
  expanded: boolean;
  onToggle: () => void;
}

const SidebarTier2: React.FC<SidebarTier2Props> = ({
  activeContext,
  activeProject,
  activeTab,
  onTabChange,
  onProjectSelect,
  onProjectDeselect,
  expanded,
  onToggle
}) => {
  const [projectSearch, setProjectSearch] = useState('');

  const filteredProjects = useMemo(() => {
    return MOCK_PROJECTS.filter(p => 
      p.name.toLowerCase().includes(projectSearch.toLowerCase()) || 
      p.codeName.toLowerCase().includes(projectSearch.toLowerCase())
    );
  }, [projectSearch]);

  const getHeader = () => {
    switch (activeContext) {
      case AppContextType.GLOBAL: return 'GLOBAL EXPLORER';
      case AppContextType.PERSONAL: return 'PERSONAL WORKSPACE';
      case AppContextType.PROJECT: return activeProject ? activeProject.name : 'PROJECT BROWSER';
    }
  };

  const getSections = () => {
    if (activeContext === AppContextType.GLOBAL) {
      return [
        { label: 'DISCOVERY', items: ['Project Explorer', 'Ingredient Index', 'Global Catalog'] },
        { label: 'BUILDERS', items: ['Quick Builder', 'System Configs', 'Workflow Templates'] },
      ];
    }
    if (activeContext === AppContextType.PERSONAL) {
      return [
        { label: 'OVERVIEW', items: ['Dashboard'] },
        { label: 'MY WORK', items: ['My Projects', 'Recent Activity', 'My Favorites'] },
        { label: 'ANALYSIS', items: ['My Saved Queries', 'Custom Reports', 'Data Watcher'] },
      ];
    }
    if (activeContext === AppContextType.PROJECT && activeProject) {
      return [
        { label: 'OVERVIEW', items: ['Dashboard'] },
        { label: 'MANAGEMENT', items: ['Ingredients', 'Releases', 'History'] },
        { label: 'MONITORING', items: ['Workflows', 'Quick Builds', 'Active Runs', 'Error Logs'] },
        { label: 'PROJECT DATA', items: ['Queries', 'Attachments'] },
      ];
    }
    return [];
  };

  return (
    <div 
      className={`h-full border-r border-slate-200 bg-white transition-all duration-300 overflow-hidden flex flex-col ${expanded ? 'w-60 opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}
    >
      {/* Sidebar Header */}
      <div className="h-14 flex items-center px-4 border-b border-slate-100 shrink-0 justify-between">
        <h2 className="text-[10px] font-black tracking-widest text-slate-800 uppercase truncate">
          {getHeader()}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2 custom-scrollbar">
        {/* Subtle Switch Project Link (When Project is Active) */}
        {activeContext === AppContextType.PROJECT && activeProject && (
          <div className="mb-4 pb-2 border-b border-slate-100 px-1">
            <button 
              onClick={onProjectDeselect}
              className="w-full flex items-center gap-2 px-2 py-2 rounded text-slate-500 hover:text-blue-600 transition-all group"
            >
              <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center group-hover:border-blue-400 group-hover:bg-blue-50">
                 <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 15l-3-3m0 0l3-3m-3 3h8" />
                 </svg>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Switch Project</span>
            </button>
          </div>
        )}

        {/* Project Selector Mode (When No Project is Selected) */}
        {activeContext === AppContextType.PROJECT && !activeProject && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300 py-2">
            <div className="px-2">
              <div className="relative">
                <ICONS.Search className="absolute left-2 top-2.5 w-3 h-3 text-slate-400" />
                <input 
                  type="text" 
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Find project..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded px-7 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="space-y-1">
              <p className="px-2 text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-2">RECENT PROJECTS</p>
              {filteredProjects.map(p => (
                <button
                  key={p.id}
                  onClick={() => onProjectSelect(p)}
                  className="w-full flex flex-col items-start px-3 py-2 rounded hover:bg-slate-50 text-left group transition-colors"
                >
                  <span className="text-[12px] font-semibold text-slate-700">{p.name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="mono text-[9px] text-slate-400 uppercase font-medium bg-slate-100 px-1 rounded">{p.codeName}</span>
                    <span className="text-[9px] text-slate-400">{p.lastAccessed}</span>
                  </div>
                </button>
              ))}
              {filteredProjects.length === 0 && (
                <div className="text-[10px] text-slate-400 p-4 text-center italic">No projects found.</div>
              )}
            </div>
          </div>
        )}

        {/* Regular Sections Mode */}
        {(activeContext !== AppContextType.PROJECT || activeProject) && getSections().map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="px-2 mb-2 text-[10px] font-black text-slate-400 tracking-widest uppercase">
              {section.label}
            </h3>
            <div className="space-y-0.5">
              {section.items.map(item => (
                <button
                  key={item}
                  onClick={() => onTabChange(item)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded text-[12px] transition-all duration-150
                    ${activeTab === item 
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-sm border border-blue-100' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'}
                  `}
                >
                  <span className="tracking-tight">{item}</span>
                  {activeTab === item && <ICONS.ChevronRight className="w-3 h-3 text-blue-500" />}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-white border border-slate-200 text-[9px] font-black tracking-widest text-slate-400 uppercase">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          SYSTEMS_OK
        </div>
      </div>
    </div>
  );
};

export default SidebarTier2;
