// gymmanager/src/Admin/services/mockData.ts
// Encontre a função generateMockData e corrija os valores de paymentStatus

import { Student, Payment, Checkin, ClassSchedule } from "../types";

export const generateMockData = () => {
  const students: Student[] = [];
  const payments: Payment[] = [];
  const checkins: Checkin[] = [];

  const names = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Julia', 'Bruno', 'Fernanda', 'Ricardo', 'Camila'];
  const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Costa', 'Pereira', 'Ferreira', 'Rodrigues', 'Almeida'];
  const plans = ['Mensal', 'Trimestral', 'Semestral', 'Anual'];
  
  // ✅ VALORES CORRETOS para paymentStatus (conforme banco)
  const paymentStatuses: Array<'paid' | 'pending' | 'overdue'> = ['paid', 'pending', 'overdue'];
  
  // ✅ VALORES CORRETOS para status
  const statuses: Array<'active' | 'inactive'> = ['active', 'inactive'];

  for (let i = 1; i <= 50; i++) {
    const name = `${names[Math.floor(Math.random() * names.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    const email = `${name.toLowerCase().replace(' ', '.')}@email.com`;
    const phone = `(11) ${90000 + Math.floor(Math.random() * 9999)}-${1000 + Math.floor(Math.random() * 8999)}`;
    const cpf = `${Math.floor(100 + Math.random() * 899)}.${Math.floor(100 + Math.random() * 899)}.${Math.floor(100 + Math.random() * 899)}-${Math.floor(10 + Math.random() * 89)}`;
    
    const student: Student = {
      id: i,
      name,
      email,
      phone,
      cpf,
      birthDate: `${1980 + Math.floor(Math.random() * 30)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      joinDate: `${2024 - Math.floor(Math.random() * 3)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      plan: plans[Math.floor(Math.random() * plans.length)],
      monthlyFee: 80 + Math.floor(Math.random() * 120),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      lastCheckin: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      notes: '',
      photo: null
    };
    
    students.push(student);
  }

  // Classes
  const classes: ClassSchedule[] = [
    { id: 1, name: 'Musculação', instructor: 'Carlos Mendes', dayOfWeek: 1, startTime: '06:00', endTime: '07:00', capacity: 20, enrolled: 15, description: 'Treino de força' },
    { id: 2, name: 'Yoga', instructor: 'Ana Paula', dayOfWeek: 1, startTime: '07:00', endTime: '08:00', capacity: 15, enrolled: 12, description: 'Alongamento e relaxamento' },
    { id: 3, name: 'Spinning', instructor: 'Ricardo Santos', dayOfWeek: 2, startTime: '06:00', endTime: '07:00', capacity: 25, enrolled: 20, description: 'Cardio intenso' },
    { id: 4, name: 'CrossFit', instructor: 'Bruno Silva', dayOfWeek: 3, startTime: '18:00', endTime: '19:00', capacity: 15, enrolled: 14, description: 'Treino funcional' },
    { id: 5, name: 'Pilates', instructor: 'Julia Costa', dayOfWeek: 4, startTime: '09:00', endTime: '10:00', capacity: 12, enrolled: 10, description: 'Fortalecimento e postura' }
  ];

  // Payments (apenas para primeiros 30 alunos)
  const methods = ['PIX', 'Cartão', 'Dinheiro'];
  
  // ✅ VALORES CORRETOS para payment.status (conforme banco)
  const paymentStatusOptions: Array<'paid' | 'pending' | 'overdue'> = ['paid', 'pending', 'overdue'];

  for (let i = 1; i <= 30; i++) {
    payments.push({
      id: i,
      studentId: i,
      amount: 80 + Math.floor(Math.random() * 120),
      date: `2025-${String(11 + Math.floor(Math.random() * 2)).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      method: methods[Math.floor(Math.random() * methods.length)],
      status: paymentStatusOptions[Math.floor(Math.random() * paymentStatusOptions.length)],
      description: 'Mensalidade'
    });
  }

  // Checkins (últimos 7 dias)
  let checkinId = 1;
  for (let day = 0; day < 7; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    
    const numCheckins = 5 + Math.floor(Math.random() * 15);
    for (let i = 0; i < numCheckins; i++) {
      const studentId = 1 + Math.floor(Math.random() * 50);
      const time = new Date(date);
      time.setHours(6 + Math.floor(Math.random() * 16), Math.floor(Math.random() * 60));
      
      checkins.push({
        id: checkinId++,
        studentId,
        timestamp: time.toISOString()
      });
    }
  }

  return { students, classes, payments, checkins };
};