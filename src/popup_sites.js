/* src/popup_sites.js */
import { getSites, addSite, removeSite } from './storage.js';

const form = document.getElementById('site-form');
const input = document.getElementById('site-input');
const list = document.getElementById('site-list');
const messageDiv = document.getElementById('site-message');

// リストの再描画
async function renderList() {
  const sites = await getSites();
  list.innerHTML = '';
  sites.forEach(pattern => {
    const li = document.createElement('li');
    li.textContent = pattern;
    const btn = document.createElement('button');
    btn.textContent = '削除';
    btn.addEventListener('click', async () => {
      await removeSite(pattern);
      renderList();
    });
    li.appendChild(btn);
    list.appendChild(li);
  });
}

// 初期描画
document.addEventListener('DOMContentLoaded', renderList);

// 登録処理
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const pattern = input.value.trim();
  if (!pattern) {
    messageDiv.textContent = 'パターンを入力してください';
    return;
  }
  try {
    await addSite(pattern);
    messageDiv.textContent = '登録しました';
    input.value = '';
    renderList();
  } catch (err) {
    console.error(err);
    messageDiv.textContent = '登録に失敗しました';
  }
});
