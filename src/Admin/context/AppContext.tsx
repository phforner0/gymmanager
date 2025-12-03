//gymmanager\src\Admin\context\AppContext.tsx
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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('🚀 Initializing AppContext...');
        
        // 🔥 PASSO 1: Tentar carregar dados existentes do Supabase
        const studentsData = await storage.get<Student[]>('students');
        const classesData = await storage.get<ClassSchedule[]>('classes');
        const paymentsData = await storage.get<Payment[]>('payments');
        const checkinsData = await storage.get<Checkin[]>('checkins');

        console.log('📊 Data loaded:', {
          students: studentsData?.length || 0,
          classes: classesData?.length || 0,
          payments: paymentsData?.length || 0,
          checkins: checkinsData?.length || 0
        });

        // 🔥 PASSO 2: Se não houver dados, gerar mock e inserir NA ORDEM CORRETA
        if (!studentsData || studentsData.length === 0) {
          console.log('🌱 No existing data found. Starting database seed...');
          
          // 🔥 IMPORTANTE: Limpar banco para evitar conflitos de foreign key
          console.log('🗑️ Cleaning database before seed...');
          await storage.clearDatabase();
          
          const mockData = generateMockData();
          console.log('📦 Mock data generated:', {
            students: mockData.students.length,
            classes: mockData.classes.length,
            payments: mockData.payments.length,
            checkins: mockData.checkins.length
          });
          
          // 🔥 ETAPA 1: Inserir APENAS students primeiro
          console.log('📝 Step 1: Inserting students...');
          await storage.set('students', mockData.students);
          
          // 🔥 ETAPA 2: Aguardar para garantir que students foram inseridos
          console.log('⏳ Waiting for students to be fully inserted...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // 🔥 ETAPA 3: Recarregar students para obter IDs REAIS do banco
          console.log('🔄 Reloading students from database...');
          const insertedStudents = await storage.get<Student[]>('students');
          
          if (!insertedStudents || insertedStudents.length === 0) {
            throw new Error('❌ CRITICAL: Students were not inserted! Check database permissions.');
          }
          
          console.log('✅ Students inserted successfully:', insertedStudents.length);
          console.log('🆔 First 5 student IDs from DB:', insertedStudents.slice(0, 5).map(s => ({ id: s.id, email: s.email })));
          
          // 🔥 ETAPA 4: Criar mapeamento de emails para IDs do banco
          const emailToDbId = new Map<string, number>();
          insertedStudents.forEach(s => {
            emailToDbId.set(s.email.toLowerCase(), s.id);
          });
          
          console.log('🗺️ Email to DB ID mapping created:', emailToDbId.size, 'entries');
          console.log('📋 First 5 mappings:', 
            Array.from(emailToDbId.entries()).slice(0, 5).map(([email, id]) => ({ email, dbId: id }))
          );
          
          // 🔥 ETAPA 5: Mapear payments usando emails
          console.log('📝 Step 2: Mapping payments...');
          const mappedPayments = mockData.payments.map(payment => {
            const mockStudent = mockData.students.find(s => s.id === payment.studentId);
            if (!mockStudent) {
              console.error(`❌ Mock student not found for payment studentId ${payment.studentId}`);
              return null;
            }
            
            const dbStudentId = emailToDbId.get(mockStudent.email.toLowerCase());
            if (!dbStudentId) {
              console.error(`❌ DB student ID not found for email ${mockStudent.email}`);
              return null;
            }
            
            console.log(`🔗 Payment mapped: mock ${payment.studentId} (${mockStudent.email}) -> DB ${dbStudentId}`);
            return { ...payment, studentId: dbStudentId };
          }).filter(Boolean) as Payment[];
          
          console.log(`✅ ${mappedPayments.length}/${mockData.payments.length} payments successfully mapped`);
          
          if (mappedPayments.length === 0) {
            console.warn('⚠️ No payments to insert, skipping...');
          } else {
            console.log('💾 Inserting payments...');
            await storage.set('payments', mappedPayments);
          }
          
          // 🔥 ETAPA 6: Mapear checkins usando emails
          console.log('📝 Step 3: Mapping checkins...');
          const mappedCheckins = mockData.checkins.map(checkin => {
            const mockStudent = mockData.students.find(s => s.id === checkin.studentId);
            if (!mockStudent) {
              console.error(`❌ Mock student not found for checkin studentId ${checkin.studentId}`);
              return null;
            }
            
            const dbStudentId = emailToDbId.get(mockStudent.email.toLowerCase());
            if (!dbStudentId) {
              console.error(`❌ DB student ID not found for email ${mockStudent.email}`);
              return null;
            }
            
            return { ...checkin, studentId: dbStudentId };
          }).filter(Boolean) as Checkin[];
          
          console.log(`✅ ${mappedCheckins.length}/${mockData.checkins.length} checkins successfully mapped`);
          
          if (mappedCheckins.length === 0) {
            console.warn('⚠️ No checkins to insert, skipping...');
          } else {
            console.log('💾 Inserting checkins...');
            await storage.set('checkins', mappedCheckins);
          }
          
          // 🔥 ETAPA 7: Inserir classes (independente)
          console.log('📝 Step 4: Inserting classes...');
          await storage.set('classes', mockData.classes);
          
          // 🔥 ETAPA 8: Aguardar e recarregar todos os dados
          console.log('⏳ Waiting for final sync...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const finalStudents = await storage.get<Student[]>('students');
          const finalPayments = await storage.get<Payment[]>('payments');
          const finalCheckins = await storage.get<Checkin[]>('checkins');
          const finalClasses = await storage.get<ClassSchedule[]>('classes');
          
          console.log('✅ Final data loaded:', {
            students: finalStudents?.length || 0,
            payments: finalPayments?.length || 0,
            checkins: finalCheckins?.length || 0,
            classes: finalClasses?.length || 0
          });
          
          setStudents(finalStudents || []);
          setPayments(finalPayments || []);
          setCheckins(finalCheckins || []);
          setClasses(finalClasses || []);
          
          console.log('🎉 Seed complete!');
        } else {
          // Carregar dados existentes
          console.log('📂 Loading existing data...');
          setStudents(studentsData || []);
          setClasses(classesData || []);
          setPayments(paymentsData || []);
          setCheckins(checkinsData || []);
          
          console.log('✅ Existing data loaded');
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        showToast('Erro ao carregar dados', 'error');
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const addStudent = useCallback(async (student: Omit<Student, 'id' | 'joinDate' | 'lastCheckin'>) => {
    try {
      console.log('➕ Adding new student...');
      
      const newStudent: Student = {
        ...student,
        id: Date.now(),
        joinDate: new Date().toISOString().split('T')[0],
        lastCheckin: new Date().toISOString(),
        paymentStatus: student.paymentStatus || 'pending'
      };
      
      const updated = [...students, newStudent];
      setStudents(updated);
      await storage.set('students', updated);
      
      // Recarregar para obter ID do banco
      await new Promise(resolve => setTimeout(resolve, 500));
      const reloaded = await storage.get<Student[]>('students');
      if (reloaded) {
        setStudents(reloaded);
        
        // 🔥 NOVO: Encontrar o aluno recém-inserido
        const insertedStudent = reloaded.find(s => 
          s.email.toLowerCase() === newStudent.email.toLowerCase()
        );
        
        if (insertedStudent) {
          console.log('✅ Student inserted with DB ID:', insertedStudent.id);
          
          // 🔥 CRIAR PAGAMENTO INICIAL AUTOMÁTICO
          const initialPayment: Omit<Payment, 'id'> = {
            studentId: insertedStudent.id,
            amount: insertedStudent.monthlyFee,
            date: new Date().toISOString().split('T')[0],
            method: 'Pendente',
            status: 'pending',
            description: 'Primeira mensalidade'
          };
          
          console.log('💰 Creating initial payment:', initialPayment);
          await addPayment(initialPayment);
        }
      }
    } catch (error) {
      console.error('❌ Error adding student:', error);
      throw error;
    }
  }, [students]);

  const updateStudent = useCallback(async (id: number, data: Partial<Student>) => {
    const updated = students.map(s => s.id === id ? { ...s, ...data } : s);
    setStudents(updated);
    await storage.set('students', updated);
  }, [students]);

  const deleteStudent = useCallback(async (id: number) => {
    const updated = students.map(s => s.id === id ? { ...s, status: 'inactive' as const } : s);
    setStudents(updated);
    await storage.set('students', updated);
  }, [students]);

  const addClass = useCallback(async (cls: Omit<ClassSchedule, 'id'>) => {
    const newClass: ClassSchedule = { ...cls, id: Date.now() };
    const updated = [...classes, newClass];
    setClasses(updated);
    await storage.set('classes', updated);
  }, [classes]);

  const updateClass = useCallback(async (id: number, data: Partial<ClassSchedule>) => {
    const updated = classes.map(c => c.id === id ? { ...c, ...data } : c);
    setClasses(updated);
    await storage.set('classes', updated);
  }, [classes]);

  const deleteClass = useCallback(async (id: number) => {
    const updated = classes.filter(c => c.id !== id);
    setClasses(updated);
    await storage.set('classes', updated);
  }, [classes]);

  const addPayment = useCallback(async (payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = { ...payment, id: Date.now() };
    const updated = [...payments, newPayment];
    setPayments(updated);
    await storage.set('payments', updated);
    
    // Recarregar para sincronizar
    const reloaded = await storage.get<Payment[]>('payments');
    if (reloaded) {
      console.log('🔄 Payments reloaded after add:', reloaded.length);
      setPayments(reloaded);
    }
  }, [payments]);

  const updatePayment = useCallback(async (id: number, data: Partial<Payment>) => {
    console.log('📝 Updating payment:', id, data);
    const updated = payments.map(p => p.id === id ? { ...p, ...data } : p);
    setPayments(updated);
    await storage.set('payments', updated);
    
    // Recarregar para sincronizar
    const reloaded = await storage.get<Payment[]>('payments');
    if (reloaded) {
      console.log('🔄 Payments reloaded after update:', reloaded.length);
      setPayments(reloaded);
    }
  }, [payments]);

  const addCheckin = useCallback(async (studentId: number) => {
    const newCheckin: Checkin = {
      id: Date.now(),
      studentId,
      timestamp: new Date().toISOString()
    };
    const updated = [...checkins, newCheckin];
    setCheckins(updated);
    await storage.set('checkins', updated);
    
    const updatedStudents = students.map(s => 
      s.id === studentId ? { ...s, lastCheckin: newCheckin.timestamp } : s
    );
    setStudents(updatedStudents);
    await storage.set('students', updatedStudents);
  }, [checkins, students]);

  const removeCheckin = useCallback(async (id: number) => {
    const updated = checkins.filter(c => c.id !== id);
    setCheckins(updated);
    await storage.set('checkins', updated);
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

  // Mostrar loading enquanto inicializa
  if (!isInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #e5e7eb', 
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{ color: '#6b7280' }}>Carregando dados...</div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={value}>
      {children}
      <Toast toasts={toasts} />
    </AppContext.Provider>
  );
};