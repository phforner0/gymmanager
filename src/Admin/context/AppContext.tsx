//gymmanager\src\Admin\services\mockData.ts
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Student, ClassSchedule, Payment, Checkin, AppContextType, ToastType } from '../types';
import { storage } from '../services/storageManager';
import { generateMockData } from '../services/mockData';
import { Toast } from '../components/Toast';

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [toasts, setToasts] = useState<ToastType[]>([]);

  useEffect(() => {
    const loadData = () => {
      const storedStudents = storage.get<Student[]>('students');
      const storedClasses = storage.get<ClassSchedule[]>('classes');
      const storedPayments = storage.get<Payment[]>('payments');
      const storedCheckins = storage.get<Checkin[]>('checkins');

      if (!storedStudents || storedStudents.length === 0) {
        const mockData = generateMockData();
        setStudents(mockData.students);
        setClasses(mockData.classes);
        setPayments(mockData.payments);
        setCheckins(mockData.checkins);
        storage.set('students', mockData.students);
        storage.set('classes', mockData.classes);
        storage.set('payments', mockData.payments);
        storage.set('checkins', mockData.checkins);
      } else {
        setStudents(storedStudents);
        setClasses(storedClasses || []);
        setPayments(storedPayments || []);
        setCheckins(storedCheckins || []);
      }
    };

    loadData();
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const addStudent = useCallback(async (student: Omit<Student, 'id' | 'joinDate' | 'lastCheckin'>) => {
    const newStudent: Student = {
      ...student,
      id: Date.now(),
      joinDate: new Date().toISOString().split('T')[0],
      lastCheckin: new Date().toISOString()
    };
    const updated = [...students, newStudent];
    setStudents(updated);
    storage.set('students', updated);
  }, [students]);

  const updateStudent = useCallback(async (id: number, data: Partial<Student>) => {
    const updated = students.map(s => s.id === id ? { ...s, ...data } : s);
    setStudents(updated);
    storage.set('students', updated);
  }, [students]);

  const deleteStudent = useCallback(async (id: number) => {
    const updated = students.map(s => s.id === id ? { ...s, status: 'inactive' as const } : s);
    setStudents(updated);
    storage.set('students', updated);
  }, [students]);

  const addClass = useCallback(async (cls: Omit<ClassSchedule, 'id'>) => {
    const newClass: ClassSchedule = { ...cls, id: Date.now() };
    const updated = [...classes, newClass];
    setClasses(updated);
    storage.set('classes', updated);
  }, [classes]);

  const updateClass = useCallback(async (id: number, data: Partial<ClassSchedule>) => {
    const updated = classes.map(c => c.id === id ? { ...c, ...data } : c);
    setClasses(updated);
    storage.set('classes', updated);
  }, [classes]);

  const deleteClass = useCallback(async (id: number) => {
    const updated = classes.filter(c => c.id !== id);
    setClasses(updated);
    storage.set('classes', updated);
  }, [classes]);

  const addPayment = useCallback(async (payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = { ...payment, id: Date.now() };
    const updated = [...payments, newPayment];
    setPayments(updated);
    storage.set('payments', updated);
  }, [payments]);

  const updatePayment = useCallback(async (id: number, data: Partial<Payment>) => {
    const updated = payments.map(p => p.id === id ? { ...p, ...data } : p);
    setPayments(updated);
    storage.set('payments', updated);
  }, [payments]);

  const addCheckin = useCallback(async (studentId: number) => {
    const newCheckin: Checkin = {
      id: Date.now(),
      studentId,
      timestamp: new Date().toISOString()
    };
    const updated = [...checkins, newCheckin];
    setCheckins(updated);
    storage.set('checkins', updated);
    
    const updatedStudents = students.map(s => 
      s.id === studentId ? { ...s, lastCheckin: newCheckin.timestamp } : s
    );
    setStudents(updatedStudents);
    storage.set('students', updatedStudents);
  }, [checkins, students]);

  const removeCheckin = useCallback(async (id: number) => {
    const updated = checkins.filter(c => c.id !== id);
    setCheckins(updated);
    storage.set('checkins', updated);
  }, [checkins]);

  const value: AppContextType = {
    students,
    classes,
    payments,
    checkins,
    addStudent,
    updateStudent,
    deleteStudent,
    addClass,
    updateClass,
    deleteClass,
    addPayment,
    updatePayment,
    addCheckin,
    removeCheckin,
    showToast
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      <Toast toasts={toasts} />
    </AppContext.Provider>
  );
};