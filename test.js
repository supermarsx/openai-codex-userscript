const { JSDOM } = require('jsdom');
const fs = require('fs');
const script = fs.readFileSync('./openai-codex.user.js', 'utf8');

function createDom(html) {
  const dom = new JSDOM(html, {
    url: 'https://chatgpt.com/codex',
    runScripts: 'dangerously',
    resources: 'usable'
  });
  dom.window.prompt = () => 'Test suggestion';
  return dom;
}

async function runTest(html, edits = 0) {
  const dom = createDom(html);
  dom.window.eval(script);
  await new Promise(r => dom.window.setTimeout(r, 0));
  const dropdown = dom.window.document.getElementById('gpt-prompt-suggest-dropdown');
  if (edits > 0) {
      const gear = dom.window.document.getElementById('gpt-settings-btn');
    for (let i = 0; i < edits; i++) {
      gear.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
      await new Promise(r => dom.window.setTimeout(r, 0));
      const addBtn = dom.window.document.querySelector('#gpt-settings-suggestions button');
      addBtn.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
      await new Promise(r => dom.window.setTimeout(r, 0));
      dom.window.document.getElementById('gpt-settings-close').dispatchEvent(new dom.window.Event('click', { bubbles: true }));
      await new Promise(r => dom.window.setTimeout(r, 0));
    }
  }
  const firstOption = dropdown.options[1].value;
  dropdown.value = firstOption;
  dropdown.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  return dom.window;
}

(async () => {
  const textareaHtml = `<div class="flex-col items-center"><textarea id="prompt-textarea"></textarea></div>`;
  const w1 = await runTest(textareaHtml, 3);
  console.log('Textarea wrappers:', w1.document.querySelectorAll('.grid.w-full.gap-1\\.5').length);
  console.log('Textarea result:', w1.document.getElementById('prompt-textarea').value);

  const divHtml = `<div class="flex-col items-center"><div id="prompt-textarea" contenteditable="true"></div></div>`;
  const w2 = await runTest(divHtml, 2);
  console.log('Contenteditable wrappers:', w2.document.querySelectorAll('.grid.w-full.gap-1\\.5').length);
  console.log('Contenteditable result:', w2.document.getElementById('prompt-textarea').textContent);

  const taskHtml = `<div><span data-testid="task-status">Merged</span><button id="archive-btn">Archive</button></div>`;
  const dom1 = createDom(taskHtml);
  let mergedClicked = false;
  dom1.window.document.getElementById('archive-btn').addEventListener('click', () => mergedClicked = true);
  dom1.window.eval(script);
  await new Promise(r => dom1.window.setTimeout(r, 0));
  console.log('Merged auto-archive:', mergedClicked);

  const taskDom = createDom(`<div><span data-testid="task-status">Open</span><button id="archive-btn">Archive</button></div>`);
  let closedClicked = false;
  taskDom.window.document.getElementById('archive-btn').addEventListener('click', () => closedClicked = true);
  taskDom.window.eval(script);
  await new Promise(r => taskDom.window.setTimeout(r, 0));
  taskDom.window.document.querySelector('[data-testid="task-status"]').textContent = 'Closed';
  await new Promise(r => taskDom.window.setTimeout(r, 0));
  console.log('Closed auto-archive:', closedClicked);

  const settingsHtml = `<h1 class="mb-4 pt-4 text-2xl">What are we coding next?</h1><a href="#">Docs</a>`;
  const settingsDom = createDom(settingsHtml);
  settingsDom.window.eval(script);
  await new Promise(r => settingsDom.window.setTimeout(r, 0));
    const gear2 = settingsDom.window.document.getElementById('gpt-settings-btn');
  gear2.dispatchEvent(new settingsDom.window.Event('click', { bubbles: true }));
  await new Promise(r => settingsDom.window.setTimeout(r, 0));
  const themeSelect = settingsDom.window.document.getElementById('gpt-setting-theme');
  themeSelect.value = 'dark';
  themeSelect.dispatchEvent(new settingsDom.window.Event('change', { bubbles: true }));
  await new Promise(r => settingsDom.window.setTimeout(r, 0));
  const headerCb = settingsDom.window.document.getElementById('gpt-setting-header');
  headerCb.checked = true;
  headerCb.dispatchEvent(new settingsDom.window.Event('change', { bubbles: true }));
  await new Promise(r => settingsDom.window.setTimeout(r, 0));
  const docsCb = settingsDom.window.document.getElementById('gpt-setting-docs');
  docsCb.checked = true;
  docsCb.dispatchEvent(new settingsDom.window.Event('change', { bubbles: true }));
  await new Promise(r => settingsDom.window.setTimeout(r, 0));
  const rootClasses = settingsDom.window.document.documentElement.classList;
  console.log('Dark theme applied:', rootClasses.contains('userscript-force-dark') && rootClasses.contains('dark'));
  const headerHidden = settingsDom.window.document.querySelector('h1').style.display === 'none';
  console.log('Header hidden:', headerHidden);
  const docsLink = Array.from(settingsDom.window.document.querySelectorAll('a')).find(a => a.textContent.includes('Docs'));
  const docsHidden = docsLink && docsLink.style.display === 'none';
  console.log('Docs hidden:', docsHidden);

  const clearHtml = `
    <button class="arch" id="c1"><span data-state="closed"></span>Archive</button>
    <button class="arch" id="o1"><span data-state="open"></span>Archive</button>
    <button class="arch" id="m1">Merged</button>`;
  const clearDom = createDom(clearHtml);
  let closedCount = 0;
  let mergedCount = 0;
  clearDom.window.document.getElementById('c1').addEventListener('click', () => closedCount++);
  clearDom.window.document.getElementById('m1').addEventListener('click', () => mergedCount++);
  clearDom.window.eval(script);
  await new Promise(r => clearDom.window.setTimeout(r, 0));
  clearDom.window.document.getElementById('gpt-clear-closed').dispatchEvent(new clearDom.window.Event('click', { bubbles: true }));
  await new Promise(r => clearDom.window.setTimeout(r, 800));
  console.log('Bulk closed clicks:', closedCount);
  clearDom.window.document.getElementById('gpt-clear-merged').dispatchEvent(new clearDom.window.Event('click', { bubbles: true }));
  await new Promise(r => clearDom.window.setTimeout(r, 800));
  console.log('Bulk merged clicks:', mergedCount);
})();
