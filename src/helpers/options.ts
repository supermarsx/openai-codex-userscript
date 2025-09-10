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
  hideSettings: boolean;
  threeColumnMode: boolean;
  autoCheckUpdates: boolean;
  showStatsSidebar: boolean;
  showRepoSidebar: boolean;
  showVersionSidebar: boolean;
  clearClosedBranches: boolean;
  clearMergedBranches: boolean;
  clearOpenBranches: boolean;
  autoArchiveMerged: boolean;
  autoArchiveClosed: boolean;
  historyLimit: number;
  disableHistory: boolean;
  lastUpdateCheck: number;
  repoSidebarX: number | null;
  repoSidebarY: number | null;
  repoSidebarWidth: number | null;
  repoSidebarHeight: number | null;
  versionSidebarX: number | null;
  versionSidebarY: number | null;
  versionSidebarWidth: number | null;
  versionSidebarHeight: number | null;
  statsSidebarX: number | null;
  statsSidebarY: number | null;
  statsSidebarWidth: number | null;
  statsSidebarHeight: number | null;
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
  hideSettings: false,
  threeColumnMode: false,
  autoCheckUpdates: false,
  showStatsSidebar: false,
  showRepoSidebar: true,
  showVersionSidebar: true,
  clearClosedBranches: false,
  clearMergedBranches: false,
  clearOpenBranches: false,
  autoArchiveMerged: false,
  autoArchiveClosed: false,
  historyLimit: 50,
  disableHistory: false,
  lastUpdateCheck: 0,
  repoSidebarX: null,
  repoSidebarY: null,
  repoSidebarWidth: null,
  repoSidebarHeight: null,
  versionSidebarX: null,
  versionSidebarY: null,
  versionSidebarWidth: null,
  versionSidebarHeight: null,
  statsSidebarX: null,
  statsSidebarY: null,
  statsSidebarWidth: null,
  statsSidebarHeight: null,
};

const STORAGE_KEY = 'gpt-script-options';

const OPTION_VALIDATORS: { [K in keyof Options]: (v: unknown) => v is Options[K] } = {
  theme: (v): v is Options['theme'] => v === null || typeof v === 'string',
  font: (v): v is Options['font'] =>
    v === 'serif' || v === 'sans-serif' || v === 'monospace' || v === 'custom',
  customFont: (v): v is Options['customFont'] => typeof v === 'string',
  hideHeader: (v): v is Options['hideHeader'] => typeof v === 'boolean',
  hideDocs: (v): v is Options['hideDocs'] => typeof v === 'boolean',
  hideLogoText: (v): v is Options['hideLogoText'] => typeof v === 'boolean',
  hideLogoImage: (v): v is Options['hideLogoImage'] => typeof v === 'boolean',
  hideProfile: (v): v is Options['hideProfile'] => typeof v === 'boolean',
  hideSettings: (v): v is Options['hideSettings'] => typeof v === 'boolean',
  threeColumnMode: (v): v is Options['threeColumnMode'] => typeof v === 'boolean',
  autoCheckUpdates: (v): v is Options['autoCheckUpdates'] => typeof v === 'boolean',
  showStatsSidebar: (v): v is Options['showStatsSidebar'] => typeof v === 'boolean',
  showRepoSidebar: (v): v is Options['showRepoSidebar'] => typeof v === 'boolean',
  showVersionSidebar: (v): v is Options['showVersionSidebar'] => typeof v === 'boolean',
  clearClosedBranches: (v): v is Options['clearClosedBranches'] => typeof v === 'boolean',
  clearMergedBranches: (v): v is Options['clearMergedBranches'] => typeof v === 'boolean',
  clearOpenBranches: (v): v is Options['clearOpenBranches'] => typeof v === 'boolean',
  autoArchiveMerged: (v): v is Options['autoArchiveMerged'] => typeof v === 'boolean',
  autoArchiveClosed: (v): v is Options['autoArchiveClosed'] => typeof v === 'boolean',
  historyLimit: (v): v is Options['historyLimit'] => typeof v === 'number' && Number.isFinite(v),
  disableHistory: (v): v is Options['disableHistory'] => typeof v === 'boolean',
  lastUpdateCheck: (v): v is Options['lastUpdateCheck'] => typeof v === 'number' && Number.isFinite(v),
  repoSidebarX: (v): v is Options['repoSidebarX'] => (typeof v === 'number' && Number.isFinite(v)) || v === null,
  repoSidebarY: (v): v is Options['repoSidebarY'] => (typeof v === 'number' && Number.isFinite(v)) || v === null,
  repoSidebarWidth: (v): v is Options['repoSidebarWidth'] => (typeof v === 'number' && Number.isFinite(v)) || v === null,
  repoSidebarHeight: (v): v is Options['repoSidebarHeight'] => (typeof v === 'number' && Number.isFinite(v)) || v === null,
  versionSidebarX: (v): v is Options['versionSidebarX'] => (typeof v === 'number' && Number.isFinite(v)) || v === null,
  versionSidebarY: (v): v is Options['versionSidebarY'] => (typeof v === 'number' && Number.isFinite(v)) || v === null,
  versionSidebarWidth: (v): v is Options['versionSidebarWidth'] => (typeof v === 'number' && Number.isFinite(v)) || v === null,
  versionSidebarHeight: (v): v is Options['versionSidebarHeight'] => (typeof v === 'number' && Number.isFinite(v)) || v === null,
  statsSidebarX: (v): v is Options['statsSidebarX'] => (typeof v === 'number' && Number.isFinite(v)) || v === null,
  statsSidebarY: (v): v is Options['statsSidebarY'] => (typeof v === 'number' && Number.isFinite(v)) || v === null,
  statsSidebarWidth: (v): v is Options['statsSidebarWidth'] => (typeof v === 'number' && Number.isFinite(v)) || v === null,
  statsSidebarHeight: (v): v is Options['statsSidebarHeight'] => (typeof v === 'number' && Number.isFinite(v)) || v === null,
};

function sanitizeOptions(raw: Record<string, unknown>): Partial<Options> {
  const result: Partial<Options> = {};
  for (const key in OPTION_VALIDATORS) {
    const value = (raw as any)[key];
    if (OPTION_VALIDATORS[key as keyof Options](value)) {
      (result as any)[key] = value;
    }
  }
  return result;
}

export function loadOptions(): Options {
  const raw = loadJSON<Record<string, unknown>>(STORAGE_KEY, {});
  if ('dark' in raw && !('theme' in raw)) {
    raw.theme = (raw as any).dark ? 'dark' : 'light';
  }
  if ('hideEnvironments' in raw && !('hideSettings' in raw)) {
    (raw as any).hideSettings = (raw as any).hideEnvironments;
    delete (raw as any).hideEnvironments;
  }
  const opts = sanitizeOptions(raw);
  return { ...DEFAULT_OPTIONS, ...opts };
}

export function saveOptions(opts: Options): void {
  saveJSON(STORAGE_KEY, opts);
}
