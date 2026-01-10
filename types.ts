
export enum AppContextType {
  GLOBAL = 'GLOBAL',
  PERSONAL = 'PERSONAL',
  PROJECT = 'PROJECT'
}

export interface Project {
  id: string;
  name: string;
  codeName: string;
  lastAccessed: string;
}

export interface NavState {
  activeTabId: string;
  scrollPosition: number;
}

export interface ContextState {
  [key: string]: NavState;
}

export interface NavigationContext {
  activeContext: AppContextType;
  activeProjectId: string | null;
  sidebarExpanded: boolean;
  history: ContextState;
}
