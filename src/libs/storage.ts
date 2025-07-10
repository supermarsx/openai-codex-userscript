// Storage utilities

interface Options {
  dark: boolean;
  hideHeader: boolean;
  hideDocs: boolean;
}

const DEFAULT_SUGGESTIONS = [
  "Suggest code improvements and bugfixes.",
  "Suggest test coverage improvement tasks.",
  "Update documentation according to the current features and functionality.",
  "Suggest code refactor tasks.",
  "Refactor this function to use async/await."
];

const DEFAULT_OPTIONS: Options = {
  dark: false,
  hideHeader: false,
  hideDocs: false
};

var suggestions: string[];
var options: Options;

function loadOptions(): Options {
  try {
    const raw = localStorage.getItem('gpt-script-options');
    if (raw) {
      const data = JSON.parse(raw);
      return { ...DEFAULT_OPTIONS, ...data };
    }
  } catch (e) {
    console.error('Failed to load options', e);
  }
  return { ...DEFAULT_OPTIONS };
}

function saveOptions(obj: Options): void {
  try {
    localStorage.setItem('gpt-script-options', JSON.stringify(obj));
  } catch (e) {
    console.error('Failed to save options', e);
  }
}

function loadSuggestions(): string[] | null {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_SUGGESTIONS.slice();
  }
  try {
    const raw = localStorage.getItem('gpt-prompt-suggestions');
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (e) {
    console.error('Failed to load suggestions', e);
  }
  return null;
}

function saveSuggestions(list: string[]): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  try {
    localStorage.setItem('gpt-prompt-suggestions', JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save suggestions', e);
  }
}
