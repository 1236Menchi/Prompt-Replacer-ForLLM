// src/storage.js

// ストレージ内で使用するキー名称
const TEMPLATES_KEY = 'templates';    // オブジェクト: { [keyword]: { content: string, updated: string } }
const SITES_KEY     = 'sites';        // 配列: string[]

/**
 * 指定キーワードに対応するテンプレートを取得
 * @param {string} key
 * @returns {Promise<{content: string, updated: string} | null>}
 */
export async function getTemplate(key) {
  try {
    const data = await chrome.storage.local.get(TEMPLATES_KEY);
    const templates = data[TEMPLATES_KEY] || {};
    return templates[key] || null;
  } catch (err) {
    const lastError = chrome.runtime.lastError;
    if (lastError) console.error(lastError);
    throw lastError || err;
  }
}

/**
 * テンプレートを保存または更新
 * @param {string} key
 * @param {string} content
 * @returns {Promise<void>}
 */
export async function setTemplate(key, content) {
  try {
    const data = await chrome.storage.local.get(TEMPLATES_KEY);
    const templates = data[TEMPLATES_KEY] || {};
    templates[key] = { content, updated: new Date().toISOString() };
    await chrome.storage.local.set({ [TEMPLATES_KEY]: templates });
  } catch (err) {
    const lastError = chrome.runtime.lastError;
    if (lastError) console.error(lastError);
    throw lastError || err;
  }
}

/**
 * 全テンプレートを取得
 * @returns {Promise<Record<string, {content: string, updated: string}>>}
 */
export async function getAllTemplates() {
  try {
    const data = await chrome.storage.local.get(TEMPLATES_KEY);
    return data[TEMPLATES_KEY] || {};
  } catch (err) {
    const lastError = chrome.runtime.lastError;
    if (lastError) console.error(lastError);
    throw lastError || err;
  }
}

/**
 * 指定キーワードのテンプレートを削除
 * @param {string} key
 * @returns {Promise<void>}
 */
export async function removeTemplate(key) {
  try {
    const data = await chrome.storage.local.get(TEMPLATES_KEY);
    const templates = data[TEMPLATES_KEY] || {};
    delete templates[key];
    await chrome.storage.local.set({ [TEMPLATES_KEY]: templates });
  } catch (err) {
    const lastError = chrome.runtime.lastError;
    if (lastError) console.error(lastError);
    throw lastError || err;
  }
}

/**
 * 使用中ストレージの総バイト数を取得
 * @returns {Promise<number>}
 */
export async function getStorageSize() {
  try {
    return await chrome.storage.local.getBytesInUse(null);
  } catch (err) {
    const lastError = chrome.runtime.lastError;
    if (lastError) console.error(lastError);
    throw lastError || err;
  }
}

/**
 * 登録サイト一覧を取得
 * @returns {Promise<string[]>}
 */
export async function getSites() {
  try {
    const data = await chrome.storage.local.get(SITES_KEY);
    return data[SITES_KEY] || [];
  } catch (err) {
    const lastError = chrome.runtime.lastError;
    if (lastError) console.error(lastError);
    throw lastError || err;
  }
}

/**
 * サイトを登録（重複排除）
 * @param {string} urlPattern
 * @returns {Promise<void>}
 */
export async function addSite(urlPattern) {
  try {
    const data = await chrome.storage.local.get(SITES_KEY);
    const sites = data[SITES_KEY] || [];
    if (!sites.includes(urlPattern)) {
      sites.push(urlPattern);
      await chrome.storage.local.set({ [SITES_KEY]: sites });
    }
  } catch (err) {
    const lastError = chrome.runtime.lastError;
    if (lastError) console.error(lastError);
    throw lastError || err;
  }
}

/**
 * サイト登録を解除
 * @param {string} urlPattern
 * @returns {Promise<void>}
 */
export async function removeSite(urlPattern) {
  try {
    const data = await chrome.storage.local.get(SITES_KEY);
    const sites = data[SITES_KEY] || [];
    const filtered = sites.filter(u => u !== urlPattern);
    await chrome.storage.local.set({ [SITES_KEY]: filtered });
  } catch (err) {
    const lastError = chrome.runtime.lastError;
    if (lastError) console.error(lastError);
    throw lastError || err;
  }
}

/**
 * 指定 URL が登録サイトのパターンに一致するか判定
 * @param {string} url
 * @returns {Promise<boolean>}
 */
export async function isSiteRegistered(url) {
  try {
    const data = await chrome.storage.local.get(SITES_KEY);
    const sites = data[SITES_KEY] || [];
    return sites.some(pattern => {
      // パターンが不正な場合は URLPattern コンストラクタが例外を投げる
      try {
        return new URLPattern(pattern).test(url);
      } catch {
        return false;
      }
    });
  } catch (err) {
    const lastError = chrome.runtime.lastError;
    if (lastError) console.error(lastError);
    throw lastError || err;
  }
}
