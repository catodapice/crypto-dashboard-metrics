// Storage utility that tries localStorage first, falls back to sessionStorage
const storage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key) || sessionStorage.getItem(key);
    } catch (error) {
      try {
        return sessionStorage.getItem(key);
      } catch (e) {
        console.warn("Storage is not available:", e);
        return null;
      }
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      try {
        sessionStorage.setItem(key, value);
      } catch (e) {
        console.warn("Storage is not available:", e);
      }
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn("Storage is not available:", error);
    }
  },
};

export default storage;
