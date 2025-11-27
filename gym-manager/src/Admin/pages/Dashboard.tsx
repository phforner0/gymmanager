/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';
import { Users, CheckCircle, DollarSign, Activity, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';

export const Dashboard: React.FC = () => {
  const { students, payments, checkins } = useApp();

  const stats = useMemo(() => {
    const activeStudents = students.filter(s => s.status === 'active').length;
    const monthlyRevenue = payments
      .filter(p => {
        const date = new Date(p.date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && 
               date.getFullYear() === now.getFullYear() && 
               p.status === 'paid';
      })
      .reduce((sum, p) => sum + p.amount, 0);

    const today = new Date().toDateString();
    const todayCheckins = checkins.filter(c => 
      new Date(c.timestamp).toDateString() === today
    ).length;

    const overdue = students.filter(s => s.paymentStatus === 'overdue').length;

    return {
      totalStudents: students.length,
      activeStudents,
      monthlyRevenue,
      todayCheckins,
      overdue
    };
  }, [students, payments, checkins]);

  const memberChartData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const count = students.filter(s => {
        const joinDate = new Date(s.joinDate);
        return joinDate <= monthEnd && s.status === 'active';
      }).length;
      months.push({
        month: date.toLocaleString('pt-BR', { month: 'short' }),
        members: count
      });
    }
    return months;
  }, [students]);

  const checkinChartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const count = checkins.filter(c => 
        new Date(c.timestamp).toDateString() === dateStr
      ).length;
      days.push({
        day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        count
      });
    }
    return days;
  }, [checkins]);

  const recentActivities = useMemo(() => {
    const activities: Array<{
      type: string;
      message: string;
      time: string;
      icon: any;
    }> = [];

    checkins.slice(-5).reverse().forEach(c => {
      const student = students.find(s => s.id === c.studentId);
      if (student) {
        activities.push({
          type: 'checkin',
          message: `${student.name} fez check-in`,
          time: new Date(c.timestamp).toLocaleString('pt-BR'),
          icon: CheckCircle
        });
      }
    });

    return activities;
  }, [checkins, students]);

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>Dashboard</h1>

      {stats.overdue > 0 && (
        <div className="alert alert-warning">
          <AlertCircle size={20} />
          <span>{stats.overdue} aluno(s) com pagamento em atraso</span>
        </div>
      )}

      <div className="grid grid-cols-4 mb-6">
        <div className="stat-card blue">
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
          <div className="stat-label">Total de Alunos</div>
          <div className="stat-value">{stats.totalStudents}</div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon green">
            <CheckCircle size={24} />
          </div>
          <div className="stat-label">Alunos Ativos</div>
          <div className="stat-value">{stats.activeStudents}</div>
          <div className="stat-change positive">
            {((stats.activeStudents / stats.totalStudents) * 100).toFixed(0)}% do total
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon purple">
            <DollarSign size={24} />
          </div>
          <div className="stat-label">Receita Mensal</div>
          <div className="stat-value">R$ {stats.monthlyRevenue.toFixed(2)}</div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon orange">
            <Activity size={24} />
          </div>
          <div className="stat-label">Check-ins Hoje</div>
          <div className="stat-value">{stats.todayCheckins}</div>
        </div>
      </div>

      <div className="grid grid-cols-2">
        <div className="card">
          <h3 className="card-title">Evolução de Membros</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={memberChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="members" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Check-ins Últimos 7 Dias</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={checkinChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Atividades Recentes</h3>
        {recentActivities.length === 0 ? (
          <div className="empty-state">
            <div className="empty-title">Nenhuma atividade recente</div>
          </div>
        ) : (
          <div>
            {recentActivities.map((activity, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '12px', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
                <activity.icon size={20} color="#10b981" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600' }}>{activity.message}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};