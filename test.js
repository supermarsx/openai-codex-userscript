const { JSDOM } = require('jsdom');
const fs = require('fs');
const script = fs.readFileSync('./openai-codex.user.js', 'utf8');

async function runTest(html) {
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
  dom.window.eval(script);
  await new Promise(r => dom.window.setTimeout(r, 0));
  const prompt = dom.window.document.getElementById('prompt-textarea');
  let inputTriggered = false;
  prompt.addEventListener('input', () => { inputTriggered = true; });
  const dropdown = dom.window.document.getElementById('gpt-prompt-suggest-dropdown');
  const firstOption = dropdown.options[1].value;
  dropdown.value = firstOption;
  dropdown.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  return { window: dom.window, inputTriggered };
}

(async () => {
  const textareaHtml = `<div class="flex-col items-center"><textarea id="prompt-textarea"></textarea></div>`;
  const res1 = await runTest(textareaHtml);
  console.log('Textarea result:', res1.window.document.getElementById('prompt-textarea').value, 'input event:', res1.inputTriggered);

  const divHtml = `<div class="flex-col items-center"><div id="prompt-textarea" contenteditable="true"></div></div>`;
  const res2 = await runTest(divHtml);
  console.log('Contenteditable result:', res2.window.document.getElementById('prompt-textarea').textContent, 'input event:', res2.inputTriggered);
})();
