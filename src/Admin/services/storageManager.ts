// gymmanager/src/Admin/services/storageManager.ts
import { supabase } from '../../lib/supabase';

class StorageManager {
  private cache: Map<string, any>;
  private useLocalStorage: boolean = false;

  constructor() {
    this.cache = new Map();
    // Verifica se Supabase está disponível, senão usa localStorage
    this.checkSupabaseConnection();
  }

  private async checkSupabaseConnection() {
    try {
      const { error } = await supabase.from('students').select('count').limit(1);
      this.useLocalStorage = !!error;
    } catch {
      this.useLocalStorage = true;
      console.warn('⚠️ Supabase indisponível, usando localStorage');
    }
  }

  /**
   * GET - Busca dados do Supabase ou localStorage
   */
  async get<T>(table: string, filters?: Record<string, any>): Promise<T | null> {
    try {
      const cacheKey = `${table}-${JSON.stringify(filters || {})}`;
      
      // Verificar cache
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // Se usar localStorage
      if (this.useLocalStorage) {
        const stored = localStorage.getItem(`gymmanager_${table}`);
        if (!stored) return null;
        const data = JSON.parse(stored);
        this.cache.set(cacheKey, data);
        return data as T;
      }

      // Buscar do Supabase
      let query = supabase.from(table).select('*');

      // Aplicar filtros
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;

      if (error) {
        console.error(`❌ Storage get error [${table}]:`, error);
        // Fallback para localStorage em caso de erro
        return this.getFromLocalStorage<T>(table);
      }

      // Atualizar cache
      this.cache.set(cacheKey, data);
      return data as T;
    } catch (error) {
      console.error(`❌ Storage get error [${table}]:`, error);
      return this.getFromLocalStorage<T>(table);
    }
  }

  /**
   * SET - Insere ou atualiza dados no Supabase ou localStorage
   */
  async set<T>(table: string, value: T, id?: number | string): Promise<boolean> {
    try {
      // Se usar localStorage
      if (this.useLocalStorage) {
        localStorage.setItem(`gymmanager_${table}`, JSON.stringify(value));
        this.clearCacheByTable(table);
        return true;
      }

      let result;

      if (id) {
        // UPDATE
        result = await supabase
          .from(table)
          .update(value)
          .eq('id', id)
          .select();
      } else {
        // INSERT
        result = await supabase
          .from(table)
          .insert(value)
          .select();
      }

      if (result.error) {
        console.error(`❌ Storage set error [${table}]:`, result.error);
        // Fallback para localStorage
        return this.setToLocalStorage(table, value);
      }

      // Limpar cache relevante
      this.clearCacheByTable(table);
      return true;
    } catch (error) {
      console.error(`❌ Storage set error [${table}]:`, error);
      return this.setToLocalStorage(table, value);
    }
  }

  /**
   * DELETE - Remove dados do Supabase ou localStorage
   */
  async delete(table: string, id: number | string): Promise<boolean> {
    try {
      // Se usar localStorage (não implementado para simplicidade)
      if (this.useLocalStorage) {
        console.warn('⚠️ Delete não implementado para localStorage');
        return false;
      }

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`❌ Storage delete error [${table}]:`, error);
        return false;
      }

      // Limpar cache relevante
      this.clearCacheByTable(table);
      return true;
    } catch (error) {
      console.error(`❌ Storage delete error [${table}]:`, error);
      return false;
    }
  }

  // ========== FALLBACK METHODS ==========

  private getFromLocalStorage<T>(table: string): T | null {
    try {
      const stored = localStorage.getItem(`gymmanager_${table}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private setToLocalStorage<T>(table: string, value: T): boolean {
    try {
      localStorage.setItem(`gymmanager_${table}`, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Limpa cache por tabela
   */
  private clearCacheByTable(table: string): void {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (key.startsWith(`${table}-`)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }
}

export const storage = new StorageManager();