// gymmanager/src/Admin/services/mockData.ts
import { Student, ClassSchedule, Payment, Checkin } from '../types';

export const generateMockData = () => {
  const firstNames = ['Ana', 'João', 'Maria', 'Pedro', 'Julia', 'Carlos', 'Fernanda', 'Ricardo', 'Camila', 'Bruno'];
  const lastNames = ['Silva', 'Santos', 'Costa', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Ferreira', 'Rodrigues', 'Almeida'];
  const plans = ['Mensal', 'Trimestral', 'Semestral', 'Anual'];
  
  // ✅ Status de pagamento agora usa os valores corretos
  const paymentStatuses: Array<'paid' | 'pending' | 'overdue'> = ['paid', 'pending', 'overdue'];
  
  const students: Student[] = [];
  for (let i = 1; i <= 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const joinDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    
    students.push({
      id: i,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      phone: `(11) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      cpf: `${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}`,
      birthDate: new Date(1980 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      joinDate: joinDate.toISOString().split('T')[0],
      plan: plans[Math.floor(Math.random() * plans.length)],
      monthlyFee: 80 + Math.floor(Math.random() * 120),
      status: Math.random() > 0.1 ? 'active' : 'inactive',
      paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)], // ✅ CORRIGIDO
      lastCheckin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: '',
      photo: null
    });
  }

  const classes: ClassSchedule[] = [
    { id: 1, name: 'Musculação', instructor: 'Carlos Mendes', dayOfWeek: 1, startTime: '06:00', endTime: '07:00', capacity: 30, enrolled: 25, description: 'Treino de força' },
    { id: 2, name: 'Yoga', instructor: 'Ana Paula', dayOfWeek: 1, startTime: '07:00', endTime: '08:00', capacity: 20, enrolled: 18, description: 'Relaxamento e flexibilidade' },
    { id: 3, name: 'Spinning', instructor: 'Ricardo Santos', dayOfWeek: 2, startTime: '06:00', endTime: '07:00', capacity: 25, enrolled: 22, description: 'Ciclismo indoor' },
    { id: 4, name: 'CrossFit', instructor: 'Bruno Silva', dayOfWeek: 3, startTime: '18:00', endTime: '19:00', capacity: 20, enrolled: 15, description: 'Treino funcional' },
    { id: 5, name: 'Pilates', instructor: 'Julia Costa', dayOfWeek: 4, startTime: '09:00', endTime: '10:00', capacity: 15, enrolled: 12, description: 'Fortalecimento e postura' },
  ];

  const payments: Payment[] = students.slice(0, 30).map((s, idx) => ({
    id: idx + 1,
    studentId: s.id,
    amount: s.monthlyFee,
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    method: ['Cartão', 'Dinheiro', 'PIX'][Math.floor(Math.random() * 3)],
    status: Math.random() > 0.2 ? 'paid' : 'pending',
    description: `Mensalidade - ${s.plan}`
  }));

  const checkins: Checkin[] = [];
  students.slice(0, 40).forEach((s) => {
    const count = Math.floor(Math.random() * 10) + 1;
    for (let i = 0; i < count; i++) {
      checkins.push({
        id: checkins.length + 1,
        studentId: s.id,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  });

  return { students, classes, payments, checkins };
};