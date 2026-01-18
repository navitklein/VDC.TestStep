import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { AppContextType, Project, NavigationContext, ContextState } from './types';
import { COLORS, ICONS, MOCK_INGREDIENTS, MOCK_RELEASES, MOCK_PROJECTS, MOCK_KNOBS, MOCK_STRAPS, MOCK_BUILD_DEPS, MOCK_WORKFLOW_STEPS, MOCK_TEST_LINES, Ingredient, Release, Knob, WorkflowStep, TestLine } from './constants';
import SidebarTier1 from './components/SidebarTier1';
import SidebarTier2 from './components/SidebarTier2';
import Header from './components/Header';

type TestStepPhaseId = 'DISCOVERY' | 'REVIEW' | 'SUBMISSION' | 'EXECUTION' | 'RESULT' | 'DONE';
const TEST_PHASE_ORDER: TestStepPhaseId[] = ['DISCOVERY', 'REVIEW', 'SUBMISSION', 'EXECUTION', 'RESULT', 'DONE'];

type EdgeCaseId = 'NORMAL' | 'LONG_BASELINE' | 'LONG_TARGET' | 'LONG_BOTH';

const ITEMS_PER_PAGE = 25; // Increased for full view

const HW_CONFIGS = ['SBF1S2', 'SBF5S2', 'SBF3S2', 'SBF7S1', 'SBF8S1'];
const SW_CONFIGS = ['A', 'B', 'C', 'D', 'E', 'F'];
const GOAL_NAMES = ['Sanity_Memory_Memicals', 'coldWarmResetSolar', 'Sanity_Mesh_Pysec', 'Sanity_PCIE_Rocket'];

