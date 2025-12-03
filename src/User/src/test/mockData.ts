// ============ gymmanager\src\User\src\test\mockData.ts ============
import { UserData, Workout, Measurement, Achievement, Goal } from '../types'

export const mockWorkout: Workout = {
  id: 'w1',
  name: 'Peito & TrÃ­ceps',
  day: 'Seg',
  category: 'Hipertrofia',
  exercises: ['Supino reto 4x8', 'Supino inclinado 3x10'],
  tags: ['peito', 'triceps'],
  completed: false,
  completedDates: []
}

export const mockMeasurement: Measurement = {
  date: Date.now(),
  weight: 75,
  height: 175,
  chest: 100,
  waist: 80,
  arm: 38,
  thigh: 55,
  notes: 'Teste'
}

export const mockAchievement: Achievement = {
  id: 'first',
  name: 'Primeiro Treino',
  icon: 'ðŸŽ¯',
  unlocked: true,
  date: Date.now()
}

export const mockGoal: Goal = {
  id: 'g1',
  type: 'workouts',
  target: 12,
  current: 7,
  deadline: Date.now() + 15 * 86400000,
  title: '12 treinos este mÃªs'
}

export const mockUserData: UserData = {
  profile: {
    email: 'teste@impacto.local',
    name: 'UsuÃ¡rio Teste',
    role: 'user',
    plan: 'Mensal',
    expires: '2025-12-31',
    level: 5
  },
  workouts: [mockWorkout],
  measurements: [mockMeasurement],
  achievements: [mockAchievement],
  notes: '',
  volume: 0,
  streak: 7,
  goals: [mockGoal],
  timerHistory: []
}
