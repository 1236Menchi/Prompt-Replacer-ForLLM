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
      const existing = document.querySelector('#prompt-textarea');
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

  const isTextarea = (el) => el.tagName === 'TEXTAREA';

  const keydownHandler = async (e) => {
    console.log('shortcut handler start');
    // Ctrl+Shift+R を押したときだけ置換処理を実行
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
      const textarea = e.target;
      const original = textarea.innerText;
      const regex = /;;([^;\r\n]+);;/g;
      let result = '';
      let lastIndex = 0;
      let match;

      const start = isTextarea(area) ? area.selectionStart : 0;
      const end = isTextarea(area) ? area.selectionEnd : 0;
      let diffStart = 0;
      let diffEnd = 0;

      while ((match = regex.exec(original)) !== null) {
        result += original.slice(lastIndex, match.index);
        const key = match[1];
        const tpl = await getTemplate(key);
        console.log('getTemplate', key, tpl);
        const replacement = tpl && tpl.content ? tpl.content : match[0];
        result += replacement;
        if (match.index + match[0].length <= start) {
          diffStart += replacement.length - match[0].length;
        }
        if (match.index + match[0].length <= end) {
          diffEnd += replacement.length - match[0].length;
        }
        lastIndex = regex.lastIndex;
      }

      result += original.slice(lastIndex);

      if (result !== original) {
        if (isTextarea(area)) {
          area.value = result;
          const newStart = start + diffStart;
          const newEnd = end + diffEnd;
          area.setSelectionRange(newStart, newEnd);
        } else {
          area.textContent = result;
        }
        area.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    console.log('shortcut handler end');
  };

  const textarea = await waitForTextarea(keydownHandler);
  if (!textarea) return;
})();
