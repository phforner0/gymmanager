// gymmanager/src/Admin/context/AppContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Student, ClassSchedule, Payment, Checkin, AppContextType, ToastType } from '../types';
import { storage } from '../services/storageManager';
import { generateMockData } from '../services/mockData';
import { supabase } from '../../lib/supabase';
import { authService } from '../../LandingPage/services/auth.service';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Carregar dados do storage
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('📊 Carregando dados do storage...');
        
        const [loadedStudents, loadedClasses, loadedPayments, loadedCheckins] = await Promise.all([
          storage.get<Student[]>('students'),
          storage.get<ClassSchedule[]>('classes'),
          storage.get<Payment[]>('payments'),
          storage.get<Checkin[]>('checkins')
        ]);

        if (!loadedStudents || loadedStudents.length === 0) {
          console.log('⚙️ Gerando dados mock iniciais...');
          const mockData = generateMockData();
          
          setStudents(mockData.students);
          setClasses(mockData.classes);
          setPayments(mockData.payments);
          setCheckins(mockData.checkins);
          
          await Promise.all([
            storage.set('students', mockData.students),
            storage.set('classes', mockData.classes),
            storage.set('payments', mockData.payments),
            storage.set('checkins', mockData.checkins)
          ]);
          
          showToast('Dados iniciais carregados', 'success');
        } else {
          setStudents(loadedStudents);
          setClasses(loadedClasses || []);
          setPayments(loadedPayments || []);
          setCheckins(loadedCheckins || []);
          
          console.log('✅ Dados carregados:', {
            students: loadedStudents.length,
            classes: loadedClasses?.length || 0,
            payments: loadedPayments?.length || 0,
            checkins: loadedCheckins?.length || 0
          });
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        showToast('Erro ao carregar dados', 'error');
      }
    };

    loadData();
  }, []);

  // Salvar dados quando mudarem
  useEffect(() => {
    if (!isInitialized) return;

    const saveData = async () => {
      try {
        await Promise.all([
          storage.set('students', students),
          storage.set('classes', classes),
          storage.set('payments', payments),
          storage.set('checkins', checkins)
        ]);
        console.log('💾 Dados salvos no storage');
      } catch (error) {
        console.error('❌ Erro ao salvar dados:', error);
      }
    };

    saveData();
  }, [students, classes, payments, checkins, isInitialized]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // ============ STUDENTS ============
  const addStudent = async (studentData: Omit<Student, 'id' | 'joinDate' | 'lastCheckin'>) => {
    try {
      console.log('➕ Adicionando aluno:', studentData);

      // 1. Gerar senha inicial baseada no CPF
      const initialPassword = authService.generateInitialPassword(studentData.cpf);
      console.log(`🔑 Senha inicial gerada: ${initialPassword}`);

      // 2. Criar usuário na tabela users
      const userId = await authService.createUser(
        studentData.email,
        initialPassword,
        studentData.name,
        'user'
      );

      if (!userId) {
        throw new Error('Falha ao criar usuário');
      }

      console.log(`✅ Usuário criado com ID: ${userId}`);

      // 3. Criar perfil na tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          plan: studentData.plan,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          level: 1
        });

      if (profileError) {
        console.error('❌ Erro ao criar perfil:', profileError);
        throw profileError;
      }

      // 4. Criar student
      const newStudent: Student = {
        ...studentData,
        id: Date.now(),
        joinDate: new Date().toISOString().split('T')[0],
        lastCheckin: new Date().toISOString(),
        paymentStatus: studentData.paymentStatus || 'pending'
      };

      setStudents(prev => [...prev, newStudent]);
      
      showToast(
        `✅ Aluno criado! Login: ${studentData.email} | Senha: ${initialPassword}`,
        'success'
      );

      console.log('✅ Aluno adicionado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao adicionar aluno:', error);
      showToast('Erro ao adicionar aluno', 'error');
      throw error;
    }
  };

  const updateStudent = async (id: number, data: Partial<Student>) => {
    try {
      console.log('📝 Atualizando aluno:', id, data);

      setStudents(prev =>
        prev.map(s => (s.id === id ? { ...s, ...data } : s))
      );

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

      console.log('✅ Aluno atualizado');
    } catch (error) {
      console.error('❌ Erro ao atualizar aluno:', error);
      showToast('Erro ao atualizar aluno', 'error');
      throw error;
    }
  };

  const deleteStudent = async (id: number) => {
    try {
      console.log('🗑️ Arquivando aluno:', id);

      const student = students.find(s => s.id === id);
      if (!student) {
        throw new Error('Aluno não encontrado');
      }

      // Marcar como inativo ao invés de deletar
      setStudents(prev =>
        prev.map(s => (s.id === id ? { ...s, status: 'inactive' } : s))
      );

      // Opcionalmente, também desativar o usuário
      await supabase
        .from('users')
        .update({ role: 'inactive' })
        .eq('email', student.email.toLowerCase());

      console.log('✅ Aluno arquivado');
    } catch (error) {
      console.error('❌ Erro ao arquivar aluno:', error);
      showToast('Erro ao arquivar aluno', 'error');
      throw error;
    }
  };

  // ============ CLASSES ============
  const addClass = async (classData: Omit<ClassSchedule, 'id'>) => {
    try {
      const newClass: ClassSchedule = {
        ...classData,
        id: Date.now()
      };
      setClasses(prev => [...prev, newClass]);
      console.log('✅ Aula adicionada');
    } catch (error) {
      console.error('❌ Erro ao adicionar aula:', error);
      throw error;
    }
  };

  const updateClass = async (id: number, data: Partial<ClassSchedule>) => {
    try {
      setClasses(prev =>
        prev.map(c => (c.id === id ? { ...c, ...data } : c))
      );
      console.log('✅ Aula atualizada');
    } catch (error) {
      console.error('❌ Erro ao atualizar aula:', error);
      throw error;
    }
  };

  const deleteClass = async (id: number) => {
    try {
      setClasses(prev => prev.filter(c => c.id !== id));
      console.log('✅ Aula removida');
    } catch (error) {
      console.error('❌ Erro ao remover aula:', error);
      throw error;
    }
  };

  // ============ PAYMENTS ============
  const addPayment = async (paymentData: Omit<Payment, 'id'>) => {
    try {
      const newPayment: Payment = {
        ...paymentData,
        id: Date.now()
      };
      setPayments(prev => [...prev, newPayment]);
      
      // Atualizar status de pagamento do aluno
      if (paymentData.status === 'paid') {
        setStudents(prev =>
          prev.map(s =>
            s.id === paymentData.studentId
              ? { ...s, paymentStatus: 'paid' }
              : s
          )
        );
      }
      
      console.log('✅ Pagamento adicionado');
    } catch (error) {
      console.error('❌ Erro ao adicionar pagamento:', error);
      throw error;
    }
  };

  const updatePayment = async (id: number, data: Partial<Payment>) => {
    try {
      setPayments(prev =>
        prev.map(p => (p.id === id ? { ...p, ...data } : p))
      );
      console.log('✅ Pagamento atualizado');
    } catch (error) {
      console.error('❌ Erro ao atualizar pagamento:', error);
      throw error;
    }
  };

  // ============ CHECKINS ============
  const addCheckin = async (studentId: number) => {
    try {
      const newCheckin: Checkin = {
        id: Date.now(),
        studentId,
        timestamp: new Date().toISOString()
      };
      setCheckins(prev => [newCheckin, ...prev]);
      
      // Atualizar lastCheckin do aluno
      setStudents(prev =>
        prev.map(s =>
          s.id === studentId
            ? { ...s, lastCheckin: newCheckin.timestamp }
            : s
        )
      );
      
      console.log('✅ Check-in registrado');
    } catch (error) {
      console.error('❌ Erro ao registrar check-in:', error);
      throw error;
    }
  };

  const removeCheckin = async (id: number) => {
    try {
      setCheckins(prev => prev.filter(c => c.id !== id));
      console.log('✅ Check-in removido');
    } catch (error) {
      console.error('❌ Erro ao remover check-in:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
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
      }}
    >
      {children}
      
      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              padding: '12px 20px',
              borderRadius: 8,
              background: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#3b82f6',
              color: 'white',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              animation: 'slideIn 0.3s ease-out',
              minWidth: 300,
              maxWidth: 500
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};