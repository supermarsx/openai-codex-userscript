import { loadJSON, saveJSON } from '../lib/storage';

export interface Options {
  theme: string | null;
  font: 'serif' | 'sans-serif' | 'monospace' | 'custom';
  customFont: string;
  hideHeader: boolean;
  hideDocs: boolean;
  hideLogoText: boolean;
  hideLogoImage: boolean;
  hideProfile: boolean;
  hideEnvironments: boolean;
  threeColumnMode: boolean;
  autoCheckUpdates: boolean;
  showRepoSidebar: boolean;
  showVersionSidebar: boolean;
  clearClosedBranches: boolean;
  clearMergedBranches: boolean;
  clearOpenBranches: boolean;
  autoArchiveMerged: boolean;
  autoArchiveClosed: boolean;
  historyLimit: number;
  disableHistory: boolean;
  repoSidebarX: number | null;
  repoSidebarY: number | null;
  repoSidebarWidth: number | null;
  repoSidebarHeight: number | null;
  versionSidebarX: number | null;
  versionSidebarY: number | null;
  versionSidebarWidth: number | null;
  versionSidebarHeight: number | null;
}

export const DEFAULT_OPTIONS: Options = {
  theme: null,
  font: 'sans-serif',
  customFont: '',
  hideHeader: false,
  hideDocs: false,
  hideLogoText: false,
  hideLogoImage: false,
  hideProfile: false,
  hideEnvironments: false,
  threeColumnMode: false,
  autoCheckUpdates: false,
  showRepoSidebar: true,
  showVersionSidebar: true,
  clearClosedBranches: false,
  clearMergedBranches: false,
  clearOpenBranches: false,
  autoArchiveMerged: false,
  autoArchiveClosed: false,
  historyLimit: 50,
  disableHistory: false,
  repoSidebarX: null,
  repoSidebarY: null,
  repoSidebarWidth: null,
  repoSidebarHeight: null,
  versionSidebarX: null,
  versionSidebarY: null,
  versionSidebarWidth: null,
  versionSidebarHeight: null,
};

const STORAGE_KEY = 'gpt-script-options';

const FONT_VALUES = ['serif', 'sans-serif', 'monospace', 'custom'] as const;
const isBool = (v: any): v is boolean => typeof v === 'boolean';
const isNum = (v: any): v is number => typeof v === 'number' && !isNaN(v);
const isNumOrNull = (v: any): v is number | null => v === null || isNum(v);

const validators: { [K in keyof Options]: (val: any) => boolean } = {
  theme: (v) => v === null || typeof v === 'string',
  font: (v) => FONT_VALUES.includes(v),
  customFont: (v) => typeof v === 'string',
  hideHeader: isBool,
  hideDocs: isBool,
  hideLogoText: isBool,
  hideLogoImage: isBool,
  hideProfile: isBool,
  hideEnvironments: isBool,
  threeColumnMode: isBool,
  autoCheckUpdates: isBool,
  showRepoSidebar: isBool,
  showVersionSidebar: isBool,
  clearClosedBranches: isBool,
  clearMergedBranches: isBool,
  clearOpenBranches: isBool,
  autoArchiveMerged: isBool,
  autoArchiveClosed: isBool,
  historyLimit: isNum,
  disableHistory: isBool,
  repoSidebarX: isNumOrNull,
  repoSidebarY: isNumOrNull,
  repoSidebarWidth: isNumOrNull,
  repoSidebarHeight: isNumOrNull,
  versionSidebarX: isNumOrNull,
  versionSidebarY: isNumOrNull,
  versionSidebarWidth: isNumOrNull,
  versionSidebarHeight: isNumOrNull,
};

export function loadOptions(): Options {
  const raw = loadJSON<Record<string, any>>(STORAGE_KEY, {});
  if ('dark' in raw && typeof (raw as any).dark === 'boolean' && !('theme' in raw)) {
    (raw as any).theme = (raw as any).dark ? 'dark' : 'light';
  }
  const cleaned: Partial<Options> = {};
  for (const key in validators) {
    const val = (raw as any)[key];
    if (validators[key](val)) {
      (cleaned as any)[key] = val;
    }
  }
  return { ...DEFAULT_OPTIONS, ...cleaned };
}

export function saveOptions(opts: Options): void {
  saveJSON(STORAGE_KEY, opts);
}
