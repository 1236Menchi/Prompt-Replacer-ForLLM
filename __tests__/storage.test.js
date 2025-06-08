import { setTemplate, getTemplate, isSiteRegistered } from '../src/storage.js';

describe('storage.js', () => {
  let store;
  beforeEach(() => {
    store = {};
    global.chrome = {
      storage: {
        local: {
          get: jest.fn(async (key) => {
            if (key === null) return store;
            return { [key]: store[key] };
          }),
          set: jest.fn(async (obj) => {
            Object.assign(store, obj);
          }),
          getBytesInUse: jest.fn(async () => JSON.stringify(store).length)
        }
      },
      runtime: {}
    };
  });

  test('setTemplate saves template and getTemplate retrieves it', async () => {
    await setTemplate('hello', 'world');
    const tpl = await getTemplate('hello');
    expect(tpl).not.toBeNull();
    expect(tpl.content).toBe('world');
    expect(typeof tpl.updated).toBe('string');
  });

  test('getTemplate returns null for missing key', async () => {
    const tpl = await getTemplate('missing');
    expect(tpl).toBeNull();
  });

  test('isSiteRegistered matches registered patterns', async () => {
    store.sites = ['https://example.com/*'];
    const result = await isSiteRegistered('https://example.com/page');
    expect(result).toBe(true);
  });

  test('isSiteRegistered returns false for non-matching url', async () => {
    store.sites = ['https://example.com/*'];
    const result = await isSiteRegistered('https://other.com');
    expect(result).toBe(false);
  });

  test('isSiteRegistered ignores invalid patterns', async () => {
    store.sites = ['['];
    const result = await isSiteRegistered('https://example.com');
    expect(result).toBe(false);
  });
});
