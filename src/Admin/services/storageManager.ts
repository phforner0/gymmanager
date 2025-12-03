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

function toSnakeCase(tableName: string, obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  const mapping = fieldMappings[tableName] || {};
  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = mapping[key] || key;
    result[snakeKey] = value;
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
  // 🔥 NOVO: Mapa de IDs locais -> IDs do banco
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
          // 🔥 ESTRATÉGIA CORRIGIDA: Sincronização com mapeamento de IDs
          await this.syncToSupabaseWithMapping(key, value);
        }
      }

      this.setToLocalStorage(key, value);
    } catch (error) {
      console.error(`❌ Storage set error [${key}]:`, error);
      this.setToLocalStorage(key, value);
    }
  }

  // 🔥 NOVA FUNÇÃO: Sincronização inteligente com mapeamento de IDs
  private async syncToSupabaseWithMapping(
    tableName: string,
    data: any[]
  ): Promise<void> {
    try {
      // 1. Buscar IDs existentes no Supabase
      // 🔥 FIX: Apenas students tem coluna 'email'
      const selectFields = tableName === "students" ? "id, email" : "id";

       // selecionar colunas de acordo com a tabela para evitar "column ... does not exist"
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

      // Narrow the type for TS: guarantee an array of minimal objects
      const existingList = (existing || []) as Array<{
        id?: number;
        email?: string;
      }>;

      // Filter out items without id to avoid undefined in Set
      const existingIds = new Set(
        existingList.map((item) => item.id).filter(Boolean) as number[]
      );

      // 🔥 Para students: criar mapa email -> id do banco (normalizando email)
     const emailToDbId = new Map<string, number>();
     if (tableName === 'students') {
       existingList.forEach(item => {
         if (item && (item as any).email && item.id != null) {
           emailToDbId.set(String((item as any).email).toLowerCase(), item.id);
         }
       });
     }

     // 🔥 Para checkins/payments não vamos procurar "email" na tabela destino (não existe).
     // O relacionamento será resolvido usando this.idMappings.get('students') que mapeia localId -> dbId.

      // 2. Separar novos registros de atualizações
      const toInsert: any[] = [];
      const toUpdate: any[] = [];

      for (const item of data) {
        const snakeItem = toSnakeCase(tableName, item);

        // 🔥 Para students: verificar se email já existe
        if (
          tableName === "students" &&
          snakeItem.email &&
          emailToDbId.has(snakeItem.email)
        ) {
          const dbId = emailToDbId.get(snakeItem.email)!;
          snakeItem.id = dbId; // Usar o ID do banco
          toUpdate.push(snakeItem);

          // 🔥 Mapear ID local -> ID do banco
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
          // 🔥 Remover o ID para deixar o SERIAL gerar
          const { id, ...itemWithoutId } = snakeItem;
          toInsert.push(itemWithoutId);
        }
      }

      // 3. Inserir novos registros e capturar IDs gerados
      if (toInsert.length > 0) {
        const { data: inserted, error: insertError } = await supabase
          .from(tableName)
          .insert(toInsert)
          .select(selectColumns); // 🔥 CRÍTICO: Selecionar IDs retornados

        if (insertError) {
          console.error(
            `❌ Supabase insert error [${tableName}]:`,
            insertError
          );
          throw insertError;
        }

        // Narrow type for safety
        const insertedList = (inserted || []) as Array<{
          id?: number;
          email?: string;
        }>;

        // 🔥 Mapear IDs locais -> IDs do banco para students
        if (tableName === 'students') {
        // normalize payment_status para o conjunto aceito pelo banco
        const allowed = new Set(['paid', 'pending', 'overdue']);
        const normalize = (val: any) => {
          if (!val && val !== 0) return undefined;
          const s = String(val).toLowerCase();
          if (allowed.has(s)) return s;
          // mapear valores alternativos
          if (s === 'up-to-date' || s === 'up to date' || s === 'uptodate') return 'paid';
          // se for algo inesperado, retornar undefined para usar o default do DB (ou 'pending' se preferir)
          return undefined;
        };
          
          const mapping = this.idMappings.get(tableName)!;
          // normalize emails to lowercase when mapping
          const insertedByEmail = new Map(insertedList
            .filter(it => (it as any).email && it.id != null)
            .map(it => [String((it as any).email).toLowerCase(), it.id as number])
          );
          
          for (let i = 0; i < toInsert.length; i++) {
            const localItem = data.find((d: any) => {
              const snake = toSnakeCase(tableName, d);
              return snake.email && toInsert[i].email && String(snake.email).toLowerCase() === String(toInsert[i].email).toLowerCase();
            });
            
            if (localItem && toInsert[i].email) {
              const dbId = insertedByEmail.get(String(toInsert[i].email).toLowerCase());
              if (dbId) {
                mapping.set(localItem.id, dbId);
                console.log(`🆕 Mapping new student: local ID ${localItem.id} -> DB ID ${dbId} (${toInsert[i].email})`);
              }
            }
          }
        }

        // 🔥 Para tabelas com FK para students (checkins, payments), mapear referências locais -> db IDs
        if (['checkins', 'payments'].includes(tableName)) {
          // espera-se que o payload local contenha `student_local_id` (ou similar)
          const studentMapping = this.idMappings.get('students') ?? new Map();
          // se `toInsert` tiver objetos com student_local_id, substitua por student_id (db)
          for (let i = 0; i < toInsert.length; i++) {
            const rec = toInsert[i] as any;
            if (rec.student_local_id != null) {
              const mapped = studentMapping.get(rec.student_local_id);
              if (mapped == null) {
                console.warn(`⚠️ Missing mapping for student_local_id ${rec.student_local_id} when inserting into ${tableName}`);
                // opcional: remover/ignorar este registro ou setar student_id = null conforme sua política
              } else {
                rec.student_id = mapped;
                delete rec.student_local_id;
              }
            }
          }
        }

        console.log(`✅ Inserted ${toInsert.length} records into ${tableName}`);
      }

      // 4. Atualizar registros existentes
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

  // 🔥 NOVA FUNÇÃO: Obter ID do banco a partir do ID local
  getMappedId(tableName: string, localId: number): number {
    const mapping = this.idMappings.get(tableName);
    if (!mapping) return localId;
    return mapping.get(localId) || localId;
  }

  // 🔥 NOVA FUNÇÃO: Mapear student_id em payments/checkins
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
    this.idMappings.clear(); // 🔥 Limpar mapeamentos também
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  }

  // 🔥 NOVA FUNÇÃO: Debug de mapeamentos
  logMappings(): void {
    console.log("🗺️ ID Mappings:", Object.fromEntries(this.idMappings));
  }
}

export const storage = new StorageManager();
