# openai-codex-userscript
OpenAI Codex userscript

OpenAI Codex UI Enhancer

**[[INSTALL USERSCRIPT]](https://github.com/supermarsx/openai-codex-userscript/raw/refs/heads/main/openai-codex.user.js)**

The dropdown suggestions can be customised by clicking the gear icon next to the
dropdown. The list is stored in your browser's `localStorage` so your changes
persist across sessions.

The script locates the ChatGPT prompt input using a set of fallback selectors:
1. `#prompt-textarea`
2. `[data-testid="prompt-textarea"]`
3. The first `.ProseMirror` editor element

If the page structure changes, update the `findPromptInput` function in
`openai-codex.user.js` accordingly.
