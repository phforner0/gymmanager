// gymmanager/src/Admin/services/storageManager.ts
import { supabase } from "../../lib/supabase";

// ============================================
// MAPEAMENTO CAMELCASE <-> SNAKE_CASE
// ============================================

const fieldMappings: Record<string, Record<string, string>> = {
  students: {
    birthDate: "birth_date",
    joinDate: "join_date",
    monthlyFee: "monthly_fee",
    paymentStatus: "payment_status",
    lastCheckin: "last_checkin",
    birth_date: "birthDate",
    join_date: "joinDate",
    monthly_fee: "monthlyFee",
    payment_status: "paymentStatus",
    last_checkin: "lastCheckin",
  },
  classes: {
    dayOfWeek: "day_of_week",
    startTime: "start_time",
    endTime: "end_time",
    day_of_week: "dayOfWeek",
    start_time: "startTime",
    end_time: "endTime",
  },
  payments: {
    studentId: "student_id",
    student_id: "studentId",
  },
  checkins: {
    studentId: "student_id",
    student_id: "studentId",
  },
};

// 🔥 FUNÇÃO AUXILIAR: Normalizar payment_status
function normalizePaymentStatus(value: any): 'paid' | 'pending' | 'overdue' | undefined {
  if (!value && value !== 0) return undefined;
  
  const allowed = new Set(['paid', 'pending', 'overdue']);
  const normalized = String(value).toLowerCase().trim();
  
  if (allowed.has(normalized)) {
    return normalized as 'paid' | 'pending' | 'overdue';
  }
  
  // Mapear valores alternativos para os aceitos
  const mapping: Record<string, 'paid' | 'pending' | 'overdue'> = {
    'up-to-date': 'paid',
    'up to date': 'paid',
    'uptodate': 'paid',
    'ok': 'paid',
    'pago': 'paid',
    'atrasado': 'overdue',
    'late': 'overdue',
    'pendente': 'pending',
    'aguardando': 'pending',
    'waiting': 'pending'
  };
  
  return mapping[normalized] || 'pending'; // Default para 'pending' se não reconhecido
}

function toSnakeCase(tableName: string, obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  const mapping = fieldMappings[tableName] || {};
  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = mapping[key] || key;
    
    // 🔥 NORMALIZAR payment_status antes de salvar
    if (tableName === 'students' && snakeKey === 'payment_status') {
      result[snakeKey] = normalizePaymentStatus(value);
    } else {
      result[snakeKey] = value;
    }
  }

  return result;
}

function toCamelCase(tableName: string, obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  const mapping = fieldMappings[tableName] || {};
  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    const camelKey = mapping[key] || key;
    result[camelKey] = value;
  }

  return result;
}

function toSnakeCaseArray(tableName: string, arr: any[]): any[] {
  return arr.map((item) => toSnakeCase(tableName, item));
}

function toCamelCaseArray(tableName: string, arr: any[]): any[] {
  return arr.map((item) => toCamelCase(tableName, item));
}

// ============================================
// STORAGE MANAGER
// ============================================

class StorageManager {
  private cache: Map<string, any> = new Map();
  private useSupabase: boolean = true;
  private idMappings: Map<string, Map<number, number>> = new Map();

  constructor() {
    try {
      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY
      ) {
        console.warn("⚠️ Supabase não configurado, usando localStorage");
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
          .select("*")
          .order("id", { ascending: true });

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
          await this.syncToSupabaseWithMapping(key, value);
        }
      }

