// src/content.js

(async () => {
  const { isSiteRegistered, getTemplate } =
    await import(chrome.runtime.getURL('src/storage.js'));

  const url = window.location.href;
  if (!await isSiteRegistered(url)) return;

  // テキストエリアが DOM に出現するのを待つ (タイムアウト付き)
  const waitForTextarea = (timeout = 5000) => {
    const watcher = new Promise(resolve => {
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

    const timer = new Promise(resolve => {
      setTimeout(() => {
        console.error('waitForTextarea: timed out');
        resolve(null);
      }, timeout);
    });

    return Promise.race([watcher, timer]);
  };

  const textarea = await waitForTextarea();
  if (!textarea) return;

  // Enter キー送信時に置換を実行
  textarea.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const original = textarea.value;
      const regex = /;;([^;\r\n]+);;/g;
      let result = '';
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(original)) !== null) {
        result += original.slice(lastIndex, match.index);
        const key = match[1];
        const tpl = await getTemplate(key);
        if (tpl && tpl.content) {
          result += tpl.content;
        } else {
          result += match[0];
        }
        lastIndex = regex.lastIndex;
      }

      result += original.slice(lastIndex);

      if (result !== original) {
        textarea.value = result;
      }
    }
  });
})();
