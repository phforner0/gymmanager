// gymmanager/src/Admin/services/storageManager.ts
import { supabase } from '../../lib/supabase';

// ============================================
// MAPEAMENTO CAMELCASE <-> SNAKE_CASE
// ============================================

const fieldMappings: Record<string, Record<string, string>> = {
  students: {
    birthDate: 'birth_date',
    joinDate: 'join_date',
    monthlyFee: 'monthly_fee',
    paymentStatus: 'payment_status',
    lastCheckin: 'last_checkin',
    birth_date: 'birthDate',
    join_date: 'joinDate',
    monthly_fee: 'monthlyFee',
    payment_status: 'paymentStatus',
    last_checkin: 'lastCheckin',
  },
  classes: {
    dayOfWeek: 'day_of_week',
    startTime: 'start_time',
    endTime: 'end_time',
    day_of_week: 'dayOfWeek',
    start_time: 'startTime',
    end_time: 'endTime',
  },
  payments: {
    studentId: 'student_id',
    student_id: 'studentId',
  },
  checkins: {
    studentId: 'student_id',
    student_id: 'studentId',
  }
};

function toSnakeCase(tableName: string, obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const mapping = fieldMappings[tableName] || {};
  const result: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = mapping[key] || key;
    result[snakeKey] = value;
  }
  
  return result;
}

function toCamelCase(tableName: string, obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const mapping = fieldMappings[tableName] || {};
  const result: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = mapping[key] || key;
    result[camelKey] = value;
  }
  
  return result;
}

function toSnakeCaseArray(tableName: string, arr: any[]): any[] {
  return arr.map(item => toSnakeCase(tableName, item));
}

function toCamelCaseArray(tableName: string, arr: any[]): any[] {
  return arr.map(item => toCamelCase(tableName, item));
}

// ============================================
// STORAGE MANAGER
// ============================================

class StorageManager {
  private cache: Map<string, any> = new Map();
  private useSupabase: boolean = true;

  constructor() {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.warn('⚠️ Supabase não configurado, usando localStorage');
        this.useSupabase = false;
      }
    } catch {
      this.useSupabase = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.cache.has(key)) {
      console.log(`📦 Cache hit: ${key}`);
      return this.cache.get(key);
    }

    try {
      if (this.useSupabase && this.isTableKey(key)) {
        console.log(`🔍 Fetching from Supabase: ${key}`);
        const { data, error } = await supabase
          .from(key)
          .select('*')
          .order('id', { ascending: true });

        if (error) {
          console.error(`❌ Supabase get error [${key}]:`, error);
          return this.getFromLocalStorage<T>(key);
        }

        const camelData = toCamelCaseArray(key, data || []) as T;
        this.cache.set(key, camelData);
        console.log(`✅ Supabase get success [${key}]:`, camelData);
        return camelData;
      }

      return this.getFromLocalStorage<T>(key);
    } catch (error) {
      console.error(`❌ Storage get error [${key}]:`, error);
      return this.getFromLocalStorage<T>(key);
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      this.cache.set(key, value);

      if (this.useSupabase && this.isTableKey(key)) {
        console.log(`💾 Saving to Supabase: ${key}`, value);

        if (Array.isArray(value) && value.length > 0) {
          // ESTRATÉGIA: Sincronização inteligente
          await this.syncToSupabase(key, value);
        }
      }

      this.setToLocalStorage(key, value);
    } catch (error) {
      console.error(`❌ Storage set error [${key}]:`, error);
      this.setToLocalStorage(key, value);
    }
  }

  private async syncToSupabase(tableName: string, data: any[]): Promise<void> {
    try {
      // 1. Buscar IDs existentes no Supabase
      const { data: existing } = await supabase
        .from(tableName)
        .select('id');

      const existingIds = new Set((existing || []).map(item => item.id));
      
      // 2. Separar novos registros de atualizações
      const toInsert: any[] = [];
      const toUpdate: any[] = [];

      for (const item of data) {
        const snakeItem = toSnakeCase(tableName, item);
        
        if (existingIds.has(item.id)) {
          toUpdate.push(snakeItem);
        } else {
          // Remover o ID para deixar o SERIAL gerar
          const { id, ...itemWithoutId } = snakeItem;
          toInsert.push(itemWithoutId);
        }
      }

      // 3. Inserir novos registros
      if (toInsert.length > 0) {
        const { error: insertError } = await supabase
          .from(tableName)
          .insert(toInsert);

        if (insertError) {
          console.error(`❌ Supabase insert error [${tableName}]:`, insertError);
          throw insertError;
        }
        console.log(`✅ Inserted ${toInsert.length} records into ${tableName}`);
      }

      // 4. Atualizar registros existentes
      for (const item of toUpdate) {
        const { error: updateError } = await supabase
          .from(tableName)
          .update(item)
          .eq('id', item.id);

        if (updateError) {
          console.error(`❌ Supabase update error [${tableName}]:`, updateError);
        }
      }

      if (toUpdate.length > 0) {
        console.log(`✅ Updated ${toUpdate.length} records in ${tableName}`);
      }

      console.log(`✅ Supabase sync success [${tableName}]`);
    } catch (error) {
      console.error(`❌ Supabase sync error [${tableName}]:`, error);
      throw error;
    }
  }

  private isTableKey(key: string): boolean {
    const tables = ['students', 'classes', 'payments', 'checkins'];
    return tables.includes(key);
  }

  private getFromLocalStorage<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`❌ localStorage get error [${key}]:`, error);
      return null;
    }
  }

  private setToLocalStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`❌ localStorage set error [${key}]:`, error);
    }
  }

  clear(): void {
    this.cache.clear();
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  }
}

export const storage = new StorageManager();