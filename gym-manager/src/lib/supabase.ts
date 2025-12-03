// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Variáveis de ambiente do Supabase não configuradas!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Tipos do Database
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          name: string;
          role: 'admin' | 'user';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          plan: string;
          expires: string | null;
          level: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      students: {
        Row: {
          id: number;
          name: string;
          email: string;
          phone: string | null;
          cpf: string | null;
          birth_date: string | null;
          join_date: string;
          plan: string | null;
          monthly_fee: number | null;
          status: 'active' | 'inactive';
          payment_status: 'up-to-date' | 'overdue';
          last_checkin: string | null;
          notes: string | null;
          photo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['students']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['students']['Insert']>;
      };
      classes: {
        Row: {
          id: number;
          name: string;
          instructor: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          capacity: number;
          enrolled: number;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['classes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['classes']['Insert']>;
      };
      payments: {
        Row: {
          id: number;
          student_id: number;
          amount: number;
          date: string;
          method: string | null;
          status: 'paid' | 'pending' | 'overdue';
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      checkins: {
        Row: {
          id: number;
          student_id: number;
          timestamp: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['checkins']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['checkins']['Insert']>;
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          day: string | null;
          category: string | null;
          exercises: string[];
          tags: string[];
          completed: boolean;
          completed_dates: number[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['workouts']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['workouts']['Insert']>;
      };
      measurements: {
        Row: {
          id: string;
          user_id: string;
          date: number;
          weight: number | null;
          height: number | null;
          chest: number | null;
          waist: number | null;
          arm: number | null;
          thigh: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['measurements']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['measurements']['Insert']>;
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string | null;
          unlocked: boolean;
          date: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['achievements']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['achievements']['Insert']>;
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          type: 'weight' | 'workouts' | 'streak' | 'measurements';
          target: number;
          current: number;
          deadline: number;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['goals']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['goals']['Insert']>;
      };
      timer_sessions: {
        Row: {
          id: string;
          user_id: string;
          name: string | null;
          duration: number;
          start_time: number;
          end_time: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['timer_sessions']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['timer_sessions']['Insert']>;
      };
      user_stats: {
        Row: {
          id: string;
          user_id: string;
          volume: number;
          streak: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_stats']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_stats']['Insert']>;
      };
      visits: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          date: string;
          time: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['visits']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['visits']['Insert']>;
      };
    };
  };
};

// Helper Types para facilitar uso
export type User = Database['public']['Tables']['users']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Student = Database['public']['Tables']['students']['Row'];
export type ClassSchedule = Database['public']['Tables']['classes']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type Checkin = Database['public']['Tables']['checkins']['Row'];
export type Workout = Database['public']['Tables']['workouts']['Row'];
export type Measurement = Database['public']['Tables']['measurements']['Row'];
export type Achievement = Database['public']['Tables']['achievements']['Row'];
export type Goal = Database['public']['Tables']['goals']['Row'];
export type TimerSession = Database['public']['Tables']['timer_sessions']['Row'];
export type UserStats = Database['public']['Tables']['user_stats']['Row'];
export type Visit = Database['public']['Tables']['visits']['Row'];

// Insert Types
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type StudentInsert = Database['public']['Tables']['students']['Insert'];
export type ClassInsert = Database['public']['Tables']['classes']['Insert'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type CheckinInsert = Database['public']['Tables']['checkins']['Insert'];
export type WorkoutInsert = Database['public']['Tables']['workouts']['Insert'];
export type MeasurementInsert = Database['public']['Tables']['measurements']['Insert'];
export type AchievementInsert = Database['public']['Tables']['achievements']['Insert'];
export type GoalInsert = Database['public']['Tables']['goals']['Insert'];
export type TimerSessionInsert = Database['public']['Tables']['timer_sessions']['Insert'];
export type UserStatsInsert = Database['public']['Tables']['user_stats']['Insert'];
export type VisitInsert = Database['public']['Tables']['visits']['Insert'];

// Update Types
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type StudentUpdate = Database['public']['Tables']['students']['Update'];
export type ClassUpdate = Database['public']['Tables']['classes']['Update'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];
export type CheckinUpdate = Database['public']['Tables']['checkins']['Update'];
export type WorkoutUpdate = Database['public']['Tables']['workouts']['Update'];
export type MeasurementUpdate = Database['public']['Tables']['measurements']['Update'];
export type AchievementUpdate = Database['public']['Tables']['achievements']['Update'];
export type GoalUpdate = Database['public']['Tables']['goals']['Update'];
export type TimerSessionUpdate = Database['public']['Tables']['timer_sessions']['Update'];
export type UserStatsUpdate = Database['public']['Tables']['user_stats']['Update'];
export type VisitUpdate = Database['public']['Tables']['visits']['Update'];