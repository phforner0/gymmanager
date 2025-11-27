export interface Student {
    id: number;
    name: string;
    email: string;
    phone: string;
    cpf: string;
    birthDate: string;
    joinDate: string;
    plan: string;
    monthlyFee: number;
    status: 'active' | 'inactive';
    paymentStatus: 'up-to-date' | 'overdue';
    lastCheckin: string;
    notes: string;
    photo: string | null;
  }
  
  export interface ClassSchedule {
    id: number;
    name: string;
    instructor: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    capacity: number;
    enrolled: number;
    description: string;
  }
  
  export interface Payment {
    id: number;
    studentId: number;
    amount: number;
    date: string;
    method: string;
    status: 'paid' | 'pending' | 'overdue';
    description: string;
  }
  
  export interface Checkin {
    id: number;
    studentId: number;
    timestamp: string;
  }
  
  export interface AppContextType {
    students: Student[];
    classes: ClassSchedule[];
    payments: Payment[];
    checkins: Checkin[];
    addStudent: (student: Omit<Student, 'id' | 'joinDate' | 'lastCheckin'>) => Promise<void>;
    updateStudent: (id: number, data: Partial<Student>) => Promise<void>;
    deleteStudent: (id: number) => Promise<void>;
    addClass: (cls: Omit<ClassSchedule, 'id'>) => Promise<void>;
    updateClass: (id: number, data: Partial<ClassSchedule>) => Promise<void>;
    deleteClass: (id: number) => Promise<void>;
    addPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
    updatePayment: (id: number, data: Partial<Payment>) => Promise<void>;
    addCheckin: (studentId: number) => Promise<void>;
    removeCheckin: (id: number) => Promise<void>;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  }
  
  export interface ToastType {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
  }