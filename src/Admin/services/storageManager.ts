// gymmanager/src/Admin/services/storageManager.ts
import { supabase } from '../../lib/supabase';

// ============================================
// MAPEAMENTO CAMELCASE <-> SNAKE_CASE
// ============================================

const fieldMappings: Record<string, Record<string, string>> = {
  students: {
    // camelCase -> snake_case
    birthDate: 'birth_date',
    joinDate: 'join_date',
    monthlyFee: 'monthly_fee',
    paymentStatus: 'payment_status',
    lastCheckin: 'last_checkin',
    // snake_case -> camelCase (reverse)
    birth_date: 'birthDate',
    join_date: 'joinDate',
    monthly_fee: 'monthlyFee',
    payment_status: 'paymentStatus',
    last_checkin: 'lastCheckin',
  },
  classes: {
    // camelCase -> snake_case
    dayOfWeek: 'day_of_week',
    startTime: 'start_time',
    endTime: 'end_time',
    // snake_case -> camelCase
    day_of_week: 'dayOfWeek',
    start_time: 'startTime',
    end_time: 'endTime',
  },
  payments: {
    // camelCase -> snake_case
    studentId: 'student_id',
    // snake_case -> camelCase
    student_id: 'studentId',
  },
  checkins: {
    // camelCase -> snake_case
    studentId: 'student_id',
    // snake_case -> camelCase
    student_id: 'studentId',
  }
};

// Converter objeto de camelCase para snake_case
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

// Converter objeto de snake_case para camelCase
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

// Converter array de objetos
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
    // Verificar se Supabase está configurado
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
    // Verificar cache primeiro
    if (this.cache.has(key)) {
      console.log(`📦 Cache hit: ${key}`);
      return this.cache.get(key);
    }

    try {
      if (this.useSupabase && this.isTableKey(key)) {
        console.log(`🔍 Fetching from Supabase: ${key}`);
        const { data, error } = await supabase
          .from(key)
          .select('*');

        if (error) {
          console.error(`❌ Supabase get error [${key}]:`, error);
          return this.getFromLocalStorage<T>(key);
        }

        // Converter de snake_case para camelCase
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
      // Atualizar cache
      this.cache.set(key, value);

      if (this.useSupabase && this.isTableKey(key)) {
        console.log(`💾 Saving to Supabase: ${key}`, value);

        // 1. Deletar todos os registros antigos
        const { error: deleteError } = await supabase
          .from(key)
          .delete()
          .neq('id', 0); // Deleta todos (truque: id nunca é 0)

        if (deleteError) {
          console.error(`❌ Supabase delete error [${key}]:`, deleteError);
        }

        // 2. Inserir novos dados (convertendo para snake_case)
        if (Array.isArray(value) && value.length > 0) {
          const snakeData = toSnakeCaseArray(key, value);
          
          const { error: insertError } = await supabase
            .from(key)
            .insert(snakeData);

          if (insertError) {
            console.error(`❌ Supabase insert error [${key}]:`, insertError);
            throw insertError;
          }

          console.log(`✅ Supabase set success [${key}]`);
        }
      }

      // Sempre salvar no localStorage como backup
      this.setToLocalStorage(key, value);
    } catch (error) {
      console.error(`❌ Storage set error [${key}]:`, error);
      this.setToLocalStorage(key, value);
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