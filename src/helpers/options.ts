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

export function loadOptions(): Options {
  const opts = loadJSON<Options>(STORAGE_KEY, DEFAULT_OPTIONS);
  const anyOpts: any = opts;
  if ('dark' in anyOpts && !('theme' in anyOpts)) {
    anyOpts.theme = anyOpts.dark ? 'dark' : 'light';
  }
  return { ...DEFAULT_OPTIONS, ...opts };
}

export function saveOptions(opts: Options): void {
  saveJSON(STORAGE_KEY, opts);
}
