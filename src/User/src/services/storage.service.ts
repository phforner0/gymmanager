import { UserData, Profile } from '../types';
import { supabaseUserService } from './supabase.service';

class StorageManager {
  private storageKey = 'ai_enhanced_data_v3';
  private useSupabase = false;
  private currentUserId: string | null = null;
  
  // Ativar modo Supabase
  enableSupabase(userId: string) {
    this.useSupabase = true;
    this.currentUserId = userId;
    supabaseUserService.setUserId(userId);
  }

  // Desativar modo Supabase (fallback para localStorage)
  disableSupabase() {
    this.useSupabase = false;
    this.currentUserId = null;
  }

  // ============ GET STORAGE ============
  getStorage(): Record<string, UserData> {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
  
  // ============ SAVE STORAGE ============
  saveStorage(data: Record<string, UserData>): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }
  
  // ============ GET USER DATA ============
  async getUserData(email: string): Promise<UserData> {
    // 🔥 Se Supabase estiver ativo, buscar do banco
    if (this.useSupabase && this.currentUserId) {
      try {
        const [profile, workouts, measurements, achievements, goals, timerHistory, stats] = await Promise.all([
          supabaseUserService.getProfile(this.currentUserId),
          supabaseUserService.getWorkouts(this.currentUserId),
          supabaseUserService.getMeasurements(this.currentUserId),
          supabaseUserService.getAchievements(this.currentUserId),
          supabaseUserService.getGoals(this.currentUserId),
          supabaseUserService.getTimerSessions(this.currentUserId),
          supabaseUserService.getUserStats(this.currentUserId)
        ]);

        // Se não há achievements, inicializar dados padrão
        if (achievements.length === 0) {
          await supabaseUserService.initializeUserData(this.currentUserId);
        }

        return {
          profile: profile || this.getDefaultProfile(email),
          workouts: workouts || [],
          measurements: measurements || [],
          achievements: achievements.length > 0 ? achievements : this.getDefaultAchievements(),
          notes: stats?.notes || '',
          volume: stats?.volume || 0,
          streak: stats?.streak || 0,
          goals: goals || [],
          timerHistory: timerHistory || []
        };
      } catch (error) {
        console.error('❌ Error loading from Supabase, falling back to localStorage:', error);
        return this.getUserDataFromLocalStorage(email);
      }
    }

    // Fallback: localStorage
    return this.getUserDataFromLocalStorage(email);
  }

  // ============ GET FROM LOCALSTORAGE ============
  private getUserDataFromLocalStorage(email: string): UserData {
    const all = this.getStorage();
    if (all[email]) return all[email];
    
    const defaultData = this.getDefaultUserData(email);
    all[email] = defaultData;
    this.saveStorage(all);
    return defaultData;
  }

  // ============ SET USER DATA ============
  async setUserData(email: string, data: UserData): Promise<void> {
    // 🔥 Se Supabase estiver ativo, salvar no banco
    if (this.useSupabase && this.currentUserId) {
      try {
        // Salvar stats
        await supabaseUserService.updateUserStats({
          volume: data.volume,
          streak: data.streak,
          notes: data.notes
        });

        // Salvar workouts modificados
        for (const workout of data.workouts) {
          if (workout.user_id === this.currentUserId) {
            await supabaseUserService.saveWorkout(workout);
          }
        }

        // Salvar goals modificados
        for (const goal of data.goals) {
          if (goal.user_id === this.currentUserId) {
            await supabaseUserService.saveGoal(goal);
          }
        }

        // Salvar achievements modificados
        for (const achievement of data.achievements) {
          if (achievement.unlocked && achievement.user_id === this.currentUserId) {
            await supabaseUserService.saveAchievement(achievement);
          }
        }
      } catch (error) {
        console.error('❌ Error saving to Supabase:', error);
      }
    }

    // Também salvar no localStorage como backup
    const all = this.getStorage();
    all[email] = data;
    this.saveStorage(all);
  }

  // ============ HELPERS ============
  private getDefaultProfile(email: string): Profile {
    return { 
      email, 
      name: 'Usuário Impacto', 
      role: 'user', 
      plan: 'Mensal', 
      expires: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], 
      level: 5 
    };
  }

  private getDefaultAchievements() {
    return [
      { id: 'first', name: 'Primeiro Treino', icon: '🎯', unlocked: false },
      { id: 'week', name: '7 Dias Seguidos', icon: '🔥', unlocked: false },
      { id: 'month', name: '30 Treinos', icon: '💪', unlocked: false },
      { id: 'pr', name: 'Recorde Pessoal', icon: '🏆', unlocked: false }
    ];
  }

  private getDefaultUserData(email: string): UserData {
    return {
      profile: this.getDefaultProfile(email),
      workouts: [
        { 
          id: 'w1', 
          name: 'Peito & Tríceps', 
          day: 'Seg', 
          category: 'Hipertrofia', 
          exercises: [
            'Supino reto 4x8', 
            'Supino inclinado 3x10', 
            'Crucifixo 3x12', 
            'Tríceps testa 3x12'
          ], 
          tags: ['peito', 'triceps'], 
          completed: false, 
          completedDates: [] 
        },
        { 
          id: 'w2', 
          name: 'Costas & Bíceps', 
          day: 'Qua', 
          category: 'Hipertrofia', 
          exercises: [
            'Barra fixa 4x8', 
            'Remada curvada 4x8', 
            'Pulley 3x12', 
            'Rosca direta 3x10'
          ], 
          tags: ['costas', 'biceps'], 
          completed: true, 
          completedDates: [Date.now() - 2 * 86400000] 
        }
      ],
      measurements: [
        { 
          date: Date.now() - 30 * 86400000, 
          weight: 75, 
          height: 175, 
          chest: 100, 
          waist: 80, 
          arm: 38, 
          thigh: 55, 
          notes: 'Medida inicial' 
        }
      ],
      achievements: this.getDefaultAchievements(),
      notes: '',
      volume: 0,
      streak: 0,
      goals: [
        { 
          id: 'g1', 
          type: 'workouts', 
          target: 12, 
          current: 0, 
          deadline: Date.now() + 15 * 86400000, 
          title: '12 treinos este mês' 
        }
      ],
      timerHistory: []
    };
  }
}

export const storage = new StorageManager();