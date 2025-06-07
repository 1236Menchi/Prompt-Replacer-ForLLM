import { isSiteRegistered } from './storage.js';

// Inject content script when a top-level navigation matches a registered site
chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId !== 0) return;
  const url = details.url;
  if (await isSiteRegistered(url)) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        files: ['src/content.js']
      });
      console.log('Injection succeeded for', url);
    } catch (err) {
      console.error('Injection failed for', url, err);
    }
  }
});