      this.setToLocalStorage(key, value);
    } catch (error) {
      console.error(`❌ Storage set error [${key}]:`, error);
      this.setToLocalStorage(key, value);
    }
  }

  private async syncToSupabaseWithMapping(
    tableName: string,
    data: any[]
  ): Promise<void> {
    try {
      const selectFields = tableName === "students" ? "id, email" : "id";
      const selectColumns =
        tableName === 'students' ? 'id, email' :
        (tableName === 'checkins' || tableName === 'payments') ? 'id,student_id' :
        'id';

      const { data: existing, error: fetchError } = await supabase
        .from(tableName)
        .select(selectColumns)
        .order('id', { ascending: true });

      if (fetchError) {
        console.error(`❌ Error fetching existing ${tableName}:`, fetchError);
        throw fetchError;
      }

      const existingList = (existing || []) as Array<{
        id?: number;
        email?: string;
      }>;

      const existingIds = new Set(
        existingList.map((item) => item.id).filter(Boolean) as number[]
      );

      const emailToDbId = new Map<string, number>();
      if (tableName === 'students') {
        existingList.forEach(item => {
          if (item && (item as any).email && item.id != null) {
            emailToDbId.set(String((item as any).email).toLowerCase(), item.id);
          }
        });
      }

      const toInsert: any[] = [];
      const toUpdate: any[] = [];

      for (const item of data) {
        const snakeItem = toSnakeCase(tableName, item);

        // 🔥 VALIDAÇÃO ADICIONAL: Garantir que payment_status está correto
        if (tableName === 'students' && snakeItem.payment_status) {
          snakeItem.payment_status = normalizePaymentStatus(snakeItem.payment_status);
          console.log(`🔄 Normalized payment_status: ${item.paymentStatus} -> ${snakeItem.payment_status}`);
        }

        if (
          tableName === "students" &&
          snakeItem.email &&
          emailToDbId.has(snakeItem.email.toLowerCase())
        ) {
          const dbId = emailToDbId.get(snakeItem.email.toLowerCase())!;
          snakeItem.id = dbId;
          toUpdate.push(snakeItem);

          if (!this.idMappings.has(tableName)) {
            this.idMappings.set(tableName, new Map());
          }
          this.idMappings.get(tableName)!.set(item.id, dbId);

          console.log(
            `🔄 Mapping student: local ID ${item.id} -> DB ID ${dbId} (${snakeItem.email})`
          );
        } else if (existingIds.has(item.id)) {
          toUpdate.push(snakeItem);
        } else {
          const { id, ...itemWithoutId } = snakeItem;
          toInsert.push(itemWithoutId);
        }
      }

      if (toInsert.length > 0) {
        console.log(`📤 Inserting ${toInsert.length} records...`, toInsert);
        
        const { data: inserted, error: insertError } = await supabase
          .from(tableName)
          .insert(toInsert)
          .select(selectColumns);

        if (insertError) {
          console.error(
            `❌ Supabase insert error [${tableName}]:`,
            insertError
          );
          throw insertError;
        }

        const insertedList = (inserted || []) as Array<{
          id?: number;
          email?: string;
        }>;

        if (tableName === 'students') {
          if (!this.idMappings.has(tableName)) {
            this.idMappings.set(tableName, new Map());
          }
          
          const mapping = this.idMappings.get(tableName)!;
          const insertedByEmail = new Map(insertedList
            .filter(it => (it as any).email && it.id != null)
            .map(it => [String((it as any).email).toLowerCase(), it.id as number])
          );
          
          for (let i = 0; i < toInsert.length; i++) {
            const localItem = data.find((d: any) => {
              const snake = toSnakeCase(tableName, d);
              return snake.email && toInsert[i].email && 
                     String(snake.email).toLowerCase() === String(toInsert[i].email).toLowerCase();
            });
            
            if (localItem && toInsert[i].email) {
              const dbId = insertedByEmail.get(String(toInsert[i].email).toLowerCase());
              if (dbId) {
                mapping.set(localItem.id, dbId);
                console.log(`🆕 Mapping new student: local ID ${localItem.id} -> DB ID ${dbId}`);
              }
            }
          }
        }

        if (['checkins', 'payments'].includes(tableName)) {
          const studentMapping = this.idMappings.get('students') ?? new Map();
          for (let i = 0; i < toInsert.length; i++) {
            const rec = toInsert[i] as any;
            if (rec.student_local_id != null) {
              const mapped = studentMapping.get(rec.student_local_id);
              if (mapped == null) {
                console.warn(`⚠️ Missing mapping for student_local_id ${rec.student_local_id}`);
              } else {
                rec.student_id = mapped;
                delete rec.student_local_id;
              }
            }
          }
        }

        console.log(`✅ Inserted ${toInsert.length} records into ${tableName}`);
      }

      for (const item of toUpdate) {
        const { error: updateError } = await supabase
          .from(tableName)
          .update(item)
          .eq("id", item.id);

        if (updateError) {
          console.error(
            `❌ Supabase update error [${tableName}]:`,
            updateError
          );
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

  getMappedId(tableName: string, localId: number): number {
    const mapping = this.idMappings.get(tableName);
    if (!mapping) return localId;
    return mapping.get(localId) || localId;
  }

  async mapForeignKeys(tableName: string, data: any[]): Promise<any[]> {
    if (tableName !== "payments" && tableName !== "checkins") {
      return data;
    }

    const studentsMapping = this.idMappings.get("students");
    if (!studentsMapping) {
      console.warn(`⚠️ No student ID mappings found for ${tableName}`);
      return data;
    }

    return data.map((item) => ({
      ...item,
      studentId: studentsMapping.get(item.studentId) || item.studentId,
    }));
  }

  private isTableKey(key: string): boolean {
    const tables = ["students", "classes", "payments", "checkins"];
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
    this.idMappings.clear();
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  }

  logMappings(): void {
    console.log("🗺️ ID Mappings:", Object.fromEntries(this.idMappings));
  }
}

export const storage = new StorageManager();