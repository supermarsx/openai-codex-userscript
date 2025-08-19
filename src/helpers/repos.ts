export function parseRepoNames(list?: string | string[]): string[] {
  const set = new Set<string>();

  if (Array.isArray(list)) {
    list.forEach(name => {
      name = name.trim();
      if (name) set.add(name);
    });
  } else if (typeof list === 'string') {
    list.split(/[\,\n]+/).forEach(name => {
      name = name.trim();
      if (name) set.add(name);
    });
  }

  const env = document.querySelector(
    '[data-testid="environment-select"], [data-testid="environment-dropdown"], select[id*=environment], select[name*=environment]'
  );
  if (env) {
    env.querySelectorAll('option').forEach(opt => {
      const t = opt.textContent?.trim();
      if (t) set.add(t);
    });
  }

  const sidebar = document.querySelector(
    '[data-testid="repository-list"], [data-testid="repo-sidebar"], nav[aria-label*="Repos" i]'
  );
  if (sidebar) {
    sidebar.querySelectorAll('a, li').forEach(el => {
      const t = el.textContent?.trim();
      if (t) set.add(t);
    });
  }

  if (set.size === 0) {
    const text = document.body.textContent || '';
    const regex = /[\w.-]+\/[\w.-]+/g;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text))) set.add(m[0]);
  }

  return Array.from(set);
}

