// src/content.js

(async () => {
  const { isSiteRegistered, getTemplate } =
    await import(chrome.runtime.getURL('src/storage.js'));
  console.log('storage.js imported');

  const url = window.location.href;
  if (!await isSiteRegistered(url)) return;

  // テキストエリアが DOM に出現するのを待つ
  const waitForTextarea = () => new Promise(resolve => {
    console.log('waitForTextarea start');
    const existing = document.querySelector('textarea');
    if (existing) {
      console.log('waitForTextarea resolved');
      resolve(existing);
      return;
    }
    const observer = new MutationObserver((_, obs) => {
      const ta = document.querySelector('textarea');
      if (ta) {
        obs.disconnect();
        console.log('waitForTextarea resolved');
        resolve(ta);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });

  const textarea = await waitForTextarea();
  console.log('waitForTextarea promise resolved');

  // Enter キー送信時に置換を実行
  textarea.addEventListener('keydown', async (e) => {
    console.log('keydown handler start');
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
        console.log('getTemplate', key, tpl);
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
    console.log('keydown handler end');
  });
})();
