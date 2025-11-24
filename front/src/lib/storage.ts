// Safe localStorage wrapper with error handling for quota exceeded errors

export const safeLocalStorage = {
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      if (error instanceof DOMException && 
          (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        console.warn(`localStorage quota exceeded for key: ${key}`);
        // Try to clear some space by removing old data
        try {
          const keysToRemove = ['submissions', 'activities', 'exercises'];
          for (const keyToRemove of keysToRemove) {
            if (keyToRemove !== key) {
              localStorage.removeItem(keyToRemove);
            }
          }
          // Try again
          localStorage.setItem(key, value);
          return true;
        } catch (retryError) {
          console.error('Failed to save to localStorage even after cleanup:', retryError);
          return false;
        }
      }
      console.error('localStorage setItem error:', error);
      return false;
    }
  },

  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('localStorage getItem error:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage removeItem error:', error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('localStorage clear error:', error);
    }
  }
};
