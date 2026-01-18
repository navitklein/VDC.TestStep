
import React from 'react';

export const COLORS = {
  primary: '#0f6cbd',
  slate900: '#0f172a',
  slate800: '#1e293b',
  slate50: '#f8fafc',
};

export const MOCK_PROJECTS = [
  { id: 'p1', name: 'Meteor Lake-S', codeName: 'MTL-S', lastAccessed: '2h ago' },
  { id: 'p2', name: 'Lunar Lake-M', codeName: 'LNL-M', lastAccessed: '4h ago' },
  { id: 'p3', name: 'Arrow Lake-H', codeName: 'ARL-H', lastAccessed: '1d ago' },
  { id: 'p4', name: 'Panther Canyon', codeName: 'PAC-S', lastAccessed: '2d ago' },
];

export interface Knob {
  id: string;
  name: string;
  path: string;
  displayValue: string;
  rawValue: string;
  status: 'active' | 'warning' | 'error';
  isOverridden?: boolean;
}

const generateKnobs = (): Knob[] => {
  const overridden: Knob[] = [
    { id: 'k1', name: 'DfxDcsRxDfeGainCoefficient', path: 'Socket Configuration/Memory Configuration/Memory Dfx Configuration/DCS RX DFE Gain Coefficient', displayValue: '1: +6 dB', rawValue: '0x1', status: 'active', isOverridden: true },
    { id: 'k2', name: 'PchPcieRootPortMaxPayloadSizeSupportedExceeding...', path: 'Socket Configuration/PCH Configuration/PCI Express/Root Port Configuration/Advanced Error Reporting/Ca...', displayValue: '256 Bytes', rawValue: '0x1', status: 'active', isOverridden: true },
    { id: 'k3', name: 'PcieRootPort0L1Substates', path: 'Socket Configuration/PCH Configuration/PCI Express/Root Port 0', displayValue: 'L1.1', rawValue: '0x1', status: 'active', isOverridden: true },
    { id: 'k4', name: 'PcieRootPort0Speed', path: 'Socket Configuration/PCH Configuration/PCI Express/Root Port 0', displayValue: 'Auto', rawValue: '0x0', status: 'active', isOverridden: true },
    { id: 'k5', name: 'PcieRootPort1Aspm', path: 'Socket Configuration/PCH Configuration/PCI Express/Root Port 1', displayValue: 'Enabled', rawValue: '0x1', status: 'active', isOverridden: true },
    { id: 'k6', name: 'PcieRootPort1L1Substates', path: 'Socket Configuration/PCH Configuration/PCI Express/Root Port 1', displayValue: 'L1.1', rawValue: '0x1', status: 'active', isOverridden: true },
  ];

  const others: Knob[] = Array.from({ length: 94 }, (_, i) => ({
    id: `k-gen-${i}`,
    name: `Standard_Knob_Config_${i + 7}`,
    path: `Platform/General/Configuration/System/Params/Set_${i}`,
    displayValue: 'Default',
    rawValue: '0x0',
    status: 'active',
    isOverridden: false
  }));

  return [...overridden, ...others];
};

export const MOCK_KNOBS: Knob[] = generateKnobs();

export const MOCK_STRAPS = [
  { key: 'STRAP_PCIE_GEN_SEL', value: '0x3' },
  { key: 'STRAP_DEBUG_INTERFACE_EN', value: '0x1' },
];

export interface Ingredient {
  id: string;
  type: string;
  name: string;
  releasesCount: number;
  siliconFamily: string;
  segment?: string;
  step?: string;
  validation?: string;
  description?: string;
}

export const MOCK_INGREDIENTS: Ingredient[] = [
  { id: '1040', type: 'ACE-ROM-EXT', name: 'PTL_ACE_ROM_EXT_Release_Prod_ACE_ROM_EXT_0', releasesCount: 3, siliconFamily: 'PTL' },
  { id: '1019', type: 'AUNIT', name: 'PTL_AUNIT_Release_Prod_AUNIT_0', releasesCount: 8, siliconFamily: 'PTL' },
  { id: '1022', type: 'BIOS', name: 'PTL_BIOS_Release_Prod_BIOS_0', releasesCount: 12, siliconFamily: 'PTL' },
  { id: '1020', type: 'BIOS', name: 'PTL_BIOS_Release_Prod_BIOS_1', releasesCount: 2, siliconFamily: 'PTL' },
  { id: '1041', type: 'CNVI', name: 'PTL_CNVi_Release_Prod_CNVI_0', releasesCount: 1, siliconFamily: 'PTL' },
  { id: '1021', type: 'CSME', name: 'PTL_CSME_Release_Prod_CSME_0', releasesCount: 12, siliconFamily: 'PTL', description: 'No description provided' },
  { id: '1005', type: 'CSME', name: 'PTL_CSME_Release_Prod_CSME_1', releasesCount: 10, siliconFamily: 'PTL' },
  { id: '1006', type: 'EC', name: 'PTL_EC_Release_Prod_EC_0', releasesCount: 8, siliconFamily: 'PTL' },
  { id: '1016', type: 'IFWI', name: 'PTL_PR01_A0A0-XXXODCA_RPRF_SED0_11F7069A', releasesCount: 7, siliconFamily: 'PTL', segment: 'PTL-P' },
];

