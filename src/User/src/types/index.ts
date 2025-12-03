// Profile Types
export interface Profile {
  email: string;
  name: string;
  role: string;
  plan: string;
  expires: string;
  level: number;
  user_id?: string; // 🔥 ID do Supabase
}

// Workout Types
export interface Workout {
  id: string;
  user_id?: string; // 🔥 FK para Supabase
  name: string;
  day: string;
  category: string;
  exercises: string[];
  tags: string[];
  completed: boolean;
  completedDates: number[];
  created_at?: string;
  updated_at?: string;
}

// Measurement Types
export interface Measurement {
  id?: string; // 🔥 UUID do Supabase
  user_id?: string;
  date: number;
  weight: number | null;
  height: number | null;
  chest: number | null;
  waist: number | null;
  arm: number | null;
  thigh: number | null;
  notes: string;
  created_at?: string;
}

// Achievement Types
export interface Achievement {
  id: string;
  user_id?: string;
  name: string;
  icon: string;
  unlocked: boolean;
  date?: number;
  created_at?: string;
}

// Goal Types
export interface Goal {
  id: string;
  user_id?: string;
  type: 'weight' | 'workouts' | 'streak' | 'measurements';
  target: number;
  current: number;
  deadline: number;
  title: string;
  created_at?: string;
  updated_at?: string;
}

// Timer Types
export interface TimerSession {
  id: string;
  user_id?: string;
  name: string;
  duration: number;
  startTime: number;
  endTime?: number;
  created_at?: string;
}

// User Stats Types
export interface UserStats {
  id?: string;
  user_id: string;
  volume: number;
  streak: number;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

// User Data Types
export interface UserData {
  profile: Profile;
  workouts: Workout[];
  measurements: Measurement[];
  achievements: Achievement[];
  notes: string;
  volume: number;
  streak: number;
  goals: Goal[];
  timerHistory: TimerSession[];
}

// Storage Types
export interface Storage {
  [email: string]: UserData;
}

// Validation Types
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Component Props Types
export interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export interface ToastProps {
  message: string | null;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'ghost' | 'success';
  size?: 'sm' | 'md';
}

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'info';
}