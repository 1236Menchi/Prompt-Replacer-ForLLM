/* src/popup_register.js */
import { setTemplate, getStorageSize } from './storage.js';

const templateForm = document.getElementById('template-form');
const keywordInput = document.getElementById('keyword-input');
const contentInput = document.getElementById('content-input');
const messageDiv = document.getElementById('message');
const storageSizeSpan = document.getElementById('storage-size');
const viewTemplatesButton = document.getElementById('view-templates-button');
const viewSitesButton = document.getElementById('view-sites-button');

async function updateStorageSize() {
  const size = await getStorageSize();
  storageSizeSpan.textContent = size;
}

document.addEventListener('DOMContentLoaded', () => {
  updateStorageSize();
});

templateForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const key = keywordInput.value.trim();
  const content = contentInput.value;
  if (!key || !content) {
    messageDiv.textContent = 'キーワードと置換文は必須です';
    return;
  }
  await setTemplate(key, content);
  messageDiv.textContent = '保存しました';
  keywordInput.value = '';
  contentInput.value = '';
  updateStorageSize();
});

viewTemplatesButton.addEventListener('click', () => {
  window.open(chrome.runtime.getURL('src/popup_templates.html'));
});

viewSitesButton.addEventListener('click', () => {
  window.open(chrome.runtime.getURL('src/popup_sites.html'));
});
