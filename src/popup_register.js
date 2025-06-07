/* src/popup_register.js */
import {
  setTemplate,
  getStorageSize,
  getSites,
  addSite,
  removeSite
} from './storage.js';

// --- テンプレート登録 ---
const templateForm = document.getElementById('template-form');
const keywordInput = document.getElementById('keyword-input');
const contentInput = document.getElementById('content-input');
const templateMessage = document.getElementById('message');
const storageSizeSpan = document.getElementById('storage-size');
const viewTemplatesButton = document.getElementById('view-templates-button');
const viewSitesButton = document.getElementById('view-sites-button');

async function updateStorageSize() {
  const size = await getStorageSize();
  storageSizeSpan.textContent = size;
}

templateForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const key = keywordInput.value.trim();
  const content = contentInput.value;
  if (!key || !content) {
    templateMessage.textContent = 'キーワードと置換文は必須です';
    return;
  }
  await setTemplate(key, content);
  templateMessage.textContent = '保存しました';
  keywordInput.value = '';
  contentInput.value = '';
  updateStorageSize();
});

viewTemplatesButton.addEventListener('click', () => {
  window.open(chrome.runtime.getURL('src/popup_templates.html'));
});

viewSitesButton.addEventListener('click', () => {
  document.getElementById('site-section').scrollIntoView({ behavior: 'smooth' });
});

// --- 対象サイト管理 ---
const siteForm = document.getElementById('site-form');
const siteInput = document.getElementById('site-input');
const siteList = document.getElementById('site-list');
const siteMessage = document.getElementById('site-message');

async function renderSiteList() {
  const sites = await getSites();
  siteList.innerHTML = '';
  for (const pattern of sites) {
    const li = document.createElement('li');
    li.textContent = pattern;
    const btn = document.createElement('button');
    btn.textContent = '削除';
    btn.addEventListener('click', async () => {
      await removeSite(pattern);
      renderSiteList();
    });
    li.appendChild(btn);
    siteList.appendChild(li);
  }
}

siteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const pattern = siteInput.value.trim();
  if (!pattern) {
    siteMessage.textContent = 'パターンを入力してください';
    return;
  }
  await addSite(pattern);
  siteMessage.textContent = '登録しました';
  siteInput.value = '';
  renderSiteList();
});

// 初期処理
window.addEventListener('DOMContentLoaded', () => {
  updateStorageSize();
  renderSiteList();
});