const App: React.FC = () => {
  const [nav, setNav] = useState<NavigationContext>({
    activeContext: AppContextType.PROJECT,
    activeProjectId: 'p3',
    sidebarExpanded: true,
    history: {
      [AppContextType.GLOBAL]: { activeTabId: 'Project Explorer', scrollPosition: 0 },
      [AppContextType.PERSONAL]: { activeTabId: 'Dashboard', scrollPosition: 0 },
      ['PROJECT_p3']: { activeTabId: 'Quick Builds', scrollPosition: 0 },
    }
  });

  const activeProject = useMemo(() => 
    MOCK_PROJECTS.find(p => p.id === nav.activeProjectId) || null
  , [nav.activeProjectId]);

  const activeTab = useMemo(() => {
    const currentKey = nav.activeContext === AppContextType.PROJECT ? `PROJECT_${nav.activeProjectId || 'BROWSER'}` : nav.activeContext;
    return nav.history[currentKey]?.activeTabId || 'Dashboard';
  }, [nav.activeContext, nav.activeProjectId, nav.history]);

  const [selectedStepId, setSelectedStepId] = useState<string>('step6');
  const [currentTestPhase, setCurrentTestPhase] = useState<TestStepPhaseId>('DISCOVERY');
  const [edgeCaseId, setEdgeCaseId] = useState<EdgeCaseId>('NORMAL');
  const [isWorkflowSidebarCollapsed, setIsWorkflowSidebarCollapsed] = useState(false);
  const [isPhaseMenuOpen, setIsPhaseMenuOpen] = useState(false);
  const [isTestMatrixFullView, setIsTestMatrixFullView] = useState(false);
  const [showReviewGuidance, setShowReviewGuidance] = useState(false);
  
  const [showAllDeps, setShowAllDeps] = useState(false);
  const [depsPage, setDepsPage] = useState(1);
  const [showScrollBouncer, setShowScrollBouncer] = useState(true);

  // Knobs & Straps State
  const [showAllKnobs, setShowAllKnobs] = useState(false);
  const [knobsPage, setKnobsPage] = useState(1);
  const [knobsSearch, setKnobsSearch] = useState("");

  const [showAllStraps, setShowAllStraps] = useState(false);
  const [strapsPage, setStrapsPage] = useState(1);

  // Test State & Drill-down filters
  const [testLines, setTestLines] = useState<TestLine[]>(MOCK_TEST_LINES);
  const [testLinesPage, setTestLinesPage] = useState(1);
  const [resOutcome, setResOutcome] = useState<'PASSED' | 'FAILED' | null>(null);
  const [resolutionReason, setResolutionReason] = useState("");
  const [buildSeconds, setBuildSeconds] = useState(1214);
  const [matrixFilter, setMatrixFilter] = useState<{ goal?: string; hw?: string; sw?: string } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const phaseMenuRef = useRef<HTMLDivElement>(null);
  const guidancePopoverRef = useRef<HTMLDivElement>(null);

  const displayedDeps = useMemo(() => {
    return showAllDeps ? MOCK_BUILD_DEPS : MOCK_BUILD_DEPS.filter(d => d.isModified);
  }, [showAllDeps]);

  const paginatedDeps = useMemo(() => {
    const start = (depsPage - 1) * 10; // Keeping 10 for deps
    return displayedDeps.slice(start, start + 10);
  }, [displayedDeps, depsPage]);

  // Knobs Filtering & Pagination
  const filteredKnobs = useMemo(() => {
    let result = showAllKnobs ? MOCK_KNOBS : MOCK_KNOBS.filter(k => k.isOverridden);
    if (knobsSearch.trim()) {
      const q = knobsSearch.toLowerCase();
      result = result.filter(k => 
        k.name.toLowerCase().includes(q) || 
        k.path.toLowerCase().includes(q) || 
        k.displayValue.toLowerCase().includes(q)
      );
    }
    return result;
  }, [showAllKnobs, knobsSearch]);

  const paginatedKnobs = useMemo(() => {
    const start = (knobsPage - 1) * 10;
    return filteredKnobs.slice(start, start + 10);
  }, [filteredKnobs, knobsPage]);

  // Filtering for table drill-down
  const filteredTestLines = useMemo(() => {
    if (!matrixFilter) return testLines;
    return testLines.filter(line => {
      const matchGoal = matrixFilter.goal ? line.goalName === matrixFilter.goal : true;
      const matchHW = matrixFilter.hw ? line.hwConfig === matrixFilter.hw : true;
      const matchSW = matrixFilter.sw ? line.swConfig === matrixFilter.sw : true;
      return matchGoal && matchHW && matchSW;
    });
  }, [testLines, matrixFilter]);

  const paginatedTestLines = useMemo(() => {
    const start = (testLinesPage - 1) * ITEMS_PER_PAGE;
    return filteredTestLines.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTestLines, testLinesPage]);

  const totalDepsPages = Math.ceil(displayedDeps.length / 10);
  const totalKnobsPages = Math.ceil(filteredKnobs.length / 10);
  const totalTestLinesPages = Math.ceil(filteredTestLines.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setDepsPage(1);
    setKnobsPage(1);
    setTestLinesPage(1);
  }, [showAllDeps, showAllKnobs, selectedStepId, matrixFilter]);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      if (scrollTop > 50 || (scrollHeight - scrollTop - clientHeight < 10)) {
        setShowScrollBouncer(false);
      } else {
        setShowScrollBouncer(true);
      }
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (phaseMenuRef.current && !phaseMenuRef.current.contains(event.target as Node)) {
        setIsPhaseMenuOpen(false);
      }
      if (guidancePopoverRef.current && !guidancePopoverRef.current.contains(event.target as Node)) {
        setShowReviewGuidance(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [collapsedBuildSections, setCollapsedBuildSections] = useState<Record<string, boolean>>({
    settings: true,
    deps: false,
    knobs: false,
    straps: false,
    logs: true,
    heatMap: false,
    testMatrix: false,
    resolution: false
  });

  useEffect(() => {
    if (currentTestPhase === 'REVIEW') {
      setCollapsedBuildSections(prev => ({ ...prev, testMatrix: false }));
    } else if (currentTestPhase === 'RESULT') {
      setCollapsedBuildSections({
        settings: true,
        deps: true,
        knobs: true,
        straps: true,
        logs: true,
        heatMap: true,
        testMatrix: true,
        resolution: false
      });
    }
  }, [currentTestPhase]);

  useEffect(() => {
    let interval: any;
    const isBuildExecution = (activeTab === 'Quick Builds' || activeTab === 'Workflows') && (currentTestPhase !== 'DONE');
    const isRunningOrExecuting = currentTestPhase === 'EXECUTION';

    if (isBuildExecution || isRunningOrExecuting) {
      interval = setInterval(() => {
        setBuildSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentTestPhase, activeTab]);

  const formatSeconds = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
  };

  const handleTabChange = useCallback((tabId: string) => {
    const currentKey = nav.activeContext === AppContextType.PROJECT ? `PROJECT_${nav.activeProjectId || 'BROWSER'}` : nav.activeContext;
    setNav(prev => ({
      ...prev,
      history: { ...prev.history, [currentKey]: { ...prev.history[currentKey], activeTabId: tabId } }
    }));
  }, [nav.activeContext, nav.activeProjectId]);

  const collapseAllAuxiliaryPanels = useCallback(() => {
    setCollapsedBuildSections({
      settings: true,
      deps: true,
      knobs: true,
      straps: true,
      logs: true,
      heatMap: true,
      testMatrix: true,
      resolution: true
    });
  }, []);

  const expandAllPanels = useCallback(() => {
    setCollapsedBuildSections({
      settings: false,
      deps: false,
      knobs: false,
      straps: false,
      logs: false,
      heatMap: false,
      testMatrix: false,
      resolution: false
    });
  }, []);

  const areAllPanelsCollapsed = useMemo(() => {
    return Object.values(collapsedBuildSections).every(val => val === true);
  }, [collapsedBuildSections]);

  const toggleAllPanels = useCallback(() => {
    if (areAllPanelsCollapsed) {
      expandAllPanels();
    } else {
      collapseAllAuxiliaryPanels();
    }
  }, [areAllPanelsCollapsed, expandAllPanels, collapseAllAuxiliaryPanels]);

  const cycleBuildState = () => {
    if (currentTestPhase !== 'DONE') {
      setCurrentTestPhase('DONE');
      setResOutcome('PASSED');
      collapseAllAuxiliaryPanels();
    } else {
      setCurrentTestPhase('EXECUTION');
      setResOutcome(null);
    }
  };

  const cycleEdgeCase = () => {
    const order: EdgeCaseId[] = ['NORMAL', 'LONG_BASELINE', 'LONG_TARGET', 'LONG_BOTH'];
    const currentIdx = order.indexOf(edgeCaseId);
    setEdgeCaseId(order[(currentIdx + 1) % order.length]);
  };

  const cycleDemoPhase = () => {
    const step = MOCK_WORKFLOW_STEPS.find(s => s.id === selectedStepId);
    if (step?.type === 'UP' || step?.type === 'IFWI') {
      cycleBuildState();
      return;
    }
    const nextIdx = (TEST_PHASE_ORDER.indexOf(currentTestPhase) + 1) % TEST_PHASE_ORDER.length;
    const nextPhase = TEST_PHASE_ORDER[nextIdx];
    setCurrentTestPhase(nextPhase);
    
    if (nextPhase === 'DONE') {
      if (!resOutcome) {
        setResOutcome('PASSED');
        setResolutionReason("System-triggered auto-completion during simulation.");
      }
      collapseAllAuxiliaryPanels();
    } else {
      setResOutcome(null);
      setResolutionReason("");
    }
  };

  const handleSubmitResolution = () => {
    if (resOutcome && resolutionReason) {
      setCurrentTestPhase('DONE');
      collapseAllAuxiliaryPanels();
    }
  };

  const generate90Chars = (prefix: string) => {
    const base = prefix;
    const filler = "X".repeat(Math.max(0, 90 - base.length));
    return base + filler;
  };

  const TruncatedText: React.FC<{ text: string; className?: string }> = ({ text, className = "" }) => (
    <div className={`relative group cursor-help truncate max-w-full ${className}`} title={text}>
      {text}
      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50 pointer-events-none">
        <div className="bg-slate-900 text-white text-[10px] font-medium p-2 rounded shadow-xl max-w-xs break-all leading-relaxed ring-1 ring-white/10">
          {text}
        </div>
      </div>
    </div>
  );

  const toggleIncludeTest = (id: string) => {
    setTestLines(prev => prev.map(t => t.id === id ? { ...t, included: !t.included } : t));
  };

  const renderQuickBuildStepView = () => {
    const isCompleted = currentTestPhase === 'DONE';
    const isSuccess = isCompleted && resOutcome === 'PASSED';
    const isFailed = isCompleted && resOutcome === 'FAILED';
    const isRunning = !isCompleted;
    const step = MOCK_WORKFLOW_STEPS.find(s => s.id === selectedStepId);
    const isUnifiedPatch = step?.type === 'UP';

    const cardBg = isSuccess ? 'bg-emerald-50/60' : isFailed ? 'bg-rose-50/60' : 'bg-blue-50/60';
    const statusBarColor = isSuccess ? 'bg-emerald-600' : isFailed ? 'bg-rose-600' : 'bg-brand';

    const baselineNameOrig = (edgeCaseId === 'LONG_BASELINE' || edgeCaseId === 'LONG_BOTH')
      ? generate90Chars("UP_DMR_AO_REL_STABLE_BUILD_ENVIRONMENT_ARCHIVE_LONG_ID_IDENTIFIER_")
      : "UP_DMR_AO_REL";

    const targetNameOrig = (edgeCaseId === 'LONG_TARGET' || edgeCaseId === 'LONG_BOTH')
      ? generate90Chars("Unified_pathc_DMR_A0_STAGING_ENVIRONMENT_STABLE_RELEASE_v25_1_0_RC_")
      : "Unified_pathc_DMR_A0_RC";

    const baselineLabel = isUnifiedPatch ? "BASELINE" : "IFWI BASELINE";
    const targetLabel = isUnifiedPatch ? "TARGET" : "IFWI TARGET";
    
    const baselineName = isUnifiedPatch ? baselineNameOrig : `IFWI ${baselineNameOrig}`;
    const targetName = isUnifiedPatch ? targetNameOrig : `IFWI ${targetNameOrig}`;

    return (
      <div className="flex flex-col space-y-3 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-500 h-full overflow-hidden relative">
        <div className="flex items-center justify-between shrink-0 mb-0.5">
          <div className="flex items-center gap-4">
             <h1 className="text-[18px] font-black text-slate-800 tracking-tight uppercase shrink-0">
               {isUnifiedPatch ? "Unified patch build" : step?.name.toUpperCase() || "IFWI BUILD EXECUTION"}
             </h1>
             <div className="h-4 w-[1px] bg-slate-200 mx-1" />
             <div className="flex items-center gap-1.5">
               <button onClick={cycleDemoPhase} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[9px] font-black text-slate-600 uppercase transition-all flex items-center gap-1.5 group">
                  Cycle State <ICONS.ChevronRight className="w-2 h-2 group-hover:translate-x-0.5 transition-transform" />
               </button>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-10 gap-3 shrink-0">
          <div className={`col-span-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[110px] relative overflow-hidden transition-all duration-500 ${cardBg}`}>
             <div className="flex-1 p-3.5 px-7 flex flex-col min-h-0">
               <div className="flex items-center justify-between gap-4 relative flex-1 min-w-0">
                  <div className="flex flex-col flex-1 min-w-0">
                     <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none whitespace-nowrap">{baselineLabel}</span>
                     <TruncatedText text={baselineName} className="text-[11px] font-bold text-slate-800 uppercase" />
                  </div>
                  <div className="flex items-center justify-center shrink-0 px-4 opacity-10">
                     <svg className="w-10 h-4 text-slate-900" viewBox="0 0 24 12" fill="none"><path d="M1 6H23M23 6L18 1M23 6L18 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div className="flex flex-col flex-1 items-end text-right min-w-0">
                     <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none whitespace-nowrap">{targetLabel}</span>
                     <TruncatedText text={targetName} className="text-[11px] font-black text-brand uppercase" />
                  </div>
               </div>
             </div>
             <div className="h-1.5 w-full bg-slate-900/5 overflow-hidden shrink-0">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${statusBarColor} ${isRunning ? 'animate-indeterminate-progress' : ''}`} 
                  style={isRunning ? {} : { width: '100%' }}
                />
             </div>
          </div>
          <div className="col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[110px] relative overflow-hidden">
             <div className="flex flex-col items-center flex-1 justify-center mt-0.5 px-6">
                <span className="text-[7px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1 leading-none">EXECUTION TIME</span>
                <span className="text-2xl font-black mono tracking-tight leading-none tabular-nums text-slate-800">
                   {formatSeconds(buildSeconds)}
                </span>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative group">
          <div ref={scrollContainerRef} onScroll={handleScroll} className="h-full overflow-y-auto space-y-3 pr-1 custom-scrollbar scroll-smooth">
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div onClick={() => toggleBuildSection('settings')} className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 cursor-pointer">
                <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">BUILD SETTINGS</span>
                <ICONS.ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${collapsedBuildSections.settings ? '' : 'rotate-90'}`} />
              </div>
              {!collapsedBuildSections.settings && (
                 <div className="p-4 bg-white grid grid-cols-2 gap-4">
                    <div className="flex justify-between"><span className="text-[10px] uppercase font-bold text-slate-400">Silicon</span><span className="text-[11px] font-black">DMR-AP</span></div>
                    <div className="flex justify-between"><span className="text-[10px] uppercase font-bold text-slate-400">Step</span><span className="text-[11px] font-black">A0</span></div>
                 </div>
              )}
            </section>
          </div>
        </div>
      </div>
    );
  };

  const renderAggregationMatrix = () => {
    const getAggregateStatus = (goal: string, hw: string, sw: string) => {
      const filtered = testLines.filter(l => l.goalName === goal && l.hwConfig === hw && l.swConfig === sw);
      if (filtered.length === 0) return 'empty';
      if (filtered.some(l => l.status === 'Failed')) return 'Failed';
      if (filtered.some(l => l.status === 'Running')) return 'Running';
      if (filtered.some(l => l.status === 'Pending')) return 'Pending';
      return 'Passed';
    };

    return (
      <div className="p-4 overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th rowSpan={2} className="p-2 border border-slate-100 bg-slate-50 text-[9px] font-black uppercase text-slate-400 text-left w-[200px]">Goal Name</th>
              {HW_CONFIGS.map(hw => (
                <th key={hw} colSpan={SW_CONFIGS.length} className="p-2 border border-slate-100 bg-slate-100/50 text-[10px] font-black text-slate-600 text-center">{hw}</th>
              ))}
            </tr>
            <tr>
              {HW_CONFIGS.map(hw => 
                SW_CONFIGS.map(sw => (
                  <th key={`${hw}-${sw}`} className="p-1 border border-slate-100 bg-slate-50 text-[8px] font-bold text-slate-400 text-center w-[30px]">{sw}</th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {GOAL_NAMES.map(goal => (
              <tr key={goal}>
                <td className="p-2 border border-slate-100 text-[10px] font-black text-slate-800 truncate" title={goal}>{goal}</td>
                {HW_CONFIGS.map(hw => 
                  SW_CONFIGS.map(sw => {
                    const status = getAggregateStatus(goal, hw, sw);
                    const isActive = matrixFilter?.goal === goal && matrixFilter?.hw === hw && matrixFilter?.sw === sw;
                    return (
                      <td 
                        key={`${hw}-${sw}`} 
                        onClick={() => {
                          if (isActive) setMatrixFilter(null);
                          else setMatrixFilter({ goal, hw, sw });
                        }}
                        className={`p-0 border border-slate-100 cursor-pointer transition-all hover:scale-110 hover:z-10 relative
                          ${isActive ? 'ring-2 ring-blue-500 z-10 shadow-lg scale-105' : ''}
                        `}
                      >
                        <div className={`h-6 w-full flex items-center justify-center
                          ${status === 'Passed' ? 'bg-emerald-500/90' : 
                            status === 'Failed' ? 'bg-rose-500/90' : 
                            status === 'Running' ? 'bg-blue-500/90 animate-pulse' : 
                            status === 'Pending' ? 'bg-slate-300' : 'bg-slate-50/50'}
                        `}>
                          {status !== 'empty' && (
                            <span className="text-[7px] font-black text-white/50">{testLines.filter(l => l.goalName === goal && l.hwConfig === hw && l.swConfig === sw).length}</span>
                          )}
                        </div>
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex items-center justify-between">
           <div className="flex items-center gap-6 justify-center">
             {['Passed', 'Failed', 'Running', 'Pending'].map(s => (
               <div key={s} className="flex items-center gap-2">
                 <div className={`w-2.5 h-2.5 rounded-full ${s === 'Passed' ? 'bg-emerald-500' : s === 'Failed' ? 'bg-rose-500' : s === 'Running' ? 'bg-blue-500' : 'bg-slate-200'}`} />
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s}</span>
               </div>
             ))}
           </div>
           {matrixFilter && (
             <button 
               onClick={() => setMatrixFilter(null)}
               className="text-[9px] font-black text-brand uppercase underline tracking-widest hover:text-blue-700 transition-colors"
             >
               Clear aggregation filter
             </button>
           )}
        </div>
      </div>
    );
  };

  const renderTestMatrixContent = (fullView = false) => (
    <div className={`flex flex-col h-full ${fullView ? 'bg-white rounded-xl' : ''}`}>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-[11px] border-collapse table-fixed">
          <thead className="bg-slate-50 font-black text-[9px] text-slate-400 uppercase tracking-widest border-b border-slate-100 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 w-[60px]">Status</th>
              <th className="px-4 py-3 w-[100px]">Case ID</th>
              <th className="px-4 py-3 w-[180px]">Test Name</th>
              <th className="px-4 py-3 w-[180px]">Goal Name</th>
              <th className="px-4 py-3 w-[100px]">HW Config</th>
              <th className="px-4 py-3 w-[80px]">SW Config</th>
              <th className="px-4 py-3 w-[120px]">SUT Node</th>
              <th className="px-4 py-3 w-[80px]">Duration</th>
              <th className="px-4 py-3 w-[100px] text-right">Selection</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedTestLines.map((line, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-4 py-3">
                  <div className={`w-2 h-2 rounded-full ${line.status === 'Passed' ? 'bg-emerald-500' : line.status === 'Failed' ? 'bg-rose-500' : line.status === 'Running' ? 'bg-blue-500' : 'bg-slate-200'}`} />
                </td>
                <td className="px-4 py-3 mono font-black text-slate-400">{line.id}</td>
                <td className="px-4 py-3 font-bold text-slate-800 truncate" title={line.name}>{line.name}</td>
                <td className="px-4 py-3 font-medium text-slate-600 truncate" title={line.goalName}>{line.goalName}</td>
                <td className="px-4 py-3 font-medium text-slate-500 mono text-[10px]">{line.hwConfig}</td>
                <td className="px-4 py-3 font-medium text-slate-500 mono text-[10px]">{line.swConfig}</td>
                <td className="px-4 py-3 font-medium text-slate-500 truncate">{line.sut}</td>
                <td className="px-4 py-3 mono text-slate-400">{line.duration}</td>
                <td className="px-4 py-3 text-right">
                  <button 
                    disabled={currentTestPhase !== 'REVIEW'}
                    onClick={() => toggleIncludeTest(line.id)}
                    className={`px-2 py-0.5 rounded text-[8px] font-black uppercase transition-all ${line.included ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {line.included ? 'Included' : 'Excluded'}
                  </button>
                </td>
              </tr>
            ))}
            {paginatedTestLines.length === 0 && (
              <tr>
                <td colSpan={9} className="p-10 text-center italic text-slate-400 text-[12px]">No testlines match the current aggregation filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <PaginationControls 
        page={testLinesPage} 
        total={totalTestLinesPages} 
        onPageChange={setTestLinesPage} 
        count={filteredTestLines.length} 
        perPage={ITEMS_PER_PAGE} 
      />
    </div>
  );

  const renderTestStepView = () => {
    const phase = currentTestPhase;
    const isDiscovery = phase === 'DISCOVERY';
    const isReview = phase === 'REVIEW';
    const isSubmission = phase === 'SUBMISSION';
    const isExecution = phase === 'EXECUTION';
    const isResult = phase === 'RESULT';
    const isDone = phase === 'DONE';

    const isSuccess = isDone && resOutcome === 'PASSED';
    const cardBg = isSuccess ? 'bg-emerald-50/60' : (isDone && resOutcome === 'FAILED') ? 'bg-rose-50/60' : (isReview || isResult) ? 'bg-orange-50/60' : 'bg-blue-50/60';
    const statusColor = isSuccess ? 'bg-emerald-600' : (isDone && resOutcome === 'FAILED') ? 'bg-rose-600' : (isReview || isResult) ? 'bg-orange-500' : 'bg-brand';

    const kpis = useMemo(() => {
      if (isDiscovery || isSubmission) return [];
      if (isReview) return [
        { label: 'Discovered', val: '450' },
        { label: 'Selected', val: testLines.filter(t => t.included).length.toString() },
        { label: 'Excluded', val: testLines.filter(t => !t.included).length.toString() }
      ];
      const passed = testLines.filter(t => t.status === 'Passed').length;
      const total = testLines.length;
      const failed = testLines.filter(t => t.status === 'Failed').length;
      return [
        { label: 'Discovered', val: '450' },
        { label: 'Submitted', val: '450' },
        { label: 'Completed', val: (passed + failed).toString() },
        { label: 'Running', val: testLines.filter(t => t.status === 'Running').length.toString() },
        { label: 'Passed', val: passed.toString() },
        { label: 'Failed', val: failed.toString() },
        { label: 'Pending', val: testLines.filter(t => t.status === 'Pending').length.toString() },
        { label: 'Pass Rate', val: `${((passed / total) * 100).toFixed(1)}%` }
      ];
    }, [phase, testLines]);

    if (isTestMatrixFullView) {
      return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsTestMatrixFullView(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                  title="Return to Workflow View"
                >
                  <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7M5 12h16" /></svg>
                </button>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">DRIVE REVIEW</span>
                  <h2 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Testlines</h2>
                </div>
                {matrixFilter && (
                   <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                      <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">ACTIVE FILTER</span>
                      <span className="text-[10px] font-bold text-blue-800 uppercase truncate max-w-[200px]">{matrixFilter.goal} | {matrixFilter.hw}</span>
                      <button onClick={() => setMatrixFilter(null)} className="text-blue-400 hover:text-blue-600"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                   </div>
                )}
              </div>
              <div className="flex items-center gap-6">
                 {['Passed', 'Failed', 'Running', 'Pending'].map(s => (
                   <div key={s} className="flex items-center gap-2">
                     <div className={`w-2.5 h-2.5 rounded-full ${s === 'Passed' ? 'bg-emerald-500' : s === 'Failed' ? 'bg-rose-500' : s === 'Running' ? 'bg-blue-500' : 'bg-slate-200'}`} />
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s}: <span className="text-slate-800">{testLines.filter(t => t.status === s).length}</span></span>
                   </div>
                 ))}
              </div>
           </div>
           <div className="flex-1 overflow-hidden border border-slate-200 rounded-xl shadow-lg bg-white">
              {renderTestMatrixContent(true)}
           </div>
        </div>
      );
    }

    const activeIndex = TEST_PHASE_ORDER.indexOf(phase);

    return (
      <div className="flex flex-col space-y-3 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-500 h-full overflow-hidden relative">
        <div className="flex items-center justify-between shrink-0 mb-0.5">
          <div className="flex items-center gap-4">
             <h1 className="text-[18px] font-black text-slate-800 tracking-tight uppercase shrink-0">
               VAL_DMR_AO_POWER_ON
             </h1>
             <div className="h-4 w-[1px] bg-slate-200 mx-1" />
             <div className="flex items-center gap-1.5">
               <button onClick={cycleDemoPhase} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[9px] font-black text-slate-600 uppercase transition-all flex items-center gap-1.5 group">
                  Cycle Phase <ICONS.ChevronRight className="w-2 h-2 group-hover:translate-x-0.5 transition-transform" />
               </button>
             </div>
          </div>
          <div className="flex items-center gap-2">
            {isReview && <button className="px-4 py-1.5 bg-brand text-white text-[10px] font-black uppercase rounded shadow-sm hover:bg-blue-700 transition-all">Submit to NGA</button>}
          </div>
        </div>

        <div className="grid grid-cols-10 gap-3 shrink-0">
          <div className={`col-span-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[110px] relative transition-all duration-500 ${cardBg}`}>
             <div className="flex-1 p-2.5 px-6 flex flex-col justify-center gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="relative" ref={phaseMenuRef}>
                    <button 
                      onClick={() => setIsPhaseMenuOpen(!isPhaseMenuOpen)}
                      className="group flex flex-col items-start gap-1 transition-all active:scale-[0.98] py-0.5"
                    >
                      <div className="flex items-center gap-1.5 h-1 px-0.5">
                        {TEST_PHASE_ORDER.map((p, idx) => {
                          const isCurrent = p === phase;
                          const isPast = activeIndex > idx;
                          const currentColor = isCurrent && (isReview || isResult) ? 'bg-orange-500' : 'bg-blue-600';
                          return (
                            <div 
                              key={p} 
                              className={`w-5 h-1 rounded-full transition-all duration-300 ${isCurrent ? `${currentColor} animate-pulse scale-y-125` : isPast ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            />
                          );
                        })}
                      </div>
                    </button>
                    {isPhaseMenuOpen && (
                      <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 py-3 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 mb-2 pb-2 border-b border-slate-50 flex items-center justify-between">
                          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Lifecycle FSM</h4>
                          <span className="text-[8px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">6 PHASES</span>
                        </div>
                        <div className="flex flex-col">
                          {TEST_PHASE_ORDER.map((p, idx) => {
                            const isCurrent = p === phase;
                            const isPast = activeIndex > idx;
                            const requiresAction = p === 'REVIEW' || p === 'RESULT';
                            return (
                              <div 
                                key={p} 
                                className={`flex items-center gap-4 px-4 py-2.5 transition-colors group cursor-default ${isCurrent ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                              >
                                <div className="flex flex-col items-center shrink-0">
                                  <div className={`w-2 h-2 rounded-full border-2 ${isCurrent ? 'bg-white border-blue-600 ring-2 ring-blue-100' : isPast ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-200 border-slate-200'}`} />
                                  {idx < TEST_PHASE_ORDER.length - 1 && <div className={`w-[1px] h-4 mt-1 ${isPast ? 'bg-emerald-500/50' : 'bg-slate-100'}`} />}
                                </div>
                                <div className="flex flex-col leading-none">
                                  <span className={`text-[11px] font-black uppercase tracking-tight ${isCurrent ? 'text-blue-700' : isPast ? 'text-slate-600' : 'text-slate-400'}`}>
                                    {p.replace('_', ' ')}
                                  </span>
                                  {isCurrent && <span className="text-[7px] font-bold text-blue-400 uppercase tracking-widest mt-1">Active Stage</span>}
                                </div>
                                {requiresAction && (
                                  <div className="ml-auto flex items-center gap-1.5">
                                    <span className="text-[7px] font-black text-amber-600 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Action Required</span>
                                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border shadow-sm shrink-0 transition-all duration-500 ${(isExecution || isResult) ? 'bg-white/50 border-slate-100/50' : 'bg-slate-100/50 border-slate-200'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${(isExecution || isResult) ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-400'}`} />
                    <span className={`text-[7px] font-black uppercase tracking-[0.1em] ${(isExecution || isResult) ? 'text-slate-500' : 'text-slate-400'}`}>
                      NGA: {(isExecution || isResult) ? 'ONLINE' : 'DISCONNECTED'}
                    </span>
                  </div>
                </div>
                <div className="flex items-end justify-between leading-none">
                  <div className="flex flex-col relative">
                    <span className="text-[6.5px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">TEST STEP PHASE</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-black text-slate-800 uppercase tracking-tight">
                        {isReview ? 'Testline Inclusion' : isResult ? 'Final Resolution' : phase.replace('_', ' ')}
                      </span>
                      {isReview && (
                        <div className="relative" ref={guidancePopoverRef}>
                          <button 
                            onClick={() => setShowReviewGuidance(!showReviewGuidance)}
                            className={`p-0.5 rounded-full transition-all ${showReviewGuidance ? 'bg-blue-600 text-white shadow-lg scale-110' : 'text-slate-300 hover:text-blue-500 hover:bg-blue-50'}`}
                          >
                            <ICONS.Info className="w-3.5 h-3.5" />
                          </button>
                          {showReviewGuidance && (
                            <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] border border-slate-200 p-5 z-[100] animate-in fade-in slide-in-from-top-2 duration-300 ring-1 ring-black/5">
                               <div className="flex items-center gap-3 mb-3 border-b border-slate-50 pb-2">
                                  <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-sm"><ICONS.Info className="w-3.5 h-3.5" /></div>
                                  <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Review Guidance</h4>
                               </div>
                               <ul className="text-[10px] font-medium text-slate-600 space-y-2.5 list-disc pl-3">
                                 <li>Review each test's configuration and properties before submission</li>
                                 <li>Click on test rows to edit execution settings in the side panel</li>
                                 <li>Click the 'Included'/'Excluded' badge to toggle a test for execution</li>
                               </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {isReview && (
                      <span className="text-[8px] font-medium text-slate-500 mt-1.5 leading-tight max-w-[300px]">
                        All testlines are included by default. Exclude any you don't want to run
                      </span>
                    )}
                    {isResult && (
                      <span className="text-[8px] font-medium text-slate-500 mt-1.5 leading-tight max-w-[300px]">
                        Execution is complete. Choose how this step should be resolved.
                      </span>
                    )}
                  </div>
                  {(isExecution || isResult || isDone) && (
                    <div className="flex flex-col items-end gap-0.5">
                       <span className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest">PROGRESS</span>
                       <span className="text-[10px] font-black text-slate-800 uppercase tabular-nums tracking-tighter">
                         {isDone ? '100% COMPLETED' : '45% COMPLETE'}
                        </span>
                    </div>
                  )}
                </div>
             </div>
             {!isReview && !isResult && (
               <div className="h-1.5 w-full bg-slate-900/5 shrink-0 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${statusColor} ${(isDiscovery || isSubmission) ? 'animate-indeterminate-progress' : ''}`} 
                    style={(isDiscovery || isSubmission) ? {} : { width: isDone ? '100%' : '45%' }}
                  />
               </div>
             )}
             {(isReview || isResult) && <div className="h-1.5 w-full bg-orange-100 shrink-0" />}
          </div>
          <div className="col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[110px] relative overflow-hidden group">
             <div className="flex flex-col items-center flex-1 justify-center mt-0.5 px-6">
                <span className="text-[7px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1 leading-none">EXECUTION TIME</span>
                <span className="text-2xl font-black mono tracking-tight leading-none tabular-nums text-slate-800 drop-shadow-sm">
                   {formatSeconds(buildSeconds)}
                </span>
             </div>
             <div className="flex items-center justify-around border-t border-slate-50 mt-auto bg-slate-50/40 py-2.5 px-6 shrink-0">
                <div className="flex items-center gap-1 flex-col flex-1">
                   <span className="text-[7px] font-black text-slate-400 uppercase leading-none mb-0.5 tracking-widest">STARTED</span>
                   <span className="text-[10px] font-bold text-slate-600 leading-none mono tabular-nums whitespace-nowrap">12/17 14:35:00</span>
                </div>
                <div className="h-5 w-[1px] bg-slate-200 mx-2 shrink-0" />
                <div className="flex items-center gap-1 flex-col flex-1">
                   <span className="text-[7px] font-black text-slate-400 uppercase leading-none mb-0.5 tracking-widest">FINISHED</span>
                   <span className="text-[10px] font-bold leading-none mono tabular-nums text-slate-600 whitespace-nowrap">
                      {isDone ? '12/17 14:55:14' : '--:--:--'}
                   </span>
                </div>
             </div>
             <div className="h-1.5 w-full bg-slate-50 border-t border-slate-100 shrink-0" />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar shrink-0 h-16">
          {kpis.map((stat, i) => {
            const label = stat.label.toLowerCase();
            let cardColor = "bg-white";
            let textColor = "text-slate-800";
            let subTextColor = "text-slate-400";
            let borderColor = "border-slate-200";

            if (label === 'running') {
              cardColor = "bg-blue-50";
              textColor = "text-blue-700";
              subTextColor = "text-blue-400";
              borderColor = "border-blue-100";
            } else if (label === 'passed') {
              cardColor = "bg-emerald-50";
              textColor = "text-emerald-700";
              subTextColor = "text-emerald-400";
              borderColor = "border-emerald-100";
            } else if (label === 'failed') {
              cardColor = "bg-rose-50";
              textColor = "text-rose-700";
              subTextColor = "text-rose-400";
              borderColor = "border-rose-100";
            } else if (label === 'pending') {
              cardColor = "bg-slate-100";
              textColor = "text-slate-600";
              subTextColor = "text-slate-400";
              borderColor = "border-slate-200";
            }

            return (
              <div key={i} className={`flex-shrink-0 min-w-[120px] ${cardColor} p-2.5 px-5 rounded-xl border ${borderColor} shadow-sm flex items-center gap-3 transition-all hover:scale-[1.02]`}>
                <div className="flex flex-col">
                  <span className={`text-[14px] font-black ${textColor} tracking-tight leading-none mb-1`}>{stat.val}</span>
                  <span className={`text-[7px] font-black uppercase tracking-wider ${subTextColor} leading-none`}>{stat.label}</span>
                </div>
              </div>
            );
          })}
          {(isDiscovery || isSubmission) && (
            <div className="flex items-center gap-3 px-6 h-full text-slate-300 animate-pulse">
              <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Calculating Real-time Metrics...</span>
            </div>
          )}        </div>

        <div className="flex items-center justify-between shrink-0 mb-1">
          <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Test Details</h2>
          <button 
            onClick={toggleAllPanels} 
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[9px] font-black text-slate-600 uppercase transition-all flex items-center gap-1.5"
            title={areAllPanelsCollapsed ? "Expand all panels" : "Collapse all panels"}
          >
            {areAllPanelsCollapsed ? (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                Expand All
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                Collapse All
              </>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative group">
          <div ref={scrollContainerRef} onScroll={handleScroll} className="h-full overflow-y-auto space-y-3 pr-1 custom-scrollbar scroll-smooth pb-20">
            {isDone && resOutcome && (
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                <div className={`px-5 py-3 border-b flex items-center justify-between ${resOutcome === 'PASSED' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-3 rounded-full ${resOutcome === 'PASSED' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className={`text-[11px] font-black uppercase tracking-widest ${resOutcome === 'PASSED' ? 'text-emerald-800' : 'text-rose-800'}`}>
                      Final Engineering Resolution: {resOutcome}
                    </span>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${resOutcome === 'PASSED' ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'}`}>
                    OFFICIAL RECORD
                  </div>
                </div>
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">JUSTIFICATION</span>
                    <p className="text-[11px] font-medium text-slate-700 leading-relaxed italic">
                      "{resolutionReason}"
                    </p>
                  </div>
                </div>
              </section>
            )}

            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div onClick={() => toggleBuildSection('settings')} className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-3 bg-slate-400 rounded-full" />
                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Test settings</span>
                </div>
                <ICONS.ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${collapsedBuildSections.settings ? '' : 'rotate-90'}`} />
              </div>
              {!collapsedBuildSections.settings && (
                <div className="bg-white divide-y divide-slate-50 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-2 divide-x divide-slate-50">
                    <div className="flex items-center justify-between px-6 py-3.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">SILICON</span>
                      <span className="text-[11px] font-black text-slate-800">DMR-AP</span>
                    </div>
                    <div className="flex items-center justify-between px-6 py-3.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">STEP</span>
                      <span className="text-[11px] font-black text-slate-800">A0</span>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {isResult && (
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-top-4 duration-500">
                <div onClick={() => toggleBuildSection('resolution')} className="px-5 py-2.5 border-b border-amber-100 flex items-center justify-between bg-amber-50/40 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-3 bg-amber-500 rounded-full" />
                    <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Resolve Step</span>
                    <span className="px-2.5 py-1 bg-orange-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-sm">
                      Resolution required
                    </span>
                  </div>
                  <ICONS.ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${collapsedBuildSections.resolution ? '' : 'rotate-90'}`} />
                </div>
                {!collapsedBuildSections.resolution && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <div className="px-5 py-3 bg-amber-50/20 border-b border-amber-50">
                      <p className="text-[10px] font-medium text-slate-600 leading-relaxed">
                        This resolution determines the final status of the step.
                      </p>
                    </div>
                    <div className="p-4 grid grid-cols-12 gap-6 bg-white">
                      <div className="col-span-3 flex flex-col gap-2">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">OUTCOME</span>
                        <div className="flex flex-col gap-1.5">
                          <button 
                            onClick={() => setResOutcome('PASSED')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all font-black uppercase text-[9px] ${resOutcome === 'PASSED' ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-emerald-200 hover:bg-emerald-50/20'}`}
                          >
                            Mark as pass
                          </button>
                          <button 
                            onClick={() => setResOutcome('FAILED')}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all font-black uppercase text-[9px] ${resOutcome === 'FAILED' ? 'bg-rose-600 border-rose-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-rose-200 hover:bg-rose-50/20'}`}
                          >
                            Mark as fail
                          </button>
                        </div>
                      </div>
                      <div className="col-span-9 flex flex-col gap-2">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ENGINEERING JUSTIFICATION</span>
                        <textarea 
                          value={resolutionReason}
                          onChange={(e) => setResolutionReason(e.target.value)}
                          placeholder="Detail reason for manual override..."
                          className="flex-1 w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-[11px] font-medium outline-none focus:ring-1 focus:ring-brand focus:bg-white transition-all resize-none min-h-[90px] shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="px-5 py-2.5 border-t border-slate-50 bg-slate-50/30 flex justify-end">
                       <button 
                          onClick={handleSubmitResolution}
                          disabled={!resolutionReason || !resOutcome}
                          className="px-6 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed"
                       >
                         Submit Resolution
                       </button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {(isDiscovery || isSubmission) && (
              <div className="bg-white rounded-xl border border-slate-200 min-h-[400px] flex flex-col items-center justify-center p-12 animate-in zoom-in-95 duration-700">
                <div className={`w-20 h-20 mb-8 flex items-center justify-center rounded-full bg-blue-50 border border-blue-100 text-blue-600 shadow-xl ${isDiscovery ? 'animate-pulse' : 'animate-bounce-y'}`}>
                  {isDiscovery ? <ICONS.Search className="w-10 h-10" /> : <ICONS.Download className="w-10 h-10 rotate-180" />}
                </div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-[0.2em] mb-4">
                  {isDiscovery ? 'DISCOVERY IN PROGRESS' : 'SUBMITTING TO NGA'}
                </h3>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest text-center max-w-xl leading-relaxed px-4">
                  {isDiscovery 
                    ? "We're currently scanning for available tests. This process may take a moment to complete. Please wait while we prepare your tests..." 
                    : "We're submitting your tests to the NGA. This process may take anywhere from a few seconds to ~15 minutes. Please wait while we prepare your tests..."
                  }
                </p>
                <div className="mt-10 w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand animate-indeterminate-progress" />
                </div>
              </div>
            )}

            {(isReview || isExecution || isResult || isDone) && (
              <>
                {(isExecution || isResult || isDone) && (
                  <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div onClick={() => toggleBuildSection('heatMap')} className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 cursor-pointer">
                      <div className="flex items-center gap-3"><div className="w-1 h-3 bg-indigo-500 rounded-full" /><span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Test Goal × Platform Configuration Matrix</span></div>
                      <ICONS.ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${collapsedBuildSections.heatMap ? '' : 'rotate-90'}`} />
                    </div>
                    {!collapsedBuildSections.heatMap && renderAggregationMatrix()}
                  </section>
                )}

                <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div onClick={() => toggleBuildSection('testMatrix')} className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 cursor-pointer group/header">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-3 bg-brand rounded-full" />
                      <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
                        Testlines {matrixFilter && `(Filtered)`}
                      </span>
                      {isReview && (
                        <span className="px-2.5 py-1 bg-orange-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-sm">
                          Check before continuing
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                          onClick={(e) => { e.stopPropagation(); setIsTestMatrixFullView(true); }}
                          className="px-2 py-1 bg-slate-100 hover:bg-brand hover:text-white rounded text-[8px] font-black uppercase transition-all flex items-center gap-1 opacity-0 group-hover/header:opacity-100"
                       >
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                         Expand Review View
                       </button>
                       <ICONS.ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${collapsedBuildSections.testMatrix ? '' : 'rotate-90'}`} />
                    </div>
                  </div>
                  {!collapsedBuildSections.testMatrix && (
                    <div className="h-[440px]">
                      {renderTestMatrixContent()}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderWorkflowRunView = () => {
    return (
      <div className="h-full flex flex-col bg-[#f5f7f9] overflow-hidden">
        <header className="px-8 py-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-0.5">
              <h1 className="text-[17px] font-black text-slate-800 tracking-tight">Foo_2025_12_17_14_21_30</h1>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[8px] font-black uppercase ring-1 ring-emerald-200/50 shadow-sm">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> ACTIVE
              </div>
            </div>
            <div className="flex items-center gap-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              <span>TRIGGERED BY <span className="text-slate-600 font-black uppercase">JD Dayan, Roni</span></span>
              <span>• RUN ID <span className="text-slate-600 mono font-black">507</span></span>
            </div>
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden">
          {!isTestMatrixFullView && (
            <aside className={`transition-all duration-300 border-r border-slate-200 bg-white flex flex-col shrink-0 z-10 ${isWorkflowSidebarCollapsed ? 'w-20' : 'w-[280px]'}`}>
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                {!isWorkflowSidebarCollapsed && <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">WORKFLOW STEPS</h2>}
                <button onClick={() => setIsWorkflowSidebarCollapsed(!isWorkflowSidebarCollapsed)} className="p-1.5 hover:bg-slate-50 rounded text-slate-400">
                  <svg className={`w-4 h-4 transition-transform ${isWorkflowSidebarCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar bg-slate-50/20">
                {MOCK_WORKFLOW_STEPS.map(step => (
                  <button 
                    key={step.id} 
                    onClick={() => { setSelectedStepId(step.id); setIsTestMatrixFullView(false); }} 
                    className={`group w-full text-left px-3 py-2 rounded-lg border transition-all flex items-center justify-between ${selectedStepId === step.id ? 'bg-white border-blue-200 shadow-sm text-blue-700 font-bold' : 'border-transparent text-slate-500 hover:bg-white hover:border-slate-100'}`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${step.status === 'Success' ? 'bg-emerald-100 text-emerald-600' : step.status === 'In progress' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                        {step.status === 'Success' ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <div className="w-1.5 h-1.5 bg-current rounded-full" />}
                      </div>
                      {!isWorkflowSidebarCollapsed && <span className="text-[10px] uppercase tracking-tight truncate">{step.name}</span>}
                    </div>
                  </button>
                ))}
              </div>
            </aside>
          )}
          <main className="flex-1 overflow-hidden relative bg-slate-50/30 px-10 py-6">
             {(() => {
                const step = MOCK_WORKFLOW_STEPS.find(s => s.id === selectedStepId);
                if (step?.type === 'UP' || step?.type === 'IFWI') return renderQuickBuildStepView();
                if (step?.type === 'TEST') return renderTestStepView();
                return <div className="p-20 text-center"><h1 className="text-slate-400 font-black tracking-widest uppercase">CONTENT UNAVAILABLE</h1></div>;
             })()}
          </main>
        </div>
      </div>
    );
  };

  const renderContent = () => (
    <main className="p-8 flex flex-col items-center justify-center min-h-[500px]">
      <ICONS.VDCLogo className="w-16 h-16 opacity-10 mb-6" />
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">CONTEXT__{activeTab}__UNAVAILABLE</p>
    </main>
  );

  const toggleBuildSection = (section: string) => setCollapsedBuildSections(prev => ({ ...prev, [section]: !prev[section] }));

  const PaginationControls: React.FC<{ page: number; total: number; onPageChange: (p: number) => void; count: number; perPage: number }> = ({ page, total, onPageChange, count, perPage }) => (
    <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/20 shrink-0 mt-auto">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        Showing <span className="text-slate-800">{(page - 1) * perPage + 1}</span> to <span className="text-slate-800">{Math.min(page * perPage, count)}</span> of <span className="text-slate-800">{count}</span>
      </div>
      <div className="flex items-center gap-1">
        <button disabled={page === 1} onClick={() => onPageChange(Math.max(1, page - 1))} className={`p-1.5 rounded border border-slate-200 transition-all ${page === 1 ? 'opacity-30 cursor-not-allowed bg-slate-50' : 'hover:bg-white hover:text-brand'}`}>
          <svg className="w-3.5 h-3.5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
        </button>
        <div className="flex items-center gap-0.5 mx-2">
           {Array.from({ length: Math.min(5, total) }, (_, i) => i + 1).map(p => (
             <button key={p} onClick={() => onPageChange(p)} className={`w-7 h-7 flex items-center justify-center rounded text-[10px] font-black transition-all ${page === p ? 'bg-brand text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>{p}</button>
           ))}
        </div>
        <button disabled={page === total || total === 0} onClick={() => onPageChange(Math.min(total, page + 1))} className={`p-1.5 rounded border border-slate-200 transition-all ${page === total || total === 0 ? 'opacity-30 cursor-not-allowed bg-slate-50' : 'hover:bg-white hover:text-brand'}`}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white selection:bg-blue-100 selection:text-blue-900">
      <SidebarTier1 activeContext={nav.activeContext} onContextChange={(ctx) => setNav(p => ({ ...p, activeContext: ctx }))} />
      <SidebarTier2 
        activeContext={nav.activeContext} 
        activeProject={activeProject} 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        onProjectSelect={(p) => setNav(prev => ({ ...prev, activeProjectId: p.id }))} 
        onProjectDeselect={() => setNav(p => ({ ...p, activeProjectId: null }))} 
        expanded={nav.sidebarExpanded} 
        onToggle={() => setNav(p => ({ ...p, sidebarExpanded: !p.sidebarExpanded }))} 
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header activeContext={nav.activeContext} activeProject={activeProject} activeTab={isTestMatrixFullView ? "Execution Matrix Review" : activeTab} onToggleSidebar={() => setNav(p => ({ ...p, sidebarExpanded: !p.sidebarExpanded }))} isSidebarExpanded={nav.sidebarExpanded} />
        <div className="flex-1 overflow-hidden">
           {activeTab === 'Quick Builds' || activeTab === 'Workflows' ? renderWorkflowRunView() : renderContent()}
        </div>
        <div className="h-6 bg-slate-900 flex items-center px-4 justify-between border-t border-slate-800 text-[9px] font-black tracking-widest text-slate-500 uppercase shrink-0">
           <div className="flex items-center gap-5"><span><div className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block mr-1.5 shadow-[0_0_8px_rgba(34,197,94,0.6)]" /> API ACTIVE</span></div>
           <div className="mono text-slate-400 tracking-tighter">BUILD v4.14.0 // {new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    </div>
  );
};

export default App;