/* src/popup_register.js */
import { setTemplate, getStorageSize } from './storage.js';

const form = document.getElementById('template-form');
const keywordInput = document.getElementById('keyword-input');
const contentInput = document.getElementById('content-input');
const messageDiv = document.getElementById('message');
const storageSizeSpan = document.getElementById('storage-size');
const viewTemplatesButton = document.getElementById('view-templates-button');

async function updateStorageSize() {
  try {
    const size = await getStorageSize();
    storageSizeSpan.textContent = size;
  } catch (err) {
    console.error('ストレージサイズ取得エラー', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateStorageSize();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const key = keywordInput.value.trim();
  const content = contentInput.value;
  if (!key) {
    messageDiv.textContent = 'キーワードは必須です';
    return;
  }
  if (!content) {
    messageDiv.textContent = '置換文は必須です';
    return;
  }
  try {
    await setTemplate(key, content);
    messageDiv.textContent = '保存しました';
    keywordInput.value = '';
    contentInput.value = '';
    updateStorageSize();
  } catch (err) {
    messageDiv.textContent = '保存に失敗しました';
    console.error(err);
  }
});

viewTemplatesButton.addEventListener('click', () => {
  const url = chrome.runtime.getURL('src/popup_templates.html');
  window.open(url);
});
