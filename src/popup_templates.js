/* src/popup_templates.js */
import { getAllTemplates, removeTemplate } from './storage.js';

const tableBody = document.querySelector('#template-table tbody');
const backButton = document.getElementById('back-button');
const messageDiv = document.getElementById('template-message');

async function renderTemplates() {
  const templates = await getAllTemplates();
  tableBody.innerHTML = '';

  Object.entries(templates).forEach(([key, { content, updated }]) => {
    const tr = document.createElement('tr');

    // キーワード
    const tdKey = document.createElement('td');
    tdKey.textContent = key;

    // 置換する文
    const tdContent = document.createElement('td');
    const textarea = document.createElement('textarea');
    textarea.value = content;
    textarea.rows = 4;
    textarea.style.width = '100%';
    tdContent.appendChild(textarea);

    // 最終更新
    const tdUpdated = document.createElement('td');
    tdUpdated.textContent = new Date(updated).toLocaleString();

    // 操作
    const tdActions = document.createElement('td');
    const delBtn = document.createElement('button');
    delBtn.textContent = '削除';
    delBtn.addEventListener('click', async () => {
      await removeTemplate(key);
      messageDiv.textContent = `「${key}」を削除しました`;
      renderTemplates();
    });
    tdActions.appendChild(delBtn);

    tr.append(tdKey, tdContent, tdUpdated, tdActions);
    tableBody.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', renderTemplates);

backButton.addEventListener('click', () => {
  window.open(chrome.runtime.getURL('src/popup_register.html'));
});