export interface Release {
  id: string;
  version: string;
  changedDeps: string;
  releasedBy: string;
  releasedDate: string;
  releasedWW: string;
  isModified?: boolean;
}

export const MOCK_RELEASES: Release[] = [
  { id: '1166', version: '2025.17.7.3', changedDeps: '0/0', releasedBy: 'Nagorski, Wojciech', releasedDate: '4/27/25 10:10 AM', releasedWW: '2025WW17.0' },
  { id: '1151', version: '2025.17.3.1', changedDeps: '0/0', releasedBy: 'Nagorski, Wojciech', releasedDate: '4/23/25 11:47 AM', releasedWW: '2025WW17.3' },
];

export const MOCK_BUILD_DEPS: Release[] = Array.from({ length: 50 }, (_, i) => ({
  id: `R${100 - i}`,
  version: `v${24 - Math.floor(i/5)}.${i % 10}.0`,
  changedDeps: `${i % 3}/${(i % 3) + 2}`,
  releasedBy: i % 2 === 0 ? 'System' : 'Admin',
  releasedDate: `${i + 1}d ago`,
  releasedWW: `WW25.${10 - (i % 10)}`,
  isModified: i % 3 === 0
}));

export interface WorkflowStep {
  id: string;
  name: string;
  status: 'Success' | 'In progress' | 'Pending' | 'Failed';
  type: 'UP' | 'IFWI' | 'TEST';
}

export const MOCK_WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 'step0', name: 'Unified Patch Build', status: 'Success', type: 'UP' },
  { id: 'step1', name: 'IFWI Build Phase 1', status: 'Success', type: 'IFWI' },
  { id: 'step2', name: 'IFWI Build Phase 2', status: 'Success', type: 'IFWI' },
  { id: 'step3', name: 'IFWI Build Phase 3', status: 'Success', type: 'IFWI' },
  { id: 'step4', name: 'IFWI Build Phase 4', status: 'In progress', type: 'IFWI' },
  { id: 'step5', name: 'IFWI Build Phase 5', status: 'Pending', type: 'IFWI' },
  { id: 'step6', name: 'Validation Test Run', status: 'Pending', type: 'TEST' },
];

export interface TestLine {
  id: string;
  name: string;
  sut: string;
  duration: string;
  status: 'Passed' | 'Failed' | 'Running' | 'Pending';
  included: boolean;
  goalName: string;
  hwConfig: string;
  swConfig: string;
}

const HW_CONFIGS = ['SBF1S2', 'SBF5S2', 'SBF3S2', 'SBF7S1', 'SBF8S1'];
const SW_CONFIGS = ['A', 'B', 'C', 'D', 'E', 'F'];
const GOAL_NAMES = ['Sanity_Memory_Memicals', 'coldWarmResetSolar', 'Sanity_Mesh_Pysec', 'Sanity_PCIE_Rocket'];

export const MOCK_TEST_LINES: TestLine[] = Array.from({ length: 450 }, (_, i) => ({
  id: `TL_${1000 + i}`,
  name: `perf_val_case_${i.toString().padStart(3, '0')}`,
  sut: `SUT_NODE_0${(i % 5) + 1}`,
  duration: `${(Math.random() * 5 + 1).toFixed(1)}s`,
  status: i < 300 ? 'Passed' : i < 350 ? 'Failed' : i < 400 ? 'Running' : 'Pending',
  included: true,
  goalName: GOAL_NAMES[i % GOAL_NAMES.length],
  hwConfig: HW_CONFIGS[i % HW_CONFIGS.length],
  swConfig: SW_CONFIGS[i % SW_CONFIGS.length],
}));

export const ICONS = {
  VDCLogo: (props: any) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="50" cy="50" r="48" fill="transparent" />
      <path d="M50 15C35 15 23 25 18 38C25 32 35 28 45 28C55 28 62 35 62 35C62 35 55 15 50 15Z" fill="#fcc43d" />
      <path d="M85 50C85 35 75 23 62 18C68 25 72 35 72 45C72 55 65 62 65 62C65 62 85 55 85 50Z" fill="white" />
      <path d="M50 85C65 85 77 75 82 62C75 68 65 72 55 72C45 72 38 65 38 65C38 65 45 85 50 85Z" fill="white" />
      <path d="M15 50C15 65 25 77 38 82C32 75 28 65 28 55C28 45 35 38 35 38C35 38 15 45 15 50Z" fill="white" />
    </svg>
  ),
  Global: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9-3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  Personal: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Project: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Search: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  ChevronRight: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Settings: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  ExternalLink: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ),
  MoreHorizontal: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
    </svg>
  ),
  Download: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Terminal: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Filter: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  Copy: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
    </svg>
  ),
  Star: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  Info: (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};
