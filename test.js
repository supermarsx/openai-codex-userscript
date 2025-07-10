const { JSDOM } = require('jsdom');
const fs = require('fs');
const script = fs.readFileSync('./openai-codex.user.js', 'utf8');

async function runTest(html, edits = 0) {
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
  dom.window.prompt = () => 'Test suggestion';
  dom.window.eval(script);
  await new Promise(r => dom.window.setTimeout(r, 0));
  const dropdown = dom.window.document.getElementById('gpt-prompt-suggest-dropdown');
  if (edits > 0) {
    const gear = dom.window.document.getElementById('gpt-settings-gear');
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
})();
