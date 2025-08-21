import test from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
function loadHistory() {
  const path = require.resolve('../src/helpers/history');
  delete require.cache[path];
  return require(path) as typeof import('../src/helpers/history');
}

test('addToHistory respects limit and trims input', { concurrency: false }, () => {
  const dom = new JSDOM('', { url: 'https://example.com' });
  (globalThis as any).localStorage = dom.window.localStorage;

  dom.window.localStorage.setItem('gpt-script-options', JSON.stringify({ historyLimit: 2 }));

  const { addToHistory } = loadHistory();
  let list: string[] = [];
  list = addToHistory(list, ' first ');
  list = addToHistory(list, 'second');
  list = addToHistory(list, 'third');
  assert.deepStrictEqual(list, ['third', 'second']);
});

test('addToHistory can be disabled', { concurrency: false }, () => {
  const dom = new JSDOM('', { url: 'https://example.com' });
  (globalThis as any).localStorage = dom.window.localStorage;

  dom.window.localStorage.setItem('gpt-script-options', JSON.stringify({ disableHistory: true }));

  const { addToHistory } = loadHistory();
  let list: string[] = [];
  list = addToHistory(list, 'test');
  assert.deepStrictEqual(list, []);
});

