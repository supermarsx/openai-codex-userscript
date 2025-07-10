import { loadJSON, saveJSON } from '../lib/storage';

export interface Options {
  theme: string | null;
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
}

export const DEFAULT_OPTIONS: Options = {
  theme: null,
  hideHeader: false,
  hideDocs: false,
  hideLogoText: false,
  hideLogoImage: false,
  hideProfile: false,
  hideEnvironments: false,
  autoCheckUpdates: true,
  showRepoSidebar: true,
  showVersionSidebar: true,
  clearClosedBranches: false,
  clearMergedBranches: false,
  clearOpenBranches: false,
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
