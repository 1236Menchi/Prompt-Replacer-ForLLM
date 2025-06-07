// src/content.js
import { isSiteRegistered, getTemplate } from './storage.js';

(async () => {
  const url = window.location.href;
  if (!await isSiteRegistered(url)) return;

  // テキストエリアが DOM に出現するのを待つ
  const waitForTextarea = () => new Promise(resolve => {
    const existing = document.querySelector('textarea');
    if (existing) {
      resolve(existing);
      return;
    }
    const observer = new MutationObserver((_, obs) => {
      const ta = document.querySelector('textarea');
      if (ta) {
        obs.disconnect();
        resolve(ta);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });

  const textarea = await waitForTextarea();

  // Enter キー送信時に置換を実行
  textarea.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const original = textarea.value;
      const lines = original.split(/\r?\n/);
      const processed = [];

      for (const line of lines) {
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
    }
  });
})();
