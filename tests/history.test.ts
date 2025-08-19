import test from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
import { addToHistory } from '../src/helpers/history';

test('addToHistory respects limit and trims input', { concurrency: false }, () => {
  const dom = new JSDOM('', { url: 'https://example.com' });
  (globalThis as any).localStorage = dom.window.localStorage;

  dom.window.localStorage.setItem('gpt-script-options', JSON.stringify({ historyLimit: 2 }));

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

  let list: string[] = [];
  list = addToHistory(list, 'test');
  assert.deepStrictEqual(list, []);
});

