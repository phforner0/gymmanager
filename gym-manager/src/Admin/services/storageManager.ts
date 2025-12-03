// src/Admin/services/storageManager.ts
import { supabase } from '../../lib/supabase';

class StorageManager {
  private cache: Map<string, any>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * GET - Busca dados do Supabase
   */
  async get<T>(table: string, filters?: Record<string, any>): Promise<T | null> {
    try {
      const cacheKey = `${table}-${JSON.stringify(filters || {})}`;
      
      // Verificar cache
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
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
        return null;
      }

      // Atualizar cache
      this.cache.set(cacheKey, data);
      return data as T;
    } catch (error) {
      console.error(`❌ Storage get error [${table}]:`, error);
      return null;
    }
  }

  /**
   * SET - Insere ou atualiza dados no Supabase
   */
  async set<T>(table: string, value: T, id?: number | string): Promise<boolean> {
    try {
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
        return false;
      }

      // Limpar cache relevante
      this.clearCacheByTable(table);
      return true;
    } catch (error) {
      console.error(`❌ Storage set error [${table}]:`, error);
      return false;
    }
  }

  /**
   * DELETE - Remove dados do Supabase
   */
  async delete(table: string, id: number | string): Promise<boolean> {
    try {
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