// src/content.js

(async () => {
  const { isSiteRegistered, getTemplate } =
    await import(chrome.runtime.getURL('src/storage.js'));
  console.log('storage.js imported');

  const url = window.location.href;
  if (!await isSiteRegistered(url)) return;


  // テキストエリアを取得し続け、変化があればリスナーを再登録する
  const waitForTextarea = (handler, timeout = 5000) => {
    let current = null;
    let resolved = false;

    const attach = (ta) => {
      if (current) current.removeEventListener('keydown', handler);
      current = ta;
      if (current) current.addEventListener('keydown', handler);
      if (!resolved) {
        resolved = true;
        return true;
      }
      return false;
    };

    const check = () => {
      const ta = document.querySelector('#prompt-textarea');
      if (ta && ta !== current) {
        if (attach(ta)) resolver(ta);
      } else if (!ta && current) {
        // textarea が一旦消えた場合に備え、current をクリア
        current.removeEventListener('keydown', handler);
        current = null;
      }
    };

    let resolver;
    const watcher = new Promise(resolve => {
      resolver = resolve;
      const existing = document.querySelector('textarea');
      if (existing) {
        attach(existing);
        resolve(existing);
        return;
      }
      const observer = new MutationObserver(check);
      observer.observe(document.body, { childList: true, subtree: true });
    });

    const timer = new Promise(resolve => {
      setTimeout(() => {
        if (!resolved) {
          console.error('waitForTextarea: timed out');
          resolve(null);
        }
      }, timeout);
    });

    return Promise.race([watcher, timer]);
  };

  const keydownHandler = async (e) => {
    console.log('keydown handler start');
    if (e.key === 'Enter' && !e.shiftKey) {
      const textarea = e.target;
      const original = textarea.innerText;
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
        textarea.innerHTML = `<p>${result.replace(/\n/g, '</p><p>')}</p>`;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    console.log('keydown handler end');
  };

  const textarea = await waitForTextarea(keydownHandler);
  if (!textarea) return;
})();
