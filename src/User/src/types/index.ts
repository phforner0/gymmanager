//C:\Games\gymmanager\src\User\src\types\index.ts
// Profile Types
export interface Profile {
  email: string;
  name: string;
  role: string;
  plan: string;
  expires: string;
  level: number;
}

// Workout Types
export interface Workout {
  id: string;
  name: string;
  day: string;
  category: string;
  exercises: string[];
  tags: string[];
  completed: boolean;
  completedDates: number[];
}

// Measurement Types
export interface Measurement {
  date: number;
  weight: number | null;
  height: number | null;
  chest: number | null;
  waist: number | null;
  arm: number | null;
  thigh: number | null;
  notes: string;
}

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
  date?: number;
}

// Goal Types
export interface Goal {
  id: string;
  type: 'weight' | 'workouts' | 'streak' | 'measurements';
  target: number;
  current: number;
  deadline: number;
  title: string;
}

// Timer Types
export interface TimerSession {
  id: string;
  name: string;
  duration: number;
  startTime: number;
  endTime?: number;
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