// @ts-nocheck
import test from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
import { renderSuggestionsUI } from '../src/helpers/suggestions-ui';

test('adds suggestion via inline form', { concurrency: false }, () => {
  const dom = new JSDOM('<div id="wrap"></div>');
  (globalThis as any).window = dom.window;
  (globalThis as any).document = dom.window.document;
  const wrap = dom.window.document.getElementById('wrap');
  const suggestions = ['foo'];
  let saved = [];
  renderSuggestionsUI(wrap, suggestions, {
    save: (list) => { saved = list.slice(); },
    refresh: () => {},
  });
  const input = wrap.querySelector('[data-testid="suggestion-add-input"]');
  input.value = 'bar';
  wrap.querySelector('[data-testid="suggestion-add-button"]').dispatchEvent(new dom.window.Event('click'));
  assert.deepStrictEqual(suggestions, ['foo', 'bar']);
  assert.deepStrictEqual(saved, ['foo', 'bar']);
});

test('edits suggestion inline with validation', { concurrency: false }, () => {
  const dom = new JSDOM('<div id="wrap"></div>');
  (globalThis as any).window = dom.window;
  (globalThis as any).document = dom.window.document;
  const wrap = dom.window.document.getElementById('wrap');
  const suggestions = ['foo', 'bar'];
  renderSuggestionsUI(wrap, suggestions, { save: () => {}, refresh: () => {} });
  wrap.querySelector('[data-testid="suggestion-edit-0"]').dispatchEvent(new dom.window.Event('click'));
  const editInput = wrap.querySelector('[data-testid="suggestion-edit-input"]');
  const saveBtn = wrap.querySelector('[data-testid="suggestion-save"]');
  // attempt duplicate
  editInput.value = 'bar';
  saveBtn.dispatchEvent(new dom.window.Event('click'));
  assert.deepStrictEqual(suggestions, ['foo', 'bar']);
  // valid edit
  editInput.value = 'baz';
  saveBtn.dispatchEvent(new dom.window.Event('click'));
  assert.deepStrictEqual(suggestions, ['baz', 'bar']);
});
