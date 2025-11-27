class StorageManager {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private cache: Map<string, any>;
  
    constructor() {
      this.cache = new Map();
    }
  
    get<T>(key: string): T | null {
      try {
        if (this.cache.has(key)) {
          return this.cache.get(key);
        }
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          this.cache.set(key, parsed);
          return parsed;
        }
        return null;
      } catch (error) {
        console.error(`Storage get error [${key}]:`, error);
        return null;
      }
    }
  
    set<T>(key: string, value: T): boolean {
      try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
        this.cache.set(key, value);
        return true;
      } catch (error) {
        console.error(`Storage set error [${key}]:`, error);
        return false;
      }
    }
  
    delete(key: string): boolean {
      try {
        localStorage.removeItem(key);
        this.cache.delete(key);
        return true;
      } catch (error) {
        console.error(`Storage delete error [${key}]:`, error);
        return false;
      }
    }
  
    clear(): void {
      localStorage.clear();
      this.cache.clear();
    }
  }
  
  export const storage = new StorageManager();