// Web-compatible AsyncStorage implementation
// Uses localStorage instead of window.localStorage directly to avoid SSR issues
const localStorage =
  typeof window !== 'undefined'
    ? window.localStorage
    : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      };

export const AsyncStorage = {
  getItem: (key: string): Promise<string | null> => {
    return new Promise((resolve) => {
      try {
        resolve(localStorage.getItem(key));
      } catch (e) {
        console.warn('AsyncStorage.getItem error:', e);
        resolve(null);
      }
    });
  },

  setItem: (key: string, value: string): Promise<null> => {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(key, value);
        resolve(null);
      } catch (e) {
        console.warn('AsyncStorage.setItem error:', e);
        reject(e);
      }
    });
  },

  removeItem: (key: string): Promise<null> => {
    return new Promise((resolve, reject) => {
      try {
        localStorage.removeItem(key);
        resolve(null);
      } catch (e) {
        console.warn('AsyncStorage.removeItem error:', e);
        reject(e);
      }
    });
  },

  clear: (): Promise<null> => {
    return new Promise((resolve, reject) => {
      try {
        localStorage.clear();
        resolve(null);
      } catch (e) {
        console.warn('AsyncStorage.clear error:', e);
        reject(e);
      }
    });
  },

  getAllKeys: (): Promise<string[]> => {
    return new Promise((resolve) => {
      try {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) keys.push(key);
        }
        resolve(keys);
      } catch (e) {
        console.warn('AsyncStorage.getAllKeys error:', e);
        resolve([]);
      }
    });
  },

  multiGet: (keys: string[]): Promise<Array<[string, string | null]>> => {
    return new Promise((resolve) => {
      try {
        const result = keys.map(
          (key) => [key, localStorage.getItem(key)] as [string, string | null]
        );
        resolve(result);
      } catch (e) {
        console.warn('AsyncStorage.multiGet error:', e);
        resolve([]);
      }
    });
  },

  multiSet: (keyValuePairs: Array<[string, string]>): Promise<null> => {
    return new Promise((resolve, reject) => {
      try {
        keyValuePairs.forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
        resolve(null);
      } catch (e) {
        console.warn('AsyncStorage.multiSet error:', e);
        reject(e);
      }
    });
  },

  multiRemove: (keys: string[]): Promise<null> => {
    return new Promise((resolve, reject) => {
      try {
        keys.forEach((key) => {
          localStorage.removeItem(key);
        });
        resolve(null);
      } catch (e) {
        console.warn('AsyncStorage.multiRemove error:', e);
        reject(e);
      }
    });
  },

  multiMerge: (keyValuePairs: Array<[string, string]>): Promise<null> => {
    return new Promise((resolve, reject) => {
      try {
        keyValuePairs.forEach(([key, value]) => {
          const existingValue = localStorage.getItem(key);
          if (existingValue !== null) {
            const mergedValue = { ...JSON.parse(existingValue), ...JSON.parse(value) };
            localStorage.setItem(key, JSON.stringify(mergedValue));
          }
        });
        resolve(null);
      } catch (e) {
        console.warn('AsyncStorage.multiMerge error:', e);
        reject(e);
      }
    });
  },
};
