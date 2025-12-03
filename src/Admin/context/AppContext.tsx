// gymmanager/src/Admin/context/AppContext.tsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Student, ClassSchedule, Payment, Checkin, AppContextType, ToastType } from '../types';
import { storage } from '../services/storageManager';
import { generateMockData } from '../services/mockData';
import { Toast } from '../components/Toast';
import { authService } from '../../LandingPage/services/auth.service';
import { supabase } from '../../lib/supabase';

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

        if (!studentsData || studentsData.length === 0) {
          console.log('🌱 No existing data found. Starting database seed...');
          
          console.log('🗑️ Cleaning database before seed...');
          await storage.clearDatabase();
          
          const mockData = generateMockData();
          console.log('📦 Mock data generated:', {
            students: mockData.students.length,
            classes: mockData.classes.length,
            payments: mockData.payments.length,
            checkins: mockData.checkins.length
          });
          
          console.log('📝 Step 1: Inserting students...');
          await storage.set('students', mockData.students);
          
          console.log('⏳ Waiting for students to be fully inserted...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          console.log('🔄 Reloading students from database...');
          const insertedStudents = await storage.get<Student[]>('students');
          
          if (!insertedStudents || insertedStudents.length === 0) {
            throw new Error('❌ CRITICAL: Students were not inserted! Check database permissions.');
          }
          
          console.log('✅ Students inserted successfully:', insertedStudents.length);
          console.log('🆔 First 5 student IDs from DB:', insertedStudents.slice(0, 5).map(s => ({ id: s.id, email: s.email })));
          
          const emailToDbId = new Map<string, number>();
          insertedStudents.forEach(s => {
            emailToDbId.set(s.email.toLowerCase(), s.id);
          });
          
          console.log('🗺️ Email to DB ID mapping created:', emailToDbId.size, 'entries');
          
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
          
          if (mappedPayments.length > 0) {
            console.log('💾 Inserting payments...');
            await storage.set('payments', mappedPayments);
          }
          
          console.log('📝 Step 3: Mapping checkins...');
          const mappedCheckins = mockData.checkins.map(checkin => {
            const mockStudent = mockData.students.find(s => s.id === checkin.studentId);
            if (!mockStudent) return null;
            
            const dbStudentId = emailToDbId.get(mockStudent.email.toLowerCase());
            if (!dbStudentId) return null;
            
            return { ...checkin, studentId: dbStudentId };
          }).filter(Boolean) as Checkin[];
          
          console.log(`✅ ${mappedCheckins.length}/${mockData.checkins.length} checkins successfully mapped`);
          
          if (mappedCheckins.length > 0) {
            console.log('💾 Inserting checkins...');
            await storage.set('checkins', mappedCheckins);
          }
          
          console.log('📝 Step 4: Inserting classes...');
          await storage.set('classes', mockData.classes);
          
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
    }, 4000); // 4 segundos para dar tempo de ler a senha
  }, []);

  const addStudent = useCallback(async (student: Omit<Student, 'id' | 'joinDate' | 'lastCheckin'>) => {
    try {
      // 🔥 FIX: Garantir que o email e CPF estejam limpos
      const cleanEmail = student.email.trim();
      const cleanCpf = student.cpf.trim();
      
      console.log('➕ Adding new student:', cleanEmail);
      
      // 1. Gerar senha inicial baseada no CPF LIMPO
      const initialPassword = authService.generateInitialPassword(cleanCpf);
      console.log(`🔑 Senha inicial gerada: ${initialPassword}`);

      // 2. Criar usuário usando o email LIMPO
      const userId = await authService.createUser(
        cleanEmail,
        initialPassword,
        student.name.trim(),
        'user'
      );

      if (!userId) {
        throw new Error('Falha ao criar usuário no sistema de autenticação');
      }

      console.log(`✅ Usuário criado com ID: ${userId}`);

      // 3. Criar perfil na tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          plan: student.plan,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          level: 1
        });

      if (profileError) {
        console.error('❌ Erro ao criar perfil:', profileError);
        // Tentar limpar o usuário criado
        await supabase.from('users').delete().eq('id', userId);
        throw new Error('Erro ao criar perfil do aluno');
      }

      console.log('✅ Perfil criado no Supabase');
      
      // 4. Criar student
      const newStudent: Student = {
        ...student,
        email: cleanEmail,
        cpf: cleanCpf,
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
        
        const insertedStudent = reloaded.find(s => 
          s.email.toLowerCase() === newStudent.email.toLowerCase()
        );
        
        if (insertedStudent) {
          console.log('✅ Student inserted with DB ID:', insertedStudent.id);
          
          // Criar pagamento inicial automático
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
      
      // Toast com credenciais - IMPORTANTE!
      showToast(
        `✅ Aluno cadastrado!\n📧 Login: ${student.email}\n🔑 Senha: ${initialPassword}\n\nInforme essas credenciais ao aluno.`,
        'success'
      );
      
      console.log('✅ Aluno adicionado com sucesso');
    } catch (error) {
      console.error('❌ Error adding student:', error);
      showToast(`Erro ao adicionar aluno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
      throw error;
    }
  }, [students]);

  const updateStudent = useCallback(async (id: number, data: Partial<Student>) => {
    try {
      const updated = students.map(s => s.id === id ? { ...s, ...data } : s);
      setStudents(updated);
      await storage.set('students', updated);
      
      // Se o email foi alterado, atualizar também na tabela users
      if (data.email) {
        const student = students.find(s => s.id === id);
        if (student) {
          const { error } = await supabase
            .from('users')
            .update({ email: data.email.toLowerCase() })
            .eq('email', student.email.toLowerCase());

          if (error) {
            console.error('❌ Erro ao atualizar email do usuário:', error);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error updating student:', error);
      throw error;
    }
  }, [students]);

  const deleteStudent = useCallback(async (id: number) => {
    try {
      const student = students.find(s => s.id === id);
      
      // Marcar como inativo ao invés de deletar
      const updated = students.map(s => s.id === id ? { ...s, status: 'inactive' as const } : s);
      setStudents(updated);
      await storage.set('students', updated);
      
      // Também desativar o usuário
      if (student) {
        await supabase
          .from('users')
          .update({ role: 'inactive' })
          .eq('email', student.email.toLowerCase());
      }
    } catch (error) {
      console.error('❌ Error deleting student:', error);
      throw error;
    }
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
    
    const reloaded = await storage.get<Payment[]>('payments');
    if (reloaded) {
      console.log('🔄 Payments reloaded after add:', reloaded.length);
      setPayments(reloaded);
    }
    
    // Atualizar status de pagamento do aluno se necessário
    if (payment.status === 'paid') {
      const updatedStudents = students.map(s =>
        s.id === payment.studentId ? { ...s, paymentStatus: 'paid' as const } : s
      );
      setStudents(updatedStudents);
      await storage.set('students', updatedStudents);
    }
  }, [payments, students]);

  const updatePayment = useCallback(async (id: number, data: Partial<Payment>) => {
    console.log('📝 Updating payment:', id, data);
    const updated = payments.map(p => p.id === id ? { ...p, ...data } : p);
    setPayments(updated);
    await storage.set('payments', updated);
    
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