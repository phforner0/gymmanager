import { supabase } from '../../../lib/supabase';
import { 
  Workout, 
  Measurement, 
  Achievement, 
  Goal, 
  TimerSession, 
  UserStats,
  Profile 
} from '../types';

export class SupabaseUserService {
  private userId: string | null = null;

  setUserId(userId: string) {
    this.userId = userId;
  }

  // ============ PROFILE ============
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, name, role')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      return {
        email: user.email || '',
        name: user.name || 'Usuário',
        role: user.role || 'user',
        plan: profile?.plan || 'Mensal',
        expires: profile?.expires || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        level: profile?.level || 1,
        user_id: userId
      };
    } catch (error) {
      console.error('❌ Error getting profile:', error);
      return null;
    }
  }

  // ============ WORKOUTS ============
  async getWorkouts(userId: string): Promise<Workout[]> {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(w => ({
        id: w.id,
        user_id: w.user_id,
        name: w.name,
        day: w.day || '',
        category: w.category || 'Geral',
        exercises: Array.isArray(w.exercises) ? w.exercises : [],
        tags: Array.isArray(w.tags) ? w.tags : [],
        completed: w.completed || false,
        completedDates: Array.isArray(w.completed_dates) ? w.completed_dates : [],
        created_at: w.created_at,
        updated_at: w.updated_at
      }));
    } catch (error) {
      console.error('❌ Error getting workouts:', error);
      return [];
    }
  }

  async saveWorkout(workout: Workout): Promise<boolean> {
    if (!this.userId) return false;

    try {
      const { error } = await supabase
        .from('workouts')
        .upsert({
          id: workout.id,
          user_id: this.userId,
          name: workout.name,
          day: workout.day,
          category: workout.category,
          exercises: workout.exercises,
          tags: workout.tags,
          completed: workout.completed,
          completed_dates: workout.completedDates
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Error saving workout:', error);
      return false;
    }
  }

  async deleteWorkout(workoutId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Error deleting workout:', error);
      return false;
    }
  }

  // ============ MEASUREMENTS ============
  async getMeasurements(userId: string): Promise<Measurement[]> {
    try {
      const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      return (data || []).map(m => ({
        id: m.id,
        user_id: m.user_id,
        date: m.date,
        weight: m.weight,
        height: m.height,
        chest: m.chest,
        waist: m.waist,
        arm: m.arm,
        thigh: m.thigh,
        notes: m.notes || '',
        created_at: m.created_at
      }));
    } catch (error) {
      console.error('❌ Error getting measurements:', error);
      return [];
    }
  }

  async saveMeasurement(measurement: Measurement): Promise<boolean> {
    if (!this.userId) return false;

    try {
      const { error } = await supabase
        .from('measurements')
        .insert({
          user_id: this.userId,
          date: measurement.date,
          weight: measurement.weight,
          height: measurement.height,
          chest: measurement.chest,
          waist: measurement.waist,
          arm: measurement.arm,
          thigh: measurement.thigh,
          notes: measurement.notes
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Error saving measurement:', error);
      return false;
    }
  }

  // ============ ACHIEVEMENTS ============
  async getAchievements(userId: string): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      return (data || []).map(a => ({
        id: a.id,
        user_id: a.user_id,
        name: a.name,
        icon: a.icon,
        unlocked: a.unlocked,
        date: a.date,
        created_at: a.created_at
      }));
    } catch (error) {
      console.error('❌ Error getting achievements:', error);
      return [];
    }
  }

  async saveAchievement(achievement: Achievement): Promise<boolean> {
    if (!this.userId) return false;

    try {
      const { error } = await supabase
        .from('achievements')
        .upsert({
          id: achievement.id,
          user_id: this.userId,
          name: achievement.name,
          icon: achievement.icon,
          unlocked: achievement.unlocked,
          date: achievement.date
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Error saving achievement:', error);
      return false;
    }
  }

  // ============ GOALS ============
  async getGoals(userId: string): Promise<Goal[]> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(g => ({
        id: g.id,
        user_id: g.user_id,
        type: g.type as 'weight' | 'workouts' | 'streak' | 'measurements',
        target: g.target,
        current: g.current,
        deadline: g.deadline,
        title: g.title,
        created_at: g.created_at,
        updated_at: g.updated_at
      }));
    } catch (error) {
      console.error('❌ Error getting goals:', error);
      return [];
    }
  }

  async saveGoal(goal: Goal): Promise<boolean> {
    if (!this.userId) return false;

    try {
      const { error } = await supabase
        .from('goals')
        .upsert({
          id: goal.id,
          user_id: this.userId,
          type: goal.type,
          target: goal.target,
          current: goal.current,
          deadline: goal.deadline,
          title: goal.title
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Error saving goal:', error);
      return false;
    }
  }

  async deleteGoal(goalId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Error deleting goal:', error);
      return false;
    }
  }

  // ============ TIMER SESSIONS ============
  async getTimerSessions(userId: string): Promise<TimerSession[]> {
    try {
      const { data, error } = await supabase
        .from('timer_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map(t => ({
        id: t.id,
        user_id: t.user_id,
        name: t.name || '',
        duration: t.duration,
        startTime: t.start_time,
        endTime: t.end_time,
        created_at: t.created_at
      }));
    } catch (error) {
      console.error('❌ Error getting timer sessions:', error);
      return [];
    }
  }

  async saveTimerSession(session: TimerSession): Promise<boolean> {
    if (!this.userId) return false;

    try {
      const { error } = await supabase
        .from('timer_sessions')
        .insert({
          id: session.id,
          user_id: this.userId,
          name: session.name,
          duration: session.duration,
          start_time: session.startTime,
          end_time: session.endTime
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Error saving timer session:', error);
      return false;
    }
  }

  // ============ USER STATS ============
  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Stats não existem, criar
        return await this.createUserStats(userId);
      }

      if (error) throw error;

      return {
        id: data.id,
        user_id: data.user_id,
        volume: data.volume || 0,
        streak: data.streak || 0,
        notes: data.notes || '',
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('❌ Error getting user stats:', error);
      return null;
    }
  }

  async createUserStats(userId: string): Promise<UserStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .insert({
          user_id: userId,
          volume: 0,
          streak: 0,
          notes: ''
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        user_id: data.user_id,
        volume: data.volume || 0,
        streak: data.streak || 0,
        notes: data.notes || ''
      };
    } catch (error) {
      console.error('❌ Error creating user stats:', error);
      return null;
    }
  }

  async updateUserStats(stats: Partial<UserStats>): Promise<boolean> {
    if (!this.userId) return false;

    try {
      const { error } = await supabase
        .from('user_stats')
        .update({
          volume: stats.volume,
          streak: stats.streak,
          notes: stats.notes
        })
        .eq('user_id', this.userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Error updating user stats:', error);
      return false;
    }
  }

  // ============ INITIALIZE USER DATA ============
  async initializeUserData(userId: string): Promise<boolean> {
    try {
      // Criar achievements padrão
      const defaultAchievements = [
        { id: 'first', name: 'Primeiro Treino', icon: '🎯', user_id: userId },
        { id: 'week', name: '7 Dias Seguidos', icon: '🔥', user_id: userId },
        { id: 'month', name: '30 Treinos', icon: '💪', user_id: userId },
        { id: 'pr', name: 'Recorde Pessoal', icon: '🏆', user_id: userId }
      ];

      await supabase.from('achievements').upsert(defaultAchievements);
      await this.createUserStats(userId);

      return true;
    } catch (error) {
      console.error('❌ Error initializing user data:', error);
      return false;
    }
  }
}

export const supabaseUserService = new SupabaseUserService();