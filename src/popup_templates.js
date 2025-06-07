/* src/popup_templates.js */
import { getAllTemplates, removeTemplate } from './storage.js';

const tableBody = document.querySelector('#template-table tbody');
const backButton = document.getElementById('back-button');
const messageDiv = document.getElementById('template-message');

async function renderTemplates() {
  const templates = await getAllTemplates();
  tableBody.innerHTML = '';
  Object.entries(templates).forEach(([key, { updated }]) => {
    const tr = document.createElement('tr');
    const tdKey = document.createElement('td'); tdKey.textContent = key;
    const tdUpdated = document.createElement('td'); tdUpdated.textContent = new Date(updated).toLocaleString();
    const tdActions = document.createElement('td');
    const delBtn = document.createElement('button');
    delBtn.textContent = '削除';
    delBtn.addEventListener('click', async () => {
      await removeTemplate(key);
      messageDiv.textContent = `「${key}」を削除しました`;
      renderTemplates();
    });
    tdActions.appendChild(delBtn);
    tr.append(tdKey, tdUpdated, tdActions);
    tableBody.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', renderTemplates);

backButton.addEventListener('click', () => {
  const url = chrome.runtime.getURL('src/popup_register.html');
  window.open(url);
});
