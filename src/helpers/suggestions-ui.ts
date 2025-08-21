// @ts-nocheck
export interface SuggestionsUIHandlers {
  save(list: string[]): void;
  refresh(): void;
}

export function renderSuggestionsUI(
  wrap: HTMLElement,
  suggestions: string[],
  handlers: SuggestionsUIHandlers
): void {
  wrap.innerHTML = '<h3 class="mb-1">Prompt Suggestions</h3>';

  const table = document.createElement('table');
  table.className = 'w-full text-sm';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const textHead = document.createElement('th');
  textHead.textContent = 'Suggestion';
  textHead.className = 'text-left';
  const actionsHead = document.createElement('th');
  actionsHead.textContent = 'Actions';
  headerRow.appendChild(textHead);
  headerRow.appendChild(actionsHead);
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  suggestions.forEach((s, i) => {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    const actions = document.createElement('td');
    actions.className = 'space-x-1';

    let editing = false;

    const editBtn = document.createElement('button');
    editBtn.className = 'btn relative btn-secondary btn-small';
    editBtn.textContent = 'Edit';
    editBtn.dataset.testid = `suggestion-edit-${i}`;

    const delBtn = document.createElement('button');
    delBtn.className = 'btn relative btn-secondary btn-small';
    delBtn.textContent = 'Remove';

    function renderRow() {
      cell.innerHTML = '';
      actions.innerHTML = '';
      if (editing) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = s;
        input.className = 'input input-sm w-full';
        input.dataset.testid = 'suggestion-edit-input';
        cell.appendChild(input);

        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn relative btn-primary btn-small';
        saveBtn.textContent = 'Save';
        saveBtn.dataset.testid = 'suggestion-save';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn relative btn-secondary btn-small';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.dataset.testid = 'suggestion-cancel';

        actions.appendChild(saveBtn);
        actions.appendChild(cancelBtn);

        saveBtn.addEventListener('click', () => {
          const val = input.value.trim();
          const duplicate = suggestions.some((v, idx) => idx !== i && v === val);
          if (!val || duplicate) {
            input.classList.add('border-red-500');
            return;
          }
          suggestions[i] = val;
          handlers.save(suggestions);
          renderSuggestionsUI(wrap, suggestions, handlers);
          handlers.refresh();
        });

        cancelBtn.addEventListener('click', () => {
          editing = false;
          renderRow();
        });
      } else {
        cell.textContent = s;
        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
      }
    }

    editBtn.addEventListener('click', () => {
      editing = true;
      renderRow();
    });

    delBtn.addEventListener('click', () => {
      suggestions.splice(i, 1);
      handlers.save(suggestions);
      renderSuggestionsUI(wrap, suggestions, handlers);
      handlers.refresh();
    });

    renderRow();

    row.appendChild(cell);
    row.appendChild(actions);
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  wrap.appendChild(table);

  const addWrap = document.createElement('div');
  addWrap.className = 'flex gap-2 mt-2';

  const addInput = document.createElement('input');
  addInput.type = 'text';
  addInput.placeholder = 'New suggestion';
  addInput.className = 'input input-sm flex-1';
  addInput.dataset.testid = 'suggestion-add-input';

  const addBtn = document.createElement('button');
  addBtn.className = 'btn relative btn-secondary btn-small';
  addBtn.textContent = 'Add';
  addBtn.dataset.testid = 'suggestion-add-button';

  addBtn.addEventListener('click', () => {
    const val = addInput.value.trim();
    const duplicate = suggestions.includes(val);
    if (!val || duplicate) {
      addInput.classList.add('border-red-500');
      return;
    }
    suggestions.push(val);
    handlers.save(suggestions);
    renderSuggestionsUI(wrap, suggestions, handlers);
    handlers.refresh();
  });

  addWrap.appendChild(addInput);
  addWrap.appendChild(addBtn);
  wrap.appendChild(addWrap);

  const exportBtn = document.createElement('button');
  exportBtn.className = 'btn relative btn-secondary btn-small';
  exportBtn.textContent = 'Export';
  exportBtn.addEventListener('click', () => {
    try {
      const blob = new Blob([JSON.stringify(suggestions, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'suggestions.json';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      console.error('Failed to export suggestions', e);
      window.alert('Failed to export suggestions');
    }
  });
  wrap.appendChild(exportBtn);

  const importBtn = document.createElement('button');
  importBtn.className = 'btn relative btn-secondary btn-small';
  importBtn.textContent = 'Import';
  importBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(String(reader.result));
          if (Array.isArray(data)) {
            const list = Array.from(
              new Set(
                data
                  .map((d) => String(d).trim())
                  .filter((s) => s.length > 0)
              )
            );
            if (list.length > 0) {
              suggestions.splice(0, suggestions.length, ...list);
              handlers.save(suggestions);
              renderSuggestionsUI(wrap, suggestions, handlers);
              handlers.refresh();
            } else {
              window.alert('Invalid suggestions file');
            }
          } else {
            window.alert('Invalid suggestions file');
          }
        } catch (err) {
          console.error('Failed to import suggestions', err);
          window.alert('Failed to import suggestions');
        }
      };
      reader.readAsText(file);
    });
    input.click();
  });
  wrap.appendChild(importBtn);
}

