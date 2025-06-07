// src/content.js

import { isSiteRegistered, getTemplate } from './storage.js';

(async () => {
  const url = window.location.href;
  if (!await isSiteRegistered(url)) {
    return;  // 登録サイトでなければ動作しない
  }

  // フォームがDOMに追加されるのを待つ
  const waitForForm = () => new Promise(resolve => {
    const existing = document.querySelector('form');
    if (existing) {
      resolve(existing);
      return;
    }
    const mo = new MutationObserver((_, obs) => {
      const f = document.querySelector('form');
      if (f) {
        obs.disconnect();
        resolve(f);
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  });

  const form = await waitForForm();

  form.addEventListener('submit', async (e) => {
    const textarea = form.querySelector('textarea');
    if (!textarea) return;

    const original = textarea.value;
    const lines = original.split(/\r?\n/);
    const processed = [];

    for (const line of lines) {
      // 行全体が ;;キーワード の場合にのみ置換
      const match = line.match(/^;;\s*(\S+)\s*$/);
      if (match) {
        const key = match[1];
        const tpl = await getTemplate(key);
        if (tpl && tpl.content) {
          processed.push(...tpl.content.split(/\r?\n/));
          continue;
        }
      }
      processed.push(line);
    }

    const newText = processed.join('\n');
    if (newText !== original) {
      textarea.value = newText;
    }
  });
})();
