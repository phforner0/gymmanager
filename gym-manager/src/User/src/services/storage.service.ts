import { UserData, Profile } from '../types';

class StorageManager {
  private storageKey = 'ai_enhanced_data_v3';
  
  getStorage(): Record<string, UserData> {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
  
  saveStorage(data: Record<string, UserData>): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }
  
  getUserData(email: string): UserData {
    const all = this.getStorage();
    if (all[email]) return all[email];
    
    const defaultData: UserData = {
      profile: { 
        email, 
        name: 'Usuário Impacto', 
        role: 'user', 
        plan: 'Mensal', 
        expires: '2025-12-31', 
        level: 5 
      },
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
        },
        { 
          date: Date.now() - 60 * 86400000, 
          weight: 77, 
          height: 175, 
          chest: 98, 
          waist: 82, 
          arm: 37, 
          thigh: 54, 
          notes: 'Medida anterior' 
        }
      ],
      achievements: [
        { 
          id: 'first', 
          name: 'Primeiro Treino', 
          icon: '🎯', 
          unlocked: true, 
          date: Date.now() - 30 * 86400000 
        },
        { 
          id: 'week', 
          name: '7 Dias Seguidos', 
          icon: '🔥', 
          unlocked: true, 
          date: Date.now() - 7 * 86400000 
        },
        { 
          id: 'month', 
          name: '30 Treinos', 
          icon: '💪', 
          unlocked: false 
        },
        { 
          id: 'pr', 
          name: 'Recorde Pessoal', 
          icon: '🏆', 
          unlocked: false 
        }
      ],
      notes: '',
      volume: 0,
      streak: 7,
      goals: [
        { 
          id: 'g1', 
          type: 'workouts', 
          target: 12, 
          current: 7, 
          deadline: Date.now() + 15 * 86400000, 
          title: '12 treinos este mês' 
        },
        { 
          id: 'g2', 
          type: 'weight', 
          target: 80, 
          current: 75, 
          deadline: Date.now() + 60 * 86400000, 
          title: 'Atingir 80kg' 
        }
      ],
      timerHistory: []
    };
    
    all[email] = defaultData;
    this.saveStorage(all);
    return defaultData;
  }
  
  setUserData(email: string, data: UserData): void {
    const all = this.getStorage();
    all[email] = data;
    this.saveStorage(all);
  }
}

export const storage = new StorageManager();